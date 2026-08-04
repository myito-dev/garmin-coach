"use client";

import { BarChart } from "./bar-chart";
import { Bar } from "./bar";
import { Grid } from "./grid";
import { BarXAxis } from "./bar-x-axis";
import { ChartTooltip } from "./tooltip";
import { CATEGORICAL } from "@/lib/chartColors";
import { useIsDark } from "@/lib/useIsDark";
import { useInViewOnce } from "@/lib/useInViewOnce";
import { formatDate } from "@/lib/format";
import { formatHoursMinutes } from "@/lib/wellness";
import type { WellnessDay } from "@/lib/types";

export function SleepChart({ days }: { days: WellnessDay[] }) {
  const isDark = useIsDark();
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const mode = isDark ? "dark" : "light";
  const deep = CATEGORICAL.violet[mode];
  const light = CATEGORICAL.blue[mode];
  const rem = CATEGORICAL.aqua[mode];
  const awake = "var(--chart-grid)";

  const data = days
    .filter((d) => d.sleepSeconds)
    .map((d) => ({
      date: d.date,
      label: formatDate(d.date),
      deepH: Math.round(((d.deepSleepSeconds ?? 0) / 3600) * 10) / 10,
      lightH: Math.round(((d.lightSleepSeconds ?? 0) / 3600) * 10) / 10,
      remH: Math.round(((d.remSleepSeconds ?? 0) / 3600) * 10) / 10,
      awakeH: Math.round(((d.awakeSleepSeconds ?? 0) / 3600) * 10) / 10,
    }));

  if (data.length === 0) return <p className="text-sm text-ink-secondary">Todavía no hay datos de sueño sincronizados.</p>;

  const avgSeconds = days.filter((d) => d.sleepSeconds).reduce((s, d) => s + d.sleepSeconds!, 0) / data.length;
  const avgH = Math.round((avgSeconds / 3600) * 10) / 10;

  return (
    <div ref={ref}>
      <div className="mb-2 flex justify-end">
        <span className="tabular text-sm font-medium text-ink-secondary">Promedio {formatHoursMinutes(avgSeconds)}</span>
      </div>
      <BarChart
        data={data as unknown as Record<string, unknown>[]}
        xDataKey="label"
        aspectRatio="16 / 8"
        stacked
        barGap={0.3}
        status={inView ? "ready" : "loading"}
      >
        <Grid horizontal strokeDasharray="4,4" highlightRowValues={[avgH]} />
        <Bar dataKey="deepH" fill={deep} lineCap={0} />
        <Bar dataKey="lightH" fill={light} lineCap={0} />
        <Bar dataKey="remH" fill={rem} lineCap={0} />
        <Bar dataKey="awakeH" fill={awake} />
        <BarXAxis maxLabels={8} />
        <ChartTooltip
          rows={(point) => [
            { color: deep, label: "Profundo", value: `${point.deepH} h` },
            { color: light, label: "Ligero", value: `${point.lightH} h` },
            { color: rem, label: "REM", value: `${point.remH} h` },
            { color: awake, label: "Despierto", value: `${point.awakeH} h` },
          ]}
        />
      </BarChart>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-secondary">
        <LegendDot color={deep} label="Profundo" />
        <LegendDot color={light} label="Ligero" />
        <LegendDot color={rem} label="REM" />
        <LegendDot color={awake} label="Despierto" />
      </div>
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
