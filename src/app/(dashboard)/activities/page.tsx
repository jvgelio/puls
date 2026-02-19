import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserActivities } from "@/lib/services/activity.service";
import { ActivityList } from "@/components/activity/ActivityList";

export default async function ActivitiesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const activities = await getUserActivities(session.user.id, { limit: 50 });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Atividades</h1>
        <p className="text-muted-foreground">
          Histórico de todos os seus treinos
        </p>
      </div>

      <ActivityList activities={activities} />
    </div>
  );
}
