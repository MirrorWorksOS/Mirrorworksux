import { AlertCircle, Clock3 } from 'lucide-react';

import { cn } from '@/components/ui/utils';
import { PrimaryActionButton } from './PrimaryActionButton';
import { StatusBadge } from './StatusBadge';
import {
  getPrimaryActionLabel,
  type Machine,
  type WorkOrder,
} from './types';

interface MachineCardProps {
  machine: Machine;
  onSelect: (machineId: string) => void;
}

export function MachineCard({ machine, onSelect }: MachineCardProps) {
  const primaryActionLabel = getPrimaryActionLabel(machine.status);
  const isActive = machine.status === 'running' || machine.status === 'setup';

  return (
    <button
      type="button"
      onClick={() => onSelect(machine.id)}
      className={cn(
        'flex h-full min-h-[296px] w-full flex-col rounded-lg border bg-card p-6 text-left',
        'transition-colors duration-[var(--duration-short3)] ease-[var(--ease-standard)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mw-yellow-400)] focus-visible:ring-offset-2',
        isActive
          ? 'border-[var(--neutral-200)] border-l-[3px] border-l-[var(--mw-yellow-400)] shadow-sm hover:border-[var(--neutral-300)] hover:border-l-[var(--mw-yellow-400)] hover:bg-[var(--neutral-50)]'
          : 'border-[var(--neutral-200)] hover:border-[var(--neutral-300)] hover:bg-[var(--neutral-50)]'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {machine.stationGroup ? (
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              {machine.stationGroup}
            </div>
          ) : null}
          <h2 className="mt-3 text-[28px] font-medium leading-[1.05] text-[var(--neutral-900)]">
            {machine.name}
          </h2>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusBadge status={machine.status} />
          {machine.overdue ? (
            <div className="inline-flex min-h-9 items-center rounded-full border border-[var(--mw-error)]/20 bg-[var(--mw-error)]/5 px-3 text-sm font-medium text-[var(--mw-error)]">
              Overdue
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <JobPanel
          label="Current job"
          job={machine.currentJob}
          emptyLabel="No job running"
          active={isActive && Boolean(machine.currentJob)}
        />
        <JobPanel label="Next job" job={machine.nextJob} emptyLabel="No next job queued" />
      </div>

      <div className="mt-auto pt-6">
        {machine.blockingIssue ? (
          <div className="mb-4 rounded-md border border-[var(--mw-error)]/20 bg-[var(--mw-error)]/5 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mw-error)]" />
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--mw-error)]">
                  Blocking issue
                </div>
                <p className="mt-1 text-sm text-[var(--neutral-800)]">
                  {machine.blockingIssue}
                </p>
              </div>
            </div>
          </div>
        ) : machine.cycleTimeLabel ? (
          <div className="mb-4 flex min-h-11 items-center gap-2 rounded-md border border-[var(--neutral-200)] bg-[var(--neutral-100)] px-4 text-sm text-[var(--neutral-700)]">
            <Clock3 className="h-4 w-4 text-[var(--neutral-500)]" />
            <span>Cycle target {machine.cycleTimeLabel}</span>
          </div>
        ) : null}

        <PrimaryActionButton label={primaryActionLabel} />
      </div>
    </button>
  );
}

interface JobPanelProps {
  label: string;
  job?: WorkOrder;
  emptyLabel: string;
  active?: boolean;
}

function JobPanel({ label, job, emptyLabel, active = false }: JobPanelProps) {
  return (
    <div
      className={cn(
        'rounded-md border p-4',
        active
          ? 'border-[var(--mw-yellow-300)] bg-[var(--mw-yellow-50)]'
          : 'border-[var(--neutral-200)] bg-[var(--neutral-100)]'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em]',
          active ? 'text-[var(--neutral-900)]' : 'text-[var(--neutral-500)]'
        )}
      >
        {active ? (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--mw-success)] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--mw-success)]" />
          </span>
        ) : null}
        <span>{active ? `${label} · Active` : label}</span>
      </div>

      {job ? (
        <div className="mt-3 space-y-2">
          <div
            className={cn(
              'text-base font-medium text-[var(--neutral-900)]',
              active && 'font-semibold'
            )}
          >
            {job.operation}
          </div>
          <div className="text-sm text-[var(--neutral-700)]">
            {job.moNumber} · {job.productName}
          </div>
          <div className="text-sm text-[var(--neutral-500)]">
            {job.customerName}
          </div>
        </div>
      ) : (
        <div className="mt-3 text-sm text-[var(--neutral-500)]">{emptyLabel}</div>
      )}
    </div>
  );
}
