"use client";

import { motion } from "motion/react";

export function MetricGrid({ metrics }: { metrics: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-2xl border border-hairline bg-surface p-4"
        >
          <div className="text-xs font-medium uppercase tracking-wide text-ink-muted">{m.label}</div>
          <div className="tabular mt-1 text-xl font-semibold">{m.value}</div>
        </motion.div>
      ))}
    </div>
  );
}
