"use client";

import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CATEGORICAL, CHART } from "@/lib/chartColors";
import { formatDate } from "@/lib/format";
import { formatHoursMinutes } from "@/lib/wellness";
import { useIsDark } from "@/lib/useIsDark";
import type { WellnessDay } from "@/lib/types";

export function SleepChart({ days }: { days: WellnessDay[] }) {
  const isDark = useIsDark();
  const c = isDark ? CHART.dark : CHART.light;
  const mode = isDark ? "dark" : "light";
  const deep = CATEGORICAL.violet[mode];
  const light = CATEGORICAL.blue[mode];
  const rem = CATEGORICAL.aqua[mode];
  const awake = c.baseline;

  const data = days
    .filter((d) => d.sleepSeconds)
    .map((d) => ({
      date: d.date,
      label: formatDate(d.date),
      deepH: (d.deepSleepSeconds ?? 0) / 3600,
      lightH: (d.lightSleepSeconds ?? 0) / 3600,
      remH: (d.remSleepSeconds ?? 0) / 3600,
      awakeH: (d.awakeSleepSeconds ?? 0) / 3600,
      totalH: (d.sleepSeconds ?? 0) / 3600,
    }));

  if (data.length === 0) return <p className="text-sm text-ink-secondary">Todavía no hay datos de sueño sincronizados.</p>;

  const avgSeconds = days.filter((d) => d.sleepSeconds).reduce((s, d) => s + d.sleepSeconds!, 0) / data.length;
  const avgH = avgSeconds / 3600;

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <span className="tabular text-sm font-medium text-ink-secondary">Promedio {formatHoursMinutes(avgSeconds)}</span>
      </div>
      <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
          <CartesianGrid vertical={false} stroke={c.gridline} strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fill: c.muted, fontSize: 11 }} axisLine={{ stroke: c.baseline }} tickLine={false} interval={data.length > 10 ? Math.ceil(data.length / 8) : 0} />
          <YAxis
            tick={{ fill: c.muted, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={30}
            tickFormatter={(v) => `${v}h`}
          />
          <ReferenceLine y={avgH} stroke={c.baseline} strokeDasharray="4 4" />
          <Tooltip
            cursor={{ fill: c.gridline, opacity: 0.4 }}
            contentStyle={{
              background: c.surface,
              border: `1px solid ${c.gridline}`,
              borderRadius: 14,
              fontSize: 12,
              color: c.ink,
              boxShadow: "0 8px 24px -8px rgb(0 0 0 / 0.18)",
            }}
            labelStyle={{ color: c.ink }}
            itemStyle={{ color: c.ink }}
            formatter={(value, name) => {
              const label = { deepH: "Profundo", lightH: "Ligero", remH: "REM", awakeH: "Despierto" }[name as string] ?? name;
              return [`${Number(value).toFixed(1)} h`, label];
            }}
          />
          <Bar dataKey="deepH" stackId="sleep" fill={deep} radius={[0, 0, 0, 0]} animationDuration={450} animationEasing="ease-out" />
          <Bar dataKey="lightH" stackId="sleep" fill={light} radius={[0, 0, 0, 0]} animationDuration={450} animationEasing="ease-out" />
          <Bar dataKey="remH" stackId="sleep" fill={rem} radius={[0, 0, 0, 0]} animationDuration={450} animationEasing="ease-out" />
          <Bar dataKey="awakeH" stackId="sleep" fill={awake} radius={[6, 6, 0, 0]} animationDuration={450} animationEasing="ease-out" />
        </BarChart>
      </ResponsiveContainer>
      </div>
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
