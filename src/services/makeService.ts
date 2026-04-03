/**
 * Make Service — async facade over mock data.
 * Replace mock imports with Supabase queries when backend is ready.
 */
import * as mock from './mock';
import type {
  Machine,
  ManufacturingOrder,
  WorkOrder,
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
};
