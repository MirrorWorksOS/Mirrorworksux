/**
 * QuoteViewActivity — Shows when customers have viewed/opened a quote.
 * Displays view events with relative timestamps and AI insight for engagement.
 */

import { Eye, Monitor, Smartphone, Mail, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AIInsightCard } from '@/components/shared/ai/AIInsightCard';
import type { QuoteViewEvent } from '@/types/entities';

interface QuoteViewActivityProps {
  viewEvents?: QuoteViewEvent[];
  quoteRef?: string;
}

function formatRelativeTime(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const min = Math.floor(seconds / 60);
  return `${min} min`;
}

export function QuoteViewActivity({ viewEvents, quoteRef }: QuoteViewActivityProps) {
  if (!viewEvents || viewEvents.length === 0) return null;

  const sorted = [...viewEvents].sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime());

  // Check if there were multiple views in last 24 hours
  const now = new Date();
  const recentViews = sorted.filter(v => (now.getTime() - new Date(v.viewedAt).getTime()) < 24 * 60 * 60 * 1000);
  const showInsight = recentViews.length >= 2;

  const totalDuration = sorted.reduce((sum, v) => sum + (v.duration ?? 0), 0);

  return (
    <div className="space-y-3">
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Customer Activity</h3>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-[var(--neutral-500)]">
            {sorted.length} view{sorted.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="space-y-3">
          {sorted.map(event => {
            const DeviceIcon = event.deviceType === 'mobile' ? Smartphone : Monitor;
            const SourceIcon = event.source === 'email_link' ? Mail : Globe;

            return (
              <div key={event.id} className="flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--mw-blue-light,var(--neutral-100))]">
                  <Eye className="h-3.5 w-3.5 text-[var(--mw-blue,var(--neutral-600))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{event.viewedBy}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1 text-[10px] text-[var(--neutral-500)]">
                      <SourceIcon className="w-2.5 h-2.5" />
                      <span>{event.source === 'email_link' ? 'via email' : 'via portal'}</span>
                    </div>
                    {event.duration && (
                      <span className="text-[10px] text-[var(--neutral-500)]">
                        ({formatDuration(event.duration)})
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-[10px] text-[var(--neutral-500)]">
                      <DeviceIcon className="w-2.5 h-2.5" />
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-[var(--neutral-400)] shrink-0 tabular-nums">
                  {formatRelativeTime(event.viewedAt)}
                </span>
              </div>
            );
          })}
        </div>

        {totalDuration > 0 && (
          <div className="pt-3 border-t border-[var(--border)] text-xs text-[var(--neutral-500)]">
            Total viewing time: {formatDuration(totalDuration)}
          </div>
        )}
      </Card>

      {showInsight && (
        <AIInsightCard title="Engagement signal">
          {quoteRef ?? 'This quote'} was opened {recentViews.length} times in the last 24 hours by {recentViews[0].viewedBy}.
          {totalDuration >= 120 && ` They spent ${formatDuration(totalDuration)} reviewing.`}
          {' '}Good time to follow up with a call.
        </AIInsightCard>
      )}
    </div>
  );
}

/** Compact view badge for use in quote list rows */
export function QuoteViewBadge({ viewEvents }: { viewEvents?: QuoteViewEvent[] }) {
  if (!viewEvents || viewEvents.length === 0) return null;

  const latest = viewEvents.reduce((a, b) => new Date(a.viewedAt) > new Date(b.viewedAt) ? a : b);

  return (
    <div className="flex items-center gap-1 text-[10px] text-[var(--neutral-500)]" title={`Viewed by ${latest.viewedBy} ${formatRelativeTime(latest.viewedAt)}`}>
      <Eye className="w-3 h-3" />
      <span className="tabular-nums">{viewEvents.length}</span>
    </div>
  );
}
