import "server-only";
import { getRedis } from "./kv";
import type { ActivitySplit, GarminActivitySummary, GarminTokenPair, RoutePoint, WellnessDay } from "./types";

const KEY_TOKEN = "garmin:token";
const KEY_CACHE = "activities:cache";
const KEY_WELLNESS_CACHE = "wellness:cache";
const SPLITS_KEY_PREFIX = "splits:";
// v2: route data now sourced from geoPolylineDTO instead of the unordered
// activityDetailMetrics fallback — versioned so already-cached bad routes
// (from before the fix) are naturally orphaned instead of served stale.
const ROUTE_KEY_PREFIX = "route:v2:";

interface ActivitiesCache {
  lastSyncedAt: string | null;
  activities: GarminActivitySummary[];
}

interface WellnessCache {
  lastSyncedAt: string | null;
  days: WellnessDay[];
}

export async function hasStoredToken(): Promise<boolean> {
  const token = await getRedis().get(KEY_TOKEN);
  return token !== null;
}

export async function readStoredToken(): Promise<GarminTokenPair | null> {
  return (await getRedis().get<GarminTokenPair>(KEY_TOKEN)) ?? null;
}

export async function writeStoredToken(token: GarminTokenPair): Promise<void> {
  await getRedis().set(KEY_TOKEN, token);
}

export async function readActivitiesCache(): Promise<ActivitiesCache> {
  const cache = await getRedis().get<ActivitiesCache>(KEY_CACHE);
  return cache ?? { lastSyncedAt: null, activities: [] };
}

export async function writeActivitiesCache(activities: GarminActivitySummary[]): Promise<void> {
  const payload: ActivitiesCache = { lastSyncedAt: new Date().toISOString(), activities };
  await getRedis().set(KEY_CACHE, payload);
}

// Cap how many days of wellness history we keep, so the cache doesn't grow forever.
const WELLNESS_MAX_DAYS = 400;

export async function readWellnessCache(): Promise<WellnessCache> {
  const cache = await getRedis().get<WellnessCache>(KEY_WELLNESS_CACHE);
  return cache ?? { lastSyncedAt: null, days: [] };
}

/**
 * Merges freshly-fetched days into whatever history is already cached
 * (newer fetch wins on overlapping dates, since a day's data can still
 * change as it progresses) instead of overwriting — each sync accumulates
 * more history rather than only ever showing the last fetch window.
 */
export async function mergeWellnessCache(freshDays: WellnessDay[]): Promise<WellnessDay[]> {
  const existing = await readWellnessCache();
  const byDate = new Map(existing.days.map((d) => [d.date, d]));
  for (const day of freshDays) byDate.set(day.date, day);
  const merged = Array.from(byDate.values())
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-WELLNESS_MAX_DAYS);
  const payload: WellnessCache = { lastSyncedAt: new Date().toISOString(), days: merged };
  await getRedis().set(KEY_WELLNESS_CACHE, payload);
  return merged;
}

export async function clearGarminSession(): Promise<void> {
  const redis = getRedis();
  const splitKeys = await redis.keys(`${SPLITS_KEY_PREFIX}*`);
  const routeKeys = await redis.keys(`${ROUTE_KEY_PREFIX}*`);
  await redis.del(KEY_TOKEN, KEY_CACHE, KEY_WELLNESS_CACHE, ...splitKeys, ...routeKeys);
}

export async function readSplitsCache(activityId: number): Promise<ActivitySplit[] | null> {
  return (await getRedis().get<ActivitySplit[]>(`${SPLITS_KEY_PREFIX}${activityId}`)) ?? null;
}

export async function writeSplitsCache(activityId: number, splits: ActivitySplit[]): Promise<void> {
  await getRedis().set(`${SPLITS_KEY_PREFIX}${activityId}`, splits);
}

export async function readRouteCache(activityId: number): Promise<RoutePoint[] | null> {
  return (await getRedis().get<RoutePoint[]>(`${ROUTE_KEY_PREFIX}${activityId}`)) ?? null;
}

// A route never changes once recorded — this TTL isn't about staleness, it's
// a safety net so a future parsing bug doesn't require another manual key-prefix bump.
const ROUTE_CACHE_TTL_SECONDS = 60 * 60 * 24 * 90;

export async function writeRouteCache(activityId: number, points: RoutePoint[]): Promise<void> {
  await getRedis().set(`${ROUTE_KEY_PREFIX}${activityId}`, points, { ex: ROUTE_CACHE_TTL_SECONDS });
}
