import { db } from "@/lib/db/client";
import { activities, aiFeedbacks } from "@/lib/db/schema";
import { eq, desc, and, gte, ne } from "drizzle-orm";
import { formatDistance, formatDuration, formatPace } from "@/lib/utils/formatters";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface AIFeedbackResponse {
  summary: string;
  positives: string[];
  improvements: string[];
  recommendations: string[];
}

/**
 * Get recent activities for context (last 7 days)
 */
async function getRecentActivities(userId: string, excludeActivityId: string) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return db.query.activities.findMany({
    where: and(
      eq(activities.userId, userId),
      gte(activities.startDate, sevenDaysAgo),
      ne(activities.id, excludeActivityId)
    ),
    orderBy: [desc(activities.startDate)],
    limit: 5,
  });
}

/**
 * Build the prompt for AI feedback
 */
function buildFeedbackPrompt(
  activity: typeof activities.$inferSelect,
  recentActivities: (typeof activities.$inferSelect)[]
): string {
  const distanceKm = parseFloat(activity.distanceMeters || "0") / 1000;
  const movingTimeSeconds = activity.movingTimeSeconds || 0;
  const pace = formatPace(movingTimeSeconds, distanceKm);

  // Format recent activities summary
  const recentSummary = recentActivities
    .filter((a) => a.id !== activity.id)
    .map((a) => {
      const d = parseFloat(a.distanceMeters || "0") / 1000;
      const t = a.movingTimeSeconds || 0;
      return `- ${a.sportType}: ${formatDistance(d)}, ${formatDuration(t)}`;
    })
    .join("\n");

  // Get splits data from raw payload if available
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

  return `Você é um treinador de corrida/ciclismo experiente analisando um treino.

DADOS DO TREINO:
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

Forneça um feedback estruturado em português brasileiro. Responda APENAS com um JSON válido no seguinte formato:
{
  "summary": "Resumo de 1-2 frases sobre o treino",
  "positives": ["Ponto positivo 1", "Ponto positivo 2"],
  "improvements": ["Ponto de atenção 1"],
  "recommendations": ["Recomendação para próximo treino"]
}

Seja específico e baseie-se nos dados fornecidos. Se algum dado não estiver disponível, não invente valores.`;
}

/**
 * Call OpenRouter API with auto model selection
 */
async function callOpenRouter(prompt: string): Promise<{
  content: string;
  model: string;
}> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
      "X-Title": "PULS Training Feedback",
    },
    body: JSON.stringify({
      model: "openrouter/auto",
      messages: [
        {
          role: "system",
          content:
            "Você é um treinador esportivo experiente especializado em corrida e ciclismo. Forneça feedback construtivo e motivador em português brasileiro. Sempre responda com JSON válido.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    model: data.model || "openrouter/auto",
  };
}

/**
 * Parse AI response into structured feedback
 */
function parseAIResponse(content: string): AIFeedbackResponse {
  // Try to extract JSON from the response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in AI response");
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      summary: parsed.summary || "",
      positives: Array.isArray(parsed.positives) ? parsed.positives : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [],
    };
  } catch {
    throw new Error("Failed to parse AI response as JSON");
  }
}

/**
 * Generate AI feedback for an activity
 */
export async function generateFeedback(
  activityId: string,
  userId: string
): Promise<string> {
  console.log(`Generating feedback for activity ${activityId}`);

  // Get the activity
  const activity = await db.query.activities.findFirst({
    where: eq(activities.id, activityId),
  });

  if (!activity) {
    throw new Error(`Activity not found: ${activityId}`);
  }

  // Check if feedback already exists
  const existingFeedback = await db.query.aiFeedbacks.findFirst({
    where: eq(aiFeedbacks.activityId, activityId),
  });

  if (existingFeedback) {
    console.log(`Feedback already exists for activity ${activityId}`);
    return existingFeedback.id;
  }

  // Get recent activities for context
  const recentActivities = await getRecentActivities(userId, activityId);

  // Build prompt
  const prompt = buildFeedbackPrompt(activity, recentActivities);

  // Call OpenRouter API
  const { content, model } = await callOpenRouter(prompt);

  // Parse response
  const feedback = parseAIResponse(content);

  // Save feedback to database
  const [inserted] = await db
    .insert(aiFeedbacks)
    .values({
      activityId,
      userId,
      content: content,
      summary: feedback.summary,
      positives: feedback.positives,
      improvements: feedback.improvements,
      recommendations: feedback.recommendations,
      modelUsed: model,
    })
    .returning();

  console.log(`Generated feedback ${inserted.id} for activity ${activityId}`);
  return inserted.id;
}

/**
 * Regenerate feedback for an activity
 */
export async function regenerateFeedback(
  activityId: string,
  userId: string
): Promise<string> {
  // Delete existing feedback
  await db.delete(aiFeedbacks).where(eq(aiFeedbacks.activityId, activityId));

  // Generate new feedback
  return generateFeedback(activityId, userId);
}
