/**
 * MakeShopFloor — Shop floor overview using shared JobWorkspaceLayout.
 *
 * Tabs: Overview, Kanban, Work Orders
 * Standardised to match MakeManufacturingOrderDetail pattern.
 */

import React, { useState } from 'react';
import { ArrowLeft, Monitor, Maximize2 } from 'lucide-react';
import {
  JobWorkspaceLayout,
  type JobWorkspaceTabConfig,
} from '@/components/shared/layout/JobWorkspaceLayout';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

import { OverviewTab } from '../shop-floor/OverviewTab';
import { MakeShopFloorKanban } from './MakeShopFloorKanban';
import { WorkTab } from '../shop-floor/WorkTab';
import { WorkOrderFullScreen } from '../shop-floor/WorkOrderFullScreen';
import { useNavigate } from 'react-router';
import { OfflineIndicator } from '@/components/make/OfflineIndicator';
import { WorkOrderSequencing } from '@/components/make/WorkOrderSequencing';
import { BatchTraceability } from '@/components/make/BatchTraceability';

const TABS: JobWorkspaceTabConfig[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'kanban', label: 'Kanban' },
  { id: 'work', label: 'Work Orders', count: 4 },
];

export function MakeShopFloor() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);
  const navigate = useNavigate();

  return (
    <>
      <OfflineIndicator />
      <JobWorkspaceLayout
        breadcrumbs={[
          { label: 'Make', href: '/make' },
          { label: 'Shop Floor' },
        ]}
        title="Shop Floor"
        subtitle="Real-time production overview and work order management"
        headerActions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-[var(--border)]"
              onClick={() => navigate('/make')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {/* Primary CTA — launches the kiosk/tablet experience. This is
                the "office-side manager sends a tablet into kiosk mode"
                path. An operator at a bolted tablet would hit /floor
                directly and never see this page. */}
            <Button
              className="bg-[var(--neutral-800)] hover:bg-[var(--neutral-900)] text-white"
              onClick={() => navigate('/floor')}
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              Enter Shop Floor Mode
            </Button>
          </div>
        }
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        renderTabPanel={(tabId) => {
          switch (tabId) {
            case 'overview':
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <WorkOrderSequencing />
                    <BatchTraceability />
                  </div>
                  <OverviewTab />
                </div>
              );
            case 'kanban':
              return (
                <div className="h-[calc(100vh-280px)] overflow-hidden">
                  <MakeShopFloorKanban />
                </div>
              );
            case 'work':
              return (
                <div className="flex flex-col h-[calc(100vh-280px)] overflow-hidden">
                  <WorkTab onSelectWorkOrder={setSelectedWorkOrder} />
                </div>
              );
            default:
              return null;
          }
        }}
      />

      {/* WorkOrderFullScreen overlay */}
      {selectedWorkOrder && (
        <WorkOrderFullScreen
          workOrder={selectedWorkOrder}
          onClose={() => setSelectedWorkOrder(null)}
        />
      )}
    </>
  );
}
