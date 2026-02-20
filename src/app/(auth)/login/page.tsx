"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleStravaLogin = () => {
    setIsLoading(true);
    signIn("strava", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">PULS</CardTitle>
          <CardDescription>
            Feedback inteligente para seus treinos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-muted-foreground text-sm">
            <p>Conecte sua conta Strava para começar a receber</p>
            <p>análises de IA dos seus treinos.</p>
          </div>
          <Button
            onClick={handleStravaLogin}
            className="w-full bg-[#FC4C02] hover:bg-[#e54502] text-white"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <svg
                className="mr-2 h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
            )}
            {isLoading ? "Conectando..." : "Conectar com Strava"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Ao conectar, você permite que o PULS acesse seus dados de treino.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
