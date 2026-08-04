"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { formatPaceRange } from "@/lib/format";
import { easeOutStrong, springSnappy, tapScaleSmall } from "@/lib/motion";
import type { PlannedSession } from "@/lib/types";
import { KindBadge } from "./ui/Badges";
import { SessionGuide } from "./SessionGuide";

export function SessionCard({ session, isToday = false }: { session: PlannedSession; isToday?: boolean }) {
  const [open, setOpen] = useState(false);
  const hasGuide = session.kind !== "descanso";

  return (
    <div className={`rounded-2xl border p-4 transition-colors ${isToday ? "border-accent/50 bg-accent/5" : "border-hairline bg-surface"}`}>
      <motion.button
        type="button"
        onClick={() => hasGuide && setOpen((o) => !o)}
        whileTap={hasGuide ? tapScaleSmall : undefined}
        transition={springSnappy}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div className="flex gap-3">
          <div className="flex w-11 shrink-0 flex-col items-center">
            <span className="text-[11px] font-semibold uppercase text-ink-muted">{session.day}</span>
            {isToday && <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />}
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <KindBadge kind={session.kind} />
              {session.shoe && <span className="text-xs text-ink-muted">{session.shoe}</span>}
            </div>
            <p className="font-medium leading-snug">{session.title}</p>
            {session.structure && <p className="text-sm text-ink-secondary">{session.structure}</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-secondary">
              {session.pace && <span className="tabular">{formatPaceRange(session.pace)}</span>}
              {session.distanceKm && <span className="tabular">{session.distanceKm} km</span>}
            </div>
            {session.note && <p className="text-xs italic text-ink-muted">{session.note}</p>}
          </div>
        </div>
        {hasGuide && (
          <motion.svg
            animate={{ rotate: open ? 180 : 0 }}
            transition={springSnappy}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-1 shrink-0 text-ink-muted"
          >
            <path d="M6 9l6 6 6-6" />
          </motion.svg>
        )}
      </motion.button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: easeOutStrong }}
            className="overflow-hidden"
          >
            <div className="ml-14 mt-4 border-t border-hairline pt-4">
              <SessionGuide kind={session.kind} garminHint={session.garminHint} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
