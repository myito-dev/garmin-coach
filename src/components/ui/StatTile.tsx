"use client";

import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function StatTile({
  label,
  value,
  numericValue,
  suffix = "",
  decimals = 0,
  sub,
}: {
  label: string;
  value?: string;
  numericValue?: number;
  suffix?: string;
  decimals?: number;
  sub?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 90, damping: 20 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView && numericValue !== undefined) motionVal.set(numericValue);
  }, [inView, numericValue, motionVal]);

  useEffect(() => {
    return spring.on("change", (v) => setDisplay(v.toFixed(decimals)));
  }, [spring, decimals]);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</span>
      <span ref={ref} className="tabular text-3xl font-semibold tracking-tight sm:text-4xl">
        {value ?? `${display}${suffix}`}
      </span>
      {sub && <span className="text-sm text-ink-secondary">{sub}</span>}
    </div>
  );
}

export function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 90, damping: 20 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, value, motionVal]);

  useEffect(() => {
    return spring.on("change", (v) => setDisplay(v.toFixed(decimals)));
  }, [spring, decimals]);

  return (
    <motion.span ref={ref} className="tabular">
      {display}
    </motion.span>
  );
}
