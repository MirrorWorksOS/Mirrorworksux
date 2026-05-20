/**
 * Job Activity store — CRUD, single-running-timer invariant, manual entry,
 * template apply, and Gantt toolbar state. Pure view-state, no persistence.
 */

import { create } from 'zustand';
import type {
  CustomActivityType,
  JobActivity,
  JobActivityPriority,
  JobActivityStatus,
  JobActivityTemplate,
  JobActivityType,
  ProductKind,
  TemplateActivity,
  TimeEntry,
} from '@/types/job-activity';
import { PLAN_ACTIVITIES_MOCK, PLAN_CURRENT_USER } from '@/data/plan-activities-mock';
import { JOB_ACTIVITY_TEMPLATE_SEEDS } from '@/data/job-activity-templates';

export type ActivityGanttZoom = 'day' | 'week' | 'month';
export type ActivityGanttGroupBy = 'job' | 'assignee' | 'workCentre';

export interface NewActivityInput {
  type: JobActivityType;
  title: string;
  description?: string;
  jobId: string;
  jobNumber: string;
  workCentreId?: string;
  workCentreName?: string;
  travellerId?: string;
  travellerStepLabel?: string;
  estimatedMinutes?: number;
  dueDate?: string;
  plannedStart?: string;
  plannedEnd?: string;
  priority: JobActivityPriority;
  assignedTo: string;
  productKind?: ProductKind;
  templateId?: string;
}

interface JobActivityState {
  activities: JobActivity[];
  /** activityId of the currently running timer (per user, but Phase 1 is single-user) */
  runningTimerActivityId: string | null;
  /** Jobs that have already had a template applied (to avoid re-prompting). */
  templateAppliedJobIds: string[];
  /** Admin-defined activity types — extend the canonical baseline. */
  customActivityTypes: CustomActivityType[];
  /** Recipe registry — seeded from JOB_ACTIVITY_TEMPLATE_SEEDS, fully editable. */
  templates: JobActivityTemplate[];

  // Toolbar state — module-level Activities page
  ganttZoom: ActivityGanttZoom;
  ganttGroupBy: ActivityGanttGroupBy;

  // CRUD
  addActivity: (input: NewActivityInput) => JobActivity;
  updateActivity: (id: string, patch: Partial<JobActivity>) => void;
  deleteActivity: (id: string) => void;
  setStatus: (id: string, status: JobActivityStatus) => void;
  toggleComplete: (id: string) => void;

  // Time tracking
  startTimer: (activityId: string, userName?: string) => void;
  stopTimer: () => void;
  addManualTimeEntry: (
    activityId: string,
    entry: {
      startedAt: string;
      stoppedAt: string;
      userName: string;
      notes?: string;
    },
  ) => void;
  deleteTimeEntry: (activityId: string, entryId: string) => void;

  // Templates
  applyTemplate: (jobId: string, jobNumber: string, templateId: string, jobStartDate?: string) => number;
  markTemplateApplied: (jobId: string) => void;
  hasAppliedTemplate: (jobId: string) => boolean;

  // Gantt toolbar
  setGanttZoom: (z: ActivityGanttZoom) => void;
  setGanttGroupBy: (g: ActivityGanttGroupBy) => void;

  // Custom activity types
  addCustomActivityType: (input: Omit<CustomActivityType, 'id'>) => CustomActivityType;
  updateCustomActivityType: (id: string, patch: Partial<Omit<CustomActivityType, 'id'>>) => void;
  removeCustomActivityType: (id: string) => void;

  // Templates
  addTemplate: (input: Omit<JobActivityTemplate, 'id'>) => JobActivityTemplate;
  updateTemplate: (id: string, patch: Partial<Omit<JobActivityTemplate, 'id'>>) => void;
  removeTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => JobActivityTemplate | null;
  addTemplateActivity: (templateId: string, activity: TemplateActivity) => void;
  updateTemplateActivity: (
    templateId: string,
    index: number,
    patch: Partial<TemplateActivity>,
  ) => void;
  removeTemplateActivity: (templateId: string, index: number) => void;
  reorderTemplateActivities: (templateId: string, fromIndex: number, toIndex: number) => void;
}

