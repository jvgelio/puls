import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

// Generates a one-time 6-character alphanumeric code so the user can link their Telegram account.
// The code expires in 30 minutes.
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const botUsername = process.env.TELEGRAM_BOT_USERNAME;
    if (!botUsername) throw new Error("TELEGRAM_BOT_USERNAME is not set");

    const code = randomBytes(3).toString("hex").toUpperCase(); // e.g., "A1B2C3"
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await db
      .update(users)
      .set({
        telegramConnectCode: code,
        telegramConnectExpiry: expiry,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ code, botUsername });
  } catch (error) {
    console.error("Error generating Telegram connect code:", error);
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });
  }
}

// Returns the current Telegram connection status for the authenticated user.
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { telegramChatId: true },
    });

    return NextResponse.json({ connected: !!user?.telegramChatId });
  } catch (error) {
    console.error("Error checking Telegram connection:", error);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}
