/**
 * AIFeed — Scrolling feed of AI insights for a given module.
 *
 * Renders the IntelligenceHub insights in a compact, dashboard-friendly format
 * below the AI command bar. Module-specific insights are pulled from the
 * pre-built insight sets exported by IntelligenceHub.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Info,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { cn } from '../../ui/utils';
import { motion, AnimatePresence } from 'motion/react';
import {
  SELL_INSIGHTS,
  PLAN_INSIGHTS,
  MAKE_INSIGHTS,
  type Insight,
  type InsightType,
} from './IntelligenceHub';

export type AIFeedModule = 'sell' | 'plan' | 'make' | 'buy' | 'book' | 'ship' | 'control';

const MODULE_INSIGHTS: Partial<Record<AIFeedModule, Insight[]>> = {
  sell: SELL_INSIGHTS,
  plan: PLAN_INSIGHTS,
  make: MAKE_INSIGHTS,
};

const FALLBACK_INSIGHTS: Insight[] = [
  {
    id: 'fb-1',
    type: 'info',
    title: 'Intelligence Hub active',
    body: 'AI is monitoring this module. Insights will appear here as patterns are detected.',
    updatedAt: 'just now',
  },
];

const TYPE_ICON: Record<InsightType, React.ElementType> = {
  opportunity: TrendingUp,
  risk: AlertTriangle,
  info: Info,
  action: ChevronRight,
  trend: TrendingUp,
};

const TYPE_STYLE: Record<InsightType, { bg: string; text: string }> = {
  opportunity: { bg: 'bg-[var(--mw-mirage)]/10 dark:bg-[var(--mw-mirage)]/20', text: 'text-foreground' },
  risk: { bg: 'bg-[var(--mw-error)]/10', text: 'text-[var(--mw-error)]' },
  info: { bg: 'bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)]', text: 'text-[var(--neutral-500)]' },
  action: { bg: 'bg-[var(--mw-yellow-50)] dark:bg-[var(--mw-yellow-400)]/10', text: 'text-foreground' },
  trend: { bg: 'bg-[var(--mw-yellow-50)] dark:bg-[var(--mw-yellow-400)]/10', text: 'text-foreground' },
};

interface AIFeedProps {
  module: AIFeedModule;
  /** Maximum insights to show (default: 3) */
  limit?: number;
  className?: string;
}

export function AIFeed({ module, limit = 3, className }: AIFeedProps) {
  const allInsights = MODULE_INSIGHTS[module] ?? FALLBACK_INSIGHTS;
  const insights = allInsights.slice(0, limit);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--mw-mirage)] dark:bg-[var(--mw-yellow-400)]/20">
            <Sparkles className="h-3.5 w-3.5 text-[var(--mw-yellow-400)]" />
          </div>
          <span className="text-sm font-medium text-foreground">AI Insights</span>
          <span className="text-xs text-[var(--neutral-500)]">
            {insights.length} active
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-8 gap-1.5 text-xs text-[var(--neutral-500)] hover:text-foreground"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Feed cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {insights.map((insight, i) => {
            const Icon = TYPE_ICON[insight.type];
            const style = TYPE_STYLE[insight.type];

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.06, duration: 0.25, ease: [0.2, 0, 0, 1] }}
              >
                <Card
                  className={cn(
                    'border border-[var(--border)] bg-card rounded-[var(--shape-lg)] p-4',
                    'hover:shadow-sm transition-shadow duration-[var(--duration-medium1)]',
                    insight.type === 'risk' && 'border-[var(--mw-error)]/20',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                        style.bg,
                      )}
                    >
                      <Icon className={cn('h-4 w-4', style.text)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground truncate">
                          {insight.title}
                        </span>
                        {insight.confidence !== undefined && (
                          <span className="shrink-0 rounded-full bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] px-1.5 py-0.5 text-[10px] text-[var(--neutral-500)]">
                            {insight.confidence}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed text-[var(--neutral-500)] line-clamp-2">
                        {insight.body}
                      </p>
                      {insight.action && (
                        <button className="mt-1.5 text-xs font-medium text-foreground hover:underline">
                          {insight.action} &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-right text-[10px] text-[var(--neutral-400)]">
                    {insight.updatedAt}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
