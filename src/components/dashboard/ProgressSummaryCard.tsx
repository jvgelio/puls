"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceFromMeters, formatDuration } from "@/lib/utils/formatters";

interface ProgressSummaryCardProps {
    stats: {
        totalDistance: number;
        totalTime: number;
        totalActivities: number;
        totalElevation: number;
    };
}

export function ProgressSummaryCard({ stats }: ProgressSummaryCardProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Resumo do Mês</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-muted/30 p-2 rounded-md">
                        <span className="text-sm text-muted-foreground">Atividades</span>
                        <span className="font-medium">{stats.totalActivities}</span>
                    </div>
                    <div className="flex justify-between items-center bg-muted/30 p-2 rounded-md">
                        <span className="text-sm text-muted-foreground">Distância</span>
                        <span className="font-medium">{formatDistanceFromMeters(stats.totalDistance * 1000)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-muted/30 p-2 rounded-md">
                        <span className="text-sm text-muted-foreground">Tempo em Mov.</span>
                        <span className="font-medium">{formatDuration(stats.totalTime)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-muted/30 p-2 rounded-md">
                        <span className="text-sm text-muted-foreground">Elevação (D+)</span>
                        <span className="font-medium">{Math.round(stats.totalElevation)} m</span>
                    </div>

                    <Button variant="secondary" className="w-full mt-2" asChild>
                        <Link href="/activities">Ver histórico completo</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
