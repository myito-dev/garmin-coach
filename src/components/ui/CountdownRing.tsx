"use client";

import { motion } from "framer-motion";

export function CountdownRing({
  daysLeft,
  totalDays,
  size = 176,
}: {
  daysLeft: number;
  totalDays: number;
  size?: number;
}) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, Math.max(0, 1 - daysLeft / totalDays));

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--hairline)"
          strokeWidth={stroke}
        />
        <motion.circle
          className="ring-glow"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - progress) }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0, delay: 0.5 }}
          className="tabular text-4xl font-bold tracking-tight"
        >
          {daysLeft}
        </motion.span>
        <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {daysLeft === 1 ? "día" : "días"}
        </span>
      </div>
    </div>
  );
}
