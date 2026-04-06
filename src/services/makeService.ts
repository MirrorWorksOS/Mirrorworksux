/**
 * Make Service — async facade over mock data.
 * Replace mock imports with Supabase queries when backend is ready.
 */
import * as mock from './mock';
import type {
  Machine,
  ManufacturingOrder,
  WorkOrder,
  CapaRecord,
  BatchLot,
  MaterialConsumptionLine,
  OperatorMessage,
  ScrapRecord,
} from '@/types/entities';

const delay = (ms = 80) => new Promise((r) => setTimeout(r, ms));

export const makeService = {
  // ── Machines ────────────────────────────────────────────────────
  async getMachines(): Promise<Machine[]> {
    await delay();
    return mock.machines;
  },

  async getMachineById(id: string): Promise<Machine | undefined> {
    await delay();
    return mock.machines.find((m) => m.id === id);
  },

  // ── Manufacturing Orders ────────────────────────────────────────
  async getManufacturingOrders(): Promise<ManufacturingOrder[]> {
    await delay();
    return mock.manufacturingOrders;
  },

  async getManufacturingOrderById(id: string): Promise<ManufacturingOrder | undefined> {
    await delay();
    return mock.manufacturingOrders.find((mo) => mo.id === id);
  },

  // ── Work Orders ─────────────────────────────────────────────────
  async getWorkOrders(): Promise<WorkOrder[]> {
    await delay();
    return mock.workOrders;
  },

  async getWorkOrdersByMO(moId: string): Promise<WorkOrder[]> {
    await delay();
    return mock.workOrders.filter((wo) => wo.manufacturingOrderId === moId);
  },

  // ── CAPA ───────────────────────────────────────────────────────
  async getCapaRecords(): Promise<CapaRecord[]> {
    await delay();
    return mock.capaRecords;
  },

  // ── Batch/Lot Traceability ─────────────────────────────────────
  async getBatchLots(): Promise<BatchLot[]> {
    await delay();
    return mock.batchLots;
  },

  // ── Material Consumption ───────────────────────────────────────
  async getMaterialConsumption(): Promise<MaterialConsumptionLine[]> {
    await delay();
    return mock.materialConsumption;
  },

  // ── Operator Chat ──────────────────────────────────────────────
  async getOperatorMessages(jobId: string): Promise<OperatorMessage[]> {
    await delay();
    return mock.operatorMessages.filter((m) => m.jobId === jobId);
  },

  // ── Scrap Records ──────────────────────────────────────────────
  async getScrapRecords(): Promise<ScrapRecord[]> {
    await delay();
    return mock.scrapRecords;
  },
};
