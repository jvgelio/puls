"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Activity as ActivityIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AICoachInsightCard() {
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInsight();
    }, []);

    const fetchInsight = async (forceGenerate = false) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/coach-insight${forceGenerate ? "?force=1" : ""}`, {
                method: forceGenerate ? "POST" : "GET",
            });
            if (res.ok) {
                const data = await res.json();
                if (data.insight) {
                    setInsight(data.insight);
                } else if (!forceGenerate) {
                    // If no insight exists, generate one
                    fetchInsight(true);
                    return;
                }
            } else {
                if (forceGenerate) {
                    console.error("Coach Insight Error: API returned", res.status);
                    setInsight("Indisponível no momento. Tente novamente mais tarde.");
                }
            }
        } catch (error) {
            console.error("Failed to load coach insight", error);
            if (forceGenerate) {
                setInsight("Erro ao contactar a IA. Verifique sua conexão.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-primary/5 border-primary/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <ActivityIcon size={120} />
            </div>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center text-primary">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Coach
                </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
                {loading ? (
                    <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-primary/10 rounded w-full"></div>
                        <div className="h-4 bg-primary/10 rounded w-5/6"></div>
                    </div>
                ) : insight ? (
                    <div className="space-y-4">
                        <p className="text-sm leading-relaxed">{insight}</p>
                        <div className="flex justify-end">
                            <span className="text-[10px] text-muted-foreground uppercase opacity-70">
                                Análise do dia
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                            Nenhuma análise disponível.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchInsight(true)}
                            className="text-xs h-8"
                        >
                            <Sparkles className="w-3 h-3 mr-2" />
                            Gerar Insight
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
