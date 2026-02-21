import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWeeklyStats, getUserActivities, getMonthlyStats } from "@/lib/services/activity.service";
import { getTrainingLoadTrend, calculateRollingBounds } from "@/lib/services/metrics.service";
import {
  needsHistoricalImport,
  startBackgroundImport,
} from "@/lib/services/import.service";
import { db } from "@/lib/db/client";
import { oauthTokens, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { WeeklyActivityTracker } from "@/components/dashboard/WeeklyActivityTracker";
import { ActivityChartCard } from "@/components/dashboard/ActivityChartCard";
import { LastActivityCard } from "@/components/dashboard/LastActivityCard";
import { AICoachInsightCard } from "@/components/dashboard/AICoachInsightCard";
import { ProgressSummaryCard } from "@/components/dashboard/ProgressSummaryCard";
import { TrainingLoadChart } from "@/components/dashboard/TrainingLoadChart";
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
  const [stats, recentActivities, trainingLoad, monthlyStats] = await Promise.all([
    getWeeklyStats(userId),
    getUserActivities(userId, { limit: 10 }),
    getTrainingLoadTrend(userId, 30),
    getMonthlyStats(userId),
  ]);

  const bounds = calculateRollingBounds(trainingLoad, 28);
  const trainingLoadData = Object.keys(trainingLoad).sort().map(date => ({
    date,
    load: trainingLoad[date] || 0,
    upper: bounds[date]?.upper || 0,
    lower: bounds[date]?.lower || 0,
    avg: bounds[date]?.avg || 0,
  }));

  // Get all activities for the chart (last 4 weeks)
  const allActivities = await getUserActivities(userId, { limit: 100 });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta, {session.user.name?.split(" ")[0]}!
        </p>
      </div>

      {needsImport && <ImportBanner userId={userId} />}

      {!telegramConnected && <TelegramConnect initialConnected={false} />}

      <WeeklyActivityTracker recentActivities={recentActivities} />

      <StatsCards stats={stats} />

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <ActivityChartCard activities={allActivities} />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-8">
          <LastActivityCard activity={recentActivities[0]} />
          <AICoachInsightCard />
          <ProgressSummaryCard stats={monthlyStats} />
        </div>
      </div>

      <div className="mt-8">
        <TrainingLoadChart data={trainingLoadData} />
      </div>
    </div>
  );
}
