"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, HelpCircle } from "lucide-react";

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
        <Card className={cn("w-full shadow-sm h-auto min-h-fit", className)}>
            <CardHeader className="pb-1 pt-4 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-1.5">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[200px] p-2 text-[11px]">
                                <p className="font-bold mb-1">Carga de Treinamento Crônica (CTL)</p>
                                <p>Representa sua condição física a longo prazo, baseada na média de carga das últimas 6 semanas.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="flex flex-col sm:flex-row items-baseline sm:items-end justify-between gap-2">
                    <div className="flex flex-col">
                        <p className="text-4xl font-black tracking-tighter text-foreground leading-none">
                            {totalValue}
                        </p>
                        <CardDescription className="flex items-center gap-1 mt-1">
                            {isPositive ? (
                                <TrendingUp className="h-3 w-3 text-emerald-500" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                            <span className={cn("text-xs font-bold", isPositive ? "text-emerald-500" : "text-red-500")}>
                                {isPositive ? "+" : ""}{trendPercent.toFixed(1)}%
                            </span>
                        </CardDescription>
                    </div>

                    <div className="flex h-12 w-full sm:w-36 items-end justify-between gap-1 overflow-hidden">
                        <TooltipProvider>
                            {data.map((item, index) => {
                                // Scaling: Map the range [baseline, maxValue] to [20%, 100%] height
                                const range = maxValue - baseline;
                                const heightPercent = range > 0
                                    ? 20 + ((item.value - baseline) / range) * 80
                                    : 100;

                                return (
                                    <div
                                        key={index}
                                        className="flex h-full flex-1 flex-col items-center justify-end gap-0.5"
                                    >
                                        <Tooltip delayDuration={0}>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className="w-full rounded-[1px] bg-blue-500/70 hover:bg-blue-600 transition-all cursor-help"
                                                    style={{
                                                        height: `${heightPercent}%`,
                                                    }}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="p-2">
                                                <div className="text-[10px]">
                                                    <p className="font-bold border-b pb-1 mb-1">{item.day}</p>
                                                    <p className="flex justify-between gap-4">
                                                        <span className="text-muted-foreground">CTL:</span>
                                                        <span className="font-mono font-bold">{item.value.toFixed(1)}</span>
                                                    </p>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                        <span className="text-[8px] leading-none text-muted-foreground font-medium uppercase">
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
