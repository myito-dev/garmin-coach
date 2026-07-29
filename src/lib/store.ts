import "server-only";
import { getRedis } from "./kv";
import type { ActivitySplit, GarminActivitySummary, GarminTokenPair } from "./types";

const KEY_TOKEN = "garmin:token";
const KEY_CACHE = "activities:cache";
const SPLITS_KEY_PREFIX = "splits:";

interface ActivitiesCache {
  lastSyncedAt: string | null;
  activities: GarminActivitySummary[];
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

export async function clearGarminSession(): Promise<void> {
  const redis = getRedis();
  const splitKeys = await redis.keys(`${SPLITS_KEY_PREFIX}*`);
  await redis.del(KEY_TOKEN, KEY_CACHE, ...splitKeys);
}

export async function readSplitsCache(activityId: number): Promise<ActivitySplit[] | null> {
  return (await getRedis().get<ActivitySplit[]>(`${SPLITS_KEY_PREFIX}${activityId}`)) ?? null;
}

export async function writeSplitsCache(activityId: number, splits: ActivitySplit[]): Promise<void> {
  await getRedis().set(`${SPLITS_KEY_PREFIX}${activityId}`, splits);
}
