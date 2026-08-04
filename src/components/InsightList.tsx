"use client";

import { motion } from "motion/react";
import { springSmooth } from "@/lib/motion";
import type { Insight } from "@/lib/types";
import { SeverityBadge } from "./ui/Badges";

export function InsightList({ insights }: { insights: Insight[] }) {
  return (
    <div className="space-y-3">
      {insights.map((insight, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springSmooth, delay: Math.min(i * 0.06, 0.3) }}
          className="card p-4"
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
