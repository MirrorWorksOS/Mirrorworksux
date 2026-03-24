import type { ReactNode } from "react";
import { motion } from "motion/react";

import { staggerContainer } from "@/components/shared/motion/motion-variants";
import { cn } from "@/components/ui/utils";

export interface PageShellProps {
  children: ReactNode;
  className?: string;
}

/** Default padding/spacing matches module page pattern (`p-6 space-y-6`). Override `className` for full-bleed (e.g. `p-0`) or denser shells. */
export function PageShell({ children, className }: PageShellProps) {
  return (
    <motion.div
      className={cn("p-6 space-y-6", className)}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
}
