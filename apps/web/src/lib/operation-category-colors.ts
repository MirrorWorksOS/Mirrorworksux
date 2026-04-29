/**
 * Colour tokens for the 7 operation categories used in Control → Operations
 * and the Plan BOM-routing tree's "Add op" picker.
 */

export interface CategoryColors {
  bg: string;
  border: string;
  text: string;
  dot: string;
}

export const OPERATION_CATEGORY_COLORS: Record<string, CategoryColors> = {
  Planning: {
    bg: 'bg-[color-mix(in_srgb,var(--mw-blue-400)_12%,transparent)]',
    border: 'border-[color-mix(in_srgb,var(--mw-blue-400)_40%,transparent)]',
    text: 'text-[var(--mw-blue-700)]',
    dot: 'bg-[var(--mw-blue-400)]',
  },
  Cutting: {
    bg: 'bg-[color-mix(in_srgb,var(--mw-yellow-400)_12%,transparent)]',
    border: 'border-[color-mix(in_srgb,var(--mw-yellow-400)_40%,transparent)]',
    text: 'text-[var(--mw-yellow-900)]',
    dot: 'bg-[var(--mw-yellow-400)]',
  },
  Forming: {
    bg: 'bg-[color-mix(in_srgb,var(--mw-amber-400)_12%,transparent)]',
    border: 'border-[color-mix(in_srgb,var(--mw-amber-400)_40%,transparent)]',
    text: 'text-[var(--mw-amber-700)]',
    dot: 'bg-[var(--mw-amber-400)]',
  },
  Machining: {
    bg: 'bg-[color-mix(in_srgb,var(--mw-info)_12%,transparent)]',
    border: 'border-[color-mix(in_srgb,var(--mw-info)_40%,transparent)]',
    text: 'text-[var(--mw-info)]',
    dot: 'bg-[var(--mw-info)]',
  },
  Joining: {
    bg: 'bg-[color-mix(in_srgb,var(--mw-mirage)_10%,transparent)]',
    border: 'border-[color-mix(in_srgb,var(--mw-mirage)_30%,transparent)]',
    text: 'text-[var(--mw-mirage)]',
    dot: 'bg-[var(--mw-mirage)]',
  },
  Finishing: {
    bg: 'bg-[color-mix(in_srgb,var(--mw-success)_12%,transparent)]',
    border: 'border-[color-mix(in_srgb,var(--mw-success)_40%,transparent)]',
    text: 'text-[var(--mw-success)]',
    dot: 'bg-[var(--mw-success)]',
  },
  Quality: {
    bg: 'bg-[var(--neutral-100)]',
    border: 'border-[var(--neutral-300)]',
    text: 'text-[var(--neutral-700)]',
    dot: 'bg-[var(--neutral-500)]',
  },
};

export function getCategoryColors(category: string): CategoryColors {
  return (
    OPERATION_CATEGORY_COLORS[category] ?? {
      bg: 'bg-[var(--neutral-100)]',
      border: 'border-[var(--neutral-300)]',
      text: 'text-[var(--neutral-700)]',
      dot: 'bg-[var(--neutral-500)]',
    }
  );
}
