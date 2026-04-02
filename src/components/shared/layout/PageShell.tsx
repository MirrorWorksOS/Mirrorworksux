import type { ReactNode } from "react";
import { motion } from "motion/react";

import { staggerContainer } from "@/components/shared/motion/motion-variants";
import { cn } from "@/components/ui/utils";

export interface PageShellProps {
  children: ReactNode;
  className?: string;
}

/** Default padding/spacing per design system: `p-8 space-y-8` (32px page margins, 32px section spacing). Override `className` for full-bleed (e.g. `p-0`) or denser shells. */
export function PageShell({ children, className }: PageShellProps) {
  return (
    <motion.div
      className={cn("p-8 space-y-8", className)}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
}
