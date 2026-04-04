/**
 * AIFeed — Module-scoped AI insight feed with contextual tips and suggestions.
 *
 * Renders a compact, scrollable feed of AI-generated insights relevant to the
 * current module. Uses the purple AI accent per the design system and integrates
 * with AIInsightCard for individual insight rendering.
 *
 * Props:
 *  - module: AiCommandScope — filters insights to the relevant module
 *  - maxItems: number — max visible insights (default 3)
 */

import React, { useState, useMemo } from "react";
import { Sparkles, ChevronDown, ChevronUp, TrendingUp, AlertTriangle, Lightbulb, BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import type { AiCommandScope } from "@/components/shared/ai/AiCommandBar";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AIInsight {
  id: string;
  icon: LucideIcon;
  title: string;
  body: string;
  timestamp: string;
  type: "trend" | "alert" | "tip" | "metric";
}

interface AIFeedProps {
  module: AiCommandScope;
  maxItems?: number;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Mock insights per module                                           */
/* ------------------------------------------------------------------ */

const INSIGHTS: Record<string, AIInsight[]> = {
  buy: [
    {
      id: "buy-1",
      icon: TrendingUp,
      title: "Spend trending 12% above Q1 forecast",
      body: "Raw materials spend is $18.4k above the quarterly plan. Steel prices rose 8% since February -- consider locking in a forward contract with Hunter Steel.",
      timestamp: "2 hours ago",
      type: "trend",
    },
    {
      id: "buy-2",
      icon: AlertTriangle,
      title: "Supplier lead time drift detected",
      body: "Pacific Metals average lead time has increased from 5 to 9 days over the last 3 orders. This may affect JOB-2026-0012 delivery promise.",
      timestamp: "4 hours ago",
      type: "alert",
    },
    {
      id: "buy-3",
      icon: Lightbulb,
      title: "Consolidation opportunity",
      body: "3 pending requisitions share common SKUs from Hunter Steel. Bundling into a single PO could save ~$1,200 in freight and unlock a volume discount.",
      timestamp: "6 hours ago",
      type: "tip",
    },
    {
      id: "buy-4",
      icon: BarChart3,
      title: "On-time delivery improved",
      body: "Overall supplier on-time rate is up 4 points to 89% this month. Top performer: Bossard Fasteners at 98%.",
      timestamp: "1 day ago",
      type: "metric",
    },
  ],
  sell: [
    {
      id: "sell-1",
      icon: TrendingUp,
      title: "Pipeline velocity increasing",
      body: "Average deal close time dropped 3 days this month. QT-2026-0142 is your largest open quote -- similar wins closed 18% faster with 48-hour follow-up.",
      timestamp: "1 hour ago",
      type: "trend",
    },
  ],
  make: [
    {
      id: "make-1",
      icon: AlertTriangle,
      title: "Powder coat line bottleneck",
      body: "Powder coat utilisation is at 94% for the next 5 days. Consider subcontracting overflow to maintain JOB-2026-0010 on schedule.",
      timestamp: "30 min ago",
      type: "alert",
    },
  ],
  plan: [
    {
      id: "plan-1",
      icon: Lightbulb,
      title: "Capacity re-sequence opportunity",
      body: "Press brake has slack on Thursday. Pulling JOB-2026-0010 forward could free laser capacity on Friday for the urgent Acme Steel order.",
      timestamp: "3 hours ago",
      type: "tip",
    },
  ],
  ship: [
    {
      id: "ship-1",
      icon: AlertTriangle,
      title: "3 carrier exceptions this week",
      body: "StarTrack delays affecting Con-form Group and Acme Steel deliveries. Both have SLA under 24 hours -- consider switching to direct freight.",
      timestamp: "5 hours ago",
      type: "alert",
    },
  ],
  book: [
    {
      id: "book-1",
      icon: BarChart3,
      title: "March accruals under budget",
      body: "Expense accruals for March are 6% under budget. Two invoices over 14 days overdue: TechCorp Industries, AeroSpace Ltd.",
      timestamp: "2 hours ago",
      type: "metric",
    },
  ],
  control: [
    {
      id: "control-1",
      icon: Lightbulb,
      title: "Bridge queue clear",
      body: "MirrorWorks Bridge import queue is clear. Factory layout v3 has 3 unplaced work centres. 2 pending user invites for shop floor role.",
      timestamp: "1 hour ago",
      type: "tip",
    },
  ],
  app: [
    {
      id: "app-1",
      icon: TrendingUp,
      title: "Cross-module summary",
      body: "Three jobs are at risk of missing the Mar 28 customer promise. Open PO lines for Hunter Steel may delay JOB-2026-0012 unless expedited.",
      timestamp: "1 hour ago",
      type: "trend",
    },
  ],
};

const TYPE_ICON_COLOUR: Record<AIInsight["type"], string> = {
  trend: "text-purple-600 dark:text-purple-400",
  alert: "text-purple-600 dark:text-purple-400",
  tip: "text-purple-600 dark:text-purple-400",
  metric: "text-purple-600 dark:text-purple-400",
};

const TYPE_BG: Record<AIInsight["type"], string> = {
  trend: "bg-purple-50 dark:bg-purple-950/30",
  alert: "bg-purple-50 dark:bg-purple-950/30",
  tip: "bg-purple-50 dark:bg-purple-950/30",
  metric: "bg-purple-50 dark:bg-purple-950/30",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AIFeed({ module, maxItems = 3, className }: AIFeedProps) {
  const [expanded, setExpanded] = useState(false);

  const insights = useMemo(
    () => INSIGHTS[module] ?? INSIGHTS.app ?? [],
    [module],
  );

  const visible = expanded ? insights : insights.slice(0, maxItems);
  const hasMore = insights.length > maxItems;

  if (insights.length === 0) return null;

  return (
    <Card
      className={cn(
        "border border-[var(--border)] bg-card rounded-[var(--shape-lg)] p-4",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40">
          <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-sm font-medium text-foreground">AI Insights</h3>
        <span className="ml-auto text-xs text-[var(--neutral-400)]">
          {insights.length} insight{insights.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Insight list */}
      <div className="space-y-2">
        {visible.map((insight) => {
          const Icon = insight.icon;
          return (
            <div
              key={insight.id}
              className={cn(
                "flex gap-3 rounded-[var(--shape-md)] p-3 transition-colors duration-200 ease-[var(--ease-standard)]",
                TYPE_BG[insight.type],
              )}
            >
              <div className="mt-0.5 shrink-0">
                <Icon
                  className={cn("h-4 w-4", TYPE_ICON_COLOUR[insight.type])}
                  strokeWidth={1.5}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground leading-snug">
                  {insight.title}
                </p>
                <p className="mt-0.5 text-xs text-[var(--neutral-500)] dark:text-[var(--neutral-400)] leading-relaxed">
                  {insight.body}
                </p>
                <span className="mt-1 block text-[10px] text-[var(--neutral-400)]">
                  {insight.timestamp}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more / less */}
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full h-8 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="mr-1 h-3.5 w-3.5" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 h-3.5 w-3.5" />
              Show {insights.length - maxItems} more
            </>
          )}
        </Button>
      )}
    </Card>
  );
}
