import { describe, expect, it } from "bun:test";
import { calculateDifficulty } from "./calculations";

describe("calculateDifficulty", () => {
  it("should calculate difficulty for flat terrain", () => {
    // 0m gain over 10km
    expect(calculateDifficulty(0, 10000)).toBe(0);
  });

  it("should calculate difficulty for moderate terrain", () => {
    // 300m gain over 10km -> 300 / 10 = 30
    expect(calculateDifficulty(300, 10000)).toBe(30);
  });

  it("should calculate difficulty for hard terrain", () => {
    // 600m gain over 10km -> 600 / 10 = 60
    expect(calculateDifficulty(600, 10000)).toBe(60);
  });

  it("should handle rounding correctly", () => {
    // 155m gain over 10km -> 15.5 -> 16
    expect(calculateDifficulty(155, 10000)).toBe(16);
  });

  it("should return 0 for zero distance", () => {
    expect(calculateDifficulty(100, 0)).toBe(0);
  });

  it("should return 0 for negative distance", () => {
    expect(calculateDifficulty(100, -100)).toBe(0);
  });

  it("should handle short distances", () => {
    // 10m gain over 100m (0.1km) -> 10 / 0.1 = 100
    expect(calculateDifficulty(10, 100)).toBe(100);
  });

  it("should handle floating point inputs", () => {
    // 300.5m gain over 10000.5m -> ~30.048 -> 30
    expect(calculateDifficulty(300.5, 10000.5)).toBe(30);
  });
});
