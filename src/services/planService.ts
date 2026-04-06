/**
 * Plan Service — async facade over mock data.
 * Replace mock imports with Supabase queries when backend is ready.
 */
import * as mock from './mock';
import type {
  Job,
  PlanTask,
  WeeklyCapacity,
  KpiMetric,
  CapableToPromiseResult,
  Operation,
  ScheduleBlock,
  WorkCentre,
  MrpNode,
  ShiftAssignment,
  NestingSheet,
  BomGeneratorLine,
} from '@/types/entities';

const delay = (ms = 80) => new Promise((r) => setTimeout(r, ms));

export const planService = {
  // ── Jobs ────────────────────────────────────────────────────────
  async getJobs(): Promise<Job[]> {
    await delay();
    return mock.jobs;
  },

  async getJobById(id: string): Promise<Job | undefined> {
    await delay();
    return mock.jobs.find((j) => j.id === id);
  },

  async getJobByNumber(jobNumber: string): Promise<Job | undefined> {
    await delay();
    return mock.jobs.find((j) => j.jobNumber === jobNumber);
  },

  async getPriorityJobs(): Promise<Job[]> {
    await delay();
    return mock.jobs
      .filter((j) => j.status === 'in_progress' || j.status === 'planned')
      .sort((a, b) => {
        const p = { urgent: 0, high: 1, medium: 2, low: 3 };
        return p[a.priority] - p[b.priority];
      })
      .slice(0, 3);
  },

  // ── Tasks ───────────────────────────────────────────────────────
  async getTodayTasks(): Promise<PlanTask[]> {
    await delay();
    return mock.planTasks;
  },

  // ── Capacity ────────────────────────────────────────────────────
  async getWeeklyCapacity(): Promise<WeeklyCapacity[]> {
    await delay();
    return mock.weeklyCapacity;
  },

  // ── Dashboard ───────────────────────────────────────────────────
  async getKpis(): Promise<Record<string, KpiMetric>> {
    await delay();
    return mock.planKpis;
  },

  // ── Schedule Engine ────────────────────────────────────────────
  async getScheduleBlocks(): Promise<ScheduleBlock[]> {
    await delay();
    return mock.scheduleBlocks;
  },

  async getWorkCentres(): Promise<WorkCentre[]> {
    await delay();
    return mock.workCentres;
  },

  // ── Operations / Routing ───────────────────────────────────────
  async getOperations(): Promise<Operation[]> {
    await delay();
    return mock.operations;
  },

  // ── MRP Tree ───────────────────────────────────────────────────
  async getMrpTree(): Promise<MrpNode[]> {
    await delay();
    return mock.mrpTree;
  },

  // ── Shifts ─────────────────────────────────────────────────────
  async getShiftAssignments(): Promise<ShiftAssignment[]> {
    await delay();
    return mock.shiftAssignments;
  },

  // ── Nesting ────────────────────────────────────────────────────
  async getNestingSheets(): Promise<NestingSheet[]> {
    await delay();
    return mock.nestingSheets;
  },

  // ── BOM Generator ──────────────────────────────────────────────
  async getBomGeneratorLines(): Promise<BomGeneratorLine[]> {
    await delay();
    return mock.bomGeneratorLines;
  },

  // ── Capable-to-Promise (Plan context) ──────────────────────────
  async getCapableToPromise(): Promise<CapableToPromiseResult> {
    await delay();
    const weeksOut = 2 + Math.random() * 2;
    const date = new Date();
    date.setDate(date.getDate() + Math.round(weeksOut * 7));
    return {
      earliestDate: date.toISOString().slice(0, 10),
      confidencePercent: 78 + Math.round(Math.random() * 15),
      capacityUtilization: 72 + Math.round(Math.random() * 20),
      bottleneckWorkCenter: 'Welding',
    };
  },
};
