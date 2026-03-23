import * as React from "react";

import { cn } from "@/components/ui/utils";

export interface DashboardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

const columnClasses: Record<1 | 2 | 3, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 lg:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
};

export function DashboardGrid({
  children,
  columns = 2,
  className,
}: DashboardGridProps) {
  return (
    <div className={cn("grid gap-6", columnClasses[columns], className)}>
      {children}
    </div>
  );
}
