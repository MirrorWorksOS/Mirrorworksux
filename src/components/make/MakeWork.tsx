/**
 * Make Work - Standalone Work Orders screen (deep-link from sidebar)
 * Renders the same WorkTab that appears in the Shop Floor's "Work Orders" tab.
 * Touch-optimised for gloved hands on shop floor.
 */

import React, { useState } from 'react';
import { WorkTab } from '../shop-floor/WorkTab';
import { WorkOrderFullScreen } from '../shop-floor/WorkOrderFullScreen';

export function MakeWork() {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);

  return (
    <div className="flex flex-col" style={{ height: '100vh' }}>
      <WorkTab onSelectWorkOrder={setSelectedWorkOrder} />

      {selectedWorkOrder && (
        <WorkOrderFullScreen
          workOrder={selectedWorkOrder}
          onClose={() => setSelectedWorkOrder(null)}
        />
      )}
    </div>
  );
}