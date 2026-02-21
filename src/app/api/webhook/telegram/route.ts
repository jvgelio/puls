import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: { id: number; first_name: string; username?: string };
    chat: { id: number; type: string };
    text?: string;
  };
}

// Handles incoming messages from the Telegram bot.
// Telegram sends updates here after setWebhook is called.
export async function POST(request: NextRequest) {
  try {
    // Validate the secret token to ensure the request is from Telegram
    const secretHeader = request.headers.get("x-telegram-bot-api-secret-token");
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

    if (!expectedSecret || secretHeader !== expectedSecret) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN is not set");

    const update: TelegramUpdate = await request.json();
    const message = update.message;

    if (!message?.text) {
      return new NextResponse("OK", { status: 200 });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();

    // Handle /start {code} command
    const startMatch = text.match(/^\/start(?:\s+([A-Z0-9]+))?$/i);
    if (!startMatch) {
      // Unknown command — send a helpful reply
      await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId,
        "Olá! Para conectar sua conta PULS, acesse o app e clique em <b>Conectar Telegram</b>. Você receberá um código para enviar aqui.",
        "HTML"
      );
      return new NextResponse("OK", { status: 200 });
    }

    const code = startMatch[1]?.toUpperCase();

    if (!code) {
      await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId,
        "Para conectar sua conta PULS, acesse o app, gere um código e envie <code>/start SEU_CÓDIGO</code> aqui.",
        "HTML"
      );
      return new NextResponse("OK", { status: 200 });
    }

    // Find user by connect code (must not be expired)
    const now = new Date();
    const user = await db.query.users.findFirst({
      where: and(
        eq(users.telegramConnectCode, code),
        gt(users.telegramConnectExpiry, now)
      ),
      columns: { id: true, name: true },
    });

    if (!user) {
      await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId,
        "Código inválido ou expirado. Gere um novo código no app PULS e tente novamente.",
        "HTML"
      );
      return new NextResponse("OK", { status: 200 });
    }

    // Save the Telegram chat ID and clear the connect code
    await db
      .update(users)
      .set({
        telegramChatId: chatId,
        telegramConnectCode: null,
        telegramConnectExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    const firstName = message.from?.first_name ?? "atleta";
    await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId,
      `✅ <b>Conta conectada com sucesso!</b>\n\nOlá, ${firstName}! A partir de agora você receberá feedback da IA direto aqui no Telegram após cada treino registrado no Strava. 🏃‍♂️`,
      "HTML"
    );

    console.log(`Telegram connected for user ${user.id} (chat ${chatId})`);
    return new NextResponse("OK", { status: 200 });

  } catch (error) {
    console.error("Error handling Telegram webhook:", error);
    return new NextResponse("OK", { status: 200 });
  }
}

async function sendTelegramMessage(
  botToken: string,
  chatId: number,
  text: string,
  parseMode?: string
) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode }),
  });
}
