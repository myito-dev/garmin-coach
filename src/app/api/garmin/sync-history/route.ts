import { NextResponse } from "next/server";
import { fetchWellnessRange, GarminNotConfiguredError } from "@/lib/garmin";
import { addDaysIso } from "@/lib/format";
import { mergeWellnessCache, readWellnessCache } from "@/lib/store";

// Same rationale as /api/garmin/sync — fetching a 30-day chunk means ~90
// Garmin API calls in parallel.
export const maxDuration = 30;

const CHUNK_DAYS = 30;

/**
 * Fetches one older 30-day chunk of wellness history, ending the day before
 * whatever is currently the oldest cached day — lets the user build up
 * months of history a click at a time without one huge, rate-limit-risky
 * backfill.
 */
export async function POST() {
  try {
    const existing = await readWellnessCache();
    const oldestDate = existing.days[0]?.date ?? new Date().toISOString().slice(0, 10);
    const endIso = addDaysIso(oldestDate, -1);
    const olderDays = await fetchWellnessRange(CHUNK_DAYS, endIso);
    const merged = await mergeWellnessCache(olderDays);
    return NextResponse.json({
      fetched: olderDays.length,
      oldestDate: merged[0]?.date ?? null,
      days: merged,
    });
  } catch (err) {
    if (err instanceof GarminNotConfiguredError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Error al conectar con Garmin";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
