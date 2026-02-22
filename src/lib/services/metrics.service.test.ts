import { describe, test, it, expect } from "bun:test";
import {
    calculateTRIMP,
    calculateSimpleLoad,
    calculateFitnessFatigue
} from "./metrics.service";
import type { Activity } from "@/lib/db/schema";

describe("calculateTRIMP", () => {
    it("should return null if streams are missing", () => {
        expect(calculateTRIMP({ streamsPayload: null })).toBeNull();
    });

    it("should calculate correct TRIMP given valid hr and time streams", () => {
        // 10 minutes at 125 bpm (exactly (125-60)/(190-60) = 0.5 HRR)
        // dt = 60s per point for 10 points
        const timeStream = [0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600];
        const hrStream = [60, 125, 125, 125, 125, 125, 125, 125, 125, 125, 125];

        const activity = {
            streamsPayload: [
                { type: "time", data: timeStream },
                { type: "heartrate", data: hrStream }
            ]
        };

        const trimp = calculateTRIMP(activity);

        // TRIMP = duration(min) * HRR * 0.64 * e^(1.92 * HRR)
        // 10 * 0.5 * 0.64 * e^(0.96)
        // 3.2 * 2.611696 = 8.357 -> Math.round -> 8
        expect(trimp).toBe(8);
    });
});

describe("calculateSimpleLoad", () => {
    it("should calculate load correctly without HR", () => {
        // 1 hour, 10km, 100m elevation
        const activity = {
            movingTimeSeconds: 3600,
            distanceMeters: "10000",
            totalElevationGain: "100",
            averageHeartrate: null,
        } as unknown as Activity;

        const load = calculateSimpleLoad(activity);
        // duration (1) * intensity (1) * 80 + elevation (100) * 0.1 = 80 + 10 = 90
        expect(load).toBe(90);
    });

    it("should scale with average HR", () => {
        const activity = {
            movingTimeSeconds: 3600,
            distanceMeters: "10000",
            totalElevationGain: "100",
            averageHeartrate: "168", // 168/140 = 1.2
        } as unknown as Activity;

        const load = calculateSimpleLoad(activity);
        // 1 * 1.2 * 80 + 10 = 96 + 10 = 106
        expect(load).toBe(106);
    });
});

describe("calculateFitnessFatigue", () => {
    it("should correctly handle empty input", () => {
        expect(calculateFitnessFatigue({})).toEqual({});
    });

    it("should build CTL and ATL progressively", () => {
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

        const dailyLoad = {
            [yesterday]: 100, // Load 100 yesterday
            [today]: 50       // Load 50 today
        };

        const result = calculateFitnessFatigue(dailyLoad);

        expect(result[yesterday]).toBeDefined();
        expect(result[today]).toBeDefined();

        // yesterday CTL = 0 + 100 * (1 - e^-1/42) = 100 * ~0.0235 = ~2.35
        expect(result[yesterday].ctl).toBeGreaterThan(2.3);
        expect(result[yesterday].ctl).toBeLessThan(2.4);

        // yesterday ATL = 0 + 100 * (1 - e^-1/7) = 100 * ~0.133 = ~13.3
        expect(result[yesterday].atl).toBeGreaterThan(13);

        // TSB = CTL - ATL (should be negative since ATL > CTL on day 1)
        expect(result[yesterday].tsb).toBeLessThan(0);

        // Today CTL = yesterdayCTL * e^-1/42 + 50 * (1 - e^-1/42)
        // This just verifies the mathematical progression exists
        expect(result[today].ctl).toBeGreaterThan(result[yesterday].ctl);
    });
});
