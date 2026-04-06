/**
 * Sell Service — async facade over mock data.
 * Replace mock imports with Supabase queries when backend is ready.
 */
import * as mock from './mock';
import type {
  Customer,
  Opportunity,
  Quote,
  SalesOrder,
  SellInvoice,
  SellActivity,
  KpiMetric,
  ApprovalItem,
  OverdueItem,
  ChartDataPoint,
  FunnelStage,
  PerformerSummary,
  QuarterlyTarget,
  ReportTemplate,
  CapableToPromiseResult,
  WinLossRecord,
  LossReasonBreakdown,
} from '@/types/entities';

const delay = (ms = 80) => new Promise((r) => setTimeout(r, ms));

export const sellService = {
  // ── Customers ───────────────────────────────────────────────────
  async getCustomers(): Promise<Customer[]> {
    await delay();
    return mock.customers;
  },

  async getCustomerById(id: string): Promise<Customer | undefined> {
    await delay();
    return mock.customers.find((c) => c.id === id);
  },

  // ── Opportunities ───────────────────────────────────────────────
  async getOpportunities(): Promise<Opportunity[]> {
    await delay();
    return mock.opportunities;
  },

  async getOpportunityById(id: string): Promise<Opportunity | undefined> {
    await delay();
    return mock.opportunities.find((o) => o.id === id);
  },

  /** Customer contact details keyed by customer name (for opportunity detail). */
  async getCustomerContactByName(name: string): Promise<Customer | undefined> {
    await delay();
    return mock.customers.find((c) => c.company === name);
  },

  // ── Quotes ──────────────────────────────────────────────────────
  async getQuotes(): Promise<Quote[]> {
    await delay();
    return mock.quotes;
  },

  async getQuotesByOpportunity(opportunityId: string): Promise<Quote[]> {
    await delay();
    return mock.quotes.filter((q) => q.opportunityId === opportunityId);
  },

  // ── Sales Orders ────────────────────────────────────────────────
  async getSalesOrders(): Promise<SalesOrder[]> {
    await delay();
    return mock.salesOrders;
  },

  // ── Invoices ────────────────────────────────────────────────────
  async getInvoices(): Promise<SellInvoice[]> {
    await delay();
    return mock.sellInvoices;
  },

  // ── Activities ──────────────────────────────────────────────────
  async getActivities(): Promise<SellActivity[]> {
    await delay();
    return mock.sellActivities;
  },

  async getActivitiesByOpportunity(opportunityId: string): Promise<SellActivity[]> {
    await delay();
    return mock.sellActivities.filter((a) => a.opportunityId === opportunityId);
  },

  // ── Dashboard KPIs ──────────────────────────────────────────────
  async getKpis(): Promise<Record<string, KpiMetric>> {
    await delay();
    return mock.sellKpis;
  },

  async getRevenueByMonth(): Promise<ChartDataPoint[]> {
    await delay();
    return mock.revenueByMonth;
  },

  async getJobProfitability(): Promise<ChartDataPoint[]> {
    await delay();
    return mock.jobProfitabilityData;
  },

  async getApprovalQueue(): Promise<ApprovalItem[]> {
    await delay();
    return mock.sellApprovalQueue;
  },

  async getOverdueItems(): Promise<OverdueItem[]> {
    await delay();
    return mock.sellOverdueItems;
  },

  async getPipelineFunnel(): Promise<FunnelStage[]> {
    await delay();
    return mock.pipelineFunnel;
  },

  async getWinLoss(): Promise<{ wins: number; losses: number }> {
    await delay();
    return mock.winLossData;
  },

  async getRevenueTrend(): Promise<ChartDataPoint[]> {
    await delay();
    return mock.revenueTrend;
  },

  async getTopPerformers(): Promise<PerformerSummary[]> {
    await delay();
    return mock.topPerformers;
  },

  async getForecastData(): Promise<ChartDataPoint[]> {
    await delay();
    return mock.forecastChartData;
  },

  async getQuarterlyTargets(): Promise<QuarterlyTarget[]> {
    await delay();
    return mock.quarterlyTargets;
  },

  async getReportTemplates(): Promise<ReportTemplate[]> {
    await delay();
    return mock.sellReportTemplates;
  },

  // ── Capable-to-Promise ──────────────────────────────────────────
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

  // ── Win/Loss Analysis ──────────────────────────────────────────
  async getWinLossHistory(): Promise<WinLossRecord[]> {
    await delay();
    return mock.winLossHistory;
  },

  async getLossReasons(): Promise<LossReasonBreakdown[]> {
    await delay();
    return mock.lossReasons;
  },

  async getQuoteById(id: string): Promise<Quote | undefined> {
    await delay();
    return mock.quotes.find((q) => q.id === id);
  },
};
