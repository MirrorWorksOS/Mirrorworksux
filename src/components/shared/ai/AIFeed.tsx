/**
 * AIFeed — Personalised AI insight feed for module dashboards.
 *
 * Shows a scrollable feed of contextual AI insights, signals, and
 * recommendations relevant to the given module. Each card uses the
 * AIInsightCard visual pattern (Sparkles icon, no yellow background).
 *
 * Usage:
 *   <AIFeed module="sell" />
 */

import React, { useState } from "react";
import { Sparkles, TrendingUp, AlertTriangle, Users, DollarSign, Package, Truck, Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";
import { motion, AnimatePresence } from "motion/react";

type AIFeedModule = "sell" | "plan" | "make" | "ship" | "book" | "buy" | "control" | "all";

interface FeedItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  tag?: string;
  tagColor?: string;
  timestamp: string;
}

const FEED_DATA: Record<AIFeedModule, FeedItem[]> = {
  sell: [
    {
      id: "sell-1",
      icon: <TrendingUp className="h-4 w-4 text-[var(--mw-yellow-400)]" />,
      title: "Pipeline velocity increasing",
      body: "Opportunities are moving through Proposal to Sales Order 18% faster this month. Three quotes are ready for follow-up within 48 hours.",
      tag: "Pipeline",
      tagColor: "bg-[var(--mw-yellow-400)]/15 text-foreground",
      timestamp: "12 min ago",
    },
    {
      id: "sell-2",
      icon: <DollarSign className="h-4 w-4 text-[var(--mw-success)]" />,
      title: "Invoice collection opportunity",
      body: "Two invoices totalling $152,500 are approaching 30-day terms. Historical data suggests a reminder email today increases on-time payment by 34%.",
      tag: "Revenue",
      tagColor: "bg-[var(--mw-success)]/15 text-[var(--mw-success)]",
      timestamp: "38 min ago",
    },
    {
      id: "sell-3",
      icon: <AlertTriangle className="h-4 w-4 text-[var(--mw-error)]" />,
      title: "At-risk opportunity detected",
      body: "OPP-0004 (Sydney Rail Corp, $67,000) has had no activity for 12 days. Similar opportunities that stalled at this stage had a 42% lower close rate.",
      tag: "Risk",
      tagColor: "bg-[var(--mw-error)]/15 text-[var(--mw-error)]",
      timestamp: "1h ago",
    },
    {
      id: "sell-4",
      icon: <Users className="h-4 w-4 text-[var(--mw-info)]" />,
      title: "Customer re-engagement signal",
      body: "Pacific Fab viewed your last quote 3 times this week. Consider scheduling a call to discuss scope adjustments before the expiry date.",
      tag: "Signal",
      tagColor: "bg-[var(--mw-info)]/15 text-[var(--mw-info)]",
      timestamp: "2h ago",
    },
  ],
  plan: [
    {
      id: "plan-1",
      icon: <Clock className="h-4 w-4 text-[var(--mw-yellow-400)]" />,
      title: "Capacity bottleneck forecast",
      body: "Laser cutting is projected to exceed 95% utilisation next week. Consider subcontracting or shifting 2 jobs to the following week.",
      tag: "Capacity",
      timestamp: "20 min ago",
    },
  ],
  make: [
    {
      id: "make-1",
      icon: <Package className="h-4 w-4 text-[var(--mw-yellow-400)]" />,
      title: "Quality trend detected",
      body: "First-pass yield on powder coat line has dropped 4% over the last 5 days. Review recent calibration logs.",
      tag: "Quality",
      timestamp: "45 min ago",
    },
  ],
  ship: [
    {
      id: "ship-1",
      icon: <Truck className="h-4 w-4 text-[var(--mw-yellow-400)]" />,
      title: "Carrier delay pattern",
      body: "StarTrack has been 1.2 days late on average this month. Consider switching to Allied Express for SLA-critical deliveries.",
      tag: "Logistics",
      timestamp: "30 min ago",
    },
  ],
  book: [],
  buy: [
    {
      id: "buy-1",
      icon: <Package className="h-4 w-4 text-[var(--mw-yellow-400)]" />,
      title: "Receiving window in 48 hours",
      body: "PO-2026-0142 (BlueScope Steel, 12mm MS plate) is scheduled for Tuesday morning. Confirm forklift and receiving bay availability with the warehouse.",
      tag: "Logistics",
      timestamp: "15 min ago",
    },
    {
      id: "buy-2",
      icon: <AlertTriangle className="h-4 w-4 text-[var(--mw-warning)]" />,
      title: "Supplier lead time slip",
      body: "Southern Fasteners pushed delivery on PO-2026-0118 by 4 business days. Two jobs using those fixings may need schedule updates.",
      tag: "Risk",
      tagColor: "bg-[var(--mw-warning)]/15 text-[var(--mw-yellow-800)] dark:text-[var(--mw-yellow-400)]",
      timestamp: "1h ago",
    },
    {
      id: "buy-3",
      icon: <DollarSign className="h-4 w-4 text-[var(--mw-success)]" />,
      title: "Volume discount opportunity",
      body: "Consolidating next month's aluminium extrusion orders with Capral could unlock an extra 6% discount at 4+ tonnes. Current open requisitions total 3.2 tonnes.",
      tag: "Savings",
      tagColor: "bg-[var(--mw-success)]/15 text-[var(--mw-success)]",
      timestamp: "3h ago",
    },
  ],
  control: [],
  all: [],
};

export interface AIFeedProps {
  module: AIFeedModule;
  className?: string;
  /** Maximum number of items to show initially before "Show more" */
  initialCount?: number;
}

export function AIFeed({ module, className, initialCount = 3 }: AIFeedProps) {
  const items = FEED_DATA[module] ?? [];
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  const visible = expanded ? items : items.slice(0, initialCount);
  const hasMore = items.length > initialCount;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Feed header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[var(--mw-yellow-400)]" />
        <h3 className="text-sm font-medium text-foreground">AI Insights</h3>
        <Badge className="border-0 bg-[var(--neutral-100)] text-[var(--neutral-600)] text-[10px] px-1.5 py-0 dark:bg-[var(--neutral-800)] dark:text-[var(--neutral-300)]">
          {items.length} new
        </Badge>
      </div>

      {/* Feed items */}
      <AnimatePresence initial={false}>
        {visible.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex gap-3 rounded-[var(--shape-lg)] border border-[var(--neutral-200)] bg-card p-4 dark:border-[var(--neutral-700)]"
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)]">
              {item.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {item.title}
                </span>
                {item.tag && (
                  <Badge
                    className={cn(
                      "border-0 text-[10px] px-1.5 py-0 rounded-full",
                      item.tagColor ??
                        "bg-[var(--neutral-100)] text-[var(--neutral-600)] dark:bg-[var(--neutral-800)] dark:text-[var(--neutral-300)]",
                    )}
                  >
                    {item.tag}
                  </Badge>
                )}
              </div>
              <p className="text-xs leading-relaxed text-[var(--neutral-500)] dark:text-[var(--neutral-400)]">
                {item.body}
              </p>
              <span className="mt-1.5 block text-[10px] text-[var(--neutral-400)] dark:text-[var(--neutral-500)]">
                {item.timestamp}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Show more / less toggle */}
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full text-xs text-[var(--neutral-500)]"
          onClick={() => setExpanded((e) => !e)}
        >
          <ChevronDown className={cn("mr-1 h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
          {expanded ? "Show less" : `Show ${items.length - initialCount} more`}
        </Button>
      )}
    </div>
  );
}
