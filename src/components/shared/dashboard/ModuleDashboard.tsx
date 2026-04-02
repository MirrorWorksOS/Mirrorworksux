import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/components/ui/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fadeVariants } from "@/components/shared/motion/motion-variants";
import {
  AiCommandBar,
  type AiCommandScope,
} from "@/components/shared/ai/AiCommandBar";
import { DashboardCustomizeButton } from "./DashboardCustomizeButton";
import { WidgetDrawer } from "./WidgetDrawer";
import { DashboardWidgetGrid } from "./DashboardWidgetGrid";
import { getDefaultWidgets, type WidgetConfig } from "./WidgetRegistry";

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
  /** When set, renders the AI command bar below the tab strip (prototype). */
  aiScope?: AiCommandScope;
  /** Module identifier used for widget filtering and localStorage key. */
  module?: string;
  /** When true, renders the customisable widget grid above the children. */
  showWidgetGrid?: boolean;
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
  aiScope,
  module = "all",
  showWidgetGrid = false,
}: ModuleDashboardProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Load widgets from localStorage or use defaults
  const storageKey = `mw-dashboard-${module}-widgets`;
  const [widgets, setWidgets] = React.useState<WidgetConfig[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored) as WidgetConfig[];
    } catch {
      // fall through to defaults
    }
    return getDefaultWidgets(module);
  });

  // Persist to localStorage on change
  React.useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(widgets));
    } catch {
      // silently ignore quota errors
    }
  }, [storageKey, widgets]);

  const handleAddWidget = (widget: WidgetConfig) => {
    setWidgets((prev) => [...prev, widget]);
  };

  return (
    <div className={cn("flex flex-col gap-8 p-8", className)}>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-[length:var(--font-headline-medium)] font-bold leading-[var(--line-headline-medium)] tracking-tight text-[var(--neutral-900)]">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
          <DashboardCustomizeButton onClick={() => setDrawerOpen(true)} />
        </div>
      </header>

      {/* Widget drawer */}
      <WidgetDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        module={module}
        currentWidgets={widgets}
        onAddWidget={handleAddWidget}
      />

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
                  "after:absolute after:right-0 after:bottom-0 after:left-0 after:h-1 after:origin-center after:scale-x-0 after:bg-[var(--mw-yellow-400)] after:transition-transform after:duration-[var(--duration-medium1)] after:ease-[var(--ease-standard)]",
                  "data-[state=active]:after:scale-x-100",
                )}
              >
                {Icon ? (
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                ) : null}
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
        className="flex min-h-0 flex-1 flex-col gap-8"
      >
        {aiScope !== undefined ? (
          <AiCommandBar scope={aiScope} aria-label={`Ask MirrorWorks AI, ${aiScope} module`} />
        ) : null}
        {showWidgetGrid && widgets.length > 0 ? (
          <DashboardWidgetGrid
            widgets={widgets}
            onWidgetsChange={setWidgets}
          />
        ) : null}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            className="min-h-0 flex-1"
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
