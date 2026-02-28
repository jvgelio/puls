import { task } from "@trigger.dev/sdk";
import { processActivity } from "@/lib/services/activity.service";
import { sendTelegramNotification } from "./send-telegram-notification.js";
import { db } from "@/lib/db/client";
import { oauthTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { refreshAccessToken, isTokenExpired } from "@/lib/strava/auth";

export const processStravaActivity = task({
  id: "process-strava-activity",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 5000,
    maxTimeoutInMs: 30_000,
  },
  run: async (payload: {
    stravaActivityId: number;
    userId: string;
  }) => {
    const { stravaActivityId, userId } = payload;

    console.log(`Processing Strava activity ${stravaActivityId} for user ${userId}`);

    // 1. Fetch token from DB and refresh if expired
    const token = await db.query.oauthTokens.findFirst({
      where: eq(oauthTokens.userId, userId),
    });

    if (!token) throw new Error(`No OAuth token found for user ${userId}`);

    let accessToken = token.accessToken;

    if (isTokenExpired(token.expiresAt)) {
      console.log(`Token expired for user ${userId}, refreshing...`);
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

      console.log(`Token refreshed for user ${userId}`);
    }

    // 2. Fetch from Strava, save to DB, and generate AI feedback
    const activityId = await processActivity(stravaActivityId, userId, accessToken);

    console.log(`Activity processed: ${activityId}. Sending Telegram notification...`);

    // 3. Send Telegram notification with the AI feedback
    const result = await sendTelegramNotification.triggerAndWait({ activityId, userId });

    if (!result.ok) {
      console.error("Telegram notification failed:", result.error);
    } else {
      console.log("Telegram notification result:", result.output);
    }

    return { activityId, notified: result.ok };
  },
});
