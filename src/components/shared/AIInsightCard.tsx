/**
 * AIInsightCard — Shared component for AI insight banners across all modules.
 *
 * Design spec (Guidelines §9, AI Insight Card):
 *  - White card, border var(--border), rounded-2xl, p-4
 *  - Sparkles icon in MW Yellow (#FFCF4B) next to title — NO yellow background
 *  - Natural language body text in Geist Regular 14px #737373
 *  - "Updated X ago" caption with optional refresh button
 *  - Optional primary action button (ghost style)
 */

import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

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
    <div
      className={cn(
        'bg-white border border-[var(--border)] rounded-2xl p-4',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FFCF4B] flex-shrink-0" />
          <span
            className="text-[13px] font-semibold text-[#1A2732]"
            style={{ letterSpacing: '0.1px' }}
          >
            {title}
          </span>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="p-1 hover:bg-[#F5F5F5] rounded transition-colors disabled:opacity-50 text-[#737373] hover:text-[#1A2732]"
            aria-label="Refresh insight"
          >
            <RefreshCw
              className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')}
            />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="text-[13px] text-[#737373] leading-relaxed">
        {children}
      </div>

      {/* Footer */}
      {(updatedAt || actionLabel) && (
        <div className="flex items-center justify-between mt-3">
          {updatedAt && (
            <span className="text-[11px] text-[#A3A3A3]">
              Updated {updatedAt}
            </span>
          )}
          {actionLabel && onAction && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[12px] text-[#737373] hover:text-[#1A2732] hover:bg-[#F5F5F5]"
              onClick={onAction}
            >
              {actionLabel} →
            </Button>
          )}
        </div>
      )}
    </div>
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
    <div className="bg-[#F5F5F5] border border-[var(--border)] rounded-2xl p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-5 h-5 bg-[#1A2732] rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3 h-3 text-[#FFCF4B]" />
        </div>
        <span className="text-[12px] font-medium text-[#1A2732]">
          Intelligence Hub
        </span>
        {timestamp && (
          <span className="text-[11px] text-[#A3A3A3] ml-auto">
            {timestamp}
          </span>
        )}
      </div>
      <p className="text-[12px] text-[#525252] leading-relaxed pl-7">
        {children}
      </p>
      {actions && <div className="flex gap-2 mt-2 pl-7">{actions}</div>}
    </div>
  );
}
