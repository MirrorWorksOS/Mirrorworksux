/**
 * Schedule Engine view-state store.
 *
 * Owns the single source of truth for the AI-driven Schedule Engine screen:
 * the current and (optional) proposed snapshots, run-state machine, Gantt
 * toolbar selections, and side-sheet open flags. No persistence — this is
 * pure view state that resets between sessions.
 */
import { create } from 'zustand';

import { planService } from '@/services';
import type {
  AutoScheduleRequest,
  ScheduleSnapshot,
} from '@/types/entities';

export type ScheduleRunState = 'idle' | 'confirming' | 'running' | 'awaiting_approval';
export type GanttGroupBy = 'workCentre' | 'job';
export type GanttZoom = 'day' | 'week' | 'month';
export type GanttFilter = 'all' | 'late' | 'at_risk' | 'rush' | 'today';

export interface ScheduleEngineState {
  current: ScheduleSnapshot | null;
  proposed: ScheduleSnapshot | null;
  runState: ScheduleRunState;
  /** 0..4 while runState === 'running'. */
  currentStepIndex: number;
  selectedJobId: string | null;
  detailSheetOpen: boolean;
  issuesSheetOpen: boolean;
  ganttGroupBy: GanttGroupBy;
  ganttZoom: GanttZoom;
  ganttFilter: GanttFilter;
  /** Banner summary returned by the AI on the most recent proposal. */
  proposalSummary: string | null;
  /** Last apply/discard toast message — consumer clears after rendering. */
  toast: string | null;

  loadSnapshot: () => Promise<void>;
  setRunState: (s: ScheduleRunState) => void;
  setStepIndex: (i: number) => void;
  setProposed: (snap: ScheduleSnapshot | null, summary?: string) => void;
  applyProposal: () => Promise<void>;
  discardProposal: () => Promise<void>;
  /** Mutate a block's start/end times in the current snapshot — used by drag-to-reschedule. */
  moveBlock: (id: string, newStartIso: string, newEndIso: string) => void;
  openJobDetail: (jobId: string) => void;
  closeJobDetail: () => void;
  setIssuesSheetOpen: (open: boolean) => void;
  setGanttGroupBy: (g: GanttGroupBy) => void;
  setGanttZoom: (z: GanttZoom) => void;
  setGanttFilter: (f: GanttFilter) => void;
  clearToast: () => void;
}

export const useScheduleEngineStore = create<ScheduleEngineState>((set, get) => ({
  current: null,
  proposed: null,
  runState: 'idle',
  currentStepIndex: 0,
  selectedJobId: null,
  detailSheetOpen: false,
  issuesSheetOpen: false,
  ganttGroupBy: 'workCentre',
  ganttZoom: 'day',
  ganttFilter: 'all',
  proposalSummary: null,
  toast: null,

  loadSnapshot: async () => {
    const snap = await planService.getScheduleSnapshot();
    set({ current: snap });
  },

  setRunState: (s) => set({ runState: s }),
  setStepIndex: (i) => set({ currentStepIndex: i }),

  setProposed: (snap, summary) =>
    set({
      proposed: snap,
      proposalSummary: summary ?? null,
      runState: snap ? 'awaiting_approval' : 'idle',
    }),

  applyProposal: async () => {
    const proposed = get().proposed;
    if (!proposed) return;
    await planService.applySchedule(proposed.id);
    const fresh = await planService.getScheduleSnapshot();
    set({
      current: fresh,
      proposed: null,
      proposalSummary: null,
      runState: 'idle',
      currentStepIndex: 0,
      toast: 'Schedule applied. 14 operations resequenced.',
    });
  },

  discardProposal: async () => {
    await planService.discardProposal();
    set({
      proposed: null,
      proposalSummary: null,
      runState: 'idle',
      currentStepIndex: 0,
      toast: 'Proposal discarded. Schedule unchanged.',
    });
  },

  moveBlock: (id, newStartIso, newEndIso) => {
    const cur = get().current;
    if (!cur) return;
    set({
      current: {
        ...cur,
        blocks: cur.blocks.map((b) =>
          b.id === id ? { ...b, startTime: newStartIso, endTime: newEndIso } : b,
        ),
      },
    });
  },

  openJobDetail: (jobId) => set({ selectedJobId: jobId, detailSheetOpen: true }),
  closeJobDetail: () => set({ detailSheetOpen: false }),
  setIssuesSheetOpen: (open) => set({ issuesSheetOpen: open }),
  setGanttGroupBy: (g) => set({ ganttGroupBy: g }),
  setGanttZoom: (z) => set({ ganttZoom: z }),
  setGanttFilter: (f) => set({ ganttFilter: f }),
  clearToast: () => set({ toast: null }),
}));
