"use client";

import { motion } from "framer-motion";
import type { Insight } from "@/lib/types";
import { SeverityBadge } from "./ui/Badges";

export function InsightList({ insights }: { insights: Insight[] }) {
  return (
    <div className="space-y-3">
      {insights.map((insight, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-hairline bg-surface p-4"
        >
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <h4 className="font-medium">{insight.title}</h4>
            <SeverityBadge severity={insight.severity} />
          </div>
          <p className="text-sm text-ink-secondary">{insight.detail}</p>
        </motion.div>
      ))}
    </div>
  );
}
