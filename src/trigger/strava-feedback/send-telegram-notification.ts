import { task } from "@trigger.dev/sdk";
import { db } from "@/lib/db/client";
import { activities, aiFeedbacks, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  formatDistanceFromMeters,
  formatDuration,
  formatPace,
  formatSpeed,
  formatHeartRate,
  formatElevation,
  formatCalories,
  formatDate,
  getSportEmoji,
  getSportDisplayName,
} from "@/lib/utils/formatters";

export const sendTelegramNotification = task({
  id: "send-telegram-notification",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 3000,
    maxTimeoutInMs: 15_000,
  },
  run: async (payload: { activityId: string; userId: string }) => {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN is not set");

    const { activityId, userId } = payload;

    // 1. Fetch user (to get telegramChatId)
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { telegramChatId: true, name: true },
    });

    if (!user?.telegramChatId) {
      console.log(`User ${userId} has no Telegram chat ID configured. Skipping notification.`);
      return { skipped: true, reason: "no_telegram_chat_id" };
    }

    // 2. Fetch activity with feedback
    const activity = await db.query.activities.findFirst({
      where: and(eq(activities.id, activityId), eq(activities.userId, userId)),
      with: { feedback: true },
    });

    if (!activity) {
      throw new Error(`Activity ${activityId} not found for user ${userId}`);
    }

    // 3. Build Telegram message
    const message = buildTelegramMessage(activity, activity.feedback ?? null);

    // 4. Send via Telegram Bot API
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: user.telegramChatId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Telegram API error: ${response.status} — ${error}`);
    }

    console.log(`Telegram notification sent to user ${userId} (chat ${user.telegramChatId})`);
    return { sent: true, chatId: user.telegramChatId };
  },
});

type ActivityRow = typeof activities.$inferSelect;
type FeedbackRow = typeof aiFeedbacks.$inferSelect;

function buildTelegramMessage(
  activity: ActivityRow,
  feedback: FeedbackRow | null
): string {
  const sportType = activity.sportType ?? "Workout";
  const emoji = getSportEmoji(sportType);
  const sportName = getSportDisplayName(sportType);
  const activityName = activity.name ?? sportName;
  const date = activity.startDate ? formatDate(activity.startDate) : "Data desconhecida";

  const distanceM = parseFloat(activity.distanceMeters ?? "0");
  const distanceKm = distanceM / 1000;
  const movingTime = activity.movingTimeSeconds ?? 0;
  const avgSpeed = parseFloat(activity.averageSpeed ?? "0");
  const isRunning = sportType.toLowerCase().includes("run");

  // Metrics block
  const metricsLines: string[] = [];

  if (distanceM > 0) {
    metricsLines.push(`📏 Distância: <b>${formatDistanceFromMeters(distanceM)}</b>`);
  }
  if (movingTime > 0) {
    metricsLines.push(`⏱ Duração: <b>${formatDuration(movingTime)}</b>`);
  }
  if (distanceKm > 0 && movingTime > 0) {
    if (isRunning) {
      metricsLines.push(`🏃 Pace: <b>${formatPace(movingTime, distanceKm)}</b>`);
    } else {
      metricsLines.push(`⚡ Velocidade: <b>${formatSpeed(avgSpeed)}</b>`);
    }
  }
  if (activity.hasHeartrate && activity.averageHeartrate) {
    metricsLines.push(
      `❤️ Freq. cardíaca: <b>${formatHeartRate(parseFloat(activity.averageHeartrate))}</b>`
    );
  }
  if (activity.totalElevationGain && parseFloat(activity.totalElevationGain) > 0) {
    metricsLines.push(
      `⛰ Elevação: <b>${formatElevation(parseFloat(activity.totalElevationGain))}</b>`
    );
  }
  if (activity.calories && activity.calories > 0) {
    metricsLines.push(`🔥 Calorias: <b>${formatCalories(activity.calories)}</b>`);
  }

  let message = `${emoji} <b>${activityName}</b>\n`;
  message += `📅 ${date}\n\n`;

  if (metricsLines.length > 0) {
    message += `📊 <b>Métricas</b>\n`;
    message += metricsLines.join("\n");
    message += "\n";
  }

  if (!feedback) {
    message += "\n⏳ <i>Feedback da IA ainda sendo gerado...</i>";
    return message;
  }

  if (feedback.summary) {
    message += `\n💬 <b>Resumo</b>\n${feedback.summary}\n`;
  }

  if (feedback.positives && (feedback.positives as string[]).length > 0) {
    message += `\n✅ <b>Pontos positivos</b>\n`;
    message += (feedback.positives as string[]).map((p) => `• ${p}`).join("\n");
    message += "\n";
  }

  if (feedback.improvements && (feedback.improvements as string[]).length > 0) {
    message += `\n📈 <b>Para melhorar</b>\n`;
    message += (feedback.improvements as string[]).map((i) => `• ${i}`).join("\n");
    message += "\n";
  }

  if (feedback.recommendations && (feedback.recommendations as string[]).length > 0) {
    message += `\n🎯 <b>Recomendações</b>\n`;
    message += (feedback.recommendations as string[]).map((r) => `• ${r}`).join("\n");
    message += "\n";
  }

  return message.trim();
}
