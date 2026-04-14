import { ArrowLeftRight, ChevronLeft, Wifi, WifiOff } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type {
  ExecutionState,
  SyncState,
  WorkOrderExecutionSnapshot,
} from './types';

interface ExecutionHeaderProps {
  mode: 'overlay' | 'route';
  snapshot: WorkOrderExecutionSnapshot;
  syncState: SyncState;
  syncLabel: string;
  pendingActions: number;
  onClose: () => void;
  onSwitchOperator?: () => void;
}

const STATE_META: Record<
  ExecutionState,
  { label: string; className: string }
> = {
  setup: {
    label: 'Setup',
    className:
      'border-[var(--neutral-200)] bg-[var(--neutral-100)] text-[var(--neutral-800)]',
  },
  run: {
    label: 'Run',
    className:
      'border-transparent bg-[var(--mw-yellow-400)] text-primary-foreground',
  },
  inspect: {
    label: 'Inspect',
    className:
      'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] text-[var(--neutral-800)]',
  },
  blocked: {
    label: 'Blocked',
    className:
      'border-[var(--mw-error)] bg-[var(--mw-error)]/10 text-[var(--mw-error)]',
  },
  complete: {
    label: 'Complete',
    className:
      'border-[var(--mw-success)] bg-[var(--mw-success)]/10 text-[var(--mw-success)]',
  },
};

export function ExecutionHeader({
  mode,
  snapshot,
  syncState,
  syncLabel,
  pendingActions,
  onClose,
  onSwitchOperator,
}: ExecutionHeaderProps) {
  const syncIsOnline = syncState !== 'offline';
  const stateMeta = STATE_META[snapshot.executionState];

  return (
    <header className="border-b border-[var(--neutral-200)] bg-card px-6 py-4 shadow-xs">
      <div className="flex flex-wrap items-center gap-4">
        <Button
          variant="outline"
          size="lg"
          className="border-[var(--neutral-200)] bg-card text-[var(--neutral-800)]"
          onClick={onClose}
        >
          <ChevronLeft className="h-5 w-5" />
          {mode === 'route' ? 'Back to queue' : 'Back to work orders'}
        </Button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
            <span>{snapshot.stationName ?? snapshot.machineName}</span>
            <span className="text-[var(--neutral-300)]">•</span>
            <span>{snapshot.operatorName}</span>
            <span className="text-[var(--neutral-300)]">•</span>
            <span>{snapshot.operatorRole}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="truncate text-[28px] font-bold leading-tight text-[var(--neutral-900)]">
              {snapshot.moNumber} · {snapshot.productName}
            </h1>
            <span className="text-base text-[var(--neutral-500)]">
              {snapshot.woNumber} · {snapshot.currentStep.title}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge
            variant="outline"
            className="h-9 border-[var(--neutral-200)] px-3 text-[11px] uppercase tracking-[0.18em] text-[var(--neutral-700)]"
          >
            {snapshot.revision}
          </Badge>

          <Badge className={`h-9 px-3 text-[11px] uppercase tracking-[0.18em] ${stateMeta.className}`}>
            {stateMeta.label}
          </Badge>

          <Badge
            variant="outline"
            className="h-9 gap-1.5 border-[var(--neutral-200)] px-3 text-[11px] uppercase tracking-[0.18em] text-[var(--neutral-700)]"
          >
            {syncIsOnline ? (
              <Wifi className="h-3.5 w-3.5 text-[var(--mw-success)]" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-[var(--mw-error)]" />
            )}
            {syncLabel}
            {pendingActions > 0 ? ` · ${pendingActions} pending` : ''}
          </Badge>

          {snapshot.cycleTimeLabel && snapshot.targetCycleTimeLabel ? (
            <Badge
              variant="outline"
              className="h-9 border-[var(--neutral-200)] px-3 text-[11px] uppercase tracking-[0.18em] text-[var(--neutral-700)]"
            >
              Cycle {snapshot.cycleTimeLabel} / {snapshot.targetCycleTimeLabel}
            </Badge>
          ) : null}

          {onSwitchOperator ? (
            <Button
              variant="outline"
              size="lg"
              className="border-[var(--neutral-200)] bg-card text-[var(--neutral-800)]"
              onClick={onSwitchOperator}
            >
              <ArrowLeftRight className="h-5 w-5" />
              Switch operator
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
