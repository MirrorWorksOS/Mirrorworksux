/**
 * TableSkeleton — Loading placeholder for data tables
 *
 * Per design system: skeleton screens use neutral-100 with shape-md radius.
 * Never use spinners.
 */

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/components/ui/utils";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showFilterBar?: boolean;
  className?: string;
}

function TableSkeleton({
  rows = 5,
  columns = 5,
  showFilterBar = true,
  className,
}: TableSkeletonProps) {
  return (
    <Card variant="flat" className={cn("overflow-hidden p-0", className)}>
      {showFilterBar && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--neutral-100)]">
          <Skeleton className="h-9 w-64 rounded-[var(--shape-md)]" />
          <Skeleton className="h-9 w-24 rounded-[var(--shape-md)]" />
          <div className="flex-1" />
          <Skeleton className="h-9 w-32 rounded-[var(--shape-md)]" />
        </div>
      )}

      <div className="w-full">
        {/* Header */}
        <div className="flex items-center h-12 px-4 border-b border-[var(--neutral-100)]">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={`head-${i}`} className="flex-1 pr-4">
              <Skeleton className="h-3 w-20 rounded-[var(--shape-xs)]" />
            </div>
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={`row-${rowIdx}`}
            className="flex items-center min-h-[56px] px-4 border-b border-[var(--neutral-100)] last:border-b-0"
          >
            {Array.from({ length: columns }).map((_, colIdx) => (
              <div key={`cell-${rowIdx}-${colIdx}`} className="flex-1 pr-4">
                <Skeleton
                  className={cn(
                    "h-4 rounded-[var(--shape-xs)]",
                    colIdx === 0 ? "w-32" : colIdx === columns - 1 ? "w-16" : "w-24",
                  )}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

export { TableSkeleton };
