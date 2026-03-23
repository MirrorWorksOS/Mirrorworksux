import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Check, Circle } from "lucide-react";

import { cn } from "@/components/ui/utils";

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: LucideIcon;
  iconColor?: string;
  status?: "completed" | "current" | "upcoming";
}

export interface TimelineViewProps {
  events: TimelineEvent[];
  className?: string;
}

function StatusIcon({ event }: { event: TimelineEvent }) {
  const status = event.status ?? "upcoming";
  const Icon = event.icon;
  const colour = event.iconColor;

  if (status === "completed") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--mw-success)]/10 text-[var(--mw-success)]">
        <Check className="h-4 w-4" strokeWidth={2.5} />
      </div>
    );
  }
  if (status === "current") {
    return (
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--mw-yellow-50)] text-[var(--mw-yellow-400)]">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--mw-yellow-400)] opacity-20" />
        {Icon ?
          <Icon className="relative h-4 w-4" style={colour ? { color: colour } : undefined} />
        : <Circle className="relative h-4 w-4 fill-current" />}
      </div>
    );
  }
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--neutral-100)] text-[var(--neutral-500)]"
      style={Icon && colour ? { color: colour } : undefined}
    >
      {Icon ?
        <Icon className="h-4 w-4" />
      : <Circle className="h-4 w-4" />}
    </div>
  );
}

export function TimelineView({ events, className }: TimelineViewProps) {
  return (
    <div className={cn("border-l-2 border-[var(--neutral-200)] pl-8", className)}>
      {events.map((event) => (
        <div key={event.id} className="relative pb-8 last:pb-0">
          <div className="absolute left-0 top-0 -translate-x-[calc(50%+1px)]">
            <StatusIcon event={event} />
          </div>
          <div className="min-w-0 rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-white p-4 shadow-xs">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-medium text-[var(--neutral-900)]">{event.title}</h3>
              <time className="text-xs tabular-nums text-muted-foreground">{event.timestamp}</time>
            </div>
            {event.description ?
              <p className="mt-1 text-xs text-muted-foreground">{event.description}</p>
            : null}
          </div>
        </div>
      ))}
    </div>
  );
}
