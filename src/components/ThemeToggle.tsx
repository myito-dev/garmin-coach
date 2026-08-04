"use client";

import { motion } from "motion/react";
import { useIsDark } from "@/lib/useIsDark";
import { springSnappy, tapScaleSmall } from "@/lib/motion";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
  window.localStorage.setItem("theme", theme);
}

export function ThemeToggle() {
  const isDark = useIsDark();

  return (
    <motion.button
      type="button"
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      onClick={() => applyTheme(isDark ? "light" : "dark")}
      whileTap={tapScaleSmall}
      transition={springSnappy}
      className="relative flex h-9 w-16 items-center rounded-full border border-hairline bg-surface px-1 transition-colors"
    >
      <motion.div
        layout
        transition={{ ...springSnappy, bounce: 0.15 }}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-ink shadow-sm"
        style={{ marginLeft: isDark ? "calc(100% - 1.75rem)" : 0 }}
      >
        {isDark ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="5" />
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            />
          </svg>
        )}
      </motion.div>
    </motion.button>
  );
}
