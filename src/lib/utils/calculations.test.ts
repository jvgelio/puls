import { describe, expect, test } from "bun:test";
import { calculateTrainingLoad } from "./calculations";

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
    // Avg 50, Max 200. Reserve 140. IF = -10/140 = -0.07. IF^2 = 0.005. Load ~ 0.5 -> 1.
    // Should be a positive number close to 0
    const result = calculateTrainingLoad(3600, 50, 200);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(5);
  });

  // Edge cases that might fail with current implementation

  test("should handle maxHeartRate equal to 60", () => {
    // Current implementation: (70-60)/(60-60) = 10/0 = Infinity.
    // Desired: null or 0.
    const result = calculateTrainingLoad(3600, 70, 60);
    expect(result).toBeNull();
  });

  test("should handle maxHeartRate less than 60", () => {
     // Current implementation: (70-60)/(50-60) = 10/-10 = -1. IF^2 = 1. Load = 100.
     // Desired: null (invalid max HR).
     expect(calculateTrainingLoad(3600, 70, 50)).toBeNull();
  });
});
