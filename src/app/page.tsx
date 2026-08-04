import Link from "next/link";
import { DIAGNOSIS, RACE, RACE_STRATEGY, WEEKS, findSessionForDate, findWeekForDate, plannedKmForWeek } from "@/data/trainingPlan";
import { ActivityListRow } from "@/components/ActivityListRow";
import { SyncButton } from "@/components/SyncButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { CountdownRing } from "@/components/ui/CountdownRing";
import { StatPill } from "@/components/ui/StatPill";
import { KindBadge } from "@/components/ui/Badges";
import { Marquee } from "@/components/Marquee";
import { RecoveryCard } from "@/components/RecoveryCard";
import { FloatingPaths } from "@/components/FloatingPaths";
import { RouteGlow } from "@/components/RouteGlow";
import { AnimatedTitle } from "@/components/AnimatedTitle";
import { WeeklyVolumeChart, type WeeklyVolumePoint } from "@/components/charts/WeeklyVolumeChart";
import { formatDateLong, formatPaceRange, daysUntil, paceLabelToSeconds, todayIso } from "@/lib/format";
import { analyzeActivity } from "@/lib/insights";
import { computeLiveDiagnosis } from "@/lib/diagnosis";
import { actualKmForWeek, matchActivitiesToPlan } from "@/lib/planMatch";
import { readActivitiesCache, readWellnessCache } from "@/lib/store";
import { getActivityRoute } from "@/lib/route";
import type { GarminActivitySummary, RoutePoint } from "@/lib/types";

// Reads live Redis state (synced activities) — never prerender this at build time.
export const dynamic = "force-dynamic";

/** Route of the most recent activity that actually has GPS data — tries a
 * handful of the latest activities (not just the very last one, which is
 * often a strength session or rest-day log with no route) and stops at the
 * first hit. Cache-first via getActivityRoute, so this is cheap once warm. */
async function findHeroRoute(activities: GarminActivitySummary[]): Promise<RoutePoint[] | null> {
  const recent = [...activities].sort((a, b) => (a.startTimeLocal < b.startTimeLocal ? 1 : -1)).slice(0, 5);
  for (const activity of recent) {
    const route = await getActivityRoute(activity.activityId);
    if (route && route.length > 1) return route;
  }
  return null;
}

