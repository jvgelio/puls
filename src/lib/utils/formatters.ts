import { formatDistanceToNow, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Format distance in kilometers
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(2)}km`;
}

/**
 * Format distance from meters
 */
export function formatDistanceFromMeters(meters: number): string {
  return formatDistance(meters / 1000);
}

/**
 * Format duration in seconds to HH:MM:SS or MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format duration in a human-readable way
 */
export function formatDurationHuman(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
}

/**
 * Calculate and format pace (min/km)
 */
export function formatPace(seconds: number, distanceKm: number): string {
  if (distanceKm <= 0) return "N/A";

  const paceSeconds = seconds / distanceKm;
  const minutes = Math.floor(paceSeconds / 60);
  const secs = Math.round(paceSeconds % 60);

  return `${minutes}:${secs.toString().padStart(2, "0")} /km`;
}

/**
 * Calculate pace in seconds per km
 */
export function calculatePaceSeconds(
  movingTimeSeconds: number,
  distanceMeters: number
): number {
  if (distanceMeters <= 0) return 0;
  return movingTimeSeconds / (distanceMeters / 1000);
}

/**
 * Format speed in km/h
 */
export function formatSpeed(metersPerSecond: number): string {
  const kmh = metersPerSecond * 3.6;
  return `${kmh.toFixed(1)} km/h`;
}

/**
 * Format heart rate
 */
export function formatHeartRate(bpm: number): string {
  return `${Math.round(bpm)} bpm`;
}

/**
 * Format elevation
 */
export function formatElevation(meters: number): string {
  return `${Math.round(meters)}m`;
}

/**
 * Format cadence
 */
export function formatCadence(cadence: number, sportType?: string): string {
  if (sportType?.toLowerCase().includes("ride") || sportType?.toLowerCase().includes("cycling")) {
    return `${Math.round(cadence)} rpm`;
  }
  // For running, Strava returns cadence as steps per minute (single foot)
  // Multiply by 2 for total steps per minute
  return `${Math.round(cadence * 2)} spm`;
}

/**
 * Format calories
 */
export function formatCalories(calories: number): string {
  return `${Math.round(calories)} kcal`;
}

/**
 * Format date to local string
 */
export function formatDate(
  date: Date | string,
  locale: string = DEFAULT_LOCALE
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format date to short string
 */
export function formatDateShort(
  date: Date | string,
  locale: string = DEFAULT_LOCALE
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format time
 */
export function formatTime(
  date: Date | string,
  locale: string = DEFAULT_LOCALE
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: Date | string,
  locale: string = DEFAULT_LOCALE
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();

  if (differenceInDays(now, d) < 7) {
    return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
  }

  return formatDateShort(d);
}

/**
 * Get sport type emoji
 */
export function getSportEmoji(sportType: string): string {
  const type = sportType.toLowerCase();
  if (type.includes("run")) return "\u{1F3C3}";
  if (type.includes("ride") || type.includes("cycling")) return "\u{1F6B4}";
  if (type.includes("swim")) return "\u{1F3CA}";
  if (type.includes("walk") || type.includes("hike")) return "\u{1F6B6}";
  if (type.includes("weight") || type.includes("workout")) return "\u{1F3CB}";
  return "\u{1F4AA}";
}

/**
 * Get sport type display name in Portuguese
 */
export function getSportDisplayName(sportType: string): string {
  const type = sportType.toLowerCase();
  if (type.includes("run")) return "Corrida";
  if (type.includes("ride") || type.includes("cycling")) return "Ciclismo";
  if (type.includes("swim")) return "Natação";
  if (type.includes("walk")) return "Caminhada";
  if (type.includes("hike")) return "Trilha";
  if (type.includes("weight")) return "Musculação";
  if (type.includes("workout")) return "Treino";
  return sportType;
}
