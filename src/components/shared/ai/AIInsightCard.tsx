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
import { Button } from '../../ui/button';
import { cn } from '../../ui/utils';
import { BorderGlow } from '../surfaces/BorderGlow';
import { SpotlightCard } from '@/components/shared/surfaces/SpotlightCard';

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
  title = 'AI insight',
  children,
  updatedAt,
  onRefresh,
  refreshing,
  actionLabel,
  onAction,
  className,
}: AIInsightCardProps) {
  return (
    <SpotlightCard
      radius="rounded-[var(--shape-lg)]"
      overflow="visible"
      className={cn("min-h-0", className)}
      spotlightColor="rgba(77, 221, 201, 0.07)"
      spotlightColorDark="rgba(125, 232, 217, 0.1)"
    >
    <BorderGlow
      borderRadius={16}
      edgeSensitivity={10}
      glowRadius={22}
      glowIntensity={0.23}
      coneSpread={30}
      fillOpacity={0.158}
      perimeter="uniform"
      animated
      className="bg-card"
    >
    <div className="p-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <AgentLogomark size={16} className="flex-shrink-0" />
          <span
            className="text-xs font-medium text-foreground"
            style={{ letterSpacing: '0.1px' }}
          >
            {title}
          </span>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="p-1 hover:bg-[var(--neutral-100)] rounded transition-colors disabled:bg-[var(--neutral-900)]/[0.12] disabled:text-foreground/[0.38] text-[var(--neutral-500)] hover:text-foreground"
            aria-label="Refresh insight"
          >
            <RefreshCw
              className={cn('w-4 h-4', refreshing && 'animate-spin')}
            />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="text-xs text-[var(--neutral-500)] leading-relaxed">
        {children}
      </div>

      {/* Footer */}
      {(updatedAt || actionLabel) && (
        <div className="flex items-center justify-between mt-3">
          {updatedAt && (
            <span className="text-xs text-[var(--neutral-400)]">
              Updated {updatedAt}
            </span>
          )}
          {actionLabel && onAction && (
            <Button
              variant="ghost"
              size="sm"
              className="h-12 px-2 text-xs text-[var(--neutral-500)] hover:text-foreground hover:bg-[var(--neutral-100)]"
              onClick={onAction}
            >
              {actionLabel} →
            </Button>
          )}
        </div>
      )}
    </div>
    </BorderGlow>
    </SpotlightCard>
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
    <div className="bg-[var(--neutral-100)] border border-[var(--border)] rounded-[var(--shape-lg)] p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-5 h-5 bg-[var(--mw-mirage)] rounded-full flex items-center justify-center flex-shrink-0">
          <AgentLogomark size={18} />
        </div>
        <span className="text-xs font-medium text-foreground">
          Intelligence Hub
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
    </div>
  );
}
