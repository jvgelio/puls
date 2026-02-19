import { expect, test, describe } from "bun:test";
import { calculateCardiacDrift } from "./calculations";

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
