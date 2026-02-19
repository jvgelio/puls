"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

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
      <Card className="border-destructive">
        <CardContent className="py-4">
          <div className="flex items-center gap-2">
            <span className="text-destructive">Erro na importação:</span>
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Importando atividades dos últimos 2 meses...
            </span>
            <span className="text-sm text-muted-foreground">
              {progress.processed} / {progress.total}
            </span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Isso pode levar alguns minutos. Você pode continuar usando o app.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
