"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createGoalAction } from "@/app/actions/goals.actions";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

export function CreateGoalDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [goalType, setGoalType] = useState("objective");
    const [metric, setMetric] = useState("distance");

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(event.currentTarget);
            await createGoalAction(formData);

            toast.success("Meta criada com sucesso!", {
                description: "Sua nova meta já está na dashboard.",
            });
            setOpen(false);
        } catch (error) {
            toast.error("Erro ao criar meta", {
                description: "Não foi possível criar a meta. Tente novamente.",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nova Meta ou Prova
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Criar Nova Meta ou Prova</DialogTitle>
                        <DialogDescription>
                            Cadastre seu objetivo ou registre uma prova alvo futura.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">

                        {/* Nome */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome da Meta ou Prova</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Ex: Maratona do Rio 2026"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Tipo */}
                            <div className="grid gap-2">
                                <Label htmlFor="goalType">Tipo</Label>
                                <Select name="goalType" value={goalType} onValueChange={setGoalType} required>
                                    <SelectTrigger id="goalType">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="objective">Objetivo</SelectItem>
                                        <SelectItem value="race">Prova (Evento)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Esporte */}
                            <div className="grid gap-2">
                                <Label htmlFor="sportType">Esporte</Label>
                                <Select name="sportType" defaultValue="Run" required>
                                    <SelectTrigger id="sportType">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Run">Corrida</SelectItem>
                                        <SelectItem value="TrailRun">Trail Run</SelectItem>
                                        <SelectItem value="Ride">Ciclismo</SelectItem>
                                        <SelectItem value="Swim">Natação</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {goalType === "objective" && (
                            <div className="grid gap-2">
                                <Label htmlFor="metric">Métrica</Label>
                                <Select
                                    name="metric"
                                    value={metric}
                                    onValueChange={setMetric}
                                    required
                                >
                                    <SelectTrigger id="metric">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="distance">Distância Mínima</SelectItem>
                                        <SelectItem value="pace">Pace Alvo (Melhorar)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            {/* Valor Alvo / Distância */}
                            <div className="grid gap-2">
                                <Label htmlFor="targetValue">
                                    {goalType === "objective"
                                        ? `Valor Alvo ${metric === "distance" ? "(em km)" : "(Formato ex: 5.5)"}`
                                        : "Distância (km)"}
                                </Label>
                                <Input
                                    id="targetValue"
                                    name="targetValue"
                                    type="number"
                                    step="0.01"
                                    placeholder={goalType === "objective" ? (metric === "distance" ? "Ex: 21.1" : "Ex: 5.5") : "Ex: 21.1"}
                                    required={goalType === "objective"}
                                />
                            </div>

                            {/* Ganho de Elevação (Opcional, mais útil para Provas) */}
                            <div className="grid gap-2">
                                <Label htmlFor="elevationGain">Elevação (Metros) <span className="text-muted-foreground text-xs font-normal">(Opcional)</span></Label>
                                <Input
                                    id="elevationGain"
                                    name="elevationGain"
                                    type="number"
                                    step="1"
                                    placeholder="Ex: 800"
                                />
                            </div>
                        </div>

                        {/* Prazo */}
                        <div className="grid gap-2">
                            <Label htmlFor="deadline">Data Limite (Prazo)</Label>
                            <Input
                                id="deadline"
                                name="deadline"
                                type="date"
                                required
                            />
                        </div>

                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? "Salvando..." : "Criar Meta"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
