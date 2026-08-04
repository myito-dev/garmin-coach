import "server-only";
import { fetchActivityRoute, isGarminConfigured } from "./garmin";
import { readRouteCache, writeRouteCache } from "./store";
import type { RoutePoint } from "./types";

/** Cached GPS route for an activity. Never throws — returns null if unavailable (indoor activity, no GPS, etc). */
export async function getActivityRoute(activityId: number): Promise<RoutePoint[] | null> {
  const cached = await readRouteCache(activityId);
  if (cached) return cached;

  if (!isGarminConfigured()) return null;

  try {
    const points = await fetchActivityRoute(activityId);
    if (points.length > 0) await writeRouteCache(activityId, points);
    return points.length > 0 ? points : null;
  } catch {
    return null;
  }
}
