import type { ReactNode } from "react";

import { cn } from "@/components/ui/utils";

export interface KPIRowProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

const columnClass: Record<NonNullable<KPIRowProps["columns"]>, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
};

export function KPIRow({ children, columns = 4, className }: KPIRowProps) {
  return (
    <div
      className={cn("grid gap-4", columnClass[columns], className)}
    >
      {children}
    </div>
  );
}
