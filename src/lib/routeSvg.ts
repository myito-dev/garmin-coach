import type { RoutePoint } from "./types";

/**
 * Projects lat/lon route points onto an SVG path `d` string, uniformly
 * scaled to fit width/height ("contain", centered on the shorter axis).
 * Corrects longitude span by cos(latitude) for meridian convergence — cheap
 * and makes short local routes look geometrically right instead of stretched.
 * Pure, no DOM access — usable from both server components (hero background)
 * and client components (list-row thumbnails).
 */
export function routePathD(points: RoutePoint[], width: number, height: number, padding = 8): string {
  if (points.length < 2) return "";

  const lats = points.map((p) => p.lat);
  const lons = points.map((p) => p.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  const avgLatRad = ((minLat + maxLat) / 2) * (Math.PI / 180);
  const lonScale = Math.max(Math.cos(avgLatRad), 0.01);
  const latSpan = Math.max(maxLat - minLat, 1e-9);
  const lonSpan = Math.max((maxLon - minLon) * lonScale, 1e-9);

  const innerW = Math.max(width - padding * 2, 1);
  const innerH = Math.max(height - padding * 2, 1);
  const scale = Math.min(innerW / lonSpan, innerH / latSpan);
  const usedW = lonSpan * scale;
  const usedH = latSpan * scale;
  const offsetX = padding + (innerW - usedW) / 2;
  const offsetY = padding + (innerH - usedH) / 2;

  return points
    .map((p, i) => {
      const x = offsetX + (p.lon - minLon) * lonScale * scale;
      const y = offsetY + (maxLat - p.lat) * scale; // SVG y grows down, lat grows north — flip
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}
