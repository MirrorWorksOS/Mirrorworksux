/**
 * LiveFloorView — Wall-display Andon board for the shop floor.
 *
 * Designed for a 3–10m viewing distance on a mounted TV, not a desk browser.
 * - Forces dark theme (reduces glare under factory lighting)
 * - Large typography: 60–72px clock, 48px timers, 30px names, 20px labels
 * - One-signal-per-card colour semantics (status = dominant card colour)
 * - Live ticker updates every second for timers + clock
 *
 * Sections (top to bottom priority):
 *  1. Shift header  — big clock, shift name, remaining time, on-track summary
 *  2. Summary ribbon — machine status counts as coloured pills
 *  3. Machine Andon grid — each machine as a full-colour status card
 *  4. Operator grid  — each active operator with estimated vs actual timer
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Wrench,
  Zap,
  Activity,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/components/ui/utils';
import {
  activeOperators,
  machines as centralMachines,
  type ActiveOperator,
} from '@/services';
import type { Machine } from '@/types/entities';
import type { MachineStatus } from '@/types/common';

// ─── Shift configuration ──────────────────────────────────────────────
// In real data this comes from the shift schedule. Hardcoded for the prototype.
const SHIFT = {
  name: 'Day Shift',
  endHour: 17, // 5pm
  endMinute: 0,
};

// ─── Colour helpers ───────────────────────────────────────────────────

interface StatusStyle {
  /** Full-bleed card background */
  cardBg: string;
  /** Text colour on that background */
  cardText: string;
  /** Ribbon pill background (lighter/translucent) */
  pillBg: string;
  pillText: string;
  icon: LucideIcon;
  label: string;
}

const MACHINE_STATUS: Record<MachineStatus, StatusStyle> = {
  running: {
    cardBg: 'bg-[var(--mw-success,_#16a34a)]',
    cardText: 'text-white',
    pillBg: 'bg-[var(--mw-success,_#16a34a)]',
    pillText: 'text-white',
    icon: CheckCircle2,
    label: 'Running',
  },
  idle: {
    cardBg: 'bg-[var(--mw-yellow-400)]',
    cardText: 'text-[var(--mw-mirage)]',
    pillBg: 'bg-[var(--mw-yellow-400)]',
    pillText: 'text-[var(--mw-mirage)]',
    icon: Clock,
    label: 'Idle',
  },
  setup: {
    cardBg: 'bg-[var(--mw-amber,_#f59e0b)]',
    cardText: 'text-[var(--mw-mirage)]',
    pillBg: 'bg-[var(--mw-amber,_#f59e0b)]',
    pillText: 'text-[var(--mw-mirage)]',
    icon: Zap,
    label: 'Setup',
  },
  down: {
    cardBg: 'bg-[var(--mw-error,_#ef4444)]',
    cardText: 'text-white',
    pillBg: 'bg-[var(--mw-error,_#ef4444)]',
    pillText: 'text-white',
    icon: AlertTriangle,
    label: 'Down',
  },
  maintenance: {
    cardBg: 'bg-[var(--neutral-700,_#404040)]',
    cardText: 'text-white',
    pillBg: 'bg-[var(--neutral-700,_#404040)]',
    pillText: 'text-white',
    icon: Wrench,
    label: 'Maintenance',
  },
};

type TimeState = 'on-track' | 'near' | 'over';

function getTimeState(ratio: number): TimeState {
  if (ratio > 1.0) return 'over';
  if (ratio >= 0.8) return 'near';
  return 'on-track';
}

// ─── Shift header: clock + remaining time + on-track headline ─────────

