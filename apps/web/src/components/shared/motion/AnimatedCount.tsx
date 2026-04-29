/**
 * Spring-animated integer — KPI tiles, donut centre, flip-card metric (Motion).
 */

import * as React from "react";
import {
  useMotionValue,
  useSpring,
  useMotionValueEvent,
  motion,
} from "motion/react";

export interface AnimatedCountProps {
  value: number;
  className?: string;
  /** Spring stiffness (default tuned for snappy dashboard numbers) */
  stiffness?: number;
  damping?: number;
  /**
   * Format the live integer for display (e.g. add `$`, `%`, thousands
   * separators). Receives the rounded number; default is the integer
   * itself rendered via `toLocaleString()`.
   */
  format?: (n: number) => React.ReactNode;
}

export function AnimatedCount({
  value,
  className,
  stiffness = 52,
  damping = 24,
  format,
}: AnimatedCountProps) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness, damping, mass: 0.85 });
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    mv.set(value);
  }, [value, mv]);

  useMotionValueEvent(spring, "change", (latest) => {
    setDisplay(Math.round(latest));
  });

  return (
    <motion.span className={className}>
      {format ? format(display) : display.toLocaleString()}
    </motion.span>
  );
}
