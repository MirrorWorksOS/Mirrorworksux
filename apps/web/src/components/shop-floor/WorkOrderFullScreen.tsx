import { useMemo } from 'react';

import { FloorExecutionScreen } from '@/components/floor/execution/FloorExecutionScreen';
import { buildExecutionSnapshot } from '@/components/floor/execution/snapshot';
import type { WorkOrderExecutionSnapshot } from '@/components/floor/execution/types';
import { useFloorSession } from '@/store/floorSessionStore';

export interface FullScreenWorkOrderProps {
  workOrder?: any;
  snapshot?: WorkOrderExecutionSnapshot;
  onClose: () => void;
  mode?: 'overlay' | 'route';
  onSwitchOperator?: (handoverNote: string) => void;
}

export function WorkOrderFullScreen({
  workOrder,
  snapshot,
  onClose,
  mode = 'overlay',
  onSwitchOperator,
}: FullScreenWorkOrderProps) {
  const session = useFloorSession();

  const executionSnapshot = useMemo(() => {
    if (snapshot) return snapshot;
    if (!workOrder) return null;

    const elapsedSeconds =
      mode === 'route' && session.jobStartedAt
        ? Math.max(0, Math.floor((Date.now() - session.jobStartedAt) / 1000))
        : undefined;

    return buildExecutionSnapshot(
      {
        ...workOrder,
        id: workOrder.id,
        woNumber: workOrder.woNumber ?? workOrder.id,
        moNumber: workOrder.moNumber ?? workOrder.moId,
        productName: workOrder.productName ?? workOrder.moPartName,
        customerName: workOrder.customerName ?? workOrder.moCustomer,
        machineName: workOrder.machineName ?? workOrder.station,
        operation: workOrder.operation ?? workOrder.name,
        unitsCompleted: workOrder.unitsCompleted,
        totalUnits: workOrder.totalUnits,
        stationName: mode === 'route' ? session.stationName ?? undefined : workOrder.stationName,
      },
      {
        elapsedSeconds,
        stationName:
          mode === 'route' ? session.stationName ?? undefined : workOrder.stationName,
      }
    );
  }, [mode, session.jobStartedAt, session.stationName, snapshot, workOrder]);

  if (!executionSnapshot) return null;

  const rootClass =
    mode === 'route'
      ? 'absolute inset-0'
      : 'fixed inset-0 z-[1000]';

  return (
    <div className={rootClass}>
      <FloorExecutionScreen
        mode={mode}
        snapshot={executionSnapshot}
        onClose={onClose}
        onSwitchOperator={onSwitchOperator}
      />
    </div>
  );
}
