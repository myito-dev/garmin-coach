import "server-only";
import { GarminConnect } from "garmin-connect";
import type { IActivity } from "garmin-connect/dist/garmin/types/activity";
import { readStoredToken, writeStoredToken } from "./store";
import type { ActivitySplit, GarminActivitySummary, GarminTokenPair, WellnessDay } from "./types";
import { todayIso } from "./format";

interface RawLapDTO {
  distance?: number;
  duration?: number;
  averageSpeed?: number;
  averageHR?: number;
  maxHR?: number;
  averageRunCadence?: number;
  elevationGain?: number;
}

export class GarminNotConfiguredError extends Error {
  constructor() {
    super("Faltan las credenciales de Garmin. Configura GARMIN_EMAIL y GARMIN_PASSWORD en .env.local");
    this.name = "GarminNotConfiguredError";
  }
}

function credentialsConfigured(): boolean {
  return Boolean(process.env.GARMIN_EMAIL && process.env.GARMIN_PASSWORD);
}

async function getAuthenticatedClient(): Promise<GarminConnect> {
  if (!credentialsConfigured()) throw new GarminNotConfiguredError();

  const client = new GarminConnect({
    username: process.env.GARMIN_EMAIL!,
    password: process.env.GARMIN_PASSWORD!,
  });

  const stored = await readStoredToken();
  if (stored) {
    try {
      client.loadToken(stored.oauth1 as never, stored.oauth2 as never);
      // Confirm the restored session is actually valid.
      await client.getUserProfile();
      return client;
    } catch {
      // Stored token expired or invalid — fall through to a fresh login.
    }
  }

  await client.login();
  await writeStoredToken(client.exportToken() as GarminTokenPair);
  return client;
}

function normalizeActivity(a: IActivity): GarminActivitySummary {
  return {
    activityId: a.activityId,
    activityName: a.activityName,
    activityTypeKey: a.activityType?.typeKey ?? "other",
    startTimeLocal: a.startTimeLocal,
    distanceMeters: a.distance ?? 0,
    durationSeconds: a.duration ?? 0,
    movingDurationSeconds: a.movingDuration ?? undefined,
    averageSpeedMps: a.averageSpeed ?? 0,
    averageHR: a.averageHR || undefined,
    maxHR: a.maxHR || undefined,
    averageCadenceSpm: a.averageRunningCadenceInStepsPerMinute || undefined,
    calories: a.calories || undefined,
    elevationGainM: a.elevationGain || undefined,
    aerobicTrainingEffect:
      typeof a.aerobicTrainingEffect === "number" ? a.aerobicTrainingEffect : undefined,
  };
}

export async function fetchRecentActivities(limit = 40): Promise<GarminActivitySummary[]> {
  const client = await getAuthenticatedClient();
  const activities = await client.getActivities(0, limit);
  return activities.map(normalizeActivity);
}

/**
 * Auto-lap splits (usually per km) for an activity. This hits an undocumented
 * Garmin Connect endpoint (there is no public API for it) using the same
 * authenticated session as everything else — see the "Custom requests"
 * pattern in the garmin-connect README.
 */
export async function fetchActivitySplits(activityId: number): Promise<ActivitySplit[]> {
  const client = await getAuthenticatedClient();
  const url = `https://connectapi.garmin.com/activity-service/activity/${activityId}/splits`;
  const res = await client.get<{ lapDTOs?: RawLapDTO[] }>(url);
  const laps = res?.lapDTOs ?? [];
  return laps.map((lap, i) => ({
    index: i + 1,
    distanceMeters: lap.distance ?? 0,
    durationSeconds: lap.duration ?? 0,
    averageSpeedMps: lap.averageSpeed ?? 0,
    averageHR: lap.averageHR || undefined,
    maxHR: lap.maxHR || undefined,
    averageCadenceSpm: lap.averageRunCadence || undefined,
    elevationGainM: lap.elevationGain || undefined,
  }));
}

interface RawSleepDTO {
  sleepTimeSeconds?: number;
  deepSleepSeconds?: number;
  lightSleepSeconds?: number;
  remSleepSeconds?: number;
  awakeSleepSeconds?: number;
  sleepScores?: { overall?: { value?: number } };
}

