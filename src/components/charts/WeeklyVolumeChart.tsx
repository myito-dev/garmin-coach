"use client";

import { BarChart } from "./bar-chart";
import { Bar } from "./bar";
import { Grid } from "./grid";
import { BarXAxis } from "./bar-x-axis";
import { ChartTooltip } from "./tooltip";
import { useInViewOnce } from "@/lib/useInViewOnce";

export interface WeeklyVolumePoint {
  week: number;
  label: string;
  plannedKm: number;
  actualKm: number;
  isCurrent: boolean;
}

export function WeeklyVolumeChart({ data }: { data: WeeklyVolumePoint[] }) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  return (
    <div ref={ref}>
      <BarChart
        data={data as unknown as Record<string, unknown>[]}
        xDataKey="label"
        aspectRatio="16 / 7"
        barGap={0.35}
        status={inView ? "ready" : "loading"}
      >
        <Grid horizontal strokeDasharray="4,4" />
        <Bar dataKey="plannedKm" fill="var(--chart-1)" />
        <Bar dataKey="actualKm" fill="var(--chart-2)" />
        <BarXAxis maxLabels={13} />
        <ChartTooltip
          rows={(point) => [
            { color: "var(--chart-1)", label: "Plan", value: `${point.plannedKm} km` },
            { color: "var(--chart-2)", label: "Real", value: `${point.actualKm} km` },
          ]}
        />
      </BarChart>
      <div className="mt-3 flex gap-4 text-xs text-ink-secondary">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: "var(--chart-1)" }} />
          Plan
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: "var(--chart-2)" }} />
          Real
        </span>
      </div>
    </div>
  );
}
