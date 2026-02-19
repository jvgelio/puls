import { expect, test, describe } from "bun:test";
import { formatDurationHuman } from "./formatters";

describe("formatDurationHuman", () => {
  test("returns 0min for 0 seconds", () => {
    expect(formatDurationHuman(0)).toBe("0min");
  });

  test("returns 0min for sub-minute durations", () => {
    expect(formatDurationHuman(30)).toBe("0min");
    expect(formatDurationHuman(59)).toBe("0min");
  });

  test("returns 1min for exact minute", () => {
    expect(formatDurationHuman(60)).toBe("1min");
  });

  test("returns 1min for mixed seconds", () => {
    expect(formatDurationHuman(90)).toBe("1min");
  });

  test("returns 59min just below an hour", () => {
    expect(formatDurationHuman(3599)).toBe("59min");
  });

  test("returns 1h 0min for exact hour", () => {
    expect(formatDurationHuman(3600)).toBe("1h 0min");
  });

  test("returns 1h 1min for hour and minute", () => {
    expect(formatDurationHuman(3660)).toBe("1h 1min");
  });

  test("returns 2h 0min for multiple hours", () => {
    expect(formatDurationHuman(7200)).toBe("2h 0min");
  });

  test("returns 24h 0min for a large duration", () => {
    expect(formatDurationHuman(86400)).toBe("24h 0min");
  });
});
