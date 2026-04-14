/**
 * SplitText — staggered character/word animation on mount.
 * Inspired by ReactBits SplitText. Uses motion/react (no GSAP).
 */

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/components/ui/utils";
import { useReducedMotion } from "./use-reduced-motion";

export interface SplitTextProps {
  text: string;
  /** "chars" | "words" — default "chars" */
  splitBy?: "chars" | "words";
  /** Stagger delay between each unit in seconds */
  delay?: number;
  /** Animation duration per unit in seconds */
  duration?: number;
  /** HTML tag to render */
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  /** Only animate once when in view */
  once?: boolean;
}

export function SplitText({
  text,
  splitBy = "chars",
  delay = 0.02,
  duration = 0.4,
  as: Tag = "p",
  className,
  once = true,
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once, amount: 0.3 });
  const prefersReduced = useReducedMotion();

  const units =
    splitBy === "words"
      ? text.split(/(\s+)/)
      : text.split("");

  if (prefersReduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={cn("inline-flex flex-wrap", className)}
      aria-label={text}
    >
      {units.map((unit, i) => (
        <motion.span
          key={`${i}-${unit}`}
          initial={{ opacity: 0, filter: "blur(4px)", y: 4 }}
          animate={
            isInView
              ? { opacity: 1, filter: "blur(0px)", y: 0 }
              : { opacity: 0, filter: "blur(4px)", y: 4 }
          }
          transition={{
            duration,
            delay: i * delay,
            ease: [0.2, 0, 0, 1],
          }}
          aria-hidden
          className={unit === " " ? "w-[0.3em]" : undefined}
        >
          {unit === " " ? "\u00A0" : unit}
        </motion.span>
      ))}
    </Tag>
  );
}
