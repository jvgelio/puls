import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";

export default function CardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Card</h1>
        <p className="text-muted-foreground mt-2">
          Container para agrupar conteúdo relacionado com header, body e footer.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estrutura Básica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Título do Card</CardTitle>
                <CardDescription>Descrição opcional do card</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Conteúdo principal do card.</p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Ação</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Card Simples</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Card sem descrição e sem footer.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Com Ação no Header</CardTitle>
        </CardHeader>
        <CardContent>
          <Card>
            <CardHeader>
              <CardTitle>Card com Ação</CardTitle>
              <CardDescription>O botão fica alinhado à direita</CardDescription>
              <CardAction>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p>Use CardAction para adicionar botões ou menus no header.</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variações de Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold">42</div>
                <p className="text-sm text-muted-foreground mt-1">Treinos</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10" />
                <div>
                  <p className="font-medium">Usuário</p>
                  <p className="text-sm text-muted-foreground">Atleta</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-6">
                <p className="font-semibold">Card Destacado</p>
                <p className="text-sm opacity-90 mt-1">Com cores invertidas</p>
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
{`import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Estrutura completa
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
    <CardAction>
      <Button variant="ghost" size="icon-sm">
        <MoreHorizontal />
      </Button>
    </CardAction>
  </CardHeader>
  <CardContent>
    <p>Conteúdo</p>
  </CardContent>
  <CardFooter>
    <Button>Ação</Button>
  </CardFooter>
</Card>

// Card simples
<Card>
  <CardContent className="pt-6">
    Conteúdo sem header
  </CardContent>
</Card>`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
