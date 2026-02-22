import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Type, Component, Layers } from "lucide-react";

const sections = [
  {
    title: "Cores",
    description: "Paleta de cores semânticas e tokens OKLCH",
    href: "/design-system/cores",
    icon: Palette,
  },
  {
    title: "Tipografia",
    description: "Escala tipográfica e estilos de texto",
    href: "/design-system/tipografia",
    icon: Type,
  },
  {
    title: "Componentes",
    description: "Primitivos UI e variantes disponíveis",
    href: "/design-system/componentes",
    icon: Component,
  },
  {
    title: "Patterns",
    description: "Padrões compostos e reutilizáveis",
    href: "/design-system/componentes/patterns",
    icon: Layers,
  },
];

export default function DesignSystemPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Design System</h1>
        <p className="text-muted-foreground mt-2">
          Documentação visual dos componentes e tokens de design do PULS.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <section.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Stack Tecnológico</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium">Tailwind CSS 4</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Utility-first CSS com tokens OKLCH
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium">shadcn/ui</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Componentes acessíveis com Radix UI
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium">CVA</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Class Variance Authority para variantes
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Princípios</h2>
        <ul className="grid gap-3 sm:grid-cols-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span><strong>Composição:</strong> Componentes pequenos e combináveis</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span><strong>Acessibilidade:</strong> ARIA e navegação por teclado</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span><strong>Responsividade:</strong> Mobile-first design</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span><strong>Tema:</strong> Suporte a light/dark mode</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
