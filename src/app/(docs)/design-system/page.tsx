"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Palette,
  Type,
  Component,
  Layers,
  LayoutDashboard,
  Sparkles,
  Activity,
  Footprints,
  Clock,
  Flame,
  Calendar,
  TrendingUp,
  Plus,
  Inbox,
  Activity as ActivityIcon,
  ChevronRight,
  Mail,
  Download,
  Trash2,
  Loader2
} from "lucide-react";

// Components for Demos
import { SPORT_COLORS } from "@/lib/utils/sport-colors";
import { SportIcon } from "@/components/ui/sport-icon";
import { StatCard, ChartCard, EmptyState } from "@/components/patterns";
import { HeroStatusCard } from "@/components/dashboard/HeroStatusCard";
import { AICoachInsightCard } from "@/components/dashboard/AICoachInsightCard";
import { ActivityChartCard } from "@/components/dashboard/ActivityChartCard";

// Data Constants
const sections = [
  { title: "Cores", description: "Design tokens OKLCH", href: "#cores", icon: Palette },
  { title: "Tipografia", description: "Escala e hierarquia", href: "#tipografia", icon: Type },
  { title: "Botões", description: "Variantes e estados", href: "#botoes", icon: Component },
  { title: "Métricas", description: "Analytics patterns", href: "#patterns", icon: Layers },
  { title: "Dashboards", description: "Cockpit components", href: "#dashboard", icon: LayoutDashboard },
];

const semanticColors = [
  { name: "primary", variable: "--primary", description: "OkLCH (0.205 0 0)" },
  { name: "secondary", variable: "--secondary", description: "Suporte e fundos" },
  { name: "destructive", variable: "--destructive", description: "Alertas e erros" },
  { name: "accent", variable: "--accent", description: "Destaque / Hover" },
  { name: "muted", variable: "--muted", description: "Texto secundário" },
  { name: "border", variable: "--border", description: "Bordas / Linhas" },
];

const zoneColors = [
  { name: "zone-transition", variable: "--zone-transition", description: "TSB > 20" },
  { name: "zone-fresh", variable: "--zone-fresh", description: "TSB 5 a 20" },
  { name: "zone-neutral", variable: "--zone-neutral", description: "TSB -10 a 5" },
  { name: "zone-optimal", variable: "--zone-optimal", description: "TSB -30 a -10" },
  { name: "zone-risk", variable: "--zone-risk", description: "TSB < -30" },
];

