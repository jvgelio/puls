"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { AIFeedback as AIFeedbackType } from "@/lib/db/schema";

interface AIFeedbackProps {
  feedback: AIFeedbackType | null | undefined;
  activityId: string;
  userId: string;
}

export function AIFeedback({ feedback, activityId, userId }: AIFeedbackProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(feedback);
  const [error, setError] = useState<string | null>(null);

  const generateFeedback = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/feedback/${activityId}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Falha ao gerar feedback");
      }

      const data = await response.json();
      setCurrentFeedback(data.feedback);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar feedback");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Feedback IA
            <Badge variant="outline">Gerando...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!currentFeedback) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Nenhum feedback gerado para esta atividade ainda.
          </p>
          {error && (
            <p className="text-destructive text-sm">{error}</p>
          )}
          <Button onClick={generateFeedback}>Gerar Feedback</Button>
        </CardContent>
      </Card>
    );
  }

  const positives = currentFeedback.positives as string[] | null;
  const improvements = currentFeedback.improvements as string[] | null;
  const recommendations = currentFeedback.recommendations as string[] | null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            Feedback IA
            <Badge variant="outline" className="text-xs">
              {currentFeedback.modelUsed || "AI"}
            </Badge>
          </span>
          <Button variant="ghost" size="sm" onClick={generateFeedback}>
            Regenerar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentFeedback.summary && (
          <div>
            <p className="text-lg">{currentFeedback.summary}</p>
          </div>
        )}

        {positives && positives.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-green-600 dark:text-green-400">
              Pontos Positivos
            </h4>
            <ul className="space-y-1">
              {positives.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">+</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {improvements && improvements.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-amber-600 dark:text-amber-400">
              Pontos de Atenção
            </h4>
            <ul className="space-y-1">
              {improvements.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400">!</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {recommendations && recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-600 dark:text-blue-400">
              Recomendações
            </h4>
            <ul className="space-y-1">
              {recommendations.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">→</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <p className="text-destructive text-sm">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
