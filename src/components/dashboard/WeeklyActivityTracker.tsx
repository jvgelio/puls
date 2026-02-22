"use client";

import { useMemo } from "react";
import type { Activity } from "@/lib/db/schema";
import { SPORT_COLORS } from "@/lib/utils/sport-colors";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getSportDisplayName } from "@/lib/utils/formatters";

interface WeeklyActivityTrackerProps {
    recentActivities: Activity[];
}

export function WeeklyActivityTracker({ recentActivities }: WeeklyActivityTrackerProps) {
    const days = useMemo(() => {
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() - 6 + i);
            d.setHours(0, 0, 0, 0);
            return d;
        });

        return last7Days.map((date) => {
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const dayActivities = recentActivities.filter((a) => {
                if (!a.startDate) return false;
                const aDate = new Date(a.startDate);
                return aDate >= date && aDate <= endOfDay;
            });

            // Get main sport (by moving time or just the first)
            const mainSport = dayActivities.length > 0
                ? [...dayActivities].sort((a, b) => (b.movingTimeSeconds || 0) - (a.movingTimeSeconds || 0))[0]
                : null;

            const colors = mainSport && mainSport.sportType && SPORT_COLORS[mainSport.sportType]
                ? SPORT_COLORS[mainSport.sportType]
                : SPORT_COLORS.default;

            const fullLabel = format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
            const activityCount = dayActivities.length;
            const mainSportName = mainSport ? getSportDisplayName(mainSport.sportType || "Treino") : "";

            return {
                date,
                label: format(date, "eee", { locale: ptBR }),
                fullLabel,
                activityCount,
                mainSportName,
                hasTraining: dayActivities.length > 0,
                activities: dayActivities,
                colors,
            };
        });
    }, [recentActivities]);

    return (
        <div className="w-full bg-card border rounded-lg p-4 shadow-sm mb-8">
            <TooltipProvider>
                <div className="flex justify-between items-center px-2">
                    {days.map((day, i) => (
                        <Tooltip key={i} delayDuration={100}>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105 appearance-none bg-transparent border-0 p-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg outline-none"
                                    aria-label={`${day.fullLabel}: ${day.hasTraining ? `${day.activityCount} atividades, principal: ${day.mainSportName}` : "Nenhuma atividade"}`}
                                >
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all"
                                        style={{
                                            backgroundColor: day.hasTraining ? day.colors.dot : "transparent",
                                            borderColor: day.hasTraining ? day.colors.dot : "hsl(var(--muted))",
                                        }}
                                    />
                                    <span className="text-xs uppercase text-muted-foreground font-medium">
                                        {day.label}
                                    </span>
                                </button>
                            </TooltipTrigger>
                            {day.hasTraining && (
                                <TooltipContent>
                                    <div className="text-sm px-1 py-0.5">
                                        {day.activities.map((a, j) => (
                                            <div key={j} className="flex flex-col">
                                                <span className="font-semibold">{a.name}</span>
                                                <span className="text-xs text-muted-foreground">{a.sportType}</span>
                                            </div>
                                        ))}
                                    </div>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    ))}
                </div>
            </TooltipProvider>
        </div>
    );
}
