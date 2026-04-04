/**
 * AIFeed — Shared AI Insight Feed component for all module dashboards.
 *
 * Displays a vertical feed of personalised AI insight cards below the AI search bar.
 * Collapsible: shows 3 by default, "Show more" to expand.
 *
 * Usage:
 *   <AIFeed module="sell" />
 */

import React, { useState, useCallback } from 'react';
import { Sparkles, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';
import { AIFeedCard } from './AIFeedCard';
import { getInsightsForModule } from './ai-feed-mock-data';
import type { AIFeedModule } from './ai-feed-types';

const DEFAULT_VISIBLE = 3;

interface AIFeedProps {
  module: AIFeedModule;
  className?: string;
}

export function AIFeed({ module, className }: AIFeedProps) {
  const [insights, setInsights] = useState(() => getInsightsForModule(module));
  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const visibleInsights = expanded ? insights : insights.slice(0, DEFAULT_VISIBLE);
  const hasMore = insights.length > DEFAULT_VISIBLE;
  const hiddenCount = insights.length - DEFAULT_VISIBLE;

  const handleDismiss = useCallback((id: string) => {
    setInsights((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise((r) => setTimeout(r, 1000));
    setInsights(getInsightsForModule(module));
    setRefreshing(false);
  }, [module]);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" strokeWidth={1.5} />
          <span className="text-sm font-medium text-foreground">AI Insights</span>
          <Badge
            variant="secondary"
            className="border-0 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[10px] px-1.5 py-0"
          >
            {insights.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-8 gap-1 text-xs text-[var(--neutral-500)] hover:text-foreground"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Feed */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {visibleInsights.map((insight, i) => (
            <AIFeedCard
              key={insight.id}
              insight={insight}
              onDismiss={handleDismiss}
              index={i}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Show more / less toggle */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="w-full h-8 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 gap-1"
          >
            {expanded ? (
              <>
                Show less
                <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Show {hiddenCount} more
                <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
