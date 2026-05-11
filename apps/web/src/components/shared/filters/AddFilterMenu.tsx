/**
 * AddFilterMenu — "+ Filter" overflow picker.
 *
 * Lists the non-pinned facets so the user can add them on demand. Once added,
 * a chip appears on the active-filter row. (Pinned facets are always visible
 * in the main bar; the date facet is rendered separately via DateChip.)
 */

import * as React from "react";
import { useState } from "react";
import { Filter } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/components/ui/utils";

import { type FilterSchema, type FilterState, facetHasValue } from "./schema";

export interface AddFilterMenuProps {
  schema: FilterSchema;
  state: FilterState;
  onPick: (facetId: string) => void;
  activeCount: number;
}

export function AddFilterMenu({ schema, state, onPick, activeCount }: AddFilterMenuProps) {
  const [open, setOpen] = useState(false);

  const overflow = schema.facets.filter(
    (f) => !f.pinned && f.id !== schema.dateFacetId && f.kind !== "boolean",
  );
  if (overflow.length === 0) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
            activeCount > 0
              ? "border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)]/15 text-foreground"
              : "border-[var(--neutral-200)] bg-background text-[var(--neutral-600)] hover:bg-[var(--neutral-50)]",
          )}
        >
          <Filter className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          <span>{activeCount > 0 ? `${activeCount} filter${activeCount > 1 ? "s" : ""}` : "Filter"}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-64 rounded-[var(--shape-lg)] border border-[var(--border)] bg-popover p-1 shadow-lg"
      >
        <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--neutral-500)]">
          Add filter
        </div>
        <div className="max-h-72 overflow-y-auto">
          {overflow.map((facet) => {
            const has = facetHasValue(state.values[facet.id]);
            const Icon = facet.icon;
            return (
              <button
                key={facet.id}
                type="button"
                onClick={() => {
                  onPick(facet.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-[var(--neutral-50)]",
                  has && "text-foreground",
                )}
              >
                {Icon ? <Icon className="h-4 w-4 text-[var(--neutral-500)]" strokeWidth={1.5} /> : null}
                <span className="flex-1">{facet.label}</span>
                {has ? <span className="rounded-full bg-[var(--mw-yellow-400)]/30 px-2 py-0.5 text-[10px] font-medium text-foreground">on</span> : null}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
