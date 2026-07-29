import Link from "next/link";
import { ActivityListRow } from "@/components/ActivityListRow";
import { SyncButton } from "@/components/SyncButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatDate, formatDistance, formatPace, mpsToSecPerKm, todayIso } from "@/lib/format";
import { analyzeActivity } from "@/lib/insights";
import { isRunningActivity, matchActivitiesToPlan } from "@/lib/planMatch";
import { readActivitiesCache } from "@/lib/store";

export const metadata = {
  title: "Entrenamientos · Garmin Coach",
};

// Reads live Redis state (synced activities) — never prerender this at build time.
export const dynamic = "force-dynamic";

export default async function EntrenamientosPage() {
  const today = todayIso();
  const cache = await readActivitiesCache();
  const matches = matchActivitiesToPlan(cache.activities);

  const past = matches.filter((m) => m.planned.date <= today).sort((a, b) => (a.planned.date < b.planned.date ? 1 : -1));
  const upcoming = matches.filter((m) => m.planned.date > today).sort((a, b) => (a.planned.date < b.planned.date ? -1 : 1)).slice(0, 4);

  const matchedIds = new Set(matches.filter((m) => m.actual).map((m) => m.actual!.activityId));
  const extras = cache.activities
    .filter((a) => !matchedIds.has(a.activityId))
    .sort((a, b) => (a.startTimeLocal < b.startTimeLocal ? 1 : -1))
    .slice(0, 12);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow text-accent">Historial</p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Entrenamientos</h1>
        </div>
        <SyncButton />
      </div>

      {upcoming.length > 0 && (
        <GlassCard>
          <h2 className="mb-3 text-lg font-semibold">Próximos</h2>
          <div className="space-y-2.5">
            {upcoming.map((m, i) => (
              <ActivityListRow key={m.planned.date + m.planned.title} planned={m.planned} actual={null} score={null} index={i} />
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <h2 className="mb-3 text-lg font-semibold">Realizados vs. plan</h2>
        {past.length === 0 ? (
          <p className="text-sm text-ink-secondary">Aún no hay sesiones planeadas en el pasado.</p>
        ) : (
          <div className="space-y-2.5">
            {past.map((m, i) => {
              const analysis = m.actual ? analyzeActivity(m.actual, m.planned) : null;
              return (
                <ActivityListRow
                  key={m.planned.date + m.planned.title}
                  planned={m.planned}
                  actual={m.actual}
                  score={analysis?.adherence.score ?? null}
                  index={i}
                  dayOffset={m.dayOffset}
                />
              );
            })}
          </div>
        )}
      </GlassCard>

      {extras.length > 0 && (
        <GlassCard>
          <h2 className="mb-1 text-lg font-semibold">Otras actividades sincronizadas</h2>
          <p className="mb-3 text-sm text-ink-secondary">Actividades en Garmin que no corresponden a una sesión del plan.</p>
          <div className="divide-y divide-hairline">
            {extras.map((a) => {
              const running = isRunningActivity(a);
              return (
                <Link
                  key={a.activityId}
                  href={running ? `/entrenamientos/${a.activityId}` : "#"}
                  className={`flex items-center justify-between gap-3 py-3 text-sm ${running ? "hover:text-accent" : "cursor-default"}`}
                >
                  <div>
                    <span className="font-medium">{a.activityName}</span>
                    <span className="ml-2 text-ink-muted">{formatDate(a.startTimeLocal.slice(0, 10))}</span>
                  </div>
                  <div className="flex gap-3 text-ink-muted">
                    <span className="tabular">{formatDistance(a.distanceMeters)}</span>
                    {running && <span className="tabular">{formatPace(mpsToSecPerKm(a.averageSpeedMps))}/km</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
