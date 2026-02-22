"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Activity, AIFeedback } from "@/lib/db/schema";
import {
  formatDistanceFromMeters,
  formatDuration,
  formatPace,
  formatRelativeTime,
  getSportDisplayName,
} from "@/lib/utils/formatters";
import { SPORT_COLORS } from "@/lib/utils/sport-colors";
import { SportIcon } from "@/components/ui/sport-icon";

interface ActivityWithFeedback extends Activity {
  feedback?: AIFeedback | null;
}

interface RecentActivityProps {
  activities: ActivityWithFeedback[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhuma atividade encontrada. Conecte sua conta Strava para começar!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Atividades Recentes</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/activities">Ver todas</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const distanceKm = parseFloat(activity.distanceMeters || "0") / 1000;
          const pace = formatPace(
            activity.movingTimeSeconds || 0,
            distanceKm
          );

          const colors = activity.sportType && SPORT_COLORS[activity.sportType]
            ? SPORT_COLORS[activity.sportType]
            : SPORT_COLORS.default;

          return (
            <Link
              key={activity.id}
              href={`/activities/${activity.id}`}
              className="block"
            >
              <div className="flex items-start justify-between p-4 rounded-lg border hover:bg-accent transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <SportIcon sportType={activity.sportType} className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium line-clamp-1 flex-1">{activity.name}</span>
                    <Badge variant="secondary" className={`${colors.bg} ${colors.text} border-none`}>
                      {getSportDisplayName(activity.sportType || "Treino")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatDistanceFromMeters(parseFloat(activity.distanceMeters || "0"))}</span>
                    <span>{formatDuration(activity.movingTimeSeconds || 0)}</span>
                    <span>{pace}</span>
                  </div>
                  {activity.feedback?.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-2">
                      {activity.feedback.summary}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">
                    {activity.startDate
                      ? formatRelativeTime(activity.startDate)
                      : ""}
                  </span>
                  {activity.feedback && (
                    <Badge variant="outline" className="ml-2">
                      IA
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
