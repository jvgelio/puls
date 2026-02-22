"use client";

import { useMemo } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis
} from "recharts";
import { formatDuration } from "@/lib/utils/formatters";

interface StreamsPayload {
    type: string;
    data: any[];
}

interface ActivityChartsProps {
    streams: StreamsPayload[];
}

// Convert seconds per kilometer to a readable string (e.g., 5:30)
function formatPaceLabel(minutesPerKm: number) {
    if (!minutesPerKm || !isFinite(minutesPerKm) || minutesPerKm > 20) return "-";
    const mins = Math.floor(minutesPerKm);
    const secs = Math.round((minutesPerKm - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function ActivityCharts({ streams }: ActivityChartsProps) {
    const chartData = useMemo(() => {
        if (!streams || !Array.isArray(streams)) return [];

        const streamMap = streams.reduce((acc, stream) => {
            acc[stream.type] = stream.data;
            return acc;
        }, {} as Record<string, any[]>);

        // We need 'distance' or 'time' as the main X-axis
        const xData = streamMap.distance || streamMap.time;
        if (!xData) return [];

        return xData.map((xVal, index) => {
            // Calculate Pace (min/km) from velocity (m/s)
            let pace = null;
            if (streamMap.velocity_smooth && streamMap.velocity_smooth[index] > 0.5) {
                pace = (1000 / streamMap.velocity_smooth[index]) / 60;
                // Cap pace at 15 min/km for visualization reasons
                if (pace > 15) pace = 15;
            }

            return {
                x: typeof xVal === 'number' && streamMap.distance ? xVal / 1000 : xVal, // convert m to km
                time: streamMap.time ? streamMap.time[index] : null,
                heartrate: streamMap.heartrate ? streamMap.heartrate[index] : null,
                altitude: streamMap.altitude ? streamMap.altitude[index] : null,
                pace: pace,
            };
        });
    }, [streams]);

    if (chartData.length === 0) {
        return (
            <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-muted/10 rounded-md border border-dashed">
                <p className="text-muted-foreground text-sm">Dados de performance (streams) não encontrados.</p>
            </div>
        );
    }

    const hasHR = chartData.some(d => d.heartrate !== null);
    const hasPace = chartData.some(d => d.pace !== null);
    const hasElevation = chartData.some(d => d.altitude !== null);

    const formatXAxis = (val: any) => {
        if (typeof val === 'number') {
            return `${val.toFixed(1)} km`;
        }
        return val;
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            {hasHR && (
                <div className="flex flex-col gap-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Frequência Cardíaca</h4>
                    <div className="h-48 w-full border rounded-md p-4 bg-card">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                                <XAxis
                                    dataKey="x"
                                    tickFormatter={formatXAxis}
                                    minTickGap={50}
                                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                                />
                                <YAxis
                                    domain={['dataMin - 10', 'dataMax + 10']}
                                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                                    width={40}
                                />
                                <RechartsTooltip
                                    labelFormatter={(val) => `Distância: ${formatXAxis(val)}`}
                                    formatter={(val: any) => [`${val} bpm`, 'FC']}
                                    contentStyle={{ borderRadius: '8px', fontSize: '14px', border: '1px solid hsl(var(--border))' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="heartrate"
                                    stroke="#ef4444"
                                    fillOpacity={1}
                                    fill="url(#colorHr)"
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {hasPace && (
                <div className="flex flex-col gap-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Ritmo (Pace)</h4>
                    <div className="h-48 w-full border rounded-md p-4 bg-card">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorPace" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                                <XAxis
                                    dataKey="x"
                                    tickFormatter={formatXAxis}
                                    minTickGap={50}
                                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                                />
                                {/* Reversed Y-Axis for Pace (lower is faster/higher up on chart) */}
                                <YAxis
                                    reversed={true}
                                    domain={['auto', 'auto']}
                                    tickFormatter={formatPaceLabel}
                                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                                    width={45}
                                />
                                <RechartsTooltip
                                    labelFormatter={(val) => `Distância: ${formatXAxis(val)}`}
                                    formatter={(val: any) => [formatPaceLabel(val) + ' /km', 'Ritmo']}
                                    contentStyle={{ borderRadius: '8px', fontSize: '14px', border: '1px solid hsl(var(--border))' }}
                                />
                                <Area
                                    type="stepAfter"
                                    dataKey="pace"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#colorPace)"
                                    isAnimationActive={false}
                                    connectNulls
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {hasElevation && (
                <div className="flex flex-col gap-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Elevação</h4>
                    <div className="h-48 w-full border rounded-md p-4 bg-card">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorEle" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                                <XAxis
                                    dataKey="x"
                                    tickFormatter={formatXAxis}
                                    minTickGap={50}
                                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                                />
                                <YAxis
                                    domain={['auto', 'auto']}
                                    tickFormatter={(val) => `${val}m`}
                                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                                    width={45}
                                />
                                <RechartsTooltip
                                    labelFormatter={(val) => `Distância: ${formatXAxis(val)}`}
                                    formatter={(val: any) => [`${Number(val).toFixed(1)} m`, 'Elevação']}
                                    contentStyle={{ borderRadius: '8px', fontSize: '14px', border: '1px solid hsl(var(--border))' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="altitude"
                                    stroke="#8b5cf6"
                                    fillOpacity={1}
                                    fill="url(#colorEle)"
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
