import { task } from "@trigger.dev/sdk";
import { processActivity } from "@/lib/services/activity.service";
import { sendTelegramNotification } from "./send-telegram-notification.js";

export const processStravaActivity = task({
  id: "process-strava-activity",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 5000,
    maxTimeoutInMs: 30_000,
  },
  run: async (payload: {
    stravaActivityId: number;
    userId: string;
    accessToken: string;
  }) => {
    const { stravaActivityId, userId, accessToken } = payload;

    const TRIGGER_SECRET_KEY = process.env.TRIGGER_SECRET_KEY;
    if (!TRIGGER_SECRET_KEY) throw new Error("TRIGGER_SECRET_KEY is not set");

    console.log(`Processing Strava activity ${stravaActivityId} for user ${userId}`);

    // 1. Fetch from Strava, save to DB, and generate AI feedback
    const activityId = await processActivity(stravaActivityId, userId, accessToken);

    console.log(`Activity processed: ${activityId}. Sending Telegram notification...`);

    // 2. Send Telegram notification with the AI feedback
    const result = await sendTelegramNotification.triggerAndWait({ activityId, userId });

    if (!result.ok) {
      console.error("Telegram notification failed:", result.error);
    } else {
      console.log("Telegram notification result:", result.output);
    }

    return { activityId, notified: result.ok };
  },
});
