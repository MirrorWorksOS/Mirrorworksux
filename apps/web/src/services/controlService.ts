/**
 * Control Service — async facade over mock data.
 * Replace the mock implementation with a remote adapter when Convex is ready.
 */
import * as mock from './mock';
import type {
  Employee,
  Product,
  Machine,
  Supplier,
  SystemHealth,
  MaintenanceRecord,
  ToolingItem,
  ControlDocument,
  ShiftAssignment,
  EmployeeShift,
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

  /** Product master rows with BOM presence joined in (Control → Products). */
  async getProductCatalog(): Promise<(Product & { hasBom: boolean })[]> {
    await delay();
    const bomProductIds = new Set(mock.billsOfMaterials.map((b) => b.productId));
    return mock.products.map((p) => ({ ...p, hasBom: bomProductIds.has(p.id) }));
  },

  async createProduct(input: Omit<Product, 'id'>): Promise<Product> {
    await delay();
    const product: Product = {
      ...input,
      id: `prod-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    };
    mock.products.push(product);
    return product;
  },

  async updateProduct(id: string, patch: Partial<Omit<Product, 'id'>>): Promise<Product> {
    await delay();
    const product = mock.products.find((p) => p.id === id);
    if (!product) throw new Error(`Product ${id} not found`);
    Object.assign(product, patch);
    return product;
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

  // ── Maintenance ────────────────────────────────────────────────
  async getMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    await delay();
    return mock.maintenanceRecords;
  },

  // ── Tooling ────────────────────────────────────────────────────
  async getToolingItems(): Promise<ToolingItem[]> {
    await delay();
    return mock.toolingItems;
  },

  // ── Documents ──────────────────────────────────────────────────
  async getDocuments(): Promise<ControlDocument[]> {
    await delay();
    return mock.controlDocuments;
  },

  // ── Shifts ─────────────────────────────────────────────────────
  async getShiftAssignments(): Promise<ShiftAssignment[]> {
    await delay();
    return mock.shiftAssignments;
  },

  /** Employee-level shift schedule (rows in the Shift Manager calendar). */
  async getEmployeeShifts(): Promise<EmployeeShift[]> {
    await delay();
    return mock.employeeShifts;
  },
};
