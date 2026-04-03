/**
 * PageToolbar — Shared toolbar primitives for data pages
 * (tables, kanbans, calendars, card grids).
 *
 * Composable: each page picks the pieces it needs.
 *
 *   <ToolbarSummaryBar segments={[...]} />
 *   <PageToolbar>
 *     <ToolbarSearch value={q} onChange={setQ} />
 *     <ToolbarFilterPills value={tab} onChange={setTab} options={[...]} />
 *     <ToolbarSpacer />
 *     <ToolbarFilterButton />
 *     <IconViewToggle ... />
 *     <ToolbarPrimaryButton icon={Plus}>New Invoice</ToolbarPrimaryButton>
 *   </PageToolbar>
 */

import * as React from "react";
import { type ChangeEvent, type ReactNode } from "react";
import { Search } from "lucide-react";
import { motion } from "motion/react";

import { Input } from "@/components/ui/input";
import { cn } from "@/components/ui/utils";
import {
  TooltipProvider as AnimateTooltipProvider,
  Tooltip as AnimateTooltip,
  TooltipTrigger as AnimateTooltipTrigger,
  TooltipContent as AnimateTooltipContent,
  TooltipArrow as AnimateTooltipArrow,
} from "@/components/animate-ui/primitives/animate/tooltip";

/* ------------------------------------------------------------------ */
/*  PageToolbar — flex row with standard gap                          */
/* ------------------------------------------------------------------ */

export interface PageToolbarProps {
  children: ReactNode;
  className?: string;
}

/** Standardised toolbar row — aligns items center with consistent gap. */
export function PageToolbar({ children, className }: PageToolbarProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {children}
    </div>
  );
}

/** Pushes subsequent items to the right end of the toolbar. */
export function ToolbarSpacer() {
  return <div className="min-w-0 flex-1" />;
}

/* ------------------------------------------------------------------ */
/*  ToolbarSearch — standardised search input                         */
/* ------------------------------------------------------------------ */

export interface ToolbarSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/** Rounded-pill search input with icon. Consistent h-10 across all data pages. */
export function ToolbarSearch({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: ToolbarSearchProps) {
  return (
    <div className={cn("relative w-64 shrink-0", className)}>
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--neutral-400)]"
        strokeWidth={1.5}
      />
      <Input
        type="search"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-12 rounded-full border-[var(--neutral-200)] bg-background pl-10 text-sm"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ToolbarFilterPills — quick status/filter tabs                     */
/* ------------------------------------------------------------------ */

export interface FilterPillOption {
  key: string;
  label: string;
  count?: number;
}

export interface ToolbarFilterPillsProps {
  value: string;
  onChange: (key: string) => void;
  options: FilterPillOption[];
  className?: string;
}

/** Horizontal pill tabs for quick filtering (e.g. All / Paid / Overdue). */
export function ToolbarFilterPills({
  value,
  onChange,
  options,
  className,
}: ToolbarFilterPillsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter"
      className={cn("flex items-center gap-1 overflow-x-auto", className)}
    >
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.key)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap",
              "transition-colors duration-[var(--duration-short2)] ease-[var(--ease-standard)]",
              active
                ? "bg-[var(--mw-mirage)] text-white"
                : "text-[var(--neutral-500)] hover:bg-[var(--neutral-100)] hover:text-[var(--neutral-700)]",
            )}
          >
            {opt.label}
            {opt.count != null && (
              <span
                className={cn(
                  "inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs tabular-nums leading-tight",
                  active
                    ? "bg-white/20 text-white"
                    : "bg-[var(--neutral-100)] text-[var(--neutral-500)]",
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ToolbarSummaryBar — animated horizontal stacked bar               */
/* ------------------------------------------------------------------ */

export interface SummarySegment {
  key: string;
  label: string;
  value: number;
  color: string;
}

export interface ToolbarSummaryBarProps {
  segments: SummarySegment[];
  className?: string;
  /** Format a numeric value for the legend. Defaults to currency shorthand ($12k). */
  formatValue?: (value: number) => string;
}

function defaultFormat(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v.toLocaleString()}`;
}

function fullCurrency(v: number): string {
  return `$${v.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/** Animated stacked horizontal bar with legend — shows data breakdown at a glance.
 *  Each segment has a context-aware Animate UI tooltip that glides between segments. */
export function ToolbarSummaryBar({
  segments,
  className,
  formatValue = defaultFormat,
}: ToolbarSummaryBarProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Stacked bar with context-aware tooltips */}
      <AnimateTooltipProvider openDelay={0} closeDelay={150}>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--neutral-100)]">
          {segments.map((seg) => {
            const pct = (seg.value / total) * 100;
            if (pct === 0) return null;
            return (
              <AnimateTooltip key={seg.key} side="top" sideOffset={8}>
                <AnimateTooltipTrigger asChild>
                  <motion.div
                    className="h-full cursor-default"
                    style={{ backgroundColor: seg.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.65, ease: [0.2, 0, 0, 1] }}
                  />
                </AnimateTooltipTrigger>
                <AnimateTooltipContent
                  className="z-50 rounded-lg border border-[var(--neutral-200)] bg-popover/95 px-3 py-2 shadow-lg backdrop-blur-md"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="text-xs font-medium text-[var(--neutral-900)]">
                      {seg.label}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm font-semibold tabular-nums text-[var(--mw-mirage)]">
                      {fullCurrency(seg.value)}
                    </span>
                    <span className="text-[10px] tabular-nums text-[var(--neutral-500)]">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                  <AnimateTooltipArrow
                    className="fill-white/95"
                    width={10}
                    height={5}
                  />
                </AnimateTooltipContent>
              </AnimateTooltip>
            );
          })}
        </div>
      </AnimateTooltipProvider>
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-1.5 text-xs">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-[var(--neutral-500)]">{seg.label}</span>
            <span className="font-medium text-[var(--mw-mirage)]">
              {formatValue(seg.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
