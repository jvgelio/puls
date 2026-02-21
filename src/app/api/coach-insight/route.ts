import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getTrainingLoadTrend, calculateFitnessFatigue, calculateSimpleLoad } from "@/lib/services/metrics.service";
import { getUserActivities } from "@/lib/services/activity.service";
import { DEFAULT_AI_MODEL } from "@/lib/ai-models";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

    // 1. Metrics (Fitness, Fatigue, Form)
    const trainingLoadTrend = await getTrainingLoadTrend(userId, 90);
    const fitnessFatigueData = calculateFitnessFatigue(trainingLoadTrend);
    const todayStr = new Date().toISOString().split("T")[0];
    const currentMetrics = fitnessFatigueData[todayStr] || { ctl: 0, atl: 0, tsb: 0 };

    // 2. Detailed activities (last 14 days)
    const recentActivities = await getUserActivities(userId, { limit: 15 });
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const filteredActivities = recentActivities.filter(a =>
        a.startDate && new Date(a.startDate) >= fourteenDaysAgo
    );

    const activityLogs = filteredActivities.map(a => {
        const date = a.startDate ? format(new Date(a.startDate), "dd/MM", { locale: ptBR }) : "??";
        const dist = a.distanceMeters ? (parseFloat(a.distanceMeters) / 1000).toFixed(1) + "km" : "";
        const time = a.movingTimeSeconds ? Math.round(a.movingTimeSeconds / 60) + "min" : "";
        //@ts-ignore - internal usage
        const load = calculateSimpleLoad(a);
        return `- ${date}: ${a.sportType} (${a.name}), ${dist} ${time}, Carga: ${load}`;
    }).join("\n");

    const prompt = `Você é um treinador de performance experiente. Analise os dados do atleta abaixo e dê um feedback motivador, técnico e conciso (máx 3 frases).

**Métricas Atuais:**
- Fitness (CTL): ${currentMetrics.ctl.toFixed(1)}
- Fadiga (ATL): ${currentMetrics.atl.toFixed(1)}
- Forma (TSB): ${currentMetrics.tsb.toFixed(1)}

**Histórico Recente (14 dias):**
${activityLogs || "Nenhum treino registrado."}

**Instruções:**
1. Analise se a relação entre treino e descanso está equilibrada.
2. Comente sobre a Forma (TSB): se estiver muito negativa (<-30), sugira descanso. Se estiver positiva (>5), sugira aumentar intensidade.
3. Seja direto. Responda apenas com o feedback em português brasileiro, sem aspas.`;

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
                "X-Title": "Puls",
            },
            body: JSON.stringify({
                model,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.6,
                max_tokens: 150,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`OpenRouter API error ${response.status}:`, errorText);
            throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
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
        return NextResponse.json({ error: `Failed to generate insight: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
    }
}
