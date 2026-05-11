/**
 * applyFilters — generic helper that filters a row array against a FilterState.
 *
 * Screen passes a `getFacetValue` extractor that maps `(row, facetId) → value`
 * (string | number | string[] | Date). The helper handles search, multi/select
 * inclusion, boolean, numeric range, date range.
 */

import { type FacetValue, type FilterSchema, type FilterState } from "./schema";

export type RowFacetExtractor<T> = (row: T, facetId: string) => unknown;
export type RowSearchExtractor<T> = (row: T) => string;

export interface ApplyFiltersOptions<T> {
  schema: FilterSchema;
  state: FilterState;
  rows: T[];
  /** Returns a row's value for a given facet id. */
  getFacetValue: RowFacetExtractor<T>;
  /** Returns the full searchable string for a row. */
  getSearchText: RowSearchExtractor<T>;
}

export function applyFilters<T>(opts: ApplyFiltersOptions<T>): T[] {
  const { schema, state, rows, getFacetValue, getSearchText } = opts;
  const search = state.search.trim().toLowerCase();

  return rows.filter((row) => {
    // Search
    if (search) {
      const haystack = getSearchText(row).toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    // Facets
    for (const facet of schema.facets) {
      const value = state.values[facet.id];
      if (!facetHasValue(value)) continue;
      const rowValue = getFacetValue(row, facet.id);

      switch (facet.kind) {
        case "select":
        case "user": {
          if (rowValue !== value) return false;
          break;
        }
        case "multi":
        case "tag": {
          const wanted = value as string[];
          if (Array.isArray(rowValue)) {
            // Row has multiple values (e.g. tags) → keep if intersection non-empty.
            const rowArr = rowValue as string[];
            if (!wanted.some((w) => rowArr.includes(w))) return false;
          } else {
            if (!wanted.includes(String(rowValue))) return false;
          }
          break;
        }
        case "boolean": {
          if (Boolean(rowValue) !== Boolean(value)) return false;
          break;
        }
        case "range": {
          const v = value as { from?: number; to?: number };
          const n = Number(rowValue);
          if (Number.isNaN(n)) return false;
          if (v.from != null && n < v.from) return false;
          if (v.to != null && n > v.to) return false;
          break;
        }
        case "date": {
          const v = value as { from?: string; to?: string };
          const raw = rowValue == null ? null : String(rowValue);
          if (!raw) return false;
          // ISO-date string comparison works lexically when both YYYY-MM-DD.
          const iso = raw.length >= 10 ? raw.slice(0, 10) : raw;
          if (v.from && iso < v.from) return false;
          if (v.to && iso > v.to) return false;
          break;
        }
      }
    }
    return true;
  });
}

function facetHasValue(value: FacetValue): boolean {
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
