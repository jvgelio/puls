"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
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

    // Determine Zone using semantic tokens
    let zoneName = "Zona Cinza";
    let zoneVar = "zone-neutral";

    if (roundedTsb > 20) {
        zoneName = "Transição";
        zoneVar = "zone-transition";
    } else if (roundedTsb > 5) {
        zoneName = "Descansado";
        zoneVar = "zone-fresh";
    } else if (roundedTsb >= -10) {
        zoneName = "Zona Cinza";
        zoneVar = "zone-neutral";
    } else if (roundedTsb >= -30) {
        zoneName = "Treino Ótimo";
        zoneVar = "zone-optimal";
    } else {
        zoneName = "Alto Risco";
        zoneVar = "zone-risk";
    }

    const zoneColor = `var(--${zoneVar})`;
    const lightBgColor = `oklch(from var(--${zoneVar}) l c h / 0.1)`;
    const borderColor = `oklch(from var(--${zoneVar}) l c h / 0.2)`;
    const textColor = `var(--${zoneVar})`;

    return (
        <Card className="overflow-hidden border-t-4 h-full" style={{ borderTopColor: zoneColor, borderColor: borderColor }}>
            <CardHeader className="pb-1 pt-4 flex flex-row items-center justify-between space-y-0 relative z-10 bg-card">
                <div className="flex items-center gap-1.5">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Status do Dia</CardTitle>
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[280px] p-3 text-xs leading-relaxed">
                                <p className="font-bold mb-1.5 border-b pb-1 text-[13px]">Balanço de Estresse (TSB)</p>
                                <p className="mb-2">Representa a balança entre seu preparo físico acumulado e seu cansaço recente (CTL - ATL).</p>
                                <ul className="space-y-1 text-muted-foreground">
                                    <li><span className="font-bold text-foreground">Positivo (+):</span> Corpo descansado. Ideal para provas.</li>
                                    <li><span className="font-bold text-foreground">Negativo (-):</span> Corpo fadigado. Estágio comum para construir resistência, porém evite o exagero.</li>
                                </ul>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardHeader>

            <CardContent className="p-6 pt-2">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">

                    {/* Status do Dia (TSB) */}
                    <div className="col-span-1 lg:col-span-4 space-y-4">
                        <div>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-5xl font-black tracking-tighter" style={{ color: textColor }}>
                                    {roundedTsb > 0 ? "+" : ""}{roundedTsb}
                                </span>
                            </div>
                            <Badge variant="outline" className="font-bold text-sm px-3 py-1 shadow-sm" style={{ color: textColor, backgroundColor: lightBgColor, borderColor: borderColor }}>
                                {zoneName}
                            </Badge>
                        </div>
                    </div>

                    {/* AI Coach Insight */}
                    <div className="col-span-1 lg:col-span-8 rounded-xl p-5 relative overflow-hidden border shadow-sm" style={{ backgroundColor: lightBgColor, borderColor: borderColor }}>
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none" style={{ color: textColor }}>
                            <Sparkles size={120} />
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-5 h-5" style={{ color: textColor }} />
                            <h3 className="font-bold text-base" style={{ color: textColor }}>AI Coach</h3>
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
