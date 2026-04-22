import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/components/ui/utils";
import { PillNav } from "@/components/shared/navigation/PillNav";
import { fadeVariants } from "@/components/shared/motion/motion-variants";
import {
  AiCommandBar,
  type AiCommandScope,
} from "@/components/shared/ai/AiCommandBar";
import { DashboardCustomizeButton } from "./DashboardCustomizeButton";
import { WidgetDrawer } from "./WidgetDrawer";
import { DashboardWidgetGrid } from "./DashboardWidgetGrid";
import { getDefaultWidgets, type WidgetConfig } from "./WidgetRegistry";
import {
  buildStorageKey,
  readStorageValue,
  writeStorageValue,
} from "@/lib/platform/storage";

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
  const storageKey = buildStorageKey("dashboard_layout", module, "widgets");
  const [widgets, setWidgets] = React.useState<WidgetConfig[]>(() => {
    try {
      const stored = readStorageValue(storageKey);
      if (stored) return JSON.parse(stored) as WidgetConfig[];
    } catch {
      // fall through to defaults
    }
    return getDefaultWidgets(module);
  });

  // Persist to localStorage on change
  React.useEffect(() => {
    writeStorageValue(storageKey, JSON.stringify(widgets));
  }, [storageKey, widgets]);

  const handleAddWidget = (widget: WidgetConfig) => {
    setWidgets((prev) => [...prev, widget]);
  };

  return (
    <div className={cn("flex flex-col gap-8 p-8", className)}>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="text-2xl sm:text-3xl tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle ? (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">{subtitle}</div>
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

      <PillNav
        tabs={tabs}
        value={activeTab}
        onValueChange={onTabChange}
        aria-label={`${title} sections`}
      />

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
