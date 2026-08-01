import { StatusChip } from "./ui/Badges";
import { formatDate } from "@/lib/format";
import type { WellnessDay } from "@/lib/types";
import {
  formatHoursMinutes,
  hrvStatusLabel,
  hrvStatusSeverity,
  latestRestingHr,
  latestSleepNight,
  restingHrDelta,
  sleepScoreSeverity,
} from "@/lib/wellness";

export function RecoveryCard({ days }: { days: WellnessDay[] }) {
  const night = latestSleepNight(days);
  const hrDay = latestRestingHr(days);
  const delta = restingHrDelta(hrDay);

  if (!night && !hrDay) {
    return <p className="text-sm text-ink-secondary">Todavía no hay datos de sueño ni frecuencia cardíaca sincronizados.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          Sueño{night ? ` · ${formatDate(night.date)}` : ""}
        </span>
        {night?.sleepSeconds ? (
          <>
            <span className="tabular text-2xl font-semibold tracking-tight">{formatHoursMinutes(night.sleepSeconds)}</span>
            {night.sleepScore !== undefined && (
              <StatusChip severity={sleepScoreSeverity(night.sleepScore)} label={`Puntaje ${night.sleepScore}`} />
            )}
          </>
        ) : (
          <span className="text-sm text-ink-secondary">Sin datos</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">HRV nocturno</span>
        {night?.avgOvernightHrv ? (
          <>
            <span className="tabular text-2xl font-semibold tracking-tight">{Math.round(night.avgOvernightHrv)} ms</span>
            <StatusChip severity={hrvStatusSeverity(night.hrvStatus)} label={hrvStatusLabel(night.hrvStatus)} />
          </>
        ) : (
          <span className="text-sm text-ink-secondary">Sin datos</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">FC en reposo</span>
        {hrDay?.restingHeartRate ? (
          <>
            <span className="tabular text-2xl font-semibold tracking-tight">{hrDay.restingHeartRate} lpm</span>
            <span className="text-sm text-ink-secondary">
              {delta === null
                ? hrDay.sevenDayAvgRestingHeartRate
                  ? `Promedio 7 días: ${Math.round(hrDay.sevenDayAvgRestingHeartRate)} lpm`
                  : ""
                : delta === 0
                  ? "Igual al promedio de 7 días"
                  : `${delta > 0 ? "+" : ""}${delta} lpm vs. promedio 7 días`}
            </span>
          </>
        ) : (
          <span className="text-sm text-ink-secondary">Sin datos</span>
        )}
      </div>
    </div>
  );
}
