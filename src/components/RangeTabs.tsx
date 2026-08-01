"use client";

import { motion } from "framer-motion";
import { springSnappy } from "@/lib/motion";

export type WellnessRange = "7d" | "1m" | "3m" | "6m" | "1y";

const RANGES: { key: WellnessRange; label: string }[] = [
  { key: "7d", label: "7 días" },
  { key: "1m", label: "1 mes" },
  { key: "3m", label: "3 meses" },
  { key: "6m", label: "6 meses" },
  { key: "1y", label: "1 año" },
];

export const RANGE_DAYS: Record<WellnessRange, number> = {
  "7d": 7,
  "1m": 30,
  "3m": 90,
  "6m": 182,
  "1y": 365,
};

export function RangeTabs({ value, onChange }: { value: WellnessRange; onChange: (r: WellnessRange) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-hairline bg-surface p-1">
      {RANGES.map((r) => {
        const active = value === r.key;
        return (
          <button
            key={r.key}
            type="button"
            onClick={() => onChange(r.key)}
            className="relative rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm"
          >
            {active && <motion.span layoutId="range-pill" className="absolute inset-0 rounded-full bg-accent" transition={springSnappy} />}
            <span className={`relative z-10 ${active ? "text-accent-ink" : "text-ink-secondary"}`}>{r.label}</span>
          </button>
        );
      })}
    </div>
  );
}
