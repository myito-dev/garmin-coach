import { WEEKS } from "@/data/trainingPlan";
import { addDaysIso } from "./format";
import type { GarminActivitySummary, PlannedSession, TrainingWeek } from "./types";

const RUNNING_TYPES = new Set(["street_running", "trail_running", "indoor_running", "running"]);
/** How many days off-schedule a run can still be considered "the same session, done late/early". */
const DATE_TOLERANCE_DAYS = 2;

export function isRunningActivity(a: GarminActivitySummary): boolean {
  return RUNNING_TYPES.has(a.activityTypeKey) || a.activityTypeKey.includes("running");
}

function isoDateOf(startTimeLocal: string): string {
  return startTimeLocal.slice(0, 10);
}

function pickBest(candidates: GarminActivitySummary[], planned: PlannedSession): GarminActivitySummary {
  if (planned.distanceKm) {
    return candidates.reduce((best, c) => {
      const bestDiff = Math.abs(best.distanceMeters / 1000 - planned.distanceKm!);
      const cDiff = Math.abs(c.distanceMeters / 1000 - planned.distanceKm!);
      return cDiff < bestDiff ? c : best;
    }, candidates[0]);
  }
  return candidates.reduce((best, c) => (c.distanceMeters > best.distanceMeters ? c : best), candidates[0]);
}

export interface MatchResult {
  week: TrainingWeek;
  planned: PlannedSession;
  actual: GarminActivitySummary | null;
  /** Days between the planned date and the matched activity's date. 0 = same day, null = no match. */
  dayOffset: number | null;
}

/**
 * Pairs each planned running session with a Garmin activity. Tries the exact planned
 * date first; if nothing was logged that day, looks up to DATE_TOLERANCE_DAYS days
 * before/after (closest day wins) so a session run a day or two late/early still links up.
 */
export function matchActivitiesToPlan(activities: GarminActivitySummary[]): MatchResult[] {
  const runningActivities = activities.filter(isRunningActivity);
  const byDate = new Map<string, GarminActivitySummary[]>();
  for (const a of runningActivities) {
    const key = isoDateOf(a.startTimeLocal);
    const list = byDate.get(key) ?? [];
    list.push(a);
    byDate.set(key, list);
  }

  const usedActivityIds = new Set<number>();
  const plannedSessions = WEEKS.flatMap((week) =>
    week.days.filter((d) => d.kind !== "descanso" && d.kind !== "fuerza").map((planned) => ({ week, planned }))
  );

  // Pass 1: exact-date matches only, so an on-time run is never bumped by a
  // neighboring day's fuzzy match claimed in an earlier iteration.
  const results: MatchResult[] = plannedSessions.map(({ week, planned }) => {
    const exact = (byDate.get(planned.date) ?? []).filter((a) => !usedActivityIds.has(a.activityId));
    if (exact.length === 0) return { week, planned, actual: null, dayOffset: null };
    const actual = pickBest(exact, planned);
    usedActivityIds.add(actual.activityId);
    return { week, planned, actual, dayOffset: 0 };
  });

  // Pass 2: for sessions still unmatched, look at nearby days (closest first).
  const offsetsByDistance = Array.from({ length: DATE_TOLERANCE_DAYS }, (_, i) => i + 1).flatMap((n) => [-n, n]);
  for (const result of results) {
    if (result.actual) continue;
    for (const offset of offsetsByDistance) {
      const nearbyDate = addDaysIso(result.planned.date, offset);
      const candidates = (byDate.get(nearbyDate) ?? []).filter((a) => !usedActivityIds.has(a.activityId));
      if (candidates.length === 0) continue;
      const actual = pickBest(candidates, result.planned);
      usedActivityIds.add(actual.activityId);
      result.actual = actual;
      result.dayOffset = offset;
      break;
    }
  }

  return results;
}

export function actualKmForWeek(activities: GarminActivitySummary[], week: TrainingWeek): number {
  const km = activities
    .filter(isRunningActivity)
    .filter((a) => {
      const d = isoDateOf(a.startTimeLocal);
      return d >= week.startDate && d <= week.endDate;
    })
    .reduce((sum, a) => sum + a.distanceMeters / 1000, 0);
  return Math.round(km * 10) / 10;
}

export function findActivityById(
  activities: GarminActivitySummary[],
  activityId: number
): GarminActivitySummary | undefined {
  return activities.find((a) => a.activityId === activityId);
}
