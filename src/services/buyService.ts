/**
 * Buy Service — async facade over mock data.
 * Replace mock imports with Supabase queries when backend is ready.
 */
import * as mock from './mock';
import type {
  PurchaseOrder,
  Requisition,
  Bill,
  GoodsReceipt,
  Supplier,
  KpiMetric,
  ApprovalItem,
  ChartDataPoint,
} from '@/types/entities';

const delay = (ms = 80) => new Promise((r) => setTimeout(r, ms));

export const buyService = {
  // ── Purchase Orders ─────────────────────────────────────────────
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    await delay();
    return mock.purchaseOrders;
  },

  async getPurchaseOrderById(id: string): Promise<PurchaseOrder | undefined> {
    await delay();
    return mock.purchaseOrders.find((po) => po.id === id);
  },

  // ── Requisitions ────────────────────────────────────────────────
  async getRequisitions(): Promise<Requisition[]> {
    await delay();
    return mock.requisitions;
  },

  // ── Bills ───────────────────────────────────────────────────────
  async getBills(): Promise<Bill[]> {
    await delay();
    return mock.bills;
  },

  // ── Goods Receipts ──────────────────────────────────────────────
  async getGoodsReceipts(): Promise<GoodsReceipt[]> {
    await delay();
    return mock.goodsReceipts;
  },

  // ── Suppliers ───────────────────────────────────────────────────
  async getSuppliers(): Promise<Supplier[]> {
    await delay();
    return mock.suppliers;
  },

  async getSupplierById(id: string): Promise<Supplier | undefined> {
    await delay();
    return mock.suppliers.find((s) => s.id === id);
  },

  // ── Dashboard ───────────────────────────────────────────────────
  async getKpis(): Promise<Record<string, KpiMetric>> {
    await delay();
    return mock.buyKpis;
  },

  async getSpendByCategory(): Promise<ChartDataPoint[]> {
    await delay();
    return mock.spendByCategory;
  },

  async getSupplierPerformance(): Promise<ChartDataPoint[]> {
    await delay();
    return mock.supplierPerformance;
  },

  async getApprovalQueue(): Promise<ApprovalItem[]> {
    await delay();
    return mock.buyApprovalQueue;
  },
};
