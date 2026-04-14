/**
 * AIFeed — Personalised AI insight feed for module dashboards.
 *
 * Shows a collapsible feed of contextual AI insights with action buttons.
 * - Displays 1 insight by default, expands to 3 with staggered animation
 * - Each insight has an action button linking to the relevant module page
 * - "View all insights" button opens a full modal with all suggestions
 *
 * Usage:
 *   <AIFeed module="sell" />
 */

import React, { useState } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Users,
  DollarSign,
  Package,
  Truck,
  Clock,
  ChevronDown,
  Expand,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/components/ui/utils";
import { motion, AnimatePresence } from "motion/react";
import { MirrorWorksAgentCard } from "@/components/shared/ai/MirrorWorksAgentCard";

type AIFeedModule =
  | "sell"
  | "plan"
  | "make"
  | "ship"
  | "book"
  | "buy"
  | "control"
  | "all";

export interface FeedItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  tag?: string;
  tagColor?: string;
  timestamp: string;
  /** Button label prompting the user to take action */
  actionLabel: string;
  /** Route path the action navigates to */
  actionPath: string;
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
      actionLabel: "Review open quotes",
      actionPath: "/sell/quotes",
    },
    {
      id: "sell-2",
      icon: <DollarSign className="h-4 w-4 text-[var(--mw-success)]" />,
      title: "Invoice collection opportunity",
      body: "Two invoices totalling $152,500 are approaching 30-day terms. Historical data suggests a reminder email today increases on-time payment by 34%.",
      tag: "Revenue",
      tagColor: "bg-[var(--mw-success)]/15 text-[var(--mw-success)]",
      timestamp: "38 min ago",
      actionLabel: "Send payment reminders",
      actionPath: "/sell/invoices",
    },
    {
      id: "sell-3",
      icon: <AlertTriangle className="h-4 w-4 text-[var(--mw-error)]" />,
      title: "At-risk opportunity detected",
      body: "OPP-0004 (Sydney Rail Corp, $67,000) has had no activity for 12 days. Similar opportunities that stalled at this stage had a 42% lower close rate.",
      tag: "Risk",
      tagColor: "bg-[var(--mw-error)]/15 text-[var(--mw-error)]",
      timestamp: "1h ago",
      actionLabel: "View opportunity",
      actionPath: "/sell/opportunities",
    },
    {
      id: "sell-4",
      icon: <Users className="h-4 w-4 text-[var(--mw-info)]" />,
      title: "Customer re-engagement signal",
      body: "Pacific Fab viewed your last quote 3 times this week. Consider scheduling a call to discuss scope adjustments before the expiry date.",
      tag: "Signal",
      tagColor: "bg-[var(--mw-info)]/15 text-[var(--mw-info)]",
      timestamp: "2h ago",
      actionLabel: "Schedule follow-up",
      actionPath: "/sell/activities",
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
      actionLabel: "Open schedule",
      actionPath: "/plan/schedule",
    },
    {
      id: "plan-2",
      icon: <AlertTriangle className="h-4 w-4 text-[var(--mw-warning)]" />,
      title: "Job at risk of slipping",
      body: "JOB-2026-0012 depends on materials from Hunter Steel (PO-2026-0089). Supplier confirmed 3-day delay — downstream ops may need re-sequencing.",
      tag: "Risk",
      tagColor: "bg-[var(--mw-error)]/15 text-[var(--mw-error)]",
      timestamp: "45 min ago",
      actionLabel: "View job details",
      actionPath: "/plan/jobs",
    },
    {
      id: "plan-3",
      icon: <TrendingUp className="h-4 w-4 text-[var(--mw-success)]" />,
      title: "On-time rate trending up",
      body: "On-time delivery has improved 4% over the last 30 days. Press brake and welding centres are outperforming targets.",
      tag: "Performance",
      tagColor: "bg-[var(--mw-success)]/15 text-[var(--mw-success)]",
      timestamp: "1h ago",
      actionLabel: "View activities",
      actionPath: "/plan/activities",
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
      actionLabel: "Review quality logs",
      actionPath: "/make/quality",
    },
    {
      id: "make-2",
      icon: <AlertTriangle className="h-4 w-4 text-[var(--mw-error)]" />,
      title: "Machine downtime alert",
      body: "Laser 2 has been idle for 38 minutes with no operator logged. Check if maintenance is required or reassign the next MO.",
      tag: "Downtime",
      tagColor: "bg-[var(--mw-error)]/15 text-[var(--mw-error)]",
      timestamp: "38 min ago",
      actionLabel: "View shop floor",
      actionPath: "/make/shop-floor",
    },
    {
      id: "make-3",
      icon: <Clock className="h-4 w-4 text-[var(--mw-info)]" />,
      title: "MO ready for release",
      body: "MO-2026-0087 has all materials allocated and tooling confirmed. Release to shop floor to keep the schedule on track.",
      tag: "Action",
      tagColor: "bg-[var(--mw-info)]/15 text-[var(--mw-info)]",
      timestamp: "1h ago",
      actionLabel: "Open MO",
      actionPath: "/make/manufacturing-orders",
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
      actionLabel: "View shipping",
      actionPath: "/ship/shipping",
    },
    {
      id: "ship-2",
      icon: <AlertTriangle className="h-4 w-4 text-[var(--mw-warning)]" />,
      title: "Exception requires action",
      body: "SP270226003 is stuck at carrier hub for 18 hours. Customer SLA is 24h — escalate or reroute to avoid breach.",
      tag: "Exception",
      tagColor: "bg-[var(--mw-warning)]/15 text-[var(--mw-yellow-800)] dark:text-[var(--mw-yellow-400)]",
      timestamp: "1h ago",
      actionLabel: "View exceptions",
      actionPath: "/ship/tracking",
    },
    {
      id: "ship-3",
      icon: <Package className="h-4 w-4 text-[var(--mw-info)]" />,
      title: "Packaging ready for dispatch",
      body: "4 orders are packed and awaiting carrier pickup. Confirm dispatch schedule to meet tomorrow's delivery window.",
      tag: "Dispatch",
      tagColor: "bg-[var(--mw-info)]/15 text-[var(--mw-info)]",
      timestamp: "2h ago",
      actionLabel: "Open packaging",
      actionPath: "/ship/packaging",
    },
  ],
  book: [
    {
      id: "book-1",
      icon: <DollarSign className="h-4 w-4 text-[var(--mw-yellow-400)]" />,
      title: "Margin compression on Job 1284",
      body: "Actual machine burden is 8% above budgeted rate. Consider updating standard costs before the next quote cycle.",
      tag: "Costing",
      timestamp: "25 min ago",
      actionLabel: "Open job costing",
      actionPath: "/book/job-profitability",
    },
    {
      id: "book-2",
      icon: <TrendingUp className="h-4 w-4 text-[var(--mw-success)]" />,
      title: "WIP valuation spike",
      body: "Work-in-progress is 18% higher than the 12-week average — mostly driven by two long-running fabrication jobs.",
      tag: "WIP",
      tagColor: "bg-[var(--mw-success)]/15 text-[var(--mw-success)]",
      timestamp: "1h ago",
      actionLabel: "View WIP report",
      actionPath: "/book/wip-valuation",
    },
    {
      id: "book-3",
      icon: <AlertTriangle className="h-4 w-4 text-[var(--mw-warning)]" />,
      title: "Invoice ageing threshold",
      body: "Three customer accounts crossed 45-day terms this week. Total exposure: $84,200.",
      tag: "AR",
      tagColor: "bg-[var(--mw-warning)]/15 text-[var(--mw-yellow-800)] dark:text-[var(--mw-yellow-400)]",
      timestamp: "2h ago",
      actionLabel: "Review AR",
      actionPath: "/book/invoices",
    },
  ],
  buy: [
    {
      id: "buy-1",
      icon: <Package className="h-4 w-4 text-[var(--mw-yellow-400)]" />,
      title: "Receiving window in 48 hours",
      body: "PO-2026-0142 (BlueScope Steel, 12mm MS plate) is scheduled for Tuesday morning. Confirm forklift and receiving bay availability with the warehouse.",
      tag: "Logistics",
      timestamp: "15 min ago",
      actionLabel: "Confirm receipt",
      actionPath: "/buy/receipts",
    },
    {
      id: "buy-2",
      icon: <AlertTriangle className="h-4 w-4 text-[var(--mw-warning)]" />,
      title: "Supplier lead time slip",
      body: "Southern Fasteners pushed delivery on PO-2026-0118 by 4 business days. Two jobs using those fixings may need schedule updates.",
      tag: "Risk",
      tagColor:
        "bg-[var(--mw-warning)]/15 text-[var(--mw-yellow-800)] dark:text-[var(--mw-yellow-400)]",
      timestamp: "1h ago",
      actionLabel: "Update schedule",
      actionPath: "/plan/schedule",
    },
    {
      id: "buy-3",
      icon: <DollarSign className="h-4 w-4 text-[var(--mw-success)]" />,
      title: "Volume discount opportunity",
      body: "Consolidating next month's aluminium extrusion orders with Capral could unlock an extra 6% discount at 4+ tonnes. Current open requisitions total 3.2 tonnes.",
      tag: "Savings",
      tagColor: "bg-[var(--mw-success)]/15 text-[var(--mw-success)]",
      timestamp: "3h ago",
      actionLabel: "View requisitions",
      actionPath: "/buy/requisitions",
    },
  ],
  control: [
    {
      id: "control-1",
      icon: <Clock className="h-4 w-4 text-[var(--mw-yellow-400)]" />,
      title: "Workflow run failures up",
      body: "The \"New job from order\" automation failed 4 times in 24h — all due to missing routing on product SKU-4412.",
      tag: "Automation",
      timestamp: "18 min ago",
      actionLabel: "Open workflow designer",
      actionPath: "/control/workflow-designer",
    },
    {
      id: "control-2",
      icon: <AlertTriangle className="h-4 w-4 text-[var(--mw-error)]" />,
      title: "Document approval backlog",
      body: "12 drawings are waiting >72h for engineering sign-off. Oldest: Bracket-v3.dwg (5 days).",
      tag: "Compliance",
      tagColor: "bg-[var(--mw-error)]/15 text-[var(--mw-error)]",
      timestamp: "50 min ago",
      actionLabel: "View documents",
      actionPath: "/control/documents",
    },
    {
      id: "control-3",
      icon: <Users className="h-4 w-4 text-[var(--mw-info)]" />,
      title: "Training compliance gap",
      body: "4 operators on Laser 2 have hot-work certificates expiring within 14 days. Schedule refresher to stay audit-ready.",
      tag: "People",
      tagColor: "bg-[var(--mw-info)]/15 text-[var(--mw-info)]",
      timestamp: "3h ago",
      actionLabel: "Open training",
      actionPath: "/control/people",
    },
  ],
  all: [],
};

