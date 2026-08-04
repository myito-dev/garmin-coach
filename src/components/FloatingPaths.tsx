"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

const PATH_COUNT = 11;

/**
 * Ambient flowing-line background, adapted from the "Background Paths"
 * pattern to use theme-aware currentColor instead of fixed slate/white, and
 * scoped (via the caller's wrapper) to a single hero moment rather than the
 * whole page. Only `opacity` loops (compositable, cheap) — the original also
 * tweened `pathLength`/`pathOffset` in an infinite loop, which Motion
 * implements via per-frame `stroke-dasharray` recalculation on the main
 * thread, the main cause of the flicker reported in desktop mode. The
 * one-time `pathLength` reveal plays once via `whileInView` instead.
 */
function Paths({ position, className = "", active }: { position: number; className?: string; active: boolean }) {
  const paths = Array.from({ length: PATH_COUNT }, (_, i) => ({
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
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          animate={active ? { opacity: [0.25, 0.5, 0.25] } : { opacity: 0.35 }}
          transition={
            active
              ? { opacity: { duration: 22 + (path.id % 6) * 3, repeat: Infinity, ease: "linear" }, pathLength: { duration: 1.2 } }
              : { pathLength: { duration: 1.2 } }
          }
        />
      ))}
    </svg>
  );
}

export function FloatingPaths() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.1 });
  const reduceMotion = useReducedMotion();
  const active = inView && !reduceMotion;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden [transform:translateZ(0)] [will-change:opacity]"
    >
      <div className="absolute inset-0 text-ink">
        <Paths position={1} active={active} />
      </div>
      <div className="absolute inset-0 text-accent">
        <Paths position={-1} active={active} />
      </div>
    </div>
  );
}
