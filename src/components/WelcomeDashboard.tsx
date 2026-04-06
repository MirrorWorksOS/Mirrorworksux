/**
 * Persona-driven home — Agent bar, activity widgets, module tiles (Animate UI icons).
 */

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Gauge,
  Layers,
  Link2,
  ListTree,
  Package,
  Table2,
} from "lucide-react";
import { Card } from "./ui/card";
import { cn } from "@/components/ui/utils";
import { MwDataTable, type MwColumnDef } from "./shared/data/MwDataTable";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { motion } from "motion/react";
import { staggerItem } from "@/components/shared/motion/motion-variants";
import { PageShell } from "@/components/shared/layout/PageShell";
import { MODULE_ICONS, ICON_SIZES } from "@/lib/icon-config";
import {
  mockUserContext,
  type MockModuleKey,
  getUserInitials,
  greetingFirstName,
} from "@/lib/mock-user-context";
import {
  ContentCardSkeleton,
  KpiRowSkeleton,
} from "@/components/shared/feedback/CardSkeleton";
import { AgentBar } from "@/components/shared/ai/AgentBar";
import { WelcomeDashboardActivityChart } from "@/components/shared/charts/WelcomeDashboardActivityChart";
import { DashboardManagementBar } from "@/components/shared/motion-community/DashboardManagementBar";
import { DashboardFlipCard } from "@/components/shared/motion-community/DashboardFlipCard";
import { DashboardNotificationList } from "@/components/shared/motion-community/DashboardNotificationList";
import { DashboardPinList } from "@/components/shared/motion-community/DashboardPinList";
import { useTheme } from "@/components/theme-provider";
import { ThemeToggler } from "@/components/animate-ui/primitives/effects/theme-toggler";
import {
  dashboardSectionTitleClass,
  mwHairlineBorder,
  mwPillYellowClass,
} from "@/lib/dashboard-ui";
import { AnimatedCount } from "@/components/shared/motion/AnimatedCount";

type AnimatedIconComponent = React.ComponentType<{
  size?: number;
  animateOnHover?: boolean;
  className?: string;
}>;

const MODULE_META: {
  key: MockModuleKey;
  name: string;
  Icon: AnimatedIconComponent;
  path: string;
  description: string;
}[] = [
  {
    key: "sell",
    name: "Sell",
    Icon: MODULE_ICONS.sell,
    path: "/sell",
    description: "CRM, opportunities, orders, invoices",
  },
  {
    key: "plan",
    name: "Plan",
    Icon: MODULE_ICONS.plan,
    path: "/plan",
    description: "Production planning, scheduling, MRP",
  },
  {
    key: "make",
    name: "Make",
    Icon: MODULE_ICONS.make,
    path: "/make",
    description: "Manufacturing, shop floor, Andon",
  },
  {
    key: "ship",
    name: "Ship",
    Icon: MODULE_ICONS.ship,
    path: "/ship",
    description: "Logistics, tracking, fulfilment",
  },
  {
    key: "book",
    name: "Book",
    Icon: MODULE_ICONS.book,
    path: "/book",
    description: "Finance, budgets, job costs",
  },
  {
    key: "buy",
    name: "Buy",
    Icon: MODULE_ICONS.buy,
    path: "/buy",
    description: "Purchasing, suppliers, requisitions",
  },
  {
    key: "control",
    name: "Control",
    Icon: MODULE_ICONS.control,
    path: "/control",
    description: "MirrorWorks Bridge, factory designer, people, master data",
  },
];

function widgetVisible(
  id: string,
  user: typeof mockUserContext,
): boolean {
  if (id === "approvals" || id === "shortcuts") return true;
  if (id === "exceptions")
    return user.groups.includes("production") || user.groups.includes("shipments");
  if (id === "jobs") return user.groups.includes("production");
  if (id === "sync") return user.role.toLowerCase().includes("manager");
  return true;
}

