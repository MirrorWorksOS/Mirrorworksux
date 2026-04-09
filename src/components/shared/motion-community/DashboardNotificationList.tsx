/**
 * Stacked notification list — hover expands the stack (Animate UI pattern).
 * @see https://animate-ui.com/docs/components/community/notification-list
 */

import * as React from "react";
import { motion, type Transition } from "motion/react";
import { Bell, CheckCircle2, Package, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { mwHairlineBorder, mwPillYellowClass } from "@/lib/dashboard-ui";

type Note = {
  id: string;
  title: string;
  meta: string;
  icon: "sync" | "ship" | "build";
};

const DEFAULT_NOTES: Note[] = [
  {
    id: "1",
    title: "MES bridge sync completed",
    meta: "2 min ago · 1,240 rows",
    icon: "sync",
  },
  {
    id: "2",
    title: "Build validation passed",
    meta: "12 min ago · Control",
    icon: "build",
  },
  {
    id: "3",
    title: "Carrier API latency normalised",
    meta: "1 hr ago · Ship",
    icon: "ship",
  },
];

const SOFT_EASE: [number, number, number, number] = [0.2, 0, 0, 1];

/** Softer than upstream spring — matches dashboard motion */
const stackTransition: Transition = {
  type: "tween",
  duration: 0.5,
  ease: SOFT_EASE,
};

function getStackVariants(i: number) {
  return {
    collapsed: {
      marginTop: i === 0 ? 0 : -42,
      scaleX: 1 - i * 0.045,
    },
    expanded: {
      marginTop: i === 0 ? 0 : 8,
      scaleX: 1,
    },
  };
}

function Icon({ type }: { type: Note["icon"] }) {
  const cls =
    "h-5 w-5 shrink-0 text-[var(--mw-yellow-500)] dark:text-[var(--mw-yellow-400)]";
  switch (type) {
    case "sync":
      return <Zap className={cls} strokeWidth={1.5} aria-hidden />;
    case "ship":
      return <Package className={cls} strokeWidth={1.5} aria-hidden />;
    default:
      return <CheckCircle2 className={cls} strokeWidth={1.5} aria-hidden />;
  }
}

export interface DashboardNotificationListProps {
  className?: string;
  items?: Note[];
  placement?: "top" | "panel";
}

export function DashboardNotificationList({
  className,
  items = DEFAULT_NOTES,
  placement = "panel",
}: DashboardNotificationListProps) {
  const isTop = placement === "top";

  return (
    <motion.div
      whileHover={isTop ? undefined : { y: -1 }}
      transition={{ duration: 0.55, ease: SOFT_EASE }}
      className={cn(
        "bg-card p-5 text-foreground shadow-[var(--card-shadow-rest)] transition-[box-shadow] duration-[var(--duration-medium1)] ease-[var(--ease-standard)]",
        mwHairlineBorder,
        isTop ? "rounded-[var(--shape-2xl)]" : "rounded-[var(--shape-xl)]",
        className,
      )}
    >
      <motion.div
        className="group/stack"
        initial="collapsed"
        whileHover="expanded"
      >
        {isTop ? (
          <div className="mb-4 flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <Bell
                className="h-8 w-8 shrink-0 text-[var(--mw-yellow-500)] dark:text-[var(--mw-yellow-400)]"
                strokeWidth={1.5}
                aria-hidden
              />
              <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Notifications
              </h3>
              <span className={cn("px-3 py-1 text-sm tabular-nums", mwPillYellowClass)}>
                {items.length}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-11 min-h-[48px] shrink-0 rounded-full bg-transparent font-bold text-foreground transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)] hover:bg-[var(--muted)]",
                mwHairlineBorder,
              )}
            >
              View all
            </Button>
          </div>
        ) : (
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Bell
                className="h-6 w-6 text-[var(--mw-yellow-500)] dark:text-[var(--mw-yellow-400)]"
                strokeWidth={1.5}
                aria-hidden
              />
              <h3 className="text-lg font-bold tracking-tight text-foreground">Live updates</h3>
            </div>
            <span className={cn("px-3 py-1 text-sm tabular-nums", mwPillYellowClass)}>
              {items.length} new
            </span>
          </div>
        )}

        <ul className="relative list-none space-y-0 p-0" role="list">
          {items.map((n, i) => (
            <motion.li
              key={n.id}
              role="listitem"
              variants={getStackVariants(i)}
              transition={stackTransition}
              className="relative origin-top first:mt-0"
              style={{ zIndex: items.length - i }}
            >
              <div
                className={cn(
                  "rounded-[var(--shape-xl)] border border-[var(--mw-yellow-400)]/50 bg-white p-4 shadow-sm",
                  "dark:border-[var(--mw-yellow-400)]/28 dark:bg-[var(--secondary)]",
                  "transition-[box-shadow,background-color,border-color] duration-[var(--duration-medium1)] ease-[var(--ease-standard)]",
                  "group-hover/stack:border-[var(--mw-yellow-400)] group-hover/stack:shadow-md",
                  "dark:group-hover/stack:bg-[var(--neutral-300)]",
                )}
              >
                <div className="flex gap-4">
                  <span className="mt-0.5 shrink-0">
                    <Icon type={n.icon} />
                  </span>
                  <div className="min-w-0 flex-1 space-y-1.5 pr-1">
                    <span className="block text-sm font-bold leading-snug text-foreground">
                      {n.title}
                    </span>
                    <p className="text-xs font-light leading-relaxed text-muted-foreground dark:text-[var(--neutral-800)]">
                      {n.meta}
                    </p>
                  </div>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {isTop ? null : (
        <Button
          type="button"
          variant="ghost"
          className="mt-4 w-full rounded-full text-sm font-light text-muted-foreground transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)] hover:bg-[var(--mw-yellow-400-20)] hover:text-foreground"
        >
          View all activity
        </Button>
      )}
    </motion.div>
  );
}
