import type { Transition } from "motion/react";

// Motion tokens follow Emil Kowalski's (animations.dev) and Apple's (WWDC "Designing
// Fluid Interfaces") documented defaults: springs parameterized by duration + bounce
// rather than raw stiffness/damping, critically damped (bounce ~0) as the default for
// non-gesture UI, animate only transform/opacity, keep everything under ~500ms.

/** Small interactive elements: toggles, tab pills, badges. A hint of life, not a bounce. */
export const springSnappy: Transition = { type: "spring", duration: 0.25, bounce: 0.05 };

/** The default for most UI motion: cards, accordions, modals. Critically damped, no overshoot. */
export const springSmooth: Transition = { type: "spring", duration: 0.4, bounce: 0 };

/** Large or page-level movement. Same damping, a touch slower so it reads as grounded. */
export const springGentle: Transition = { type: "spring", duration: 0.5, bounce: 0 };

/** Momentum-driven only (drag/flick release) — the one place bounce belongs. */
export const springMomentum: Transition = { type: "spring", duration: 0.4, bounce: 0.2 };

/** Strong ease-out for height/layout transitions where a spring can't target "auto". */
export const easeOutStrong = [0.23, 1, 0.32, 1] as const;

/** Apple: "respond on pointer-down, be subtle." Scale range 0.95–0.98 per Kowalski. */
export const tapScale = { scale: 0.97 };
export const tapScaleSmall = { scale: 0.95 };
