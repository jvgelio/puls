import type { Activity } from "@/lib/db/schema";
import type { StravaSplit } from "@/lib/strava/types";

/**
 * Calculate if the activity had a negative split
 * (second half faster than first half)
 */
export function hasNegativeSplit(splits: StravaSplit[]): boolean {
  if (!splits || splits.length < 2) return false;

  const midpoint = Math.floor(splits.length / 2);
  const firstHalf = splits.slice(0, midpoint);
  const secondHalf = splits.slice(midpoint);

  const firstHalfPace = calculateAveragePace(firstHalf);
  const secondHalfPace = calculateAveragePace(secondHalf);

  // Lower pace = faster
  return secondHalfPace < firstHalfPace;
}

/**
 * Calculate average pace from splits
 */
function calculateAveragePace(splits: StravaSplit[]): number {
  if (splits.length === 0) return 0;

  const totalTime = splits.reduce((sum, s) => sum + s.moving_time, 0);
  const totalDistance = splits.reduce((sum, s) => sum + s.distance, 0);

  return totalDistance > 0 ? totalTime / (totalDistance / 1000) : 0;
}

/**
 * Calculate cardiac drift (HR increase during steady effort)
 * Returns percentage increase
 */
export function calculateCardiacDrift(
  heartRateData: number[],
  timeData: number[]
): number | null {
  if (!heartRateData || heartRateData.length < 10) return null;

  // Get first and last 20% of data
  const sampleSize = Math.floor(heartRateData.length * 0.2);
  const firstSegment = heartRateData.slice(0, sampleSize);
  const lastSegment = heartRateData.slice(-sampleSize);

  const avgFirst =
    firstSegment.reduce((a, b) => a + b, 0) / firstSegment.length;
  const avgLast = lastSegment.reduce((a, b) => a + b, 0) / lastSegment.length;

  if (avgFirst === 0) return null;

  return ((avgLast - avgFirst) / avgFirst) * 100;
}

/**
 * Calculate difficulty score based on elevation and distance
 */
export function calculateDifficulty(
  elevationGain: number,
  distanceMeters: number
): number {
  if (distanceMeters <= 0) return 0;

  const distanceKm = distanceMeters / 1000;
  // Elevation per km
  const gradient = elevationGain / distanceKm;

  // Scale: 0-20 easy, 20-40 moderate, 40-60 hard, 60+ very hard
  return Math.round(gradient);
}

/**
 * Get difficulty label
 */
export function getDifficultyLabel(score: number): string {
  if (score < 20) return "Fácil";
  if (score < 40) return "Moderado";
  if (score < 60) return "Difícil";
  return "Muito Difícil";
}

/**
 * Calculate training load (simplified TSS-like metric)
 */
export function calculateTrainingLoad(
  durationSeconds: number,
  averageHeartRate: number | null,
  maxHeartRate: number | null
): number | null {
  if (!averageHeartRate || !maxHeartRate) return null;

  // Ensure maxHeartRate is reasonable (> 60) to avoid division by zero or negative reserve
  if (maxHeartRate <= 60) return null;

  // Simplified intensity factor based on HR
  const hrReserve = maxHeartRate - 60; // Assuming 60 bpm rest HR
  const intensityFactor = (averageHeartRate - 60) / hrReserve;

  // TSS-like calculation
  const hours = durationSeconds / 3600;
  return Math.round(hours * intensityFactor * intensityFactor * 100);
}

/**
 * Calculate efficiency (pace vs heart rate)
 */
export function calculateEfficiency(
  paceSecondsPerKm: number,
  averageHeartRate: number
): number | null {
  if (!averageHeartRate || paceSecondsPerKm <= 0) return null;

  // Higher efficiency = faster pace at lower HR
  return Math.round((1000 / paceSecondsPerKm) * (180 / averageHeartRate) * 100);
}

/**
 * Analyze splits for consistency
 * Returns standard deviation as percentage of average
 */
export function analyzeSplitConsistency(splits: StravaSplit[]): number {
  if (!splits || splits.length < 2) return 0;

  const paces = splits
    .map((s) =>
      s.distance > 0 ? s.moving_time / (s.distance / 1000) : null
    )
    .filter((p): p is number => p !== null);

  if (paces.length < 2) return 0;

  const avg = paces.reduce((a, b) => a + b, 0) / paces.length;
  const variance =
    paces.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / paces.length;
  const stdDev = Math.sqrt(variance);

  // Return as percentage of average
  return avg > 0 ? (stdDev / avg) * 100 : 0;
}

/**
 * Get consistency label
 */
export function getConsistencyLabel(variationPercent: number): string {
  if (variationPercent < 3) return "Muito Consistente";
  if (variationPercent < 5) return "Consistente";
  if (variationPercent < 10) return "Moderado";
  return "Variável";
}

/**
 * Calculate weekly totals from activities
 */
export function calculateWeeklyTotals(activities: Activity[]) {
  return {
    totalDistance: activities.reduce(
      (sum, a) => sum + (parseFloat(a.distanceMeters || "0") || 0),
      0
    ),
    totalTime: activities.reduce(
      (sum, a) => sum + (a.movingTimeSeconds || 0),
      0
    ),
    totalElevation: activities.reduce(
      (sum, a) => sum + (parseFloat(a.totalElevationGain || "0") || 0),
      0
    ),
    totalCalories: activities.reduce(
      (sum, a) => sum + (a.calories || 0),
      0
    ),
    activityCount: activities.length,
  };
}
