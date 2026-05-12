/**
 * HistoryPanel — vertical event timeline for record changes (quote
 * status, order edits, customer field changes, etc.). Each entry has
 * a date, action, user, and optional from/to value pair.
 */

import * as React from 'react';
import { History, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/utils';

export interface HistoryEntry {
  id: string;
  /** ISO datetime. */
  at: string;
  /** Short, past-tense action — e.g. "Sent to customer", "Edited line items". */
  action: string;
  /** Who did it. */
  user: string;
  /** Optional before value (renders strikethrough). */
  fromValue?: React.ReactNode;
  /** Optional after value (renders normal). */
  toValue?: React.ReactNode;
  /** Optional note appended below the action. */
  note?: string;
  /** Optional tone for the dot marker. */
  tone?: 'neutral' | 'success' | 'warning' | 'error' | 'accent';
}

const TONE_DOT: Record<NonNullable<HistoryEntry['tone']>, string> = {
  neutral: 'bg-[var(--neutral-400)]',
  success: 'bg-[var(--mw-success)]',
  warning: 'bg-[var(--mw-amber)]',
  error: 'bg-[var(--mw-error)]',
  accent: 'bg-[var(--mw-yellow-500)]',
};

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export interface HistoryPanelProps {
  entries: HistoryEntry[];
  /** Card heading — defaults to "History". */
  title?: string;
  /** Empty state copy. */
  emptyLabel?: string;
  /** When true, wraps in a Card. Set false to inline. */
  wrapInCard?: boolean;
  className?: string;
  /** Max entries to show before scrolling. */
  maxHeight?: number;
}

export function HistoryPanel({
  entries,
  title = 'History',
  emptyLabel = 'No history yet.',
  wrapInCard = true,
  className,
  maxHeight = 320,
}: HistoryPanelProps) {
  const sorted = React.useMemo(
    () => [...entries].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()),
    [entries],
  );

  const body =
    sorted.length === 0 ? (
      <div className="py-8 text-center text-sm text-[var(--neutral-500)]">{emptyLabel}</div>
    ) : (
      <ol className="relative space-y-4 pl-5" style={{ maxHeight, overflowY: 'auto' }}>
        <span
          aria-hidden
          className="absolute left-[7px] top-1.5 bottom-1.5 w-px bg-[var(--neutral-200)]"
        />
        {sorted.map((e) => (
          <li key={e.id} className="relative">
            <span
              aria-hidden
              className={cn(
                'absolute left-[-17px] top-1.5 h-3 w-3 rounded-full border-2 border-[var(--background)]',
                TONE_DOT[e.tone ?? 'neutral'],
              )}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <p className="text-sm font-medium text-foreground">{e.action}</p>
                <span className="text-xs text-[var(--neutral-500)] tabular-nums">
                  {fmtDateTime(e.at)}
                </span>
              </div>
              <p className="text-xs text-[var(--neutral-500)]">{e.user}</p>
              {(e.fromValue !== undefined || e.toValue !== undefined) && (
                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                  {e.fromValue !== undefined && (
                    <span className="text-[var(--neutral-500)] line-through">{e.fromValue}</span>
                  )}
                  {e.fromValue !== undefined && e.toValue !== undefined && (
                    <ChevronRight className="h-3 w-3 text-[var(--neutral-400)]" />
                  )}
                  {e.toValue !== undefined && (
                    <span className="font-medium text-foreground">{e.toValue}</span>
                  )}
                </p>
              )}
              {e.note && (
                <p className="mt-1 text-xs text-[var(--neutral-600)]">{e.note}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    );

  if (!wrapInCard) {
    return (
      <div className={className}>
        {title && (
          <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
            <History className="h-4 w-4 text-[var(--neutral-500)]" />
            {title}
          </h3>
        )}
        {body}
      </div>
    );
  }

  return (
    <Card className={cn('p-6', className)}>
      {title && (
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
          <History className="h-4 w-4 text-[var(--neutral-500)]" />
          {title}
        </h3>
      )}
      {body}
    </Card>
  );
}
