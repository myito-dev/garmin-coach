"use client";

import { motion } from "framer-motion";
import { HR_ZONES } from "@/data/trainingPlan";
import { HR_ZONE_COLOR } from "@/lib/chartColors";
import { useIsDark } from "@/lib/useIsDark";

const SCALE_MIN = 90;
const SCALE_MAX = 205;

export function HRZoneBar({ avgHR, maxHR }: { avgHR?: number; maxHR?: number }) {
  const isDark = useIsDark();
  const toPct = (bpm: number) => Math.min(100, Math.max(0, ((bpm - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100));

  return (
    <div className="space-y-3">
      <div className="relative flex h-8 overflow-hidden rounded-xl">
        {HR_ZONES.map((z) => {
          const from = Math.max(SCALE_MIN, z.min);
          const to = z.max ?? SCALE_MAX;
          const widthPct = ((to - from) / (SCALE_MAX - SCALE_MIN)) * 100;
          const color = isDark ? HR_ZONE_COLOR[z.zone].dark : HR_ZONE_COLOR[z.zone].light;
          return (
            <motion.div
              key={z.zone}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: z.zone * 0.05 }}
              className="flex items-center justify-center text-[11px] font-semibold text-white"
              style={{ width: `${widthPct}%`, background: color }}
            >
              {z.label}
            </motion.div>
          );
        })}
        {avgHR && (
          <motion.div
            initial={{ left: "50%", opacity: 0 }}
            animate={{ left: `${toPct(avgHR)}%`, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="absolute top-0 flex h-full -translate-x-1/2 flex-col items-center"
          >
            <div className="h-full w-0.5 bg-ink" />
          </motion.div>
        )}
        {maxHR && (
          <motion.div
            initial={{ left: "50%", opacity: 0 }}
            animate={{ left: `${toPct(maxHR)}%`, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
            className="absolute top-0 flex h-full -translate-x-1/2 flex-col items-center"
          >
            <div className="h-full w-0.5 border-l-2 border-dashed border-ink/60" />
          </motion.div>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-ink-muted">
        <span>{SCALE_MIN} bpm</span>
        <div className="flex items-center gap-4">
          {avgHR && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-ink" /> Promedio {avgHR} bpm
            </span>
          )}
          {maxHR && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-0.5 border-l-2 border-dashed border-ink/60" /> Máx {maxHR} bpm
            </span>
          )}
        </div>
        <span>{SCALE_MAX}+ bpm</span>
      </div>
    </div>
  );
}
