import { task } from "@trigger.dev/sdk";
import { db } from "@/lib/db/client";
import { oauthTokens, activities } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { refreshAccessToken, isTokenExpired } from "@/lib/strava/auth";
import { createStravaClient } from "@/lib/strava/api";
import { processActivity } from "@/lib/services/activity.service";

const DELAY_MS = 3000; // Strava rate limit: 200 req/15min

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retroactively fetches and saves Strava activities that were missed by the webhook.
 * Trigger manually from the Trigger.dev dashboard with:
 *   { "userId": "<uuid>", "afterDate": "2026-02-21" }
 */
export const backfillMissingActivities = task({
  id: "backfill-missing-activities",
  maxDuration: 600, // 10 minutes
  run: async (payload: {
    userId: string;
    /** ISO date string, e.g. "2026-02-21". Defaults to 7 days ago. */
    afterDate?: string;
  }) => {
    const { userId, afterDate } = payload;

    const cutoff = afterDate
      ? new Date(afterDate)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const afterUnix = Math.floor(cutoff.getTime() / 1000);

    console.log(`Backfilling activities for user ${userId} after ${cutoff.toISOString()}`);

    // 1. Get token from DB, refresh if expired
    const token = await db.query.oauthTokens.findFirst({
      where: eq(oauthTokens.userId, userId),
    });

    if (!token) throw new Error(`No OAuth token found for user ${userId}`);

    let accessToken = token.accessToken;

    if (isTokenExpired(token.expiresAt)) {
      console.log(`Token expired, refreshing...`);
      const refreshed = await refreshAccessToken(token.refreshToken);
      accessToken = refreshed.access_token;

      await db
        .update(oauthTokens)
        .set({
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token,
          expiresAt: new Date(refreshed.expires_at * 1000),
          updatedAt: new Date(),
        })
        .where(eq(oauthTokens.userId, userId));
    }

    // 2. List activities from Strava
    const strava = createStravaClient(accessToken);
    const stravaActivities = [];
    let page = 1;

    while (true) {
      const batch = await strava.getActivities({ after: afterUnix, page, per_page: 100 });
      if (batch.length === 0) break;
      stravaActivities.push(...batch);
      page++;
      if (batch.length < 100) break;
      await delay(1000);
    }

    console.log(`Found ${stravaActivities.length} Strava activities`);

    // 3. Process only the ones missing from DB
    let processed = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < stravaActivities.length; i++) {
      const stravaActivity = stravaActivities[i];

      const existing = await db.query.activities.findFirst({
        where: eq(activities.stravaId, stravaActivity.id),
      });

      if (existing) {
        skipped++;
        continue;
      }

      try {
        await processActivity(stravaActivity.id, userId, accessToken, true);
        processed++;
        console.log(`Processed ${stravaActivity.id} (${processed} new)`);
      } catch (error) {
        failed++;
        console.error(`Failed to process ${stravaActivity.id}:`, error);
      }

      if (i < stravaActivities.length - 1) {
        await delay(DELAY_MS);
      }
    }

    console.log(`Done: ${processed} new, ${skipped} skipped, ${failed} failed`);
    return { total: stravaActivities.length, processed, skipped, failed };
  },
});