function greetingLine(firstName: string): string {
  const h = new Date().getHours();
  if (h < 12) return `Good morning, ${firstName}`;
  if (h < 17) return `Good afternoon, ${firstName}`;
  return `Good evening, ${firstName}`;
}

interface RecentJob {
  id: string;
  customer: string;
  due: string;
}

const RECENT_JOBS: RecentJob[] = [
  { id: "JOB-2026-0012", customer: "TechCorp Industries", due: "Mar 28" },
  { id: "JOB-2026-0011", customer: "Pacific Fab", due: "Mar 26" },
];

const RECENT_JOB_COLUMNS: MwColumnDef<RecentJob>[] = [
  {
    key: "job",
    header: "Job",
    cell: (row) => (
      <span className="font-bold tabular-nums">{row.id}</span>
    ),
  },
  {
    key: "customer",
    header: "Customer",
    cell: (row) => (
      <span className="font-light text-foreground">{row.customer}</span>
    ),
  },
  {
    key: "due",
    header: "Due",
    cell: (row) => (
      <span className="font-light text-muted-foreground">{row.due}</span>
    ),
  },
];

/** Strip under header — short, scannable like Animate UI notification list demos */
const TOP_NOTIFICATION_ITEMS = [
  {
    id: "top-1",
    title: "Schedule publish succeeded",
    meta: "just now · Plan · 14 work centres updated",
    icon: "build" as const,
  },
  {
    id: "top-2",
    title: "Carrier manifest validated",
    meta: "3 min ago · Ship · SP270226001",
    icon: "ship" as const,
  },
  {
    id: "top-3",
    title: "Bridge delta sync finished",
    meta: "8 min ago · Control · 1,240 rows",
    icon: "sync" as const,
  },
];

const PIN_SHORTCUTS = [
  {
    id: "bridge",
    title: "MirrorWorks Bridge",
    subtitle: "Control · Imports and sync",
  },
  {
    id: "andon",
    title: "Andon board",
    subtitle: "Make · Shop floor",
  },
  {
    id: "quote",
    title: "New quote",
    subtitle: "Sell · Commercial",
  },
  {
    id: "schedule",
    title: "Production schedule",
    subtitle: "Plan · Capacity",
  },
  {
    id: "exceptions",
    title: "Shipment exceptions",
    subtitle: "Ship · SLA",
  },
];

