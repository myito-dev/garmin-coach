"use client";

import { BarChart } from "./bar-chart";
import { Bar } from "./bar";
import { Grid } from "./grid";
import { BarXAxis } from "./bar-x-axis";
import { ChartTooltip } from "./tooltip";
import { STATUS } from "@/lib/chartColors";
import { formatDate } from "@/lib/format";
import { hrvStatusLabel, hrvStatusSeverity } from "@/lib/wellness";
import { useInViewOnce } from "@/lib/useInViewOnce";
import type { WellnessDay } from "@/lib/types";

/**
 * Per-night HRV colored by that night's status. bklit's <Bar> only takes a
 * single fill for the whole series (no per-datum Cell equivalent), so this
 * splits the data into one series per severity — only one series has a
 * real number for any given day, the rest are undefined and skipped — and
 * renders them `stacked` so every bar still lands at full band width in the
 * same x position regardless of which series carries its value.
 */
export function HrvRangeChart({ days }: { days: WellnessDay[] }) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const status = {
    good: STATUS.good.dark,
    warning: STATUS.warning.dark,
    serious: STATUS.serious.dark,
    critical: STATUS.critical.dark,
  };

  const data = days
    .filter((d) => d.avgOvernightHrv)
    .map((d) => {
      const severity = hrvStatusSeverity(d.hrvStatus);
      const value = Math.round(d.avgOvernightHrv!);
      return {
        date: d.date,
        label: formatDate(d.date),
        statusLabel: hrvStatusLabel(d.hrvStatus),
        valueGood: severity === "good" ? value : undefined,
        valueWarning: severity === "warning" ? value : undefined,
        valueSerious: severity === "serious" ? value : undefined,
        valueCritical: severity === "critical" ? value : undefined,
      };
    });

  const withBaseline = [...days].reverse().find((d) => d.hrvBaselineBalancedLow && d.hrvBaselineBalancedUpper);
  const balancedLow = withBaseline?.hrvBaselineBalancedLow;
  const balancedUpper = withBaseline?.hrvBaselineBalancedUpper;

  if (data.length === 0) return <p className="text-sm text-ink-secondary">Todavía no hay suficientes datos sincronizados.</p>;

  const values = days.filter((d) => d.avgOvernightHrv).map((d) => Math.round(d.avgOvernightHrv!));
  const average = Math.round(values.reduce((s, v) => s + v, 0) / values.length);

  return (
    <div ref={ref}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-secondary">
          <LegendDot color={status.good} label="Balanceado" />
          <LegendDot color={status.warning} label="Desbalanceado" />
          <LegendDot color={status.serious} label="Bajo" />
          <LegendDot color={status.critical} label="Pobre" />
        </div>
        <span className="tabular text-sm font-medium text-ink-secondary">Promedio {average} ms</span>
      </div>
      <BarChart
        data={data as unknown as Record<string, unknown>[]}
        xDataKey="label"
        aspectRatio="16 / 7"
        stacked
        barGap={0.35}
        status={inView ? "ready" : "loading"}
      >
        <Grid horizontal strokeDasharray="4,4" highlightRowValues={[average]} />
        <Bar dataKey="valueGood" fill={status.good} />
        <Bar dataKey="valueWarning" fill={status.warning} />
        <Bar dataKey="valueSerious" fill={status.serious} />
        <Bar dataKey="valueCritical" fill={status.critical} />
        <BarXAxis maxLabels={8} />
        <ChartTooltip
          rows={(point) => {
            const p = point as { valueGood?: number; valueWarning?: number; valueSerious?: number; valueCritical?: number; statusLabel?: string };
            const entry =
              p.valueGood !== undefined
                ? { value: p.valueGood, color: status.good }
                : p.valueWarning !== undefined
                  ? { value: p.valueWarning, color: status.warning }
                  : p.valueSerious !== undefined
                    ? { value: p.valueSerious, color: status.serious }
                    : { value: p.valueCritical, color: status.critical };
            return [{ color: entry.color, label: "HRV", value: `${entry.value} ms · ${p.statusLabel}` }];
          }}
        />
      </BarChart>
      {balancedLow !== undefined && balancedUpper !== undefined && (
        <p className="mt-2 text-xs text-ink-muted">Tu rango balanceado actual (según Garmin): {balancedLow}-{balancedUpper} ms.</p>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
