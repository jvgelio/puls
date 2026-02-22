"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SPORT_COLORS } from "@/lib/utils/sport-colors";

const semanticColors = [
  { name: "background", variable: "--background", description: "Fundo principal" },
  { name: "foreground", variable: "--foreground", description: "Texto principal" },
  { name: "card", variable: "--card", description: "Fundo de cards" },
  { name: "card-foreground", variable: "--card-foreground", description: "Texto de cards" },
  { name: "popover", variable: "--popover", description: "Fundo de popovers" },
  { name: "popover-foreground", variable: "--popover-foreground", description: "Texto de popovers" },
  { name: "primary", variable: "--primary", description: "Cor primária/ações" },
  { name: "primary-foreground", variable: "--primary-foreground", description: "Texto sobre primária" },
  { name: "secondary", variable: "--secondary", description: "Cor secundária" },
  { name: "secondary-foreground", variable: "--secondary-foreground", description: "Texto sobre secundária" },
  { name: "muted", variable: "--muted", description: "Elementos desabilitados" },
  { name: "muted-foreground", variable: "--muted-foreground", description: "Texto secundário" },
  { name: "accent", variable: "--accent", description: "Destaque/hover" },
  { name: "accent-foreground", variable: "--accent-foreground", description: "Texto sobre destaque" },
  { name: "destructive", variable: "--destructive", description: "Ações destrutivas" },
  { name: "border", variable: "--border", description: "Bordas" },
  { name: "input", variable: "--input", description: "Bordas de inputs" },
  { name: "ring", variable: "--ring", description: "Anel de foco" },
];

const chartColors = [
  { name: "chart-1", variable: "--chart-1", description: "Gráfico cor 1" },
  { name: "chart-2", variable: "--chart-2", description: "Gráfico cor 2" },
  { name: "chart-3", variable: "--chart-3", description: "Gráfico cor 3" },
  { name: "chart-4", variable: "--chart-4", description: "Gráfico cor 4" },
  { name: "chart-5", variable: "--chart-5", description: "Gráfico cor 5" },
];

const radiusTokens = [
  { name: "radius-sm", variable: "--radius-sm", description: "Pequeno" },
  { name: "radius-md", variable: "--radius-md", description: "Médio" },
  { name: "radius-lg", variable: "--radius-lg", description: "Grande (padrão)" },
  { name: "radius-xl", variable: "--radius-xl", description: "Extra grande" },
  { name: "radius-2xl", variable: "--radius-2xl", description: "2x grande" },
  { name: "radius-3xl", variable: "--radius-3xl", description: "3x grande" },
  { name: "radius-4xl", variable: "--radius-4xl", description: "4x grande" },
];

function ColorSwatch({
  name,
  variable,
  description,
}: {
  name: string;
  variable: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-10 w-10 rounded-md border shadow-sm shrink-0"
        style={{ backgroundColor: `var(${variable})` }}
      />
      <div className="min-w-0">
        <p className="font-mono text-sm font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function SportColorSwatch({
  sport,
  colors,
}: {
  sport: string;
  colors: { bg: string; text: string; dot: string };
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-10 w-10 rounded-md border shadow-sm shrink-0"
        style={{ backgroundColor: colors.dot }}
      />
      <div>
        <p className="font-medium">{sport}</p>
        <p className="text-xs font-mono text-muted-foreground">{colors.dot}</p>
      </div>
    </div>
  );
}

function RadiusSwatch({
  name,
  variable,
  description,
}: {
  name: string;
  variable: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-10 w-16 border-2 border-primary shrink-0"
        style={{ borderRadius: `var(${variable})` }}
      />
      <div>
        <p className="font-mono text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default function CoresPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cores</h1>
        <p className="text-muted-foreground mt-2">
          Paleta de cores usando tokens OKLCH para consistência perceptual.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cores Semânticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {semanticColors.map((color) => (
              <ColorSwatch key={color.name} {...color} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cores de Gráficos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {chartColors.map((color) => (
              <ColorSwatch key={color.name} {...color} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cores por Esporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(SPORT_COLORS).map(([sport, colors]) => (
              <SportColorSwatch key={sport} sport={sport} colors={colors} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Border Radius</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {radiusTokens.map((radius) => (
              <RadiusSwatch key={radius.name} {...radius} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Formato OKLCH</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>
            Utilizamos o espaço de cor <strong>OKLCH</strong> (Oklab Lightness Chroma Hue)
            para definir os tokens de cor. Este formato oferece:
          </p>
          <ul>
            <li><strong>Perceptual uniformity:</strong> Mudanças numéricas correspondem a mudanças visuais consistentes</li>
            <li><strong>Melhor interpolação:</strong> Gradientes e transições mais suaves</li>
            <li><strong>Gamut mapping:</strong> Cores fora do sRGB são mapeadas automaticamente</li>
          </ul>
          <p className="font-mono text-xs bg-muted p-3 rounded-md">
            oklch(L C H) → L: luminosidade (0-1), C: croma (0-0.4), H: matiz (0-360)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
