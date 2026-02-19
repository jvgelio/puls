"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Activity } from "@/lib/db/schema";

interface WeeklyChartProps {
  activities: Activity[];
}

export function WeeklyChart({ activities }: WeeklyChartProps) {
  // Get last 4 weeks of data
  const now = new Date();
  const weeks: { name: string; distance: number; time: number }[] = [];

  for (let i = 3; i >= 0; i--) {
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

    const totalDistance = weekActivities.reduce(
      (sum, a) => sum + (parseFloat(a.distanceMeters || "0") || 0) / 1000,
      0
    );

    const totalTime = weekActivities.reduce(
      (sum, a) => sum + (a.movingTimeSeconds || 0) / 3600,
      0
    );

    const weekLabel =
      i === 0
        ? "Esta semana"
        : i === 1
          ? "Semana passada"
          : `${i} semanas`;

    weeks.push({
      name: weekLabel,
      distance: Math.round(totalDistance * 10) / 10,
      time: Math.round(totalTime * 10) / 10,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Volume Semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeks}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                label={{
                  value: "km",
                  angle: -90,
                  position: "insideLeft",
                  className: "text-muted-foreground",
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Distância
                            </span>
                            <span className="font-bold">
                              {payload[0].value} km
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Tempo
                            </span>
                            <span className="font-bold">
                              {payload[0].payload.time}h
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="distance"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
