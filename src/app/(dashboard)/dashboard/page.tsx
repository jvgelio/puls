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
import { getOAuthTokenByUserId, isTelegramConnected } from "@/lib/services/user.service";

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

      <Suspense fallback={null}>
        <TopBanners userId={userId} />
      </Suspense>

      {/* Row 1: Status & Fitness */}
      <Suspense fallback={
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4 self-start">
            <Skeleton className="h-[150px] w-full rounded-xl" />
          </div>
          <div className="lg:col-span-8 self-start">
            <Skeleton className="h-[150px] w-full rounded-xl" />
          </div>
        </div>
      }>
        <Row1Data userId={userId} />
      </Suspense>

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
      <Suspense fallback={
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      }>
        <Row3Data userId={userId} />
      </Suspense>
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
    const token = await getOAuthTokenByUserId(userId);

    if (token) {
      startBackgroundImport(userId, token.accessToken);
    }
  }

  // Check Telegram connection status
  const telegramConnected = await isTelegramConnected(userId);

  return (
    <>
      {needsImport && <ImportBanner userId={userId} />}
      {!telegramConnected && <TelegramConnect initialConnected={false} />}
    </>
  );
}

async function Row1Data({ userId }: { userId: string }) {
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

  return (
    <div className="grid gap-8 lg:grid-cols-12 w-full">
      <div className="lg:col-span-4 self-start w-full">
        <FitnessSection data={trainingLoadData} />
      </div>
      <div className="lg:col-span-8 self-start w-full">
        <StatusSection data={trainingLoadData} />
      </div>
    </div>
  );
}

function FitnessSection({ data }: { data: any[] }) {
  const last7DaysFitness = data.slice(-7).map(d => {
    const dObj = new Date(d.date);
    dObj.setHours(dObj.getHours() + 12);
    return {
      day: ["D", "S", "T", "Q", "Q", "S", "S"][dObj.getDay()],
      value: d.ctl
    };
  });

  const currentFitness = data[data.length - 1]?.ctl || 0;
  const lastWeekFitness = data[data.length - 8]?.ctl || currentFitness;
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

function StatusSection({ data }: { data: any[] }) {
  return (
    <HeroStatusCard
      tsb={data[data.length - 1]?.tsb || 0}
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

async function Row3Data({ userId }: { userId: string }) {
  const recentActivities = await getUserActivities(userId, { limit: 10 });

  return (
    <div className="grid gap-8 lg:grid-cols-2 w-full">
      <LastActivitySection activities={recentActivities} />
      <RecentWorkoutsSection activities={recentActivities} />
    </div>
  );
}

function LastActivitySection({ activities }: { activities: any[] }) {
  if (activities.length === 0) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-xl border border-dashed text-muted-foreground text-sm">
        Nenhuma atividade recente.
      </div>
    );
  }
  return <LastActivityCard activity={activities[0]} />;
}

function RecentWorkoutsSection({ activities }: { activities: any[] }) {
  return <RecentWorkoutsList activities={activities.slice(1)} />;
}
