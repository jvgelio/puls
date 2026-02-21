import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  bigint,
  decimal,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  stravaId: bigint("strava_id", { mode: "number" }).unique().notNull(),
  email: varchar("email", { length: 255 }),
  name: varchar("name", { length: 255 }),
  profilePicture: text("profile_picture"),
  // AI preferences
  aiModel: varchar("ai_model", { length: 100 }),
  // Telegram integration
  telegramChatId: bigint("telegram_chat_id", { mode: "number" }),
  telegramConnectCode: varchar("telegram_connect_code", { length: 32 }),
  telegramConnectExpiry: timestamp("telegram_connect_expiry"),
  coachInsightText: text("coach_insight_text"),
  coachInsightGeneratedAt: timestamp("coach_insight_generated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// OAuth Tokens table
export const oauthTokens = pgTable("oauth_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  scope: text("scope"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Activities table
export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  stravaId: bigint("strava_id", { mode: "number" }).unique().notNull(),
  name: varchar("name", { length: 255 }),
  sportType: varchar("sport_type", { length: 50 }),
  startDate: timestamp("start_date"),

  // Core metrics (extracted for quick queries)
  distanceMeters: decimal("distance_meters", { precision: 12, scale: 2 }),
  movingTimeSeconds: integer("moving_time_seconds"),
  elapsedTimeSeconds: integer("elapsed_time_seconds"),
  averageSpeed: decimal("average_speed", { precision: 8, scale: 4 }),
  maxSpeed: decimal("max_speed", { precision: 8, scale: 4 }),
  hasHeartrate: boolean("has_heartrate").default(false),
  averageHeartrate: decimal("average_heartrate", { precision: 5, scale: 2 }),
  maxHeartrate: decimal("max_heartrate", { precision: 5, scale: 2 }),
  totalElevationGain: decimal("total_elevation_gain", { precision: 8, scale: 2 }),
  averageCadence: decimal("average_cadence", { precision: 6, scale: 2 }),
  calories: integer("calories"),

  // Complete payloads (stored for future metric extraction)
  rawPayload: jsonb("raw_payload"),
  streamsPayload: jsonb("streams_payload"),
  lapsPayload: jsonb("laps_payload"),
  segmentsPayload: jsonb("segments_payload"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI Feedbacks table
export const aiFeedbacks = pgTable("ai_feedbacks", {
  id: uuid("id").defaultRandom().primaryKey(),
  activityId: uuid("activity_id")
    .references(() => activities.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  content: text("content"),
  summary: text("summary"),
  positives: jsonb("positives").$type<string[]>(),
  improvements: jsonb("improvements").$type<string[]>(),
  recommendations: jsonb("recommendations").$type<string[]>(),

  modelUsed: varchar("model_used", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  oauthToken: one(oauthTokens),
  activities: many(activities),
  feedbacks: many(aiFeedbacks),
}));

export const oauthTokensRelations = relations(oauthTokens, ({ one }) => ({
  user: one(users, {
    fields: [oauthTokens.userId],
    references: [users.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
  feedback: one(aiFeedbacks),
}));

export const aiFeedbacksRelations = relations(aiFeedbacks, ({ one }) => ({
  activity: one(activities, {
    fields: [aiFeedbacks.activityId],
    references: [activities.id],
  }),
  user: one(users, {
    fields: [aiFeedbacks.userId],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type OAuthToken = typeof oauthTokens.$inferSelect;
export type NewOAuthToken = typeof oauthTokens.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
export type AIFeedback = typeof aiFeedbacks.$inferSelect;
export type NewAIFeedback = typeof aiFeedbacks.$inferInsert;