export interface AIFeedProps {
  module: AIFeedModule;
  className?: string;
  /** Maximum number of items to show initially before "Show more" */
  initialCount?: number;
  /**
   * When set, replaces the default module feed (e.g. opportunity- or job-scoped mock copy).
   * Icons should be stable across renders (built once per entity).
   */
  items?: FeedItem[];
}

// ── Individual feed item card ────────────────────────────────────────
function FeedItemCard({
  item,
  index,
  onAction,
}: {
  item: FeedItem;
  index: number;
  onAction: (path: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{
        opacity: 1,
        height: "auto",
        marginBottom: 12,
      }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.08,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="overflow-visible"
    >
      <MirrorWorksAgentCard
        title={item.title}
        suggestion={<div className="text-xs leading-relaxed text-[var(--neutral-500)]">{item.body}</div>}
        primaryAction={{ label: item.actionLabel, onClick: () => onAction(item.actionPath) }}
        statusLabel={item.tag}
        statusText={item.timestamp}
        tone={item.tag?.toLowerCase().includes('risk') || item.tag?.toLowerCase().includes('exception')
          ? 'risk'
          : item.tag?.toLowerCase().includes('performance') || item.tag?.toLowerCase().includes('savings') || item.tag?.toLowerCase().includes('dispatch')
            ? 'opportunity'
            : 'neutral'}
        className="shadow-xs"
      />
    </motion.div>
  );
}

// ── Modal feed item (no animation wrapper) ───────────────────────────
function ModalFeedItem({
  item,
  onAction,
}: {
  item: FeedItem;
  onAction: (path: string) => void;
}) {
  return (
    <MirrorWorksAgentCard
      title={item.title}
      suggestion={<div className="text-xs leading-relaxed text-[var(--neutral-500)]">{item.body}</div>}
      primaryAction={{ label: item.actionLabel, onClick: () => onAction(item.actionPath) }}
      statusLabel={item.tag}
      statusText={item.timestamp}
      tone={item.tag?.toLowerCase().includes('risk') || item.tag?.toLowerCase().includes('exception')
        ? 'risk'
        : item.tag?.toLowerCase().includes('performance') || item.tag?.toLowerCase().includes('savings') || item.tag?.toLowerCase().includes('dispatch')
          ? 'opportunity'
          : 'neutral'}
      className="w-full"
    />
  );
}

export function AIFeed({
  module,
  className,
  initialCount = 1,
  items: itemsProp,
}: AIFeedProps) {
  const items = itemsProp ?? FEED_DATA[module] ?? [];
  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  if (items.length === 0) return null;

  // Show 1 initially, expand to 3 on click, modal for all
  const collapseCount = initialCount;
  const expandCount = Math.min(3, items.length);
  const visible = expanded ? items.slice(0, expandCount) : items.slice(0, collapseCount);
  const canExpand = items.length > collapseCount && !expanded;
  const hiddenCount = items.length - collapseCount;

  const handleAction = (path: string) => {
    setModalOpen(false);
    navigate(path);
  };

  return (
    <>
      <div className={cn("space-y-0", className)}>
        {/* Feed header */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">MirrorWorks Agent</h3>
          <Badge className="border-0 bg-[var(--neutral-100)] text-[var(--neutral-600)] text-[10px] px-1.5 py-0 dark:bg-[var(--neutral-800)] dark:text-[var(--neutral-300)]">
            {items.length} new
          </Badge>
        </div>

        {/* Feed items — staggered notification-list animation */}
        <AnimatePresence initial={false}>
          {visible.map((item, i) => (
            <FeedItemCard
              key={item.id}
              item={item}
              index={i === 0 ? 0 : i}
              onAction={handleAction}
            />
          ))}
        </AnimatePresence>

        {/* Expand / View all row */}
        <div className="flex items-center justify-between pt-1">
          {/* Expand to show 2 more */}
          {canExpand ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs text-[var(--neutral-500)]"
              onClick={() => setExpanded(true)}
            >
              <ChevronDown className="h-3.5 w-3.5" />
              Show {Math.min(hiddenCount, expandCount - collapseCount)} more
            </Button>
          ) : expanded ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs text-[var(--neutral-500)]"
              onClick={() => setExpanded(false)}
            >
              <ChevronDown className="h-3.5 w-3.5 rotate-180 transition-transform" />
              Show less
            </Button>
          ) : (
            <div />
          )}

          {/* View all modal button */}
          {items.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium text-[var(--mw-mirage)] hover:bg-[var(--mw-agent)] hover:text-[var(--mw-mirage)]"
              onClick={() => setModalOpen(true)}
            >
              <Expand className="h-3.5 w-3.5" />
              View all insights
            </Button>
          )}
        </div>
      </div>

      {/* ── All-insights modal — white surface with AI border glow ── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className="gap-0 border border-[var(--border)] bg-card p-0 shadow-[var(--elevation-3)] sm:max-w-lg"
          showCloseButton
        >
          <DialogHeader className="px-8 pt-8 pb-5">
            <div className="flex flex-wrap items-center gap-2">
              <DialogTitle className="text-[var(--mw-mirage)]">MirrorWorks Agent</DialogTitle>
              <Badge className="border-0 bg-[var(--neutral-100)] text-[10px] px-1.5 py-0 text-[var(--neutral-600)]">
                {items.length} new
              </Badge>
            </div>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-3 overflow-y-auto px-8 pb-8">
            {items.map((item) => (
              <ModalFeedItem
                key={item.id}
                item={item}
                onAction={handleAction}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
