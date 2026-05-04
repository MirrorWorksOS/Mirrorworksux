import { useMemo } from 'react';

import { FloorExecutionScreen } from '@/components/floor/execution/FloorExecutionScreen';
import { buildExecutionSnapshot } from '@/components/floor/execution/snapshot';
import type { WorkOrderExecutionSnapshot } from '@/components/floor/execution/types';
import { useFloorSession } from '@/store/floorSessionStore';

// Canonical demo identity. While the Make module is in demo mode, every shop-floor
// entry point (machine card, MO detail, kanban card, /floor/run/:id) presents the
// same Differential Housing run so demos are predictable. Flip USE_CANONICAL to
// false (or delete) once real per-WO data is required.
const USE_CANONICAL = true;
const CANONICAL = {
  woNumber: 'WO-2026-0005',
  moNumber: 'MO-2026-0002',
  productName: 'Differential Housing',
  customerName: 'Drivetrain Dynamics Pty Ltd',
  operation: 'Laser cut differential blanks',
  machineName: 'Laser Cutter #1',
  operatorName: 'Sarah Chen',
  operatorRole: 'Shop floor operator',
  operatorInitials: 'SC',
  totalUnits: 5, // small demo batch — full close-out reachable in 5 clicks
  unitsCompleted: 0,
  estimatedMinutes: 240,
  actualMinutes: 0,
  status: 'in_progress',
  revision: 'Rev C',
};

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

    const seed = USE_CANONICAL
      ? {
          ...workOrder,
          ...CANONICAL,
          id: workOrder.id,
          machineName: workOrder.machineName ?? workOrder.station ?? CANONICAL.machineName,
          stationName: mode === 'route' ? session.stationName ?? undefined : workOrder.stationName,
        }
      : {
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
        };

    return buildExecutionSnapshot(seed, {
      elapsedSeconds,
      stationName: mode === 'route' ? session.stationName ?? undefined : workOrder.stationName,
    });
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
