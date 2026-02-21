export const DEFAULT_AI_MODEL = "openrouter/auto";

export const AI_MODEL_PRESETS = [
  {
    id: "openrouter/auto",
    label: "Auto",
    description: "OpenRouter escolhe o melhor modelo disponível (pode ser caro)",
  },
  {
    id: "google/gemini-2.5-flash-preview",
    label: "Gemini 2.5 Flash",
    description: "Rápido, econômico e de alta qualidade (recomendado)",
  },
  {
    id: "google/gemini-flash-1.5",
    label: "Gemini 1.5 Flash",
    description: "Muito econômico, boa qualidade",
  },
  {
    id: "anthropic/claude-haiku-4-5",
    label: "Claude Haiku",
    description: "Ótimo custo-benefício da Anthropic",
  },
  {
    id: "openai/gpt-4o-mini",
    label: "GPT-4o Mini",
    description: "Modelo econômico da OpenAI",
  },
  {
    id: "meta-llama/llama-3.1-8b-instruct:free",
    label: "Llama 3.1 8B (grátis)",
    description: "Gratuito com rate limit — pode falhar em picos de uso",
  },
];
