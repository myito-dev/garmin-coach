import { routePathD } from "@/lib/routeSvg";
import { SESSION_META } from "@/lib/sessionMeta";
import { useIsDark } from "@/lib/useIsDark";
import type { RoutePoint, SessionKind } from "@/lib/types";

const SIZE = 40;

/** Small trace of an activity's GPS route for a list row — falls back to a
 * plain colored dot (session-kind color, same source KindBadge uses) when no
 * route is cached, rather than inventing a whole per-kind icon set. */
export function RouteThumbnail({ kind, points }: { kind: SessionKind; points?: RoutePoint[] | null }) {
  const isDark = useIsDark();
  const color = isDark ? SESSION_META[kind].color.dark : SESSION_META[kind].color.light;

  if (!points || points.length < 2) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-page">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      </span>
    );
  }

  const d = routePathD(points, SIZE, SIZE, 4);
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-page">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} fill="none" aria-hidden>
        <path d={d} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
