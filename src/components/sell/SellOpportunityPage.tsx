/**
 * Sell opportunity — full-page workspace using shared JobWorkspaceLayout.
 * Kanban navigates here via /sell/opportunities/:id
 */

import React, { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  FileText,
  Mail,
  MessageSquare,
  Save,
  TrendingUp,
  User,
  Users,
  XCircle,
} from "lucide-react";
import {
  JobWorkspaceLayout,
  type JobWorkspaceTabConfig,
} from "@/components/shared/layout/JobWorkspaceLayout";
import { AIInsightCard } from "@/components/shared/ai/AIInsightCard";
import { TimelineView, type TimelineEvent } from "@/components/shared/schedule/TimelineView";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/components/ui/utils";
import { getChartScaleColour } from "@/components/shared/charts/chart-theme";
import type { Opportunity } from "./sell-opportunity-types";
import { opportunities as mockOpportunities, customers as mockCustomersData, quotes as mockQuotesData, sellActivities } from '@/services/mock';
import { SellOpportunityRecommendedActions } from "@/components/sell/SellOpportunityRecommendedActions";
import { AIFeed } from "@/components/shared/ai/AIFeed";
import { buildSellOpportunityFeedItems } from "@/components/sell/sell-opportunity-agent-feed";

type Stage = Opportunity["stage"];

const TAG_OPTIONS = [
  "Urgent",
  "Strategic",
  "Repeat customer",
  "Design assist",
  "Export",
] as const;

// Bridge centralized data to the shape this component expects (keyed by centralized id)
const MOCK_BY_ID: Record<string, Opportunity> = Object.fromEntries(
  mockOpportunities.map((opp) => [
    opp.id,
    {
      id: opp.id,
      title: opp.title,
      customer: opp.customerName,
      value: opp.value,
      expectedClose: opp.expectedClose,
      assignedTo: opp.assignedToInitials,
      priority: opp.priority,
      stage: opp.stage,
      probabilityPercent: opp.probabilityPercent,
      tags: opp.tags,
    },
  ]),
);

const STAGES: { key: Stage; label: string; color: string }[] = [
  { key: "new", label: "New", color: "var(--neutral-500)" },
  { key: "qualified", label: "Qualified", color: "var(--mw-info)" },
  { key: "proposal", label: "Proposal", color: "var(--mw-info)" },
  { key: "negotiation", label: "Negotiation", color: "var(--mw-warning)" },
  { key: "won", label: "Won", color: "var(--mw-success)" },
  { key: "lost", label: "Lost", color: "var(--mw-error)" },
];

// Build customer contact lookup from centralized data
const MOCK_CUSTOMER: Record<
  string,
  { contact: string; phone: string; email: string; address: string }
> = Object.fromEntries(
  mockCustomersData.map((c) => [
    c.company,
    {
      contact: c.contact,
      phone: c.phone,
      email: c.email,
      address: `${c.address}, ${c.city} ${c.state}`,
    },
  ]),
);

// Build timeline events from centralized activities
const MOCK_ACTIVITIES: TimelineEvent[] = sellActivities.slice(0, 4).map((a, i) => ({
  id: a.id,
  title: a.type.charAt(0).toUpperCase() + a.type.slice(1),
  description: a.description,
  timestamp: i === 0 ? '2h ago' : i === 1 ? '1d ago' : i === 2 ? '3d ago' : 'Tomorrow',
  status: a.status === 'completed' ? ('completed' as const) : ('upcoming' as const),
}));

