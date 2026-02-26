"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Loader2 } from "lucide-react";

interface ImportBannerProps {
  userId: string;
}

interface ImportProgress {
  total: number;
  processed: number;
  status: "pending" | "in_progress" | "completed" | "error";
  error?: string;
}

export function ImportBanner({ userId }: ImportBannerProps) {
  const [progress, setProgress] = useState<ImportProgress | null>(null);

  useEffect(() => {
    const checkProgress = async () => {
      try {
        const response = await fetch(`/api/import/progress?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setProgress(data.progress);

          if (data.progress?.status === "completed") {
            // Refresh the page after import completes
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        }
      } catch (error) {
        console.error("Error checking import progress:", error);
      }
    };

    // Check immediately and then every 5 seconds
    checkProgress();
    const interval = setInterval(checkProgress, 5000);

    return () => clearInterval(interval);
  }, [userId]);

  if (!progress || progress.status === "completed") {
    return null;
  }

  if (progress.status === "error") {
    return (
      <Card className="border-destructive" role="alert">
        <CardContent className="py-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span className="text-destructive font-medium">Erro na importação:</span>
            <span className="text-muted-foreground">{progress.error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const percentage =
    progress.total > 0
      ? Math.round((progress.processed / progress.total) * 100)
      : 0;

  return (
    <Card className="border-primary">
      <CardContent className="py-4">
        <div className="space-y-2" aria-live="polite">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium">
                Importando atividades dos últimos 2 meses...
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {progress.processed} / {progress.total}
            </span>
          </div>
          <Progress
            value={percentage}
            className="h-2"
            aria-label="Progresso da importação"
          />
          <p className="text-xs text-muted-foreground">
            Isso pode levar alguns minutos. Você pode continuar usando o app.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
