"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceArea,
    ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TrainingLoadChartProps {
    data: {
        date: string;
        load: number;
        ctl: number;   // Fitness
        atl: number;   // Fatigue
        tsb: number;   // Form
    }[];
}

export function TrainingLoadChart({ data }: TrainingLoadChartProps) {
    if (!data || data.length === 0) return null;

    const lastItem = data[data.length - 1];
    const lastTsb = lastItem ? Math.round(lastItem.tsb) : 0;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Forma Atual (TSB)</CardTitle>
                <CardDescription>
                    Fique de olho na sua aptidão e recupere-se antes de provas. Ficar muito tempo no Alto Risco causa overtraining.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4 text-xs lg:text-sm font-medium mb-4 pr-4">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-400"></div>Transição (&gt;20)</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-cyan-400"></div>Descansado (5 a 20)</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gray-300"></div>Zona Cinza (-10 a 5)</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500"></div>Treino Ótimo (-30 a -10)</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400"></div>Alto Risco (&lt;-30)</div>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 10, right: 35, left: -20, bottom: 0 }}>
                                <ReferenceArea y1={20} y2={100} fill="#fbd38d" fillOpacity={0.2} />
                                <ReferenceArea y1={5} y2={20} fill="#9de0ad" fillOpacity={0.2} />
                                <ReferenceArea y1={-10} y2={5} fill="#e2e8f0" fillOpacity={0.2} />
                                <ReferenceArea y1={-30} y2={-10} fill="#68d391" fillOpacity={0.2} />
                                <ReferenceArea y1={-100} y2={-30} fill="#fc8181" fillOpacity={0.2} />

                                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted opacity-30" />
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
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    className="text-muted-foreground"
                                    domain={['auto', 'auto']}
                                    allowDataOverflow={false}
                                />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const d = payload[0].payload;
                                            const tsb = Math.round(d.tsb);
                                            let zoneStr = "Zona Cinza";
                                            let colorClass = "text-gray-600";

                                            if (tsb > 20) { zoneStr = "Transição"; colorClass = "text-orange-500"; }
                                            else if (tsb > 5) { zoneStr = "Descansado"; colorClass = "text-cyan-600"; }
                                            else if (tsb >= -10) { zoneStr = "Zona Cinza"; colorClass = "text-gray-600"; }
                                            else if (tsb >= -30) { zoneStr = "Treino Ótimo"; colorClass = "text-green-600"; }
                                            else { zoneStr = "Alto Risco"; colorClass = "text-red-500"; }

                                            return (
                                                <div className="rounded-lg border bg-background p-3 shadow-sm">
                                                    <div className="grid gap-1">
                                                        <span className="font-semibold text-sm mb-1">{format(new Date(d.date), "dd/MM/yyyy")}</span>
                                                        <span className={`text-sm font-bold ${colorClass}`}>
                                                            Forma (TSB): {tsb}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">{zoneStr}</span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />

                                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />

                                <Line
                                    type="monotone"
                                    dataKey="tsb"
                                    stroke="#1e293b"
                                    strokeWidth={3}
                                    dot={false}
                                    name="Forma"
                                    activeDot={{ r: 6, fill: "#1e293b", stroke: "#fff", strokeWidth: 2 }}
                                />
                                {/* Último valor da linha */}
                                {lastItem && (
                                    <ReferenceLine
                                        y={lastItem.tsb}
                                        stroke="transparent"
                                        label={{
                                            position: "right",
                                            value: `${lastTsb > 0 ? '+' : ''}${lastTsb}`,
                                            fill: "#1e293b",
                                            fontSize: 14,
                                            fontWeight: "bold"
                                        }}
                                    />
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
