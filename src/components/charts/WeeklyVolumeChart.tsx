"use client";

import { BarChart } from "./bar-chart";
import { Bar } from "./bar";
import { Grid } from "./grid";
import { BarXAxis } from "./bar-x-axis";
import { ChartTooltip } from "./tooltip";
import { useInViewOnce } from "@/lib/useInViewOnce";
import { useIsMobile } from "@/lib/useIsMobile";

export interface WeeklyVolumePoint {
  week: number;
  label: string;
  plannedKm: number;
  actualKm: number;
  isCurrent: boolean;
}

export function WeeklyVolumeChart({ data }: { data: WeeklyVolumePoint[] }) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const isMobile = useIsMobile();
  return (
    <div ref={ref}>
      <BarChart
        data={data as unknown as Record<string, unknown>[]}
        xDataKey="label"
        aspectRatio={isMobile ? "4 / 3" : "16 / 7"}
        barGap={0.35}
        status={inView ? "ready" : "loading"}
      >
        <Grid horizontal strokeDasharray="4,4" />
        <Bar dataKey="plannedKm" fill="var(--ink-muted)" />
        <Bar dataKey="actualKm" fill="var(--accent)" />
        <BarXAxis maxLabels={isMobile ? 7 : 13} />
        <ChartTooltip
          rows={(point) => [
            { color: "var(--ink-muted)", label: "Plan", value: `${point.plannedKm} km` },
            { color: "var(--accent)", label: "Real", value: `${point.actualKm} km` },
          ]}
        />
      </BarChart>
      <div className="mt-3 flex gap-4 text-xs text-ink-secondary">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: "var(--ink-muted)" }} />
          Plan
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: "var(--accent)" }} />
          Real
        </span>
      </div>
    </div>
  );
}
