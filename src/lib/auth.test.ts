import { describe, expect, test, mock } from "bun:test";

// Mock the database client before importing auth
mock.module("./src/lib/db/client.ts", () => {
  return {
    db: {
      query: {
        users: {
          findFirst: mock(() => Promise.resolve({ id: "mock-user-id" })),
        },
        oauthTokens: {
          findFirst: mock(() => Promise.resolve({ id: "mock-token-id" })),
        },
      },
      insert: () => ({
        values: () => ({
          returning: () => Promise.resolve([{ id: "mock-user-id" }]),
        }),
      }),
      update: () => ({
        set: () => ({
          where: () => Promise.resolve([]),
        }),
      }),
    },
    schema: {},
  };
});

// Import after mocking
import { authConfig } from "./auth";

describe("Auth Configuration", () => {
  test("should have correct providers", () => {
    expect(authConfig.providers).toHaveLength(1);
    // @ts-expect-error accessing private property for testing
    expect(authConfig.providers[0].id).toBe("strava");
  });

  test("should have signIn callback", () => {
    expect(authConfig.callbacks?.signIn).toBeDefined();
    expect(typeof authConfig.callbacks?.signIn).toBe("function");
  });

  test("should have jwt callback", () => {
    expect(authConfig.callbacks?.jwt).toBeDefined();
    expect(typeof authConfig.callbacks?.jwt).toBe("function");
  });

  test("should have session callback", () => {
    expect(authConfig.callbacks?.session).toBeDefined();
    expect(typeof authConfig.callbacks?.session).toBe("function");
  });
});
