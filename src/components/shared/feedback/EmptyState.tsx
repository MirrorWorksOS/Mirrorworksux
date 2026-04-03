/**
 * EmptyState — Standardised zero-data states
 *
 * Four tiers:
 *  - Illustrated: large SVG artwork + title + description + actions (Figma empty-state pattern)
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
  variant?: "primary" | "outline";
}

interface EmptyStateProps {
  icon?: LucideIcon;
  /** SVG artwork source path for illustrated variant */
  illustration?: string;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  /** Additional actions rendered alongside the primary action */
  actions?: EmptyStateAction[];
  variant?: "illustrated" | "full" | "compact" | "inline";
  className?: string;
}

function EmptyState({
  icon: Icon,
  illustration,
  title,
  description,
  action,
  actions,
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

  if (variant === "illustrated") {
    const allActions = action ? [action, ...(actions ?? [])] : (actions ?? []);

    return (
      <div className={cn("flex flex-col items-center justify-center flex-1 p-10", className)}>
        <div className="border border-dashed border-[var(--neutral-200)] rounded-[var(--shape-lg)] flex flex-col items-center gap-6 p-10 w-full max-w-2xl">
          {illustration && (
            <img
              src={illustration}
              alt=""
              className="w-[265px] h-auto"
              aria-hidden
            />
          )}
          <div className="flex flex-col items-center gap-2 text-center w-full">
            <h2 className="text-4xl tracking-tight text-foreground">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-[var(--neutral-500)]">
                {description}
              </p>
            )}
          </div>
          {allActions.length > 0 && (
            <div className="flex items-center gap-3">
              {allActions.map((act, i) => (
                <Button
                  key={act.label}
                  onClick={act.onClick}
                  variant={act.variant === "outline" ? "outline" : undefined}
                  className={cn(
                    act.variant === "outline"
                      ? "border-[var(--border)] text-foreground"
                      : "bg-[var(--mw-mirage)] text-white hover:bg-[var(--mw-mirage)]/90",
                  )}
                >
                  {act.icon && <act.icon className="w-4 h-4 mr-2" />}
                  {act.label}
                </Button>
              ))}
            </div>
          )}
        </div>
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
      <h3 className="text-base font-medium text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
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
        "bg-card border border-dashed border-[var(--neutral-200)] rounded-[var(--shape-lg)] p-6 text-center",
        className,
      )}
    >
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
}

export { EmptyState, InlineEmpty };
