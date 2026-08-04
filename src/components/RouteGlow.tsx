import { routePathD } from "@/lib/routeSvg";
import type { RoutePoint } from "@/lib/types";

const WIDTH = 600;
const HEIGHT = 420;

/**
 * The most recent run's GPS trace, rendered as a bold glowing graphic in the
 * hero — standing in for the reference design's product photo in a way
 * that's actually relevant to a running app. Layered stroke (soft blurred
 * pass underneath + a sharp bright pass on top) so it reads as a deliberate
 * graphic element, not a faint decorative line. Zero client JS: no "use
 * client", no hooks, just an SVG path from a pure projection function —
 * unlike the old FloatingPaths (Motion, animated) or RouteMap (Leaflet,
 * client-only), this costs nothing on the performance budget.
 */
export function RouteGlow({ points }: { points: RoutePoint[] | null }) {
  if (!points || points.length < 2) return null;
  const d = routePathD(points, WIDTH, HEIGHT, 36);

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <defs>
        <filter id="route-glow-blur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <path d={d} stroke="var(--chart-2)" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} filter="url(#route-glow-blur)" />
      <path d={d} stroke="var(--chart-2)" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
    </svg>
  );
}
