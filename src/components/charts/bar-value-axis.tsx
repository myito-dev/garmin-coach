"use client";

import { createPortal } from "react-dom";
import { useMemo } from "react";
import { useChartStable } from "./chart-context";

export interface BarValueAxisProps {
  /** Number of tick labels. Default: 5 (matches Grid's default numTicksRows). */
  numTicks?: number;
  /** Formats a raw tick value into label text. Default: Math.round. */
  format?: (value: number) => string;
}

/**
 * Numeric Y-axis labels for a vertical bar chart (e.g. "40 km", "20 km"),
 * aligned to the same yScale.ticks() Grid's horizontal lines use. bklit's
 * bundled BarYAxis is for the opposite case (category labels on a
 * *horizontal* bar chart's y-axis) — this fills the gap for the value axis
 * of a normal vertical bar chart.
 */
export function BarValueAxis({ numTicks = 5, format = (v) => String(Math.round(v)) }: BarValueAxisProps) {
  const { containerRef, yScale, margin, innerHeight } = useChartStable();
  const container = containerRef.current;

  const ticks = useMemo(() => yScale.ticks(numTicks), [yScale, numTicks]);

  if (!container) return null;

  return createPortal(
    <div className="pointer-events-none absolute top-0" style={{ left: 0, width: margin.left, height: innerHeight + margin.top }}>
      {ticks.map((tick) => (
        <span
          key={tick}
          className="absolute right-2 -translate-y-1/2 text-xs text-ink-muted"
          style={{ top: yScale(tick) + margin.top }}
        >
          {format(tick)}
        </span>
      ))}
    </div>,
    container
  );
}

export default BarValueAxis;
