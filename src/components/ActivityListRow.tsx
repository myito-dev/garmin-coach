"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { formatDate, formatDistance, formatPace, mpsToSecPerKm } from "@/lib/format";
import { springSmooth, tapScaleSmall } from "@/lib/motion";
import { SESSION_META } from "@/lib/sessionMeta";
import type { ActivitySplit, GarminActivitySummary, PlannedSession, RoutePoint } from "@/lib/types";
import { KindBadge } from "./ui/Badges";
import { RouteThumbnail } from "./RouteThumbnail";
import { ActivitySparkline } from "./ActivitySparkline";

export function ActivityListRow({
  planned,
  actual,
  score,
  index,
  dayOffset = null,
  route = null,
  splits = null,
}: {
  planned: PlannedSession;
  actual: GarminActivitySummary | null;
  score: number | null;
  index: number;
  dayOffset?: number | null;
  route?: RoutePoint[] | null;
  splits?: ActivitySplit[] | null;
}) {
  const kindColor = SESSION_META[planned.kind].color.dark;
  const paceValues = actual && splits ? splits.filter((s) => s.distanceMeters >= 200).map((s) => mpsToSecPerKm(s.averageSpeedMps)) : [];

  const content = (
    <div className={`card flex flex-wrap items-center justify-between gap-3 p-4 ${actual ? "card-interactive" : ""}`}>
      <div className="flex items-center gap-3">
        <RouteThumbnail kind={planned.kind} points={actual ? route : null} />
        <div className="flex w-12 shrink-0 flex-col items-center rounded-xl bg-page py-1.5">
          <span className="text-[10px] font-semibold uppercase text-ink-muted">{planned.day}</span>
          <span className="text-sm font-semibold">{formatDate(planned.date).split(" ")[0]}</span>
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <KindBadge kind={planned.kind} />
            <span className="text-sm font-medium">{planned.title}</span>
          </div>
          {actual ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-secondary">
              <span className="tabular">{formatDistance(actual.distanceMeters)}</span>
              <span className="tabular">{formatPace(mpsToSecPerKm(actual.averageSpeedMps))}/km</span>
              {actual.averageHR && <span className="tabular">{actual.averageHR} bpm</span>}
              {dayOffset ? <DayOffsetBadge dayOffset={dayOffset} /> : null}
            </div>
          ) : (
            <span className="text-xs text-ink-muted">Sin registrar en Garmin</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {paceValues.length >= 2 && <ActivitySparkline values={paceValues} color={kindColor} />}
        {actual && score !== null && (
          <div className="flex items-center gap-2">
            <ScoreDot score={score} />
            <span className="tabular text-sm font-semibold">{score}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      whileTap={actual ? tapScaleSmall : undefined}
      transition={{ ...springSmooth, delay: Math.min(index * 0.04, 0.4) }}
    >
      {actual ? <Link href={`/entrenamientos/${actual.activityId}`}>{content}</Link> : content}
    </motion.div>
  );
}

function ScoreDot({ score }: { score: number }) {
  const color = score >= 80 ? "var(--good)" : score >= 60 ? "var(--warning)" : "var(--critical)";
  return <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />;
}

function DayOffsetBadge({ dayOffset }: { dayOffset: number }) {
  const label =
    dayOffset > 0
      ? `${dayOffset} día${dayOffset > 1 ? "s" : ""} tarde`
      : `${Math.abs(dayOffset)} día${Math.abs(dayOffset) > 1 ? "s" : ""} antes`;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
      {label}
    </span>
  );
}
