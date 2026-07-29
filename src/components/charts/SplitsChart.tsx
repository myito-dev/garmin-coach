"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART, STATUS } from "@/lib/chartColors";
import { formatPace, mpsToSecPerKm } from "@/lib/format";
import { useIsDark } from "@/lib/useIsDark";
import type { ActivitySplit, PaceRange } from "@/lib/types";

export function SplitsChart({ splits, targetPace }: { splits: ActivitySplit[]; targetPace?: PaceRange }) {
  const isDark = useIsDark();
  const c = isDark ? CHART.dark : CHART.light;
  const status = isDark ? { good: STATUS.good.dark, warning: STATUS.warning.dark, serious: STATUS.serious.dark } : { good: STATUS.good.light, warning: STATUS.warning.light, serious: STATUS.serious.light };
  const accent = isDark ? "#3987e5" : "#2a78d6";

  const data = splits
    .filter((s) => s.distanceMeters >= 200)
    .map((s) => {
      const paceSec = mpsToSecPerKm(s.averageSpeedMps);
      let color = accent;
      if (targetPace) {
        if (paceSec > targetPace.slowSecPerKm + 10) color = status.serious;
        else color = status.good;
      }
      return {
        km: s.index,
        paceSec: Math.round(paceSec),
        color,
        hr: s.averageHR,
      };
    });

  if (data.length === 0) return null;

  const paces = data.map((d) => d.paceSec);
  const yMin = Math.floor(Math.min(...paces, targetPace?.fastSecPerKm ?? Infinity) / 10) * 10 - 10;
  const yMax = Math.ceil(Math.max(...paces, targetPace?.slowSecPerKm ?? 0) / 10) * 10 + 10;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={c.gridline} strokeDasharray="3 3" />
          <XAxis dataKey="km" tick={{ fill: c.muted, fontSize: 11 }} axisLine={{ stroke: c.baseline }} tickLine={false} label={{ value: "km", position: "insideBottomRight", offset: -2, fill: c.muted, fontSize: 11 }} />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fill: c.muted, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(v) => formatPace(v)}
          />
          {targetPace && (
            <ReferenceArea y1={targetPace.fastSecPerKm} y2={targetPace.slowSecPerKm} fill={accent} fillOpacity={0.12} strokeOpacity={0} />
          )}
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
            formatter={(value, _name, item) => {
              const paceSec = typeof value === "number" ? value : Number(value);
              const hr = (item?.payload as { hr?: number } | undefined)?.hr;
              return [`${formatPace(paceSec)}/km${hr ? ` · ${hr} bpm` : ""}`, "Ritmo"];
            }}
            labelFormatter={(label) => `Km ${label}`}
          />
          <Bar dataKey="paceSec" radius={[6, 6, 0, 0]} maxBarSize={28} animationDuration={450} animationEasing="ease-out">
            {data.map((d) => (
              <Cell key={d.km} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
