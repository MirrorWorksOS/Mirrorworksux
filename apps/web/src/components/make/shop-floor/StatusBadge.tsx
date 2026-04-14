import { cn } from '@/components/ui/utils';
import type { MachineStatus } from './types';

interface StatusBadgeProps {
  status: MachineStatus;
}

const STATUS_STYLES: Record<
  MachineStatus,
  {
    label: string;
    className: string;
    dotClassName: string;
  }
> = {
  idle: {
    label: 'Idle',
    className:
      'border-[var(--neutral-200)] bg-[var(--neutral-100)] text-[var(--neutral-700)]',
    dotClassName: 'bg-[var(--neutral-400)]',
  },
  running: {
    label: 'Running',
    className:
      'border-[var(--neutral-200)] bg-card text-[var(--neutral-800)]',
    dotClassName: 'bg-[var(--neutral-700)]',
  },
  blocked: {
    label: 'Blocked',
    className:
      'border-[var(--mw-error)]/20 bg-[var(--mw-error)]/5 text-[var(--mw-error)]',
    dotClassName: 'bg-[var(--mw-error)]',
  },
  setup: {
    label: 'Setup',
    className:
      'border-[var(--mw-yellow-300)] bg-[var(--mw-yellow-50)] text-[var(--neutral-800)]',
    dotClassName: 'bg-[var(--mw-yellow-400)]',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status];

  return (
    <div
      className={cn(
        'inline-flex min-h-10 items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium',
        style.className
      )}
    >
      <span className={cn('h-2.5 w-2.5 rounded-full', style.dotClassName)} />
      {style.label}
    </div>
  );
}
