"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Activity, AIFeedback } from "@/lib/db/schema";
import {
    formatDistanceFromMeters,
    formatDuration,
    formatPace,
    formatRelativeTime,
    getSportDisplayName,
} from "@/lib/utils/formatters";
import { ChevronRight } from "lucide-react";
import { SPORT_COLORS } from "@/lib/utils/sport-colors";
import { SportIcon } from "@/components/ui/sport-icon";

interface LastActivityCardProps {
    activity?: Activity & { feedback?: AIFeedback | null };
}

export function LastActivityCard({ activity }: LastActivityCardProps) {
    if (!activity) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Última Atividade</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Nenhuma atividade recente.</p>
                </CardContent>
            </Card>
        );
    }

    const distanceKm = parseFloat(activity.distanceMeters || "0") / 1000;
    const pace = formatPace(activity.movingTimeSeconds || 0, distanceKm);

    const colors = activity.sportType && SPORT_COLORS[activity.sportType]
        ? SPORT_COLORS[activity.sportType]
        : SPORT_COLORS.default;

    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg font-bold">Última Atividade</CardTitle>
                <span className="text-xs text-muted-foreground">
                    {activity.startDate ? formatRelativeTime(activity.startDate) : ""}
                </span>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${colors.bg} ${colors.text}`}>
                        <SportIcon sportType={activity.sportType} className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-base line-clamp-1">{activity.name}</h3>
                        <Badge variant="secondary" className="mt-1 text-xs font-normal">
                            {getSportDisplayName(activity.sportType || "Treino")}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase">Distância</span>
                        <span className="text-lg font-bold">
                            {formatDistanceFromMeters(parseFloat(activity.distanceMeters || "0"))}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase">Tempo</span>
                        <span className="text-lg font-bold">
                            {formatDuration(activity.movingTimeSeconds || 0)}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase">Ritmo</span>
                        <span className="text-lg font-bold">{pace}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase">FC Média</span>
                        <span className="text-lg font-bold">
                            {activity.averageHeartrate ? `${Math.round(parseFloat(activity.averageHeartrate))} bpm` : "-"}
                        </span>
                    </div>
                </div>

                {activity.feedback?.summary && (
                    <div className="mt-2 bg-muted/50 p-3 rounded-md">
                        <p className="text-sm italic text-muted-foreground line-clamp-2">
                            "{activity.feedback.summary}"
                        </p>
                    </div>
                )}

                <Link
                    href={`/dashboard/activity/${activity.id}`}
                    className="mt-auto group flex items-center justify-between w-full text-sm font-medium text-primary pt-2 border-t"
                >
                    Ver detalhes da atividade
                    <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
            </CardContent>
        </Card>
    );
}
