"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Activity } from "@/lib/db/schema";
import {
  formatDistanceFromMeters,
  formatDuration,
  formatPace,
  formatSpeed,
  formatHeartRate,
  formatElevation,
  formatCadence,
  formatCalories,
} from "@/lib/utils/formatters";

interface MetricsGridProps {
  activity: Activity;
}

export function MetricsGrid({ activity }: MetricsGridProps) {
  const distanceKm = parseFloat(activity.distanceMeters || "0") / 1000;
  const movingTime = activity.movingTimeSeconds || 0;
  const elapsedTime = activity.elapsedTimeSeconds || 0;

  const metrics = [
    {
      label: "Distância",
      value: formatDistanceFromMeters(
        parseFloat(activity.distanceMeters || "0")
      ),
    },
    {
      label: "Tempo em Movimento",
      value: formatDuration(movingTime),
    },
    {
      label: "Tempo Total",
      value: formatDuration(elapsedTime),
    },
    {
      label: "Pace Médio",
      value: formatPace(movingTime, distanceKm),
    },
    {
      label: "Velocidade Média",
      value: activity.averageSpeed
        ? formatSpeed(parseFloat(activity.averageSpeed))
        : "N/A",
    },
    {
      label: "Velocidade Máxima",
      value: activity.maxSpeed
        ? formatSpeed(parseFloat(activity.maxSpeed))
        : "N/A",
    },
    {
      label: "FC Média",
      value: activity.averageHeartrate
        ? formatHeartRate(parseFloat(activity.averageHeartrate))
        : "N/A",
    },
    {
      label: "FC Máxima",
      value: activity.maxHeartrate
        ? formatHeartRate(parseFloat(activity.maxHeartrate))
        : "N/A",
    },
    {
      label: "Elevação",
      value: activity.totalElevationGain
        ? formatElevation(parseFloat(activity.totalElevationGain))
        : "N/A",
    },
    {
      label: "Cadência",
      value: activity.averageCadence
        ? formatCadence(
            parseFloat(activity.averageCadence),
            activity.sportType || undefined
          )
        : "N/A",
    },
    {
      label: "Calorias",
      value: activity.calories ? formatCalories(activity.calories) : "N/A",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <div key={metric.label} className="space-y-1">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-xl font-semibold">{metric.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
