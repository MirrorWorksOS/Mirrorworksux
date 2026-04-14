/**
 * Make Service — async facade over mock data.
 * Replace the mock implementation with a remote adapter when Convex is ready.
 */
import * as mock from './mock';
import type {
  Employee,
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

  // ── Operators (shop-floor capable employees) ───────────────────
  /**
   * Returns employees eligible to use the shop-floor kiosk: anyone with
   * the `make` module mapping. Note: the mock data is intentionally loose
   * here — in production this would be a role/permission query.
   */
  async getOperators(): Promise<Employee[]> {
    await delay();
    return mock.employees.filter(
      (e) => e.status === 'active' && e.modules.some((m) => m.module === 'make')
    );
  },

  async getOperatorById(id: string): Promise<Employee | undefined> {
    await delay();
    return mock.employees.find((e) => e.id === id);
  },

  // ── Pending queue for a station ────────────────────────────────
  /**
   * Returns pending + in_progress work orders assigned to a station
   * (machine), ordered by sequence. Used by FloorScanJob to show the
   * operator what's queued at their station right now.
   */
  async getPendingWorkOrdersForStation(machineId: string): Promise<WorkOrder[]> {
    await delay();
    return mock.workOrders
      .filter(
        (wo) =>
          wo.machineId === machineId &&
          (wo.status === 'pending' || wo.status === 'in_progress')
      )
      .sort((a, b) => a.sequence - b.sequence);
  },

  async getWorkOrderById(id: string): Promise<WorkOrder | undefined> {
    await delay();
    return mock.workOrders.find((wo) => wo.id === id);
  },
};
