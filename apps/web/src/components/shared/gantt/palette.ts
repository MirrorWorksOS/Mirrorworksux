/**
 * Canonical Gantt status palette — monochrome + MW Yellow.
 *
 * Every Gantt across the product (Make Schedule, Plan Activities,
 * Plan > Jobs > Activities, Sell Activities) reads bar colours from this
 * map so the visual language stays consistent. The original Schedule Engine
 * has its own JobScheduleStatus palette inside `plan/schedule-engine` and
 * is intentionally separate (manufacturing-status semantics).
 *
 * Design intent:
 *   • Completed → MW Yellow 400 (the only colour in the rotation)
 *   • In progress → mid-grey, derived from the chart scale so it sits a
 *     half-step above scheduled
 *   • Scheduled / To do → neutral 400 — the "pending" lightest grey
 *   • Overdue / Blocked → neutral 700 — the "needs attention" dark
 *   • Cancelled → neutral 300 — subdued, almost invisible
 *
 * Foregrounds picked for AA contrast: dark mirage on yellow / light-grey
 * fills, white on the darker fills.
 */

export type MwGanttStatusToken =
  | 'completed'
  | 'in_progress'
  | 'scheduled'
  | 'todo'
  | 'overdue'
  | 'blocked'
  | 'cancelled';

export interface MwGanttStatusStyle {
  /** CSS variable token for the bar fill (the "done" portion). */
  fill: string;
  /** Foreground text/icon colour that pairs with `fill`. */
  foreground: string;
  /** Bar background "track" (the remaining-work portion when progress < 100). */
  track: string;
  /** Pill label shown in hover cards + legends. */
  label: string;
}

/** Lookup the style for a status token. Unknown tokens fall back to `todo`. */
export function statusStyle(token: string | undefined): MwGanttStatusStyle {
  if (!token) return MW_GANTT_PALETTE.todo;
  return MW_GANTT_PALETTE[token as MwGanttStatusToken] ?? MW_GANTT_PALETTE.todo;
}

/** Map an activity/MO/job status string to a canonical Gantt token. */
export function tokenFor(status: string | undefined): MwGanttStatusToken {
  if (!status) return 'todo';
  switch (status) {
    case 'completed':
    case 'done':
      return 'completed';
    case 'in_progress':
    case 'running':
    case 'setup':
      return 'in_progress';
    case 'blocked':
      return 'blocked';
    case 'overdue':
    case 'late':
    case 'at_risk':
      return 'overdue';
    case 'cancelled':
      return 'cancelled';
    case 'scheduled':
    case 'queued':
      return 'scheduled';
    default:
      return 'todo';
  }
}

export const MW_GANTT_PALETTE: Record<MwGanttStatusToken, MwGanttStatusStyle> = {
  completed: {
    fill: 'var(--mw-yellow-400)',
    foreground: 'var(--mw-mirage)',
    track: 'var(--neutral-100)',
    label: 'Completed',
  },
  in_progress: {
    fill: 'var(--mw-mirage)',
    foreground: 'white',
    track: 'var(--neutral-200)',
    label: 'In progress',
  },
  scheduled: {
    fill: 'var(--neutral-400)',
    foreground: 'white',
    track: 'var(--neutral-100)',
    label: 'Scheduled',
  },
  todo: {
    fill: 'var(--neutral-400)',
    foreground: 'white',
    track: 'var(--neutral-100)',
    label: 'To do',
  },
  overdue: {
    fill: 'var(--neutral-700)',
    foreground: 'white',
    track: 'var(--neutral-200)',
    label: 'Overdue',
  },
  blocked: {
    fill: 'var(--neutral-700)',
    foreground: 'white',
    track: 'var(--neutral-200)',
    label: 'Blocked',
  },
  cancelled: {
    fill: 'var(--neutral-300)',
    foreground: 'var(--neutral-600)',
    track: 'var(--neutral-100)',
    label: 'Cancelled',
  },
};

/** Convenience: status → fill colour as a Record<token, string>. */
export const MW_GANTT_STATUS_COLOUR: Record<MwGanttStatusToken, string> = Object.fromEntries(
  Object.entries(MW_GANTT_PALETTE).map(([k, v]) => [k, v.fill]),
) as Record<MwGanttStatusToken, string>;

/** Default legend rows shown under every monochrome Gantt. */
export const MW_GANTT_LEGEND = [
  { key: 'completed', label: 'Completed', color: MW_GANTT_PALETTE.completed.fill },
  { key: 'in_progress', label: 'In progress', color: MW_GANTT_PALETTE.in_progress.fill },
  { key: 'scheduled', label: 'Scheduled', color: MW_GANTT_PALETTE.scheduled.fill },
  { key: 'overdue', label: 'Overdue', color: MW_GANTT_PALETTE.overdue.fill },
] as const;
