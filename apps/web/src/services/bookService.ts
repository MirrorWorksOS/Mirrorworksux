/**
 * Book Service — async facade over mock data.
 * Replace the mock implementation with a remote adapter when Convex is ready.
 */
import * as mock from './mock';
import type {
  Expense,
  JobCost,
  SellInvoice,
  Bill,
  KpiMetric,
  ApprovalItem,
  OverdueItem,
  WipValuation,
  CostVarianceRecord,
} from '@/types/entities';

const delay = (ms = 80) => new Promise((r) => setTimeout(r, ms));

export const bookService = {
  // ── Invoices (same pool as Sell, viewed from finance lens) ──────
  async getInvoices(): Promise<SellInvoice[]> {
    await delay();
    return mock.sellInvoices;
  },

  // ── Expenses ────────────────────────────────────────────────────
  async getExpenses(): Promise<Expense[]> {
    await delay();
    return mock.expenses;
  },

  // ── Bills ───────────────────────────────────────────────────────
  async getBills(): Promise<Bill[]> {
    await delay();
    return mock.bills;
  },

  // ── Job Costs ───────────────────────────────────────────────────
  async getJobCosts(): Promise<JobCost[]> {
    await delay();
    return mock.jobCosts;
  },

  async getJobCostById(id: string): Promise<JobCost | undefined> {
    await delay();
    return mock.jobCosts.find((jc) => jc.id === id);
  },

  async getJobCostByJobId(jobId: string): Promise<JobCost | undefined> {
    await delay();
    return mock.jobCosts.find((jc) => jc.jobId === jobId);
  },

  // ── Dashboard ───────────────────────────────────────────────────
  async getKpis(): Promise<Record<string, KpiMetric>> {
    await delay();
    return mock.bookKpis;
  },

  async getApprovalQueue(): Promise<ApprovalItem[]> {
    await delay();
    return mock.bookApprovalQueue;
  },

  async getOverdueItems(): Promise<OverdueItem[]> {
    await delay();
    return mock.bookOverdueItems;
  },

  // ── WIP Valuation ──────────────────────────────────────────────
  async getWipValuations(): Promise<WipValuation[]> {
    await delay();
    return mock.wipValuations;
  },

  // ── Cost Variance ──────────────────────────────────────────────
  async getCostVariance(): Promise<CostVarianceRecord[]> {
    await delay();
    return mock.costVarianceRecords;
  },
};
