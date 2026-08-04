"use client";

import { useRef } from "react";
import { useInView } from "motion/react";

/**
 * Fires once, true forever after — used to gate an entrance animation so it
 * plays as content scrolls into view rather than the moment it mounts
 * off-screen (bklit's chart `status` prop and similar reveal triggers).
 */
export function useInViewOnce<T extends HTMLElement>(margin: `${number}px` = "-80px") {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once: true, margin });
  return { ref, inView };
}
