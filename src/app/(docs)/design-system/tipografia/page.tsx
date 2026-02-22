import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const typeScale = [
  { name: "text-xs", size: "0.75rem (12px)", leading: "1rem", sample: "Texto extra pequeno" },
  { name: "text-sm", size: "0.875rem (14px)", leading: "1.25rem", sample: "Texto pequeno" },
  { name: "text-base", size: "1rem (16px)", leading: "1.5rem", sample: "Texto base" },
  { name: "text-lg", size: "1.125rem (18px)", leading: "1.75rem", sample: "Texto grande" },
  { name: "text-xl", size: "1.25rem (20px)", leading: "1.75rem", sample: "Título pequeno" },
  { name: "text-2xl", size: "1.5rem (24px)", leading: "2rem", sample: "Título médio" },
  { name: "text-3xl", size: "1.875rem (30px)", leading: "2.25rem", sample: "Título grande" },
  { name: "text-4xl", size: "2.25rem (36px)", leading: "2.5rem", sample: "Display" },
];

const fontWeights = [
  { name: "font-normal", weight: "400", sample: "Peso normal" },
  { name: "font-medium", weight: "500", sample: "Peso médio" },
  { name: "font-semibold", weight: "600", sample: "Peso semi-bold" },
  { name: "font-bold", weight: "700", sample: "Peso bold" },
];

export default function TipografiaPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tipografia</h1>
        <p className="text-muted-foreground mt-2">
          Escala tipográfica e estilos de texto do design system.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Famílias de Fonte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Sans (Inter)</p>
            <p className="text-2xl font-sans">
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Mono</p>
            <p className="text-2xl font-mono">
              const data = await fetch()
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Escala de Tamanhos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {typeScale.map((type) => (
              <div key={type.name} className="flex items-baseline gap-4 border-b pb-4 last:border-0">
                <div className="w-24 shrink-0">
                  <p className="font-mono text-sm text-muted-foreground">{type.name}</p>
                </div>
                <div className="flex-1">
                  <p className={type.name}>{type.sample}</p>
                </div>
                <div className="w-32 shrink-0 text-right">
                  <p className="text-xs text-muted-foreground">{type.size}</p>
                  <p className="text-xs text-muted-foreground">leading: {type.leading}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pesos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fontWeights.map((weight) => (
              <div key={weight.name} className="flex items-center gap-4 border-b pb-4 last:border-0">
                <div className="w-32 shrink-0">
                  <p className="font-mono text-sm text-muted-foreground">{weight.name}</p>
                </div>
                <div className="flex-1">
                  <p className={`text-xl ${weight.name}`}>{weight.sample}</p>
                </div>
                <div className="w-16 text-right">
                  <p className="text-sm text-muted-foreground">{weight.weight}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hierarquia de Títulos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1">h1 - Página</p>
            <h1 className="text-3xl font-bold tracking-tight">Título da Página</h1>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">h2 - Seção</p>
            <h2 className="text-xl font-semibold">Título da Seção</h2>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">h3 - Subseção</p>
            <h3 className="text-lg font-medium">Título da Subseção</h3>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">p - Corpo</p>
            <p className="text-base">
              Texto de parágrafo com tamanho base. Lorem ipsum dolor sit amet,
              consectetur adipiscing elit. Sed do eiusmod tempor incididunt.
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">small - Auxiliar</p>
            <p className="text-sm text-muted-foreground">
              Texto auxiliar ou secundário com cor mais suave.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tracking (Letter Spacing)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">tracking-tight (-0.025em)</p>
            <p className="text-2xl font-bold tracking-tight">Títulos com tracking apertado</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">tracking-normal (0)</p>
            <p className="text-base tracking-normal">Texto normal sem tracking modificado</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">tracking-wide (0.025em)</p>
            <p className="text-xs uppercase tracking-wide font-medium">Labels e badges</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
