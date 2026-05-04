import { ChevronLeft, Moon, Sun } from 'lucide-react';
import operatorImage from 'figma:asset/ba6178de4b6be80c019e44df2f99d355a1af18f9.png';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import type { AndonStatus, WorkOrderExecutionSnapshot } from './types';

interface AndonTopBarProps {
  mode: 'overlay' | 'route';
  snapshot: WorkOrderExecutionSnapshot;
  status: AndonStatus;
  cycleActualLabel: string;
  cycleTargetLabel: string;
  cycleVariancePct: number;
  cycleSeconds: number;
  syncLabel: string;
  onClose: () => void;
  onResetDemo?: () => void;
}

const STATUS_LABEL: Record<AndonStatus, string> = {
  running: 'Running',
  setup: 'Setup',
  blocked: 'Blocked',
  idle: 'Idle',
};

const STATUS_DOT: Record<AndonStatus, string> = {
  running: 'bg-[var(--mw-success)]',
  setup: 'bg-[var(--mw-yellow-400)]',
  blocked: 'bg-[var(--mw-error)]',
  idle: 'bg-[var(--neutral-400)]',
};

export function AndonTopBar({
  mode,
  snapshot,
  status,
  cycleActualLabel,
  cycleTargetLabel,
  cycleVariancePct,
  cycleSeconds,
  syncLabel,
  onClose,
  onResetDemo,
}: AndonTopBarProps) {
  const isBlocked = status === 'blocked';
  const overTarget = cycleVariancePct > 0;
  const liveCycleLabel = formatCycle(cycleSeconds);

  return (
    <header className={`sticky top-0 z-20 ${isBlocked ? 'border-t-4 border-t-[var(--mw-error)]' : ''}`}>
      <div
        className={`h-16 border-b bg-card px-6 ${
          isBlocked ? 'border-b-[var(--mw-error)]/40 bg-[var(--mw-error)]/8' : 'border-b-[var(--neutral-200)]'
        }`}
      >
        <div className="flex h-full items-center gap-4">
          <Button
            variant="outline"
            size="lg"
            className="h-11 min-w-11 border-[var(--neutral-200)] bg-card text-[var(--neutral-800)]"
            onClick={onClose}
          >
            <ChevronLeft className="h-5 w-5" />
            {mode === 'route' ? 'Back to queue' : 'Back to work orders'}
          </Button>

          <OperatorAvatar
            initials={snapshot.operatorInitials}
            name={snapshot.operatorName}
            role={snapshot.operatorRole}
            machine={snapshot.machineName}
          />

          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              {snapshot.machineName} · {snapshot.operatorName}
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="truncate text-base font-medium text-[var(--neutral-900)]">
                {snapshot.moNumber} · {snapshot.productName}
              </span>
              <span className="text-sm text-[var(--neutral-500)]">{snapshot.woNumber}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex h-9 items-center gap-2 rounded-full border px-3 text-[11px] font-medium uppercase tracking-[0.18em] ${
                isBlocked
                  ? 'border-[var(--mw-error)] bg-[var(--mw-error)]/12 text-[var(--mw-error)]'
                  : 'border-[var(--neutral-200)] bg-card text-[var(--neutral-700)]'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
              {STATUS_LABEL[status]}
            </div>

            <div className="flex h-9 items-center gap-2 rounded-full border border-[var(--neutral-200)] bg-card px-3 text-sm font-medium tabular-nums text-[var(--neutral-900)]">
              <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--neutral-500)]">Cycle</span>
              <span>{liveCycleLabel}</span>
              <span className="text-[var(--neutral-400)]">/</span>
              <span className="text-[var(--neutral-600)]">{cycleTargetLabel}</span>
              {overTarget ? (
                <span className="ml-1 rounded-full bg-[var(--mw-yellow-400)] px-2 py-0.5 text-[11px] font-medium text-[var(--mw-mirage)]">
                  +{cycleVariancePct}%
                </span>
              ) : null}
            </div>

            <div className="hidden h-9 items-center rounded-full border border-[var(--neutral-200)] bg-card px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)] md:flex">
              {syncLabel}
            </div>

            {onResetDemo ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hidden h-9 px-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)] hover:bg-[var(--neutral-100)] md:inline-flex"
                onClick={onResetDemo}
              >
                Reset demo
              </Button>
            ) : null}

            <ThemeToggle />
          </div>
        </div>
      </div>
      {/* Static reference for build-time prop usage */}
      <span className="sr-only">{cycleActualLabel}</span>
    </header>
  );
}

function OperatorAvatar({
  initials,
  name,
  role,
  machine,
}: {
  initials: string;
  name: string;
  role: string;
  machine: string;
}) {
  return (
    <div
      className="hidden items-center gap-2 lg:flex"
      title={`${name} · ${role} · ${machine}`}
    >
      <Avatar className="h-10 w-10 ring-2 ring-[var(--mw-yellow-400)] ring-offset-2 ring-offset-[var(--neutral-100)]">
        <AvatarImage src={operatorImage} alt={name} className="object-cover" />
        <AvatarFallback className="bg-[var(--mw-mirage)] text-[11px] font-medium text-[var(--mw-yellow-400)]">
          {initials}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      aria-label="Toggle dark mode"
      className="h-11 w-11 border-[var(--neutral-200)] bg-card p-0 text-[var(--neutral-800)]"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

function formatCycle(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
