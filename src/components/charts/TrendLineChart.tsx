"use client";

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART } from "@/lib/chartColors";
import { formatDate } from "@/lib/format";
import { useIsDark } from "@/lib/useIsDark";

export interface TrendPoint {
  date: string;
  value: number;
}

export function TrendLineChart({
  points,
  color,
  unit = "",
  domain,
  decimals = 0,
}: {
  points: TrendPoint[];
  color: { light: string; dark: string };
  unit?: string;
  domain?: [number, number];
  decimals?: number;
}) {
  const isDark = useIsDark();
  const c = isDark ? CHART.dark : CHART.light;
  const lineColor = isDark ? color.dark : color.light;

  const data = points.map((p) => ({ ...p, label: formatDate(p.date) }));

  if (data.length === 0) return <p className="text-sm text-ink-secondary">Todavía no hay suficientes datos sincronizados.</p>;

  const average = data.reduce((s, p) => s + p.value, 0) / data.length;

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <span className="tabular text-sm font-medium text-ink-secondary">
          Promedio {average.toFixed(decimals)}
          {unit}
        </span>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={c.gridline} strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fill: c.muted, fontSize: 11 }} axisLine={{ stroke: c.baseline }} tickLine={false} interval={data.length > 10 ? Math.ceil(data.length / 8) : 0} />
            <YAxis
              domain={domain ?? ["auto", "auto"]}
              tick={{ fill: c.muted, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={34}
            />
            <ReferenceLine y={average} stroke={c.baseline} strokeDasharray="4 4" />
            <Tooltip
              cursor={{ stroke: c.baseline, strokeDasharray: "3 3" }}
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
              formatter={(value) => [`${value}${unit}`, ""]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2.5}
              dot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              animationDuration={500}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
