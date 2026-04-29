/**
 * StatusBadge — Centralised status-to-colour badge component
 *
 * Enforces design system status colours and eliminates per-file
 * statusColors / priorityColors maps across modules.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/components/ui/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      status: {
        success: "bg-[var(--mw-success-light)] text-[var(--mw-success)]",
        error: "bg-[var(--mw-error-light)] text-[var(--mw-error)]",
        warning: "bg-[var(--mw-warning-light)] text-[var(--mw-yellow-800)]",
        info: "bg-[var(--mw-info-light)] text-[var(--mw-info)]",
        neutral: "bg-[var(--neutral-100)] text-[var(--neutral-600)]",
        dark: "bg-[var(--mw-mirage)] text-white",
        accent:
          "bg-[var(--badge-soft-accent-bg)] text-[var(--badge-soft-accent-text)] px-2.5 py-1 font-medium",
      },
      withDot: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      status: "neutral",
      withDot: false,
    },
  },
);

type StatusKey =
  | "draft"
  | "new"
  | "pending"
  | "in_progress"
  | "inProgress"
  | "progress"
  | "completed"
  | "cancelled"
  | "confirmed"
  | "sent"
  | "viewed"
  | "paid"
  | "overdue"
  | "partially_paid"
  | "partiallyPaid"
  | "scheduled"
  | "producing"
  | "produced"
  | "on_hold"
  | "onHold"
  | "approved"
  | "rejected"
  | "ordered"
  | "received"
  | "open"
  | "closed"
  | "active"
  | "inactive"
  | "shipped"
  | "delivered"
  | "returned";

type PriorityKey = "low" | "medium" | "high" | "urgent" | "critical";

const STATUS_VARIANT_MAP: Record<StatusKey, VariantProps<typeof statusBadgeVariants>["status"]> = {
  draft: "neutral",
  new: "info",
  pending: "warning",
  in_progress: "accent",
  inProgress: "accent",
  progress: "accent",
  completed: "success",
  cancelled: "neutral",
  confirmed: "success",
  sent: "info",
  viewed: "info",
  paid: "success",
  overdue: "error",
  partially_paid: "warning",
  partiallyPaid: "warning",
  scheduled: "info",
  producing: "accent",
  produced: "success",
  on_hold: "warning",
  onHold: "warning",
  approved: "success",
  rejected: "error",
  ordered: "info",
  received: "success",
  open: "info",
  closed: "neutral",
  active: "success",
  inactive: "neutral",
  shipped: "info",
  delivered: "success",
  returned: "warning",
};

const PRIORITY_VARIANT_MAP: Record<PriorityKey, VariantProps<typeof statusBadgeVariants>["status"]> = {
  low: "neutral",
  medium: "neutral",
  high: "accent",
  urgent: "dark",
  critical: "dark",
};

const DOT_COLOUR_MAP: Record<NonNullable<VariantProps<typeof statusBadgeVariants>["status"]>, string> = {
  success: "bg-[var(--mw-success)]",
  error: "bg-[var(--mw-error)]",
  warning: "bg-[var(--mw-warning)]",
  info: "bg-[var(--mw-info)]",
  neutral: "bg-[var(--neutral-400)]",
  dark: "bg-white",
  accent: "bg-[var(--mw-yellow-400)]",
};

/**
 * Live statuses that auto-pulse the dot when withDot is on. Override
 * with the `pulse` prop (true to force on, false to suppress).
 */
const LIVE_STATUSES = new Set<string>([
  "in_progress",
  "inProgress",
  "progress",
  "producing",
]);

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: string;
  priority?: string;
  variant?: VariantProps<typeof statusBadgeVariants>["status"];
  withDot?: boolean;
  /**
   * Animate the dot with a soft outer pulse — signals "live / in progress".
   * Defaults to true for live status keys (`in_progress`, `producing`, etc.)
   * when `withDot` is on; pass `false` to suppress.
   */
  pulse?: boolean;
  children?: React.ReactNode;
}

function StatusBadge({
  status,
  priority,
  variant: variantProp,
  withDot = false,
  pulse,
  children,
  className,
  ...props
}: StatusBadgeProps) {
  const resolvedVariant =
    variantProp ??
    (status ? STATUS_VARIANT_MAP[status as StatusKey] : undefined) ??
    (priority ? PRIORITY_VARIANT_MAP[priority as PriorityKey] : undefined) ??
    "neutral";

  const isLive = pulse ?? (status !== undefined && LIVE_STATUSES.has(status));

  const label =
    children ??
    (status ?? priority ?? "")
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^\w/, (c) => c.toUpperCase());

  return (
    <span
      className={cn(statusBadgeVariants({ status: resolvedVariant, withDot }), className)}
      {...props}
    >
      {withDot && (
        <span className="relative inline-flex h-2 w-2 shrink-0">
          {isLive && (
            <span
              aria-hidden
              className={cn(
                "absolute inset-0 rounded-full opacity-60 motion-safe:animate-ping",
                DOT_COLOUR_MAP[resolvedVariant ?? "neutral"],
              )}
            />
          )}
          <span
            className={cn(
              "relative h-2 w-2 rounded-full",
              DOT_COLOUR_MAP[resolvedVariant ?? "neutral"],
            )}
          />
        </span>
      )}
      {label}
    </span>
  );
}

export {
  StatusBadge,
  statusBadgeVariants,
  STATUS_VARIANT_MAP,
  PRIORITY_VARIANT_MAP,
  type StatusKey,
  type PriorityKey,
  type StatusBadgeProps,
};
