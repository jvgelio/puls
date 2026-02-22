"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, subDays, eachDayOfInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

import { ChartCard } from "@/components/patterns";

interface HeatmapProps {
    activities: { date: Date | string; load: number; count: number }[];
    days?: number;
    title?: string;
    description?: string;
}

export function ActivityHeatmap({
    activities,
    days = 90,
    title = "Consistência",
    description
}: HeatmapProps) {
    const { grid, maxLoad } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startDate = subDays(today, days - 1); // Get roughly past 3 months

        // Ensure start date aligns with Sunday to make a perfect grid
        while (startDate.getDay() !== 0) {
            startDate.setDate(startDate.getDate() - 1);
        }

        const dateRange = eachDayOfInterval({ start: startDate, end: today });

        const activityMap = new Map();
        let maxLoadValue = 0;

        activities.forEach(act => {
            const dateObj = act.date instanceof Date ? act.date : new Date(act.date);
            const dateStr = dateObj.toISOString().split("T")[0];
            // Normalize act to ensure date is a Date object
            activityMap.set(dateStr, { ...act, date: dateObj });
            if (act.load > maxLoadValue) maxLoadValue = act.load;
        });

        const gridData: { date: Date; load: number; count: number }[][] = [];
        let currentWeek: { date: Date; load: number; count: number }[] = [];

        dateRange.forEach(date => {
            const dateStr = date.toISOString().split("T")[0];
            const data = activityMap.get(dateStr) || { date, load: 0, count: 0 };

            currentWeek.push(data);

            if (date.getDay() === 6 || isSameDay(date, today)) {
                // Pad the last week if it doesn't end on Saturday
                while (currentWeek.length < 7 && currentWeek.length > 0 && isSameDay(date, today)) {
                    const nextDate = new Date(currentWeek[currentWeek.length - 1].date);
                    nextDate.setDate(nextDate.getDate() + 1);
                    currentWeek.push({ date: nextDate, load: 0, count: 0 });
                }
                gridData.push(currentWeek);
                currentWeek = [];
            }
        });

        return { grid: gridData, maxLoad: maxLoadValue || 1 }; // prevent div by 0
    }, [activities, days]);

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Tailwind colors for heatmap intensities
    const getColor = (load: number) => {
        if (load === 0) return "bg-muted/30";

        const intensity = load / maxLoad;
        if (intensity < 0.25) return "bg-emerald-200 dark:bg-emerald-900/40";
        if (intensity < 0.5) return "bg-emerald-400 dark:bg-emerald-700/60";
        if (intensity < 0.75) return "bg-emerald-500 dark:bg-emerald-600/80";
        return "bg-emerald-600 dark:bg-emerald-500";
    };

    const months = useMemo(() => {
        const result: { label: string; colSpan: number }[] = [];
        let currentMonth = "";
        let spanCount = 0;

        grid.forEach((week) => {
            const monthStr = format(week[0].date, "MMM", { locale: ptBR });
            if (monthStr !== currentMonth) {
                if (currentMonth !== "") {
                    result.push({ label: currentMonth, colSpan: spanCount });
                }
                currentMonth = monthStr;
                spanCount = 1;
            } else {
                spanCount++;
            }
        });
        if (currentMonth !== "") {
            result.push({ label: currentMonth, colSpan: spanCount });
        }
        return result;
    }, [grid]);

    return (
        <ChartCard
            title={title}
            description={description || `Últimos ${days} dias de atividade`}
            className="flex flex-col h-full overflow-hidden"
            contentClassName="flex-1 flex flex-col justify-center pb-4 pt-2 overflow-hidden"
        >
            {!mounted ? (
                <div className="flex h-[115px] items-center justify-center">
                    <span className="text-xs text-muted-foreground animate-pulse">Carregando mapa de calor...</span>
                </div>
            ) : (
                <>
                    <div className="w-full">
                        <div className="flex text-xs text-muted-foreground mb-2 ml-[30px]">
                            {months.map((m, i) => (
                                <div key={i} style={{ width: `${m.colSpan * 14}px`, minWidth: `${m.colSpan * 14}px` }} className="capitalize text-left">
                                    {m.label}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-1 h-[105px]">
                            <div className="grid grid-rows-7 gap-1 text-[9px] text-muted-foreground pr-1 w-7 items-center">
                                <span>Dom</span>
                                <span className="opacity-0">Seg</span>
                                <span>Ter</span>
                                <span className="opacity-0">Qua</span>
                                <span>Qui</span>
                                <span className="opacity-0">Sex</span>
                                <span>Sáb</span>
                            </div>

                            <div className="flex gap-1">
                                {grid.map((week, weekIdx) => (
                                    <div key={weekIdx} className="grid grid-rows-7 gap-1">
                                        {week.map((day, dayIdx) => (
                                            <div
                                                key={dayIdx}
                                                className={`w-[10px] h-[10px] md:w-[11px] md:h-[11px] rounded-[1.5px] ${getColor(day.load)} transition-colors hover:ring-1 hover:ring-primary/50 relative group cursor-pointer`}
                                            >
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 p-2 hidden group-hover:block z-50 pointer-events-none">
                                                    <div className="bg-popover text-popover-foreground text-xs rounded px-2 py-1 shadow-md border whitespace-nowrap">
                                                        <span className="font-semibold block">{format(day.date, "dd MMM yyyy", { locale: ptBR })}</span>
                                                        {day.count > 0 ? (
                                                            <span>{day.count} treino(s) • Carga: <span className="font-mono text-emerald-500">{Math.round(day.load)}</span></span>
                                                        ) : (
                                                            <span className="text-muted-foreground">Descanso</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end text-xs text-muted-foreground gap-1.5 w-full">
                        <span>Menos</span>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 rounded-[2px] bg-muted/30"></div>
                            <div className="w-3 h-3 rounded-[2px] bg-emerald-200 dark:bg-emerald-900/40"></div>
                            <div className="w-3 h-3 rounded-[2px] bg-emerald-400 dark:bg-emerald-700/60"></div>
                            <div className="w-3 h-3 rounded-[2px] bg-emerald-500 dark:bg-emerald-600/80"></div>
                            <div className="w-3 h-3 rounded-[2px] bg-emerald-600 dark:bg-emerald-500"></div>
                        </div>
                        <span>Mais</span>
                    </div>
                </>
            )}
        </ChartCard>
    );
}