interface RawSleepData {
  dailySleepDTO?: RawSleepDTO;
  avgOvernightHrv?: number;
  hrvStatus?: string;
  restingHeartRate?: number;
  bodyBatteryChange?: number;
}

interface RawHeartRate {
  restingHeartRate?: number;
  lastSevenDaysAvgRestingHeartRate?: number;
}

interface RawHrvBaseline {
  hrvSummary?: {
    weeklyAvg?: number;
    lastNightAvg?: number;
    baseline?: {
      lowUpper?: number;
      balancedLow?: number;
      balancedUpper?: number;
    };
  };
}

function isoDateOf(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Garmin's personal HRV "balanced range" thresholds for a given night — a
 * rolling baseline computed over several weeks, not a fixed medical range.
 * This is a separate undocumented endpoint from getSleepData's overnight
 * HRV average (see the "Custom requests" pattern already used for splits).
 */
async function fetchHrvBaseline(client: GarminConnect, isoDate: string): Promise<RawHrvBaseline["hrvSummary"] | null> {
  try {
    const res = await client.get<RawHrvBaseline>(`https://connectapi.garmin.com/hrv-service/hrv/${isoDate}`);
    return res?.hrvSummary ?? null;
  } catch {
    return null;
  }
}

async function fetchWellnessDay(client: GarminConnect, date: Date): Promise<WellnessDay | null> {
  const isoDate = isoDateOf(date);
  const [sleep, hr, hrv] = await Promise.all([
    client.getSleepData(date).catch(() => null) as Promise<RawSleepData | null>,
    client.getHeartRate(date).catch(() => null) as Promise<RawHeartRate | null>,
    fetchHrvBaseline(client, isoDate),
  ]);
  const dto = sleep?.dailySleepDTO;
  const restingHeartRate = sleep?.restingHeartRate || hr?.restingHeartRate || undefined;
  if (!dto?.sleepTimeSeconds && !restingHeartRate) return null;

  return {
    date: isoDate,
    sleepSeconds: dto?.sleepTimeSeconds || undefined,
    deepSleepSeconds: dto?.deepSleepSeconds || undefined,
    lightSleepSeconds: dto?.lightSleepSeconds || undefined,
    remSleepSeconds: dto?.remSleepSeconds || undefined,
    awakeSleepSeconds: dto?.awakeSleepSeconds || undefined,
    sleepScore: dto?.sleepScores?.overall?.value ?? undefined,
    avgOvernightHrv: sleep?.avgOvernightHrv || hrv?.lastNightAvg || undefined,
    hrvStatus: sleep?.hrvStatus || undefined,
    hrvWeeklyAvg: hrv?.weeklyAvg || undefined,
    hrvBaselineLowUpper: hrv?.baseline?.lowUpper || undefined,
    hrvBaselineBalancedLow: hrv?.baseline?.balancedLow || undefined,
    hrvBaselineBalancedUpper: hrv?.baseline?.balancedUpper || undefined,
    restingHeartRate,
    sevenDayAvgRestingHeartRate: hr?.lastSevenDaysAvgRestingHeartRate || undefined,
    bodyBatteryChange: sleep?.bodyBatteryChange,
  };
}

/**
 * Sleep, HRV and resting-HR history — Garmin wellness data is per calendar
 * day (not per activity), so this fetches a window of dates in parallel
 * rather than paging through an activities-style list. `endIso` is the most
 * recent date in the window (inclusive); pass an older date to page further
 * back for a manual history backfill instead of re-fetching recent days.
 */
export async function fetchWellnessRange(days = 14, endIso?: string): Promise<WellnessDay[]> {
  const client = await getAuthenticatedClient();
  const end = new Date((endIso ?? todayIso()) + "T00:00:00");
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    return d;
  });
  const results = await Promise.all(dates.map((d) => fetchWellnessDay(client, d)));
  return results
    .filter((w): w is WellnessDay => w !== null)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export async function checkGarminConnection(): Promise<{ ok: boolean; userName?: string; error?: string }> {
  try {
    const client = await getAuthenticatedClient();
    const profile = await client.getUserProfile();
    return { ok: true, userName: (profile as { userName?: string })?.userName };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export function isGarminConfigured(): boolean {
  return credentialsConfigured();
}
