"use client";

import { useMemo, useState } from "react";
import { GlassCard } from "./ui/GlassCard";
import { InsightList } from "./InsightList";
import { RangeTabs, RANGE_DAYS, type WellnessRange } from "./RangeTabs";
import { SleepChart } from "./charts/SleepChart";
import { HrvGauge } from "./charts/HrvGauge";
import { HrvRangeChart } from "./charts/HrvRangeChart";
import { TrendLineChart, type TrendPoint } from "./charts/TrendLineChart";
import { addDaysIso, todayIso } from "@/lib/format";
import { computeWellnessInsights } from "@/lib/wellnessInsights";
import type { WellnessDay } from "@/lib/types";

export function SaludHistory({ initialDays }: { initialDays: WellnessDay[] }) {
  const [days, setDays] = useState(initialDays);
  const [range, setRange] = useState<WellnessRange>("1m");
  const [backfilling, setBackfilling] = useState(false);
  const [backfillMsg, setBackfillMsg] = useState<string | null>(null);

  const filteredDays = useMemo(() => {
    const cutoff = addDaysIso(todayIso(), -RANGE_DAYS[range]);
    return days.filter((d) => d.date >= cutoff);
  }, [days, range]);

  const rhrPoints: TrendPoint[] = filteredDays.filter((d) => d.restingHeartRate).map((d) => ({ date: d.date, value: d.restingHeartRate! }));
  const vo2MaxPoints: TrendPoint[] = filteredDays.filter((d) => d.vo2Max).map((d) => ({ date: d.date, value: d.vo2Max! }));
  const insights = useMemo(() => computeWellnessInsights(days), [days]);
  const oldestDate = days[0]?.date;

  async function handleBackfill() {
    setBackfilling(true);
    setBackfillMsg(null);
    try {
      const res = await fetch("/api/garmin/sync-history", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo traer más historial");
      if (data.fetched === 0) {
        setBackfillMsg("Garmin no tiene más historial disponible antes de esta fecha.");
      } else {
        setBackfillMsg(`+${data.fetched} días agregados. Historial desde ${data.oldestDate}.`);
        setDays(data.days as WellnessDay[]);
      }
    } catch (err) {
      setBackfillMsg(err instanceof Error ? err.message : "Error al traer más historial");
    } finally {
      setBackfilling(false);
    }
  }

  return (
    <>
      <GlassCard>
        <h2 className="mb-3 text-lg font-semibold">Insights</h2>
        <InsightList insights={insights} />
      </GlassCard>

      <GlassCard>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Sueño</h2>
          <RangeTabs value={range} onChange={setRange} />
        </div>
        <SleepChart days={filteredDays} />
      </GlassCard>

      <GlassCard>
        <h2 className="mb-2 text-lg font-semibold">HRV nocturno</h2>
        <div className="grid gap-6 sm:grid-cols-[220px_1fr] sm:items-center">
          <HrvGauge days={filteredDays} />
          <HrvRangeChart days={filteredDays} />
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="mb-2 text-lg font-semibold">FC en reposo</h2>
        <TrendLineChart points={rhrPoints} color="var(--accent)" unit=" lpm" />
      </GlassCard>

      <GlassCard>
        <h2 className="mb-1 text-lg font-semibold">VO2 max</h2>
        <p className="mb-2 text-sm text-ink-secondary">
          Estimado de consumo máximo de oxígeno de tu reloj Garmin. Solo se actualiza después de una carrera de calidad, así que avanza en escalones, no día a día.
        </p>
        <TrendLineChart points={vo2MaxPoints} color="var(--accent)" />
      </GlassCard>

      <GlassCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium">Historial: {days.length} días</p>
            <p className="text-sm text-ink-secondary">
              {oldestDate ? `Desde ${oldestDate}. Cada sincronización agrega días nuevos automáticamente.` : "Sin datos todavía."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleBackfill}
            disabled={backfilling}
            className="inline-flex items-center gap-2 rounded-full border border-hairline px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-60"
          >
            {backfilling ? "Trayendo…" : "Traer más historial"}
          </button>
        </div>
        {backfillMsg && <p className="mt-2 text-xs text-ink-muted">{backfillMsg}</p>}
      </GlassCard>
    </>
  );
}
