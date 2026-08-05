"use client";

import { SESSION_META } from "@/lib/sessionMeta";
import type { InsightSeverity, SessionKind } from "@/lib/types";

export function KindBadge({ kind, className = "" }: { kind: SessionKind; className?: string }) {
  const meta = SESSION_META[kind];
  const color = meta.color.dark;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
      style={{ borderColor: `color-mix(in oklab, ${color} 35%, transparent)`, color, background: `color-mix(in oklab, ${color} 12%, transparent)` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {meta.label}
    </span>
  );
}

const SEVERITY_LABEL: Record<InsightSeverity, string> = {
  good: "Bien",
  warning: "Atención",
  serious: "Ajustar",
  critical: "Importante",
};

export function SeverityBadge({ severity }: { severity: InsightSeverity }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold status-${severity}`}
    >
      <SeverityIcon severity={severity} />
      {SEVERITY_LABEL[severity]}
    </span>
  );
}

/** Same visual language as SeverityBadge but with a caller-supplied label — for statuses Garmin names itself (HRV status, sleep score qualifier). */
export function StatusChip({ severity, label }: { severity: InsightSeverity; label: string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold status-${severity}`}>{label}</span>;
}

function SeverityIcon({ severity }: { severity: InsightSeverity }) {
  if (severity === "good") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    );
  }
  if (severity === "critical") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 9v4M12 17h.01" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  }
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}
