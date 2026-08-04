import { routePathD } from "@/lib/routeSvg";
import type { RoutePoint } from "@/lib/types";

const WIDTH = 900;
const HEIGHT = 420;

/**
 * The most recent run's GPS trace, rendered as a soft blurred backdrop for
 * the dashboard hero — standing in for the "product photo" of the reference
 * design in a way that's actually relevant to a running app. Zero client JS:
 * no "use client", no hooks, just an SVG path from a pure projection
 * function — unlike the old FloatingPaths (Motion, animated) or RouteMap
 * (Leaflet, client-only), this costs nothing on the performance budget.
 */
export function RouteGlow({ points }: { points: RoutePoint[] | null }) {
  if (!points || points.length < 2) return null;
  const d = routePathD(points, WIDTH, HEIGHT, 28);

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.35]"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <defs>
        <filter id="route-glow-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <path d={d} stroke="var(--chart-2)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" filter="url(#route-glow-blur)" />
    </svg>
  );
}
