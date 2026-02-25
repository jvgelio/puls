"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPace } from "@/lib/utils/formatters";
import { Loader2, Target, Trash2 } from "lucide-react";
import { CreateGoalDialog } from "./CreateGoalDialog";
import { deleteGoalAction } from "@/app/actions/goals.actions";
import { toast } from "sonner";
import { GoalProgress } from "@/lib/services/goals.service";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GoalsCardProps {
    goals?: GoalProgress[];
}

export function GoalsCard({ goals = [] }: GoalsCardProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (goalId: string) => {
        setDeletingId(goalId);
        try {
            await deleteGoalAction(goalId);
            toast.success("Meta removida!", {
                description: "A meta foi apagada com sucesso.",
            });
        } catch {
            toast.error("Erro ao remover", {
                description: "Ocorreu um problema ao remover a meta.",
            });
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <TooltipProvider>
            <Card className="h-full flex flex-col">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Metas
                    </CardTitle>
                    <CreateGoalDialog />
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-6 pt-2">

                    {goals.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                            <Target className="w-12 h-12 text-muted-foreground/30 mb-3" />
                            <p className="text-sm font-medium">Nenhuma meta cadastrada.</p>
                            <p className="text-xs text-muted-foreground">Adicione um objetivo para acompanhar sua evolução.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {goals.map((item) => (
                                <div key={item.goal.id} className="space-y-2 group">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1 font-medium text-foreground">
                                            <span className="line-clamp-1">{item.goal.name}</span>
                                            {item.goal.goalType === "race" && (
                                                <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500 px-1.5 py-0.5 rounded ml-2 border border-amber-200 dark:border-amber-800">
                                                    Prova
                                                </span>
                                            )}
                                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground ml-2">
                                                {item.goal.sportType === "Run" ? "Corrida" :
                                                    item.goal.sportType === "TrailRun" ? "Trail Run" :
                                                        item.goal.sportType === "Ride" ? "Ciclismo" :
                                                            item.goal.sportType === "Swim" ? "Natação" : item.goal.sportType}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-lg">
                                                {item.goal.goalType === "race"
                                                    ? (item.goal.targetValue ? `${parseFloat(item.goal.targetValue).toFixed(1)}km` : "-")
                                                    : (item.goal.metric === "distance"
                                                        ? `${parseFloat(item.goal.targetValue || "0").toFixed(1)}km`
                                                        : formatPace(parseFloat(item.goal.targetValue || "0") * 60, 1).replace(" /km", ""))
                                                }
                                            </span>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={() => handleDelete(item.goal.id)}
                                                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-muted-foreground hover:text-red-500 transition-all p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        aria-label="Remover Meta"
                                                        disabled={deletingId === item.goal.id}
                                                    >
                                                        {deletingId === item.goal.id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        )}
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Remover Meta</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                                        <span suppressHydrationWarning>Para: {new Date(item.goal.deadline).toLocaleDateString('pt-BR')}</span>
                                        <span className="flex items-center gap-2">
                                            {item.goal.elevationGain && `⛰️ ${item.goal.elevationGain}m D+`}
                                            {item.goal.goalType === "objective" && (
                                                <span>
                                                    Alvo: {item.goal.metric === "distance" ? "Distância" : "Pace"}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
