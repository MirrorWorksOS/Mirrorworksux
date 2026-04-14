/**
 * Shared motion variants — aligned with M3 CSS tokens in globals.css
 *
 * Duration tokens (ms):  short1=50, short2=100, medium1=250, medium2=350, long1=450, long2=550
 * Easing:  standard=[0.2,0,0,1], decelerate=[0,0,0,1], accelerate=[0.3,0,1,1]
 */

import type { Variants, Transition } from "motion/react";

const EASE_STANDARD = [0.2, 0, 0, 1.0] as [number, number, number, number];
const EASE_DECELERATE = [0, 0, 0, 1] as [number, number, number, number];
const EASE_ACCELERATE = [0.3, 0, 1, 1] as [number, number, number, number];
const EASE_EMPHASIZED_DECELERATE = [0.05, 0.7, 0.1, 1.0] as [number, number, number, number];

export const transitions = {
  standard: { duration: 0.25, ease: EASE_STANDARD } satisfies Transition,
  enter: { duration: 0.25, ease: EASE_DECELERATE } satisfies Transition,
  exit: { duration: 0.25, ease: EASE_ACCELERATE } satisfies Transition,
  dialogOpen: { duration: 0.35, ease: EASE_EMPHASIZED_DECELERATE } satisfies Transition,
  dialogClose: { duration: 0.25, ease: EASE_ACCELERATE } satisfies Transition,
  page: { duration: 0.45, ease: EASE_STANDARD } satisfies Transition,
  micro: { duration: 0.1, ease: EASE_STANDARD } satisfies Transition,
} as const;

export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: transitions.enter },
  exit: { opacity: 0, transition: transitions.exit },
};

export const slideUpVariants: Variants = {
  initial: { y: 16, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: transitions.enter },
  exit: { y: 16, opacity: 0, transition: transitions.exit },
};

export const scaleVariants: Variants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: transitions.enter },
  exit: { scale: 0.95, opacity: 0, transition: transitions.exit },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.05 } },
};

export const staggerItem: Variants = {
  initial: { x: -20, opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.25, ease: EASE_STANDARD },
  },
};

export const dialogVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: transitions.dialogOpen,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: transitions.dialogClose,
  },
};

export const sheetVariants: Variants = {
  initial: { x: "100%" },
  animate: {
    x: 0,
    transition: { duration: 0.35, ease: EASE_EMPHASIZED_DECELERATE },
  },
  exit: {
    x: "100%",
    transition: { duration: 0.25, ease: EASE_ACCELERATE },
  },
};
