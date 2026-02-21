// Mapeamento de esporte → cor (CSS class ou hex)
export const SPORT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    Run: { bg: "bg-orange-100", text: "text-orange-700", dot: "#f97316" },
    Ride: { bg: "bg-blue-100", text: "text-blue-700", dot: "#3b82f6" },
    Swim: { bg: "bg-cyan-100", text: "text-cyan-700", dot: "#06b6d4" },
    Walk: { bg: "bg-green-100", text: "text-green-700", dot: "#22c55e" },
    Hike: { bg: "bg-green-100", text: "text-green-700", dot: "#22c55e" },
    WeightTraining: { bg: "bg-purple-100", text: "text-purple-700", dot: "#a855f7" },
    default: { bg: "bg-gray-100", text: "text-gray-700", dot: "#6b7280" },
};
