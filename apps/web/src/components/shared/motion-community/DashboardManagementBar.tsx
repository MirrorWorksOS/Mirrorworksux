/**
 * Activity summary bar (Animate UI Management Bar–inspired).
 */

import * as React from "react";
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Download,
  Factory,
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

export interface DashboardManagementBarProps {
  className?: string;
  /** Mock total “events” for the selected slice */
  totalLabel?: string;
}

const SLICES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function DashboardManagementBar({
  className,
  totalLabel = "This week · 42 updates",
}: DashboardManagementBarProps) {
  const [idx, setIdx] = React.useState(3);

  return (
    <motion.div
      layout
      whileHover={{ y: -1 }}
      transition={{ duration: 0.55, ease: [0.2, 0, 0, 1] }}
      className={cn(
        "flex h-full flex-col gap-4 rounded-[var(--shape-xl)] border border-[var(--neutral-200)] bg-card p-5 shadow-[var(--card-shadow-rest)] transition-[box-shadow] duration-[var(--duration-medium1)] ease-[var(--ease-standard)] dark:border-[var(--border)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarRange
            className="h-5 w-5 shrink-0 text-[var(--mw-yellow-500)] dark:text-[var(--mw-yellow-400)]"
            strokeWidth={1.5}
            aria-hidden
          />
          <p className="text-lg font-bold tracking-tight text-foreground">
            Activity summary
          </p>
        </div>
        <span className="text-sm font-light text-muted-foreground">{totalLabel}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-full"
          aria-label="Previous day"
          onClick={() => setIdx((i) => (i - 1 + SLICES.length) % SLICES.length)}
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
        </Button>
        <div className="flex flex-wrap gap-1">
          {SLICES.map((d, i) => (
            <button
              key={d}
              type="button"
              onClick={() => setIdx(i)}
              className={cn(
                "flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-xs font-bold tabular-nums transition-colors duration-[var(--duration-short2)]",
                i === idx
                  ? "bg-[var(--mw-yellow-400)] text-[#2C2C2C]"
                  : "bg-[var(--mw-yellow-400-20)] text-foreground hover:bg-[var(--mw-yellow-400-20)]",
              )}
              aria-label={d}
              aria-current={i === idx ? "date" : undefined}
            >
              {d.slice(0, 1)}
            </button>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-full"
          aria-label="Next day"
          onClick={() => setIdx((i) => (i + 1) % SLICES.length)}
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      </div>

      <div
        className="flex flex-wrap gap-2 border-t border-border pt-4"
        role="group"
        aria-label="Week actions"
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full border border-[var(--border)] font-light transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]"
        >
          <Download className="mr-2 h-4 w-4" strokeWidth={1.5} aria-hidden />
          Export week
        </Button>
        <Button
          asChild
          size="sm"
          className="rounded-full bg-[var(--mw-yellow-400)] font-bold text-[#2C2C2C] shadow-xs transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)] hover:bg-[var(--mw-yellow-500)]"
        >
          <Link to="/plan" className="inline-flex items-center">
            <Factory className="mr-2 h-4 w-4" strokeWidth={1.5} aria-hidden />
            Open Plan
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
