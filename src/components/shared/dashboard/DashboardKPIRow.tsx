import * as React from "react";
import { motion } from "motion/react";

import { cn } from "@/components/ui/utils";
import {
  staggerContainer,
  staggerItem,
} from "@/components/shared/motion/motion-variants";

export interface DashboardKPIRowProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardKPIRow({ children, className }: DashboardKPIRowProps) {
  return (
    <motion.div
      className={cn("grid grid-cols-2 gap-4 lg:grid-cols-4", className)}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={staggerItem}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
