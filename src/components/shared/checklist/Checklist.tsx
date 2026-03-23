import * as React from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

export interface ChecklistProps {
  title?: string;
  progress?: { completed: number; total: number };
  children: React.ReactNode;
  className?: string;
}

export function Checklist({ title, progress, children, className }: ChecklistProps) {
  const pct =
    progress && progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <Card variant="flat" className={cn("p-6", className)}>
      {(title || progress) && (
        <div className="mb-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {title ?
              <h3 className="text-sm font-medium text-[var(--neutral-900)]">{title}</h3>
            : null}
            {progress ?
              <span className="text-xs tabular-nums text-muted-foreground">
                {progress.completed} of {progress.total} completed
              </span>
            : null}
          </div>
          {progress ?
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--neutral-100)]">
              <div
                className="h-full rounded-full bg-[var(--mw-yellow-400)] transition-[width] duration-[var(--duration-medium1)] ease-[var(--ease-standard)]"
                style={{ width: `${pct}%` }}
              />
            </div>
          : null}
        </div>
      )}
      <div className="space-y-0">{children}</div>
    </Card>
  );
}
