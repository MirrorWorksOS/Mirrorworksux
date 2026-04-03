/**
 * Control Service — async facade over mock data.
 * Replace mock imports with Supabase queries when backend is ready.
 */
import * as mock from './mock';
import type {
  Employee,
  Product,
  Machine,
  Supplier,
  SystemHealth,
} from '@/types/entities';

const delay = (ms = 80) => new Promise((r) => setTimeout(r, ms));

export const controlService = {
  // ── System Health ───────────────────────────────────────────────
  async getSystemHealth(): Promise<SystemHealth> {
    await delay();
    return mock.systemHealth;
  },

  // ── People ──────────────────────────────────────────────────────
  async getEmployees(): Promise<Employee[]> {
    await delay();
    return mock.employees;
  },

  async getEmployeeById(id: string): Promise<Employee | undefined> {
    await delay();
    return mock.employees.find((e) => e.id === id);
  },

  // ── Products ────────────────────────────────────────────────────
  async getProducts(): Promise<Product[]> {
    await delay();
    return mock.products;
  },

  async getProductById(id: string): Promise<Product | undefined> {
    await delay();
    return mock.products.find((p) => p.id === id);
  },

  // ── Machines ────────────────────────────────────────────────────
  async getMachines(): Promise<Machine[]> {
    await delay();
    return mock.machines;
  },

  // ── Suppliers ───────────────────────────────────────────────────
  async getSuppliers(): Promise<Supplier[]> {
    await delay();
    return mock.suppliers;
  },
};
