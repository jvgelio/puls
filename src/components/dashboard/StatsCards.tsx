"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatDistanceFromMeters,
  formatDurationHuman,
  formatCalories,
} from "@/lib/utils/formatters";

interface StatsCardsProps {
  stats: {
    totalDistance: number;
    totalTime: number;
    totalActivities: number;
    totalCalories: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Distância",
      value: formatDistanceFromMeters(stats.totalDistance),
      description: "Esta semana",
    },
    {
      title: "Tempo",
      value: formatDurationHuman(stats.totalTime),
      description: "Em movimento",
    },
    {
      title: "Treinos",
      value: stats.totalActivities.toString(),
      description: "Esta semana",
    },
    {
      title: "Calorias",
      value: formatCalories(stats.totalCalories),
      description: "Queimadas",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
