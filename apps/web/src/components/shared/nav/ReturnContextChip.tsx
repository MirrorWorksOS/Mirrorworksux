/**
 * ReturnContextChip — a small "← Back to X" pill rendered when the current
 * page was reached via a cross-module deep-link.
 *
 * Pattern:
 *   1. Source page: navigate with `?from=<path>&fromLabel=<friendly name>`.
 *      Use `withReturnContext(path, label)` to build the search string.
 *   2. Destination page: drop <ReturnContextChip /> anywhere near the top.
 *      It renders nothing when no return context is in the URL.
 *
 * Why URL-based rather than session state: it survives refresh, is shareable,
 * and needs zero global wiring. Every page that wants a back affordance just
 * drops the component in.
 */

import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';

interface ReturnContextChipProps {
  className?: string;
}

export function ReturnContextChip({ className }: ReturnContextChipProps) {
  const [search] = useSearchParams();
  const navigate = useNavigate();

  const from = search.get('from');
  if (!from) return null;

  const label = search.get('fromLabel') ?? 'previous page';

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => navigate(from)}
      className={cn(
        'h-7 gap-1.5 rounded-full bg-[var(--neutral-100)] px-3 text-xs text-[var(--neutral-600)] hover:bg-[var(--neutral-200)] dark:bg-neutral-800 dark:text-neutral-300',
        className,
      )}
    >
      <ArrowLeft className="h-3 w-3" strokeWidth={2} />
      Back to <span className="font-medium text-foreground">{label}</span>
    </Button>
  );
}

/**
 * Build a `?from=…&fromLabel=…` (or `&from=…` if other params are passed
 * as a prefix) suffix that downstream pages can decode with ReturnContextChip.
 *
 * @example
 *   navigate(`/plan/settings?panel=templates${withReturnContext('/plan/products/prod-001', 'BKT-001', '&')}`)
 */
export function withReturnContext(
  path: string,
  label: string,
  sep: '?' | '&' = '&',
): string {
  return `${sep}from=${encodeURIComponent(path)}&fromLabel=${encodeURIComponent(label)}`;
}
