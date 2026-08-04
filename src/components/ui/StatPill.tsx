"use client";

import { motion } from "motion/react";
import { springSmooth } from "@/lib/motion";

const ICON_COLORS = {
  blue: { bg: "color-mix(in oklab, var(--accent) 18%, transparent)", fg: "var(--accent)" },
  lime: { bg: "color-mix(in oklab, var(--spotlight-chip) 22%, transparent)", fg: "var(--spotlight-text)" },
  green: { bg: "color-mix(in oklab, var(--good) 18%, transparent)", fg: "var(--good)" },
  orange: { bg: "color-mix(in oklab, var(--serious) 18%, transparent)", fg: "var(--serious)" },
} as const;

export function StatPill({
  icon,
  label,
  value,
  sub,
  color = "blue",
  index = 0,
  bare = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color?: keyof typeof ICON_COLORS;
  index?: number;
  /** Strips the card chrome (border/background/padding) so it can sit inside
   * a shared container instead — e.g. the hero's single glass stat bar. */
  bare?: boolean;
}) {
  const c = ICON_COLORS[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ ...springSmooth, delay: Math.min(index * 0.06, 0.3) }}
      className={bare ? "flex items-center gap-3" : "flex items-center gap-3 rounded-2xl border border-hairline bg-page/60 p-3"}
    >
      <span
        className={`flex shrink-0 items-center justify-center ${bare ? "h-7 w-7 rounded-lg" : "h-9 w-9 rounded-full"}`}
        style={{ background: c.bg, color: c.fg }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="tabular truncate text-lg font-semibold leading-tight">{value}</p>
        <p className="truncate text-xs leading-snug text-ink-muted">
          {label}
          {sub ? ` · ${sub}` : ""}
        </p>
      </div>
    </motion.div>
  );
}
