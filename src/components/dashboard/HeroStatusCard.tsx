"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroStatusCardProps {
    tsb: number;
}

export function HeroStatusCard({ tsb }: HeroStatusCardProps) {
    const [insight, setInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [insightExpanded, setInsightExpanded] = useState(false);

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
                    fetchInsight(true);
                    return;
                }
            } else {
                if (forceGenerate) {
                    setInsight("Indisponível no momento. Tente novamente mais tarde.");
                }
            }
        } catch (error) {
            if (forceGenerate) setInsight("Erro ao contactar a IA. Verifique sua conexão.");
        } finally {
            setLoading(false);
        }
    };

    const roundedTsb = Math.round(tsb);

    // Determine Zone
    let zoneName = "Zona Cinza";
    let zoneColor = "bg-gray-500";
    let textColor = "text-gray-500";
    let lightBgColor = "bg-gray-500/10";
    let borderColor = "border-gray-500/20";

    if (roundedTsb > 20) {
        zoneName = "Transição"; zoneColor = "bg-orange-500"; textColor = "text-orange-500"; lightBgColor = "bg-orange-500/10"; borderColor = "border-orange-500/20";
    } else if (roundedTsb > 5) {
        zoneName = "Descansado"; zoneColor = "bg-cyan-500"; textColor = "text-cyan-500"; lightBgColor = "bg-cyan-500/10"; borderColor = "border-cyan-500/20";
    } else if (roundedTsb >= -10) {
        zoneName = "Zona Cinza"; zoneColor = "bg-gray-500"; textColor = "text-gray-500"; lightBgColor = "bg-gray-500/10"; borderColor = "border-gray-500/20";
    } else if (roundedTsb >= -30) {
        zoneName = "Treino Ótimo"; zoneColor = "bg-green-500"; textColor = "text-green-500"; lightBgColor = "bg-green-500/10"; borderColor = "border-green-500/20";
    } else {
        zoneName = "Alto Risco"; zoneColor = "bg-red-500"; textColor = "text-red-500"; lightBgColor = "bg-red-500/10"; borderColor = "border-red-500/20";
    }

    return (
        <Card className={`overflow-hidden border-t-4 ${borderColor}`} style={{ borderTopColor: `var(--${textColor.split('-')[1]}-500)` }}>
            <div className={`h-2 w-full ${zoneColor}`} />
            <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">

                    {/* Status do Dia (TSB) */}
                    <div className="col-span-1 space-y-4">
                        <div>
                            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Status do Dia</h2>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-4xl font-black ${textColor}`}>
                                    {roundedTsb > 0 ? "+" : ""}{roundedTsb}
                                </span>
                                <span className="text-xl font-bold bg-muted px-2 py-0.5 rounded-md text-muted-foreground">
                                    TSB
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`${textColor} ${lightBgColor} ${borderColor} font-bold text-sm px-3 py-1`}>
                                {zoneName}
                            </Badge>
                            <TooltipProvider>
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="w-64 p-3">
                                        <p className="text-sm font-semibold mb-1">Training Stress Balance (Forma)</p>
                                        <p className="text-xs text-muted-foreground">
                                            Indica sua aptidão para provas (positivo) ou risco de overtraining (muito negativo).
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    {/* AI Coach Insight */}
                    <div className={`col-span-1 lg:col-span-2 rounded-xl p-5 relative overflow-hidden ${lightBgColor} ${borderColor} border`}>
                        <div className={`absolute top-0 right-0 p-4 opacity-5 pointer-events-none ${textColor}`}>
                            <Sparkles size={120} />
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className={`w-5 h-5 ${textColor}`} />
                            <h3 className={`font-bold text-base ${textColor}`}>AI Coach</h3>
                        </div>

                        <div className="relative z-10">
                            {loading ? (
                                <div className="animate-pulse space-y-2">
                                    <div className={`h-4 ${textColor} opacity-20 rounded w-full`}></div>
                                    <div className={`h-4 ${textColor} opacity-20 rounded w-5/6`}></div>
                                </div>
                            ) : insight ? (
                                <div className="space-y-3">
                                    <p className={`text-sm md:text-base leading-relaxed text-foreground/90 transition-all duration-300 ${!insightExpanded ? "line-clamp-2 md:line-clamp-3" : ""}`}>
                                        {insight}
                                    </p>
                                    <button
                                        onClick={() => setInsightExpanded(!insightExpanded)}
                                        className={`text-xs font-semibold flex items-center gap-1 ${textColor} hover:opacity-80 transition-opacity`}
                                    >
                                        {insightExpanded ? (
                                            <>Menos <ChevronUp className="w-3 h-3" /></>
                                        ) : (
                                            <>Ler tudo <ChevronDown className="w-3 h-3" /></>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-start gap-2">
                                    <p className="text-sm text-muted-foreground">Nenhuma análise disponível para hoje.</p>
                                    <Button variant="outline" size="sm" onClick={() => fetchInsight(true)} className="h-8 text-xs">
                                        <Sparkles className="w-3 h-3 mr-2" />
                                        Gerar Análise
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
}
