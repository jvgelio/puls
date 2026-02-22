import { describe, test, it, expect, mock, beforeEach } from "bun:test";
import { processActivity, getWeeklyStats } from "@/lib/services/activity.service";
import { db } from "@/lib/db/client";
import { inspect } from "util";

// Mock data
const MOCK_USER_ID = "user-123";
const MOCK_USER_STRAVA_ID = 123;
const MOCK_ACTIVITY_ID = 999;
const MOCK_OTHER_ATHLETE_ID = 456;

// Mock database functions
const mockFindUser = mock();
const mockFindActivity = mock();
const mockInsertActivity = mock();
const mockUpdateActivity = mock();
const mockFindManyActivities = mock(async () => []);

// Mock Strava API functions
const mockGetActivity = mock();
const mockGetActivityStreams = mock();
const mockGetActivityLaps = mock();

// Mock modules
mock.module("@/lib/db/client", () => ({
  db: {
    query: {
      users: {
        findFirst: mockFindUser,
      },
      activities: {
        findFirst: mockFindActivity,
        findMany: mockFindManyActivities,
      },
    },
    insert: mock(() => ({
      values: mock(() => ({
        returning: mockInsertActivity,
      })),
    })),
    update: mock(() => ({
      set: mock(() => ({
        where: mockUpdateActivity,
      })),
    })),
  },
  schema: {
    activities: { stravaId: {} },
    users: { id: {} },
  },
}));

mock.module("@/lib/strava/api", () => ({
  createStravaClient: mock(() => ({
    getActivity: mockGetActivity,
    getActivityStreams: mockGetActivityStreams,
    getActivityLaps: mockGetActivityLaps,
  })),
}));

mock.module("@/lib/services/ai.service", () => ({
  generateFeedback: mock(() => Promise.resolve()),
}));

mock.module("drizzle-orm", () => ({
  eq: mock((col, val) => ({ col, val })),
  and: mock((...args) => args),
}));

describe("processActivity Security Tests", () => {
  beforeEach(() => {
    mockFindUser.mockReset();
    mockFindActivity.mockReset();
    mockInsertActivity.mockReset();
    mockUpdateActivity.mockReset();
    mockGetActivity.mockReset();

    // Default mocks
    mockFindUser.mockResolvedValue({ id: MOCK_USER_ID, stravaId: MOCK_USER_STRAVA_ID });
    mockFindActivity.mockResolvedValue(null); // Activity doesn't exist in DB
    mockInsertActivity.mockResolvedValue([{ id: "new-activity-id" }]);
    mockGetActivityStreams.mockResolvedValue(null);
    mockGetActivityLaps.mockResolvedValue([]);
  });

  test("should THROW error if activity belongs to another user (IDOR prevention)", async () => {
    // Arrange: User has Strava ID 123, but Activity belongs to Athlete 456
    mockGetActivity.mockResolvedValue({
      id: MOCK_ACTIVITY_ID,
      athlete: { id: MOCK_OTHER_ATHLETE_ID },
      name: "Stolen Activity",
      distance: 1000,
      moving_time: 100,
      elapsed_time: 120,
      total_elevation_gain: 10,
      type: "Run",
      sport_type: "Run",
      start_date: "2023-01-01T00:00:00Z",
      average_speed: 10,
      max_speed: 15,
      has_heartrate: false,
      map: { summary_polyline: "" },
      calories: 500,
      segment_efforts: [],
    });

    // Act & Assert
    expect(
      processActivity(MOCK_ACTIVITY_ID, MOCK_USER_ID, "token", false)
    ).rejects.toThrow("Activity ownership mismatch");

    // Ensure saveActivity was NOT called (implied by db.insert not being called)
    expect(mockInsertActivity).not.toHaveBeenCalled();
  });

  test("should SUCCEED if activity belongs to the user", async () => {
    // Arrange: User has Strava ID 123, Activity belongs to Athlete 123
    mockGetActivity.mockResolvedValue({
      id: MOCK_ACTIVITY_ID,
      athlete: { id: MOCK_USER_STRAVA_ID },
      name: "My Activity",
      distance: 1000,
      moving_time: 100,
      elapsed_time: 120,
      total_elevation_gain: 10,
      type: "Run",
      sport_type: "Run",
      start_date: "2023-01-01T00:00:00Z",
      average_speed: 10,
      max_speed: 15,
      has_heartrate: false,
      map: { summary_polyline: "" },
      calories: 500,
      segment_efforts: [],
    });

    // Act
    const result = await processActivity(MOCK_ACTIVITY_ID, MOCK_USER_ID, "token", false);

    // Assert
    expect(result).toBe("new-activity-id");
    expect(mockInsertActivity).toHaveBeenCalled();
  });

  test("should THROW error if user is not found", async () => {
    // Arrange: User not found
    mockFindUser.mockResolvedValue(null);
    mockGetActivity.mockResolvedValue({
      id: MOCK_ACTIVITY_ID,
      athlete: { id: MOCK_USER_STRAVA_ID }, // Doesn't matter
    });

    // Act & Assert
    expect(
      processActivity(MOCK_ACTIVITY_ID, MOCK_USER_ID, "token", false)
    ).rejects.toThrow("User not found");
  });
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

    // @ts-expect-error mockResolvedValue is dynamically added by bun:test mock
    mockFindManyActivities.mockResolvedValue(dummyActivities);

    const stats = await getWeeklyStats(userId);

    expect(mockFindManyActivities).toHaveBeenCalled();
    // @ts-expect-error bun:test mock.calls tuple typings are loose
    const args = mockFindManyActivities.mock.calls[0][0] as any;

    const whereInspect = inspect(args?.where, { depth: null, colors: false });

    // Assert that the query includes the start_date filter
    expect(whereInspect).toContain("start_date");
    expect(whereInspect).toContain(">=");

    // Verify that all returned activities were processed
    expect(stats.totalDistance).toBe(3000);
    expect(stats.totalTime).toBe(3600 + 7200);
    expect(stats.totalActivities).toBe(2);
    expect(stats.totalCalories).toBe(500 + 1000);
  });
});
