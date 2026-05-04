/**
 * Schedule Engine constants — geometry, colour mappings, copy.
 */
import type { JobScheduleStatus } from '@/types/common';

/** Pixel width of one Gantt hour column. */
export const HOUR_PX = 64;

/** Day-view bounds. */
export const DAY_START_HOUR = 6;
export const DAY_END_HOUR = 21;
export const HOURS_IN_VIEW = DAY_END_HOUR - DAY_START_HOUR;

/** Width of the work-centre row label gutter. */
export const ROW_LABEL_PX = 200;

/** Height of one Gantt block. */
export const BLOCK_HEIGHT_PX = 32;

/** Status → CSS variable token. Status colours act as fills on dots / pills / blocks only. */
export const STATUS_COLOUR: Record<JobScheduleStatus, string> = {
  queued: 'var(--neutral-300)',
  setup: 'var(--mw-yellow-300)',
  running: 'var(--mw-success)',
  done: 'var(--mw-success)',
  blocked: 'var(--mw-error)',
  late: 'var(--mw-warning)',
  at_risk: 'var(--mw-warning)',
};

/** Foreground (text/icon) colour to pair with each status fill. */
export const STATUS_FOREGROUND: Record<JobScheduleStatus, string> = {
  queued: 'var(--neutral-900)',
  setup: 'var(--mw-mirage)', // dark text on yellow — house rule
  running: 'white',
  done: 'white',
  blocked: 'white',
  late: 'var(--mw-mirage)', // dark text on warning yellow
  at_risk: 'var(--mw-mirage)',
};

export const STATUS_LABEL: Record<JobScheduleStatus, string> = {
  queued: 'Queued',
  setup: 'Setup',
  running: 'Running',
  done: 'Done',
  blocked: 'Blocked',
  late: 'Late',
  at_risk: 'At risk',
};

/** Steps shown in the AI status panel during Auto-Schedule. */
export const AI_STEPS = [
  'Reading work-centre capacity',
  'Analysing job dependencies',
  'Sequencing 14 operations',
  'Balancing load across 5 work centres',
  'Validating proposed schedule',
] as const;

export const AI_STEP_DURATION_MS = 800;
export const AI_TOTAL_DURATION_MS = AI_STEPS.length * AI_STEP_DURATION_MS;

/** Hatched stripe pattern for the PROPOSAL pill background and projected fills. */
export const HATCHED_STRIPES =
  'repeating-linear-gradient(135deg, var(--mw-yellow-400) 0 4px, transparent 4px 8px)';
