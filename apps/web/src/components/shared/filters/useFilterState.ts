/**
 * useFilterState — owns the FilterState for a list/board screen.
 *
 * Reads initial state from URL search params (so views are linkable),
 * writes changes back to the URL, and exposes setters + helpers.
 */

import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

import {
  type FacetValue,
  type FilterSchema,
  type FilterState,
  type ViewModeId,
  emptyFilterState,
} from "./schema";
import { stateFromSearchParams, stateToSearchParams } from "./urlState";

export interface UseFilterStateResult {
  state: FilterState;
  /** Replace the entire state — used when loading a preset. */
  setState: (next: FilterState) => void;
  setFacet: (facetId: string, value: FacetValue) => void;
  clearFacet: (facetId: string) => void;
  clearAll: () => void;
  setSearch: (q: string) => void;
  setView: (view: ViewModeId) => void;
  setPresetId: (id: string | undefined) => void;
  setGroupBy: (id: string | undefined) => void;
}

export function useFilterState(schema: FilterSchema): UseFilterStateResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useMemo(
    () => stateFromSearchParams(schema, searchParams),
    [schema, searchParams],
  );

  const apply = useCallback(
    (next: FilterState) => {
      setSearchParams(
        (prev) => stateToSearchParams(schema, next, prev),
        { replace: true },
      );
    },
    [schema, setSearchParams],
  );

  return {
    state,
    setState: apply,
    setFacet: (id, value) => {
      const next: FilterState = {
        ...state,
        values: { ...state.values, [id]: value },
        // Clearing a facet diverges from preset; keep presetId for "saved but modified" UX.
      };
      apply(next);
    },
    clearFacet: (id) => {
      const { [id]: _drop, ...rest } = state.values;
      void _drop;
      apply({ ...state, values: rest });
    },
    clearAll: () => {
      // Preserve persistent facets.
      const keep: Record<string, FacetValue> = {};
      for (const f of schema.facets) {
        if (f.persistent && state.values[f.id] != null) {
          keep[f.id] = state.values[f.id];
        }
      }
      apply({ ...emptyFilterState(schema), values: keep });
    },
    setSearch: (q) => apply({ ...state, search: q }),
    setView: (view) => apply({ ...state, view }),
    setPresetId: (id) => apply({ ...state, presetId: id }),
    setGroupBy: (id) => apply({ ...state, groupBy: id }),
  };
}
