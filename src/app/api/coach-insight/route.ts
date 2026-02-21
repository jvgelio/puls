import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getWeeklyAggregates, getSportTypeDistribution } from "@/lib/services/metrics.service";
import { DEFAULT_AI_MODEL } from "@/lib/ai-models";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { coachInsightText: true, coachInsightGeneratedAt: true }
    });

    if (!user || !user.coachInsightText) {
        return NextResponse.json({ insight: null });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!user.coachInsightGeneratedAt || new Date(user.coachInsightGeneratedAt) < today) {
        return NextResponse.json({ insight: null }); // Expired cache
    }

    return NextResponse.json({ insight: user.coachInsightText });
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const [userRow] = await db
        .select({ aiModel: users.aiModel })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    let model = userRow?.aiModel || DEFAULT_AI_MODEL;

    const knownInvalid = ["google/gemini-2.5-flash-preview", "google/gemini-2.5-flash-lite", "openai/gpt-5-mini", "openai/gpt-5-nano", "anthropic/claude-haiku-4.5"];
    if (knownInvalid.includes(model)) {
        model = DEFAULT_AI_MODEL;
    }

    const weeks = await getWeeklyAggregates(userId, 2);
    const totalDistance = weeks.reduce((acc, w) => acc + w.totalDistance, 0) / 1000;
    const totalActivities = weeks.reduce((acc, w) => acc + w.activityCount, 0);

    const sportsDist = await getSportTypeDistribution(userId);
    const sportsList = Object.keys(sportsDist).join(", ") || "nenhum";

    const prompt = `Atleta: ${totalActivities} treinos nos últimos 14 dias, ${totalDistance.toFixed(1)}km percorridos, esportes: ${sportsList}.
Dê uma análise breve (máx 2 frases) e uma recomendação concreta. Responda apenas com o texto do feedback, sem json, sem aspas, em português brasileiro.`;

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.6,
                max_tokens: 150,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        let insight = data.choices?.[0]?.message?.content || "";

        insight = insight.replace(/^"|"$|^'|'$/g, '').trim();

        await db
            .update(users)
            .set({
                coachInsightText: insight,
                coachInsightGeneratedAt: new Date(),
            })
            .where(eq(users.id, userId));

        return NextResponse.json({ insight });
    } catch (error) {
        console.error("Coach Insight generation failed:", error);
        return NextResponse.json({ error: "Failed to generate insight" }, { status: 500 });
    }
}
