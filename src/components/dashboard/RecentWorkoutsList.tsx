"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Activity } from "@/lib/db/schema";
import {
    formatDistanceFromMeters,
    formatDuration,
} from "@/lib/utils/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronRight } from "lucide-react";
import { SportIcon } from "@/components/ui/sport-icon";

interface RecentWorkoutsListProps {
    activities: Activity[];
}

export function RecentWorkoutsList({ activities }: RecentWorkoutsListProps) {
    if (activities.length === 0) {
        return (
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="text-lg">Últimos Treinos</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Nenhuma atividade recente.</p>
                </CardContent>
            </Card>
        );
    }

    // Show only up to 4 recent activities to keep it compact
    const displayActivities = activities.slice(0, 4);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Últimos Treinos</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                <div className="flex flex-col">
                    {displayActivities.map((activity, index) => {
                        const distance = parseFloat(activity.distanceMeters || "0");
                        const duration = activity.movingTimeSeconds || 0;

                        // Choose main metric: Use distance if > 0, else use duration
                        const mainMetric = distance > 0
                            ? formatDistanceFromMeters(distance)
                            : formatDuration(duration);

                        return (
                            <Link
                                key={activity.id}
                                href={`/dashboard/activity/${activity.id}`}
                                className={`flex items-center justify-between p-4 hover:bg-muted/50 transition-colors ${index !== displayActivities.length - 1 ? "border-b" : ""
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-muted w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground">
                                        <SportIcon sportType={activity.sportType} className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm line-clamp-1">{activity.name}</span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            {activity.startDate ? format(new Date(activity.startDate), "dd MMM (EEE)", { locale: ptBR }) : ""}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">
                                        {mainMetric}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </CardContent>
            <CardFooter className="p-0 border-t mt-auto">
                <Button variant="ghost" className="w-full rounded-none h-12 text-primary text-sm hover:bg-primary/5 hover:text-primary transition-colors" asChild>
                    <Link href="/activities">
                        Ver todas as atividades
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
