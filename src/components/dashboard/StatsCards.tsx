"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footprints, Clock, BarChart, Flame } from "lucide-react";
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
      icon: <Footprints className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Tempo",
      value: formatDurationHuman(stats.totalTime),
      description: "Em movimento",
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Treinos",
      value: stats.totalActivities.toString(),
      description: "Esta semana",
      icon: <BarChart className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Calorias",
      value: formatCalories(stats.totalCalories),
      description: "Queimadas",
      icon: <Flame className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            {card.icon}
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
