import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2, X } from 'lucide-react';

import { FloorExecutionScreen } from '@/components/floor/execution/FloorExecutionScreen';
import { buildExecutionSnapshot } from '@/components/floor/execution/snapshot';
import type { WorkOrderExecutionSnapshot } from '@/components/floor/execution/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { makeService } from '@/services';
import { useFloorSession } from '@/store/floorSessionStore';
import type { Employee } from '@/types/entities';

// Canonical demo identity. While the Make module is in demo mode, every shop-floor
// entry point (machine card, MO detail, kanban card, /floor/run/:id) presents the
// same Differential Housing run so demos are predictable. Flip USE_CANONICAL to
// false (or delete) once real per-WO data is required. The operator identity is
// NOT canonical — it is picked by the user (overlay) or comes from the kiosk
// session (route).
const USE_CANONICAL = true;
const CANONICAL = {
  woNumber: 'WO-2026-0005',
  moNumber: 'MO-2026-0002',
  productName: 'Differential Housing',
  customerName: 'Drivetrain Dynamics Pty Ltd',
  operation: 'Laser cut differential blanks',
  machineName: 'Laser Cutter #1',
  totalUnits: 5, // small demo batch — full close-out reachable in 5 clicks
  unitsCompleted: 0,
  estimatedMinutes: 240,
  actualMinutes: 0,
  status: 'in_progress',
  revision: 'Rev C',
};

interface RunningOperator {
  id: string;
  name: string;
  role: string;
}

function initialsFor(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

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

  const sessionOperator: RunningOperator | null =
    session.operatorId && session.operatorName
      ? {
          id: session.operatorId,
          name: session.operatorName,
          role: session.operatorRole ?? 'Shop floor operator',
        }
      : null;

  // Overlay mode builds its snapshot from a raw work order, so the runner
  // needs to know who is operating before it opens — no hardcoded identity.
  const [operator, setOperator] = useState<RunningOperator | null>(null);
  const needsOperatorPick = mode === 'overlay' && !snapshot && !!workOrder && !operator;

  const resolvedOperator: RunningOperator =
    operator ??
    sessionOperator ?? {
      id: 'unknown',
      name: 'Operator',
      role: 'Shop floor operator',
    };

  const executionSnapshot = useMemo(() => {
    if (snapshot) return snapshot;
    if (!workOrder) return null;

    const elapsedSeconds =
      mode === 'route' && session.jobStartedAt
        ? Math.max(0, Math.floor((Date.now() - session.jobStartedAt) / 1000))
        : undefined;

    const operatorFields = {
      operatorName: resolvedOperator.name,
      operatorRole: resolvedOperator.role,
      operatorInitials: initialsFor(resolvedOperator.name),
    };

    const seed = USE_CANONICAL
      ? {
          ...workOrder,
          ...CANONICAL,
          ...operatorFields,
          id: workOrder.id,
          machineName: workOrder.machineName ?? workOrder.station ?? CANONICAL.machineName,
          stationName: mode === 'route' ? session.stationName ?? undefined : workOrder.stationName,
        }
      : {
          ...workOrder,
          ...operatorFields,
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
  }, [
    mode,
    resolvedOperator.name,
    resolvedOperator.role,
    session.jobStartedAt,
    session.stationName,
    snapshot,
    workOrder,
  ]);

  if (needsOperatorPick) {
    return (
      <OperatorPickOverlay
        preselected={sessionOperator}
        onPick={setOperator}
        onCancel={onClose}
      />
    );
  }

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

/**
 * Lightweight operator pick for the office overlay — same grid pattern as
 * the kiosk clock-in, but no PIN: this is a supervised office context, the
 * pick exists so execution records carry a real operator identity instead
 * of a hardcoded demo name. If a kiosk floor session is clocked in on this
 * device, that operator is highlighted as the preselected choice.
 */
function OperatorPickOverlay({
  preselected,
  onPick,
  onCancel,
}: {
  preselected: RunningOperator | null;
  onPick: (operator: RunningOperator) => void;
  onCancel: () => void;
}) {
  const [operators, setOperators] = useState<Employee[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');

  const load = useCallback(() => {
    setStatus('loading');
    makeService
      .getOperators()
      .then((roster) => {
        setOperators(roster);
        setStatus('ready');
      })
      .catch((err) => {
        console.error('[shop-floor] failed to load operator roster', err);
        setStatus('error');
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="fixed inset-0 z-[1000] overflow-auto bg-[var(--neutral-100)]">
      <button
        type="button"
        onClick={onCancel}
        aria-label="Close"
        className="absolute right-6 top-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--neutral-200)] bg-card text-[var(--neutral-600)] transition-colors hover:text-[var(--neutral-900)]"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="mx-auto max-w-[960px] px-8 py-16">
        <div className="mb-10">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--neutral-500)]">
            Before you run this job
          </span>
          <h1 className="mt-2 mb-3 text-4xl font-bold text-[var(--neutral-800)]">
            Who&apos;s running this job?
          </h1>
          <p className="text-base text-[var(--neutral-500)]">
            Tap your name — time and quality records are logged against the
            operator.
          </p>
        </div>

        {status === 'loading' ? (
          <div className="flex items-center gap-3 text-sm text-[var(--neutral-500)]">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--mw-yellow-400)]" />
            Loading operators…
          </div>
        ) : status === 'error' ? (
          <div className="flex max-w-[480px] flex-col items-start gap-4 rounded-lg border border-[var(--neutral-200)] bg-card p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-[var(--mw-error)]" />
              <div className="text-base font-medium text-[var(--neutral-800)]">
                Couldn&apos;t load the operator roster.
              </div>
            </div>
            <Button
              onClick={load}
              className="bg-[var(--neutral-800)] px-8 text-white hover:bg-[var(--neutral-900)]"
            >
              Retry
            </Button>
          </div>
        ) : operators.length === 0 ? (
          <div className="max-w-[480px] rounded-lg border border-[var(--neutral-200)] bg-card p-6 text-sm text-[var(--neutral-600)]">
            No shop-floor operators configured — add employees with Make
            access in Control &gt; People.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {operators.map((op) => {
              const isPreselected = preselected?.id === op.id;
              return (
                <button
                  key={op.id}
                  onClick={() => onPick({ id: op.id, name: op.name, role: op.role })}
                  className={`group flex min-h-[180px] flex-col items-center gap-3 rounded-lg border bg-card p-6 transition-all hover:border-[var(--mw-yellow-400)] hover:shadow-[var(--elevation-2)] active:scale-[0.98] ${
                    isPreselected
                      ? 'border-[var(--mw-yellow-400)] ring-2 ring-[var(--mw-yellow-400)]'
                      : 'border-[var(--neutral-200)]'
                  }`}
                >
                  <Avatar className="h-20 w-20 border-2 border-[var(--neutral-200)] transition-colors group-hover:border-[var(--mw-yellow-400)]">
                    <AvatarFallback className="bg-[var(--neutral-800)] text-xl font-bold text-white">
                      {op.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <div className="text-sm font-bold text-[var(--neutral-800)]">
                      {op.name}
                    </div>
                    <div className="mt-0.5 line-clamp-1 text-xs text-[var(--neutral-500)]">
                      {op.role}
                    </div>
                    {isPreselected ? (
                      <div className="mt-1.5 inline-flex rounded-full bg-[var(--mw-yellow-400)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--mw-mirage)]">
                        Clocked in
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
