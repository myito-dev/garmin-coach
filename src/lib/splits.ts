import "server-only";
import { fetchActivitySplits, isGarminConfigured } from "./garmin";
import { readSplitsCache, writeSplitsCache } from "./store";
import type { ActivitySplit } from "./types";

/** Cached per-km splits for an activity. Never throws — returns null if unavailable. */
export async function getActivitySplits(activityId: number): Promise<ActivitySplit[] | null> {
  const cached = await readSplitsCache(activityId);
  if (cached) return cached;

  if (!isGarminConfigured()) return null;

  try {
    const splits = await fetchActivitySplits(activityId);
    if (splits.length > 0) await writeSplitsCache(activityId, splits);
    return splits.length > 0 ? splits : null;
  } catch {
    return null;
  }
}
