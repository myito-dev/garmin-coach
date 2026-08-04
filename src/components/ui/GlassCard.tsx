"use client";

import { motion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import { springSmooth } from "@/lib/motion";

export function GlassCard({ className = "", children, ...rest }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={springSmooth}
      className={`card p-5 sm:p-6 ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
