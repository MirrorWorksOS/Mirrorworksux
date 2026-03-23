import type { ReactNode } from "react";
import { motion } from "motion/react";

import { staggerContainer } from "@/components/shared/motion/motion-variants";
import { cn } from "@/components/ui/utils";

export interface PageShellProps {
  children: ReactNode;
  className?: string;
}

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
