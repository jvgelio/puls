"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { Trophy, Medal, Timer, Activity } from "lucide-react";

interface PRRecord {
    pace: number; // min/km
    date: Date;
    activityId: string;
}

interface PersonalRecordsProps {
    records: Record<string, PRRecord | null>;
}

export function PersonalRecordsCard({ records }: PersonalRecordsProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const formatPace = (decimalPace: number) => {
        const mins = Math.floor(decimalPace);
        const secs = Math.round((decimalPace - mins) * 60);
        return `${mins}:${secs.toString().padStart(2, "0")}/km`;
    };

    const calculateTime = (distanceKm: number, decimalPace: number) => {
        const totalMinutes = distanceKm * decimalPace;
        const hours = Math.floor(totalMinutes / 60);
        const mins = Math.floor(totalMinutes % 60);
        const secs = Math.round((totalMinutes - Math.floor(totalMinutes)) * 60);

        if (hours > 0) {
            return `${hours}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
        }
        return `${mins}m ${secs.toString().padStart(2, "0")}s`;
    };

    const distances = [
        { key: "1km", label: "1 km", distance: 1, icon: <Activity className="w-4 h-4 text-emerald-500" /> },
        { key: "5km", label: "5 km", distance: 5, icon: <Medal className="w-4 h-4 text-emerald-500" /> },
        { key: "10km", label: "10 km", distance: 10, icon: <Medal className="w-4 h-4 text-amber-500" /> },
        { key: "halfMarathon", label: "Meia Maratona", distance: 21.0975, icon: <Trophy className="w-4 h-4 text-slate-400" /> },
        { key: "marathon", label: "Maratona", distance: 42.195, icon: <Trophy className="w-4 h-4 text-yellow-500" /> },
    ];

    const hasRecords = distances.some(d => records[d.key]);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-emerald-500" />
                    Recordes Pessoais (Corrida)
                </CardTitle>
                <CardDescription>Seus melhores ritmos em distâncias chave</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
                {!mounted ? (
                    <div className="flex h-full items-center justify-center p-6">
                        <span className="text-xs text-muted-foreground animate-pulse">Carregando recordes...</span>
                    </div>
                ) : !hasRecords ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
                        <Trophy className="w-12 h-12 mb-2 opacity-20" />
                        <p>Ainda não há recordes suficientes de corrida para exibir.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {distances.map((dist) => {
                            const record = records[dist.key];
                            if (!record) return null;

                            return (
                                <div key={dist.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-background rounded-full border shadow-sm">
                                            {dist.icon}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{dist.label}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Timer className="w-3 h-3" />
                                                {calculateTime(dist.distance, record.pace)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-mono font-bold text-emerald-500">{formatPace(record.pace)}</p>
                                        <Link href={`/dashboard/activity/${record.activityId}`} className="text-[10px] text-muted-foreground hover:text-emerald-500 hover:underline transition-colors block">
                                            {format(new Date(record.date), "dd MMM yyyy", { locale: ptBR })}
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
