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
  ArrowRight,
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
import { BorderGlow } from "@/components/shared/surfaces/BorderGlow";
import { SpotlightCard } from "@/components/shared/surfaces/SpotlightCard";


type AIFeedModule =
  | "sell"
  | "plan"
  | "make"
  | "ship"
  | "book"
  | "buy"
  | "control"
  | "all";

interface FeedItem {
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
  book: [],
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
  control: [],
  all: [],
};

export interface AIFeedProps {
  module: AIFeedModule;
  className?: string;
  /** Maximum number of items to show initially before "Show more" */
  initialCount?: number;
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
      className="overflow-hidden"
    >
      <SpotlightCard
        radius="rounded-[var(--shape-lg)]"
        spotlightColor="rgba(77, 221, 201, 0.10)"
        className="border border-[var(--mw-agent)]/15 bg-card dark:border-[var(--mw-agent)]/20"
      >
        <div className="flex gap-3 p-4">
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
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] text-[var(--neutral-400)] dark:text-[var(--neutral-500)]">
                {item.timestamp}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2.5 text-xs font-medium text-[var(--mw-agent-600)] transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)] hover:bg-[var(--neutral-100)] hover:text-[var(--mw-agent-600)] dark:text-[var(--mw-agent-light)] dark:hover:bg-[var(--neutral-800)] dark:hover:text-[var(--mw-agent-light)]"
                onClick={() => onAction(item.actionPath)}
              >
                {item.actionLabel}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </SpotlightCard>
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
    <SpotlightCard
      radius="rounded-[var(--shape-lg)]"
      spotlightColor="rgba(77, 221, 201, 0.18)"
      className="border border-[var(--mw-agent)]/25 bg-white"
    >
      <div className="flex gap-3 p-4">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--mw-agent-50)]">
          {React.cloneElement(item.icon as React.ReactElement, {
            className: "h-4 w-4 text-[var(--mw-agent-600)]",
          })}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--mw-mirage)]">{item.title}</span>
            {item.tag && (
              <Badge className="border-0 bg-[var(--mw-agent-50)] text-[10px] px-1.5 py-0 rounded-full font-medium text-[var(--mw-agent-600)]">
                {item.tag}
              </Badge>
            )}
          </div>
          <p className="text-xs leading-relaxed text-[var(--mw-mirage)]/75">{item.body}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-[var(--mw-mirage)]/55">{item.timestamp}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2.5 text-xs font-medium text-[var(--mw-agent-600)] hover:bg-[var(--neutral-100)] hover:text-[var(--mw-agent-600)] dark:hover:bg-[var(--neutral-800)]"
              onClick={() => onAction(item.actionPath)}
            >
              {item.actionLabel}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}

export function AIFeed({ module, className, initialCount = 1 }: AIFeedProps) {
  const items = FEED_DATA[module] ?? [];
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
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">Agent insights</h3>
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
          className="gap-0 border-0 !bg-transparent p-0 shadow-none sm:max-w-lg"
          showCloseButton
        >
          <BorderGlow
            backgroundColor="#ffffff"
            borderRadius={20}
            glowRadius={20}
            glowIntensity={0.72}
            fillOpacity={0.36}
            coneSpread={20}
            edgeSensitivity={15}
          >
            <DialogHeader className="px-8 pt-8 pb-5">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-[var(--mw-mirage)]">Agent insights</DialogTitle>
                <Badge className="border-0 bg-[var(--mw-agent-50)] text-[10px] px-1.5 py-0 font-medium text-[var(--mw-agent-600)]">
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
          </BorderGlow>
        </DialogContent>
      </Dialog>
    </>
  );
}
