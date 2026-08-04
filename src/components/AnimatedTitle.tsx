"use client";

import { motion } from "motion/react";

/**
 * Letter-by-letter reveal for a headline segment. Two instances placed side
 * by side (each with its own delayStart) read as one continuous title
 * animation — e.g. a plain segment followed by a spotlight-colored one.
 */
export function AnimatedTitle({
  text,
  className = "",
  delayStart = 0,
}: {
  text: string;
  className?: string;
  delayStart?: number;
}) {
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="mr-[0.22em] inline-block last:mr-0">
          {word.split("").map((letter, letterIndex) => (
            <motion.span
              key={`${wordIndex}-${letterIndex}`}
              initial={{ y: 32, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: delayStart + wordIndex * 0.07 + letterIndex * 0.025,
                type: "spring",
                stiffness: 160,
                damping: 22,
              }}
              className="inline-block"
            >
              {letter}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
}
