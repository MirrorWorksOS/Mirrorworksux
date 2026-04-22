import * as React from "react";
import {
  GripVertical,
  Activity,
  Target,
  Briefcase,
  Clock,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Filter,
  ArrowRight,
  BarChart3,
  Gauge,
  PieChart,
  HeartPulse,
  Trophy,
  CheckCircle,
  ListTodo,
  Sparkles,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { MW_TOOLTIP_STYLE, MW_RECHARTS_ANIMATION, MW_RECHARTS_ANIMATION_BAR, MW_CHART_COLOURS, MW_BAR_RADIUS_V, MW_BAR_RADIUS_H, MW_FILL } from "@/components/shared/charts/chart-theme";
import { mwChartPatternDefs } from "@/components/shared/charts/ChartPatternDefs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { KpiStatCard } from "@/components/shared/cards/KpiStatCard";
import { shopFloorLeaderboardItems } from "@/services/mock/data";
import type { WidgetConfig } from "./WidgetRegistry";
import { WIDGET_TEMPLATES } from "./WidgetRegistry";

/* ------------------------------------------------------------------ */
/*  Icon map – maps string names from the registry to Lucide icons     */
/* ------------------------------------------------------------------ */

const ICON_MAP: Record<string, LucideIcon> = {
  Activity,
  Target,
  Briefcase,
  Clock,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Filter,
  ArrowRight,
  BarChart3,
  Gauge,
  PieChart,
  HeartPulse,
  Trophy,
  CheckCircle,
  ListTodo,
  Sparkles,
};

export function resolveIcon(name: string): LucideIcon | undefined {
  return ICON_MAP[name];
}

/* ------------------------------------------------------------------ */
/*  Mock data helpers                                                   */
/* ------------------------------------------------------------------ */

const REVENUE_DATA = [
  { month: "Jan", actual: 42000, target: 45000 },
  { month: "Feb", actual: 48000, target: 45000 },
  { month: "Mar", actual: 51000, target: 50000 },
  { month: "Apr", actual: 47000, target: 50000 },
  { month: "May", actual: 56000, target: 55000 },
  { month: "Jun", actual: 61000, target: 58000 },
];

const FUNNEL_DATA = [
  { stage: "Lead", value: 120 },
  { stage: "Qualified", value: 85 },
  { stage: "Proposal", value: 52 },
  { stage: "Negotiation", value: 28 },
  { stage: "Closed", value: 18 },
];

const PIE_DATA = [
  { name: "Industrial", value: 40 },
  { name: "Commercial", value: 30 },
  { name: "Residential", value: 20 },
  { name: "Government", value: 10 },
];

const BAR_DATA = [
  { reason: "Price", won: 12, lost: 8 },
  { reason: "Timing", won: 9, lost: 5 },
  { reason: "Feature", won: 7, lost: 11 },
  { reason: "Support", won: 10, lost: 3 },
];

const QUOTE_CASH_DATA = [
  { step: "Quote", days: 3 },
  { step: "Order", days: 2 },
  { step: "Produce", days: 12 },
  { step: "Deliver", days: 4 },
  { step: "Payment", days: 14 },
];

/* ------------------------------------------------------------------ */
/*  WidgetRenderer – resolves a WidgetConfig to a visual component     */
/* ------------------------------------------------------------------ */

function WidgetRenderer({ widget }: { widget: WidgetConfig }) {
  const template = WIDGET_TEMPLATES.find((t) => t.type === widget.type);
  if (!template) {
    return (
      <p className="text-sm text-[var(--neutral-500)]">
        Unknown widget type: {widget.type}
      </p>
    );
  }

  switch (template.category) {
    case "kpi":
      return <KpiWidgetContent type={widget.type} />;
    case "chart":
      return <ChartWidgetContent type={widget.type} />;
    case "list":
      return <ListWidgetContent type={widget.type} />;
    case "ai":
      return <AiWidgetContent />;
    default:
      return null;
  }
}

/* -- KPI content --------------------------------------------------- */

function KpiWidgetContent({ type }: { type: string }) {
  const kpiData: Record<string, { label: string; value: string; hint: string; icon: LucideIcon }> = {
    "sales-performance-score": {
      label: "Sales Performance",
      value: "78",
      hint: "+5 pts vs last month",
      icon: Activity,
    },
    "quota-attainment": {
      label: "Quota Attainment",
      value: "84%",
      hint: "$420K of $500K target",
      icon: Target,
    },
    "active-jobs": {
      label: "Active Jobs",
      value: "37",
      hint: "12 due this week",
      icon: Briefcase,
    },
    "on-time-rate": {
      label: "On-Time Delivery",
      value: "94.2%",
      hint: "+1.8% vs last quarter",
      icon: Clock,
    },
    "open-pos": {
      label: "Open POs",
      value: "23",
      hint: "$187K total value",
      icon: ShoppingCart,
    },
    "cash-position": {
      label: "Cash Position",
      value: "$1.24M",
      hint: "30-day forecast: $1.18M",
      icon: DollarSign,
    },
    "oee-gauge": {
      label: "OEE",
      value: "81.3%",
      hint: "Availability 92% \u00b7 Performance 89% \u00b7 Quality 99%",
      icon: Gauge,
    },
  };

  const data = kpiData[type];
  if (!data) return null;

  return (
    <KpiStatCard
      label={data.label}
      value={data.value}
      icon={data.icon}
      hint={data.hint}
      layout="compact"
      className="border-0 p-0 shadow-none hover:shadow-none"
    />
  );
}

/* -- Chart content ------------------------------------------------- */

function ChartWidgetContent({ type }: { type: string }) {
  switch (type) {
    case "revenue-trend":
      return (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={REVENUE_DATA}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--neutral-300)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--neutral-300)" />
            <Tooltip contentStyle={MW_TOOLTIP_STYLE} />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="var(--mw-mirage)"
              fill="var(--mw-mirage)"
              fillOpacity={0.1}
              strokeWidth={2}
              {...MW_RECHARTS_ANIMATION}
            />
            <Area
              type="monotone"
              dataKey="target"
              stroke="var(--mw-yellow-400)"
              fill="var(--mw-yellow-400)"
              fillOpacity={0.05}
              strokeWidth={2}
              strokeDasharray="4 4"
              {...MW_RECHARTS_ANIMATION}
            />
          </AreaChart>
        </ResponsiveContainer>
      );

    case "pipeline-funnel":
      return (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={FUNNEL_DATA} layout="vertical">
            {mwChartPatternDefs()}
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--neutral-300)" />
            <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} stroke="var(--neutral-300)" width={80} />
            <Tooltip contentStyle={MW_TOOLTIP_STYLE} />
            <Bar dataKey="value" fill={MW_FILL.HATCH_DARK} radius={MW_BAR_RADIUS_H} {...MW_RECHARTS_ANIMATION_BAR} />
          </BarChart>
        </ResponsiveContainer>
      );

    case "win-loss":
      return (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={BAR_DATA}>
            {mwChartPatternDefs()}
            <XAxis dataKey="reason" tick={{ fontSize: 11 }} stroke="var(--neutral-300)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--neutral-300)" />
            <Tooltip contentStyle={MW_TOOLTIP_STYLE} />
            <Bar dataKey="won" fill={MW_FILL.HATCH_DARK} radius={MW_BAR_RADIUS_V} {...MW_RECHARTS_ANIMATION_BAR} />
            <Bar dataKey="lost" fill={MW_FILL.HATCH_NEUTRAL} radius={MW_BAR_RADIUS_V} {...MW_RECHARTS_ANIMATION_BAR} />
          </BarChart>
        </ResponsiveContainer>
      );

    case "customer-segmentation":
      return (
        <ResponsiveContainer width="100%" height={180}>
          <RechartsPie>
            <Pie
              data={PIE_DATA}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              dataKey="value"
              paddingAngle={2}
              {...MW_RECHARTS_ANIMATION}
            >
              {PIE_DATA.map((_, i) => (
                <Cell key={i} fill={MW_CHART_COLOURS[i % MW_CHART_COLOURS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={MW_TOOLTIP_STYLE} />
          </RechartsPie>
        </ResponsiveContainer>
      );

    case "quote-to-cash":
      return (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={QUOTE_CASH_DATA}>
            {mwChartPatternDefs()}
            <XAxis dataKey="step" tick={{ fontSize: 11 }} stroke="var(--neutral-300)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--neutral-300)" label={{ value: "Days", angle: -90, position: "insideLeft", style: { fontSize: 11 } }} />
            <Tooltip contentStyle={MW_TOOLTIP_STYLE} />
            <Bar dataKey="days" fill={MW_FILL.HATCH_YELLOW} radius={MW_BAR_RADIUS_V} {...MW_RECHARTS_ANIMATION_BAR} />
          </BarChart>
        </ResponsiveContainer>
      );

    default:
      return (
        <div className="flex h-[180px] items-center justify-center rounded-[var(--shape-lg)] bg-[var(--neutral-50)]">
          <p className="text-sm text-[var(--neutral-400)]">Chart preview</p>
        </div>
      );
  }
}

/* -- List content -------------------------------------------------- */

type ListItem = { label: string; meta: string };
type RankedListItem = { rank: number; label: string; meta: string };

const SIMPLE_LISTS: Record<string, { items: ListItem[] }> = {
  "pipeline-health": {
    items: [
      { label: "Weighted pipeline", meta: "$1.2M" },
      { label: "Stalled deals (>30d)", meta: "4 deals" },
      { label: "At-risk deals", meta: "2 deals ($280K)" },
      { label: "Avg deal velocity", meta: "22 days" },
    ],
  },
  leaderboard: {
    items: [
      { label: "Sarah Chen", meta: "$142K \u00b7 18 deals" },
      { label: "Marcus Rivera", meta: "$128K \u00b7 15 deals" },
      { label: "Aisha Patel", meta: "$115K \u00b7 21 deals" },
      { label: "James Wu", meta: "$98K \u00b7 12 deals" },
    ],
  },
  "approval-queue": {
    items: [
      { label: "PO-1247 \u2013 Steel supply", meta: "Pending \u00b7 2h ago" },
      { label: "QUO-892 \u2013 Handrail project", meta: "Pending \u00b7 5h ago" },
      { label: "INV-3310 \u2013 Credit note", meta: "Pending \u00b7 1d ago" },
    ],
  },
  "upcoming-tasks": {
    items: [
      { label: "Laser cutting \u2013 Job #4521", meta: "Due today" },
      { label: "QC inspection \u2013 Job #4518", meta: "Due tomorrow" },
      { label: "Powder coating \u2013 Job #4515", meta: "Due Wed" },
      { label: "Shipping prep \u2013 Job #4510", meta: "Due Thu" },
    ],
  },
};

const RANKED_LISTS: Record<string, { items: RankedListItem[] }> = {
  "shop-floor-leaderboard": {
    items: shopFloorLeaderboardItems.map((item, i) => ({
      rank: i + 1,
      ...item,
    })),
  },
};

function ListWidgetContent({ type }: { type: string }) {
  const rankedData = RANKED_LISTS[type];
  if (rankedData) {
    return (
      <ul className="space-y-3">
        {rankedData.items.map((item) => {
          const isFirst = item.rank === 1;
          const badgeClass = isFirst
            ? "text-[var(--mw-mirage)]"
            : item.rank <= 3
              ? "bg-[var(--neutral-200)] text-[var(--neutral-700)]"
              : "bg-transparent text-[var(--neutral-400)]";
          const textColorClass = isFirst
            ? "text-[var(--mw-mirage)]"
            : "text-foreground";
          const metaColorClass = isFirst
            ? "text-[var(--mw-mirage)]"
            : "text-[var(--neutral-500)]";

          return (
            <li
              key={item.rank}
              className={cn(
                "flex items-center gap-3 border-b border-[var(--neutral-100)] pb-2 last:border-0 last:pb-0",
                isFirst &&
                  "rounded-[var(--shape-md)] border-0 bg-[var(--mw-yellow-400)] px-2 py-1.5",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] tabular-nums font-medium",
                  badgeClass,
                )}
              >
                {isFirst ? (
                  <Trophy className="h-3 w-3" strokeWidth={2} aria-hidden />
                ) : (
                  `#${item.rank}`
                )}
              </span>
              <span className={cn("flex-1 truncate text-sm", textColorClass, isFirst && "font-medium")}>
                {item.label}
              </span>
              <span className={cn("shrink-0 text-xs tabular-nums font-medium", metaColorClass)}>
                {item.meta}
              </span>
            </li>
          );
        })}
      </ul>
    );
  }

  const data = SIMPLE_LISTS[type];
  if (!data) return null;

  return (
    <ul className="space-y-3">
      {data.items.map((item, i) => (
        <li
          key={i}
          className="flex items-center justify-between gap-4 border-b border-[var(--neutral-100)] pb-2 last:border-0 last:pb-0"
        >
          <span className="truncate text-sm text-foreground">
            {item.label}
          </span>
          <span className="shrink-0 text-xs text-[var(--neutral-500)]">
            {item.meta}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* -- AI content ---------------------------------------------------- */

function AiWidgetContent() {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 rounded-[var(--shape-lg)] bg-[var(--neutral-50)] p-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mw-yellow-400)]" />
        <p className="text-sm text-[var(--neutral-700)]">
          3 deals are stalled over 30 days. Consider scheduling follow-ups for
          Acme Corp ($85K), BuildRight ($62K), and MetalPro ($48K).
        </p>
      </div>
      <div className="flex items-start gap-3 rounded-[var(--shape-lg)] bg-[var(--neutral-50)] p-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mw-yellow-400)]" />
        <p className="text-sm text-[var(--neutral-700)]">
          On-time delivery improved 1.8% this quarter. Top contributor: reduced
          laser cutting queue time by 15%.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Size-to-column-span mapping                                        */
/* ------------------------------------------------------------------ */

const SIZE_SPAN: Record<WidgetConfig["size"], string> = {
  sm: "col-span-1",
  md: "col-span-1 lg:col-span-2",
  lg: "col-span-1 lg:col-span-3",
  xl: "col-span-1 lg:col-span-4",
};

/* ------------------------------------------------------------------ */
/*  DashboardWidgetGrid                                                */
/* ------------------------------------------------------------------ */

export interface DashboardWidgetGridProps {
  widgets: WidgetConfig[];
  onWidgetsChange: (widgets: WidgetConfig[]) => void;
  className?: string;
}

export function DashboardWidgetGrid({
  widgets,
  onWidgetsChange,
  className,
}: DashboardWidgetGridProps) {
  const [dragIdx, setDragIdx] = React.useState<number | null>(null);
  const [overIdx, setOverIdx] = React.useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIdx(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverIdx(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === targetIndex) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }

    const updated = [...widgets];
    const [moved] = updated.splice(dragIdx, 1);
    updated.splice(targetIndex, 0, moved);
    onWidgetsChange(updated);
    setDragIdx(null);
    setOverIdx(null);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setOverIdx(null);
  };

  const removeWidget = (id: string) => {
    onWidgetsChange(widgets.filter((w) => w.id !== id));
  };

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {widgets.map((widget, index) => {
        const template = WIDGET_TEMPLATES.find((t) => t.type === widget.type);
        const Icon = template ? resolveIcon(template.icon) : undefined;

        return (
          <Card
            key={widget.id}
            variant="flat"
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "p-4 transition-all duration-[var(--duration-medium1)] ease-[var(--ease-standard)]",
              SIZE_SPAN[widget.size],
              dragIdx === index && "opacity-[0.38]",
              overIdx === index && dragIdx !== index && "ring-2 ring-[var(--mw-yellow-400)]/50",
            )}
          >
            {/* Widget header with drag handle */}
            <div className="mb-3 flex items-center gap-2">
              <button
                type="button"
                className="cursor-grab touch-none text-[var(--neutral-400)] hover:text-[var(--neutral-600)] active:cursor-grabbing"
                aria-label="Drag to reorder"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              {Icon ? (
                <Icon className="h-4 w-4 text-[var(--neutral-500)]" strokeWidth={1.5} aria-hidden />
              ) : null}
              <h3 className="flex-1 truncate text-sm font-medium text-foreground">
                {widget.title}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-[var(--neutral-400)] hover:text-[var(--neutral-700)]"
                onClick={() => removeWidget(widget.id)}
                aria-label={`Remove ${widget.title}`}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Widget body */}
            <WidgetRenderer widget={widget} />
          </Card>
        );
      })}
    </div>
  );
}
