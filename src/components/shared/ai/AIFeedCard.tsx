/**
 * AIFeedCard — Individual insight card for the AI Insight Feed.
 *
 * Design:
 *  - Left: lucide icon by insight type
 *  - Center: message with bold entity highlights, timestamp below
 *  - Right: contextual quick-action buttons
 *  - Colored left border for priority (urgent=error, high=warning, medium=yellow-400, low=neutral-300)
 *  - Dismiss button (X) top-right, animates out via framer-motion
 */

import React from 'react';
import {
  Phone,
  Mail,
  AlertTriangle,
  TrendingUp,
  Package,
  Wrench,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';
import type { AIFeedInsight, AIFeedInsightType, AIFeedPriority } from './ai-feed-types';

// ── Icon mapping by insight type ──────────────────────────────
const INSIGHT_ICONS: Record<AIFeedInsightType, React.ElementType> = {
  call: Phone,
  email: Mail,
  stock: Package,
  'job-risk': AlertTriangle,
  quote: TrendingUp,
  capacity: AlertTriangle,
  quality: AlertTriangle,
  machine: Wrench,
  supplier: Package,
  price: TrendingUp,
};

// ── Priority left-border colour ───────────────────────────────
const PRIORITY_BORDER: Record<AIFeedPriority, string> = {
  urgent: 'border-l-[var(--mw-error)]',
  high: 'border-l-[var(--mw-warning)]',
  medium: 'border-l-[var(--mw-yellow-400)]',
  low: 'border-l-[var(--neutral-300)]',
};

// ── Icon background tint by priority ──────────────────────────
const PRIORITY_ICON_BG: Record<AIFeedPriority, string> = {
  urgent: 'bg-[var(--mw-error-light)] dark:bg-[var(--mw-error)]/15',
  high: 'bg-[var(--mw-warning-light)] dark:bg-[var(--mw-warning)]/15',
  medium: 'bg-purple-50 dark:bg-purple-900/20',
  low: 'bg-[var(--neutral-100)] dark:bg-[var(--neutral-200)]',
};

const PRIORITY_ICON_TEXT: Record<AIFeedPriority, string> = {
  urgent: 'text-[var(--mw-error)]',
  high: 'text-[var(--mw-yellow-700)] dark:text-[var(--mw-yellow-400)]',
  medium: 'text-purple-600 dark:text-purple-400',
  low: 'text-[var(--neutral-500)]',
};

/**
 * Parses **bold** markers into <span className="font-medium"> elements.
 */
function renderHighlightedMessage(message: string): React.ReactNode {
  const parts = message.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={i} className="font-medium text-foreground">
          {part.slice(2, -2)}
        </span>
      );
    }
    return part;
  });
}

// ── Animation variants ────────────────────────────────────────
const cardVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: 40, transition: { duration: 0.2, ease: [0.3, 0, 1, 1] as [number, number, number, number] } },
};

interface AIFeedCardProps {
  insight: AIFeedInsight;
  onDismiss: (id: string) => void;
  index?: number;
}

export function AIFeedCard({ insight, onDismiss, index = 0 }: AIFeedCardProps) {
  const Icon = INSIGHT_ICONS[insight.type] ?? AlertTriangle;
  const borderClass = PRIORITY_BORDER[insight.priority];
  const iconBg = PRIORITY_ICON_BG[insight.priority];
  const iconText = PRIORITY_ICON_TEXT[insight.priority];

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ delay: index * 0.05, duration: 0.25, ease: [0.2, 0, 0, 1] }}
    >
      <div
        className={cn(
          'group relative flex items-start gap-3 rounded-lg border border-[var(--neutral-200)] dark:border-[var(--neutral-700)] bg-white dark:bg-neutral-800 p-3 border-l-[3px]',
          borderClass,
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5',
            iconBg,
          )}
        >
          <Icon className={cn('h-4 w-4', iconText)} strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[var(--neutral-600)] dark:text-[var(--neutral-300)] leading-relaxed pr-6">
            {renderHighlightedMessage(insight.message)}
          </p>
          <span className="text-xs text-[var(--neutral-400)] dark:text-[var(--neutral-500)] mt-1 block">
            {insight.timestamp}
          </span>

          {/* Actions */}
          {insight.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {insight.actions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-xs rounded-full"
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={() => onDismiss(insight.id)}
          className={cn(
            'absolute top-2 right-2 p-1 rounded-full',
            'text-[var(--neutral-400)] hover:text-foreground hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-200)]',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
          )}
          aria-label="Dismiss insight"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
