import type { ReactNode } from "react";
import { motion } from "motion/react";

import { staggerContainer } from "@/components/shared/motion/motion-variants";
import { cn } from "@/components/ui/utils";

export interface PageShellProps {
  children: ReactNode;
  className?: string;
}

/** Default padding/spacing per design system: responsive padding (16px mobile, 24px desktop) with consistent section spacing. Override `className` for full-bleed (e.g. `p-0`) or denser shells. */
export function PageShell({ children, className }: PageShellProps) {
  return (
    <motion.div
      className={cn("p-4 space-y-4 sm:p-6 sm:space-y-6", className)}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
}