function id(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function recompute(activity: JobActivity): JobActivity {
  const total = activity.timeEntries.reduce((sum, e) => {
    if (!e.stoppedAt) return sum;
    return sum + (e.minutes || 0);
  }, 0);
  return { ...activity, loggedMinutes: total };
}

export const useJobActivityStore = create<JobActivityState>((set, get) => ({
  activities: PLAN_ACTIVITIES_MOCK,
  runningTimerActivityId: null,
  templateAppliedJobIds: [],
  customActivityTypes: [
    {
      id: 'custom-tool-change',
      label: 'Tool change',
      iconName: 'Wrench',
      colour: 'var(--mw-info)',
      description: 'Tool / die / fixture change between batches.',
    },
  ],
  templates: JOB_ACTIVITY_TEMPLATE_SEEDS,

  ganttZoom: 'week',
  ganttGroupBy: 'job',

  addActivity: (input) => {
    const nowIso = new Date().toISOString();
    const activity: JobActivity = {
      id: id('act'),
      type: input.type,
      title: input.title,
      description: input.description,
      jobId: input.jobId,
      jobNumber: input.jobNumber,
      workCentreId: input.workCentreId,
      workCentreName: input.workCentreName,
      travellerId: input.travellerId,
      travellerStepLabel: input.travellerStepLabel,
      estimatedMinutes: input.estimatedMinutes,
      loggedMinutes: 0,
      timeEntries: [],
      dueDate: input.dueDate,
      plannedStart: input.plannedStart,
      plannedEnd: input.plannedEnd,
      status: 'todo',
      priority: input.priority,
      assignedTo: input.assignedTo,
      productKind: input.productKind,
      templateId: input.templateId,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    set((state) => ({ activities: [activity, ...state.activities] }));
    return activity;
  },

  updateActivity: (id, patch) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === id ? recompute({ ...a, ...patch, updatedAt: new Date().toISOString() }) : a,
      ),
    })),

  deleteActivity: (id) =>
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
      runningTimerActivityId:
        state.runningTimerActivityId === id ? null : state.runningTimerActivityId,
    })),

  setStatus: (id, status) =>
    set((state) => ({
      activities: state.activities.map((a) => {
        if (a.id !== id) return a;
        const completedAt =
          status === 'completed' && !a.completedAt
            ? new Date().toISOString()
            : status === 'completed'
              ? a.completedAt
              : undefined;
        return { ...a, status, completedAt, updatedAt: new Date().toISOString() };
      }),
    })),

  toggleComplete: (id) => {
    const a = get().activities.find((x) => x.id === id);
    if (!a) return;
    const next: JobActivityStatus = a.status === 'completed' ? 'todo' : 'completed';
    get().setStatus(id, next);
  },

  startTimer: (activityId, userName = PLAN_CURRENT_USER) => {
    // Stop any other running timer first
    const current = get().runningTimerActivityId;
    if (current && current !== activityId) {
      get().stopTimer();
    }
    set((state) => ({
      activities: state.activities.map((a) => {
        if (a.id !== activityId) return a;
        const newEntry: TimeEntry = {
          id: id('te'),
          activityId: a.id,
          userId: `user-${userName.split(' ').join('-').toLowerCase()}`,
          userName,
          startedAt: new Date().toISOString(),
          minutes: 0,
          source: 'timer',
        };
        return {
          ...a,
          status: a.status === 'todo' ? 'in_progress' : a.status,
          actualStart: a.actualStart ?? newEntry.startedAt,
          timeEntries: [...a.timeEntries, newEntry],
          updatedAt: new Date().toISOString(),
        };
      }),
      runningTimerActivityId: activityId,
    }));
  },

  stopTimer: () => {
    const activityId = get().runningTimerActivityId;
    if (!activityId) return;
    set((state) => ({
      activities: state.activities.map((a) => {
        if (a.id !== activityId) return a;
        const updatedEntries = a.timeEntries.map((e) => {
          if (e.stoppedAt) return e;
          const stoppedAt = new Date().toISOString();
          const minutes = Math.max(
            0,
            Math.round((new Date(stoppedAt).getTime() - new Date(e.startedAt).getTime()) / 60_000),
          );
          return { ...e, stoppedAt, minutes };
        });
        return recompute({
          ...a,
          timeEntries: updatedEntries,
          updatedAt: new Date().toISOString(),
        });
      }),
      runningTimerActivityId: null,
    }));
  },

  addManualTimeEntry: (activityId, entry) =>
    set((state) => ({
      activities: state.activities.map((a) => {
        if (a.id !== activityId) return a;
        const minutes = Math.max(
          0,
          Math.round(
            (new Date(entry.stoppedAt).getTime() - new Date(entry.startedAt).getTime()) / 60_000,
          ),
        );
        const te: TimeEntry = {
          id: id('te'),
          activityId,
          userId: `user-${entry.userName.split(' ').join('-').toLowerCase()}`,
          userName: entry.userName,
          startedAt: entry.startedAt,
          stoppedAt: entry.stoppedAt,
          minutes,
          notes: entry.notes,
          source: 'manual',
        };
        return recompute({
          ...a,
          timeEntries: [...a.timeEntries, te],
          updatedAt: new Date().toISOString(),
        });
      }),
    })),

  deleteTimeEntry: (activityId, entryId) =>
    set((state) => ({
      activities: state.activities.map((a) => {
        if (a.id !== activityId) return a;
        return recompute({
          ...a,
          timeEntries: a.timeEntries.filter((e) => e.id !== entryId),
          updatedAt: new Date().toISOString(),
        });
      }),
      runningTimerActivityId:
        state.activities.find((a) => a.id === activityId)?.timeEntries.find(
          (e) => e.id === entryId && !e.stoppedAt,
        )
          ? null
          : state.runningTimerActivityId,
    })),

  applyTemplate: (jobId, jobNumber, templateId, jobStartDate) => {
    const template = get().templates.find((t) => t.id === templateId);
    if (!template) return 0;
    const start = jobStartDate ? new Date(jobStartDate) : new Date();
    const stageOffset: Record<string, number> = {
      planning: 0,
      materials: 2,
      scheduled: 4,
      'in-production': 6,
      'review-close': 9,
    };

    const created: JobActivity[] = [];
    let prevId: string | undefined;
    for (const step of template.activities) {
      const offset =
        step.offsetDaysFromStart !== undefined
          ? step.offsetDaysFromStart
          : step.anchorStage
            ? stageOffset[step.anchorStage] ?? 0
            : 0;
      const dueDate = new Date(start);
      dueDate.setDate(dueDate.getDate() + offset);
      dueDate.setHours(16, 0, 0, 0);
      const nowIso = new Date().toISOString();
      const activity: JobActivity = {
        id: id('act'),
        type: step.type,
        title: step.title,
        description: step.description,
        jobId,
        jobNumber,
        estimatedMinutes: step.estimatedMinutes,
        loggedMinutes: 0,
        timeEntries: [],
        dueDate: dueDate.toISOString(),
        status: 'todo',
        priority: step.priority ?? 'med',
        assignedTo: PLAN_CURRENT_USER,
        blockedBy: prevId ? [prevId] : undefined,
        templateId: template.id,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      created.push(activity);
      if (step.blocksNext) {
        prevId = activity.id;
      } else {
        prevId = undefined;
      }
    }

    set((state) => ({
      activities: [...created, ...state.activities],
      templateAppliedJobIds: state.templateAppliedJobIds.includes(jobId)
        ? state.templateAppliedJobIds
        : [...state.templateAppliedJobIds, jobId],
    }));
    return created.length;
  },

  markTemplateApplied: (jobId) =>
    set((state) =>
      state.templateAppliedJobIds.includes(jobId)
        ? state
        : { templateAppliedJobIds: [...state.templateAppliedJobIds, jobId] },
    ),

  hasAppliedTemplate: (jobId) => get().templateAppliedJobIds.includes(jobId),

  setGanttZoom: (z) => set({ ganttZoom: z }),
  setGanttGroupBy: (g) => set({ ganttGroupBy: g }),

  addCustomActivityType: (input) => {
    const created: CustomActivityType = { id: id('cat'), ...input };
    set((state) => ({ customActivityTypes: [...state.customActivityTypes, created] }));
    return created;
  },

  updateCustomActivityType: (id, patch) =>
    set((state) => ({
      customActivityTypes: state.customActivityTypes.map((t) =>
        t.id === id ? { ...t, ...patch } : t,
      ),
    })),

  removeCustomActivityType: (id) =>
    set((state) => ({
      customActivityTypes: state.customActivityTypes.filter((t) => t.id !== id),
    })),

  // ── Templates ────────────────────────────────────────────────────────

  addTemplate: (input) => {
    const created: JobActivityTemplate = { id: id('tpl'), ...input };
    set((state) => ({ templates: [...state.templates, created] }));
    return created;
  },

  updateTemplate: (templateId, patch) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === templateId ? { ...t, ...patch } : t,
      ),
    })),

  removeTemplate: (templateId) =>
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== templateId),
    })),

  duplicateTemplate: (templateId) => {
    const src = get().templates.find((t) => t.id === templateId);
    if (!src) return null;
    const copy: JobActivityTemplate = {
      ...src,
      id: id('tpl'),
      name: `${src.name} (copy)`,
      activities: src.activities.map((a) => ({ ...a })),
    };
    set((state) => ({ templates: [...state.templates, copy] }));
    return copy;
  },

  addTemplateActivity: (templateId, activity) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === templateId ? { ...t, activities: [...t.activities, activity] } : t,
      ),
    })),

  updateTemplateActivity: (templateId, index, patch) =>
    set((state) => ({
      templates: state.templates.map((t) => {
        if (t.id !== templateId) return t;
        return {
          ...t,
          activities: t.activities.map((a, i) => (i === index ? { ...a, ...patch } : a)),
        };
      }),
    })),

  removeTemplateActivity: (templateId, index) =>
    set((state) => ({
      templates: state.templates.map((t) => {
        if (t.id !== templateId) return t;
        return { ...t, activities: t.activities.filter((_, i) => i !== index) };
      }),
    })),

  reorderTemplateActivities: (templateId, fromIndex, toIndex) =>
    set((state) => ({
      templates: state.templates.map((t) => {
        if (t.id !== templateId) return t;
        if (
          fromIndex === toIndex ||
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= t.activities.length ||
          toIndex >= t.activities.length
        ) {
          return t;
        }
        const next = [...t.activities];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return { ...t, activities: next };
      }),
    })),
}));

/** Selector helpers for derived data. */
export const selectActivitiesForJob = (jobId: string) => (state: JobActivityState) =>
  state.activities.filter((a) => a.jobId === jobId);

export const selectRunningActivity = (state: JobActivityState) =>
  state.runningTimerActivityId
    ? state.activities.find((a) => a.id === state.runningTimerActivityId) ?? null
    : null;

/** Live-registry version of templatesForProductKind — consults the store. */
export const selectTemplatesForProductKind =
  (kind: ProductKind | undefined) =>
  (state: JobActivityState): JobActivityTemplate[] => {
    if (!kind) return [];
    return state.templates.filter((t) => t.productKinds.includes(kind));
  };
