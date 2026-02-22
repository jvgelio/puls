import { db } from "@/lib/db/client";
import { activities, aiFeedbacks, users } from "@/lib/db/schema";
import { eq, desc, and, gte, ne } from "drizzle-orm";
import { formatDistance, formatDuration, formatPace } from "@/lib/utils/formatters";
import { DEFAULT_AI_MODEL, AI_MODEL_PRESETS } from "@/lib/ai-models";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface AIFeedbackResponse {
  summary: string;
  positives: string[];
  improvements: string[];
  recommendations: string[];
}

async function getRecentActivities(userId: string, excludeActivityId: string) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return db.query.activities.findMany({
    where: and(
      eq(activities.userId, userId),
      ne(activities.id, excludeActivityId),
      gte(activities.startDate, sevenDaysAgo),
    ),
    orderBy: [desc(activities.startDate)],
    limit: 5,
  });
}

function buildFeedbackPrompt(
  activity: typeof activities.$inferSelect,
  recentActivities: (typeof activities.$inferSelect)[]
): string {
  const distanceKm = parseFloat(activity.distanceMeters || "0") / 1000;
  const movingTimeSeconds = activity.movingTimeSeconds || 0;
  const pace = formatPace(movingTimeSeconds, distanceKm);

  const recentSummary = recentActivities
    .map((a) => {
      const d = parseFloat(a.distanceMeters || "0") / 1000;
      const t = a.movingTimeSeconds || 0;
      return `- ${a.sportType}: ${formatDistance(d)}, ${formatDuration(t)}`;
    })
    .join("\n");

  const rawPayload = activity.rawPayload as Record<string, unknown> | null;
  const splits = rawPayload?.splits_metric || rawPayload?.splits_standard || [];
  const splitsInfo = Array.isArray(splits) && splits.length > 0
    ? `Splits por km: ${splits.slice(0, 5).map((s: { average_speed?: number }) => {
      if (s.average_speed && s.average_speed > 0) {
        const paceMinutes = 1000 / (s.average_speed * 60);
        const mins = Math.floor(paceMinutes);
        const secs = Math.round((paceMinutes - mins) * 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
      }
      return "N/A";
    }).join(", ")}${splits.length > 5 ? "..." : ""}`
    : "";

  return `DADOS DO TREINO:
- Tipo: ${activity.sportType || "Não especificado"}
- Distância: ${formatDistance(distanceKm)}
- Tempo em movimento: ${formatDuration(movingTimeSeconds)}
- Tempo total: ${formatDuration(activity.elapsedTimeSeconds || 0)}
- Pace/Velocidade média: ${pace}
- FC média: ${activity.averageHeartrate ? `${activity.averageHeartrate} bpm` : "não disponível"}
- FC máxima: ${activity.maxHeartrate ? `${activity.maxHeartrate} bpm` : "não disponível"}
- Elevação total: ${activity.totalElevationGain || 0}m
- Cadência média: ${activity.averageCadence ? `${activity.averageCadence} spm` : "não disponível"}
- Calorias: ${activity.calories || "não disponível"}
${splitsInfo ? `- ${splitsInfo}` : ""}

${recentSummary ? `HISTÓRICO RECENTE (últimos 7 dias):\n${recentSummary}` : "Primeiro treino registrado."}

Responda APENAS com um JSON válido:
{
  "summary": "Resumo de 1-2 frases sobre o treino",
  "positives": ["Ponto positivo 1", "Ponto positivo 2"],
  "improvements": ["Ponto de atenção 1"],
  "recommendations": ["Recomendação para próximo treino"]
}

Seja específico e baseie-se nos dados fornecidos. Se algum dado não estiver disponível, não invente valores.`;
}

async function callOpenRouter(prompt: string, model: string, options: { asJson?: boolean; systemMessage?: string } = {}): Promise<{
  content: string;
  model: string;
}> {
  const asJson = options.asJson ?? true;
  const sysMsg = options.systemMessage ?? "Você é um treinador esportivo experiente. Analise o treino e forneça feedback construtivo e motivador em português brasileiro. Responda sempre com JSON válido.";
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
      "X-Title": "PULS Training Feedback",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: sysMsg,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
      ...(asJson ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    model: data.model || model,
  };
}

