/**
 * Context-aware charts for home dashboard — animated donut + styled area (mock data).
 * Gradients and motion aligned with Recharts customization patterns.
 */

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MockUserContext, MockModuleKey } from "@/lib/mock-user-context";
import {
  MW_AXIS_TICK,
  MW_CARTESIAN_GRID,
  MW_CHART_COLOURS,
  MW_RECHARTS_ANIMATION,
  MW_TOOLTIP_STYLE,
} from "@/components/shared/charts/chart-theme";
import { cn } from "@/components/ui/utils";
import {
  dashboardSectionSubtitleClass,
  dashboardSectionTitleClass,
  mwHairlineBorder,
  mwPillYellowClass,
} from "@/lib/dashboard-ui";
import { AnimatedCount } from "@/components/shared/motion/AnimatedCount";

/**
 * Donut legend chips sit on solid MW yellow — avoid theme `foreground` / `muted-foreground`
 * (fails WCAG on #FFCF4B; dark mode can flip label colour to light on yellow).
 */
const CHART_LEGEND_ON_YELLOW_LABEL = "text-[var(--neutral-800)]";
/** Slightly softer than label; still ≥4.5:1 vs #FFCF4B at 12px */
const CHART_LEGEND_ON_YELLOW_VALUE = "text-[var(--neutral-700)]";

/**
 * Swatches on yellow pills: chart ramp uses light greys that disappear on yellow; yellow-on-yellow is invisible.
 */
function donutLegendSwatchClass(i: number): string {
  const n = i % MW_CHART_COLOURS.length;
  if (n === 0) {
    return "bg-[var(--mw-yellow-400)] ring-2 ring-[var(--mw-mirage)] ring-offset-0";
  }
  if (n === 2) {
    return "bg-[var(--neutral-700)]";
  }
  return "";
}

function donutLegendSwatchStyle(i: number): React.CSSProperties | undefined {
  const n = i % MW_CHART_COLOURS.length;
  if (n === 0 || n === 2) return undefined;
  return { backgroundColor: MW_CHART_COLOURS[n] };
}

type Row = { day: string; a: number; b?: number };

type DonutSeg = { name: string; value: number };

function mockDonut(primary: MockModuleKey): { segments: DonutSeg[]; centerLine: string } {
  switch (primary) {
    case "plan":
      return {
        segments: [
          { name: "On schedule", value: 68 },
          { name: "At risk", value: 22 },
          { name: "Held", value: 10 },
        ],
        centerLine: "On schedule",
      };
    case "ship":
      return {
        segments: [
          { name: "In transit", value: 74 },
          { name: "Exception", value: 18 },
          { name: "Pending pick", value: 8 },
        ],
        centerLine: "In transit",
      };
    case "sell":
      return {
        segments: [
          { name: "Qualified", value: 52 },
          { name: "Nurture", value: 33 },
          { name: "Stale", value: 15 },
        ],
        centerLine: "Pipeline mix",
      };
    default:
      return {
        segments: [
          { name: "Healthy", value: 71 },
          { name: "Watch", value: 21 },
          { name: "Action", value: 8 },
        ],
        centerLine: "Health",
      };
  }
}

