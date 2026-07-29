"use client";

import { motion } from "framer-motion";
import { formatPace } from "@/lib/format";

export function PaceBand({
  fastSecPerKm,
  slowSecPerKm,
  actualSecPerKm,
  onTarget,
}: {
  fastSecPerKm: number;
  slowSecPerKm: number;
  actualSecPerKm: number;
  onTarget: boolean | null;
}) {
  const lo = Math.min(fastSecPerKm, actualSecPerKm) - 20;
  const hi = Math.max(slowSecPerKm, actualSecPerKm) + 20;
  const span = hi - lo || 1;

  // Faster pace (lower seconds) reads on the right, matching a "speed" feel — left = slow, right = fast.
  const toX = (v: number) => 100 - ((v - lo) / span) * 100;

  const bandLeft = toX(slowSecPerKm);
  const bandRight = toX(fastSecPerKm);
  const markerX = toX(actualSecPerKm);

  const markerColor = onTarget === null ? "var(--accent)" : onTarget ? "var(--good)" : "var(--serious)";

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-ink-muted">
        <span>{formatPace(hi)}/km</span>
        <span>Objetivo: {formatPace(fastSecPerKm)}-{formatPace(slowSecPerKm)}/km</span>
        <span>{formatPace(lo)}/km</span>
      </div>
      <div className="relative h-3 rounded-full bg-page">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${bandRight - bandLeft}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-y-0 rounded-full bg-accent/25"
          style={{ left: `${bandLeft}%` }}
        />
        <motion.div
          initial={{ left: "50%", opacity: 0 }}
          animate={{ left: `${markerX}%`, opacity: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface shadow-md"
          style={{ background: markerColor }}
        />
      </div>
      <div className="text-center text-sm text-ink-secondary">
        Ritmo real: <span className="tabular font-semibold text-ink">{formatPace(actualSecPerKm)}/km</span>
      </div>
    </div>
  );
}
