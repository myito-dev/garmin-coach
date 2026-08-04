"use client";

import { LineChart } from "./line-chart";
import { Line } from "./line";
import { Grid } from "./grid";
import { XAxis } from "./x-axis";
import { ChartTooltip } from "./tooltip";
import { useIsDark } from "@/lib/useIsDark";

export interface TrendPoint {
  date: string;
  value: number;
}

export function TrendLineChart({
  points,
  color,
  unit = "",
  decimals = 0,
}: {
  points: TrendPoint[];
  color: { light: string; dark: string };
  unit?: string;
  decimals?: number;
}) {
  const isDark = useIsDark();
  const lineColor = isDark ? color.dark : color.light;

  const data = points.map((p) => ({ date: new Date(`${p.date}T00:00:00`), value: p.value }));

  if (data.length === 0) return <p className="text-sm text-ink-secondary">Todavía no hay suficientes datos sincronizados.</p>;

  const average = data.reduce((s, p) => s + p.value, 0) / data.length;
  const averageRounded = Math.round(average * 10 ** decimals) / 10 ** decimals;

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <span className="tabular text-sm font-medium text-ink-secondary">
          Promedio {average.toFixed(decimals)}
          {unit}
        </span>
      </div>
      <LineChart data={data as unknown as Record<string, unknown>[]} xDataKey="date" aspectRatio="16 / 7">
        <Grid horizontal strokeDasharray="4,4" highlightRowValues={[averageRounded]} />
        <Line dataKey="value" stroke={lineColor} showMarkers />
        <XAxis numTicks={6} />
        <ChartTooltip rows={(point) => [{ color: lineColor, label: "", value: `${point.value}${unit}` }]} />
      </LineChart>
    </div>
  );
}