// Build quotes list from centralized data
const MOCK_QUOTES = mockQuotesData.slice(0, 2).map((q) => ({
  id: q.id,
  ref: q.ref,
  date: new Date(q.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
  value: q.value,
  status: q.status.charAt(0).toUpperCase() + q.status.slice(1),
}));

/** Sell opportunity tab ids — passed to JobWorkspaceLayout. */
const DEFAULT_SELL_OPPORTUNITY_TABS: JobWorkspaceTabConfig[] = [
  { id: "overview", label: "Overview" },
  { id: "quotes", label: "Quotes" },
  { id: "activities", label: "Activities" },
  { id: "intelligence", label: "Intelligence Hub" },
];

const PRIORITY_BADGE: Record<
  Opportunity["priority"],
  { className: string; label: string }
> = {
  urgent: {
    className: "border-0 bg-[var(--mw-error)]/15 text-[var(--mw-error)]",
    label: "Urgent",
  },
  high: {
    className:
      "border-0 bg-[var(--badge-soft-accent-bg)] text-[var(--badge-soft-accent-text)]",
    label: "High",
  },
  medium: {
    className: "border-0 bg-[var(--neutral-100)] text-foreground",
    label: "Medium",
  },
  low: {
    className: "border-0 bg-[var(--neutral-100)] text-[var(--neutral-500)]",
    label: "Low",
  },
};

export function SellOpportunityPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("overview");

  const base = id ? MOCK_BY_ID[id] : undefined;
  const [opp, setOpp] = useState<Opportunity | null>(base ?? null);

  React.useEffect(() => {
    if (id && MOCK_BY_ID[id]) {
      setOpp(MOCK_BY_ID[id]);
    } else {
      setOpp(null);
    }
  }, [id]);

  const tabConfig = useMemo(() => {
    const q = MOCK_QUOTES.length;
    const a = MOCK_ACTIVITIES.length;
    return DEFAULT_SELL_OPPORTUNITY_TABS.map((t) => {
      if (t.id === "quotes") return { ...t, count: q };
      if (t.id === "activities") return { ...t, count: a };
      return { ...t };
    });
  }, []);

  const agentFeedItems = useMemo(() => {
    if (!opp) return null;
    return buildSellOpportunityFeedItems(opp);
  }, [opp]);

  if (!opp) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" className="border-[var(--border)]" asChild>
          <Link to="/sell/opportunities">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to opportunities
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Opportunity not found. Open one from the pipeline.
        </p>
      </div>
    );
  }

  const customer = MOCK_CUSTOMER[opp.customer] ?? {
    contact: "—",
    phone: "—",
    email: "—",
    address: "—",
  };
  const priorityCfg = PRIORITY_BADGE[opp.priority];

  const setStage = (stage: Stage) => {
    setOpp((o) => (o ? { ...o, stage } : o));
  };

  const toggleTag = (tag: string) => {
    setOpp((o) => {
      if (!o) return o;
      const current = new Set(o.tags ?? []);
      if (current.has(tag)) current.delete(tag);
      else current.add(tag);
      return { ...o, tags: [...current] };
    });
  };

  const renderTabPanel = (tab: string) => {
    switch (tab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <div className="space-y-6">
              <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-medium text-foreground">
                      Opportunity details
                    </h2>
                    <p className="text-xs text-[var(--neutral-500)]">
                      Stage, revenue, and customer context
                    </p>
                  </div>
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-[var(--mw-mirage)] text-xs text-white">
                      {opp.assignedTo}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="mb-6 flex gap-1">
                  {STAGES.filter((s) => s.key !== "lost").map((s, i) => {
                    const active = s.key === opp.stage;
                    const past =
                      STAGES.findIndex((st) => st.key === opp.stage) > i &&
                      opp.stage !== "lost";
                    return (
                      <button
                        key={s.key}
                        type="button"
                        title={s.label}
                        onClick={() => setStage(s.key)}
                        className="group relative flex-1"
                      >
                        <div
                          className={cn(
                            "h-1.5 rounded-full transition-colors duration-[var(--duration-medium1)]",
                            active || past ? "opacity-100" : "bg-[var(--border)]",
                          )}
                          style={{
                            backgroundColor:
                              active || past ? s.color : undefined,
                          }}
                        />
                        {active ? (
                          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-foreground">
                            {s.label}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                <div className="mb-6 h-5" />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">
                      Expected revenue
                    </Label>
                    <Input
                      readOnly
                      className="mt-1 h-12 border-[var(--border)] tabular-nums"
                      value={`$${opp.value.toLocaleString()}`}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">
                      Probability (%)
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      className="mt-1 h-12 border-[var(--border)] tabular-nums"
                      value={opp.probabilityPercent ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setOpp((o) =>
                          o
                            ? {
                                ...o,
                                probabilityPercent:
                                  v === "" ? undefined : Math.min(100, Math.max(0, Number(v))),
                              }
                            : o,
                        );
                      }}
                      placeholder="0–100"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">
                      Customer
                    </Label>
                    <Input
                      readOnly
                      className="mt-1 h-12 border-[var(--border)]"
                      value={opp.customer}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--neutral-500)]">
                      Expected close
                    </Label>
                    <Input
                      type="date"
                      className="mt-1 h-12 border-[var(--border)] tabular-nums"
                      value={opp.expectedClose}
                      onChange={(e) =>
                        setOpp((o) =>
                          o ? { ...o, expectedClose: e.target.value } : o,
                        )
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-[var(--neutral-500)]">
                      Email
                    </Label>
                    <Input
                      readOnly
                      className="mt-1 h-12 border-[var(--border)]"
                      value={customer.email}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-[var(--neutral-500)]">
                      Address
                    </Label>
                    <Input
                      readOnly
                      className="mt-1 h-12 border-[var(--border)]"
                      value={customer.address}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <Label className="text-xs text-[var(--neutral-500)] mb-2 block">
                    Tags
                  </Label>
                  <p className="text-xs text-[var(--neutral-500)] mb-3">
                    Multi-select — used for filtering and reporting.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TAG_OPTIONS.map((tag) => {
                      const on = (opp.tags ?? []).includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                            on
                              ? "border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)]/15 text-foreground"
                              : "border-[var(--border)] bg-card text-[var(--neutral-600)] hover:bg-[var(--neutral-50)]",
                          )}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6">
                  <Label className="text-xs text-[var(--neutral-500)]">
                    Description
                  </Label>
                  <Textarea
                    className="mt-1 min-h-[120px] border-[var(--border)] text-sm"
                    defaultValue={`Fabrication scope aligned with ${opp.customer} technical pack. Dimensional tolerances per drawing Rev C.`}
                  />
                </div>
              </Card>

              <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-medium text-foreground">
                    Quick quote
                  </h2>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 border-[var(--border)]"
                    onClick={() => navigate("/sell/quotes/new")}
                  >
                    Open builder
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Product
                      </TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right tabular-nums">
                        Qty
                      </TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right tabular-nums">
                        Sale price
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="min-h-14">
                      <TableCell className="text-sm">PROD-SR-001</TableCell>
                      <TableCell className="text-right text-sm tabular-nums">
                        4
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium tabular-nums">
                        $5,120.00
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm">LABOUR-FAB</TableCell>
                      <TableCell className="text-right text-sm tabular-nums">
                        12
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium tabular-nums">
                        $1,140.00
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>

              <div className="flex flex-wrap gap-2">
                <Badge variant="softAccent">
                  Hot
                </Badge>
                <Badge className="rounded-full border-0 bg-[var(--neutral-100)] text-foreground">
                  Fabrication
                </Badge>
              </div>
            </div>

            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-medium text-foreground">
                    Activities
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 text-xs text-[var(--neutral-500)]"
                    onClick={() => setActiveTab("activities")}
                  >
                    View all
                  </Button>
                </div>
                <div className="mb-4 rounded-[var(--shape-md)] border border-[var(--border)] bg-[var(--neutral-50)] p-3 text-center text-xs text-[var(--neutral-500)]">
                  Calendar — use Activities tab for full schedule
                </div>
                <ul className="space-y-3 text-sm">
                  {MOCK_ACTIVITIES.slice(0, 3).map((ev) => (
                    <li
                      key={ev.id}
                      className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0"
                    >
                      <p className="font-medium text-foreground">
                        {ev.title}
                      </p>
                      <p className="text-xs text-[var(--neutral-500)]">
                        {ev.timestamp}
                      </p>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-4 w-full bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)] h-12"
                  onClick={() => setActiveTab("activities")}
                >
                  Log activity
                </Button>
              </Card>

              <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-medium text-foreground">
                    Intelligence Hub
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 text-xs text-[var(--neutral-500)]"
                    onClick={() => setActiveTab("intelligence")}
                  >
                    Expand
                  </Button>
                </div>
                <AIInsightCard title="Signal">
                  Quote email opened twice in 24 hours. Good time to call{" "}
                  {customer.contact.split(" ")[0]}.
                </AIInsightCard>
              </Card>
            </div>
          </div>
        );

      case "quotes":
        return (
          <Card className="border border-[var(--neutral-200)] bg-card shadow-xs rounded-[var(--shape-lg)] overflow-hidden">
            <div className="border-b border-[var(--border)] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-base font-medium text-foreground">
                Quotes linked to this opportunity
              </h2>
              <Button
                className="bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)] h-12"
                onClick={() => navigate("/sell/quotes/new")}
              >
                <FileText className="mr-2 h-4 w-4" />
                New quote
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--neutral-100)] hover:bg-[var(--neutral-100)]">
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Reference
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Date
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">
                    Value
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_QUOTES.map((q) => (
                  <TableRow key={q.ref} className="min-h-14 cursor-pointer hover:bg-[var(--neutral-50)]" onClick={() => navigate(`/sell/quotes/${q.id}`)}>
                    <TableCell className="text-sm font-medium tabular-nums text-[var(--mw-info)] hover:underline">
                      {q.ref}
                    </TableCell>
                    <TableCell className="text-sm text-[var(--neutral-600)]">
                      {q.date}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium tabular-nums">
                      ${q.value.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className="border-0 bg-[var(--neutral-100)] text-foreground">
                        {q.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        );

      case "activities":
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-[var(--neutral-500)]">
                Assign activities to a team member or a group (e.g. Sales,
                Estimating). Prototype data is static.
              </p>
              <Button className="bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)] h-12">
                New activity
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MOCK_ACTIVITIES.map((ev) => (
                <Card
                  key={ev.id}
                  className="border border-[var(--neutral-200)] bg-card p-4 shadow-xs rounded-[var(--shape-lg)]"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className="border-[var(--border)] text-xs"
                    >
                      {ev.title}
                    </Badge>
                    <span className="text-xs text-[var(--neutral-500)] tabular-nums">
                      {ev.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--neutral-700)]">
                    {ev.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-[var(--neutral-500)]">
                    <User className="h-3.5 w-3.5 shrink-0" />
                    <span>Assigned: SC</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-[var(--neutral-500)]">
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    <span>Also visible to: Sales</span>
                  </div>
                </Card>
              ))}
            </div>
            <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
              <h3 className="mb-4 text-sm font-medium text-foreground">
                Activity log
              </h3>
              <TimelineView events={MOCK_ACTIVITIES} />
            </Card>
          </div>
        );

      case "intelligence":
        return (
          <div className="space-y-6">
            <AIFeed module="sell" initialCount={3} items={agentFeedItems ?? undefined} />

            {/* AI top-line signal */}
            <AIInsightCard title="Intelligence Hub">
              Win probability is <strong className="text-foreground">68%</strong> based on 142 similar fabrication opportunities. Next best action: call {customer.contact.split(" ")[0]} — quote engagement is high.
            </AIInsightCard>

            {/* 1. Win Probability Card */}
            <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-foreground">Win Probability</h3>
                <Badge variant="softAi">AI-powered</Badge>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold tabular-nums text-foreground">68%</div>
                  <p className="text-xs text-[var(--neutral-500)] mt-1">Win likelihood</p>
                </div>
                <div className="flex-1 space-y-2">
                  {[
                    { label: "Customer engagement", pct: 82 },
                    { label: "Quote competitiveness", pct: 71 },
                    { label: "Decision timeline", pct: 55 },
                    { label: "Competitor activity", pct: 40 },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-3 text-xs">
                      <span className="w-[140px] shrink-0 text-[var(--neutral-700)]">{f.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-[var(--neutral-100)]">
                        <div className="h-full rounded-full" style={{ width: `${f.pct}%`, backgroundColor: getChartScaleColour(f.pct) }} />
                      </div>
                      <span className="w-8 text-right tabular-nums text-[var(--neutral-700)]">{f.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-4 text-xs text-[var(--neutral-500)]">Updated 2 hours ago · Based on 142 similar fabrication opportunities</p>
            </Card>

            {/* 2. Two-column: Recommended Actions + Deal Velocity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SellOpportunityRecommendedActions
                contactFirstName={customer.contact.split(" ")[0] ?? "Contact"}
                opportunityId={opp.id}
                opportunityLabel={`${opp.customer} — ${opp.title}`}
              />

              {/* Deal Velocity */}
              <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
                <h3 className="mb-4 text-sm font-medium text-foreground">Deal Velocity</h3>
                <div className="space-y-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-2xl font-bold tabular-nums text-foreground">8 days</p>
                      <p className="text-xs text-[var(--neutral-500)]">In current stage</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm tabular-nums text-[var(--neutral-700)]">12 days</p>
                      <p className="text-xs text-[var(--neutral-500)]">Avg. for this stage</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[var(--mw-green)]" />
                    <span className="text-xs font-medium text-[var(--mw-green)]">Faster than average</span>
                  </div>
                  {/* Stage progression */}
                  <div className="pt-2 border-t border-[var(--neutral-100)]">
                    <p className="text-xs text-[var(--neutral-500)] mb-3">Stage progression</p>
                    <div className="flex items-center gap-1">
                      {[
                        { label: "New", days: "2d", done: true },
                        { label: "Qualified", days: "3d", done: true },
                        { label: "Proposal", days: "8d", current: true },
                      ].map((s, i) => (
                        <React.Fragment key={s.label}>
                          {i > 0 && <div className="h-px w-4 bg-[var(--neutral-300)]" />}
                          <div
                            className={cn(
                              "flex flex-col items-center gap-1 px-3 py-2 rounded-[var(--shape-md)] text-xs",
                              s.current
                                ? "bg-[var(--mw-blue)]/10 text-[var(--mw-blue)] font-medium"
                                : s.done
                                  ? "bg-[var(--neutral-50)] text-[var(--neutral-700)]"
                                  : "text-[var(--neutral-400)]"
                            )}
                          >
                            <span>{s.label}</span>
                            <span className="tabular-nums">{s.days}</span>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* 3. Customer Engagement Score */}
            <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-foreground">Customer Engagement Score</h3>
                <span className="text-xs font-medium text-[var(--mw-green)] flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" /> 15% vs last month
                </span>
              </div>
              <div className="flex items-center gap-4 mb-5">
                <div className="text-3xl font-bold tabular-nums text-foreground">8.4<span className="text-lg text-[var(--neutral-400)]"> / 10</span></div>
                <div className="flex-1 h-2 rounded-full bg-[var(--neutral-100)]">
                  <div className="h-full rounded-full" style={{ width: "84%", backgroundColor: getChartScaleColour(84) }} />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Email opens", value: "12", icon: <Mail className="h-4 w-4 text-[var(--neutral-500)]" /> },
                  { label: "Avg. response time", value: "2.4h", icon: <MessageSquare className="h-4 w-4 text-[var(--neutral-500)]" /> },
                  { label: "Meetings", value: "3", icon: <Users className="h-4 w-4 text-[var(--neutral-500)]" /> },
                  { label: "Documents viewed", value: "7", icon: <FileText className="h-4 w-4 text-[var(--neutral-500)]" /> },
                ].map((m) => (
                  <div key={m.label} className="flex items-center gap-3 rounded-[var(--shape-md)] bg-[var(--neutral-50)] px-4 py-3">
                    {m.icon}
                    <div>
                      <p className="text-lg font-medium tabular-nums text-foreground">{m.value}</p>
                      <p className="text-xs text-[var(--neutral-500)]">{m.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* 4. Competitor Intelligence */}
            <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
              <h3 className="mb-1 text-sm font-medium text-foreground">Competitor Intelligence</h3>
              <p className="mb-4 text-xs text-[var(--neutral-500)]">Based on customer communication patterns and market data</p>
              <div className="space-y-3">
                {[
                  {
                    name: "Competitor A",
                    likelihood: "likely",
                    color: "var(--mw-error)",
                    detail: "Similar quote timeline detected. Customer may be comparing sheet metal pricing.",
                  },
                  {
                    name: "Competitor B",
                    likelihood: "possible",
                    color: "var(--mw-yellow-400)",
                    detail: "Customer contacted alternative supplier for powder coating — may affect scope.",
                  },
                ].map((c) => (
                  <div key={c.name} className="rounded-[var(--shape-md)] border border-[var(--neutral-100)] p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">{c.name}</span>
                      <Badge variant="outline" className="text-[10px]" style={{ borderColor: c.color, color: c.color }}>
                        {c.likelihood}
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--neutral-600)]">{c.detail}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* 5. Similar Deals */}
            <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
              <h3 className="mb-4 text-sm font-medium text-foreground">Similar Deals</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Title</TableHead>
                    <TableHead className="text-xs">Customer</TableHead>
                    <TableHead className="text-xs text-right">Value</TableHead>
                    <TableHead className="text-xs">Result</TableHead>
                    <TableHead className="text-xs text-right">Similarity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { title: "Server Rack Assembly", cust: "TechCorp", value: "$38,000", result: "Won", sim: "92%", won: true },
                    { title: "Data Centre Panels", cust: "Telstra", value: "$55,000", result: "Won", sim: "85%", won: true },
                    { title: "Equipment Enclosures", cust: "BlueScope", value: "$42,000", result: "Lost", sim: "78%", won: false },
                  ].map((d) => (
                    <TableRow key={d.title}>
                      <TableCell className="text-sm font-medium text-foreground">{d.title}</TableCell>
                      <TableCell className="text-sm text-[var(--neutral-700)]">{d.cust}</TableCell>
                      <TableCell className="text-sm tabular-nums text-right text-[var(--neutral-700)]">{d.value}</TableCell>
                      <TableCell>
                        <span className={cn("inline-flex items-center gap-1 text-xs font-medium", d.won ? "text-[var(--mw-green)]" : "text-[var(--mw-error)]")}>
                          {d.won ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                          {d.result}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm tabular-nums text-right text-[var(--neutral-700)]">{d.sim}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <JobWorkspaceLayout
      breadcrumbs={[
        { label: "Sell", href: "/sell" },
        { label: "Opportunities", href: "/sell/opportunities" },
        { label: opp.title },
      ]}
      title={opp.title}
      subtitle={
        <>
          <span className="inline-flex items-center rounded-full bg-[var(--mw-mirage)] px-3 py-0.5 text-xs font-medium text-white tabular-nums">{opp.id.toUpperCase()}</span>
          <span>{opp.customer}</span>
          <span className="tabular-nums">${opp.value.toLocaleString()}</span>
        </>
      }
      metaRow={
        <>
          <Badge
            className={cn(
              "rounded-full px-2 py-0.5 text-xs capitalize",
              priorityCfg.className,
            )}
          >
            {priorityCfg.label}
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full border-[var(--border)] capitalize"
          >
            {opp.stage}
          </Badge>
        </>
      }
      headerActions={
        <>
          <Button variant="outline" className="h-12 border-[var(--border)]" asChild>
            <Link to="/sell/opportunities">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button variant="outline" className="h-12 border-[var(--border)]">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button
            className="h-12 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
            onClick={() => navigate("/sell/quotes/new")}
          >
            <FileText className="mr-2 h-4 w-4" />
            New quote
          </Button>
          <Button
            className="h-12 bg-[var(--mw-mirage)] text-white hover:bg-[var(--mw-mirage)]/90"
            onClick={() => navigate("/sell/orders")}
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Convert to Sales Order
          </Button>
        </>
      }
      tabs={tabConfig}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      renderTabPanel={renderTabPanel}
    />
  );
}

