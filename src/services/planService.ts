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
};