function mockSeries(primary: MockModuleKey): {
  title: string;
  subtitle: string;
  data: Row[];
  keys: { key: keyof Row; label: string }[];
} {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  switch (primary) {
    case "plan":
      return {
        title: "Shop load vs schedule",
        subtitle: "Laser hours booked vs planned (mock)",
        data: days.map((day, i) => ({
          day,
          a: 62 + i * 3 + (i % 2) * 4,
          b: 70 + i * 2,
        })),
        keys: [
          { key: "a", label: "Actual load %" },
          { key: "b", label: "Schedule %" },
        ],
      };
    case "ship":
      return {
        title: "Shipment exceptions",
        subtitle: "Open carrier and SLA issues (7-day mock trend)",
        data: days.map((day, i) => ({
          day,
          a: Math.max(0, 5 - i + (i % 3)),
        })),
        keys: [{ key: "a", label: "Open exceptions" }],
      };
    case "sell":
      return {
        title: "Pipeline value",
        subtitle: "Weighted opportunities ($k, mock)",
        data: days.map((day, i) => ({
          day,
          a: 820 + i * 45 + (i % 2) * 30,
        })),
        keys: [{ key: "a", label: "$k weighted" }],
      };
    case "make":
      return {
        title: "MO completion",
        subtitle: "Units completed vs target (mock)",
        data: days.map((day, i) => ({
          day,
          a: 120 + i * 12,
          b: 140 + i * 8,
        })),
        keys: [
          { key: "a", label: "Completed" },
          { key: "b", label: "Target" },
        ],
      };
    case "book":
      return {
        title: "Invoice cycle time",
        subtitle: "Days sales outstanding trend (mock)",
        data: days.map((day, i) => ({
          day,
          a: 34 - i * 0.8 + (i % 2),
        })),
        keys: [{ key: "a", label: "DSO (days)" }],
      };
    case "buy":
      return {
        title: "Open PO lines",
        subtitle: "Awaiting receipt (mock)",
        data: days.map((day, i) => ({
          day,
          a: 28 + (i % 4) * 3,
        })),
        keys: [{ key: "a", label: "Open lines" }],
      };
    case "control":
    default:
      return {
        title: "Integration health",
        subtitle: "Bridge queue depth (mock)",
        data: days.map((day, i) => ({
          day,
          a: 4 + (i % 5),
        })),
        keys: [{ key: "a", label: "Queue items" }],
      };
  }
}

export interface WelcomeDashboardActivityChartProps {
  user: MockUserContext;
  className?: string;
}

