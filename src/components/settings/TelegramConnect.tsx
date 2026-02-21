"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TelegramConnectProps {
  initialConnected?: boolean;
}

export function TelegramConnect({ initialConnected }: TelegramConnectProps) {
  const [connected, setConnected] = useState<boolean | null>(initialConnected ?? null);
  const [justConnected, setJustConnected] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (initialConnected === undefined) {
      checkStatus();
    }
    return () => stopPolling();
  }, [initialConnected]);

  // Start polling after code is generated
  useEffect(() => {
    if (code) {
      startPolling();
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [code]);

  // Hide card a few seconds after successful connection
  useEffect(() => {
    if (justConnected) {
      const timer = setTimeout(() => setConnected(true), 4000);
      return () => clearTimeout(timer);
    }
  }, [justConnected]);

  function startPolling() {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/telegram/connect");
        if (res.ok) {
          const data = await res.json();
          if (data.connected) {
            stopPolling();
            setCode(null);
            setJustConnected(true);
          }
        }
      } catch {
        // silently ignore
      }
    }, 3000);
  }

  function stopPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }

  async function checkStatus() {
    try {
      const res = await fetch("/api/telegram/connect");
      if (res.ok) {
        const data = await res.json();
        setConnected(data.connected);
      }
    } catch {
      // silently ignore
    }
  }

  async function generateCode() {
    setLoading(true);
    setError(null);
    setCode(null);

    try {
      const res = await fetch("/api/telegram/connect", { method: "POST" });

      if (!res.ok) {
        throw new Error("Falha ao gerar código. Tente novamente.");
      }

      const data = await res.json();
      setCode(data.code);
      setBotUsername(data.botUsername);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar código");
    } finally {
      setLoading(false);
    }
  }

  // Card disappears after confirming connection
  if (connected === true && !justConnected) return null;

  const deepLink = code && botUsername
    ? `https://t.me/${botUsername}?start=${code}`
    : null;

  return (
    <Card className={justConnected ? "border-green-300 bg-green-50" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Telegram</span>
          {justConnected && (
            <span className="text-xs font-normal text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
              ✓ Conectado
            </span>
          )}
          {!justConnected && connected === false && (
            <span className="text-xs font-normal text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
              Não conectado
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {justConnected && (
          <p className="text-sm text-green-700">
            🎉 Telegram conectado com sucesso! Você receberá o feedback da IA aqui após cada treino.
          </p>
        )}

        {!justConnected && !code && (
          <>
            <p className="text-sm text-zinc-600">
              Conecte seu Telegram para receber o feedback da IA diretamente no mensageiro após cada treino do Strava.
            </p>
            <Button onClick={generateCode} disabled={loading}>
              {loading ? "Gerando código..." : "Conectar Telegram"}
            </Button>
          </>
        )}

        {!justConnected && code && deepLink && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600">
              Clique no botão abaixo para abrir o bot no Telegram e finalizar a conexão:
            </p>
            <a href={deepLink} target="_blank" rel="noopener noreferrer">
              <Button className="w-full">Abrir bot no Telegram</Button>
            </a>
            <p className="text-xs text-zinc-400 text-center">
              Ou envie <code className="bg-zinc-100 px-1 rounded">/start {code}</code> para{" "}
              <a
                href={`https://t.me/${botUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                @{botUsername}
              </a>
            </p>
            <p className="text-xs text-zinc-400 text-center">
              Aguardando conexão<span className="animate-pulse">...</span>
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={generateCode}
              disabled={loading}
            >
              Gerar novo código
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </CardContent>
    </Card>
  );
}
