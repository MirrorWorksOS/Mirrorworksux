/**
 * FilterSchema — schema-driven filter & view configuration for list/board screens.
 *
 * Every list view declares a FilterSchema describing its facets, view modes,
 * and optional persistent date facet. The shared `<ModuleFilterBar>` reads
 * the schema and renders accordingly. See `docs/plans/FILTERS-REDESIGN.md`.
 */

import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Facets                                                             */
/* ------------------------------------------------------------------ */

export type FacetKind =
  | "select"   // single value from options
  | "multi"    // multiple values from options
  | "boolean"  // on/off toggle
  | "range"    // numeric / currency range
  | "user"     // owner / assignee picker (alias of select for now)
  | "tag"      // multi from free-form tags
  | "date";    // single date range; usually surfaced via dateFacetId

export interface FacetOption {
  value: string;
  label: string;
  /** CSS colour token used for chip dot / column accent. */
  color?: string;
  /** Optional precomputed count for the option (rendered in pickers). */
  count?: number;
}

export interface FacetSchema {
  id: string;
  label: string;
  kind: FacetKind;
  /** For select / multi / tag / user — option list. */
  options?: FacetOption[];
  /** Pinned facets render as visible chips next to search. */
  pinned?: boolean;
  /** Persistent facets cannot be removed by "Clear all" (e.g. always-on view scope). */
  persistent?: boolean;
  /** Icon shown on the chip / picker row. */
  icon?: LucideIcon;
  /** Placeholder when no value is set. */
  placeholder?: string;
  /**
   * Date facets: override the quick-range chip set inside the popover.
   * Strings reference `QuickRangeId` from DateChip — kept loose here to avoid
   * a cyclic import. Defaults to `DEFAULT_QUICK_RANGES` when omitted.
   */
  quickRanges?: string[];
}

/* ------------------------------------------------------------------ */
/*  View modes                                                         */
/* ------------------------------------------------------------------ */

export type ViewModeId =
  | "list"
  | "card"
  | "kanban"
  | "calendar"
  | "gantt"
  | "tree"
  | "map"
  | "board";

export interface ViewModeSchema {
  id: ViewModeId;
  label: string;
  icon: LucideIcon;
  /** Facet id that controls columns/swimlanes (for kanban). */
  groupBy?: string;
}

/* ------------------------------------------------------------------ */
/*  Filter schema                                                      */
/* ------------------------------------------------------------------ */

export interface FilterSchema {
  /** Stable id, e.g. "sell.opportunities". Used to scope saved views. */
  module: string;
  /** Human-friendly module label for "Save view" dialog and similar. */
  label?: string;
  facets: FacetSchema[];
  viewModes: ViewModeSchema[];
  defaultView: ViewModeId;
  /** If set, the facet with this id is rendered as a persistent date chip in the bar. */
  dateFacetId?: string;
  /** Optional smart-filter config (NL search + suggested chips). */
  smart?: SmartFilterConfig;
}

export interface SmartFilterConfig {
  enabled: boolean;
  /** Optional pre-seeded suggested chips with a stable id + label. The bar shows them when no preset is loaded. */
  suggestions?: SmartSuggestion[];
}

export interface SmartSuggestion {
  id: string;
  label: string;
  /** Resolved filter values applied when the user taps the chip. */
  apply: FilterState;
  /** Short tooltip explaining what the underlying filter does. */
  detail?: string;
}

/* ------------------------------------------------------------------ */
/*  Filter state — what the user has applied right now                 */
/* ------------------------------------------------------------------ */

export type FacetValue =
  | string
  | string[]
  | boolean
  | { from?: number; to?: number }
  | { from?: string; to?: string } // date range
  | null
  | undefined;

export interface FilterState {
  /** Per-facet values keyed by facet id. */
  values: Record<string, FacetValue>;
  /** Free-text search query. */
  search: string;
  /** Active view mode. */
  view: ViewModeId;
  /** Optional group-by override (defaults to viewMode.groupBy). */
  groupBy?: string;
  /** Loaded preset id, if any. */
  presetId?: string;
}

export function emptyFilterState(schema: FilterSchema): FilterState {
  return {
    values: {},
    search: "",
    view: schema.defaultView,
  };
}

/* ------------------------------------------------------------------ */
/*  Saved views (presets)                                              */
/* ------------------------------------------------------------------ */

export type SavedViewScope = "personal" | "group" | "org" | "system";

export interface SavedView {
  id: string;
  module: string;
  name: string;
  scope: SavedViewScope;
  /** Owner of the preset. For system/org presets this is "system". */
  ownerId: string;
  ownerName?: string;
  /** When scope === "group", the group sharing the preset. */
  groupId?: string;
  groupName?: string;
  state: FilterState;
  /** This user's default for the module. */
  isDefault?: boolean;
  /** Pinned presets show up as a chip strip above the bar. */
  pinned?: boolean;
  /** Lucide icon for system/team presets — keeps the visual language consistent. */
  icon?: LucideIcon;
  /** Tone for the icon background tile (e.g. "yellow", "info", "warning", "error", "neutral"). */
  iconTone?: PresetIconTone;
  /** Optional emoji — only for personal presets where users can pick anything (Notion/Linear-style). */
  emoji?: string;
  /** ISO timestamp. */
  createdAt: string;
  updatedAt: string;
}

export type PresetIconTone = "yellow" | "info" | "success" | "warning" | "error" | "neutral";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

export function findFacet(schema: FilterSchema, id: string): FacetSchema | undefined {
  return schema.facets.find((f) => f.id === id);
}

export function findViewMode(schema: FilterSchema, id: ViewModeId): ViewModeSchema | undefined {
  return schema.viewModes.find((v) => v.id === id);
}

/** Has the user set any value on this facet? */
export function facetHasValue(value: FacetValue): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "boolean") return value;
  if (typeof value === "object") {
    const obj = value as { from?: unknown; to?: unknown };
    return obj.from != null || obj.to != null;
  }
  return false;
}

/** Count active facets (excluding persistent + dateFacetId — those have their own chip). */
export function countActiveFacets(schema: FilterSchema, state: FilterState): number {
  let n = 0;
  for (const facet of schema.facets) {
    if (facet.persistent) continue;
    if (facet.id === schema.dateFacetId) continue;
    if (facetHasValue(state.values[facet.id])) n++;
  }
  return n;
}
