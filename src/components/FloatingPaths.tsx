"use client";

import { motion } from "motion/react";

/**
 * Ambient flowing-line background, adapted from the "Background Paths"
 * pattern to use theme-aware currentColor instead of fixed slate/white, and
 * scoped (via the caller's wrapper) to a single hero moment rather than the
 * whole page — infinite animated SVG strokes are cheap individually but add
 * up fast if left running behind scrolling content.
 */
function Paths({ position, className = "" }: { position: number; className?: string }) {
  const paths = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${
      312 - i * 5 * position
    } ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <svg className={`h-full w-full ${className}`} viewBox="0 0 696 316" fill="none" aria-hidden>
      {paths.map((path) => (
        <motion.path
          key={path.id}
          d={path.d}
          stroke="currentColor"
          strokeWidth={path.width}
          strokeOpacity={0.06 + path.id * 0.012}
          initial={{ pathLength: 0.3, opacity: 0.5 }}
          animate={{ pathLength: 1, opacity: [0.25, 0.5, 0.25], pathOffset: [0, 1, 0] }}
          transition={{ duration: 22 + (path.id % 6) * 3, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </svg>
  );
}

export function FloatingPaths() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 text-ink">
        <Paths position={1} />
      </div>
      <div className="absolute inset-0 text-accent">
        <Paths position={-1} />
      </div>
    </div>
  );
}
