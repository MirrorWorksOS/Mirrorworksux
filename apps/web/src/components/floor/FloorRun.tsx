/**
 * FloorRun — Route wrapper at /floor/run/:workOrderId.
 *
 * Hydrates the task-console snapshot for the canonical kiosk execution
 * surface. The route owns URL → data fetching and session transitions so the
 * underlying execution screen can stay prop-driven and be reused by the
 * office overlay entry points.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AlertCircle, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { WorkOrderFullScreen } from '@/components/shop-floor/WorkOrderFullScreen';
import { buildExecutionSnapshot } from '@/components/floor/execution/snapshot';
import type { WorkOrderExecutionSnapshot } from '@/components/floor/execution/types';
import { makeService } from '@/services';
import { useFloorExecutionStore } from '@/store/floorExecutionStore';
import { useFloorSession, type FloorSessionState } from '@/store/floorSessionStore';
import type {
  Machine,
  ManufacturingOrder,
  WorkOrder,
} from '@/types/entities';

export function FloorRun() {
  const { workOrderId } = useParams<{ workOrderId: string }>();
  const navigate = useNavigate();
  const session = useFloorSession();
  const setPendingResumeWorkOrder = useFloorExecutionStore(
    (state) => state.setPendingResumeWorkOrder
  );

  const [snapshot, setSnapshot] = useState<WorkOrderExecutionSnapshot | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workOrderId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      const wo = await makeService.getWorkOrderById(workOrderId);
      if (cancelled) return;

      if (!wo) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const [mo, machine] = await Promise.all([
        makeService.getManufacturingOrderById(wo.manufacturingOrderId),
        makeService.getMachineById(wo.machineId),
      ]);
      if (cancelled) return;

      setSnapshot(buildSnapshot(wo, mo, machine, session));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
    // Session is read once at hydration time so a mid-job operator note does
    // not trigger a full refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workOrderId]);

  useEffect(() => {
    if (!snapshot) return;
    if (session.activeWorkOrderId !== snapshot.workOrderId) {
      session.startJob(snapshot.workOrderId);
    }
    setPendingResumeWorkOrder(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot]);

  const handleClose = () => {
    session.endJob();
    navigate('/floor');
  };

  const handleSwitchOperator = (_handoverNote: string) => {
    if (!snapshot) return;
    setPendingResumeWorkOrder(snapshot.workOrderId);
    session.switchOperator();
    navigate('/floor');
  };

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[var(--neutral-100)]">
        <div className="text-sm text-[var(--neutral-500)]">
          Loading work order…
        </div>
      </div>
    );
  }

  if (notFound || !snapshot) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[var(--neutral-100)] p-8">
        <div className="max-w-[480px] rounded-[var(--shape-lg)] border border-[var(--neutral-200)] bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--mw-error)]/10">
            <AlertCircle className="h-7 w-7 text-[var(--mw-error)]" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-[var(--neutral-800)]">
            Unknown work order
          </h2>
          <p className="mb-6 text-sm text-[var(--neutral-500)]">
            We couldn&apos;t find <span className="font-medium">{workOrderId}</span>.
            It may have been completed, cancelled, or the link is stale.
          </p>
          <Button
            onClick={() => {
              session.endJob();
              navigate('/floor');
            }}
            className="bg-[var(--neutral-800)] text-white hover:bg-[var(--neutral-900)]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to queue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <WorkOrderFullScreen
      snapshot={snapshot}
      mode="route"
      onClose={handleClose}
      onSwitchOperator={handleSwitchOperator}
    />
  );
}

function buildSnapshot(
  wo: WorkOrder,
  mo: ManufacturingOrder | undefined,
  machine: Machine | undefined,
  session: FloorSessionState
) {
  const operatorName = session.operatorName ?? wo.operatorName ?? 'Operator';
  const operatorRole = session.operatorRole ?? 'Shop floor operator';
  const operatorInitials = operatorName
    .split(' ')
    .map((part: string) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const elapsedSeconds = session.jobStartedAt
    ? Math.max(0, Math.floor((Date.now() - session.jobStartedAt) / 1000))
    : wo.actualMinutes * 60;

  return buildExecutionSnapshot(
    {
      id: wo.id,
      woNumber: wo.woNumber,
      moNumber: mo?.moNumber ?? wo.manufacturingOrderId,
      jobNumber: mo?.jobNumber,
      productName: mo?.productName ?? wo.operation,
      customerName: mo?.customerName ?? 'Customer',
      machineId: wo.machineId,
      machineName: machine?.name ?? wo.machineName ?? 'Workstation',
      stationName: session.stationName ?? machine?.name ?? wo.machineName,
      operatorName,
      operatorRole,
      operatorInitials,
      operation: wo.operation,
      status: wo.status,
      estimatedMinutes: wo.estimatedMinutes,
      actualMinutes: wo.actualMinutes,
      totalUnits: 100,
    },
    {
      elapsedSeconds,
      stationName: session.stationName ?? machine?.name ?? wo.machineName,
    }
  );
}
