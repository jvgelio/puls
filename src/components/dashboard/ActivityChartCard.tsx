"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import type { Activity } from "@/lib/db/schema";
import { formatDistance, formatDuration } from "@/lib/utils/formatters";

interface ActivityChartCardProps {
    activities: Activity[];
}

export function ActivityChartCard({ activities }: ActivityChartCardProps) {
    const weeks = useMemo(() => {
        const now = new Date();
        const weeksData: { name: string; distance: number; time: number; rawDistance: number }[] = [];

        // Last 8 weeks
        for (let i = 7; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay() - i * 7);
            weekStart.setHours(0, 0, 0, 0);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);

            const weekActivities = activities.filter((a) => {
                if (!a.startDate) return false;
                const date = new Date(a.startDate);
                return date >= weekStart && date <= weekEnd;
            });

            const totalDistanceMeter = weekActivities.reduce(
                (sum, a) => sum + (parseFloat(a.distanceMeters || "0") || 0),
                0
            );

            const totalTimeStr = weekActivities.reduce(
                (sum, a) => sum + (a.movingTimeSeconds || 0),
                0
            );

            const weekLabel = i === 0 ? "Atual" : i === 1 ? "-1" : `-${i}`;

            weeksData.push({
                name: weekLabel,
                distance: Math.round(totalDistanceMeter / 100) / 10, // km with 1 decimal
                rawDistance: totalDistanceMeter,
                time: totalTimeStr,
            });
        }
        return weeksData;
    }, [activities]);

    const thisWeek = weeks[weeks.length - 1].rawDistance;
    const lastWeek = weeks[weeks.length - 2].rawDistance;
    const trendPercent =
        lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : thisWeek > 0 ? 100 : 0;

    const isPositive = trendPercent >= 0;
    const trendString = `${isPositive ? "↑ +" : "↓ "}${trendPercent.toFixed(1)}% vs semana passada`;

    return (
        <Card className="flex flex-col col-span-1 lg:col-span-3">
            <CardHeader>
                <CardTitle>Volume de Treino (8 semanas)</CardTitle>
                <CardDescription className={`font-medium ${isPositive ? "text-green-600" : "text-amber-600"}`}>
                    {trendString}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeks} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} className="text-muted-foreground" />
                            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} className="text-muted-foreground" />
                            <Tooltip
                                cursor={{ fill: "hsl(var(--muted)/0.5)" }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="rounded-lg border bg-background p-3 shadow-sm">
                                                <div className="grid gap-1">
                                                    <span className="font-semibold">{data.name === "Atual" ? "Esta Semana" : `Semana ${data.name}`}</span>
                                                    <span className="text-sm">Distância: <strong>{formatDistance(data.distance)}</strong></span>
                                                    <span className="text-sm">Tempo: <strong>{formatDuration(data.time)}</strong></span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="distance" radius={[4, 4, 0, 0]} animationDuration={1000}>
                                {weeks.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={index === weeks.length - 1 ? "hsl(var(--primary))" : "hsl(var(--primary)/0.6)"}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
