/**
 * AIFeed -- Streaming AI insight feed for module dashboards.
 *
 * Renders a vertical list of AI insight cards scoped to a specific module.
 * Designed to sit below the AI command bar in overview tabs.
 */

import React, { useState } from 'react';
import { Sparkles, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';
import { motion, AnimatePresence } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';

type AiModule = 'plan' | 'sell' | 'make' | 'ship' | 'book' | 'control';

interface AIFeedItem {
  id: string;
  title: string;
  body: string;
  category: string;
  timestamp: string;
  confidence?: number;
}

const FEED_DATA: Record<AiModule, AIFeedItem[]> = {
  plan: [
    {
      id: 'plan-1',
      title: 'Schedule conflict detected',
      body: 'CNC-01 is double-booked on Apr 8. Moving MW-010 to the PM shift resolves the overlap with zero impact on delivery dates.',
      category: 'Scheduling',
      timestamp: '12 min ago',
      confidence: 88,
    },
    {
      id: 'plan-2',
      title: 'Material lead time risk',
      body: '304 stainless sheet stock is 3 days behind supplier ETA. Consider activating secondary supplier to avoid downstream delays on 2 active jobs.',
      category: 'Procurement',
      timestamp: '45 min ago',
      confidence: 79,
    },
    {
      id: 'plan-3',
      title: 'Capacity optimisation opportunity',
      body: 'Welding station utilisation is at 62% this week. Pulling forward MW-EXT-03 bending ops would increase throughput by an estimated 18%.',
      category: 'Capacity',
      timestamp: '2 hours ago',
      confidence: 84,
    },
  ],
  sell: [
    {
      id: 'sell-1',
      title: 'Follow-up recommended',
      body: 'TechCorp Industries opened quote QT-2026-152 three times in the last 24 hours without responding. A follow-up call may accelerate close.',
      category: 'Engagement',
      timestamp: '30 min ago',
      confidence: 91,
    },
  ],
  make: [
    {
      id: 'make-1',
      title: 'Quality alert',
      body: 'Laser cut tolerances on MO-2026-008 are trending toward upper control limit. Recommend tool inspection before next batch.',
      category: 'Quality',
      timestamp: '1 hour ago',
      confidence: 85,
    },
  ],
  ship: [],
  book: [],
  control: [],
};

interface AIFeedProps {
  module: AiModule;
  className?: string;
  /** Maximum items to show before "Show more" */
  initialLimit?: number;
}

export function AIFeed({ module, className, initialLimit = 2 }: AIFeedProps) {
  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const items = FEED_DATA[module] ?? [];
  if (items.length === 0) return null;

  const visibleItems = expanded ? items : items.slice(0, initialLimit);
  const hasMore = items.length > initialLimit;

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--mw-yellow-400)]" />
          <span className="text-sm font-medium text-foreground">AI Insights</span>
          <Badge className="border-0 bg-[var(--mw-yellow-400)]/15 text-[var(--mw-yellow-600)] dark:text-[var(--mw-yellow-400)] text-[10px] px-1.5 py-0">
            {items.length} new
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-[var(--neutral-500)]"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
        </Button>
      </div>

      {/* Feed items */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-2">
        <AnimatePresence initial={false}>
          {visibleItems.map((item) => (
            <motion.div key={item.id} variants={staggerItem} layout>
              <Card className="p-3 border border-[var(--border)] bg-card">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-[var(--mw-mirage)] flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-[var(--mw-yellow-400)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-foreground">{item.title}</span>
                      {item.confidence != null && (
                        <Badge
                          className="border-0 text-[10px] px-1.5 py-0"
                          style={{
                            backgroundColor: item.confidence >= 80
                              ? 'var(--mw-green)'
                              : item.confidence >= 60
                                ? 'var(--mw-yellow-500)'
                                : 'var(--neutral-400)',
                            color: 'white',
                            opacity: 0.85,
                          }}
                        >
                          {item.confidence}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[var(--neutral-500)] leading-relaxed line-clamp-2">
                      {item.body}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="border-transparent bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] text-[var(--neutral-500)] text-[10px] px-1.5 py-0">
                        {item.category}
                      </Badge>
                      <span className="text-[10px] text-[var(--neutral-400)]">{item.timestamp}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Show more / less */}
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-8 text-xs text-[var(--neutral-500)]"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              Show less <ChevronUp className="ml-1 h-3 w-3" />
            </>
          ) : (
            <>
              Show {items.length - initialLimit} more insight{items.length - initialLimit > 1 ? 's' : ''} <ChevronDown className="ml-1 h-3 w-3" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
