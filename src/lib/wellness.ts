import type { InsightSeverity, WellnessDay } from "./types";

/** Most recent day that actually has sleep data (last night), if any. */
export function latestSleepNight(days: WellnessDay[]): WellnessDay | null {
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].sleepSeconds) return days[i];
  }
  return null;
}

/** Most recent day with any resting-HR reading, if any. */
export function latestRestingHr(days: WellnessDay[]): WellnessDay | null {
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].restingHeartRate) return days[i];
  }
  return null;
}

export function formatHoursMinutes(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.round((totalSeconds % 3600) / 60);
  return `${h} h ${m} min`;
}

const HRV_STATUS_LABEL: Record<string, string> = {
  BALANCED: "Balanceado",
  UNBALANCED: "Desbalanceado",
  LOW: "Bajo",
  POOR: "Pobre",
  NONE: "Sin datos suficientes",
};

const HRV_STATUS_SEVERITY: Record<string, InsightSeverity> = {
  BALANCED: "good",
  UNBALANCED: "warning",
  LOW: "serious",
  POOR: "critical",
  NONE: "warning",
};

export function hrvStatusLabel(status: string | undefined): string {
  if (!status) return "Sin datos";
  return HRV_STATUS_LABEL[status] ?? status;
}

export function hrvStatusSeverity(status: string | undefined): InsightSeverity {
  if (!status) return "warning";
  return HRV_STATUS_SEVERITY[status] ?? "warning";
}

/** Sleep score qualifier -> severity, for consistent color coding with the rest of the app. */
export function sleepScoreSeverity(score: number | undefined): InsightSeverity {
  if (score === undefined) return "warning";
  if (score >= 80) return "good";
  if (score >= 60) return "warning";
  if (score >= 40) return "serious";
  return "critical";
}

export function restingHrDelta(day: WellnessDay | null): number | null {
  if (!day?.restingHeartRate || !day.sevenDayAvgRestingHeartRate) return null;
  return day.restingHeartRate - day.sevenDayAvgRestingHeartRate;
}
