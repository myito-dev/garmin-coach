import { NextResponse } from "next/server";
import { isGarminConfigured } from "@/lib/garmin";
import { hasStoredToken, readActivitiesCache } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const [cache, hasSession] = await Promise.all([readActivitiesCache(), hasStoredToken()]);
  return NextResponse.json({
    configured: isGarminConfigured(),
    hasSession,
    lastSyncedAt: cache.lastSyncedAt,
    activityCount: cache.activities.length,
  });
}
