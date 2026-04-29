/**
 * Operation category palette — shared by Control → Routes route chips and
 * Plan → Job BomRoutingTree op chips so a "Cutting" op looks the same in
 * both places.
 *
 * Categories come from `operationsLibraryService.ts`:
 *   Planning · Cutting · Forming · Machining · Joining · Finishing · Quality
 *
 * Status overrides (in_progress, done) win over category in BomRoutingTree —
 * see `OpChip` in `apps/web/src/components/plan/BomRoutingTree.tsx`.
 */

export interface OperationCategoryColor {
  /** Tailwind class for the chip background. */
  bg: string;
  /** Tailwind class for the chip border. */
  border: string;
  /** Tailwind class for the operation name text. */
  text: string;
  /** Tailwind class for a small status dot or sequence chip background. */
  dot: string;
}

/** Catch-all for operations whose category is missing or unrecognised. */
export const OPERATION_CATEGORY_FALLBACK: OperationCategoryColor = {
  bg: 'bg-[var(--neutral-50)]',
  border: 'border-[var(--border)]',
  text: 'text-foreground',
  dot: 'bg-[var(--mw-mirage)]',
};

export const OPERATION_CATEGORY_COLORS: Record<string, OperationCategoryColor> = {
  Planning: {
    bg: 'bg-[var(--mw-blue-50)]',
    border: 'border-[var(--mw-blue-100)]',
    text: 'text-[var(--mw-blue)]',
    dot: 'bg-[var(--mw-blue)]',
  },
  Cutting: {
    bg: 'bg-[var(--mw-yellow-50)]',
    border: 'border-[var(--mw-yellow-200)]',
    text: 'text-[var(--mw-yellow-900)]',
    dot: 'bg-[var(--mw-yellow-500)]',
  },
  Forming: {
    bg: 'bg-[var(--mw-amber-50)]',
    border: 'border-[var(--mw-amber-100)]',
    text: 'text-[var(--mw-amber)]',
    dot: 'bg-[var(--mw-amber)]',
  },
  Machining: {
    bg: 'bg-[color-mix(in_srgb,var(--mw-mirage)_8%,transparent)]',
    border: 'border-[color-mix(in_srgb,var(--mw-mirage)_20%,transparent)]',
    text: 'text-[var(--mw-mirage)]',
    dot: 'bg-[var(--mw-mirage)]',
  },
  Joining: {
    bg: 'bg-[var(--mw-info-light)]',
    border: 'border-[color-mix(in_srgb,var(--mw-info)_25%,transparent)]',
    text: 'text-[var(--mw-info)]',
    dot: 'bg-[var(--mw-info)]',
  },
  Finishing: {
    bg: 'bg-[var(--neutral-100)]',
    border: 'border-[var(--neutral-200)]',
    text: 'text-foreground',
    dot: 'bg-[var(--neutral-500)]',
  },
  Quality: {
    bg: 'bg-[var(--mw-green-50)]',
    border: 'border-[var(--mw-green-100)]',
    text: 'text-[var(--mw-success)]',
    dot: 'bg-[var(--mw-success)]',
  },
};

/** Resolve a category label to its colour palette, falling back to neutral. */
export function operationCategoryColor(
  category: string | null | undefined,
): OperationCategoryColor {
  if (!category) return OPERATION_CATEGORY_FALLBACK;
  return OPERATION_CATEGORY_COLORS[category] ?? OPERATION_CATEGORY_FALLBACK;
}
