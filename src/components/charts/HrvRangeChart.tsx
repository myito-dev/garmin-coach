"use client";

import { Bar, BarChart, CartesianGrid, Cell, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART, STATUS } from "@/lib/chartColors";
import { formatDate } from "@/lib/format";
import { hrvStatusLabel, hrvStatusSeverity } from "@/lib/wellness";
import { useIsDark } from "@/lib/useIsDark";
import type { WellnessDay } from "@/lib/types";

export function HrvRangeChart({ days }: { days: WellnessDay[] }) {
  const isDark = useIsDark();
  const c = isDark ? CHART.dark : CHART.light;
  const mode = isDark ? "dark" : "light";
  const status = {
    good: STATUS.good[mode],
    warning: STATUS.warning[mode],
    serious: STATUS.serious[mode],
    critical: STATUS.critical[mode],
  };

  const data = days
    .filter((d) => d.avgOvernightHrv)
    .map((d) => ({
      date: d.date,
      label: formatDate(d.date),
      value: Math.round(d.avgOvernightHrv!),
      color: status[hrvStatusSeverity(d.hrvStatus)],
      statusLabel: hrvStatusLabel(d.hrvStatus),
    }));

  // Baseline drifts slowly — use the most recent day that has it as the current reference band.
  const withBaseline = [...days].reverse().find((d) => d.hrvBaselineBalancedLow && d.hrvBaselineBalancedUpper);
  const lowUpper = withBaseline?.hrvBaselineLowUpper;
  const balancedLow = withBaseline?.hrvBaselineBalancedLow;
  const balancedUpper = withBaseline?.hrvBaselineBalancedUpper;

  if (data.length === 0) return <p className="text-sm text-ink-secondary">Todavía no hay suficientes datos sincronizados.</p>;

  const values = data.map((d) => d.value);
  const average = Math.round(values.reduce((s, v) => s + v, 0) / values.length);
  const yMin = Math.max(0, Math.floor(Math.min(...values, lowUpper ?? Infinity) / 10) * 10 - 5);
  const yMax = Math.ceil(Math.max(...values, balancedUpper ?? 0) / 10) * 10 + 5;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-secondary">
          <LegendDot color={status.good} label="Balanceado" />
          <LegendDot color={status.warning} label="Desbalanceado" />
          <LegendDot color={status.serious} label="Bajo" />
          <LegendDot color={status.critical} label="Pobre" />
        </div>
        <span className="tabular text-sm font-medium text-ink-secondary">Promedio {average} ms</span>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={c.gridline} strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fill: c.muted, fontSize: 11 }} axisLine={{ stroke: c.baseline }} tickLine={false} interval={data.length > 10 ? Math.ceil(data.length / 8) : 0} />
            <YAxis domain={[yMin, yMax]} tick={{ fill: c.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={34} />
            {balancedLow !== undefined && balancedUpper !== undefined && (
              <ReferenceArea y1={balancedLow} y2={balancedUpper} fill={status.good} fillOpacity={0.1} strokeOpacity={0} />
            )}
            <ReferenceLine y={average} stroke={c.baseline} strokeDasharray="4 4" />
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
              formatter={(value, _name, item) => {
                const statusLabel = (item?.payload as { statusLabel?: string } | undefined)?.statusLabel;
                return [`${value} ms${statusLabel ? ` · ${statusLabel}` : ""}`, "HRV"];
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={22} animationDuration={450} animationEasing="ease-out">
              {data.map((d) => (
                <Cell key={d.date} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
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