export function WelcomeDashboard() {
  const [loading, setLoading] = useState(true);
  const user = mockUserContext;
  const { resolvedTheme, setTheme } = useTheme();

  const visibleModules = useMemo(
    () => MODULE_META.filter((m) => user.allowedModules.includes(m.key)),
    [user.allowedModules],
  );

  const firstName = greetingFirstName(user.displayName);
  const initials = getUserInitials(user.displayName);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <PageShell className="mx-auto max-w-[1400px] pt-6 sm:pt-8 lg:pt-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <Avatar className="h-10 w-10 sm:h-14 sm:w-14 shrink-0 border border-[var(--mw-yellow-400)] ring-1 ring-[var(--mw-yellow-400-20)]">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt="" />
              ) : null}
              <AvatarFallback className="bg-[var(--mw-mirage)] text-base font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-1 text-left">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--mw-mirage)] dark:text-[var(--neutral-900)] sm:text-3xl lg:text-4xl">
                {greetingLine(firstName)}
              </h1>
              <p className="text-base font-light text-muted-foreground sm:text-lg">
                {user.org} · {user.role}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 shadow-xs">
            <span className="text-sm font-bold text-foreground">
              Dark mode
            </span>
            <ThemeToggler
              resolvedTheme={resolvedTheme}
              setTheme={setTheme}
              direction="btt"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-[var(--mw-yellow-400-20)]"
              iconClassName="h-5 w-5 text-[var(--mw-mirage)] dark:text-[var(--mw-yellow-400)]"
            />
          </div>
        </header>

        <AgentBar user={user} />

        <WelcomeDashboardActivityChart user={user} />

        <motion.div variants={staggerItem}>
          <DashboardNotificationList placement="top" items={TOP_NOTIFICATION_ITEMS} />
        </motion.div>

        {loading ? (
          <div className="space-y-6">
            <KpiRowSkeleton count={3} />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <ContentCardSkeleton className="lg:col-span-5" lines={4} />
              <ContentCardSkeleton className="lg:col-span-4" lines={4} />
              <ContentCardSkeleton className="lg:col-span-3" lines={3} />
            </div>
          </div>
        ) : (
          <>
            <motion.div variants={staggerItem} className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Activity
                  className="h-8 w-8 shrink-0 text-[var(--mw-yellow-500)] dark:text-[var(--mw-yellow-400)]"
                  strokeWidth={2}
                  aria-hidden
                />
                <h2 className={dashboardSectionTitleClass}>Operations pulse</h2>
              </div>
              <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 md:grid-cols-12">
                <div className="md:col-span-4">
                  <DashboardManagementBar />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-8">
                  <DashboardFlipCard
                    frontIcon={ClipboardCheck}
                    frontTitle="Open approvals"
                    frontMetric="4"
                    frontHint="Quotes, expenses, and POs awaiting you."
                    backInsight="REQ-2026-0089 is the largest line this week. Clearing it unlocks Hunter Steel material for JOB-2026-0012."
                    backActionLabel="Open Buy"
                    backTo="/buy"
                  />
                  <DashboardFlipCard
                    frontIcon={AlertTriangle}
                    frontTitle="SLA exceptions"
                    frontMetric="3"
                    frontHint="Ship delays and QC holds in your scope."
                    backInsight="SP270226001 (Con-form) missed carrier pickup. JOB-2026-0012 is short Hunter Steel plate — requisition REQ-2026-0089 clears it."
                    backActionLabel="View Ship"
                    backTo="/ship"
                  />
                  <DashboardFlipCard
                    frontIcon={Package}
                    frontTitle="Picks due today"
                    frontMetric="12"
                    frontHint="Warehouse lines for outbound despatch."
                    backInsight="Six lines are for SP270226001; four are cold-room picks. Wave 2 releases at 14:00."
                    backActionLabel="Open Ship"
                    backTo="/ship"
                  />
                  <DashboardFlipCard
                    frontIcon={Gauge}
                    frontTitle="Laser utilisation"
                    frontMetric="87%"
                    frontHint="Booked hours vs available (mock)."
                    backInsight="Laser-01 is the bottleneck Thu–Fri. Plan suggests moving JOB-2026-0011 secondary ops to Laser-02."
                    backActionLabel="Open Plan"
                    backTo="/plan"
                  />
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 md:items-start">
              <motion.div
                variants={staggerItem}
                whileHover={{ y: -1 }}
                transition={{ duration: 0.55, ease: [0.2, 0, 0, 1] }}
              >
                <Card
                  className={cn(
                    "rounded-[var(--shape-xl)] bg-card p-6 shadow-xs transition-shadow duration-[var(--duration-long1)] ease-[var(--ease-emphasized-decelerate)] hover:shadow-md",
                    mwHairlineBorder,
                  )}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 h-7 w-7 shrink-0 text-[var(--mw-yellow-500)] dark:text-[var(--mw-yellow-400)]"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className={cn("inline-flex px-3 py-1 text-xs uppercase tracking-wider", mwPillYellowClass)}>
                        My open approvals
                      </p>
                      <p className="mt-3 text-4xl font-bold tabular-nums text-foreground">
                        <AnimatedCount value={4} />
                      </p>
                      <p className="mt-2 text-base font-light text-muted-foreground">
                        Quotes, expenses, POs
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
              <motion.div
                variants={staggerItem}
                whileHover={{ y: -1 }}
                transition={{ duration: 0.55, ease: [0.2, 0, 0, 1] }}
              >
                <Card
                  className={cn(
                    "rounded-[var(--shape-xl)] bg-card p-6 shadow-xs transition-shadow duration-[var(--duration-long1)] ease-[var(--ease-emphasized-decelerate)] hover:shadow-md",
                    mwHairlineBorder,
                  )}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className="mt-0.5 h-7 w-7 shrink-0 text-[var(--mw-warning)]"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className={cn("inline-flex px-3 py-1 text-xs uppercase tracking-wider", mwPillYellowClass)}>
                        Exceptions / SLA
                      </p>
                      <p className="mt-3 text-4xl font-bold tabular-nums text-foreground">
                        <AnimatedCount value={3} />
                      </p>
                      <p className="mt-2 text-base font-light text-muted-foreground">
                        Ship delays, QC holds
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
              <motion.div
                variants={staggerItem}
                whileHover={{ y: -1 }}
                transition={{ duration: 0.55, ease: [0.2, 0, 0, 1] }}
              >
                <Card
                  className={cn(
                    "rounded-[var(--shape-xl)] bg-card p-6 shadow-xs transition-shadow duration-[var(--duration-long1)] ease-[var(--ease-emphasized-decelerate)] hover:shadow-md",
                    mwHairlineBorder,
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Layers
                      className="mt-0.5 h-7 w-7 shrink-0 text-[var(--mw-mirage)] dark:text-[var(--neutral-200)]"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="inline-flex rounded-full border border-[var(--mw-mirage)]/12 bg-muted/60 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--mw-mirage)] dark:border-[var(--border)] dark:text-[var(--neutral-200)]">
                        Primary module
                      </p>
                      <p className="mt-3 text-2xl font-bold capitalize text-foreground">
                        {user.primaryModule}
                      </p>
                      <p className="mt-2 text-base font-light text-muted-foreground">
                        Suggested shortcuts below
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-12 lg:items-start">
              {widgetVisible("approvals", user) ? (
                <motion.div
                  variants={staggerItem}
                  className="md:col-span-1 lg:col-span-5"
                >
                  <motion.div
                    whileHover={{ y: -1 }}
                    transition={{ duration: 0.55, ease: [0.2, 0, 0, 1] }}
                  >
                  <Card className={cn("h-full rounded-[var(--shape-xl)] bg-card p-6 shadow-xs", mwHairlineBorder)}>
                    <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-4">
                      <div className="flex min-w-0 items-center gap-2">
                        <ClipboardList
                          className="h-7 w-7 shrink-0 text-[var(--mw-yellow-500)] dark:text-[var(--mw-yellow-400)]"
                          aria-hidden
                        />
                        <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                          My open approvals
                        </h2>
                      </div>
                      <Badge className={cn("rounded-full border-0 px-3 py-1 text-base tabular-nums", mwPillYellowClass)}>
                        <AnimatedCount value={4} />
                      </Badge>
                    </div>
                    <ul className="space-y-4 text-base">
                      <li className="flex justify-between gap-4 border-b border-border pb-3">
                        <span className="font-light text-muted-foreground">
                          REQ-2026-0089
                        </span>
                        <span className="tabular-nums font-bold text-foreground">
                          $8,500
                        </span>
                      </li>
                      <li className="flex justify-between gap-4 border-b border-border pb-3">
                        <span className="font-light text-muted-foreground">
                          EXP-2026-0142
                        </span>
                        <span className="tabular-nums font-bold text-foreground">
                          $1,250
                        </span>
                      </li>
                      <li className="flex justify-between gap-4">
                        <span className="font-light text-muted-foreground">
                          QT-2026-0142
                        </span>
                        <span className="tabular-nums font-bold text-foreground">
                          $12,500
                        </span>
                      </li>
                    </ul>
                    <Button
                      asChild
                      variant="outline"
                      className={cn(
                        "mt-6 w-full rounded-full transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]",
                        mwHairlineBorder,
                      )}
                    >
                      <Link to="/buy">Open Buy</Link>
                    </Button>
                  </Card>
                  </motion.div>
                </motion.div>
              ) : null}

              {widgetVisible("exceptions", user) ? (
                <motion.div
                  variants={staggerItem}
                  className="md:col-span-1 lg:col-span-4"
                >
                  <motion.div
                    whileHover={{ y: -1 }}
                    transition={{ duration: 0.55, ease: [0.2, 0, 0, 1] }}
                  >
                  <Card className={cn("h-full rounded-[var(--shape-xl)] bg-card p-6 shadow-xs", mwHairlineBorder)}>
                    <div className="mb-4 flex items-center gap-2 border-b border-border pb-4">
                      <AlertTriangle
                        className="h-7 w-7 shrink-0 text-[var(--mw-warning)]"
                        aria-hidden
                      />
                      <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                        Exceptions / SLA
                      </h2>
                    </div>
                    <div className="space-y-3 text-base">
                      <div className="rounded-[var(--shape-xl)] border border-border bg-[var(--neutral-50)] p-4 dark:bg-white/[0.04]">
                        <p className="font-bold text-foreground">
                          SP270226001
                        </p>
                        <p className="mt-1 text-sm font-light text-muted-foreground">
                          Con-form Group · carrier delay
                        </p>
                      </div>
                      <div className="rounded-[var(--shape-xl)] border border-border bg-[var(--neutral-50)] p-4 dark:bg-white/[0.04]">
                        <p className="font-bold text-foreground">
                          JOB-2026-0012
                        </p>
                        <p className="mt-1 text-sm font-light text-muted-foreground">
                          Hunter Steel · material short
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      className={cn(
                        "mt-6 w-full rounded-full transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]",
                        mwHairlineBorder,
                      )}
                    >
                      <Link to="/ship">View Ship</Link>
                    </Button>
                  </Card>
                  </motion.div>
                </motion.div>
              ) : null}

              {widgetVisible("sync", user) ? (
                <motion.div
                  variants={staggerItem}
                  className="md:col-span-2 lg:col-span-3"
                >
                  <motion.div
                    whileHover={{ y: -1 }}
                    transition={{ duration: 0.55, ease: [0.2, 0, 0, 1] }}
                  >
                  <Card className={cn("h-full rounded-[var(--shape-xl)] bg-card p-6 shadow-xs", mwHairlineBorder)}>
                    <div className="mb-4 flex items-center gap-2 border-b border-border pb-4">
                      <Link2
                        className="h-7 w-7 shrink-0 text-[var(--mw-mirage)] dark:text-[var(--mw-yellow-400)]"
                        aria-hidden
                      />
                      <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                        Sync / integration health
                      </h2>
                    </div>
                    <div className="space-y-4 text-base">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-light text-muted-foreground">
                          Xero
                        </span>
                        <Badge className="rounded-full border-0 bg-[color-mix(in_srgb,var(--mw-success)_18%,transparent)] px-3 py-1 font-bold text-[var(--mw-success)]">
                          Synced
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-light text-muted-foreground">
                          Carrier API
                        </span>
                        <Badge className="rounded-full border-0 bg-[color-mix(in_srgb,var(--mw-success)_18%,transparent)] px-3 py-1 font-bold text-[var(--mw-success)]">
                          OK
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-light text-muted-foreground">
                          MES bridge
                        </span>
                        <Badge className="rounded-full border-0 bg-[var(--mw-amber-50)] px-3 py-1 font-bold text-[var(--mw-yellow-900)] dark:bg-[var(--mw-yellow-400-20)] dark:text-[var(--mw-yellow-400)]">
                          Degraded
                        </Badge>
                      </div>
                    </div>
                  </Card>
                  </motion.div>
                </motion.div>
              ) : null}

              {widgetVisible("jobs", user) ? (
                <motion.div
                  variants={staggerItem}
                  className="md:col-span-1 lg:col-span-6"
                >
                  <div className="flex h-full flex-col gap-4">
                    <div className="flex items-center gap-2 border-b border-[color-mix(in_srgb,var(--mw-mirage)_12%,var(--border))] pb-3">
                      <Table2
                        className="h-8 w-8 shrink-0 text-[var(--mw-mirage)] dark:text-[var(--neutral-200)]"
                        aria-hidden
                      />
                      <h2 className={dashboardSectionTitleClass}>
                        Recent jobs / orders
                      </h2>
                    </div>
                    <motion.div
                      className="min-h-0 flex-1"
                      whileHover={{ y: -1 }}
                      transition={{ duration: 0.55, ease: [0.2, 0, 0, 1] }}
                    >
                      <MwDataTable
                        className={cn(
                          "rounded-[var(--shape-xl)] shadow-xs transition-shadow duration-[var(--duration-long1)] ease-[var(--ease-emphasized-decelerate)] hover:shadow-md",
                          mwHairlineBorder,
                        )}
                        columns={RECENT_JOB_COLUMNS}
                        data={RECENT_JOBS}
                        keyExtractor={(row) => row.id}
                      />
                    </motion.div>
                    <Button
                      asChild
                      variant="outline"
                      className={cn(
                        "rounded-full transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]",
                        mwHairlineBorder,
                      )}
                    >
                      <Link to="/plan">Open Plan</Link>
                    </Button>
                  </div>
                </motion.div>
              ) : null}

              {widgetVisible("shortcuts", user) ? (
                <motion.div
                  variants={staggerItem}
                  className="md:col-span-1 lg:col-span-6"
                >
                  <div className="flex h-full flex-col gap-4">
                    <div className="flex items-center gap-2 border-b border-[color-mix(in_srgb,var(--mw-mirage)_12%,var(--border))] pb-3">
                      <ListTree
                        className="h-8 w-8 shrink-0 text-[var(--mw-yellow-500)] dark:text-[var(--mw-yellow-400)]"
                        strokeWidth={2}
                        aria-hidden
                      />
                      <h2 className={dashboardSectionTitleClass}>Shortcuts</h2>
                    </div>
                    <DashboardPinList
                      hideHeader
                      initialItems={PIN_SHORTCUTS}
                      initialPinnedIds={["bridge", "schedule"]}
                    />
                  </div>
                </motion.div>
              ) : null}
            </div>

            <div className="flex flex-col gap-4 border-t border-[color-mix(in_srgb,var(--mw-mirage)_12%,var(--border))] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <h2 className={dashboardSectionTitleClass}>More modules</h2>
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-12 min-h-[48px] rounded-full bg-card transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)] hover:bg-[var(--neutral-50)]",
                      mwHairlineBorder,
                    )}
                  >
                    <Layers className="mr-2 h-5 w-5" aria-hidden />
                    Browse all modules
                    <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Modules</SheetTitle>
                  </SheetHeader>
                  <ul className="mt-6 space-y-2">
                    {visibleModules.map((module) => {
                      const Icon = module.Icon;
                      return (
                        <li key={module.key}>
                          <Link
                            to={module.path}
                            className="flex items-center gap-3 rounded-[var(--shape-md)] p-3 hover:bg-[var(--neutral-50)] dark:hover:bg-white/[0.06]"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--mw-mirage)]">
                              <Icon
                                size={ICON_SIZES.dashboard}
                                className="text-white"
                              />
                            </div>
                            <div>
                              <p className="text-base font-bold text-foreground">
                                {module.name}
                              </p>
                              <p className="text-sm font-light text-muted-foreground">
                                {module.description}
                              </p>
                            </div>
                            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-[var(--neutral-400)]" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </SheetContent>
              </Sheet>
            </div>
          </>
        )}
    </PageShell>
  );
}
