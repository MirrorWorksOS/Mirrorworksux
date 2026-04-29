/**
 * AIInsightCard — Shared component for AI insight banners across all modules.
 *
 * Design spec (Guidelines §9, AI Insight Card):
 *  - White card, border var(--border), rounded-[var(--shape-lg)], p-4
 *  - Agent logomark next to title — NO yellow background
 *  - Natural language body text in Roboto Regular 14px var(--neutral-500)
 *  - "Updated X ago" caption with optional refresh button
 *  - Optional primary action button (ghost style)
 */

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { AgentLogomark } from '@/components/shared/agent/AgentLogomark';
import { Card } from '@/components/ui/card';
import { cn } from '../../ui/utils';
import { MirrorWorksAgentCard } from './MirrorWorksAgentCard';

interface AIInsightCardProps {
  title?: string;
  children: React.ReactNode;
  updatedAt?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function AIInsightCard({
  title = 'MirrorWorks Agent insight',
  children,
  updatedAt,
  onRefresh,
  refreshing,
  actionLabel,
  onAction,
  className,
}: AIInsightCardProps) {
  const detailContent =
    updatedAt || onRefresh
      ? (
        <div className="flex items-center justify-between gap-3">
          {updatedAt ? (
            <span className="text-xs text-[var(--neutral-400)]">Updated {updatedAt}</span>
          ) : <span />}
          {onRefresh ? (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-[var(--neutral-500)] hover:bg-[var(--neutral-100)] hover:text-foreground"
              aria-label="Refresh insight"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
              Refresh
            </button>
          ) : null}
        </div>
      )
      : undefined;

  return (
    <MirrorWorksAgentCard
      title={title}
      suggestion={<div className="text-xs leading-relaxed text-[var(--neutral-500)]">{children}</div>}
      primaryAction={actionLabel && onAction ? { label: actionLabel, onClick: onAction } : undefined}
      detailContent={detailContent}
      evidenceLevel={detailContent ? 'expandable' : 'hidden'}
      statusText={updatedAt ? `Updated ${updatedAt}` : undefined}
      className={className}
    />
  );
}

/**
 * AIInsightMessage — Inline chat/chatter variant for timeline threads.
 * Replaces yellow bubble in Chatter and Intelligence Hub chat panels.
 */
interface AIInsightMessageProps {
  children: React.ReactNode;
  timestamp?: string;
  actions?: React.ReactNode;
}

export function AIInsightMessage({
  children,
  timestamp,
  actions,
}: AIInsightMessageProps) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-5 h-5 bg-[var(--mw-mirage)] rounded-full flex items-center justify-center flex-shrink-0">
          <AgentLogomark size={18} />
        </div>
        <span className="text-xs font-medium text-foreground">
          MirrorWorks Agent
        </span>
        {timestamp && (
          <span className="text-xs text-[var(--neutral-400)] ml-auto">
            {timestamp}
          </span>
        )}
      </div>
      <p className="text-xs text-[var(--neutral-600)] leading-relaxed pl-7">
        {children}
      </p>
      {actions && <div className="flex gap-2 mt-2 pl-7">{actions}</div>}
    </Card>
  );
}
