"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TrainingLoadChartProps {
    data: {
        date: string;
        load: number;
        upper: number;
        lower: number;
    }[];
}

export function TrainingLoadChart({ data }: TrainingLoadChartProps) {
    if (!data || data.length === 0) return null;

    return (
        <Card className="col-span-1 lg:col-span-4 w-full">
            <CardHeader>
                <CardTitle>Carga de Treino</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                className="text-muted-foreground"
                                tickFormatter={(val) => {
                                    try {
                                        return format(new Date(val), "dd/MM", { locale: ptBR })
                                    } catch {
                                        return val;
                                    }
                                }}
                            />
                            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} className="text-muted-foreground" />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-3 shadow-sm">
                                                <div className="grid gap-1">
                                                    <span className="font-semibold text-sm">{format(new Date(payload[0].payload.date), "dd/MM/yyyy")}</span>
                                                    <span className="text-sm font-bold text-primary">Carga: {Math.round(payload[0].payload.load)}</span>
                                                    <span className="text-xs text-muted-foreground">Overtraining: {Math.round(payload[0].payload.upper)}</span>
                                                    <span className="text-xs text-muted-foreground">Undertraining: {Math.round(payload[0].payload.lower)}</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="upper"
                                stroke="hsl(var(--muted-foreground))"
                                strokeDasharray="4 4"
                                dot={false}
                                strokeWidth={1.5}
                                name="Overtraining"
                            />
                            <Line
                                type="monotone"
                                dataKey="load"
                                stroke="hsl(var(--primary))"
                                strokeWidth={3}
                                dot={{ r: 2, fill: "hsl(var(--primary))" }}
                                name="Carga"
                            />
                            <Line
                                type="monotone"
                                dataKey="lower"
                                stroke="hsl(var(--muted-foreground))"
                                strokeDasharray="4 4"
                                dot={false}
                                strokeWidth={1.5}
                                name="Undertraining"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
