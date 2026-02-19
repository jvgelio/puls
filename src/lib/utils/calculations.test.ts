import { describe, expect, test } from "bun:test";
import { calculateTrainingLoad, hasNegativeSplit, calculateCardiacDrift } from "./calculations";
import type { StravaSplit } from "@/lib/strava/types";

// Helper to create a mock split
function createSplit(distance: number, moving_time: number): StravaSplit {
  return {
    distance,
    moving_time,
    elapsed_time: moving_time,
    elevation_difference: 0,
    split: 1,
    average_speed: distance > 0 ? distance / moving_time : 0,
  };
}

describe("calculateTrainingLoad", () => {
  test("should return correct training load for valid inputs", () => {
    // Example: 1 hour, avg HR 150, max HR 200
    // HR Reserve = 200 - 60 = 140
    // Intensity Factor = (150 - 60) / 140 = 90 / 140 = 0.642857
    // TSS = 1 (hour) * 0.642857^2 * 100 = 1 * 0.413265 * 100 = 41.3265
    // Rounded: 41
    const result = calculateTrainingLoad(3600, 150, 200);
    expect(result).toBe(41);
  });

  test("should return null if averageHeartRate is missing", () => {
    expect(calculateTrainingLoad(3600, null, 200)).toBeNull();
  });

  test("should return null if maxHeartRate is missing", () => {
    expect(calculateTrainingLoad(3600, 150, null)).toBeNull();
  });

  test("should return 0 if duration is 0", () => {
    expect(calculateTrainingLoad(0, 150, 200)).toBe(0);
  });

  test("should handle averageHeartRate less than 60", () => {
    const result = calculateTrainingLoad(3600, 50, 200);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(5);
  });

  test("should handle maxHeartRate equal to 60", () => {
    const result = calculateTrainingLoad(3600, 70, 60);
    expect(result).toBeNull();
  });

  test("should handle maxHeartRate less than 60", () => {
    expect(calculateTrainingLoad(3600, 70, 50)).toBeNull();
  });
});

describe("hasNegativeSplit", () => {
  test("should return false for empty or insufficient splits", () => {
    expect(hasNegativeSplit([])).toBe(false);
    expect(hasNegativeSplit([createSplit(1000, 300)])).toBe(false);
  });

  test("should return true for negative split (second half faster)", () => {
    const splits = [
      createSplit(1000, 300), // 3:00/km
      createSplit(1000, 300), // 3:00/km
      createSplit(1000, 290), // 2:54/km
      createSplit(1000, 290), // 2:54/km
    ];
    expect(hasNegativeSplit(splits)).toBe(true);
  });

  test("should return false for positive split (first half faster)", () => {
    const splits = [
      createSplit(1000, 290), // 2:54/km
      createSplit(1000, 290), // 2:54/km
      createSplit(1000, 300), // 3:00/km
      createSplit(1000, 300), // 3:00/km
    ];
    expect(hasNegativeSplit(splits)).toBe(false);
  });

  test("should handle odd number of splits (middle split goes to second half)", () => {
    const splits = [
      createSplit(1000, 300), // 0: 3:00
      createSplit(1000, 300), // 1: 3:00
      createSplit(1000, 200), // 2: 2:00 (very fast)
      createSplit(1000, 300), // 3: 3:00
      createSplit(1000, 300), // 4: 3:00
    ];
    expect(hasNegativeSplit(splits)).toBe(true);
  });

  test("should handle zero distance splits gracefully", () => {
    const splits = [
      createSplit(0, 300),
      createSplit(0, 300),
    ];
    expect(hasNegativeSplit(splits)).toBe(false);
  });
});

describe("calculateCardiacDrift", () => {
  test("should return null for insufficient data", () => {
    const hrData = [140, 141, 142];
    expect(calculateCardiacDrift(hrData)).toBeNull();
  });

  test("should calculate cardiac drift correctly", () => {
    // 10 data points. 20% is 2 points.
    // First segment: [140, 140] -> avg 140
    // Last segment: [154, 154] -> avg 154
    // Drift: (154 - 140) / 140 = 14 / 140 = 0.1 = 10%
    const hrData = [140, 140, 145, 145, 150, 150, 152, 152, 154, 154];
    expect(calculateCardiacDrift(hrData)).toBe(10);
  });

  test("should return null if first segment average is 0", () => {
    // 10 data points
    // First segment: [0, 0] -> avg 0
    // Last segment: [154, 154] -> avg 154
    const hrData = [0, 0, 145, 145, 150, 150, 152, 152, 154, 154];
    expect(calculateCardiacDrift(hrData)).toBeNull();
  });
});
