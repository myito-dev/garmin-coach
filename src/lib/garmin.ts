import "server-only";
import { GarminConnect } from "garmin-connect";
import type { IActivity } from "garmin-connect/dist/garmin/types/activity";
import { readStoredToken, writeStoredToken } from "./store";
import type { ActivitySplit, GarminActivitySummary, GarminTokenPair } from "./types";

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
