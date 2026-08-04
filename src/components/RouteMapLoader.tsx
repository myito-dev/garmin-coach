"use client";

import dynamic from "next/dynamic";
import type { RoutePoint } from "@/lib/types";

// next/dynamic with ssr:false must live inside a Client Component in the App
// Router — Leaflet touches `window` at module load, so it can't run on the server.
const RouteMap = dynamic(() => import("./RouteMap").then((m) => m.RouteMap), {
  ssr: false,
  loading: () => <div className="h-72 w-full animate-pulse rounded-2xl bg-page" />,
});

export function RouteMapLoader({ points }: { points: RoutePoint[] }) {
  return <RouteMap points={points} />;
}