export default async function DashboardPage() {
  const today = todayIso();
  const cache = await readActivitiesCache();
  const wellness = await readWellnessCache();
  const heroRoute = await findHeroRoute(cache.activities);
  const currentWeek = findWeekForDate(today);
  const todaySession = findSessionForDate(today);
  const daysLeft = Math.max(0, daysUntil(RACE.date));
  const planSpanDays = Math.round(
    (new Date(RACE.date + "T00:00:00").getTime() - new Date(WEEKS[0].startDate + "T00:00:00").getTime()) / 86400000
  );

  const matches = matchActivitiesToPlan(cache.activities);
  const recentMatched = matches
    .filter((m) => m.actual)
    .sort((a, b) => (a.planned.date < b.planned.date ? 1 : -1))
    .slice(0, 5);

  const live = computeLiveDiagnosis(cache.activities);
  // A live-detected PR only replaces the seed if it's actually faster — otherwise the
  // seed's known true PR (which might be a split inside a longer run, invisible to
  // simple whole-activity distance matching) stays put instead of looking like a regression.
  function betterRecord(liveRecord: { timeLabel: string; paceLabel: string } | null, seedTimeLabel: string, seedPaceLabel: string) {
    const seedSec = paceLabelToSeconds(seedPaceLabel);
    const liveSec = liveRecord ? paceLabelToSeconds(liveRecord.paceLabel) : null;
    if (liveSec !== null && (seedSec === null || liveSec < seedSec)) {
      return { timeLabel: liveRecord!.timeLabel, paceLabel: liveRecord!.paceLabel };
    }
    return { timeLabel: seedTimeLabel, paceLabel: seedPaceLabel };
  }

  const diag = {
    best10k: betterRecord(live.best10k, DIAGNOSIS.best10k.timeLabel, DIAGNOSIS.best10k.paceLabel),
    best5k: betterRecord(live.best5k, DIAGNOSIS.best5k.timeLabel, DIAGNOSIS.best5k.paceLabel),
    bestHalf: betterRecord(live.bestHalf, DIAGNOSIS.halfCdmx.timeLabel, DIAGNOSIS.halfCdmx.paceLabel),
    riegelPrediction: live.riegelPrediction ?? DIAGNOSIS.riegelPrediction,
    summary: live.hasLiveData ? live.summary : DIAGNOSIS.summary,
  };

  const marqueeItems = [
    { text: `${daysLeft} días para la carrera`, spotlight: true },
    { text: `Mejor 10K ${diag.best10k.timeLabel}` },
    { text: currentWeek ? `${currentWeek.label} de 13` : "Plan de 13 semanas" },
    { text: `Objetivo ${RACE.goalTimeLabel}`, spotlight: true },
    { text: `Mejor medio ${diag.bestHalf.timeLabel}` },
    { text: `Predicción Riegel ${diag.riegelPrediction}` },
  ];

  const volumeData: WeeklyVolumePoint[] = WEEKS.map((w) => ({
    week: w.weekNumber,
    label: `S${w.weekNumber}`,
    plannedKm: plannedKmForWeek(w),
    actualKm: actualKmForWeek(cache.activities, w),
    isCurrent: w.weekNumber === currentWeek?.weekNumber,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      {/* Hero */}
      <GlassCard className="hero-glass relative overflow-hidden !p-0">
        {heroRoute ? <RouteGlow points={heroRoute} /> : <FloatingPaths />}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-[0.20] blur-3xl"
          style={{ background: "radial-gradient(circle, var(--chart-2), transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full opacity-[0.16] blur-3xl"
          style={{ background: "radial-gradient(circle, var(--serious), transparent 70%)" }}
        />
        <div className="relative flex flex-col items-center gap-8 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-12">
          <div className="text-center sm:text-left">
            <p className="eyebrow text-accent">
              {RACE.name} · {RACE.city}
            </p>
            <h1 className="font-display mt-3 text-balance text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
              <AnimatedTitle text="Objetivo" />{" "}
              <AnimatedTitle text={RACE.goalTimeLabel} className="spotlight" delayStart={0.25} />
            </h1>
            <p className="mt-3 text-ink-secondary">{formatDateLong(RACE.date)}</p>
            {currentWeek && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-hairline bg-page px-3 py-1.5 text-sm">
                <span className="h-2 w-2 rounded-full bg-accent" />
                {currentWeek.label} · {currentWeek.phase}
              </div>
            )}
          </div>
          <CountdownRing daysLeft={daysLeft} totalDays={planSpanDays} />
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-3 px-5 pb-6 sm:grid-cols-4 sm:px-10 sm:pb-8">
          <StatPill
            index={0}
            color="blue"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2 3 14h7l-1 8 11-14h-7l1-6z" />
              </svg>
            }
            label="Mejor 10K"
            value={diag.best10k.timeLabel}
            sub={diag.best10k.paceLabel}
          />
          <StatPill
            index={1}
            color="lime"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="4.5" />
                <circle cx="12" cy="12" r="0.5" fill="currentColor" />
              </svg>
            }
            label="Mejor 5K"
            value={diag.best5k.timeLabel}
            sub={diag.best5k.paceLabel}
          />
          <StatPill
            index={2}
            color="green"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="5" />
                <path d="M8.5 12.5 7 22l5-3 5 3-1.5-9.5" />
              </svg>
            }
            label="Mejor medio"
            value={diag.bestHalf.timeLabel}
            sub={diag.bestHalf.paceLabel}
          />
          <StatPill
            index={3}
            color="orange"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17l6-6 4 4 8-8" />
                <path d="M15 7h6v6" />
              </svg>
            }
            label="Predicción Riegel"
            value={diag.riegelPrediction}
            sub="a partir del 10K"
          />
        </div>
        <Marquee items={marqueeItems} />
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today */}
        <GlassCard className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Hoy</h2>
            <span className="text-sm text-ink-muted">{formatDateLong(today)}</span>
          </div>
          {todaySession ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <KindBadge kind={todaySession.kind} />
                {todaySession.shoe && <span className="text-sm text-ink-muted">{todaySession.shoe}</span>}
              </div>
              <p className="text-xl font-semibold">{todaySession.title}</p>
              {todaySession.structure && <p className="text-ink-secondary">{todaySession.structure}</p>}
              <div className="flex flex-wrap gap-4 text-sm text-ink-secondary">
                {todaySession.pace && <span className="tabular">{formatPaceRange(todaySession.pace)}</span>}
                {todaySession.distanceKm && <span className="tabular">{todaySession.distanceKm} km</span>}
              </div>
              <Link href="/plan" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                Ver cómo ejecutarla
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          ) : (
            <p className="text-ink-secondary">Fuera del rango del plan por hoy.</p>
          )}
        </GlassCard>

        {/* Sync status */}
        <GlassCard className="flex flex-col justify-between gap-4">
          <div>
            <h2 className="mb-1 text-lg font-semibold">Garmin Connect</h2>
            <p className="text-sm text-ink-secondary">
              {cache.lastSyncedAt
                ? `Última sincronización: ${new Date(cache.lastSyncedAt).toLocaleString("es-MX")}`
                : "Aún no has sincronizado tus entrenamientos."}
            </p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="tabular text-sm text-ink-muted">{cache.activities.length} actividades en caché</span>
            <SyncButton compact />
          </div>
        </GlassCard>
      </div>

      {/* Weekly volume */}
      <GlassCard>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Volumen semanal</h2>
        </div>
        <WeeklyVolumeChart data={volumeData} />
      </GlassCard>

      {/* Recovery */}
      <GlassCard>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recuperación</h2>
          <Link href="/salud" className="text-sm font-medium text-accent">
            Ver historial
          </Link>
        </div>
        <RecoveryCard days={wellness.days} />
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Diagnosis */}
        <GlassCard>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Diagnóstico</h2>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${live.hasLiveData ? "bg-good/15 text-good" : "bg-page text-ink-muted"}`}>
              {live.hasLiveData ? "Actualizado con tus datos" : "Diagnóstico inicial"}
            </span>
          </div>
          <p className="text-sm text-ink-secondary">{diag.summary}</p>
        </GlassCard>

        {/* Race strategy */}
        <GlassCard>
          <h2 className="mb-3 text-lg font-semibold">Estrategia de carrera</h2>
          <div className="space-y-3">
            {RACE_STRATEGY.map((s) => (
              <div key={s.rangeLabel} className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-page/60 px-3 py-2.5">
                <span className="font-medium">{s.rangeLabel}</span>
                <span className="tabular text-sm text-accent">{s.pace}</span>
                <span className="hidden text-right text-xs text-ink-muted sm:block">{s.note}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Recent activity */}
      <GlassCard>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Entrenamientos recientes</h2>
          <Link href="/entrenamientos" className="text-sm font-medium text-accent">
            Ver todos
          </Link>
        </div>
        {recentMatched.length > 0 ? (
          <div className="space-y-2.5">
            {recentMatched.map((m, i) => {
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
        ) : (
          <p className="text-sm text-ink-secondary">
            Todavía no hay entrenamientos sincronizados. Conecta tu cuenta de Garmin desde{" "}
            <Link href="/configuracion" className="font-medium text-accent">
              Configuración
            </Link>
            .
          </p>
        )}
      </GlassCard>
    </div>
  );
}
