/**
 * Sell opportunity — full-page workspace using shared JobWorkspaceLayout.
 * Kanban navigates here via /sell/opportunities/:id
 */

import React, { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import {
  ArrowLeft,
  FileText,
  Mail,
  MessageSquare,
  Save,
  User,
  Users,
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
import type { Opportunity } from "./SellOpportunityDetail";

type Stage = Opportunity["stage"];

const MOCK_BY_ID: Record<string, Opportunity> = {
  "1": {
    id: "1",
    title: "Server Rack Fabrication",
    customer: "TechCorp Industries",
    value: 45000,
    expectedClose: "2026-04-15",
    assignedTo: "SC",
    priority: "high",
    stage: "proposal",
  },
  "2": {
    id: "2",
    title: "Structural Steel Package",
    customer: "BHP Contractors",
    value: 128000,
    expectedClose: "2026-04-30",
    assignedTo: "MT",
    priority: "urgent",
    stage: "negotiation",
  },
  "3": {
    id: "3",
    title: "Custom Brackets (50 units)",
    customer: "Pacific Fab",
    value: 8500,
    expectedClose: "2026-03-25",
    assignedTo: "EW",
    priority: "medium",
    stage: "qualified",
  },
  "4": {
    id: "4",
    title: "Rail Platform Components",
    customer: "Sydney Rail Corp",
    value: 67000,
    expectedClose: "2026-05-10",
    assignedTo: "DL",
    priority: "high",
    stage: "proposal",
  },
  "5": {
    id: "5",
    title: "Machine Guards",
    customer: "Kemppi Australia",
    value: 12000,
    expectedClose: "2026-03-30",
    assignedTo: "SC",
    priority: "low",
    stage: "new",
  },
  "6": {
    id: "6",
    title: "Aluminium Enclosures",
    customer: "Hunter Steel Co",
    value: 22000,
    expectedClose: "2026-04-05",
    assignedTo: "MT",
    priority: "medium",
    stage: "new",
  },
};

const STAGES: { key: Stage; label: string; color: string }[] = [
  { key: "new", label: "New", color: "var(--neutral-500)" },
  { key: "qualified", label: "Qualified", color: "var(--mw-info)" },
  { key: "proposal", label: "Proposal", color: "var(--mw-info)" },
  { key: "negotiation", label: "Negotiation", color: "var(--mw-warning)" },
  { key: "won", label: "Won", color: "var(--mw-success)" },
  { key: "lost", label: "Lost", color: "var(--mw-error)" },
];

const MOCK_CUSTOMER: Record<
  string,
  { contact: string; phone: string; email: string; address: string }
> = {
  "TechCorp Industries": {
    contact: "James Hartley",
    phone: "+61 2 9001 2345",
    email: "james@techcorp.com.au",
    address: "12 Tech Park Dr, Macquarie Park NSW",
  },
  "BHP Contractors": {
    contact: "Anika Patel",
    phone: "+61 7 3100 0982",
    email: "anika.p@bhp.com.au",
    address: "1 BHP Way, Brisbane QLD",
  },
  "Pacific Fab": {
    contact: "Dale Nguyen",
    phone: "+61 3 9422 1100",
    email: "dale@pacificfab.com.au",
    address: "44 Fabrication Rd, Dandenong VIC",
  },
  "Sydney Rail Corp": {
    contact: "Rebecca O'Brien",
    phone: "+61 2 8000 4400",
    email: "robrien@sydneyrail.gov.au",
    address: "130 Elizabeth St, Sydney NSW",
  },
  "Kemppi Australia": {
    contact: "Lars Knutsen",
    phone: "+61 2 9765 4321",
    email: "lars@kemppi.com.au",
    address: "22 Welding Ln, Seven Hills NSW",
  },
  "Hunter Steel Co": {
    contact: "Mark Thompson",
    phone: "+61 2 4000 1234",
    email: "mark@huntersteel.com.au",
    address: "88 Steel St, Newcastle NSW",
  },
};

const MOCK_ACTIVITIES: TimelineEvent[] = [
  {
    id: "a1",
    title: "Email",
    description: "Sent revised quote v2 — updated material costs (SC)",
    timestamp: "2h ago",
    status: "completed",
  },
  {
    id: "a2",
    title: "Phone call",
    description: "Discussed lead time concerns re: steel delivery (SC)",
    timestamp: "1d ago",
    status: "completed",
  },
  {
    id: "a3",
    title: "Meeting",
    description: "Site visit to review installation requirements (MT)",
    timestamp: "3d ago",
    status: "completed",
  },
  {
    id: "a4",
    title: "Follow-up",
    description: "Follow up on quote acceptance (SC)",
    timestamp: "Tomorrow",
    status: "upcoming",
  },
];

const MOCK_QUOTES = [
  {
    ref: "MW-Q-0055",
    date: "12 Mar 2026",
    value: 42000,
    status: "Sent",
  },
  { ref: "MW-Q-0048", date: "28 Feb 2026", value: 12500, status: "Draft" },
];

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
      "border-0 bg-[var(--mw-yellow-400)]/25 text-[var(--neutral-900)]",
    label: "High",
  },
  medium: {
    className: "border-0 bg-[var(--neutral-100)] text-[var(--neutral-900)]",
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

  const renderTabPanel = (tab: string) => {
    switch (tab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <div className="space-y-6">
              <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-medium text-[var(--neutral-900)]">
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
                          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-[var(--neutral-900)]">
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
                      Probability
                    </Label>
                    <Input
                      readOnly
                      className="mt-1 h-12 border-[var(--border)] tabular-nums"
                      defaultValue="50%"
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
                      readOnly
                      className="mt-1 h-12 border-[var(--border)]"
                      value={new Date(opp.expectedClose).toLocaleDateString(
                        "en-AU",
                        { day: "numeric", month: "short", year: "numeric" },
                      )}
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
                  <Label className="text-xs text-[var(--neutral-500)]">
                    Description
                  </Label>
                  <Textarea
                    className="mt-1 min-h-[120px] border-[var(--border)] text-sm"
                    defaultValue={`Fabrication scope aligned with ${opp.customer} technical pack. Dimensional tolerances per drawing Rev C.`}
                  />
                </div>
              </Card>

              <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-medium text-[var(--neutral-900)]">
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
                <Badge className="rounded-full border-0 bg-[var(--mw-yellow-400)]/30 text-[var(--neutral-900)]">
                  Hot
                </Badge>
                <Badge className="rounded-full border-0 bg-[var(--neutral-100)] text-[var(--neutral-900)]">
                  Fabrication
                </Badge>
              </div>
            </div>

            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-medium text-[var(--neutral-900)]">
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
                      <p className="font-medium text-[var(--neutral-900)]">
                        {ev.title}
                      </p>
                      <p className="text-xs text-[var(--neutral-500)]">
                        {ev.timestamp}
                      </p>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-4 w-full bg-[var(--mw-yellow-400)] text-[var(--neutral-900)] hover:bg-[var(--mw-yellow-500)] h-12"
                  onClick={() => setActiveTab("activities")}
                >
                  Log activity
                </Button>
              </Card>

              <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-medium text-[var(--neutral-900)]">
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
          <Card className="border border-[var(--neutral-200)] bg-white shadow-xs rounded-[var(--shape-lg)] overflow-hidden">
            <div className="border-b border-[var(--border)] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-base font-medium text-[var(--neutral-900)]">
                Quotes linked to this opportunity
              </h2>
              <Button
                className="bg-[var(--mw-yellow-400)] text-[var(--neutral-900)] hover:bg-[var(--mw-yellow-500)] h-12"
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
                  <TableRow key={q.ref} className="min-h-14">
                    <TableCell className="text-sm font-medium tabular-nums">
                      {q.ref}
                    </TableCell>
                    <TableCell className="text-sm text-[var(--neutral-600)]">
                      {q.date}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium tabular-nums">
                      ${q.value.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className="border-0 bg-[var(--neutral-100)] text-[var(--neutral-900)]">
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
              <Button className="bg-[var(--mw-yellow-400)] text-[var(--neutral-900)] hover:bg-[var(--mw-yellow-500)] h-12">
                New activity
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MOCK_ACTIVITIES.map((ev) => (
                <Card
                  key={ev.id}
                  className="border border-[var(--neutral-200)] bg-white p-4 shadow-xs rounded-[var(--shape-lg)]"
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
            <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
              <h3 className="mb-4 text-sm font-medium text-[var(--neutral-900)]">
                Activity log
              </h3>
              <TimelineView events={MOCK_ACTIVITIES} />
            </Card>
          </div>
        );

      case "intelligence":
        return (
          <div className="space-y-6">
            <AIInsightCard title="Win probability">
              Based on similar fabrication jobs:{" "}
              <strong className="text-[var(--neutral-900)]">68%</strong>. Next
              best action: confirm delivery window with the customer.
            </AIInsightCard>
            <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
              <h3 className="mb-4 text-sm font-medium text-[var(--neutral-900)]">
                Engagement
              </h3>
              <ul className="space-y-3 text-sm text-[var(--neutral-700)]">
                <li className="flex gap-2">
                  <MessageSquare className="h-4 w-4 shrink-0 text-[var(--neutral-500)]" />
                  Quote MW-Q-0055 opened — 2h ago
                </li>
                <li className="flex gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-[var(--neutral-500)]" />
                  Follow-up email sent — 1d ago
                </li>
              </ul>
            </Card>
            <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
              <h3 className="mb-4 text-sm font-medium text-[var(--neutral-900)]">
                Files
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between rounded-[var(--shape-md)] bg-[var(--neutral-50)] px-3 py-2">
                  <span className="flex items-center gap-2 text-[var(--neutral-900)]">
                    <FileText className="h-4 w-4 text-[var(--neutral-500)]" />
                    Drawing_Rev_C.dxf
                  </span>
                  <span className="text-xs text-[var(--neutral-500)] tabular-nums">
                    1.2 MB
                  </span>
                </li>
              </ul>
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
      subtitle={`OPP-${opp.id.padStart(4, "0")} · ${opp.customer} · $${opp.value.toLocaleString()}`}
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
            className="h-12 bg-[var(--mw-yellow-400)] text-[var(--neutral-900)] hover:bg-[var(--mw-yellow-500)]"
            onClick={() => navigate("/sell/quotes/new")}
          >
            <FileText className="mr-2 h-4 w-4" />
            New quote
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

