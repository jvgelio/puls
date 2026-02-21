"use client";

import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface FitnessDataPoint {
    day: string;
    value: number; // Fitness (CTL)
}

interface FitnessChartCardProps {
    title?: string;
    totalValue: string;
    trendPercent: number;
    data: FitnessDataPoint[];
    className?: string;
}

export const FitnessChartCard = ({
    title = "Fitness (CTL)",
    totalValue,
    trendPercent,
    data,
    className,
}: FitnessChartCardProps) => {

    const { minValue, maxValue } = React.useMemo(() => {
        if (!data.length) return { minValue: 0, maxValue: 1 };
        const vals = data.map(d => d.value);
        return {
            minValue: Math.min(...vals),
            maxValue: Math.max(...vals)
        };
    }, [data]);

    const isPositive = trendPercent >= 0;

    // To make the slow-moving Fitness metric visually interesting, 
    // we zoom in on the variation by setting a baseline just below the minimum value.
    const baseline = minValue * 0.95;

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader className="pb-2">
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 sm:gap-4">
                    <div className="flex flex-col flex-1">
                        <p className="text-5xl font-bold tracking-tighter text-foreground">
                            {totalValue}
                        </p>
                        <CardDescription className="flex items-center gap-1 mt-2">
                            {isPositive ? (
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span className={isPositive ? "text-emerald-500 font-medium" : "text-red-500 font-medium"}>
                                {isPositive ? "+" : ""}{trendPercent.toFixed(1)}%
                            </span>
                            <span className="text-xs">vs semana passada</span>
                        </CardDescription>
                    </div>

                    <div className="flex h-24 w-full sm:w-48 items-end justify-between gap-1 ml-auto">
                        <TooltipProvider>
                            {data.map((item, index) => {
                                // Scaling: Map the range [baseline, maxValue] to [10%, 100%] height
                                const range = maxValue - baseline;
                                const heightPercent = range > 0
                                    ? 10 + ((item.value - baseline) / range) * 90
                                    : 100;

                                return (
                                    <div
                                        key={index}
                                        className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                                    >
                                        <Tooltip delayDuration={0}>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className="w-full rounded-sm bg-blue-500/80 hover:bg-blue-600 transition-all cursor-help"
                                                    style={{
                                                        height: `${heightPercent}%`,
                                                    }}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="p-2">
                                                <div className="text-xs">
                                                    <p className="font-bold border-b pb-1 mb-1">{item.day}</p>
                                                    <p className="flex justify-between gap-4">
                                                        <span className="text-muted-foreground">Fitness:</span>
                                                        <span className="font-mono font-bold">{item.value.toFixed(1)}</span>
                                                    </p>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                        <span className="text-[10px] text-muted-foreground font-medium uppercase">
                                            {item.day}
                                        </span>
                                    </div>
                                );
                            })}
                        </TooltipProvider>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
