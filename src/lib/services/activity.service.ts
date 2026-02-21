import { db } from "@/lib/db/client";
import { activities, aiFeedbacks, users } from "@/lib/db/schema";
import { createStravaClient } from "@/lib/strava/api";
import { generateFeedback } from "./ai.service";
import { eq, and, gte } from "drizzle-orm";
import type { StravaActivity, StravaStreamsResponse, StravaLap } from "@/lib/strava/types";

interface ActivityData {
  activity: StravaActivity;
  streams: StravaStreamsResponse | null;
  laps: StravaLap[] | null;
}

/**
 * Fetch complete activity data from Strava API
 */
async function fetchActivityData(
  activityId: number,
  accessToken: string
): Promise<ActivityData> {
  const strava = createStravaClient(accessToken);

  const activity = await strava.getActivity(activityId);

  let streams: StravaStreamsResponse | null = null;
  let laps: StravaLap[] | null = null;

  try {
    streams = await strava.getActivityStreams(activityId);
  } catch (error) {
    console.log(`Could not fetch streams for activity ${activityId}:`, error);
  }

  try {
    laps = await strava.getActivityLaps(activityId);
  } catch (error) {
    console.log(`Could not fetch laps for activity ${activityId}:`, error);
  }

  return { activity, streams, laps };
}

/**
 * Save activity to database with complete payload
 */
async function saveActivity(
  userId: string,
  data: ActivityData
): Promise<string> {
  const { activity, streams, laps } = data;

  const commonData = {
    name: activity.name,
    sportType: activity.sport_type,
    startDate: new Date(activity.start_date),
    distanceMeters: activity.distance.toString(),
    movingTimeSeconds: activity.moving_time,
    elapsedTimeSeconds: activity.elapsed_time,
    averageSpeed: activity.average_speed.toString(),
    maxSpeed: activity.max_speed.toString(),
    hasHeartrate: activity.has_heartrate,
    averageHeartrate: activity.average_heartrate?.toString(),
    maxHeartrate: activity.max_heartrate?.toString(),
    totalElevationGain: activity.total_elevation_gain.toString(),
    averageCadence: activity.average_cadence?.toString(),
    calories: activity.calories,
    rawPayload: activity,
    streamsPayload: streams,
    lapsPayload: laps,
    segmentsPayload: activity.segment_efforts,
  };

  // Check if activity already exists
  const existing = await db.query.activities.findFirst({
    where: eq(activities.stravaId, activity.id),
  });

  if (existing) {
    // Update existing activity
    await db
      .update(activities)
      .set({
        ...commonData,
        updatedAt: new Date(),
      })
      .where(eq(activities.id, existing.id));

    return existing.id;
  }

  // Insert new activity
  const [inserted] = await db
    .insert(activities)
    .values({
      userId,
      stravaId: activity.id,
      ...commonData,
    })
    .returning();

  return inserted.id;
}

/**
 * Process a new activity from webhook or import
 */
export async function processActivity(
  stravaActivityId: number,
  userId: string,
  accessToken: string,
  generateAIFeedback: boolean = true
): Promise<string> {
  console.log(`Processing activity ${stravaActivityId} for user ${userId}`);

  // Fetch complete activity data from Strava
  const data = await fetchActivityData(stravaActivityId, accessToken);

  // Verify ownership to prevent IDOR
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { stravaId: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (data.activity.athlete.id !== user.stravaId) {
    throw new Error("Activity ownership mismatch");
  }

  // Save to database
  const activityId = await saveActivity(userId, data);

  // Generate AI feedback if requested
  if (generateAIFeedback) {
    try {
      await generateFeedback(activityId, userId);
    } catch (error) {
      console.error(`Error generating feedback for activity ${activityId}:`, error);
    }
  }

  return activityId;
}

/**
 * Get activities for a user with pagination
 */
export async function getUserActivities(
  userId: string,
  options: { limit?: number; offset?: number } = {}
) {
  const { limit = 20, offset = 0 } = options;

  return db.query.activities.findMany({
    where: eq(activities.userId, userId),
    orderBy: (activities, { desc }) => [desc(activities.startDate)],
    limit,
    offset,
    with: {
      feedback: true,
    },
  });
}

/**
 * Get a single activity with feedback
 */
export async function getActivityWithFeedback(activityId: string, userId: string) {
  return db.query.activities.findFirst({
    where: and(eq(activities.id, activityId), eq(activities.userId, userId)),
    with: {
      feedback: true,
    },
  });
}

/**
 * Get weekly stats for a user
 */
export async function getWeeklyStats(userId: string) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const weekActivities = await db.query.activities.findMany({
    where: and(
      eq(activities.userId, userId),
      gte(activities.startDate, startOfWeek)
    ),
  });

  // Filter activities from this week
  const thisWeekActivities = weekActivities;

  const totalDistance = thisWeekActivities.reduce(
    (sum, a) => sum + (parseFloat(a.distanceMeters || "0") || 0),
    0
  );
  const totalTime = thisWeekActivities.reduce(
    (sum, a) => sum + (a.movingTimeSeconds || 0),
    0
  );
  const totalActivities = thisWeekActivities.length;
  const totalCalories = thisWeekActivities.reduce(
    (sum, a) => sum + (a.calories || 0),
    0
  );

  return {
    totalDistance,
    totalTime,
    totalActivities,
    totalCalories,
  };
}

/**
 * Get monthly stats for a user
 */
export async function getMonthlyStats(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthActivities = await db.query.activities.findMany({
    where: and(
      eq(activities.userId, userId),
      gte(activities.startDate, startOfMonth)
    ),
  });

  const totalDistance = monthActivities.reduce(
    (sum, a) => sum + (parseFloat(a.distanceMeters || "0") || 0),
    0
  );
  const totalTime = monthActivities.reduce(
    (sum, a) => sum + (a.movingTimeSeconds || 0),
    0
  );
  const totalActivities = monthActivities.length;
  const totalElevation = monthActivities.reduce(
    (sum, a) => sum + (parseFloat(a.totalElevationGain || "0") || 0),
    0
  );

  return {
    totalDistance,
    totalTime,
    totalActivities,
    totalElevation,
  };
}
