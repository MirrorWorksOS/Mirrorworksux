/**
 * Sell opportunity — full-page workspace using shared JobWorkspaceLayout.
 * Kanban navigates here via /sell/opportunities/:id
 */

import React, { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
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
import { GanttChart, type GanttTask } from "@/components/shared/schedule/GanttChart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MwDataTable, type MwColumnDef } from "@/components/shared/data/MwDataTable";
import { cn } from "@/components/ui/utils";
import { getChartScaleColour } from "@/components/shared/charts/chart-theme";
import { DatePicker } from "@/components/shared/datetime/DatePicker";
import { LogActivityModal } from "@/components/shared/activities/LogActivityModal";
import { EditableCard } from "@/components/shared/forms/EditableCard";
import { EditField, Field } from "@/components/shared/forms/EditField";
import type { Opportunity } from "./sell-opportunity-types";
import { opportunities as mockOpportunities, customers as mockCustomersData, quotes as mockQuotesData, sellActivities } from '@/services';
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

// Blank-form factory for create-mode rendering (`/sell/opportunities/new`).
// In mock mode the new id is local-only; the future backend mutation will
// replace this with the real generated id.
const createBlankOpportunity = (defaults?: Partial<Opportunity>): Opportunity => ({
  id: `new-${Date.now()}`,
  title: '',
  customer: '',
  value: 0,
  expectedClose: '',
  assignedTo: 'YOU',
  priority: 'medium',
  stage: 'new',
  probabilityPercent: 25,
  tags: [],
  ...defaults,
});

const STAGES: { key: Stage; label: string; color: string }[] = [
  { key: "new", label: "New", color: "var(--neutral-500)" },
  { key: "qualified", label: "Qualified", color: "var(--mw-amber)" },
  { key: "proposal", label: "Proposal", color: "var(--mw-amber)" },
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
const MOCK_ACTIVITIES: (TimelineEvent & { dueDate: string })[] = sellActivities.slice(0, 4).map((a, i) => ({
  id: a.id,
  title: a.type.charAt(0).toUpperCase() + a.type.slice(1),
  description: a.description,
  timestamp: i === 0 ? '2h ago' : i === 1 ? '1d ago' : i === 2 ? '3d ago' : 'Tomorrow',
  status: a.status === 'completed' ? ('completed' as const) : ('upcoming' as const),
  dueDate: a.dueDate,
}));

// Build quotes list from centralized data
const MOCK_QUOTES = mockQuotesData.slice(0, 2).map((q) => ({
  id: q.id,
  ref: q.ref,
  date: new Date(q.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
  value: q.value,
  status: q.status.charAt(0).toUpperCase() + q.status.slice(1),
}));
type QuoteRow = (typeof MOCK_QUOTES)[number];

type QuickQuoteRow = { product: string; qty: number; salePrice: number };
const MOCK_QUICK_QUOTE_ROWS: QuickQuoteRow[] = [
  { product: "PROD-SR-001", qty: 4, salePrice: 5120 },
  { product: "LABOUR-FAB", qty: 12, salePrice: 1140 },
];

type SimilarDealRow = {
  title: string;
  customer: string;
  value: string;
  result: "Won" | "Lost";
  similarity: string;
  won: boolean;
};
const MOCK_SIMILAR_DEALS: SimilarDealRow[] = [
  { title: "Server Rack Assembly", customer: "TechCorp", value: "$38,000", result: "Won", similarity: "92%", won: true },
  { title: "Data Centre Panels", customer: "Telstra", value: "$55,000", result: "Won", similarity: "85%", won: true },
  { title: "Equipment Enclosures", customer: "BlueScope", value: "$42,000", result: "Lost", similarity: "78%", won: false },
];

/** Sell opportunity tab ids — passed to JobWorkspaceLayout. */
const DEFAULT_SELL_OPPORTUNITY_TABS: JobWorkspaceTabConfig[] = [
  { id: "overview", label: "Overview" },
  { id: "quotes", label: "Quotes" },
  { id: "activities", label: "Activities" },
  { id: "intelligence", label: "MirrorWorks Agent" },
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
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [logActivityOpen, setLogActivityOpen] = useState(false);

  const isNew = !id || id === 'new';
  const stageParam = searchParams.get('stage') as Stage | null;
  const base = isNew
    ? createBlankOpportunity(stageParam ? { stage: stageParam } : undefined)
    : (id ? MOCK_BY_ID[id] : undefined);
  const [opp, setOpp] = useState<Opportunity | null>(base ?? null);
  const [draft, setDraft] = useState<Opportunity | null>(base ?? null);
  const [description, setDescription] = useState<string>(
    base ? `Fabrication scope aligned with ${base.customer} technical pack. Dimensional tolerances per drawing Rev C.` : '',
  );
  const [descriptionDraft, setDescriptionDraft] = useState<string>(description);

  React.useEffect(() => {
    let next: Opportunity | null;
    if (isNew) {
      next = createBlankOpportunity(stageParam ? { stage: stageParam } : undefined);
    } else if (id && MOCK_BY_ID[id]) {
      next = MOCK_BY_ID[id];
    } else {
      next = null;
    }
    setOpp(next);
    setDraft(next);
    if (next) {
      const desc = `Fabrication scope aligned with ${next.customer} technical pack. Dimensional tolerances per drawing Rev C.`;
      setDescription(desc);
      setDescriptionDraft(desc);
    }
  }, [id, isNew, stageParam]);

  const handleSave = () => {
    if (!opp) return;
    // TODO(backend): isNew ? opportunities.create(opp) : opportunities.update(opp.id, opp)
    if (isNew) {
      toast.success('Opportunity created');
      navigate(`/sell/opportunities/${opp.id}`, { replace: true });
    } else {
      toast.success('Opportunity saved');
    }
  };

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
              <EditableCard
                title="Opportunity details"
                subtitle="Stage, revenue, and customer context"
                headerExtra={
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-[var(--mw-mirage)] text-xs text-white">
                      {opp.assignedTo}
                    </AvatarFallback>
                  </Avatar>
                }
                onSave={() => {
                  if (draft) setOpp(draft);
                  setDescription(descriptionDraft);
                }}
                onCancel={() => {
                  setDraft(opp);
                  setDescriptionDraft(description);
                }}
                successMessage="Opportunity details saved"
              >
                {({ mode }) => (
                  <>
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

                    {mode === 'read' ? (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Expected revenue" value={`$${opp.value.toLocaleString()}`} mono />
                        <Field
                          label="Probability (%)"
                          value={opp.probabilityPercent != null ? `${opp.probabilityPercent}%` : '—'}
                          mono
                        />
                        <Field label="Customer" value={opp.customer} />
                        <Field
                          label="Expected close"
                          value={
                            opp.expectedClose
                              ? new Date(opp.expectedClose).toLocaleDateString('en-AU', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'
                          }
                        />
                        <Field className="sm:col-span-2" label="Email" value={customer.email} />
                        <Field className="sm:col-span-2" label="Address" value={customer.address} />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <EditField
                          label="Expected revenue"
                          value={String(draft?.value ?? 0)}
                          onChange={(v) =>
                            setDraft((d) => (d ? { ...d, value: Number(v) || 0 } : d))
                          }
                          type="number"
                          mono
                          prefix="$"
                        />
                        <EditField
                          label="Probability (%)"
                          value={
                            draft?.probabilityPercent != null
                              ? String(draft.probabilityPercent)
                              : ''
                          }
                          onChange={(v) =>
                            setDraft((d) =>
                              d
                                ? {
                                    ...d,
                                    probabilityPercent:
                                      v === '' ? undefined : Math.min(100, Math.max(0, Number(v))),
                                  }
                                : d,
                            )
                          }
                          type="number"
                          mono
                          placeholder="0–100"
                        />
                        <EditField
                          label="Customer"
                          value={draft?.customer ?? ''}
                          onChange={(v) => setDraft((d) => (d ? { ...d, customer: v } : d))}
                        />
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[var(--neutral-500)]">
                            Expected close
                          </label>
                          <DatePicker
                            value={draft?.expectedClose ? new Date(draft.expectedClose) : undefined}
                            onChange={(d) =>
                              setDraft((cur) =>
                                cur
                                  ? {
                                      ...cur,
                                      expectedClose: d ? d.toISOString().slice(0, 10) : '',
                                    }
                                  : cur,
                              )
                            }
                            placeholder="Select close date"
                          />
                        </div>
                        <EditField
                          className="sm:col-span-2"
                          label="Email"
                          value={customer.email}
                          onChange={() => {}}
                          disabled
                        />
                        <EditField
                          className="sm:col-span-2"
                          label="Address"
                          value={customer.address}
                          onChange={() => {}}
                          disabled
                        />
                      </div>
                    )}

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
                      {mode === 'read' ? (
                        <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                          {description || '—'}
                        </p>
                      ) : (
                        <Textarea
                          className="mt-1 min-h-[120px] border-[var(--border)] text-sm"
                          value={descriptionDraft}
                          onChange={(e) => setDescriptionDraft(e.target.value)}
                        />
                      )}
                    </div>
                  </>
                )}
              </EditableCard>

              <Card className="p-6">
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
                <MwDataTable<QuickQuoteRow>
                  columns={[
                    {
                      key: "product",
                      header: "Product",
                      cell: (r) => <span className="tabular-nums">{r.product}</span>,
                    },
                    {
                      key: "qty",
                      header: "Qty",
                      headerClassName: "text-right",
                      cell: (r) => <span className="tabular-nums">{r.qty}</span>,
                      className: "text-right",
                    },
                    {
                      key: "salePrice",
                      header: "Sale price",
                      headerClassName: "text-right",
                      cell: (r) => (
                        <span className="font-medium tabular-nums">
                          ${r.salePrice.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                        </span>
                      ),
                      className: "text-right",
                    },
                  ]}
                  data={MOCK_QUICK_QUOTE_ROWS}
                  keyExtractor={(r) => r.product}
                  className="border-0 shadow-none rounded-none"
                />
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
              <Card className="p-6">
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
                <div className="mb-4 rounded-md border border-[var(--border)] bg-[var(--neutral-50)] p-3 text-center text-xs text-[var(--neutral-500)]">
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
                  onClick={() => setLogActivityOpen(true)}
                >
                  Log activity
                </Button>
              </Card>

              <Card className="p-6">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-medium text-foreground">
                    MirrorWorks Agent
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

      case "quotes": {
        const quoteColumns: MwColumnDef<QuoteRow>[] = [
          {
            key: "ref",
            header: "Reference",
            cell: (q) => (
              <span className="font-medium tabular-nums text-[var(--mw-info)]">{q.ref}</span>
            ),
          },
          {
            key: "date",
            header: "Date",
            cell: (q) => <span className="text-[var(--neutral-600)]">{q.date}</span>,
          },
          {
            key: "value",
            header: "Value",
            headerClassName: "text-right",
            cell: (q) => (
              <span className="font-medium tabular-nums">${q.value.toLocaleString()}</span>
            ),
            className: "text-right",
          },
          {
            key: "status",
            header: "Status",
            cell: (q) => (
              <Badge className="border-0 bg-[var(--neutral-100)] text-foreground text-xs">
                {q.status}
              </Badge>
            ),
          },
        ];

        return (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
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
            <MwDataTable<QuoteRow>
              columns={quoteColumns}
              data={MOCK_QUOTES}
              keyExtractor={(q) => q.id}
              striped
              onRowClick={(q) => navigate(`/sell/quotes/${q.id}`)}
            />
          </div>
        );
      }

      case "activities":
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-[var(--neutral-500)]">
                Assign activities to a team member or a group (e.g. Sales,
                Estimating). Prototype data is static.
              </p>
              <Button
                className="bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)] h-12"
                onClick={() => setLogActivityOpen(true)}
              >
                New activity
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MOCK_ACTIVITIES.map((ev) => (
                <Card
                  key={ev.id}
                  className="border border-[var(--neutral-200)] bg-card p-4 shadow-xs rounded-lg"
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
            <Card className="p-6">
              <h3 className="mb-4 text-sm font-medium text-foreground">
                Activity log
              </h3>
              <TimelineView events={MOCK_ACTIVITIES} />
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-foreground">Activity timeline</h3>
                <p className="text-xs text-[var(--neutral-500)]">
                  Mini gantt of scheduled activities — click a bar to log against this opportunity
                </p>
              </div>
              {(() => {
                const ganttTasks: GanttTask[] = MOCK_ACTIVITIES.map((a) => {
                  const due = new Date(a.dueDate);
                  return {
                    id: a.id,
                    label: `${a.title} — ${a.description}`,
                    start: due,
                    end: due,
                    progress: a.status === 'completed' ? 100 : 0,
                  };
                });
                const dates = ganttTasks.map((t) => t.start.getTime());
                const minTime = Math.min(...dates);
                const maxTime = Math.max(...dates);
                const start = new Date(minTime - 1000 * 60 * 60 * 24);
                const end = new Date(maxTime + 1000 * 60 * 60 * 24);
                return (
                  <GanttChart
                    tasks={ganttTasks}
                    startDate={start}
                    endDate={end}
                    onTaskClick={() => setLogActivityOpen(true)}
                  />
                );
              })()}
            </Card>
          </div>
        );

      case "intelligence":
        return (
          <div className="space-y-6">
            <AIFeed module="sell" initialCount={3} items={agentFeedItems ?? undefined} />

            {/* AI top-line signal */}
            <AIInsightCard title="MirrorWorks Agent">
              Win probability is <strong className="text-foreground">68%</strong> based on 142 similar fabrication opportunities. Next best action: call {customer.contact.split(" ")[0]} — quote engagement is high.
            </AIInsightCard>

            {/* 1. Win Probability Card */}
            <Card className="p-6">
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
              <Card className="p-6">
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
                              "flex flex-col items-center gap-1 px-3 py-2 rounded-md text-xs",
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
            <Card className="p-6">
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
                  <div key={m.label} className="flex items-center gap-3 rounded-md bg-[var(--neutral-50)] px-4 py-3">
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
            <Card className="p-6">
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
                  <div key={c.name} className="rounded-md border border-[var(--neutral-100)] p-4">
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
            <Card className="p-6">
              <h3 className="mb-4 text-sm font-medium text-foreground">Similar Deals</h3>
              <MwDataTable<SimilarDealRow>
                columns={[
                  {
                    key: "title",
                    header: "Title",
                    cell: (d) => <span className="font-medium text-foreground">{d.title}</span>,
                  },
                  {
                    key: "customer",
                    header: "Customer",
                    cell: (d) => <span className="text-[var(--neutral-700)]">{d.customer}</span>,
                  },
                  {
                    key: "value",
                    header: "Value",
                    headerClassName: "text-right",
                    cell: (d) => (
                      <span className="tabular-nums text-[var(--neutral-700)]">{d.value}</span>
                    ),
                    className: "text-right",
                  },
                  {
                    key: "result",
                    header: "Result",
                    cell: (d) => (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-medium",
                          d.won ? "text-[var(--mw-green)]" : "text-[var(--mw-error)]",
                        )}
                      >
                        {d.won ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        {d.result}
                      </span>
                    ),
                  },
                  {
                    key: "similarity",
                    header: "Similarity",
                    headerClassName: "text-right",
                    cell: (d) => (
                      <span className="tabular-nums text-[var(--neutral-700)]">{d.similarity}</span>
                    ),
                    className: "text-right",
                  },
                ]}
                data={MOCK_SIMILAR_DEALS}
                keyExtractor={(d) => d.title}
                className="border-0 shadow-none rounded-none"
              />
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
        { label: isNew ? 'New' : opp.title },
      ]}
      title={isNew ? 'New Opportunity' : opp.title}
      subtitle={
        isNew ? (
          <span>Fill out the details below and click Save to create.</span>
        ) : (
          <>
            <span className="inline-flex items-center rounded-full bg-[var(--mw-mirage)] px-3 py-0.5 text-xs font-medium text-white tabular-nums">{opp.id.toUpperCase()}</span>
            <span>{opp.customer}</span>
            <span className="tabular-nums">${opp.value.toLocaleString()}</span>
          </>
        )
      }
      metaRow={
        <>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize transition-colors hover:opacity-90",
                  priorityCfg.className,
                )}
                aria-label="Change priority"
              >
                {priorityCfg.label}
                <ChevronDown className="h-3 w-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-44 p-1.5">
              <div className="flex flex-col gap-0.5">
                {(['urgent', 'high', 'medium', 'low'] as Opportunity['priority'][]).map((p) => {
                  const cfg = PRIORITY_BADGE[p];
                  const active = p === opp.priority;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setOpp((o) => (o ? { ...o, priority: p } : o));
                        setDraft((d) => (d ? { ...d, priority: p } : d));
                        toast.success('Priority updated');
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs hover:bg-[var(--neutral-50)]",
                        active && "bg-[var(--neutral-50)]",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                          cfg.className,
                        )}
                      >
                        {cfg.label}
                      </span>
                      {active && <CheckCircle2 className="h-3.5 w-3.5 text-[var(--mw-green)]" />}
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
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
          <Button variant="outline" className="h-12 border-[var(--border)]" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button
            className="h-12 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
            onClick={() => {
              const params = new URLSearchParams({ opportunityId: opp.id });
              if (opp.customer) params.set('customer', opp.customer);
              navigate(`/sell/quotes/new?${params.toString()}`);
            }}
            disabled={isNew}
          >
            <FileText className="mr-2 h-4 w-4" />
            New quote
          </Button>
          <Button
            className="h-12 bg-[var(--mw-mirage)] text-white hover:bg-[var(--mw-mirage)]/90"
            onClick={() => {
              // TODO(backend): opportunities.convertToOrder(opp.id) — server creates the order and returns its id
              navigate(`/sell/orders/new?opportunityId=${opp.id}`);
            }}
            disabled={isNew}
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Convert to Sales Order
          </Button>
        </>
      }
      tabs={tabConfig}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      renderTabPanel={(tab) => (
        <>
          {renderTabPanel(tab)}
          <LogActivityModal
            open={logActivityOpen}
            onOpenChange={setLogActivityOpen}
            entity={{
              kind: "opportunity",
              id: opp.id,
              label: `${opp.customer} — ${opp.title}`,
            }}
          />
        </>
      )}
    />
  );
}

