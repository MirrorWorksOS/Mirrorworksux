import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/components/ui/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fadeVariants } from "@/components/shared/motion/motion-variants";

export interface DashboardTab {
  key: string;
  label: string;
  icon?: LucideIcon;
}

export interface ModuleDashboardProps {
  title: string;
  subtitle?: string;
  tabs: DashboardTab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ModuleDashboard({
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  actions,
  children,
  className,
}: ModuleDashboardProps) {
  return (
    <div className={cn("flex flex-col gap-6 p-6", className)}>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </header>

      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
        className="flex w-full flex-col gap-0"
      >
        <TabsList className="h-auto w-full justify-start gap-8 rounded-none border-b border-[var(--neutral-200)] bg-transparent p-0 shadow-none backdrop-blur-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.key}
                id={`dashboard-tab-${tab.key}`}
                value={tab.key}
                className={cn(
                  "relative inline-flex h-auto items-center gap-2 rounded-none border-0 bg-transparent px-0 py-3 text-sm shadow-none",
                  "text-[var(--neutral-500)] transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]",
                  "hover:text-[var(--mw-mirage)]",
                  "focus-visible:ring-2 focus-visible:ring-[var(--mw-yellow-400)]/50 focus-visible:ring-offset-2",
                  "data-[state=active]:bg-transparent data-[state=active]:text-[var(--mw-mirage)] data-[state=active]:font-medium data-[state=active]:shadow-none",
                  "after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:origin-center after:scale-x-0 after:bg-[var(--mw-yellow-400)] after:transition-transform after:duration-[var(--duration-medium1)] after:ease-[var(--ease-standard)]",
                  "data-[state=active]:after:scale-x-100",
                )}
              >
                {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden /> : null}
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <div
        role="tabpanel"
        id={`dashboard-panel-${activeTab}`}
        aria-labelledby={`dashboard-tab-${activeTab}`}
        className="min-h-0 flex-1"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
