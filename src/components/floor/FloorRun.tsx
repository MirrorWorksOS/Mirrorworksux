/**
 * FloorRun — Route wrapper at /floor/run/:workOrderId.
 *
 * Turns a URL parameter into a hydrated workOrder context and hands it to
 * WorkOrderFullScreen in `route` mode. Responsibilities:
 *
 *   1. Look up the WorkOrder, its parent ManufacturingOrder, its Machine,
 *      and the current session operator — enough for the execution screen
 *      to render without a single hardcoded "David Miller" or "Alliance".
 *   2. Handle not-found gracefully (stale localStorage, manual URL edit).
 *      No crashy fallbacks; render an "Unknown work order" card with a
 *      back-to-scan button.
 *   3. On back/close, call session.endJob() and navigate to /floor so the
 *      operator lands on the scan queue again (still clocked in, still at
 *      the same station).
 *
 * Why the hydration lives here and not inside WorkOrderFullScreen:
 *   - Keeps WorkOrderFullScreen dumb/prop-driven so the existing overlay
 *     call site in MakeShopFloor keeps working.
 *   - Route wrappers are the canonical place for URL → data fetching in
 *     this codebase.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { makeService } from '@/services/makeService';
import { useFloorSession, type FloorSessionState } from '@/store/floorSessionStore';
import { WorkOrderFullScreen } from '@/components/shop-floor/WorkOrderFullScreen';
import type {
  WorkOrder,
  ManufacturingOrder,
  Machine,
} from '@/types/entities';

interface HydratedContext {
  id: string;
  woNumber: string;
  operation: string;
  status: string;
  moNumber: string;
  productName: string;
  customerName: string;
  machineName: string;
  operatorName: string;
  operatorRole: string;
  operatorInitials: string;
  subtitle: string;
}

export function FloorRun() {
  const { workOrderId } = useParams<{ workOrderId: string }>();
  const navigate = useNavigate();
  const session = useFloorSession();

  const [context, setContext] = useState<HydratedContext | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  // Hydrate WO → MO → Machine from the ID in the URL.
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

      setContext(buildContext(wo, mo, machine, session));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
    // Session is read once at hydration time to avoid re-fetching every
    // time a field on the session changes mid-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workOrderId]);

  // Register this WO as the active job the first time we successfully
  // hydrate it. Enables the auto-resume path in FloorHome when the tablet
  // wakes from sleep mid-shift.
  useEffect(() => {
    if (context && session.activeWorkOrderId !== context.id) {
      session.startJob(context.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  const handleClose = () => {
    session.endJob();
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

  if (notFound || !context) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[var(--neutral-100)] p-8">
        <div className="max-w-[480px] bg-card border border-[var(--neutral-200)] rounded-[var(--shape-lg)] p-8 shadow-sm text-center">
          <div className="w-14 h-14 rounded-full bg-[var(--mw-error)]/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-[var(--mw-error)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--neutral-800)] mb-2">
            Unknown work order
          </h2>
          <p className="text-sm text-[var(--neutral-500)] mb-6">
            We couldn't find <span className="font-mono">{workOrderId}</span>.
            It may have been completed, cancelled, or the link is stale.
          </p>
          <Button
            onClick={() => {
              session.endJob();
              navigate('/floor');
            }}
            className="bg-[var(--neutral-800)] hover:bg-[var(--neutral-900)] text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to queue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <WorkOrderFullScreen
      workOrder={context}
      mode="route"
      onClose={handleClose}
    />
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Hydration helper
// ──────────────────────────────────────────────────────────────────────────
function buildContext(
  wo: WorkOrder,
  mo: ManufacturingOrder | undefined,
  machine: Machine | undefined,
  session: FloorSessionState
): HydratedContext {
  // Operator identity comes from the live session, NOT the WO record. The
  // WO may have been pre-assigned to someone else at planning time, but
  // who ACTUALLY ran it is whoever's clocked in at the tablet right now.
  const operatorName = session.operatorName ?? wo.operatorName ?? 'Operator';
  const operatorRole = session.operatorRole ?? 'Shop Floor';
  const operatorInitials = operatorName
    .split(' ')
    .map((p: string) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const machineName = machine?.name ?? wo.machineName ?? 'Workstation';
  const moNumber = mo?.moNumber ?? wo.manufacturingOrderId;
  const productName = mo?.productName ?? wo.operation;
  const customerName = mo?.customerName ?? 'Customer';

  return {
    id: wo.id,
    woNumber: wo.woNumber,
    operation: wo.operation,
    status: wo.status,
    moNumber,
    productName,
    customerName,
    machineName,
    operatorName,
    operatorRole,
    operatorInitials,
    subtitle: `${customerName} • ${wo.operation}`,
  };
}
