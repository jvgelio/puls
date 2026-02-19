"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Activity } from "@/lib/db/schema";
import type { StravaSplit } from "@/lib/strava/types";
import { formatDuration, formatHeartRate, formatElevation } from "@/lib/utils/formatters";

interface SplitsTableProps {
  activity: Activity;
}

export function SplitsTable({ activity }: SplitsTableProps) {
  const rawPayload = activity.rawPayload as Record<string, unknown> | null;
  const splits = (rawPayload?.splits_metric ||
    rawPayload?.splits_standard ||
    []) as StravaSplit[];

  if (!splits || splits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Splits por Km</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Dados de splits não disponíveis para esta atividade.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate average pace for comparison
  const avgPaceSeconds =
    splits.reduce((sum, s) => {
      if (s.average_speed > 0) {
        return sum + 1000 / s.average_speed;
      }
      return sum;
    }, 0) / splits.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Splits por Km</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Km</TableHead>
              <TableHead>Pace</TableHead>
              <TableHead>Tempo</TableHead>
              {splits.some((s) => s.average_heartrate) && (
                <TableHead>FC</TableHead>
              )}
              {splits.some((s) => s.elevation_difference) && (
                <TableHead>Elev.</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {splits.map((split, index) => {
              const paceSeconds =
                split.average_speed > 0 ? 1000 / split.average_speed : 0;
              const paceMinutes = Math.floor(paceSeconds / 60);
              const paceSecs = Math.round(paceSeconds % 60);
              const paceStr = `${paceMinutes}:${paceSecs.toString().padStart(2, "0")}`;

              // Determine if this split is faster or slower than average
              const isFaster = paceSeconds < avgPaceSeconds - 5;
              const isSlower = paceSeconds > avgPaceSeconds + 5;

              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <span
                      className={
                        isFaster
                          ? "text-green-600 dark:text-green-400"
                          : isSlower
                            ? "text-red-600 dark:text-red-400"
                            : ""
                      }
                    >
                      {paceStr}/km
                    </span>
                  </TableCell>
                  <TableCell>{formatDuration(split.moving_time)}</TableCell>
                  {splits.some((s) => s.average_heartrate) && (
                    <TableCell>
                      {split.average_heartrate
                        ? formatHeartRate(split.average_heartrate)
                        : "-"}
                    </TableCell>
                  )}
                  {splits.some((s) => s.elevation_difference) && (
                    <TableCell>
                      {split.elevation_difference !== undefined
                        ? `${split.elevation_difference > 0 ? "+" : ""}${Math.round(split.elevation_difference)}m`
                        : "-"}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
