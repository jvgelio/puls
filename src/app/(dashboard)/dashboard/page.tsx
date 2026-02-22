import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWeeklyStats, getUserActivities, getMonthlyStats } from "@/lib/services/activity.service";
import { getTrainingLoadTrend, calculateFitnessFatigue, getHeatmapData, getPersonalRecords } from "@/lib/services/metrics.service";
import { getUserGoals } from "@/lib/services/goals.service";
import {
  needsHistoricalImport,
  startBackgroundImport,
} from "@/lib/services/import.service";
import { db } from "@/lib/db/client";
import { oauthTokens, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// New & Retained Components
import { HeroStatusCard } from "@/components/dashboard/HeroStatusCard";
import { FitnessChartCard } from "@/components/dashboard/FitnessChartCard";
import { GoalsCard } from "@/components/dashboard/GoalsCard";
import { RecentWorkoutsList } from "@/components/dashboard/RecentWorkoutsList";
import { LastActivityCard } from "@/components/dashboard/LastActivityCard";
import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";
import { ImportBanner } from "@/components/dashboard/ImportBanner";
import { TelegramConnect } from "@/components/settings/TelegramConnect";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Check if user needs historical import
  const needsImport = await needsHistoricalImport(userId);

  if (needsImport) {
    // Get user's access token and start import
    const token = await db.query.oauthTokens.findFirst({
      where: eq(oauthTokens.userId, userId),
    });

    if (token) {
      startBackgroundImport(userId, token.accessToken);
    }
  }

  // Check Telegram connection status
  const [userRow] = await db
    .select({ telegramChatId: users.telegramChatId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const telegramConnected = userRow?.telegramChatId != null;

  // Get dashboard data
  const [stats, recentActivities, trainingLoad, monthlyStats, heatmapData, personalRecords, goals] = await Promise.all([
    getWeeklyStats(userId),
    getUserActivities(userId, { limit: 10 }),
    getTrainingLoadTrend(userId, 180), // 180 days to fully warm up EWMA (42 days constant)
    getMonthlyStats(userId),
    getHeatmapData(userId, 180), // 180 days for heatmap
    getPersonalRecords(userId),
    getUserGoals(userId),
  ]);

  const fitnessFatigueDataArray = calculateFitnessFatigue(trainingLoad);
  const trainingLoadData = Object.keys(fitnessFatigueDataArray)
    .sort()
    .slice(-60) // Show only the last 60 days so EWMA has warmed up
    .map(date => ({
      date,
      load: fitnessFatigueDataArray[date].load,
      ctl: fitnessFatigueDataArray[date].ctl,
      atl: fitnessFatigueDataArray[date].atl,
      tsb: fitnessFatigueDataArray[date].tsb,
    }));

  const last7DaysFitness = trainingLoadData.slice(-7).map(d => {
    const dObj = new Date(d.date);
    dObj.setHours(dObj.getHours() + 12); // avoid timezone shifts
    return {
      day: ["D", "S", "T", "Q", "Q", "S", "S"][dObj.getDay()],
      value: d.ctl
    };
  });

  const currentFitness = trainingLoadData[trainingLoadData.length - 1]?.ctl || 0;
  const lastWeekFitness = trainingLoadData[trainingLoadData.length - 8]?.ctl || currentFitness;
  const fitnessTrendPercent = lastWeekFitness > 0 ? ((currentFitness - lastWeekFitness) / lastWeekFitness) * 100 : 0;

  // Get all activities for the chart (last 4 weeks)
  const allActivities = await getUserActivities(userId, { limit: 100 });

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta, {session.user.name?.split(" ")[0]}!
        </p>
      </div>

      {needsImport && <ImportBanner userId={userId} />}
      {!telegramConnected && <TelegramConnect initialConnected={false} />}

      {/* Row 1: Status & Fitness - Swapped positions */}
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4 self-start">
          <FitnessChartCard
            totalValue={Math.round(currentFitness).toString()}
            trendPercent={fitnessTrendPercent}
            data={last7DaysFitness}
            className="h-auto"
          />
        </div>
        <div className="lg:col-span-8 self-start">
          <HeroStatusCard
            tsb={trainingLoadData[trainingLoadData.length - 1]?.tsb || 0}
          />
        </div>
      </div>

      {/* Row 2: Consistency & Progress - "Como está minha semana / Minhas Metas?" */}
      <div className="grid gap-8 lg:grid-cols-2">
        <GoalsCard goals={goals} />
        <ActivityHeatmap activities={heatmapData} days={180} />
      </div>

      {/* Row 3: Activities & History - "O que eu fiz recentemente?" */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* We keep LastActivityCard as requested */}
        <LastActivityCard activity={recentActivities[0]} />
        <RecentWorkoutsList activities={recentActivities.slice(1)} />
      </div>
    </div>
  );
}
