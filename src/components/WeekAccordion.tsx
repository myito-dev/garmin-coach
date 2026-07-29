"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { TrainingWeek } from "@/lib/types";
import { SessionCard } from "./SessionCard";

export function WeekAccordion({ week, defaultOpen = false, todayIso }: { week: TrainingWeek; defaultOpen?: boolean; todayIso: string }) {
  const [open, setOpen] = useState(defaultOpen);
  const isCurrent = todayIso >= week.startDate && todayIso <= week.endDate;

  return (
    <div className={`overflow-hidden rounded-3xl border ${isCurrent ? "border-accent/40" : "border-hairline"} bg-surface`}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6">
        <div className="flex items-center gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${isCurrent ? "bg-accent text-accent-ink" : "bg-page text-ink-secondary"}`}>
            {week.weekNumber}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{week.label}</h3>
              <span className="text-sm text-ink-muted">{week.dateRangeLabel}</span>
              {isCurrent && (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">Semana actual</span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-ink-secondary">
              {week.phase} · {week.focus}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-ink-muted sm:block">{week.totalKmLabel}</span>
          <motion.svg
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-ink-muted"
          >
            <path d="M6 9l6 6 6-6" />
          </motion.svg>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-5 pb-5 sm:px-6 sm:pb-6">
              {week.highlight && (
                <div className="rounded-xl border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent">{week.highlight}</div>
              )}
              {week.days.map((session) => (
                <SessionCard key={session.date + session.title} session={session} isToday={session.date === todayIso} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
