/**
 * ModuleFilterBar — schema-driven filter / search / view-mode bar.
 *
 * Layout:
 *   Row 1: [Search] [Preset ▾] [📅 Date] [Pinned facets …]   ⟵spacer⟶   [+ Filter] [view toggles] [actions slot]
 *   Row 2 (when non-pinned active filters exist): chip row + Save view…
 *
 * Replaces the legacy `ToolbarFilterButton`. Each list/board screen passes
 * its FilterSchema; this component renders the right facets for that screen
 * and writes state to the URL via `useFilterState`.
 *
 * Verifies design principles from `docs/plans/FILTERS-REDESIGN.md`.
 */

import * as React from "react";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { IconViewToggle, type IconViewOption } from "@/components/shared/layout/IconViewToggle";
import { cn } from "@/components/ui/utils";

import { AddFilterMenu } from "./AddFilterMenu";
import { DateChip } from "./DateChip";
import { FacetChip } from "./FacetChip";
import { PresetMenu } from "./PresetMenu";
import {
  type FacetSchema,
  type FacetValue,
  type FilterSchema,
  type SavedView,
  countActiveFacets,
  facetHasValue,
  findFacet,
} from "./schema";
import { useFilterState, type UseFilterStateResult } from "./useFilterState";

export interface ModuleFilterBarProps {
  schema: FilterSchema;
  /** Optional placeholder for the search input. */
  searchPlaceholder?: string;
  /** Trailing action buttons (e.g. Export, New Customer). */
  actions?: React.ReactNode;
  className?: string;
}

export interface ModuleFilterBarRenderProps extends UseFilterStateResult {
  /** Resolved label of the active view mode (cached for headers). */
  activeViewLabel: string;
}

/** Hook-friendly variant — call inside the screen to share state with `<ModuleFilterBar />` plus the data list. */
export function useModuleFilters(schema: FilterSchema): UseFilterStateResult {
  return useFilterState(schema);
}

export function ModuleFilterBar({
  schema,
  searchPlaceholder = "Search…",
  actions,
  className,
  filters,
}: ModuleFilterBarProps & { filters: UseFilterStateResult }) {
  const { state, setFacet, clearFacet, setSearch, setView, setState } = filters;

  const dateFacet = schema.dateFacetId ? findFacet(schema, schema.dateFacetId) : undefined;
  const pinnedFacets = useMemo(
    () => schema.facets.filter((f) => f.pinned && f.id !== schema.dateFacetId),
    [schema],
  );
  const activeCount = countActiveFacets(schema, state);

  // Track which non-pinned facets the user has explicitly added this session
  // so an empty chip appears immediately when they pick from + Filter.
  const [adhocIds, setAdhocIds] = useState<Set<string>>(new Set());
  const adhocFacets = useMemo(() => {
    const out: FacetSchema[] = [];
    for (const id of adhocIds) {
      const facet = findFacet(schema, id);
      if (!facet) continue;
      if (facet.pinned || facet.id === schema.dateFacetId) continue;
      out.push(facet);
    }
    // Also include any facet that's active but neither pinned nor date.
    for (const f of schema.facets) {
      if (f.pinned || f.id === schema.dateFacetId) continue;
      if (facetHasValue(state.values[f.id]) && !out.find((x) => x.id === f.id)) {
        out.push(f);
      }
    }
    return out;
  }, [schema, state.values, adhocIds]);

  const handlePickFromAddMenu = (facetId: string) => {
    setAdhocIds((prev) => new Set([...prev, facetId]));
  };

  const viewModeOptions: IconViewOption[] = schema.viewModes.map((v) => ({
    key: v.id,
    label: v.label,
    icon: v.icon,
  }));

  const handleLoadPreset = (preset: SavedView) => {
    setAdhocIds(new Set());
    setState({
      ...preset.state,
      presetId: preset.id || undefined,
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Row 1 — primary bar */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="relative w-full sm:w-64 shrink-0">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--neutral-400)]"
            strokeWidth={1.5}
          />
          <Input
            type="search"
            value={state.search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-10 rounded-full border-[var(--neutral-200)] bg-background pl-10 text-sm"
          />
        </div>

        <PresetMenu schema={schema} state={state} onLoad={handleLoadPreset} />

        {dateFacet ? (
          <DateChip
            facet={dateFacet}
            value={state.values[dateFacet.id] as { from?: string; to?: string } | null}
            onChange={(next) => setFacet(dateFacet.id, next)}
            quickRanges={dateFacet.quickRanges as never}
          />
        ) : null}

        {pinnedFacets.map((facet) => (
          <FacetChip
            key={facet.id}
            facet={facet}
            value={state.values[facet.id]}
            onChange={(v) => setFacet(facet.id, v)}
            onClear={() => clearFacet(facet.id)}
          />
        ))}

        <div className="min-w-0 flex-1" />

        <AddFilterMenu
          schema={schema}
          state={state}
          onPick={handlePickFromAddMenu}
          activeCount={activeCount - pinnedFacets.filter((p) => facetHasValue(state.values[p.id])).length - (dateFacet && facetHasValue(state.values[dateFacet.id]) ? 1 : 0)}
        />

        {schema.viewModes.length > 1 ? (
          <IconViewToggle
            options={viewModeOptions}
            value={state.view}
            onChange={(k) => setView(k as typeof state.view)}
            size="sm"
          />
        ) : null}

        {actions}
      </div>

      {/* Row 2 — active non-pinned filters */}
      {adhocFacets.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {adhocFacets.map((facet) => (
            <FacetChip
              key={facet.id}
              facet={facet}
              value={state.values[facet.id]}
              onChange={(v) => setFacet(facet.id, v as FacetValue)}
              onClear={() => {
                setAdhocIds((prev) => { const next = new Set(prev); next.delete(facet.id); return next; });
                clearFacet(facet.id);
              }}
              compact
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
