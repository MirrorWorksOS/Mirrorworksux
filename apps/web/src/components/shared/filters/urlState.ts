/**
 * URL-state encoding/decoding for FilterState.
 *
 * Strategy: serialise each facet into one search-param keyed by facet id.
 *   - select / user → `?status=open`
 *   - multi / tag → `?stage=proposal,negotiation`
 *   - boolean → `?atRisk=1`
 *   - range (numeric) → `?value=25000-100000` (either end may be empty)
 *   - date → `?dueDate=2026-05-01_2026-05-31` (either end may be empty)
 *   - search → `?q=...`
 *   - view  → `?view=kanban`
 *   - preset → `?preset=<id>`
 *
 * Unknown params are preserved (route may use them for other state).
 */

import {
  type FacetSchema,
  type FacetValue,
  type FilterSchema,
  type FilterState,
  type ViewModeId,
  emptyFilterState,
} from "./schema";

const DATE_RANGE_SEP = "_";
const NUM_RANGE_SEP = "-";
const MULTI_SEP = ",";

function encodeFacet(facet: FacetSchema, value: FacetValue): string | null {
  if (value == null) return null;
  switch (facet.kind) {
    case "select":
    case "user":
      return typeof value === "string" && value.length > 0 ? value : null;
    case "multi":
    case "tag":
      return Array.isArray(value) && value.length > 0 ? value.join(MULTI_SEP) : null;
    case "boolean":
      return value === true ? "1" : null;
    case "range": {
      const v = value as { from?: number; to?: number };
      if (v.from == null && v.to == null) return null;
      return `${v.from ?? ""}${NUM_RANGE_SEP}${v.to ?? ""}`;
    }
    case "date": {
      const v = value as { from?: string; to?: string };
      if (!v.from && !v.to) return null;
      return `${v.from ?? ""}${DATE_RANGE_SEP}${v.to ?? ""}`;
    }
    default:
      return null;
  }
}

function decodeFacet(facet: FacetSchema, raw: string): FacetValue {
  if (raw === "") return null;
  switch (facet.kind) {
    case "select":
    case "user":
      return raw;
    case "multi":
    case "tag":
      return raw.split(MULTI_SEP).filter(Boolean);
    case "boolean":
      return raw === "1" || raw === "true";
    case "range": {
      const [from, to] = raw.split(NUM_RANGE_SEP);
      const out: { from?: number; to?: number } = {};
      if (from) out.from = Number(from);
      if (to) out.to = Number(to);
      return out;
    }
    case "date": {
      const [from, to] = raw.split(DATE_RANGE_SEP);
      const out: { from?: string; to?: string } = {};
      if (from) out.from = from;
      if (to) out.to = to;
      return out;
    }
    default:
      return null;
  }
}

/** Serialise state → URLSearchParams (mutates a copy of `base`, preserving unknown keys). */
export function stateToSearchParams(
  schema: FilterSchema,
  state: FilterState,
  base?: URLSearchParams,
): URLSearchParams {
  const sp = new URLSearchParams(base ?? "");
  // Clear any facets we own first.
  for (const facet of schema.facets) sp.delete(facet.id);
  sp.delete("q");
  sp.delete("view");
  sp.delete("preset");
  sp.delete("groupBy");

  for (const facet of schema.facets) {
    const enc = encodeFacet(facet, state.values[facet.id]);
    if (enc != null) sp.set(facet.id, enc);
  }
  if (state.search) sp.set("q", state.search);
  if (state.view !== schema.defaultView) sp.set("view", state.view);
  if (state.presetId) sp.set("preset", state.presetId);
  if (state.groupBy) sp.set("groupBy", state.groupBy);
  return sp;
}

/** Hydrate state from URL search params, falling back to schema defaults. */
export function stateFromSearchParams(
  schema: FilterSchema,
  sp: URLSearchParams,
): FilterState {
  const state = emptyFilterState(schema);
  for (const facet of schema.facets) {
    const raw = sp.get(facet.id);
    if (raw != null) {
      const decoded = decodeFacet(facet, raw);
      if (decoded != null) state.values[facet.id] = decoded;
    }
  }
  const q = sp.get("q");
  if (q) state.search = q;
  const view = sp.get("view");
  if (view) state.view = view as ViewModeId;
  const preset = sp.get("preset");
  if (preset) state.presetId = preset;
  const groupBy = sp.get("groupBy");
  if (groupBy) state.groupBy = groupBy;
  return state;
}
