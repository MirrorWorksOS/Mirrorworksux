import type { ReactNode } from "react";

import { PageShell } from "@/components/shared/layout/PageShell";
import { PageHeader, type PageHeaderProps } from "@/components/shared/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/components/ui/utils";

/** One tab in a job-style workspace (Sell deal, Plan job, Make work order, etc.). */
export interface JobWorkspaceTabConfig {
  id: string;
  /** Sentence-case label */
  label: string;
  /** Optional count badge (e.g. linked quotes, open tasks). */
  count?: number;
}

export interface JobWorkspaceLayoutProps {
  breadcrumbs?: PageHeaderProps["breadcrumbs"];
  /** Primary title (job / opportunity / order name). */
  title: string;
  /** Secondary line (e.g. code · customer · value). */
  subtitle?: string;
  /** Row below subtitle: badges, status chips, etc. */
  metaRow?: ReactNode;
  headerActions?: ReactNode;
  tabs: JobWorkspaceTabConfig[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  /** Content for each tab; parent may use a two-column grid inside overview (or any tab). */
  renderTabPanel: (tabId: string) => ReactNode;
  className?: string;
}

/**
 * Full-page job workspace shell: PageShell + PageHeader + pill tabs + tab panels.
 * Reusable across Sell, Plan, Make (and similar) for record-centric drill-ins.
 * Styling: MW v2 tokens (cards, borders, yellow focus on tab triggers).
 */
export function JobWorkspaceLayout({
  breadcrumbs,
  title,
  subtitle,
  metaRow,
  headerActions,
  tabs,
  activeTab,
  onTabChange,
  renderTabPanel,
  className,
}: JobWorkspaceLayoutProps) {
  const tabIds = new Set(tabs.map((t) => t.id));

  const handleTabChange = (value: string) => {
    if (tabIds.has(value)) onTabChange(value);
  };

  return (
    <PageShell className={cn("space-y-6", className)}>
      <PageHeader
        breadcrumbs={breadcrumbs}
        title={title}
        subtitle={subtitle}
        actions={headerActions}
      />
      {metaRow ? (
        <div className="flex flex-wrap items-center gap-2">{metaRow}</div>
      ) : null}

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex w-full flex-col gap-0"
      >
        <TabsList className="h-auto w-full min-h-11 flex-wrap justify-start gap-1 rounded-xl p-1 sm:w-fit">
          {tabs.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="gap-2 px-3 sm:px-4"
            >
              <span>{t.label}</span>
              {t.count != null && t.count > 0 ? (
                <Badge
                  variant="secondary"
                  className="border-0 bg-[var(--neutral-200)] px-1.5 py-0 text-xs font-medium text-[var(--neutral-800)] tabular-nums"
                >
                  {t.count}
                </Badge>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((t) => (
          <TabsContent
            key={t.id}
            value={t.id}
            className="mt-6 focus-visible:outline-none"
          >
            {renderTabPanel(t.id)}
          </TabsContent>
        ))}
      </Tabs>
    </PageShell>
  );
}
