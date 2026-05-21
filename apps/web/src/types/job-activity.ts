/**
 * Job Activity types — task/checklist layer for jobs, with built-in time tracking.
 *
 * Activities live ALONGSIDE the ScheduleBlock (production schedule). They cover
 * the things a planner/operator does that aren't a scheduled production block:
 * approvals, setup checks, QC, material chasing, issues, downtime, notes.
 */

/**
 * Activity type identifier — string-widened so admin-defined custom types
 * (managed in Plan Settings) flow through alongside the canonical baseline.
 *
 * Use `CANONICAL_JOB_ACTIVITY_TYPES` from `plan-activity-shared.ts` when you
 * need the strict shipped set (e.g. to seed the type dropdown).
 */
export type JobActivityType = string;

export type CanonicalJobActivityType =
  | 'task'
  | 'setup'
  | 'qc_check'
  | 'material_check'
  | 'approval'
  | 'issue'
  | 'maintenance'
  | 'note';

/** Definition of a user-defined activity type — managed in Plan Settings. */
export interface CustomActivityType {
  id: string;
  label: string;
  /** Lucide-icon name. Falls back to "Tag" if unknown. */
  iconName: string;
  /** CSS variable token or hex/colour string. */
  colour: string;
  /** Optional description shown in admin UI. */
  description?: string;
}

export type JobActivityStatus =
  | 'todo'
  | 'in_progress'
  | 'blocked'
  | 'completed'
  | 'cancelled';

export type JobActivityPriority = 'low' | 'med' | 'high';

export type ProductKind = 'widget' | 'configurable' | 'mixed';

export interface TimeEntry {
  id: string;
  activityId: string;
  userId: string;
  userName: string;
  /** ISO start timestamp. */
  startedAt: string;
  /** ISO stop timestamp. `undefined` = timer currently running. */
  stoppedAt?: string;
  /** Computed once `stoppedAt` is set. For running timers, callers compute
   *  live from `Date.now() - startedAt`. */
  minutes: number;
  notes?: string;
  /** `timer` = recorded via Start/Stop. `manual` = back-dated entry. */
  source: 'timer' | 'manual';
}

export interface JobActivity {
  id: string;
  type: JobActivityType;
  title: string;
  description?: string;

  /** Job linkage (required). */
  jobId: string;
  jobNumber: string;
  /** Optional traveller step linkage. */
  travellerId?: string;
  travellerStepLabel?: string;
  /** Optional work-centre linkage. */
  workCentreId?: string;
  workCentreName?: string;

  /** Scheduling. Either a `dueDate` (date-only) or a planned start/end block. */
  plannedStart?: string;
  plannedEnd?: string;
  dueDate?: string;
  actualStart?: string;
  actualEnd?: string;

  /** Time tracking. */
  estimatedMinutes?: number;
  /** Cached sum of `timeEntries[].minutes` plus any running-timer elapsed. */
  loggedMinutes: number;
  timeEntries: TimeEntry[];

  status: JobActivityStatus;
  priority: JobActivityPriority;
  assignedTo: string;

  /** Finish-to-start dependencies. */
  blockedBy?: string[];

  /** Denormalised from the parent Job — used for filter facets. */
  productKind?: ProductKind;
  /** Provenance — set when the activity originated from a template apply. */
  templateId?: string;

  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

/** Template registry entry — declarative recipe applied to a single job. */
export interface JobActivityTemplate {
  id: string;
  name: string;
  description: string;
  productKinds: ProductKind[];
  activities: TemplateActivity[];
}

export interface TemplateActivity {
  type: JobActivityType;
  title: string;
  description?: string;
  estimatedMinutes?: number;
  /** Offset days from job startDate. Mutually exclusive with anchorStage. */
  offsetDaysFromStart?: number;
  /** Anchor due-date to a job stage instead of a fixed day offset. */
  anchorStage?: 'planning' | 'materials' | 'scheduled' | 'in-production' | 'review-close';
  /** If true, the *next* template activity gets this one in its `blockedBy`. */
  blocksNext?: boolean;
  priority?: JobActivityPriority;
  /**
   * Default assignee copied into `JobActivity.assignedTo` at apply-time.
   * Many-to-one over **people**: a single User OR Team (mutually exclusive).
   * Machines live on `defaultMachine` — different concept (where vs who).
   */
  defaultAssignee?: Assignee;
  /**
   * Default machine for this activity (e.g. "Laser Cutter #1"). Separate
   * from `defaultAssignee` because a machine is a resource the activity
   * runs *on*, not the person/crew responsible *for* it.
   */
  defaultMachine?: Assignee;
}

/** Polymorphic assignee target — user, production team, or machine. */
export type AssigneeKind = 'user' | 'team' | 'machine';

export interface Assignee {
  kind: AssigneeKind;
  /** Stable id within the source registry (User id, Group id, Machine id). */
  id: string;
  /** Denormalised display label so renderers never need the source registry. */
  label: string;
}
