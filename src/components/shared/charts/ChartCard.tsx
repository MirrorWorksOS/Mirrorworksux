import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";
import { SpotlightCard } from "@/components/shared/surfaces/SpotlightCard";

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  actions,
  children,
  className,
}: ChartCardProps) {
  return (
    <SpotlightCard
      radius="rounded-[var(--shape-lg)]"
      className={cn("h-full min-h-0", className)}
    >
      <Card
        variant="flat"
        className="flex h-full min-h-0 flex-col gap-4 p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <h3 className="text-base font-medium text-foreground">{title}</h3>
            {subtitle ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 items-center justify-end gap-2">
              {actions}
            </div>
          ) : null}
        </div>
        <div className="min-h-0 w-full flex-1">{children}</div>
      </Card>
    </SpotlightCard>
  );
}
