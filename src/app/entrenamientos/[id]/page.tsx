import Link from "next/link";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { MetricGrid } from "@/components/ui/MetricGrid";
import { KindBadge } from "@/components/ui/Badges";
import { InsightList } from "@/components/InsightList";
import { PaceBand } from "@/components/charts/PaceBand";
import { HRZoneBar } from "@/components/charts/HRZoneBar";
import { SplitsChart } from "@/components/charts/SplitsChart";
import { SplitsTable } from "@/components/SplitsTable";
import { RouteMapLoader } from "@/components/RouteMapLoader";
import { formatDateLong, formatDistance, formatDuration } from "@/lib/format";
import { analyzeActivity, isPaceGradingUnreliable } from "@/lib/insights";
import { matchActivitiesToPlan } from "@/lib/planMatch";
import { getActivitySplits } from "@/lib/splits";
import { getActivityRoute } from "@/lib/route";
import { readActivitiesCache } from "@/lib/store";

// Reads live Redis state (synced activities + splits) — never prerender this at build time.
export const dynamic = "force-dynamic";

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activityId = Number(id);
  const cache = await readActivitiesCache();
  const activity = cache.activities.find((a) => a.activityId === activityId);

  if (!activity) notFound();

  const matches = matchActivitiesToPlan(cache.activities);
  const match = matches.find((m) => m.actual?.activityId === activityId);
  const planned = match?.planned ?? null;

  const [splits, route] = await Promise.all([getActivitySplits(activityId), getActivityRoute(activityId)]);
  const analysis = analyzeActivity(activity, planned, splits);
  const paceGradingUnreliable = planned ? isPaceGradingUnreliable(planned.kind) : false;

  const metrics = [
    { label: "Distancia", value: formatDistance(activity.distanceMeters) },
    { label: "Duración", value: formatDuration(activity.durationSeconds) },
    { label: "Ritmo promedio", value: `${analysis.paceLabel}/km` },
    ...(activity.averageHR ? [{ label: "FC promedio", value: `${activity.averageHR} bpm` }] : []),
    ...(activity.maxHR ? [{ label: "FC máxima", value: `${activity.maxHR} bpm` }] : []),
    ...(activity.averageCadenceSpm ? [{ label: "Cadencia", value: `${Math.round(activity.averageCadenceSpm)} spm` }] : []),
    ...(activity.calories ? [{ label: "Calorías", value: `${activity.calories} kcal` }] : []),
    ...(activity.elevationGainM ? [{ label: "Desnivel +", value: `${Math.round(activity.elevationGainM)} m` }] : []),
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      <Link href="/entrenamientos" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-accent">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Entrenamientos
      </Link>

      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {planned && <KindBadge kind={planned.kind} />}
          <span className="text-sm text-ink-muted">{formatDateLong(activity.startTimeLocal.slice(0, 10))}</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl">{activity.activityName}</h1>
        {planned && (
          <p className="mt-1 text-ink-secondary">
            Plan: {planned.title}
            {match?.dayOffset ? (
              <span className="ml-2 text-sm text-ink-muted">
                (planeado para el {formatDateLong(planned.date)}, corrido {match.dayOffset > 0 ? `${match.dayOffset} día${match.dayOffset > 1 ? "s" : ""} tarde` : `${Math.abs(match.dayOffset)} día${Math.abs(match.dayOffset) > 1 ? "s" : ""} antes`})
              </span>
            ) : null}
          </p>
        )}
      </div>

      <GlassCard>
        <h2 className="mb-4 text-lg font-semibold">Resumen</h2>
        <MetricGrid metrics={metrics} />
      </GlassCard>

      {route && route.length > 1 && (
        <GlassCard className="!p-0 overflow-hidden">
          <RouteMapLoader points={route} />
        </GlassCard>
      )}

      {planned?.pace && !paceGradingUnreliable && (
        <GlassCard>
          <h2 className="mb-1 text-lg font-semibold">Ritmo vs. objetivo</h2>
          {analysis.usedCorePace && (
            <p className="mb-3 text-sm text-ink-secondary">
              Excluye el primer y último km (calentamiento/enfriamiento) — el promedio de toda la actividad fue {analysis.paceLabel}/km.
            </p>
          )}
          <PaceBand
            fastSecPerKm={planned.pace.fastSecPerKm}
            slowSecPerKm={planned.pace.slowSecPerKm}
            actualSecPerKm={analysis.comparePaceSecPerKm}
            onTarget={analysis.adherence.paceOnTarget}
          />
        </GlassCard>
      )}

      {activity.averageHR && (
        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold">Frecuencia cardíaca</h2>
          <HRZoneBar avgHR={activity.averageHR} maxHR={activity.maxHR} />
        </GlassCard>
      )}

      {splits && splits.length > 1 && (
        <GlassCard>
          <h2 className="mb-1 text-lg font-semibold">Parciales por kilómetro</h2>
          <p className="mb-4 text-sm text-ink-secondary">
            {paceGradingUnreliable
              ? "Estos son los kilómetros automáticos del reloj — como esta sesión es por bloques de tiempo (no por distancia), no coinciden exactamente con tus tramos de trabajo/recuperación. Úsalos como referencia, no como objetivo por km."
              : planned?.pace
                ? "Sombreado: rango de ritmo objetivo de la sesión planeada."
                : "Ritmo real de cada kilómetro registrado por el reloj."}
          </p>
          <SplitsChart splits={splits} targetPace={paceGradingUnreliable ? undefined : planned?.pace} />
          <div className="mt-6 border-t border-hairline pt-4">
            <SplitsTable splits={splits} />
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <h2 className="mb-4 text-lg font-semibold">Análisis</h2>
        <InsightList insights={analysis.insights} />
      </GlassCard>
    </div>
  );
}
