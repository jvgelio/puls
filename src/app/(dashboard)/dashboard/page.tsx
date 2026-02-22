import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserActivities } from "@/lib/services/activity.service";
import { getTrainingLoadTrend, calculateFitnessFatigue, getHeatmapData } from "@/lib/services/metrics.service";
import { getUserGoals } from "@/lib/services/goals.service";
import {
  needsHistoricalImport,
  startBackgroundImport,
} from "@/lib/services/import.service";
import { db } from "@/lib/db/client";
import { oauthTokens, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

import { HeroStatusCard } from "@/components/dashboard/HeroStatusCard";
import { FitnessChartCard } from "@/components/dashboard/FitnessChartCard";
import { GoalsCard } from "@/components/dashboard/GoalsCard";
import { RecentWorkoutsList } from "@/components/dashboard/RecentWorkoutsList";
import { LastActivityCard } from "@/components/dashboard/LastActivityCard";
import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";
import { ImportBanner } from "@/components/dashboard/ImportBanner";
import { TelegramConnect } from "@/components/settings/TelegramConnect";
import { Skeleton } from "@/components/ui/skeleton";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta, {session.user.name?.split(" ")[0]}!
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-[68px] w-full rounded-xl" />}>
        <TopBanners userId={userId} />
      </Suspense>

      {/* Row 1: Status & Fitness */}
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4 self-start">
          <Suspense fallback={<Skeleton className="h-[150px] w-full rounded-xl" />}>
            <FitnessSection userId={userId} />
          </Suspense>
        </div>
        <div className="lg:col-span-8 self-start">
          <Suspense fallback={<Skeleton className="h-[150px] w-full rounded-xl" />}>
            <StatusSection userId={userId} />
          </Suspense>
        </div>
      </div>

      {/* Row 2: Consistency & Progress */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-xl" />}>
          <GoalsSection userId={userId} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-xl" />}>
          <HeatmapSection userId={userId} />
        </Suspense>
      </div>

      {/* Row 3: Activities & History */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}>
          <LastActivitySection userId={userId} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}>
          <RecentWorkoutsSection userId={userId} />
        </Suspense>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SERVER COMPONENTS FOR STREAMING
// -------------------------------------------------------------

async function TopBanners({ userId }: { userId: string }) {
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

  return (
    <>
      {needsImport && <ImportBanner userId={userId} />}
      {!telegramConnected && <TelegramConnect initialConnected={false} />}
    </>
  );
}

async function FitnessSection({ userId }: { userId: string }) {
  const trainingLoad = await getTrainingLoadTrend(userId, 180);
  const fitnessFatigueDataArray = calculateFitnessFatigue(trainingLoad);
  const trainingLoadData = Object.keys(fitnessFatigueDataArray)
    .sort()
    .slice(-60) // Show only the last 60 days
    .map(date => ({
      date,
      load: fitnessFatigueDataArray[date].load,
      ctl: fitnessFatigueDataArray[date].ctl,
      atl: fitnessFatigueDataArray[date].atl,
      tsb: fitnessFatigueDataArray[date].tsb,
    }));

  const last7DaysFitness = trainingLoadData.slice(-7).map(d => {
    const dObj = new Date(d.date);
    dObj.setHours(dObj.getHours() + 12);
    return {
      day: ["D", "S", "T", "Q", "Q", "S", "S"][dObj.getDay()],
      value: d.ctl
    };
  });

  const currentFitness = trainingLoadData[trainingLoadData.length - 1]?.ctl || 0;
  const lastWeekFitness = trainingLoadData[trainingLoadData.length - 8]?.ctl || currentFitness;
  const fitnessTrendPercent = lastWeekFitness > 0 ? ((currentFitness - lastWeekFitness) / lastWeekFitness) * 100 : 0;

  return (
    <FitnessChartCard
      totalValue={Math.round(currentFitness).toString()}
      trendPercent={fitnessTrendPercent}
      data={last7DaysFitness}
      className="h-auto"
    />
  );
}

async function StatusSection({ userId }: { userId: string }) {
  const trainingLoad = await getTrainingLoadTrend(userId, 180);
  const fitnessFatigueDataArray = calculateFitnessFatigue(trainingLoad);
  const trainingLoadData = Object.keys(fitnessFatigueDataArray)
    .sort()
    .slice(-60) // Show only the last 60 days
    .map(date => ({
      date,
      tsb: fitnessFatigueDataArray[date].tsb,
    }));

  return (
    <HeroStatusCard
      tsb={trainingLoadData[trainingLoadData.length - 1]?.tsb || 0}
    />
  );
}

async function GoalsSection({ userId }: { userId: string }) {
  const goals = await getUserGoals(userId);
  return <GoalsCard goals={goals} />;
}

async function HeatmapSection({ userId }: { userId: string }) {
  const heatmapData = await getHeatmapData(userId, 180);
  return <ActivityHeatmap activities={heatmapData} days={90} />;
}

async function LastActivitySection({ userId }: { userId: string }) {
  const recentActivities = await getUserActivities(userId, { limit: 10 });
  if (recentActivities.length === 0) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-xl border border-dashed text-muted-foreground text-sm">
        Nenhuma atividade recente.
      </div>
    );
  }
  return <LastActivityCard activity={recentActivities[0]} />;
}

async function RecentWorkoutsSection({ userId }: { userId: string }) {
  const recentActivities = await getUserActivities(userId, { limit: 10 });
  return <RecentWorkoutsList activities={recentActivities.slice(1)} />;
}
