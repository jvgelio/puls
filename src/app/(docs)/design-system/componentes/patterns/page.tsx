"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartCard, EmptyState, StatCard } from "@/components/patterns";
import {
  Activity,
  Calendar,
  Clock,
  Flame,
  Footprints,
  Inbox,
  Plus,
  TrendingUp,
} from "lucide-react";

export default function PatternsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patterns</h1>
        <p className="text-muted-foreground mt-2">
          Componentes compostos reutilizáveis para cenários comuns.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>StatCard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Card para exibir métricas e estatísticas com ícone, valor e descrição.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Distância"
              value="42.5 km"
              description="Esta semana"
              icon={<Footprints />}
            />
            <StatCard
              title="Tempo"
              value="5h 32min"
              description="Em movimento"
              icon={<Clock />}
            />
            <StatCard
              title="Treinos"
              value="8"
              description="Esta semana"
              icon={<Activity />}
              trend={{ value: 25, isPositive: true }}
            />
            <StatCard
              title="Calorias"
              value="3.240"
              description="Queimadas"
              icon={<Flame />}
              trend={{ value: 10, isPositive: false }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ChartCard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Container para gráficos com título, descrição e ação opcional.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <ChartCard
              title="Atividade Semanal"
              description="Últimos 7 dias"
            >
              <div className="h-32 flex items-end justify-between gap-2 px-4">
                {[40, 65, 45, 80, 55, 70, 60].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary/80 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </ChartCard>

            <ChartCard
              title="Progressão"
              description="Últimos 30 dias"
              action={
                <Button variant="outline" size="sm">
                  <Calendar /> Período
                </Button>
              }
            >
              <div className="h-32 flex items-center justify-center">
                <TrendingUp className="h-16 w-16 text-muted-foreground/30" />
              </div>
            </ChartCard>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>EmptyState</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Estado vazio com ícone, mensagem e ação opcional.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <EmptyState
                  icon={<Inbox />}
                  title="Nenhuma atividade"
                  description="Você ainda não registrou nenhuma atividade. Conecte seu Strava para importar."
                  action={
                    <Button>
                      <Plus /> Conectar Strava
                    </Button>
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <EmptyState
                  icon={<Calendar />}
                  title="Sem treinos esta semana"
                  description="Que tal começar com uma corrida leve?"
                />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Código</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
{`import { ChartCard, EmptyState, StatCard } from "@/components/patterns";

// StatCard
<StatCard
  title="Distância"
  value="42.5 km"
  description="Esta semana"
  icon={<Footprints />}
  trend={{ value: 25, isPositive: true }}
/>

// ChartCard
<ChartCard
  title="Atividade Semanal"
  description="Últimos 7 dias"
  action={<Button size="sm">Período</Button>}
>
  {/* Gráfico aqui */}
</ChartCard>

// EmptyState
<EmptyState
  icon={<Inbox />}
  title="Nenhuma atividade"
  description="Conecte seu Strava para importar."
  action={<Button>Conectar</Button>}
/>`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
