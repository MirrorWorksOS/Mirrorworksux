/**
 * Document numbering — share a single numeric suffix across the
 * Quote → SO → Invoice → WO → DO → Traveller chain so users can
 * trace one order end-to-end. Each prefix swaps but the suffix stays.
 *
 *   Q-2026-0085 → SO-2026-0085 → INV-2026-0085 → WO-2026-0085
 */

export type DocumentPrefix = 'Q' | 'SO' | 'INV' | 'WO' | 'DO' | 'TR' | 'MO' | 'PO' | 'BILL' | 'GRN';

const NUMBER_RE = /^([A-Z]+)-(\d{4})-(\d{4,})$/;

/**
 * Extract the year-and-suffix portion from any reference.
 * `Q-2026-0085` → `{ prefix: 'Q', year: '2026', suffix: '0085' }`
 */
export function parseRef(ref: string): { prefix: string; year: string; suffix: string } | null {
  const m = NUMBER_RE.exec(ref);
  if (!m) return null;
  return { prefix: m[1], year: m[2], suffix: m[3] };
}

/**
 * Swap the prefix on an existing reference, keeping year and suffix.
 * `share('Q-2026-0085', 'SO')` → `'SO-2026-0085'`.
 *
 * Returns the original ref if it doesn't match the expected pattern,
 * so callers can rely on a string result.
 */
export function share(ref: string, newPrefix: DocumentPrefix): string {
  const parts = parseRef(ref);
  if (!parts) return ref;
  return `${newPrefix}-${parts.year}-${parts.suffix}`;
}

/**
 * Build a new reference from scratch.
 * `make('Q', 2026, 85)` → `'Q-2026-0085'`.
 */
export function make(prefix: DocumentPrefix, year: number, suffix: number): string {
  return `${prefix}-${year}-${String(suffix).padStart(4, '0')}`;
}

/**
 * Return the lineage of a reference across all downstream documents.
 * Useful for header lineage strips.
 */
export function lineage(ref: string, prefixes: DocumentPrefix[]): { prefix: DocumentPrefix; ref: string }[] {
  return prefixes.map((p) => ({ prefix: p, ref: share(ref, p) }));
}
