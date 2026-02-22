import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const components = [
  {
    name: "Button",
    description: "Botões para ações primárias e secundárias",
    href: "/design-system/componentes/button",
    variants: ["default", "destructive", "outline", "secondary", "ghost", "link"],
  },
  {
    name: "Card",
    description: "Container para agrupar conteúdo relacionado",
    href: "/design-system/componentes/card",
    variants: ["Card", "CardHeader", "CardTitle", "CardDescription", "CardContent", "CardFooter"],
  },
  {
    name: "Badge",
    description: "Labels e tags para categorização",
    href: "/design-system/componentes/badge",
    variants: ["default", "secondary", "destructive", "outline"],
  },
  {
    name: "Patterns",
    description: "Componentes compostos reutilizáveis",
    href: "/design-system/componentes/patterns",
    variants: ["StatCard", "ChartCard", "EmptyState"],
  },
];

const otherComponents = [
  { name: "Avatar", description: "Imagem de perfil com fallback" },
  { name: "DropdownMenu", description: "Menu contextual com opções" },
  { name: "Skeleton", description: "Placeholder de carregamento" },
  { name: "Separator", description: "Divisor visual entre seções" },
  { name: "Table", description: "Tabelas de dados" },
  { name: "Tabs", description: "Navegação por abas" },
  { name: "Tooltip", description: "Dicas contextuais" },
];

export default function ComponentesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Componentes</h1>
        <p className="text-muted-foreground mt-2">
          Biblioteca de componentes UI do PULS baseada em shadcn/ui.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Componentes Documentados</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {components.map((component) => (
            <Link key={component.name} href={component.href}>
              <Card className="h-full transition-colors hover:bg-accent/50">
                <CardHeader>
                  <CardTitle>{component.name}</CardTitle>
                  <CardDescription>{component.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {component.variants.map((variant) => (
                      <span
                        key={variant}
                        className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-mono"
                      >
                        {variant}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Outros Componentes</h2>
        <p className="text-sm text-muted-foreground">
          Componentes disponíveis na pasta <code className="font-mono bg-muted px-1 rounded">@/components/ui</code>
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {otherComponents.map((component) => (
            <Card key={component.name} className="py-4">
              <CardContent className="py-0">
                <p className="font-medium">{component.name}</p>
                <p className="text-sm text-muted-foreground">{component.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Importação</h2>
        <Card>
          <CardContent className="pt-6">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
{`// Importar de @/components/ui
import { Button, Card, Badge } from "@/components/ui";

// Ou importar individualmente
import { Button } from "@/components/ui/button";`}
            </pre>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
