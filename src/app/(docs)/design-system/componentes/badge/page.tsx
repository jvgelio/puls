import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SPORT_COLORS } from "@/lib/utils/sport-colors";
import { cn } from "@/lib/utils";

export default function BadgePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Badge</h1>
        <p className="text-muted-foreground mt-2">
          Labels e tags para categorização e status.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Variantes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="ghost">Ghost</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Casos de Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                Completo
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                Em progresso
              </Badge>
              <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                Cancelado
              </Badge>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Contadores</p>
            <div className="flex flex-wrap gap-2">
              <Badge>3 novos</Badge>
              <Badge variant="secondary">12</Badge>
              <Badge variant="outline">+99</Badge>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Categorias</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Corrida</Badge>
              <Badge variant="secondary">Ciclismo</Badge>
              <Badge variant="secondary">Natação</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Badges por Esporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SPORT_COLORS).map(([sport, colors]) => (
              <Badge
                key={sport}
                className={cn(colors.bg, colors.text, "hover:opacity-90")}
              >
                {sport}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Com Ícones e Dots</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              <span
                className="h-2 w-2 rounded-full bg-green-500"
                aria-hidden="true"
              />
              Online
            </Badge>
            <Badge variant="outline">
              <span
                className="h-2 w-2 rounded-full bg-yellow-500"
                aria-hidden="true"
              />
              Ausente
            </Badge>
            <Badge variant="outline">
              <span
                className="h-2 w-2 rounded-full bg-gray-400"
                aria-hidden="true"
              />
              Offline
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Código</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
{`import { Badge } from "@/components/ui/badge";

// Variantes
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>

// Cores customizadas
<Badge className="bg-green-100 text-green-700">
  Completo
</Badge>

// Com dot indicador
<Badge variant="outline">
  <span className="h-2 w-2 rounded-full bg-green-500" />
  Online
</Badge>

// Usando cores de esporte
import { SPORT_COLORS } from "@/lib/utils/sport-colors";
import { cn } from "@/lib/utils";

const colors = SPORT_COLORS["Run"];
<Badge className={cn(colors.bg, colors.text)}>
  Run
</Badge>`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
