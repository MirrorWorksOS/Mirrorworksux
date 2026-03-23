/**
 * MakeShopFloor - Full tabbed shop floor screen
 *
 * Tabs:
 *   Overview        → OverviewTab      (Active Job Focus, Shift Performance, Andon Alerts, MO table, AI Insights, Comms)
 *   Kanban          → MakeShopFloorKanban (Kanban board — click card → WorkOrderFullScreen)
 *   Work            → WorkTab          (MO list with collapsible WOs — click row → WorkOrderFullScreen)
 *   Issues          → IssuesTab        (Report issue, Call Supervisor, Voice Note, Active Alerts)
 *   Quality         → QualityTab       (Quality holds, inspections, reports)
 *   Time Clock      → TimeClockTab     (Operator clock-in / PIN / break)
 *   Intelligence    → IntelligenceHubTab (AI insights, voice assistant)
 */

import React, { useState } from 'react';
import { cn } from '../ui/utils';

import { OverviewTab }        from '../shop-floor/OverviewTab';
import { MakeShopFloorKanban } from './MakeShopFloorKanban';
import { WorkTab }            from '../shop-floor/WorkTab';
import { WorkOrderFullScreen } from '../shop-floor/WorkOrderFullScreen';
import { IssuesTab }          from '../shop-floor/IssuesTab';
import { QualityTab }         from '../shop-floor/QualityTab';
import { TimeClockTab }       from '../shop-floor/TimeClockTab';
import { IntelligenceHubTab } from '../shop-floor/IntelligenceHubTab';

type Tab =
  | 'overview'
  | 'kanban'
  | 'work'
  | 'issues'
  | 'quality'
  | 'time-clock'
  | 'intelligence';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview',     label: 'Overview' },
  { id: 'kanban',       label: 'Kanban' },
  { id: 'work',         label: 'Work Orders' },
  { id: 'issues',       label: 'Issues' },
  { id: 'quality',      label: 'Quality' },
  { id: 'time-clock',   label: 'Time Clock' },
  { id: 'intelligence', label: 'Intelligence Hub' },
];

export function MakeShopFloor() {
  const [activeTab, setActiveTab]           = useState<Tab>('overview');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);

  return (
    <div className="flex flex-col" style={{ height: '100vh' }}>

      {/* ── Tab Bar ── */}
      <div className="shrink-0 flex items-end gap-0 border-b border-[var(--border)] bg-white px-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'relative h-14 px-5 text-[14px] font-medium whitespace-nowrap transition-colors duration-150',
              activeTab === tab.id
                ? 'text-[#1A2732]'
                : 'text-[#737373] hover:text-[#1A2732]'
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#FFCF4B] rounded-t-sm" />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 min-h-0 overflow-hidden">

        {activeTab === 'overview' && (
          <div className="h-full overflow-hidden">
            <OverviewTab />
          </div>
        )}

        {activeTab === 'kanban' && (
          <div className="h-full overflow-hidden">
            <MakeShopFloorKanban />
          </div>
        )}

        {activeTab === 'work' && (
          <div className="flex flex-col h-full overflow-hidden">
            <WorkTab onSelectWorkOrder={setSelectedWorkOrder} />
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="h-full overflow-hidden">
            <IssuesTab />
          </div>
        )}

        {activeTab === 'quality' && (
          <div className="h-full overflow-hidden">
            <QualityTab />
          </div>
        )}

        {activeTab === 'time-clock' && (
          <div className="h-full overflow-hidden">
            <TimeClockTab />
          </div>
        )}

        {activeTab === 'intelligence' && (
          <div className="h-full overflow-hidden">
            <IntelligenceHubTab />
          </div>
        )}

      </div>

      {/* ── WorkOrderFullScreen overlay (Work & Kanban tabs) ── */}
      {selectedWorkOrder && (
        <WorkOrderFullScreen
          workOrder={selectedWorkOrder}
          onClose={() => setSelectedWorkOrder(null)}
        />
      )}
    </div>
  );
}
