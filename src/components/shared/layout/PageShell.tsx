import type { ReactNode } from "react";
import { motion } from "motion/react";

import { staggerContainer } from "@/components/shared/motion/motion-variants";
import { cn } from "@/components/ui/utils";

export interface PageShellProps {
  children: ReactNode;
  className?: string;
}

/** Default padding/spacing per design system: `p-6 space-y-6` (24px page margins, 24px section spacing). Override `className` for full-bleed (e.g. `p-0`) or denser shells. */
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
