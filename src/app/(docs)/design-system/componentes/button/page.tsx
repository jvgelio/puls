"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2, Mail, Plus, Trash2 } from "lucide-react";

export default function ButtonPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Button</h1>
        <p className="text-muted-foreground mt-2">
          Componente de botão com múltiplas variantes e tamanhos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Variantes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tamanhos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Com Ícones</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button>
            <Mail /> Email
          </Button>
          <Button variant="outline">
            <Download /> Download
          </Button>
          <Button variant="destructive">
            <Trash2 /> Excluir
          </Button>
          <Button variant="secondary">
            <Plus /> Adicionar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apenas Ícone</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Button size="icon-xs" variant="ghost">
            <Plus />
          </Button>
          <Button size="icon-sm" variant="outline">
            <Mail />
          </Button>
          <Button size="icon">
            <Download />
          </Button>
          <Button size="icon-lg" variant="secondary">
            <Trash2 />
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estados</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button disabled>Desabilitado</Button>
          <Button disabled>
            <Loader2 className="animate-spin" />
            Carregando
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Código</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
{`import { Button } from "@/components/ui/button";

// Variantes
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Tamanhos
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

// Com ícone
<Button><Mail /> Email</Button>

// Apenas ícone
<Button size="icon"><Plus /></Button>

// Desabilitado
<Button disabled>Desabilitado</Button>`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
