"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import {
  formatDate,
  formatTime,
  getSportDisplayName,
} from "@/lib/utils/formatters";
import type { Activity } from "@/lib/db/schema";

interface ActivityHeaderProps {
  activity: Activity;
}

export function ActivityHeader({ activity }: ActivityHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/activities">← Voltar</Link>
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{activity.name}</h1>
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

      {activity.stravaId && (
        <Button variant="outline" size="sm" asChild>
          <Link
            href={`https://www.strava.com/activities/${activity.stravaId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="gap-2"
          >
            Ver no Strava
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}
