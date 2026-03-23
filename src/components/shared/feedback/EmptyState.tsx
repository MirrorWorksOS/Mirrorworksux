/**
 * EmptyState — Standardised zero-data states
 *
 * Three tiers:
 *  - Full: icon-in-circle + title + description + optional CTA (page/card level)
 *  - Compact: icon + text (inside table/list areas)
 *  - Inline: plain text (kanban columns, filter results)
 */

import * as React from "react";
import { cn } from "@/components/ui/utils";
import { Button } from "@/components/ui/button";
import { type LucideIcon } from "lucide-react";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  variant?: "full" | "compact" | "inline";
  className?: string;
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "full",
  className,
}: EmptyStateProps) {
  if (variant === "inline") {
    return (
      <div className={cn("text-center py-8 text-sm text-muted-foreground", className)}>
        {title}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        {Icon && (
          <Icon className="w-12 h-12 text-[var(--neutral-200)] mb-3" strokeWidth={1.5} />
        )}
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("text-center py-12 px-6", className)}>
      {Icon && (
        <div className="w-16 h-16 bg-[var(--neutral-100)] rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--neutral-800)]"
        >
          {action.icon && <action.icon className="w-4 h-4 mr-2" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface InlineEmptyProps {
  message?: string;
  className?: string;
}

function InlineEmpty({ message = "No items", className }: InlineEmptyProps) {
  return (
    <div
      className={cn(
        "bg-white border border-dashed border-[var(--neutral-200)] rounded-[var(--shape-lg)] p-6 text-center",
        className,
      )}
    >
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
}

export { EmptyState, InlineEmpty };
