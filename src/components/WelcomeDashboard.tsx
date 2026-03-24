/**
 * Persona-driven home — widgets, AI command bar, modules secondary.
 * Module tiles use Animate UI icons per project rules.
 */

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, ChevronRight, Layers } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { motion } from "motion/react";
import { staggerItem } from "@/components/shared/motion/motion-variants";
import { PageShell } from "@/components/shared/layout/PageShell";
import { MODULE_ICONS, ICON_SIZES } from "@/lib/icon-config";
import { mockUserContext, type MockModuleKey } from "@/lib/mock-user-context";
import { AiCommandBar } from "@/components/shared/ai/AiCommandBar";
import {
  ContentCardSkeleton,
  KpiRowSkeleton,
} from "@/components/shared/feedback/CardSkeleton";

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
    description: "Admin, master data, settings",
  },
  {
    key: "design",
    name: "Design",
    Icon: MODULE_ICONS.design,
    path: "/design",
    description: "Factory layout, process builder",
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

export function WelcomeDashboard() {
  const [loading, setLoading] = useState(true);
  const user = mockUserContext;

  const visibleModules = useMemo(
    () => MODULE_META.filter((m) => user.allowedModules.includes(m.key)),
    [user.allowedModules],
  );

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <PageShell className="mx-auto max-w-[1400px]">
      <header className="space-y-1">
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-[var(--mw-mirage)]">
          Welcome, {user.displayName}
        </h1>
        <p className="text-[17px] text-muted-foreground">
          {user.org} · {user.role}
        </p>
      </header>

      <AiCommandBar
        scope="app"
        aria-label="Ask MirrorWorks AI, whole app"
      />

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
          {/* KPI strip — persona snapshot */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
              <p className="text-xs font-medium text-muted-foreground">
                My open approvals
              </p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-[var(--mw-mirage)]">
                4
              </p>
              <p className="mt-2 text-xs text-[var(--neutral-500)]">
                Quotes, expenses, POs
              </p>
            </Card>
            <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
              <p className="text-xs font-medium text-muted-foreground">
                Exceptions / SLA
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-[var(--mw-mirage)]">
                3
              </p>
              <p className="mt-2 text-xs text-[var(--neutral-500)]">
                Ship delays, QC holds
              </p>
            </Card>
            <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
              <p className="text-xs font-medium text-muted-foreground">
                Primary module
              </p>
              <p className="mt-1 text-lg font-semibold capitalize text-[var(--mw-mirage)]">
                {user.primaryModule}
              </p>
              <p className="mt-2 text-xs text-[var(--neutral-500)]">
                Suggested shortcuts below
              </p>
            </Card>
          </div>

          {/* Bento widgets */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {widgetVisible("approvals", user) ? (
              <motion.div
                variants={staggerItem}
                className="lg:col-span-5"
              >
                <Card className="h-full border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-medium text-[var(--mw-mirage)]">
                      My open approvals
                    </h2>
                    <Badge className="border-0 bg-[var(--mw-yellow-400)]/25 text-[var(--neutral-900)]">
                      4
                    </Badge>
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between border-b border-[var(--neutral-100)] pb-2">
                      <span className="text-muted-foreground">REQ-2026-0089</span>
                      <span className="tabular-nums font-medium text-[var(--mw-mirage)]">
                        $8,500
                      </span>
                    </li>
                    <li className="flex justify-between border-b border-[var(--neutral-100)] pb-2">
                      <span className="text-muted-foreground">EXP-2026-0142</span>
                      <span className="tabular-nums font-medium text-[var(--mw-mirage)]">
                        $1,250
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">QT-2026-0142</span>
                      <span className="tabular-nums font-medium text-[var(--mw-mirage)]">
                        $12,500
                      </span>
                    </li>
                  </ul>
                  <Button
                    asChild
                    variant="outline"
                    className="mt-4 w-full border-[var(--neutral-200)]"
                  >
                    <Link to="/buy">Open Buy</Link>
                  </Button>
                </Card>
              </motion.div>
            ) : null}

            {widgetVisible("exceptions", user) ? (
              <motion.div
                variants={staggerItem}
                className="lg:col-span-4"
              >
                <Card className="h-full border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
                  <h2 className="mb-4 text-base font-medium text-[var(--mw-mirage)]">
                    Exceptions / SLA
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div className="rounded-[var(--shape-md)] bg-[var(--neutral-50)] p-3">
                      <p className="font-medium text-[var(--mw-mirage)]">
                        SP270226001
                      </p>
                      <p className="text-xs text-[var(--neutral-500)]">
                        Con-form Group · carrier delay
                      </p>
                    </div>
                    <div className="rounded-[var(--shape-md)] bg-[var(--neutral-50)] p-3">
                      <p className="font-medium text-[var(--mw-mirage)]">
                        JOB-2026-0012
                      </p>
                      <p className="text-xs text-[var(--neutral-500)]">
                        Hunter Steel · material short
                      </p>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="mt-4 w-full border-[var(--neutral-200)]"
                  >
                    <Link to="/ship">View Ship</Link>
                  </Button>
                </Card>
              </motion.div>
            ) : null}

            {widgetVisible("sync", user) ? (
              <motion.div
                variants={staggerItem}
                className="lg:col-span-3"
              >
                <Card className="h-full border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
                  <h2 className="mb-4 text-base font-medium text-[var(--mw-mirage)]">
                    Sync / integration health
                  </h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Xero</span>
                      <Badge className="border-0 bg-[color-mix(in_srgb,var(--mw-success)_18%,transparent)] text-[var(--mw-success)]">
                        Synced
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Carrier API</span>
                      <Badge className="border-0 bg-[color-mix(in_srgb,var(--mw-success)_18%,transparent)] text-[var(--mw-success)]">
                        OK
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">MES bridge</span>
                      <Badge className="border-0 bg-[var(--mw-amber-50)] text-[var(--mw-yellow-900)]">
                        Degraded
                      </Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : null}

            {widgetVisible("jobs", user) ? (
              <motion.div
                variants={staggerItem}
                className="lg:col-span-6"
              >
                <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
                  <h2 className="mb-4 text-base font-medium text-[var(--mw-mirage)]">
                    Recent jobs / orders
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          <th className="pb-2 pr-4">Job</th>
                          <th className="pb-2 pr-4">Customer</th>
                          <th className="pb-2">Due</th>
                        </tr>
                      </thead>
                      <tbody className="text-[var(--mw-mirage)]">
                        <tr className="border-t border-[var(--neutral-100)]">
                          <td className="py-3 pr-4 font-medium tabular-nums">
                            JOB-2026-0012
                          </td>
                          <td className="py-3 pr-4">TechCorp Industries</td>
                          <td className="py-3 text-[var(--neutral-500)]">Mar 28</td>
                        </tr>
                        <tr className="border-t border-[var(--neutral-100)]">
                          <td className="py-3 pr-4 font-medium tabular-nums">
                            JOB-2026-0011
                          </td>
                          <td className="py-3 pr-4">Pacific Fab</td>
                          <td className="py-3 text-[var(--neutral-500)]">Mar 26</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="mt-4 border-[var(--neutral-200)]"
                  >
                    <Link to="/plan">Open Plan</Link>
                  </Button>
                </Card>
              </motion.div>
            ) : null}

            {widgetVisible("shortcuts", user) ? (
              <motion.div
                variants={staggerItem}
                className="lg:col-span-6"
              >
                <Card className="border border-[var(--neutral-200)] bg-white p-6 shadow-xs rounded-[var(--shape-lg)]">
                  <h2 className="mb-4 text-base font-medium text-[var(--mw-mirage)]">
                    Shortcuts
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="border-[var(--neutral-200)]">
                      <Link to={`/${user.primaryModule}`}>Primary module</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="border-[var(--neutral-200)]">
                      <Link to="/make">Andon board</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="border-[var(--neutral-200)]">
                      <Link to="/sell">New quote</Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : null}
          </div>

          {/* Modules — secondary */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-medium text-[var(--mw-mirage)]">
              More modules
            </h2>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="h-12 min-h-[48px] border-[var(--neutral-200)]"
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
                          className="flex items-center gap-3 rounded-[var(--shape-md)] p-3 hover:bg-[var(--neutral-50)]"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--mw-mirage)]">
                            <Icon
                              size={ICON_SIZES.dashboard}
                              className="text-white"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-[var(--mw-mirage)]">
                              {module.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
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
