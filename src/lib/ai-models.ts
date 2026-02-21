export const DEFAULT_AI_MODEL = "google/gemini-2.0-flash-001";

export const AI_MODEL_PRESETS = [
  {
    id: "google/gemini-2.0-flash-001",
    label: "Gemini 2.0 Flash",
    description: "Rápido, econômico e alta qualidade (recomendado)",
  },
  {
    id: "google/gemini-flash-1.5",
    label: "Gemini 1.5 Flash",
    description: "Extremamente estável e econômico",
  },
  {
    id: "google/gemini-3-flash-preview",
    label: "Gemini 3 Flash (Preview)",
    description: "Próxima geração, extrema velocidade",
  },
  {
    id: "anthropic/claude-3.5-haiku",
    label: "Claude 3.5 Haiku",
    description: "Excelente custo-benefício da Anthropic",
  },
  {
    id: "openai/gpt-4o-mini",
    label: "GPT-4o Mini",
    description: "Modelo econômico e confiável da OpenAI",
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    label: "Llama 3.3 70B",
    description: "Poderoso modelo open-source",
  },
];