export function WelcomeDashboardActivityChart({
  user,
  className,
}: WelcomeDashboardActivityChartProps) {
  const uid = React.useId().replace(/:/g, "");
  const cfg = mockSeries(user.primaryModule);
  const donut = mockDonut(user.primaryModule);
  const total = donut.segments.reduce((s, x) => s + x.value, 0);
  const leadPct = total ? Math.round((donut.segments[0].value / total) * 100) : 0;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-[var(--shape-2xl)] bg-card p-6 shadow-xs",
        mwHairlineBorder,
        "ring-1 ring-[#0A0A0A]/[0.04] transition-shadow duration-[var(--duration-long1)] ease-[var(--ease-emphasized-decelerate)] hover:shadow-md dark:ring-white/[0.06]",
        "dark:ring-[var(--mw-yellow-400)]/10",
        className,
      )}
      aria-labelledby="welcome-activity-chart-title"
    >
      <header className="border-b border-border pb-4">
        <h2 id="welcome-activity-chart-title" className={dashboardSectionTitleClass}>
          {cfg.title}
        </h2>
        <p className={cn(dashboardSectionSubtitleClass, "mt-2 max-w-none")}>
          {cfg.subtitle}
        </p>
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(200px,280px)_1fr] lg:items-start">
        <div className="relative mx-auto w-full max-w-[280px]">
          <div className="aspect-square w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {donut.segments.map((_, i) => (
                    <radialGradient
                      key={i}
                      id={`${uid}-donut-${i}`}
                      cx="45%"
                      cy="45%"
                      r="75%"
                    >
                      <stop
                        offset="0%"
                        stopColor={MW_CHART_COLOURS[i % MW_CHART_COLOURS.length]}
                        stopOpacity={1}
                      />
                      <stop
                        offset="100%"
                        stopColor={MW_CHART_COLOURS[i % MW_CHART_COLOURS.length]}
                        stopOpacity={0.55}
                      />
                    </radialGradient>
                  ))}
                </defs>
                <Tooltip
                  contentStyle={MW_TOOLTIP_STYLE}
                  formatter={(value: number, name: string) => [`${value}%`, name]}
                />
                <Pie
                  data={donut.segments}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="56%"
                  outerRadius="84%"
                  paddingAngle={2}
                  animationBegin={80}
                  animationDuration={900}
                  animationEasing="ease-out"
                >
                  {donut.segments.map((_, i) => (
                    <Cell
                      key={i}
                      fill={`url(#${uid}-donut-${i})`}
                      stroke="var(--card)"
                      strokeWidth={1}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pl-2 pr-2 text-center"
            aria-hidden
          >
            <span className="inline-flex items-baseline gap-0.5 text-4xl font-bold tabular-nums leading-none text-foreground sm:text-5xl">
              <AnimatedCount value={leadPct} className="tabular-nums" />
              <span aria-hidden>%</span>
            </span>
            <span className="mt-2 max-w-[9rem] text-xs font-light leading-tight text-muted-foreground">
              {donut.centerLine}
            </span>
          </div>
        </div>

        <div className="min-h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%" minHeight={220}>
            <AreaChart data={cfg.data} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
              <defs>
                <linearGradient id={`${uid}-areaA`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id={`${uid}-areaB`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid {...MW_CARTESIAN_GRID} />
              <XAxis dataKey="day" tick={MW_AXIS_TICK} tickLine={false} axisLine={false} />
              <YAxis tick={MW_AXIS_TICK} tickLine={false} axisLine={false} width={40} />
              <Tooltip
                contentStyle={MW_TOOLTIP_STYLE}
                labelStyle={{ fontWeight: 700, marginBottom: 6, fontFamily: "Roboto, sans-serif" }}
              />
              <Area
                type="monotone"
                dataKey="a"
                name={cfg.keys[0]?.label}
                stroke="var(--chart-1)"
                strokeWidth={1.5}
                fill={`url(#${uid}-areaA)`}
                activeDot={{ r: 4, strokeWidth: 1, stroke: "var(--card)", fill: "var(--chart-1)" }}
                {...MW_RECHARTS_ANIMATION}
              />
              {cfg.keys.length > 1 && cfg.data[0]?.b !== undefined ? (
                <Area
                  type="monotone"
                  dataKey="b"
                  name={cfg.keys[1]?.label}
                  stroke="var(--chart-2)"
                  strokeWidth={1.5}
                  fill={`url(#${uid}-areaB)`}
                  activeDot={{ r: 4, strokeWidth: 1, stroke: "var(--card)", fill: "var(--chart-2)" }}
                  {...MW_RECHARTS_ANIMATION}
                />
              ) : null}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <ul className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4 text-sm font-light">
        {donut.segments.map((s, i) => (
          <li
            key={s.name}
            className={cn("flex items-center gap-2 px-3 py-1.5", mwPillYellowClass)}
          >
            <span
              className={cn(
                "h-2.5 w-2.5 shrink-0 rounded-full",
                donutLegendSwatchClass(i),
              )}
              style={donutLegendSwatchStyle(i)}
              aria-hidden
            />
            <span className={cn("font-bold", CHART_LEGEND_ON_YELLOW_LABEL)}>{s.name}</span>
            <span className={cn("tabular-nums font-bold", CHART_LEGEND_ON_YELLOW_VALUE)}>
              {s.value}%
            </span>
          </li>
        ))}
        <li className="hidden h-8 w-px self-center bg-[var(--border)] sm:block" aria-hidden />
        {cfg.keys.map((k) => (
          <li
            key={k.label}
            className={cn(
              "flex items-center gap-2 rounded-full bg-card px-3 py-1.5",
              "border border-[var(--neutral-300)] dark:border-[var(--border)]",
            )}
          >
            <span
              className={cn(
                "h-2.5 w-2.5 shrink-0 rounded-full",
                k.key === "a" && "ring-2 ring-[var(--mw-mirage)] ring-offset-2 ring-offset-card",
              )}
              style={{
                backgroundColor:
                  k.key === "a" ? "var(--chart-1)" : "var(--chart-2)",
              }}
              aria-hidden
            />
            <span className="font-bold text-foreground">{k.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
