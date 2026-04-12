/**
 * PortalRevisionTracker — Vertical timeline showing quote revision history.
 */

import { Check, Circle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';
import type { QuoteRevision } from '@/types/entities';

interface PortalRevisionTrackerProps {
  revisions?: QuoteRevision[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function PortalRevisionTracker({ revisions = [] }: PortalRevisionTrackerProps) {
  if (revisions.length === 0) return null;

  const sorted = [...revisions].sort((a, b) => b.version - a.version);
  const latest = sorted[0];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Revision History</h4>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-[var(--neutral-500)]">
          v{latest.version}
        </Badge>
      </div>

      <div className="relative">
        {sorted.map((rev, i) => {
          const isCurrent = i === 0;
          const isLast = i === sorted.length - 1;

          return (
            <div key={rev.version} className="relative flex gap-3 pb-4 last:pb-0">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-[11px] top-6 bottom-0 w-px bg-[var(--border)]" />
              )}

              {/* Dot */}
              <div className="shrink-0 mt-0.5">
                {isCurrent ? (
                  <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[var(--mw-yellow-400)]">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-[var(--border)] bg-card">
                    <Circle className="w-2 h-2 text-[var(--neutral-400)]" fill="currentColor" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-medium', isCurrent ? 'text-foreground' : 'text-[var(--neutral-500)]')}>
                    Version {rev.version}
                  </span>
                  {isCurrent && (
                    <Badge className="bg-[var(--mw-yellow-50)] text-[var(--mw-yellow-600)] border-0 text-[9px] px-1 py-0">
                      Current
                    </Badge>
                  )}
                  <span className="text-[10px] text-[var(--neutral-400)]">{formatDate(rev.date)}</span>
                </div>
                <ul className="mt-1 space-y-0.5">
                  {rev.changes.map((change, ci) => (
                    <li key={ci} className="text-xs text-[var(--neutral-600)] flex items-start gap-1.5">
                      <span className="text-[var(--neutral-400)] mt-1 shrink-0">•</span>
                      {change}
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-[var(--neutral-400)] mt-1 tabular-nums">
                  Total: ${rev.totalValue.toLocaleString()}
                  {rev.changedBy === 'customer_request' && ' — Customer requested'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
