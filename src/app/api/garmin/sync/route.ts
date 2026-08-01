import { NextResponse } from "next/server";
import { fetchRecentActivities, fetchWellnessRange, GarminNotConfiguredError } from "@/lib/garmin";
import { writeActivitiesCache, mergeWellnessCache } from "@/lib/store";

// Wellness fetches ~21 days x 3 calls each in parallel on top of the
// activities list — give this route more headroom than the platform's
// default serverless timeout.
export const maxDuration = 30;

export async function POST() {
  try {
    const [activities, wellness] = await Promise.all([fetchRecentActivities(60), fetchWellnessRange(21)]);
    const [, mergedWellness] = await Promise.all([writeActivitiesCache(activities), mergeWellnessCache(wellness)]);
    return NextResponse.json({
      count: activities.length,
      wellnessCount: mergedWellness.length,
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (err instanceof GarminNotConfiguredError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Error al conectar con Garmin";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