function parseAIResponse(content: string): AIFeedbackResponse {
  // Try direct parse first (works when model returns clean JSON)
  try {
    const parsed = JSON.parse(content);
    return {
      summary: parsed.summary || "",
      positives: Array.isArray(parsed.positives) ? parsed.positives : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    };
  } catch {
    // Fallback: extract JSON block from markdown or mixed content
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in AI response");
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      summary: parsed.summary || "",
      positives: Array.isArray(parsed.positives) ? parsed.positives : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    };
  }
}

export async function generateFeedback(
  activityId: string,
  userId: string
): Promise<string> {
  console.log(`Generating feedback for activity ${activityId}`);

  const activity = await db.query.activities.findFirst({
    where: eq(activities.id, activityId),
  });

  if (!activity) {
    throw new Error(`Activity not found: ${activityId}`);
  }

  const existingFeedback = await db.query.aiFeedbacks.findFirst({
    where: eq(aiFeedbacks.activityId, activityId),
  });

  if (existingFeedback) {
    console.log(`Feedback already exists for activity ${activityId}`);
    return existingFeedback.id;
  }

  // Fetch user's preferred model
  const [userRow] = await db
    .select({ aiModel: users.aiModel })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  let model = userRow?.aiModel || DEFAULT_AI_MODEL;

  // Safety fallback for known invalid/hallucinated model IDs from previous versions
  const knownInvalid = ["google/gemini-2.5-flash-preview", "google/gemini-2.5-flash-lite", "openai/gpt-5-mini", "openai/gpt-5-nano", "anthropic/claude-haiku-4.5"];
  if (knownInvalid.includes(model)) {
    model = DEFAULT_AI_MODEL;
  }

  const recentActivities = await getRecentActivities(userId, activityId);
  const prompt = buildFeedbackPrompt(activity, recentActivities);
  const { content, model: usedModel } = await callOpenRouter(prompt, model);
  const feedback = parseAIResponse(content);

  const [inserted] = await db
    .insert(aiFeedbacks)
    .values({
      activityId,
      userId,
      content,
      summary: feedback.summary,
      positives: feedback.positives,
      improvements: feedback.improvements,
      recommendations: feedback.recommendations,
      modelUsed: usedModel,
    })
    .returning();

  console.log(`Generated feedback ${inserted.id} using ${usedModel}`);
  return inserted.id;
}

export async function regenerateFeedback(
  activityId: string,
  userId: string
): Promise<string> {
  await db.delete(aiFeedbacks).where(eq(aiFeedbacks.activityId, activityId));
  return generateFeedback(activityId, userId);
}

export async function generateBotResponse(userId: string, userMessage: string): Promise<string> {
  const [userRow] = await db
    .select({ aiModel: users.aiModel, name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!userRow) throw new Error("User not found");

  let model = userRow.aiModel || DEFAULT_AI_MODEL;
  const knownInvalid = ["google/gemini-2.5-flash-preview", "google/gemini-2.5-flash-lite", "openai/gpt-5-mini", "openai/gpt-5-nano", "anthropic/claude-haiku-4.5"];
  if (knownInvalid.includes(model)) model = DEFAULT_AI_MODEL;

  // Use dummy string to avoid matching an activity, effectively getting the `limit: 5` most recent
  const recentActivities = await getRecentActivities(userId, "000");

  const recentSummary = recentActivities
    .map((a) => {
      const d = parseFloat(a.distanceMeters || "0") / 1000;
      const t = a.movingTimeSeconds || 0;
      return `- ${a.startDate?.toISOString().split('T')[0] || ""} | ${a.sportType}: ${formatDistance(d)}, ${formatDuration(t)}`;
    })
    .join("\n");

  const prompt = `O atleta ${userRow.name || "usuário"} enviou a seguinte mensagem no chat: "${userMessage}".
  
Aqui estão os treinos mais recentes dele (últimos 7 dias):
${recentSummary || "Nenhum treino recente."}

Responda à mensagem dele como um treinador pessoal e AI Coach (seu nome é PULS Advisor). 
Seja amigável, direto, curto (máx 2 parágrafos) e fale em português do Brasil. 
Você tem acesso aos dados recentes dele. Responda em texto simples formatado para o Telegram (use Markdown com asteriscos simples * para negrito, não use asteriscos duplos **. Pode usar emojis). 
NÃO USE JSON. APENAS TEXTO.`;

  const { content } = await callOpenRouter(prompt, model, {
    asJson: false,
    systemMessage: "Você é um treinador esportivo AI (PULS Advisor). Responda diretamente e de forma amigável e concisa."
  });

  return content;
}
