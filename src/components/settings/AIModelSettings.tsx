"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DEFAULT_AI_MODEL } from "@/lib/ai-models";

const PRESETS = [
  {
    id: "openrouter/auto",
    label: "Auto",
    description: "OpenRouter escolhe o melhor modelo disponível (pode ser caro)",
  },
  {
    id: "google/gemini-2.5-flash-preview",
    label: "Gemini 2.5 Flash",
    description: "Rápido, econômico e de alta qualidade (recomendado)",
  },
  {
    id: "google/gemini-flash-1.5",
    label: "Gemini 1.5 Flash",
    description: "Muito econômico, boa qualidade",
  },
  {
    id: "anthropic/claude-haiku-4-5",
    label: "Claude Haiku",
    description: "Ótimo custo-benefício da Anthropic",
  },
  {
    id: "openai/gpt-4o-mini",
    label: "GPT-4o Mini",
    description: "Modelo econômico da OpenAI",
  },
  {
    id: "meta-llama/llama-3.1-8b-instruct:free",
    label: "Llama 3.1 8B (grátis)",
    description: "Gratuito com rate limit — pode falhar em picos de uso",
  },
];

interface AIModelSettingsProps {
  initialModel: string | null;
}

export function AIModelSettings({ initialModel }: AIModelSettingsProps) {
  const current = initialModel ?? DEFAULT_AI_MODEL;
  const isCustom = !PRESETS.some((p) => p.id === current);

  const [selected, setSelected] = useState(isCustom ? "custom" : current);
  const [customValue, setCustomValue] = useState(isCustom ? current : "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);

    const modelToSave = selected === "custom" ? customValue.trim() : selected;

    if (selected === "custom" && !customValue.trim()) {
      setError("Insira um model ID válido.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiModel: modelToSave }),
      });

      if (!res.ok) throw new Error("Falha ao salvar.");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modelo de IA</CardTitle>
        <CardDescription>
          Escolha o modelo usado para gerar o feedback dos seus treinos via OpenRouter.
          O modelo é aplicado nos próximos feedbacks gerados.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          {PRESETS.map((preset) => (
            <label
              key={preset.id}
              className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${selected === preset.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50"
                }`}
            >
              <input
                type="radio"
                name="aiModel"
                value={preset.id}
                checked={selected === preset.id}
                onChange={() => setSelected(preset.id)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium leading-none">{preset.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{preset.description}</p>
              </div>
            </label>
          ))}

          <label
            className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${selected === "custom"
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/50"
              }`}
          >
            <input
              type="radio"
              name="aiModel"
              value="custom"
              checked={selected === "custom"}
              onChange={() => setSelected("custom")}
              className="mt-0.5"
            />
            <div className="flex-1">
              <p className="text-sm font-medium leading-none">Personalizado</p>
              <p className="text-xs text-muted-foreground mt-1">
                Qualquer model ID do OpenRouter (ex: mistralai/mistral-7b-instruct)
              </p>
              {selected === "custom" && (
                <input
                  type="text"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder="provider/model-name"
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              )}
            </div>
          </label>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : saved ? "✓ Salvo" : "Salvar"}
        </Button>
      </CardContent>
    </Card>
  );
}
