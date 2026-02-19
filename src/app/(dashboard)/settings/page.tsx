import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SignOutButton } from "@/components/dashboard/SignOutButton";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie sua conta e preferências
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>
              Informações da sua conta conectada ao Strava
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={session.user.image || ""}
                  alt={session.user.name || ""}
                />
                <AvatarFallback className="text-xl">
                  {session.user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-medium">{session.user.name}</p>
                <p className="text-muted-foreground">{session.user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conexão Strava</CardTitle>
            <CardDescription>
              Status da conexão com sua conta Strava
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg
                  className="h-8 w-8 text-[#FC4C02]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                </svg>
                <div>
                  <p className="font-medium">Strava</p>
                  <p className="text-sm text-muted-foreground">
                    ID: {session.user.stravaId}
                  </p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-600">
                Conectado
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Suas atividades são sincronizadas automaticamente quando você
              completa um treino no Strava.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sobre o PULS</CardTitle>
            <CardDescription>
              Informações sobre o aplicativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              O PULS utiliza inteligência artificial para analisar seus treinos
              e fornecer feedback personalizado.
            </p>
            <p>
              Os dados dos seus treinos são armazenados de forma segura e nunca
              compartilhados com terceiros.
            </p>
            <p className="pt-2">
              <span className="font-medium text-foreground">Versão:</span> 0.1.0
            </p>
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Sessão</CardTitle>
            <CardDescription>
              Gerenciar sua sessão ativa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignOutButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
