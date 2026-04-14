/**
 * AnimatedList — items animate in with slide + scale + fade.
 * Inspired by ReactBits AnimatedList. Uses motion/react layout animations.
 */

import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/components/ui/utils";
import { useReducedMotion } from "./use-reduced-motion";

export interface AnimatedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  className?: string;
  /** Gap between items — default gap-2 */
  gap?: string;
}

export function AnimatedList<T>({
  items,
  renderItem,
  keyExtractor,
  className,
  gap = "gap-2",
}: AnimatedListProps<T>) {
  const prefersReduced = useReducedMotion();

  return (
    <div className={cn("flex flex-col", gap, className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        {items.map((item, i) => (
          <motion.div
            key={keyExtractor(item)}
            layout={!prefersReduced}
            initial={prefersReduced ? false : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReduced ? undefined : { opacity: 0, scale: 0.96, y: -8 }}
            transition={{
              duration: 0.25,
              ease: [0.2, 0, 0, 1],
              delay: i < 5 ? i * 0.04 : 0,
            }}
          >
            {renderItem(item, i)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
