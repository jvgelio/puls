"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDistanceFromMeters } from "@/lib/utils/formatters";
import { Target, TrendingUp, Activity } from "lucide-react";

interface GoalsCardProps {
    currentFitness: number;
    weeklyDistanceMeters: number;
}

export function GoalsCard({ currentFitness, weeklyDistanceMeters }: GoalsCardProps) {
    // Hardcoded goals for now - these could be fetched from DB/settings later
    const TARGET_FITNESS = 80;
    const TARGET_WEEKLY_KM = 40;

    const currentWeeklyKm = weeklyDistanceMeters / 1000;

    const fitnessProgress = Math.min((currentFitness / TARGET_FITNESS) * 100, 100);
    const volumeProgress = Math.min((currentWeeklyKm / TARGET_WEEKLY_KM) * 100, 100);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Metas 2026
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center gap-6">

                {/* Weekly Volume Goal */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 font-medium text-muted-foreground">
                            <Activity className="w-4 h-4" /> Volume Semanal
                        </span>
                        <span className="font-bold">
                            {formatDistanceFromMeters(weeklyDistanceMeters)} <span className="text-muted-foreground font-normal text-xs">/ {TARGET_WEEKLY_KM}km</span>
                        </span>
                    </div>
                    <Progress value={volumeProgress} className="h-2 bg-blue-100 dark:bg-blue-950" indicatorColor="bg-blue-500" />
                    <p className="text-[10px] text-muted-foreground text-right">
                        {volumeProgress >= 100 ? 'Meta atingida!' : `${(TARGET_WEEKLY_KM - currentWeeklyKm).toFixed(1)}km restantes`}
                    </p>
                </div>

                {/* CTL/Fitness Goal */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 font-medium text-muted-foreground">
                            <TrendingUp className="w-4 h-4" /> Forma Física (CTL)
                        </span>
                        <span className="font-bold">
                            {Math.round(currentFitness)} <span className="text-muted-foreground font-normal text-xs">/ {TARGET_FITNESS}</span>
                        </span>
                    </div>
                    <Progress value={fitnessProgress} className="h-2 bg-emerald-100 dark:bg-emerald-950" indicatorColor="bg-emerald-500" />
                    <p className="text-[10px] text-muted-foreground text-right">
                        {fitnessProgress >= 100 ? 'Meta atingida!' : `${Math.round(TARGET_FITNESS - currentFitness)} pontos restantes`}
                    </p>
                </div>

            </CardContent>
        </Card>
    );
}