// Helper Components
function ColorSwatch({ name, variable, description }: { name: string; variable: string; description: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border bg-card/50">
      <div className="h-12 w-12 rounded-lg shadow-inner border" style={{ backgroundColor: `var(${variable})` }} />
      <div className="min-w-0">
        <p className="font-mono text-xs font-bold leading-none mb-1">{name}</p>
        <p className="text-[10px] text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function SectionHeader({ title, description, id }: { title: string; description: string; id: string }) {
  return (
    <div id={id} className="scroll-mt-20 space-y-1 mb-6 pt-10">
      <h2 className="text-3xl font-black tracking-tight">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
      <Separator className="mt-4" />
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="max-w-6xl mx-auto pb-32 px-4 space-y-24">
      {/* Intro Section */}
      <section className="pt-16 space-y-12">
        <div className="space-y-4">
          <Badge variant="outline" className="text-primary font-mono py-1 px-4 rounded-full border-primary/30">PULS Design System v1.1</Badge>
          <h1 className="text-7xl font-black tracking-tighter leading-none">
            Visão Geral do <span className="text-primary">Cockpit</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Um sistema unificado para gerenciar performance atlética com IA e tokens perceptuais consistentes.
          </p>
        </div>

        <nav className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {sections.map((s) => (
            <a key={s.href} href={s.href} className="block group">
              <Card className="h-full border-primary/10 transition-all hover:scale-[1.02] hover:border-primary/50 hover:bg-primary/5">
                <CardHeader className="p-5">
                  <s.icon className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <CardTitle className="text-base font-bold">{s.title}</CardTitle>
                  <CardDescription className="text-xs">{s.description}</CardDescription>
                </CardHeader>
              </Card>
            </a>
          ))}
        </nav>
      </section>

      {/* CORES */}
      <section>
        <SectionHeader id="cores" title="Cores & Design Tokens" description="Design semântico utilizando o espaço de cor OKLCH para consistência temática." />
        <div className="grid gap-10">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary/70">Cores Base</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {semanticColors.map(c => <ColorSwatch key={c.name} {...c} />)}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary/70">Zonas de Balanço (TSB)</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {zoneColors.map(c => <ColorSwatch key={c.name} {...c} />)}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary/70">Esportes (Brand Dots)</h3>
            <div className="flex flex-wrap gap-4">
              {Object.entries(SPORT_COLORS).map(([sport, config]) => (
                <div key={sport} className="flex items-center gap-2 p-2 px-4 rounded-full border bg-card/40">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: config.dot }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{sport}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TIPOGRAFIA */}
      <section>
        <SectionHeader id="tipografia" title="Tipografia" description="Escalas e pesos utilizando a fonte Inter para máxima legibilidade." />
        <div className="space-y-12">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="p-8 rounded-3xl border bg-accent/10 space-y-2">
              <span className="text-xs font-mono text-muted-foreground">Sans Serif (Inter)</span>
              <p className="text-4xl font-black tracking-tighter">Performance através de dados.</p>
            </div>
            <div className="p-8 rounded-3xl border bg-accent/30 space-y-2">
              <span className="text-xs font-mono text-muted-foreground">Monospace</span>
              <p className="text-4xl font-mono tracking-tighter">const ctl = logs.at(-1);</p>
            </div>
          </div>
          <Card className="border-none bg-muted/20">
            <CardContent className="p-0 divide-y divide-border">
              {[
                { tag: "h1", css: "text-4xl font-black", desc: "Títulos de página principais" },
                { tag: "h2", css: "text-2xl font-bold", desc: "Títulos de seção" },
                { tag: "h3", css: "text-lg font-semibold", desc: "Cards e subtítulos" },
                { tag: "p", css: "text-base font-normal", desc: "Corpo de texto padrão" },
                { tag: "small", css: "text-xs font-medium text-muted-foreground", desc: "Legendas e detalhes" },
              ].map((t) => (
                <div key={t.tag} className="flex p-6 items-center gap-6">
                  <div className="w-20 shrink-0 font-mono text-[10px] text-primary font-bold">{t.tag}</div>
                  <div className="flex-1"><p className={t.css}>Amostra de Tipografia</p></div>
                  <div className="text-xs text-muted-foreground italic">{t.desc}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* BOTÕES */}
      <section>
        <SectionHeader id="botoes" title="Botões & Inputs" description="Elementos interativos com variantes de estado." />
        <div className="grid gap-6">
          <Card>
            <CardHeader><CardTitle>Variantes Principais</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </CardContent>
          </Card>
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Com Ícones</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Novo Registro</Button>
                <Button size="sm" variant="outline"><Mail className="mr-2 h-4 w-4" /> Convite</Button>
                <Button size="sm" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Loading States</CardTitle></CardHeader>
              <CardContent className="flex gap-2">
                <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando</Button>
                <Button size="icon" disabled><Loader2 className="h-4 w-4 animate-spin" /></Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ANALYTICS PATTERNS */}
      <section>
        <SectionHeader id="patterns" title="Analytics Patterns" description="Componentes complexos para representação de dados esportivos." />
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Distância" value="56.2 km" description="Últimos 7 dias" icon={<Footprints />} trend={{ value: 15, isPositive: true }} />
            <StatCard title="Tempo" value="6h 12m" description="Tempo total" icon={<Clock />} />
            <StatCard title="Carga TL" value="450" description="Média semanal" icon={<Activity />} trend={{ value: 2, isPositive: false }} />
            <StatCard title="Calorias" value="4,850" description="Gasto total" icon={<Flame />} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Frequência Base" description="Média de repouso (BPM)">
              <div className="h-40 flex items-end gap-1">
                {[20, 30, 25, 40, 35, 60, 45, 80, 50, 65].map((h, i) => (
                  <div key={i} className="flex-1 bg-primary/20 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
            </ChartCard>
            <EmptyState
              icon={<ActivityIcon className="h-12 w-12 text-muted-foreground/40" />}
              title="Sem dados de GPS"
              description="Suas atividades recentes não possuem dados de mapa."
            />
          </div>
        </div>
      </section>

      {/* DASHBOARD COCKPIT */}
      <section>
        <SectionHeader id="dashboard" title="Dashboard Cockpit" description="Peças finais montadas com integração IA." />
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-8">
            <HeroStatusCard tsb={15} />
            <AICoachInsightCard insight="Seu índice de prontidão está ótimo. Hoje é um dia perfeito para um treino intervalado de alta intensidade (VO2 Max)." />
          </div>
          <div className="lg:col-span-8">
            <ActivityChartCard title="Progresso de Carga CTL" description="Visão 8 semanas de construção" />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Separator />
      <footer className="py-10 text-center">
        <p className="text-sm text-muted-foreground font-mono">PULS Design System — Crafting Performance.</p>
      </footer>
    </div>
  );
}
