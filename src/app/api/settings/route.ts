import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DEFAULT_AI_MODEL } from "@/lib/services/ai.service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const [user] = await db
    .select({ aiModel: users.aiModel })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return NextResponse.json({ aiModel: user?.aiModel ?? null });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const body = await request.json();
  const aiModel = typeof body.aiModel === "string" && body.aiModel.trim()
    ? body.aiModel.trim()
    : null;

  // Validate length
  if (aiModel && aiModel.length > 100) {
    return NextResponse.json({ error: "Model ID too long" }, { status: 400 });
  }

  await db
    .update(users)
    .set({ aiModel, updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ aiModel: aiModel ?? DEFAULT_AI_MODEL });
}
