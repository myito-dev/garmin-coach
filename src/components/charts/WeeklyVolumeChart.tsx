"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ACTUAL_COLOR, CHART, PLAN_COLOR } from "@/lib/chartColors";
import { useIsDark } from "@/lib/useIsDark";

export interface WeeklyVolumePoint {
  week: number;
  label: string;
  plannedKm: number;
  actualKm: number;
  isCurrent: boolean;
}

export function WeeklyVolumeChart({ data }: { data: WeeklyVolumePoint[] }) {
  const isDark = useIsDark();
  const c = isDark ? CHART.dark : CHART.light;
  const plan = isDark ? PLAN_COLOR.dark : PLAN_COLOR.light;
  const actual = isDark ? ACTUAL_COLOR.dark : ACTUAL_COLOR.light;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
          <CartesianGrid vertical={false} stroke={c.gridline} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tick={{ fill: c.muted, fontSize: 11 }}
            axisLine={{ stroke: c.baseline }}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fill: c.muted, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={30}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            cursor={{ fill: c.gridline, opacity: 0.4 }}
            contentStyle={{
              background: c.surface,
              border: `1px solid ${c.gridline}`,
              borderRadius: 12,
              fontSize: 12,
              color: c.ink,
            }}
            formatter={(value, name) => [`${value} km`, name === "plannedKm" ? "Plan" : "Real"]}
            labelFormatter={(label) => label}
          />
          <Legend
            formatter={(value) => (value === "plannedKm" ? "Plan" : "Real")}
            wrapperStyle={{ fontSize: 12, color: c.inkSecondary }}
          />
          <Bar dataKey="plannedKm" fill={plan} radius={[4, 4, 0, 0]} maxBarSize={16} />
          <Bar dataKey="actualKm" fill={actual} radius={[4, 4, 0, 0]} maxBarSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