function formatClock(d: Date) {
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  const ss = d.getSeconds().toString().padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function formatRemaining(now: Date): string {
  const end = new Date(now);
  end.setHours(SHIFT.endHour, SHIFT.endMinute, 0, 0);
  const diffMs = end.getTime() - now.getTime();
  if (diffMs <= 0) return 'Shift ended';
  const hours = Math.floor(diffMs / 3_600_000);
  const mins = Math.floor((diffMs % 3_600_000) / 60_000);
  return `${hours}h ${mins.toString().padStart(2, '0')}m remaining`;
}

function ShiftHeader({
  now,
  onTrackCount,
  totalOperators,
}: {
  now: number;
  onTrackCount: number;
  totalOperators: number;
}) {
  const date = new Date(now);
  return (
    <div className="flex flex-wrap items-end justify-between gap-6 border-b border-white/10 pb-6">
      <div className="space-y-1">
        <p className="text-xl font-medium uppercase tracking-widest text-white/60">
          {SHIFT.name}
        </p>
        <p className="text-[72px] leading-none font-semibold tabular-nums text-white">
          {formatClock(date)}
        </p>
        <p className="text-xl text-white/70 tabular-nums">{formatRemaining(date)}</p>
      </div>
      <div className="text-right">
        <p className="text-xl font-medium uppercase tracking-widest text-white/60">
          Operators on track
        </p>
        <p className="text-[72px] leading-none font-semibold tabular-nums text-[var(--mw-yellow-400)]">
          {onTrackCount}
          <span className="text-white/40">/{totalOperators}</span>
        </p>
      </div>
    </div>
  );
}

// ─── Summary ribbon: machine status counts as big pills ──────────────

function SummaryRibbon({ machines }: { machines: Machine[] }) {
  const counts = machines.reduce(
    (acc, m) => {
      acc[m.status] = (acc[m.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<MachineStatus, number>,
  );

  const order: MachineStatus[] = ['running', 'setup', 'idle', 'down', 'maintenance'];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
      {order.map((status) => {
        const style = MACHINE_STATUS[status];
        const count = counts[status] ?? 0;
        const Icon = style.icon;
        return (
          <div
            key={status}
            className={cn(
              'flex items-center gap-4 rounded-[var(--shape-lg)] px-5 py-4',
              style.pillBg,
              style.pillText,
              count === 0 && 'opacity-40',
            )}
          >
            <Icon className="h-8 w-8 shrink-0" strokeWidth={2} aria-hidden />
            <div className="min-w-0">
              <p className="text-4xl font-semibold leading-none tabular-nums">{count}</p>
              <p className="mt-1 text-sm font-medium uppercase tracking-wide">
                {style.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Machine Andon card: full-bleed colour = status ──────────────────

function MachineAndonCard({ machine }: { machine: Machine }) {
  const style = MACHINE_STATUS[machine.status];
  const Icon = style.icon;
  return (
    <Card
      className={cn(
        'rounded-[var(--shape-lg)] border-0 p-6',
        style.cardBg,
        style.cardText,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-3xl font-semibold leading-tight">{machine.name}</p>
          <p className="mt-1 text-lg opacity-80">{machine.workCenter}</p>
        </div>
        <Icon className="h-14 w-14 shrink-0" strokeWidth={1.75} aria-hidden />
      </div>

      <p className="text-2xl font-bold uppercase tracking-wider">{style.label}</p>

      <div className="mt-5 space-y-3 border-t border-current/20 pt-5 text-base">
        {machine.currentJobNumber ? (
          <div className="flex items-baseline justify-between gap-4">
            <span className="opacity-70">Job</span>
            <span className="text-xl font-semibold tabular-nums">
              {machine.currentJobNumber}
            </span>
          </div>
        ) : null}
        {machine.operatorName ? (
          <div className="flex items-baseline justify-between gap-4">
            <span className="opacity-70">Operator</span>
            <span className="text-xl font-semibold">{machine.operatorName}</span>
          </div>
        ) : null}
        <div className="flex items-baseline justify-between gap-4">
          <span className="opacity-70">Utilisation</span>
          <span className="text-2xl font-semibold tabular-nums">
            {machine.utilizationToday}%
          </span>
        </div>
      </div>
    </Card>
  );
}

// ─── Operator card: timer-first, status-coloured accent ──────────────

function OperatorCard({ op, now }: { op: ActiveOperator; now: number }) {
  const elapsedMinutes = Math.max(
    0,
    (now - new Date(op.startedAt).getTime()) / 60_000,
  );
  const ratio = elapsedMinutes / op.estimatedMinutes;
  const state = getTimeState(ratio);
  const barPercent = Math.min(ratio * 100, 100);

  const isBreak = op.status === 'break';
  const isPaused = op.status === 'paused';

  // Card-wide colour cue for the dominant state
  const cardBg =
    state === 'over'
      ? 'bg-[var(--mw-error,_#ef4444)] text-white'
      : isBreak
      ? 'bg-[var(--neutral-800,_#262626)] text-white/70'
      : isPaused
      ? 'bg-[var(--neutral-800,_#262626)] text-white'
      : 'bg-[var(--neutral-900,_#171717)] text-white';

  const barColor =
    state === 'over'
      ? 'bg-white'
      : state === 'near'
      ? 'bg-[var(--mw-yellow-400)]'
      : 'bg-[var(--mw-success,_#16a34a)]';

  const timerColor =
    state === 'over'
      ? 'text-white'
      : state === 'near'
      ? 'text-[var(--mw-yellow-400)]'
      : 'text-white';

  return (
    <Card
      className={cn(
        'rounded-[var(--shape-lg)] border-0 p-6',
        cardBg,
        state === 'over' && 'animate-pulse',
      )}
    >
      {/* Operator identity */}
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/15 text-2xl font-semibold">
          {op.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-3xl font-semibold leading-tight">{op.name}</p>
          <p className="truncate text-lg opacity-70">{op.machine}</p>
        </div>
        {isBreak && (
          <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium uppercase tracking-wide">
            On break
          </span>
        )}
        {isPaused && (
          <span className="rounded-full bg-[var(--mw-yellow-400)] px-3 py-1 text-sm font-bold uppercase tracking-wide text-[var(--mw-mirage)]">
            Paused
          </span>
        )}
      </div>

      {/* Work order line */}
      <div className="mb-5">
        <p className="text-xl font-semibold tabular-nums opacity-90">{op.woNumber}</p>
        <p className="text-lg opacity-70">{op.operationName}</p>
      </div>

      {/* Big timer — the hero metric */}
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <span className={cn('text-[56px] leading-none font-semibold tabular-nums', timerColor)}>
          {Math.floor(elapsedMinutes)}
          <span className="text-3xl opacity-60"> / {op.estimatedMinutes} min</span>
        </span>
        {state === 'over' && (
          <span className="rounded-md bg-white/20 px-3 py-1 text-xl font-bold uppercase tracking-wide">
            +{Math.floor(elapsedMinutes - op.estimatedMinutes)}m over
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-4 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={cn('h-full rounded-full transition-all duration-1000', barColor)}
          style={{ width: `${barPercent}%` }}
        />
      </div>
    </Card>
  );
}

// ─── Dark-mode lock: force the whole app into dark while Live Floor is mounted ─
// Direct DOM manipulation (rather than setTheme) avoids writing to theme storage
// so the user's preference is preserved when they leave the tab.

function useForceDarkMode() {
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    if (!wasDark) {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    return () => {
      if (!wasDark) {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    };
  }, []);
}

// ─── Main view ───────────────────────────────────────────────────────

export function LiveFloorView() {
  const [now, setNow] = useState(() => Date.now());
  const [isExpanded, setIsExpanded] = useState(false);

  useForceDarkMode();

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Escape key exits expanded mode — matches browser fullscreen conventions
  useEffect(() => {
    if (!isExpanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isExpanded]);

  // Prevent body scroll while the overlay is open
  useEffect(() => {
    if (!isExpanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isExpanded]);

  // On-track operator count (active + under estimate)
  const onTrack = activeOperators.filter((op) => {
    if (op.status !== 'active') return false;
    const elapsed = (now - new Date(op.startedAt).getTime()) / 60_000;
    return elapsed / op.estimatedMinutes < 1.0;
  }).length;
  const activeCount = activeOperators.filter((op) => op.status === 'active').length;

  const body = (
    <div className="mx-auto flex max-w-[1800px] flex-col gap-8">
      <ShiftHeader now={now} onTrackCount={onTrack} totalOperators={activeCount} />

      <section aria-label="Machine status summary">
        <SummaryRibbon machines={centralMachines} />
      </section>

      <section aria-label="Machines">
        <h2 className="mb-4 text-2xl font-medium uppercase tracking-widest text-white/60">
          Machines
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {centralMachines.map((m) => (
            <MachineAndonCard key={m.id} machine={m} />
          ))}
        </div>
      </section>

      <section aria-label="Operators">
        <div className="mb-4 flex items-baseline gap-4">
          <h2 className="text-2xl font-medium uppercase tracking-widest text-white/60">
            Operators
          </h2>
          <span className="flex items-center gap-2 text-sm text-white/40">
            <Activity className="h-4 w-4" aria-hidden />
            Live — updates every second
          </span>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {activeOperators.map((op) => (
            <OperatorCard key={op.id} op={op} now={now} />
          ))}
        </div>
      </section>
    </div>
  );

  const expandButton = (
    <button
      type="button"
      onClick={() => setIsExpanded((v) => !v)}
      aria-label={isExpanded ? 'Exit full screen' : 'Expand to full screen'}
      title={isExpanded ? 'Exit full screen (Esc)' : 'Expand to full screen'}
      className="inline-flex h-12 items-center gap-2 rounded-[var(--shape-md)] border border-white/15 bg-white/5 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mw-yellow-400)]"
    >
      {isExpanded ? (
        <>
          <Minimize2 className="h-5 w-5" aria-hidden />
          Exit full screen
        </>
      ) : (
        <>
          <Maximize2 className="h-5 w-5" aria-hidden />
          Full screen
        </>
      )}
    </button>
  );

  return (
    <>
      {/* Inline (tab) view — always mounted so the exit animation reveals it
          without a layout jump. When the overlay is open it's hidden behind. */}
      <div
        className="dark -m-8 min-h-[calc(100vh-140px)] bg-[var(--neutral-950,_#0a0a0a)] p-8 text-white"
        aria-hidden={isExpanded}
      >
        <div className="mx-auto max-w-[1800px]">
          <div className="mb-6 flex justify-end">{expandButton}</div>
          {body}
        </div>
      </div>


      {/* Expanded overlay — animated in/out with easing */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="live-floor-expanded"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="dark fixed inset-0 z-[60] overflow-y-auto bg-[var(--neutral-950,_#0a0a0a)] p-8 text-white"
            role="dialog"
            aria-modal="true"
            aria-label="Live floor — full screen"
          >
            <div className="pointer-events-none sticky top-0 z-10 mb-6 flex justify-end">
              <div className="pointer-events-auto">{expandButton}</div>
            </div>
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
            >
              {body}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
