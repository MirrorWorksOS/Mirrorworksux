/**
 * FacetChip — single pinned-facet button with picker popover.
 *
 * Handles select / multi / tag / user / boolean / range facets in one chip
 * UI. Date is handled by the dedicated `DateChip` so it can host quick-zooms.
 */

import * as React from "react";
import { useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/components/ui/utils";

import {
  type FacetSchema,
  type FacetValue,
  facetHasValue,
} from "./schema";

export interface FacetChipProps {
  facet: FacetSchema;
  value: FacetValue;
  onChange: (next: FacetValue) => void;
  onClear: () => void;
  /** Style as a compact non-pinned chip on the active-filter row. */
  compact?: boolean;
}

function describeValue(facet: FacetSchema, value: FacetValue): string {
  if (!facetHasValue(value)) return facet.placeholder ?? facet.label;
  switch (facet.kind) {
    case "select":
    case "user": {
      const opt = facet.options?.find((o) => o.value === value);
      return opt?.label ?? String(value);
    }
    case "multi":
    case "tag": {
      const arr = value as string[];
      if (arr.length === 1) {
        return facet.options?.find((o) => o.value === arr[0])?.label ?? arr[0];
      }
      return `${arr.length} selected`;
    }
    case "boolean":
      return facet.label;
    case "range": {
      const v = value as { from?: number; to?: number };
      if (v.from != null && v.to != null) return `${v.from.toLocaleString()}–${v.to.toLocaleString()}`;
      if (v.from != null) return `≥ ${v.from.toLocaleString()}`;
      if (v.to != null) return `≤ ${v.to.toLocaleString()}`;
      return facet.label;
    }
    default:
      return facet.label;
  }
}

export function FacetChip({ facet, value, onChange, onClear, compact }: FacetChipProps) {
  const [open, setOpen] = useState(false);
  const Icon = facet.icon;
  const active = facetHasValue(value);
  const label = describeValue(facet, value);

  // Boolean toggles don't need a popover.
  if (facet.kind === "boolean") {
    const on = value === true;
    return (
      <button
        type="button"
        onClick={() => onChange(!on)}
        aria-pressed={on}
        className={cn(
          "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
          on
            ? "border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)]/15 text-foreground"
            : "border-[var(--neutral-200)] bg-background text-[var(--neutral-600)] hover:bg-[var(--neutral-50)]",
        )}
      >
        {Icon ? <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden /> : null}
        <span>{facet.label}</span>
      </button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-full border text-sm font-medium transition-colors",
            compact ? "h-8 px-3" : "h-10 px-4",
            active
              ? "border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)]/15 text-foreground"
              : "border-[var(--neutral-200)] bg-background text-[var(--neutral-600)] hover:bg-[var(--neutral-50)]",
          )}
        >
          {Icon ? <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden /> : null}
          <span className={active ? "" : "text-[var(--neutral-500)]"}>
            {active ? <><span className="text-[var(--neutral-500)]">{facet.label}:</span> {label}</> : label}
          </span>
          <ChevronDown className="h-4 w-4 text-[var(--neutral-500)]" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 rounded-lg border border-[var(--border)] bg-popover p-3 shadow-lg">
        <FacetPickerBody facet={facet} value={value} onChange={onChange} />
        <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-[var(--neutral-500)]"
            onClick={() => {
              onClear();
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
      </PopoverContent>
    </Popover>
  );
}

/* ------------------------------------------------------------------ */

interface FacetPickerBodyProps {
  facet: FacetSchema;
  value: FacetValue;
  onChange: (next: FacetValue) => void;
}

function FacetPickerBody({ facet, value, onChange }: FacetPickerBodyProps) {
  if (facet.kind === "select" || facet.kind === "user") {
    const selected = value as string | null;
    return (
      <div className="max-h-64 space-y-0.5 overflow-y-auto">
        {(facet.options ?? []).map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(isSelected ? null : opt.value)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                "hover:bg-[var(--neutral-50)]",
                isSelected && "bg-[var(--neutral-50)]",
              )}
            >
              <span className="flex items-center gap-2">
                {opt.color ? (
                  <span
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: opt.color }}
                    aria-hidden
                  />
                ) : null}
                {opt.label}
              </span>
              {isSelected ? <Check className="h-4 w-4 text-[var(--mw-yellow-500)]" /> : null}
            </button>
          );
        })}
      </div>
    );
  }

  if (facet.kind === "multi" || facet.kind === "tag") {
    const selected = (value as string[] | null) ?? [];
    const toggle = (v: string) => {
      const has = selected.includes(v);
      onChange(has ? selected.filter((x) => x !== v) : [...selected, v]);
    };
    return (
      <div className="max-h-64 space-y-0.5 overflow-y-auto">
        {(facet.options ?? []).map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-[var(--neutral-50)]"
            >
              <span
                className={cn(
                  "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                  isSelected
                    ? "border-[var(--mw-yellow-500)] bg-[var(--mw-yellow-400)]"
                    : "border-[var(--neutral-300)]",
                )}
                aria-hidden
              >
                {isSelected ? <Check className="h-3 w-3 text-foreground" /> : null}
              </span>
              {opt.color ? (
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: opt.color }}
                  aria-hidden
                />
              ) : null}
              <span className="flex-1">{opt.label}</span>
              {opt.count != null ? (
                <span className="text-xs tabular-nums text-[var(--neutral-500)]">{opt.count}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    );
  }

  if (facet.kind === "range") {
    const v = (value as { from?: number; to?: number } | null) ?? {};
    return (
      <div className="space-y-2">
        <label className="block text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">
          {facet.label}
        </label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="From"
            value={v.from ?? ""}
            onChange={(e) =>
              onChange({
                ...v,
                from: e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            className="h-9 rounded-lg text-sm"
          />
          <span className="text-xs text-[var(--neutral-500)]">to</span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="To"
            value={v.to ?? ""}
            onChange={(e) =>
              onChange({
                ...v,
                to: e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            className="h-9 rounded-lg text-sm"
          />
        </div>
      </div>
    );
  }

  return null;
}
