import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getActivityWithFeedback } from "@/lib/services/activity.service";
import { MetricsGrid } from "@/components/activity/MetricsGrid";
import { SplitsTable } from "@/components/activity/SplitsTable";
import { AIFeedback } from "@/components/activity/AIFeedback";
import { Badge } from "@/components/ui/badge";
import {
  formatDate,
  formatTime,
  getSportDisplayName,
} from "@/lib/utils/formatters";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ActivityPageProps {
  params: Promise<{ id: string }>;
}

export default async function ActivityPage({ params }: ActivityPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const activity = await getActivityWithFeedback(id, session.user.id);

  if (!activity) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/activities">← Voltar</Link>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {activity.name}
            </h1>
            <Badge variant="secondary" className="text-sm">
              {getSportDisplayName(activity.sportType || "Treino")}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {activity.startDate && (
              <>
                {formatDate(activity.startDate)} às{" "}
                {formatTime(activity.startDate)}
              </>
            )}
          </p>
        </div>
      </div>

      <MetricsGrid activity={activity} />

      <div className="grid gap-8 lg:grid-cols-2">
        <SplitsTable activity={activity} />
        <AIFeedback
          feedback={activity.feedback}
          activityId={activity.id}
          userId={session.user.id}
        />
      </div>
    </div>
  );
}
