import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getActivityWithFeedback } from "@/lib/services/activity.service";
import { MetricsGrid } from "@/components/activity/MetricsGrid";
import { SplitsTable } from "@/components/activity/SplitsTable";
import { AIFeedback } from "@/components/activity/AIFeedback";
import { ActivityHeader } from "@/components/activity/ActivityHeader";

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
      <ActivityHeader activity={activity} />
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
