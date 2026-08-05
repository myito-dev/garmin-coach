"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { MapContainer, TileLayer, Polyline, CircleMarker } from "react-leaflet";
import type L from "leaflet";
import "leaflet/dist/leaflet.css";
import { STATUS } from "@/lib/chartColors";
import { useIsDark } from "@/lib/useIsDark";
import type { RoutePoint } from "@/lib/types";

/** Draws the route stroke in progressively, like tracing it on a map — anime.js
 * handles raw SVG stroke-dash tweening more directly than Motion's declarative API. */
function useDrawIn(pointCount: number) {
  const ref = useRef<L.Polyline>(null);
  useEffect(() => {
    const el = ref.current?.getElement() as SVGPathElement | undefined;
    if (!el) return;
    const length = el.getTotalLength();
    el.style.strokeDasharray = `${length}`;
    el.style.strokeDashoffset = `${length}`;
    const anim = animate(el, {
      strokeDashoffset: [length, 0],
      duration: 1400,
      ease: "inOutQuad",
    });
    return () => {
      anim.pause();
    };
  }, [pointCount]);
  return ref;
}

/**
 * GPS route preview: a minimalist CartoDB basemap (no API key, no signup —
 * Positron/Dark Matter styles) with the actual recorded track drawn on top.
 * Rendered client-side only (see the dynamic(..., { ssr: false }) import at
 * the call site) since Leaflet touches `window` on module load.
 */
export function RouteMap({ points }: { points: RoutePoint[] }) {
  const isDark = useIsDark();
  const mode = isDark ? "dark" : "light";
  const polylineRef = useDrawIn(points.length);

  if (points.length < 2) return null;

  const latlngs: [number, number][] = points.map((p) => [p.lat, p.lon]);
  const lats = points.map((p) => p.lat);
  const lons = points.map((p) => p.lon);
  const bounds: [[number, number], [number, number]] = [
    [Math.min(...lats), Math.min(...lons)],
    [Math.max(...lats), Math.max(...lons)],
  ];

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const routeColor = "var(--accent)";
  const startColor = STATUS.good[mode];
  const endColor = STATUS.critical[mode];

  return (
    <div className="h-72 w-full overflow-hidden rounded-2xl border border-hairline">
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [28, 28] }}
        style={{ height: "100%", width: "100%", background: "var(--surface)" }}
      >
        <TileLayer
          url={tileUrl}
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; OpenStreetMap contributors'
        />
        <Polyline ref={polylineRef} positions={latlngs} pathOptions={{ color: routeColor, weight: 4, opacity: 0.9, lineCap: "round" }} />
        <CircleMarker center={latlngs[0]} radius={6} pathOptions={{ color: "#fff", weight: 2, fillColor: startColor, fillOpacity: 1 }} />
        <CircleMarker center={latlngs[latlngs.length - 1]} radius={6} pathOptions={{ color: "#fff", weight: 2, fillColor: endColor, fillOpacity: 1 }} />
      </MapContainer>
    </div>
  );
}
