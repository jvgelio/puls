import { db } from "@/lib/db/client";
import { activities } from "@/lib/db/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import type { Activity } from "@/lib/db/schema";

/**
 * Get weekly aggregated stats
 */
export async function getWeeklyAggregates(userId: string, weeks: number = 4) {
  const results = [];
  const now = new Date();

  for (let i = 0; i < weeks; i++) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() - i * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekActivities = await db.query.activities.findMany({
      where: eq(activities.userId, userId),
    });

    // Filter by date
    const filtered = weekActivities.filter((a) => {
      if (!a.startDate) return false;
      const date = new Date(a.startDate);
      return date >= weekStart && date <= weekEnd;
    });

    const totalDistance = filtered.reduce(
      (sum, a) => sum + (parseFloat(a.distanceMeters || "0") || 0),
      0
    );
    const totalTime = filtered.reduce(
      (sum, a) => sum + (a.movingTimeSeconds || 0),
      0
    );
    const totalElevation = filtered.reduce(
      (sum, a) => sum + (parseFloat(a.totalElevationGain || "0") || 0),
      0
    );

    results.push({
      weekStart,
      weekEnd,
      totalDistance,
      totalTime,
      totalElevation,
      activityCount: filtered.length,
    });
  }

  return results;
}

/**
 * Get sport type distribution
 */
export async function getSportTypeDistribution(userId: string) {
  const allActivities = await db.query.activities.findMany({
    where: eq(activities.userId, userId),
  });

  const distribution: Record<string, number> = {};

  for (const activity of allActivities) {
    const type = activity.sportType || "Other";
    distribution[type] = (distribution[type] || 0) + 1;
  }

  return distribution;
}

/**
 * Get personal records
 */
export async function getPersonalRecords(userId: string) {
  const allActivities = await db.query.activities.findMany({
    where: eq(activities.userId, userId),
  });

  // Filter running activities
  const runningActivities = allActivities.filter((a) =>
    a.sportType?.toLowerCase().includes("run")
  );

  // Calculate fastest paces for various distances
  const records: Record<string, { pace: number; date: Date; activityId: string } | null> = {
    "1km": null,
    "5km": null,
    "10km": null,
    "halfMarathon": null,
    "marathon": null,
  };

  for (const activity of runningActivities) {
    const distanceKm = parseFloat(activity.distanceMeters || "0") / 1000;
    const time = activity.movingTimeSeconds || 0;

    if (time <= 0 || distanceKm <= 0) continue;

    const pacePerKm = time / distanceKm;

    // Check each distance threshold
    if (distanceKm >= 1) {
      if (!records["1km"] || pacePerKm < records["1km"].pace) {
        records["1km"] = {
          pace: pacePerKm,
          date: activity.startDate!,
          activityId: activity.id,
        };
      }
    }

    if (distanceKm >= 5) {
      if (!records["5km"] || pacePerKm < records["5km"].pace) {
        records["5km"] = {
          pace: pacePerKm,
          date: activity.startDate!,
          activityId: activity.id,
        };
      }
    }

    if (distanceKm >= 10) {
      if (!records["10km"] || pacePerKm < records["10km"].pace) {
        records["10km"] = {
          pace: pacePerKm,
          date: activity.startDate!,
          activityId: activity.id,
        };
      }
    }

    if (distanceKm >= 21.0975) {
      if (!records["halfMarathon"] || pacePerKm < records["halfMarathon"].pace) {
        records["halfMarathon"] = {
          pace: pacePerKm,
          date: activity.startDate!,
          activityId: activity.id,
        };
      }
    }

    if (distanceKm >= 42.195) {
      if (!records["marathon"] || pacePerKm < records["marathon"].pace) {
        records["marathon"] = {
          pace: pacePerKm,
          date: activity.startDate!,
          activityId: activity.id,
        };
      }
    }
  }

  return records;
}

/**
 * Get training load trend
 */
export async function getTrainingLoadTrend(userId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const allActivities = await db.query.activities.findMany({
    where: eq(activities.userId, userId),
    orderBy: [desc(activities.startDate)],
  });

  // Group by day
  const dailyLoad: Record<string, number> = {};

  for (const activity of allActivities) {
    if (!activity.startDate || new Date(activity.startDate) < startDate) continue;

    const dateKey = new Date(activity.startDate).toISOString().split("T")[0];
    const load = calculateSimpleLoad(activity);

    dailyLoad[dateKey] = (dailyLoad[dateKey] || 0) + load;
  }

  return dailyLoad;
}

/**
 * Calculate a simple training load score
 */
function calculateSimpleLoad(activity: Activity): number {
  const duration = (activity.movingTimeSeconds || 0) / 3600; // hours
  const distance = parseFloat(activity.distanceMeters || "0") / 1000; // km
  const elevation = parseFloat(activity.totalElevationGain || "0");

  // Simple formula: duration * intensity factor
  const intensityFactor = activity.averageHeartrate
    ? parseFloat(activity.averageHeartrate) / 140
    : 1;

  return Math.round(duration * intensityFactor * 50 + elevation * 0.1);
}

/**
 * Calculate dynamic bounds for rolling average
 */
export function calculateRollingBounds(
  dailyLoad: Record<string, number>,
  windowDays: number = 28
): Record<string, { upper: number; lower: number; avg: number }> {
  const result: Record<string, { upper: number; lower: number; avg: number }> = {};
  const dates = Object.keys(dailyLoad).sort();
  if (dates.length === 0) return result;

  const minDate = new Date(dates[0]);
  const maxDate = new Date(dates[dates.length - 1]);

  const currentWindow: number[] = [];

  for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const load = dailyLoad[dateStr] || 0;

    currentWindow.push(load);
    if (currentWindow.length > windowDays) {
      currentWindow.shift();
    }

    const sum = currentWindow.reduce((a, b) => a + b, 0);
    const avg = currentWindow.length > 0 ? sum / currentWindow.length : 0;

    result[dateStr] = {
      upper: avg * 1.3,
      lower: avg * 0.7,
      avg: avg
    };
  }
  return result;
}
