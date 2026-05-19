/**
 * Plan activity shared config — icons, colours, labels, and helpers for
 * job-scoped activity management. Mirrors `sell-activity-shared.ts` for the
 * Plan module's manufacturing-context activity types.
 */

import {
  AlertTriangle,
  CheckSquare,
  ClipboardCheck,
  Cog,
  PackageCheck,
  ShieldCheck,
  StickyNote,
  Tag,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type {
  CanonicalJobActivityType,
  CustomActivityType,
  JobActivityType,
  JobActivityStatus,
  JobActivityPriority,
  ProductKind,
} from '@/types/job-activity';

/** Canonical baseline shipped with the product. Custom types extend this. */
export const CANONICAL_JOB_ACTIVITY_TYPES: CanonicalJobActivityType[] = [
  'task',
  'setup',
  'qc_check',
  'material_check',
  'approval',
  'issue',
  'maintenance',
  'note',
];

export const CANONICAL_TYPE_LABELS: Record<CanonicalJobActivityType, string> = {
  task: 'Task',
  setup: 'Setup',
  qc_check: 'QC check',
  material_check: 'Material check',
  approval: 'Approval',
  issue: 'Issue',
  maintenance: 'Maintenance',
  note: 'Note',
};

export const CANONICAL_TYPE_ICON: Record<CanonicalJobActivityType, LucideIcon> = {
  task: CheckSquare,
  setup: Wrench,
  qc_check: ClipboardCheck,
  material_check: PackageCheck,
  approval: ShieldCheck,
  issue: AlertTriangle,
  maintenance: Cog,
  note: StickyNote,
};

export const CANONICAL_TYPE_COLOUR: Record<CanonicalJobActivityType, string> = {
  task: 'var(--mw-info)',
  setup: 'var(--mw-yellow-400)',
  qc_check: 'var(--mw-success)',
  material_check: 'var(--mw-primary)',
  approval: 'var(--mw-mirage)',
  issue: 'var(--mw-error)',
  maintenance: 'var(--mw-warning)',
  note: 'var(--mw-secondary)',
};

/**
 * Lookup tables that fall back to a placeholder for unknown types. Keeps
 * compile-time consumers happy while allowing custom-string types to flow
 * through. Use the `resolve*` helpers when you need to consult the live
 * custom-types registry from the store.
 */
export const JOB_ACTIVITY_TYPE_LABELS: Record<string, string> = new Proxy(
  CANONICAL_TYPE_LABELS as unknown as Record<string, string>,
  {
    get(target, prop: string) {
      return target[prop] ?? prop;
    },
  },
);

export const JOB_ACTIVITY_TYPE_ICON: Record<string, LucideIcon> = new Proxy(
  CANONICAL_TYPE_ICON as unknown as Record<string, LucideIcon>,
  {
    get(target, prop: string) {
      return target[prop] ?? Tag;
    },
  },
);

export const JOB_ACTIVITY_TYPE_COLOUR: Record<string, string> = new Proxy(
  CANONICAL_TYPE_COLOUR as unknown as Record<string, string>,
  {
    get(target, prop: string) {
      return target[prop] ?? 'var(--mw-secondary)';
    },
  },
);

/**
 * Resolve label/icon/colour for an activity type, consulting both the canonical
 * baseline and the live custom-types registry. Use from React components that
 * have access to `useJobActivityStore`.
 */
export function resolveActivityType(
  type: JobActivityType,
  customTypes: CustomActivityType[],
  iconRegistry?: Record<string, LucideIcon>,
): { label: string; icon: LucideIcon; colour: string } {
  if (type in CANONICAL_TYPE_LABELS) {
    const canonical = type as CanonicalJobActivityType;
    return {
      label: CANONICAL_TYPE_LABELS[canonical],
      icon: CANONICAL_TYPE_ICON[canonical],
      colour: CANONICAL_TYPE_COLOUR[canonical],
    };
  }
  const custom = customTypes.find((t) => t.id === type);
  if (custom) {
    return {
      label: custom.label,
      icon: iconRegistry?.[custom.iconName] ?? Tag,
      colour: custom.colour,
    };
  }
  return { label: type, icon: Tag, colour: 'var(--mw-secondary)' };
}

/** Curated icon palette exposed to the Settings UI for custom-type creation. */
export const CUSTOM_TYPE_ICON_CHOICES: Array<{ name: string; icon: LucideIcon }> = [
  { name: 'Wrench', icon: Wrench },
  { name: 'Cog', icon: Cog },
  { name: 'CheckSquare', icon: CheckSquare },
  { name: 'ClipboardCheck', icon: ClipboardCheck },
  { name: 'PackageCheck', icon: PackageCheck },
  { name: 'ShieldCheck', icon: ShieldCheck },
  { name: 'AlertTriangle', icon: AlertTriangle },
  { name: 'StickyNote', icon: StickyNote },
  { name: 'Tag', icon: Tag },
];

/** Lookup the LucideIcon for a stored `iconName`. */
export function iconForName(name: string): LucideIcon {
  return CUSTOM_TYPE_ICON_CHOICES.find((c) => c.name === name)?.icon ?? Tag;
}

/** Curated colour palette exposed to the Settings UI. */
export const CUSTOM_TYPE_COLOUR_CHOICES: Array<{ name: string; value: string }> = [
  { name: 'Mirage', value: 'var(--mw-mirage)' },
  { name: 'Yellow', value: 'var(--mw-yellow-400)' },
  { name: 'Info', value: 'var(--mw-info)' },
  { name: 'Success', value: 'var(--mw-success)' },
  { name: 'Warning', value: 'var(--mw-warning)' },
  { name: 'Error', value: 'var(--mw-error)' },
  { name: 'Primary', value: 'var(--mw-primary)' },
  { name: 'Secondary', value: 'var(--mw-secondary)' },
];

export const JOB_ACTIVITY_STATUS_LABELS: Record<JobActivityStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  blocked: 'Blocked',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const JOB_ACTIVITY_STATUS_BADGE: Record<
  JobActivityStatus,
  { label: string; className: string }
> = {
  todo: { label: 'To do', className: 'bg-[var(--neutral-300)] text-[var(--mw-mirage)]' },
  in_progress: { label: 'In progress', className: 'bg-[var(--mw-warning)] text-black' },
  blocked: { label: 'Blocked', className: 'bg-[var(--mw-error)] text-white' },
  completed: { label: 'Completed', className: 'bg-[var(--mw-success)] text-white' },
  cancelled: { label: 'Cancelled', className: 'bg-[var(--neutral-200)] text-[var(--neutral-700)]' },
};

export const JOB_ACTIVITY_PRIORITY_LABELS: Record<JobActivityPriority, string> = {
  low: 'Low',
  med: 'Medium',
  high: 'High',
};

export const JOB_ACTIVITY_PRIORITY_BADGE: Record<
  JobActivityPriority,
  { label: string; className: string }
> = {
  low: { label: 'Low', className: 'bg-[var(--mw-secondary)] text-white' },
  med: { label: 'Medium', className: 'bg-[var(--mw-warning)] text-black' },
  high: { label: 'High', className: 'bg-[var(--mw-error)] text-white' },
};

export const PRODUCT_KIND_LABELS: Record<ProductKind, string> = {
  widget: 'Widget',
  configurable: 'Configurable',
  mixed: 'Mixed',
};

/** Format a minutes count as "Xh Ym" or "Xm" / "Xh" when one side is zero. */
export function formatMinutes(min: number): string {
  if (!Number.isFinite(min) || min <= 0) return '0m';
  const h = Math.floor(min / 60);
  const m = Math.round(min - h * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Compute total logged minutes including any live-running timer. */
export function liveLoggedMinutes(activity: {
  loggedMinutes: number;
  timeEntries: { startedAt: string; stoppedAt?: string; minutes: number }[];
}, nowMs: number = Date.now()): number {
  const running = activity.timeEntries.find((e) => !e.stoppedAt);
  if (!running) return activity.loggedMinutes;
  const liveMin = Math.max(
    0,
    Math.floor((nowMs - new Date(running.startedAt).getTime()) / 60_000),
  );
  return activity.loggedMinutes + liveMin;
}

/** Whether an activity is overdue (has a dueDate in the past and isn't done). */
export function isActivityOverdue(activity: {
  dueDate?: string;
  status: JobActivityStatus;
}, nowMs: number = Date.now()): boolean {
  if (activity.status === 'completed' || activity.status === 'cancelled') return false;
  if (!activity.dueDate) return false;
  return new Date(activity.dueDate).getTime() < nowMs;
}

/**
 * Resolve a Gantt-friendly [start, end] range for an activity.
 *
 * Precedence:
 *   1. plannedStart + plannedEnd → use as-is (explicit scheduling).
 *   2. dueDate + estimatedMinutes ≥ 60 → end = due, start = due − estimate.
 *   3. dueDate only → span the whole day of the due date (00:00 → 23:59).
 *   4. No date → start = now, end = +1h.
 *
 * This avoids the "everything looks like a circle" problem on week/month
 * zoom when activities have only a dueDate and no `plannedEnd`.
 */
export function activityToTimeRange(activity: {
  plannedStart?: string;
  plannedEnd?: string;
  dueDate?: string;
  estimatedMinutes?: number;
}): { start: Date; end: Date } {
  if (activity.plannedStart && activity.plannedEnd) {
    return { start: new Date(activity.plannedStart), end: new Date(activity.plannedEnd) };
  }
  if (activity.dueDate) {
    const end = new Date(activity.dueDate);
    if (activity.estimatedMinutes && activity.estimatedMinutes >= 60) {
      return { start: new Date(end.getTime() - activity.estimatedMinutes * 60_000), end };
    }
    // Span the whole day of the due date so the bar is legible at week/month zoom.
    const start = new Date(end);
    start.setHours(0, 0, 0, 0);
    const eod = new Date(end);
    eod.setHours(23, 59, 0, 0);
    return { start, end: eod };
  }
  const start = new Date();
  return { start, end: new Date(start.getTime() + 60 * 60_000) };
}
