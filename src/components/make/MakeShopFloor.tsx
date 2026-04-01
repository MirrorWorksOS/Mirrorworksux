/**
 * MakeShopFloor - Shop floor overview with standardized shadcn Tabs.
 *
 * Tabs: Overview, Kanban, Work Orders
 * (Time Clock, Quality, and Intelligence Hub promoted to standalone routes)
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';

import { OverviewTab }        from '../shop-floor/OverviewTab';
import { MakeShopFloorKanban } from './MakeShopFloorKanban';
import { WorkTab }            from '../shop-floor/WorkTab';
import { WorkOrderFullScreen } from '../shop-floor/WorkOrderFullScreen';

export function MakeShopFloor() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);

  return (
    <PageShell className="space-y-0">
      <PageHeader
        title="Shop Floor"
        subtitle="Real-time production overview and work order management"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex w-full flex-col gap-0">
        <TabsList className="h-auto w-full min-h-11 flex-wrap justify-start gap-1 rounded-xl p-1 sm:w-fit mx-6">
          <TabsTrigger value="overview" className="gap-2 px-3 sm:px-4">
            Overview
          </TabsTrigger>
          <TabsTrigger value="kanban" className="gap-2 px-3 sm:px-4">
            Kanban
          </TabsTrigger>
          <TabsTrigger value="work" className="gap-2 px-3 sm:px-4">
            <span>Work Orders</span>
            <Badge
              variant="secondary"
              className="border-0 bg-[var(--neutral-200)] px-1.5 py-0 text-xs font-medium text-[var(--neutral-800)] tabular-nums"
            >
              4
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
          <div className="h-[calc(100vh-180px)] overflow-hidden">
            <OverviewTab />
          </div>
        </TabsContent>

        <TabsContent value="kanban" className="mt-0 focus-visible:outline-none">
          <div className="h-[calc(100vh-180px)] overflow-hidden">
            <MakeShopFloorKanban />
          </div>
        </TabsContent>

        <TabsContent value="work" className="mt-0 focus-visible:outline-none">
          <div className="flex flex-col h-[calc(100vh-180px)] overflow-hidden">
            <WorkTab onSelectWorkOrder={setSelectedWorkOrder} />
          </div>
        </TabsContent>
      </Tabs>

      {/* WorkOrderFullScreen overlay */}
      {selectedWorkOrder && (
        <WorkOrderFullScreen
          workOrder={selectedWorkOrder}
          onClose={() => setSelectedWorkOrder(null)}
        />
      )}
    </PageShell>
  );
}
