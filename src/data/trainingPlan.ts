// Loads and validates the active training-plan data file (src/data/plans/*.json)
// and exposes it as the same typed constants the rest of the app already uses.
// To follow a different plan later: add a new JSON file conforming to
// src/lib/planSchema.ts under src/data/plans/, then point ACTIVE_PLAN at it.
import ACTIVE_PLAN from "./plans/10k-speed-block-2026.json";
import { paceRange } from "@/lib/format";
import { trainingPlanFileSchema } from "@/lib/planSchema";
import type {
  HRZone,
  PlannedSession,
  RaceInfo,
  SessionKind,
  TrainingWeek,
} from "@/lib/types";

const parsed = trainingPlanFileSchema.parse(ACTIVE_PLAN);

function toPace(field: { fast: string; slow: string } | undefined) {
  return field ? paceRange(field.fast, field.slow) : undefined;
}

const goalPaceSecPerKm = toPace({ fast: parsed.race.goalPace, slow: parsed.race.goalPace })!.fastSecPerKm;

export const RACE: RaceInfo = {
  name: parsed.race.name,
  date: parsed.race.date,
  goalTimeLabel: parsed.race.goalTimeLabel,
  // Derived from pace × distance instead of hardcoded — the half-marathon
  // plan's goal happened to be exactly 2h, which masked this not being wired up.
  goalSeconds: Math.round(goalPaceSecPerKm * parsed.race.distanceKm),
  goalPaceSecPerKm,
  city: parsed.race.city,
  distanceKm: parsed.race.distanceKm,
};

export const HR_ZONES: HRZone[] = parsed.hrZones as HRZone[];

export const DIAGNOSIS = parsed.diagnosis;

export const RACE_STRATEGY = parsed.raceStrategy;

export const STRENGTH_SCHEDULE = parsed.strengthSchedule;

export const SHOES = parsed.shoes as Record<string, string>;

export const SESSION_GUIDES = parsed.sessionGuides as Record<
  SessionKind,
  { title: string; steps: string[]; effort: string; garminHint?: string }
>;

export const WEEKS: TrainingWeek[] = parsed.weeks.map((week) => ({
  ...week,
  days: week.days.map(
    (d): PlannedSession => ({
      ...d,
      pace: toPace(d.pace),
    })
  ),
}));

export function findWeekForDate(iso: string): TrainingWeek | undefined {
  return WEEKS.find((w) => iso >= w.startDate && iso <= w.endDate);
}

export function findSessionForDate(iso: string): PlannedSession | undefined {
  const week = findWeekForDate(iso);
  return week?.days.find((d) => d.date === iso);
}

export function allSessions(): PlannedSession[] {
  return WEEKS.flatMap((w) => w.days);
}

export function plannedKmForWeek(week: TrainingWeek): number {
  return Math.round(week.days.reduce((sum, d) => sum + (d.distanceKm ?? 0), 0) * 10) / 10;
}
