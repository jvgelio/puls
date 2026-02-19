import { db } from "@/lib/db/client";
import { users, activities } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createStravaClient } from "@/lib/strava/api";
import { processActivity } from "./activity.service";

const IMPORT_DELAY_MS = 5000; // 5 seconds between requests (Strava rate limit: 200 req/15min)
const IMPORT_DAYS = 60; // Import last 2 months

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface ImportProgress {
  total: number;
  processed: number;
  status: "pending" | "in_progress" | "completed" | "error";
  error?: string;
}

// In-memory progress tracking (could be replaced with Redis or database)
const importProgress = new Map<string, ImportProgress>();

/**
 * Get import progress for a user
 */
export function getImportProgress(userId: string): ImportProgress | null {
  return importProgress.get(userId) || null;
}

/**
 * Check if user needs historical import (first login)
 */
export async function needsHistoricalImport(userId: string): Promise<boolean> {
  const existingActivities = await db.query.activities.findFirst({
    where: eq(activities.userId, userId),
  });

  return !existingActivities;
}

/**
 * Import historical activities from Strava (last 2 months)
 */
export async function importHistoricalActivities(
  userId: string,
  accessToken: string
): Promise<void> {
  console.log(`Starting historical import for user ${userId}`);

  const strava = createStravaClient(accessToken);
  const now = Math.floor(Date.now() / 1000);
  const after = now - IMPORT_DAYS * 24 * 60 * 60;

  // Initialize progress
  importProgress.set(userId, {
    total: 0,
    processed: 0,
    status: "in_progress",
  });

  try {
    // Fetch all activities from the period (paginated)
    const allActivities = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const batch = await strava.getActivities({
        after,
        page,
        per_page: perPage,
      });

      if (batch.length === 0) break;

      allActivities.push(...batch);
      page++;

      if (batch.length < perPage) break;

      // Small delay between list requests
      await delay(1000);
    }

    console.log(`Found ${allActivities.length} activities to import for user ${userId}`);

    // Update progress with total
    importProgress.set(userId, {
      total: allActivities.length,
      processed: 0,
      status: "in_progress",
    });

    // Process each activity
    for (let i = 0; i < allActivities.length; i++) {
      const activity = allActivities[i];

      // Check if activity already exists
      const existing = await db.query.activities.findFirst({
        where: eq(activities.stravaId, activity.id),
      });

      if (!existing) {
        try {
          await processActivity(activity.id, userId, accessToken, true);
        } catch (error) {
          console.error(`Error processing activity ${activity.id}:`, error);
        }
      }

      // Update progress
      importProgress.set(userId, {
        total: allActivities.length,
        processed: i + 1,
        status: "in_progress",
      });

      // Rate limiting delay
      if (i < allActivities.length - 1) {
        await delay(IMPORT_DELAY_MS);
      }
    }

    // Mark as completed
    importProgress.set(userId, {
      total: allActivities.length,
      processed: allActivities.length,
      status: "completed",
    });

    console.log(`Completed import for user ${userId}: ${allActivities.length} activities`);
  } catch (error) {
    console.error(`Import error for user ${userId}:`, error);
    const currentProgress = importProgress.get(userId);
    importProgress.set(userId, {
      total: currentProgress?.total || 0,
      processed: currentProgress?.processed || 0,
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}

/**
 * Start import in background (non-blocking)
 */
export function startBackgroundImport(
  userId: string,
  accessToken: string
): void {
  importHistoricalActivities(userId, accessToken).catch((error) => {
    console.error(`Background import failed for user ${userId}:`, error);
  });
}
