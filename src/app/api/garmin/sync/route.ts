import { NextResponse } from "next/server";
import { fetchRecentActivities, GarminNotConfiguredError } from "@/lib/garmin";
import { writeActivitiesCache } from "@/lib/store";

export async function POST() {
  try {
    const activities = await fetchRecentActivities(60);
    await writeActivitiesCache(activities);
    return NextResponse.json({ count: activities.length, syncedAt: new Date().toISOString() });
  } catch (err) {
    if (err instanceof GarminNotConfiguredError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Error al conectar con Garmin";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
