/**
 * CardSkeleton — Loading placeholders for cards, KPI tiles, and pages
 *
 * Per design system: skeletons use neutral-100 with shape-md radius.
 * Never use spinners.
 */

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/components/ui/utils";

interface CardSkeletonProps {
  className?: string;
}

function KpiSkeleton({ className }: CardSkeletonProps) {
  return (
    <Card variant="flat" className={cn("p-6 space-y-3", className)}>
      <Skeleton className="h-3 w-24 rounded-[var(--shape-xs)]" />
      <Skeleton className="h-8 w-32 rounded-[var(--shape-md)]" />
      <Skeleton className="h-3 w-20 rounded-[var(--shape-xs)]" />
    </Card>
  );
}

function KpiRowSkeleton({
  count = 4,
  className,
}: CardSkeletonProps & { count?: number }) {
  return (
    <div className={cn("grid gap-4", className)} style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}>
      {Array.from({ length: count }).map((_, i) => (
        <KpiSkeleton key={i} />
      ))}
    </div>
  );
}

function ChartSkeleton({ className }: CardSkeletonProps) {
  return (
    <Card variant="flat" className={cn("p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-36 rounded-[var(--shape-xs)]" />
        <Skeleton className="h-8 w-24 rounded-[var(--shape-md)]" />
      </div>
      <Skeleton className="h-48 w-full rounded-[var(--shape-md)]" />
    </Card>
  );
}

function ContentCardSkeleton({
  lines = 3,
  className,
}: CardSkeletonProps & { lines?: number }) {
  return (
    <Card variant="flat" className={cn("p-6 space-y-4", className)}>
      <Skeleton className="h-5 w-40 rounded-[var(--shape-xs)]" />
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              "h-4 rounded-[var(--shape-xs)]",
              i === lines - 1 ? "w-3/5" : "w-full",
            )}
          />
        ))}
      </div>
    </Card>
  );
}

function PageSkeleton({ className }: CardSkeletonProps) {
  return (
    <div className={cn("p-6 space-y-6", className)}>
      <KpiRowSkeleton count={4} />
      <div className="grid grid-cols-2 gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <ContentCardSkeleton lines={5} />
    </div>
  );
}

export {
  KpiSkeleton,
  KpiRowSkeleton,
  ChartSkeleton,
  ContentCardSkeleton,
  PageSkeleton,
};
