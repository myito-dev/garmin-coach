// Shared domain types for the training plan, Garmin data, and analysis engine.

export type SessionKind =
  | "rodaje"
  | "fartlek"
  | "tempo"
  | "intervalos"
  | "ritmo_carrera"
  | "long_run"
  | "activacion"
  | "carrera"
  | "descanso"
  | "fuerza";

export interface PaceRange {
  /** seconds per km, lower bound (faster) */
  fastSecPerKm: number;
  /** seconds per km, upper bound (slower) */
  slowSecPerKm: number;
}

export interface PlannedSession {
  day: "Lun" | "Mar" | "Mié" | "Jue" | "Vie" | "Sáb" | "Dom";
  /** ISO date, e.g. 2026-07-20 */
  date: string;
  kind: SessionKind;
  title: string;
  /** Free-form structure description, e.g. "6×2' rápido / 2' trote" */
  structure?: string;
  distanceKm?: number;
  pace?: PaceRange;
  shoe?: string;
  note?: string;
  /** Perceived effort out of 10, if specified */
  effort?: string;
  /** How to build this exact session in Garmin Connect / on the watch. Overrides the generic per-kind hint. */
  garminHint?: string;
}

export interface TrainingWeek {
  weekNumber: number;
  label: string;
  dateRangeLabel: string;
  startDate: string;
  endDate: string;
  phase: string;
  focus: string;
  totalKmLabel: string;
  days: PlannedSession[];
  highlight?: string;
}

export interface HRZone {
  zone: 1 | 2 | 3 | 4 | 5;
  label: string;
  min: number;
  max: number | null;
}

export interface RaceInfo {
  name: string;
  date: string;
  goalTimeLabel: string;
  goalSeconds: number;
  goalPaceSecPerKm: number;
  city: string;
  distanceKm: number;
}

// --- Garmin-derived data -----------------------------------------------

export interface GarminActivitySummary {
  activityId: number;
  activityName: string;
  activityTypeKey: string;
  startTimeLocal: string;
  distanceMeters: number;
  durationSeconds: number;
  movingDurationSeconds?: number;
  averageSpeedMps: number;
  averageHR?: number;
  maxHR?: number;
  averageCadenceSpm?: number;
  calories?: number;
  elevationGainM?: number;
  aerobicTrainingEffect?: number;
}

export interface ActivitySplit {
  index: number;
  distanceMeters: number;
  durationSeconds: number;
  averageSpeedMps: number;
  averageHR?: number;
  maxHR?: number;
  averageCadenceSpm?: number;
  elevationGainM?: number;
}

/** One day of Garmin wellness/health data — separate from activities, synced by calendar date. */
export interface WellnessDay {
  /** ISO date, e.g. 2026-07-30 */
  date: string;
  sleepSeconds?: number;
  deepSleepSeconds?: number;
  lightSleepSeconds?: number;
  remSleepSeconds?: number;
  awakeSleepSeconds?: number;
  /** Garmin's 0-100 sleep score for the night. */
  sleepScore?: number;
  avgOvernightHrv?: number;
  /** e.g. "BALANCED", "UNBALANCED", "LOW", "POOR" — Garmin's own HRV status label. */
  hrvStatus?: string;
  hrvWeeklyAvg?: number;
  /** Personal HRV baseline thresholds (ms), computed by Garmin over several weeks — not a fixed medical range. */
  hrvBaselineLowUpper?: number;
  hrvBaselineBalancedLow?: number;
  hrvBaselineBalancedUpper?: number;
  restingHeartRate?: number;
  sevenDayAvgRestingHeartRate?: number;
  bodyBatteryChange?: number;
}

/** Garmin OAuth1 + OAuth2 token pair, as returned by GarminConnect#exportToken(). Stored opaquely — only garmin.ts interprets its shape. */
export interface GarminTokenPair {
  oauth1: unknown;
  oauth2: unknown;
}

export interface MatchedTraining {
  planned: PlannedSession | null;
  actual: GarminActivitySummary | null;
  week: TrainingWeek;
}

export type InsightSeverity = "good" | "warning" | "serious" | "critical";

export interface Insight {
  severity: InsightSeverity;
  title: string;
  detail: string;
}

export interface ActivityAnalysis {
  activity: GarminActivitySummary;
  planned: PlannedSession | null;
  avgPaceSecPerKm: number;
  paceLabel: string;
  /** Pace actually used to grade against the plan — equals avgPaceSecPerKm unless usedCorePace is true. */
  comparePaceSecPerKm: number;
  /** True when comparePaceSecPerKm is a splits-trimmed "core" pace (warm-up/cool-down excluded) rather than the whole-activity average. */
  usedCorePace: boolean;
  /** True when this session's structure (fartlek/intervalos) makes a pace-vs-target comparison unreliable, so none is graded. */
  paceGradingSkipped: boolean;
  hrZoneBreakdownEstimate?: { zone: number; pct: number }[];
  adherence: {
    paceOnTarget: boolean | null;
    distanceOnTarget: boolean | null;
    score: number; // 0-100
  };
  insights: Insight[];
}
