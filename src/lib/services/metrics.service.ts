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
    columns: {
      id: true,
      startDate: true,
      movingTimeSeconds: true,
      distanceMeters: true,
      averageHeartrate: true,
      totalElevationGain: true,
      streamsPayload: true,
    }
  });

  // Group by day
  const dailyLoad: Record<string, number> = {};

  for (const activity of allActivities) {
    if (!activity.startDate || new Date(activity.startDate) < startDate) continue;

    const dateKey = new Date(activity.startDate).toISOString().split("T")[0];

    // First try to calculate an authentic TRIMP based on real heartrate zones
    let load = calculateTRIMP(activity);

    // If streams are unavailable, fallback to simple estimation
    if (load === null) {
      //@ts-ignore - internal loose type
      load = calculateSimpleLoad(activity);
    }

    dailyLoad[dateKey] = (dailyLoad[dateKey] || 0) + load;
  }

  // Ensure today is in the record if we want current metrics
  const todayKey = new Date().toISOString().split("T")[0];
  if (!dailyLoad[todayKey]) {
    dailyLoad[todayKey] = 0;
  }

  return dailyLoad;
}

/**
 * Calculate authentic TRIMP (Training Impulse) using Banister's formula and real HR streams
 * TRIMP = duration(min) * HRR * 0.64 * e^(1.92 * HRR)
 */
export function calculateTRIMP(activity: any): number | null {
  const streams = activity.streamsPayload as { type: string; data: any[] }[] | null;
  if (!streams || !Array.isArray(streams)) return null;

  const hrStream = streams.find(s => s.type === 'heartrate' && Array.isArray(s.data));
  const timeStream = streams.find(s => s.type === 'time' && Array.isArray(s.data));

  if (!hrStream || !timeStream || hrStream.data.length === 0 || hrStream.data.length !== timeStream.data.length) {
    return null;
  }

  // Static HR zones for now (Future: pull from user settings)
  const hrRest = 60;
  const hrMax = 190;

  let totalTrimp = 0;

  for (let i = 1; i < hrStream.data.length; i++) {
    const hr = hrStream.data[i];
    const dt = timeStream.data[i] - timeStream.data[i - 1]; // duration in seconds

    // Process only if HR is above rest and gaps between points are reasonable (< 5 mins)
    if (hr > hrRest && dt > 0 && dt < 300) {
      const hrReserve = (hr - hrRest) / (hrMax - hrRest);
      const durationMin = dt / 60;

      const trimp = durationMin * hrReserve * 0.64 * Math.exp(1.92 * hrReserve);
      totalTrimp += trimp;
    }
  }

  return totalTrimp > 0 ? Math.round(totalTrimp) : null;
}

/**
 * Calculate a simple training load score as fallback
 */
export function calculateSimpleLoad(activity: Activity): number {
  let seconds = activity.movingTimeSeconds || 0;
  if (seconds > 500000) {
    seconds = seconds / 1000;
  }
  const duration = seconds / 3600; // hours
  const distance = parseFloat(activity.distanceMeters || "0") / 1000; // km
  let elevation = parseFloat(activity.totalElevationGain || "0");
  if (elevation > 10000) {
    elevation = elevation / 100; // just in case elevation is cm
  }

  // To keep simple load functionally parity with TRIMP, we scale it slightly to match new TRIMP expectations (closer to 100 TSS/hr)
  const intensityFactor = activity.averageHeartrate
    ? parseFloat(activity.averageHeartrate) / 140
    : 1;

  let load = Math.round(duration * intensityFactor * 80 + elevation * 0.1);
  return Math.min(Math.max(load, 0), 500);
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

/**
 * Calculate Fitness (CTL), Fatigue (ATL) and Form (TSB)
 */
export function calculateFitnessFatigue(
  dailyLoad: Record<string, number>
): Record<string, { ctl: number; atl: number; tsb: number; load: number }> {
  const result: Record<string, { ctl: number; atl: number; tsb: number; load: number }> = {};
  const dates = Object.keys(dailyLoad).sort();
  if (dates.length === 0) return result;

  const minDate = new Date(dates[0]);
  const maxDate = new Date(); // Always calculate up to today
  maxDate.setHours(0, 0, 0, 0);

  let ctlYesterday = 0;
  let atlYesterday = 0;

  for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const load = dailyLoad[dateStr] || 0;

    const ctlToday = ctlYesterday + (load - ctlYesterday) / 42;
    const atlToday = atlYesterday + (load - atlYesterday) / 7;
    const tsbToday = ctlYesterday - atlYesterday;

    result[dateStr] = {
      load,
      ctl: ctlToday,
      atl: atlToday,
      tsb: tsbToday
    };

    ctlYesterday = ctlToday;
    atlYesterday = atlToday;
  }

  return result;
}

/**
 * Get daily load and count for heatmap (e.g. 180 days)
 */
export async function getHeatmapData(userId: string, days: number = 180) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const allActivities = await db.query.activities.findMany({
    where: eq(activities.userId, userId),
    orderBy: [desc(activities.startDate)],
    columns: {
      id: true,
      startDate: true,
      movingTimeSeconds: true,
      distanceMeters: true,
      averageHeartrate: true,
      totalElevationGain: true,
      streamsPayload: true,
    }
  });

  const dailyStats: Record<string, { date: Date, load: number, count: number }> = {};

  for (const activity of allActivities) {
    if (!activity.startDate || new Date(activity.startDate) < startDate) continue;

    const dateKey = new Date(activity.startDate).toISOString().split("T")[0];

    let load = calculateTRIMP(activity);
    if (load === null) {
      //@ts-ignore
      load = calculateSimpleLoad(activity);
    }

    if (!dailyStats[dateKey]) {
      const dateNoTime = new Date(activity.startDate);
      dateNoTime.setHours(0, 0, 0, 0);
      dailyStats[dateKey] = { date: dateNoTime, load: 0, count: 0 };
    }

    dailyStats[dateKey].load += load;
    dailyStats[dateKey].count += 1;
  }

  return Object.values(dailyStats).sort((a, b) => a.date.getTime() - b.date.getTime());
}
