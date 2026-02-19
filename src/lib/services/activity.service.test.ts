
import { describe, it, expect, mock } from "bun:test";
import { getWeeklyStats } from "./activity.service";
import { db } from "@/lib/db/client";
import { inspect } from "util";

// Mock the db client
mock.module("@/lib/db/client", () => {
  return {
    db: {
      query: {
        activities: {
          findMany: mock(async () => []),
        },
      },
    },
  };
});

describe("getWeeklyStats", () => {
  it("should calculate stats correctly and use efficient query", async () => {
    const userId = "test-user-id";
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Create some dummy activities
    const dummyActivities = [
      {
        userId,
        startDate: new Date(now.getTime() - 1000 * 60 * 60), // 1 hour ago (this week)
        distanceMeters: "1000",
        movingTimeSeconds: 3600,
        calories: 500,
      },
      {
        userId,
        startDate: new Date(startOfWeek.getTime() - 1000 * 60 * 60 * 24), // 1 day before start of week
        distanceMeters: "2000",
        movingTimeSeconds: 7200,
        calories: 1000,
      },
    ];

    const findManySpy = db.query.activities.findMany as unknown as ReturnType<typeof mock>;
    findManySpy.mockResolvedValue(dummyActivities);

    const stats = await getWeeklyStats(userId);

    expect(findManySpy).toHaveBeenCalled();
    const args = findManySpy.mock.calls[0][0];

    const whereInspect = inspect(args.where, { depth: null, colors: false });

    // Assert that the query includes the start_date filter
    expect(whereInspect).toContain("start_date");
    expect(whereInspect).toContain(">=");

    // Verify that all returned activities were processed (no in-memory filtering)
    // The DB query is responsible for filtering, but our mock returns everything.
    // So getting the sum of all proves we rely on the DB query.
    expect(stats.totalDistance).toBe(3000);
    expect(stats.totalTime).toBe(3600 + 7200);
    expect(stats.totalActivities).toBe(2);
    expect(stats.totalCalories).toBe(500 + 1000);
  });
});
