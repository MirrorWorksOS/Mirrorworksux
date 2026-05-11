/**
 * DateChip — persistent date-range chip for the filter bar.
 *
 * Renders the date facet declared by `FilterSchema.dateFacetId`. Quick-zoom
 * buttons (Today · This week · This month · This quarter · Custom) seed
 * the from/to fields. Always visible on date-critical screens so reps don't
 * have to dig through a popover for the most-used scope of the day.
 */

import * as React from "react";
import { useState } from "react";
import { Calendar as CalendarIcon, ChevronDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/components/ui/utils";

import { type FacetSchema, facetHasValue } from "./schema";

export interface DateRange {
  from?: string;
  to?: string;
}

/** Quick-range identifiers — any subset can be passed to `DateChip`. */
export type QuickRangeId =
  | "today"
  | "yesterday"
  | "thisWeek"
  | "next7days"
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
  | "thisYear"
  | "ytd"
  | "lastYear";

const QUICK_RANGE_LABEL: Record<QuickRangeId, string> = {
  today: "Today",
  yesterday: "Yesterday",
  thisWeek: "This week",
  next7days: "Next 7 days",
  thisMonth: "This month",
  lastMonth: "Last month",
  thisQuarter: "This quarter",
  thisYear: "This year",
  ytd: "YTD",
  lastYear: "Last year",
};

/** Default chip set used when a screen doesn't opt-in to a custom list. */
export const DEFAULT_QUICK_RANGES: QuickRangeId[] = [
  "today",
  "thisWeek",
  "thisMonth",
  "thisQuarter",
  "thisYear",
];

export interface DateChipProps {
  facet: FacetSchema;
  value: DateRange | null | undefined;
  onChange: (next: DateRange | null) => void;
  /** Override the set of quick ranges shown. Defaults to `DEFAULT_QUICK_RANGES`. */
  quickRanges?: QuickRangeId[];
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function quickRange(kind: QuickRangeId): DateRange {
  const now = new Date();
  if (kind === "today") {
    return { from: isoDay(now), to: isoDay(now) };
  }
  if (kind === "yesterday") {
    const y = new Date(now);
    y.setDate(now.getDate() - 1);
    return { from: isoDay(y), to: isoDay(y) };
  }
  if (kind === "thisWeek") {
    const day = now.getDay() || 7; // Mon-start
    const start = new Date(now);
    start.setDate(now.getDate() - (day - 1));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { from: isoDay(start), to: isoDay(end) };
  }
  if (kind === "next7days") {
    const end = new Date(now);
    end.setDate(now.getDate() + 6);
    return { from: isoDay(now), to: isoDay(end) };
  }
  if (kind === "thisMonth") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: isoDay(start), to: isoDay(end) };
  }
  if (kind === "lastMonth") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from: isoDay(start), to: isoDay(end) };
  }
  if (kind === "thisQuarter") {
    const q = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), q * 3, 1);
    const end = new Date(now.getFullYear(), q * 3 + 3, 0);
    return { from: isoDay(start), to: isoDay(end) };
  }
  if (kind === "thisYear") {
    return { from: `${now.getFullYear()}-01-01`, to: `${now.getFullYear()}-12-31` };
  }
  if (kind === "ytd") {
    return { from: `${now.getFullYear()}-01-01`, to: isoDay(now) };
  }
  // lastYear
  const ly = now.getFullYear() - 1;
  return { from: `${ly}-01-01`, to: `${ly}-12-31` };
}

function formatChip(value: DateRange | null | undefined): string | null {
  if (!value || (!value.from && !value.to)) return null;
  const fmt = (s?: string) =>
    s
      ? new Date(s).toLocaleDateString("en-AU", { day: "numeric", month: "short" })
      : "";
  if (value.from && value.to && value.from === value.to) return fmt(value.from);
  if (value.from && value.to) return `${fmt(value.from)} – ${fmt(value.to)}`;
  if (value.from) return `from ${fmt(value.from)}`;
  if (value.to) return `until ${fmt(value.to)}`;
  return null;
}

export function DateChip({
  facet,
  value,
  onChange,
  quickRanges = DEFAULT_QUICK_RANGES,
}: DateChipProps) {
  const [open, setOpen] = useState(false);
  const active = facetHasValue(value);
  const display = formatChip(value) ?? facet.placeholder ?? "Any date";

  const setQuick = (kind: QuickRangeId) => {
    onChange(quickRange(kind));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
            active
              ? "border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)]/15 text-foreground"
              : "border-[var(--neutral-200)] bg-background text-[var(--neutral-600)] hover:bg-[var(--neutral-50)]",
          )}
        >
          <CalendarIcon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          <span>
            <span className="text-[var(--neutral-500)]">{facet.label}:</span> {display}
          </span>
          <ChevronDown className="h-4 w-4 text-[var(--neutral-500)]" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 rounded-[var(--shape-lg)] border border-[var(--border)] bg-popover p-4 shadow-lg"
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">
              Quick range
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickRanges.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setQuick(id)}
                  className="rounded-full border border-[var(--neutral-200)] bg-background px-3 py-1 text-xs font-medium text-[var(--neutral-600)] transition-colors hover:bg-[var(--neutral-50)] hover:text-foreground"
                >
                  {QUICK_RANGE_LABEL[id]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">
              Custom
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={value?.from ?? ""}
                onChange={(e) => onChange({ ...(value ?? {}), from: e.target.value || undefined })}
                className="h-9 flex-1 rounded-lg text-xs"
              />
              <span className="text-xs text-[var(--neutral-500)]">to</span>
              <Input
                type="date"
                value={value?.to ?? ""}
                onChange={(e) => onChange({ ...(value ?? {}), to: e.target.value || undefined })}
                className="h-9 flex-1 rounded-lg text-xs"
              />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-[var(--border)] pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-[var(--neutral-500)]"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              <X className="mr-1 h-3 w-3" /> Clear
            </Button>
            <Button
              size="sm"
              className="h-8 bg-[var(--mw-yellow-400)] px-4 text-xs text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
