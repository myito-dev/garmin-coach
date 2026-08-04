import { LinePath } from "@visx/shape";
import { scaleLinear } from "@visx/scale";

const WIDTH = 64;
const HEIGHT = 24;
const PADDING = 3;

/**
 * Minimal per-km pace sparkline for a list row. bklit's LineChart is built
 * for a full interactive chart (axes, tooltip, loading phases) with no
 * chrome-less mode, so this goes straight to the underlying @visx
 * primitives instead — real overkill to wedge the full chart machinery into
 * a 64x24 cell repeated per row.
 */
export function ActivitySparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const yScale = scaleLinear<number>({
    // Guard against a degenerate domain (identical pace every km) — d3 linear
    // scales divide by the domain span, which is 0 in that case.
    domain: [min, max === min ? min + 1 : max],
    // Pace: lower seconds/km is faster — flip so faster shows higher on the sparkline.
    range: [HEIGHT - PADDING, PADDING],
  });
  const xScale = scaleLinear<number>({
    domain: [0, values.length - 1],
    range: [PADDING, WIDTH - PADDING],
  });

  return (
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden className="shrink-0">
      <LinePath
        data={values}
        x={(_, i) => xScale(i)}
        y={(v) => yScale(v)}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
