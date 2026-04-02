import * as React from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

export interface DashboardWidgetProps {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  span?: 1 | 2;
}

export function DashboardWidget({
  title,
  actions,
  children,
  className,
  span = 1,
}: DashboardWidgetProps) {
  return (
    <Card
      variant="flat"
      className={cn(
        "p-6",
        span === 2 && "col-span-2",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 className="text-base font-medium text-[var(--neutral-900)]">
          {title}
        </h2>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {children}
    </Card>
  );
}
