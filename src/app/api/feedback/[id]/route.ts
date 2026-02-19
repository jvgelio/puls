import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { regenerateFeedback, generateFeedback } from "@/lib/services/ai.service";
import { db } from "@/lib/db/client";
import { aiFeedbacks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: activityId } = await context.params;

    // Generate or regenerate feedback
    const feedbackId = await regenerateFeedback(activityId, session.user.id);

    // Fetch the generated feedback
    const feedback = await db.query.aiFeedbacks.findFirst({
      where: eq(aiFeedbacks.id, feedbackId),
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Error generating feedback:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: activityId } = await context.params;

    const feedback = await db.query.aiFeedbacks.findFirst({
      where: eq(aiFeedbacks.activityId, activityId),
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
