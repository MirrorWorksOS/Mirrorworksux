import React from "react";
import { TrendingUp, DollarSign, AlertTriangle, Users } from "lucide-react";

import type { FeedItem } from "@/components/shared/ai/AIFeed";
import type { Opportunity, OpportunityStage } from "@/components/sell/sell-opportunity-types";

const STAGE_LABEL: Record<OpportunityStage, string> = {
  new: "New",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

/** Display id e.g. opp-005 → OPP-005 */
function displayOppId(id: string): string {
  return id.toUpperCase();
}

/**
 * Agent insights for the Sell opportunity workspace — all copy references the
 * current opportunity and customer (no other opportunity IDs in mock text).
 */
export function buildSellOpportunityFeedItems(opp: Opportunity): FeedItem[] {
  const oid = displayOppId(opp.id);
  const stage = STAGE_LABEL[opp.stage];
  const valueLabel = `$${opp.value.toLocaleString("en-AU")}`;

  return [
    {
      id: `opp-feed-${opp.id}-1`,
      icon: <TrendingUp className="h-4 w-4 text-[var(--mw-yellow-400)]" />,
      title: "Engagement on this opportunity",
      body: `${oid} (${opp.title}) is in ${stage} at ${valueLabel}. Quote and email touchpoints for this deal are tracking above average for similar fabrication opportunities this month.`,
      tag: "Pipeline",
      tagColor: "bg-[var(--mw-yellow-400)]/15 text-foreground",
      timestamp: "12 min ago",
      actionLabel: "Review linked quotes",
      actionPath: "/sell/quotes",
    },
    {
      id: `opp-feed-${opp.id}-2`,
      icon: <DollarSign className="h-4 w-4 text-[var(--mw-success)]" />,
      title: "Account collection rhythm",
      body: `For ${opp.customer}, tying payment conversations to active quotes often improves collection cadence. ${oid} is a natural anchor for the next accounts-receivable touchpoint while this deal stays in motion.`,
      tag: "Revenue",
      tagColor: "bg-[var(--mw-success)]/15 text-[var(--mw-success)]",
      timestamp: "38 min ago",
      actionLabel: "Open invoices",
      actionPath: "/sell/invoices",
    },
    {
      id: `opp-feed-${opp.id}-3`,
      icon: <AlertTriangle className="h-4 w-4 text-[var(--mw-error)]" />,
      title: "Follow-up gap on this opportunity",
      body: `${oid} (${opp.title}, ${valueLabel}) has had no logged outbound activity for several days. Other ${stage} deals that stalled at this point historically converted about 40% less often.`,
      tag: "Risk",
      tagColor: "bg-[var(--mw-error)]/15 text-[var(--mw-error)]",
      timestamp: "1h ago",
      actionLabel: "Log activity",
      actionPath: "/sell/activities",
    },
    {
      id: `opp-feed-${opp.id}-4`,
      icon: <Users className="h-4 w-4 text-[var(--mw-info)]" />,
      title: "Quote engagement signal",
      body: `${opp.customer} has repeatedly opened your quote for ${opp.title} this week. Consider scheduling a call to discuss scope before the next internal review.`,
      tag: "Signal",
      tagColor: "bg-[var(--mw-info)]/15 text-[var(--mw-info)]",
      timestamp: "2h ago",
      actionLabel: "Schedule follow-up",
      actionPath: "/sell/activities",
    },
  ];
}
