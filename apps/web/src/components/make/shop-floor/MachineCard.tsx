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

  return (
    <button
      type="button"
      onClick={() => onSelect(machine.id)}
      className={cn(
        'flex h-full min-h-[296px] w-full flex-col rounded-[16px] border border-[var(--neutral-200)] bg-card p-6 text-left',
        'transition-colors duration-[var(--duration-short3)] ease-[var(--ease-standard)]',
        'hover:border-[var(--neutral-300)] hover:bg-[var(--neutral-50)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mw-yellow-400)] focus-visible:ring-offset-2'
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
        <JobPanel label="Current job" job={machine.currentJob} emptyLabel="No job running" />
        <JobPanel label="Next job" job={machine.nextJob} emptyLabel="No next job queued" />
      </div>

      <div className="mt-auto pt-6">
        {machine.blockingIssue ? (
          <div className="mb-4 rounded-[var(--shape-md)] border border-[var(--mw-error)]/20 bg-[var(--mw-error)]/5 p-4">
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
          <div className="mb-4 flex min-h-11 items-center gap-2 rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-[var(--neutral-100)] px-4 text-sm text-[var(--neutral-700)]">
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
}

function JobPanel({ label, job, emptyLabel }: JobPanelProps) {
  return (
    <div className="rounded-[var(--shape-md)] border border-[var(--neutral-200)] bg-[var(--neutral-100)] p-4">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
        {label}
      </div>

      {job ? (
        <div className="mt-3 space-y-2">
          <div className="text-base font-medium text-[var(--neutral-900)]">
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
