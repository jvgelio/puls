"use client";

import { StatCard } from "@/components/patterns";
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
      icon: <Footprints />,
    },
    {
      title: "Tempo",
      value: formatDurationHuman(stats.totalTime),
      description: "Em movimento",
      icon: <Clock />,
    },
    {
      title: "Treinos",
      value: stats.totalActivities.toString(),
      description: "Esta semana",
      icon: <BarChart />,
    },
    {
      title: "Calorias",
      value: formatCalories(stats.totalCalories),
      description: "Queimadas",
      icon: <Flame />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          description={card.description}
          icon={card.icon}
        />
      ))}
    </div>
  );
}
