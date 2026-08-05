"use client";

import { BarChart } from "./bar-chart";
import { Bar } from "./bar";
import { Grid } from "./grid";
import { BarXAxis } from "./bar-x-axis";
import { ChartTooltip } from "./tooltip";
import { formatPace, mpsToSecPerKm } from "@/lib/format";
import { useInViewOnce } from "@/lib/useInViewOnce";
import type { ActivitySplit, PaceRange } from "@/lib/types";

/**
 * Per-km pace: on-target kilometers read neutral (gray), off-target ones are
 * highlighted in the brand accent so they draw the eye — plus the target
 * band as two highlighted boundary lines (bklit has no shaded-area primitive
 * in this install — highlightRowValues is the nearest native substitute).
 * Per-bar color uses the same two-series-split trick as HrvRangeChart.
 */
export function SplitsChart({ splits, targetPace }: { splits: ActivitySplit[]; targetPace?: PaceRange }) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const good = "#5c5b57";
  const serious = "var(--accent)";
  const accent = "var(--accent)";

  const raw = splits
    .filter((s) => s.distanceMeters >= 200)
    .map((s) => {
      const paceSec = Math.round(mpsToSecPerKm(s.averageSpeedMps));
      const isSlow = targetPace ? paceSec > targetPace.slowSecPerKm + 10 : false;
      return { km: s.index, paceSec, isSlow, hr: s.averageHR };
    });

  if (raw.length === 0) return null;

  const data = raw.map((d) => ({
    km: String(d.km),
    hr: d.hr,
    valueGood: !d.isSlow ? d.paceSec : undefined,
    valueSerious: d.isSlow ? d.paceSec : undefined,
  }));

  return (
    <div className="w-full" ref={ref}>
      <BarChart
        data={data as unknown as Record<string, unknown>[]}
        xDataKey="km"
        aspectRatio="16 / 7"
        stacked
        barGap={0.3}
        status={inView ? "ready" : "loading"}
      >
        <Grid
          horizontal
          strokeDasharray="4,4"
          highlightRowValues={targetPace ? [targetPace.fastSecPerKm, targetPace.slowSecPerKm] : undefined}
          highlightRowStroke={accent}
        />
        <Bar dataKey="valueGood" fill={good} />
        <Bar dataKey="valueSerious" fill={serious} />
        <BarXAxis maxLabels={12} />
        <ChartTooltip
          rows={(point) => {
            const p = point as { valueGood?: number; valueSerious?: number; hr?: number };
            const paceSec = p.valueGood ?? p.valueSerious ?? 0;
            const color = p.valueGood !== undefined ? good : serious;
            return [{ color, label: "Ritmo", value: `${formatPace(paceSec)}/km${p.hr ? ` · ${p.hr} bpm` : ""}` }];
          }}
        />
      </BarChart>
    </div>
  );
}
