"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Activity, AIFeedback } from "@/lib/db/schema";
import {
  formatDistanceFromMeters,
  formatDuration,
  formatPace,
  formatDateShort,
  formatTime,
  getSportDisplayName,
  formatHeartRate,
  formatElevation,
} from "@/lib/utils/formatters";

interface ActivityWithFeedback extends Activity {
  feedback?: AIFeedback | null;
}

interface ActivityListProps {
  activities: ActivityWithFeedback[];
}

export function ActivityList({ activities }: ActivityListProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-muted-foreground text-center">
            Nenhuma atividade encontrada. Suas atividades do Strava aparecerão
            aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const distanceKm = parseFloat(activity.distanceMeters || "0") / 1000;
        const pace = formatPace(activity.movingTimeSeconds || 0, distanceKm);

        return (
          <Link key={activity.id} href={`/activities/${activity.id}`}>
            <Card className="hover:bg-accent transition-colors">
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-lg">
                        {activity.name}
                      </span>
                      <Badge variant="secondary">
                        {getSportDisplayName(activity.sportType || "Treino")}
                      </Badge>
                      {activity.feedback && (
                        <Badge variant="outline" className="text-xs">
                          Feedback IA
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {formatDistanceFromMeters(
                          parseFloat(activity.distanceMeters || "0")
                        )}
                      </span>
                      <span>
                        {formatDuration(activity.movingTimeSeconds || 0)}
                      </span>
                      <span>{pace}</span>
                      {activity.averageHeartrate && (
                        <span>
                          {formatHeartRate(
                            parseFloat(activity.averageHeartrate)
                          )}
                        </span>
                      )}
                      {activity.totalElevationGain && (
                        <span>
                          {formatElevation(
                            parseFloat(activity.totalElevationGain)
                          )}{" "}
                          elev.
                        </span>
                      )}
                    </div>

                    {activity.feedback?.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2 max-w-2xl">
                        {activity.feedback.summary}
                      </p>
                    )}
                  </div>

                  <div className="text-right text-sm text-muted-foreground">
                    {activity.startDate && (
                      <>
                        <div>{formatDateShort(activity.startDate)}</div>
                        <div>{formatTime(activity.startDate)}</div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
