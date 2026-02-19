import { expect, test, describe } from "bun:test";
import { hasNegativeSplit } from "./calculations";
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
    // First half pace: 300s/km
    // Second half pace: 290s/km
    // Second half is faster -> negative split
    expect(hasNegativeSplit(splits)).toBe(true);
  });

  test("should return false for positive split (first half faster)", () => {
    const splits = [
        createSplit(1000, 290), // 2:54/km
        createSplit(1000, 290), // 2:54/km
        createSplit(1000, 300), // 3:00/km
        createSplit(1000, 300), // 3:00/km
    ];
    // First half pace: 290s/km
    // Second half pace: 300s/km
    // Second half is slower -> positive split
    expect(hasNegativeSplit(splits)).toBe(false);
  });

  test("should handle odd number of splits (middle split goes to second half)", () => {
    // 5 splits. midpoint = floor(2.5) = 2.
    // firstHalf = splits[0..2] (0, 1) -> 2 splits
    // secondHalf = splits[2..5] (2, 3, 4) -> 3 splits

    const splits = [
        createSplit(1000, 300), // 0: 3:00
        createSplit(1000, 300), // 1: 3:00
        createSplit(1000, 200), // 2: 2:00 (very fast)
        createSplit(1000, 300), // 3: 3:00
        createSplit(1000, 300), // 4: 3:00
    ];

    // First half: 600s / 2000m = 0.3 s/m = 300 s/km
    // Second half: (200+300+300) = 800s / 3000m = 0.266 s/m = 266 s/km
    // Second half is faster.

    expect(hasNegativeSplit(splits)).toBe(true);
  });

  test("should handle zero distance splits gracefully", () => {
       const splits = [
        createSplit(0, 300),
        createSplit(0, 300),
    ];
    // pace is 0 for both halves
    expect(hasNegativeSplit(splits)).toBe(false);
  })
});
