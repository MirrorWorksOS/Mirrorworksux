/**
 * Workflow-archetype fixtures landed across Phases B1–B7.
 *
 * Kept in its own file so the legacy `data.ts` stays unchanged and
 * `workflowService` has a stable seed surface. Every collection is
 * exported as a mutable `let` because the workflow service mutates
 * these arrays in place (matches the existing planService pattern —
 * state survives navigation but resets on full page reload).
 */
import type {
  BillOfMaterials,
  ConcessionRecord,
  CreditNote,
  Customer,
  CustomerReturn,
  EcoSuggestion,
  InventoryRecord,
  PickList,
  ProductReorderRule,
  PutAwayRecord,
  QualityCheck,
  Reservation,
  StockLocation,
  StockMovement,
  SubcontractDispatch,
  SupplierReturn,
  TimeEntry,
  VariationOrder,
} from '@/types/entities';

// ── Stock locations ────────────────────────────────────────────────
export const stockLocations: StockLocation[] = [
  { id: 'loc-raw', code: 'RAW', name: 'Raw Materials', kind: 'raw' },
  { id: 'loc-wip', code: 'WIP', name: 'Work in Progress', kind: 'wip' },
  { id: 'loc-fg', code: 'FG', name: 'Finished Goods', kind: 'finished' },
  { id: 'loc-sub', code: 'SUBCONTRACT', name: 'At Subcontractor', kind: 'subcontract' },
];

// ── Inventory snapshots ────────────────────────────────────────────
export const inventoryRecords: InventoryRecord[] = [
  // Stocked (stock_sale) items with FG stock — replenished via reorder rules.
  { id: 'inv-001', productId: 'prod-005', locationId: 'loc-fg', qtyOnHand: 240, qtyReserved: 30 },
  { id: 'inv-002', productId: 'prod-001', locationId: 'loc-fg', qtyOnHand: 75, qtyReserved: 10 },
  { id: 'inv-003', productId: 'prod-002', locationId: 'loc-raw', qtyOnHand: 12, qtyReserved: 0 },
  { id: 'inv-004', productId: 'prod-007', locationId: 'loc-raw', qtyOnHand: 8, qtyReserved: 0 },
  { id: 'inv-005', productId: 'prod-010', locationId: 'loc-fg', qtyOnHand: 3, qtyReserved: 0 },
];

// ── Product reorder rules (Phase B3 monitor reads these) ──────────
export const productReorderRules: ProductReorderRule[] = [
  {
    id: 'prr-001',
    productId: 'prod-005',
    reorderPoint: 120,
    reorderQty: 200,
    leadTimeDays: 5,
    shortageBehaviour: 'auto_po',
    enabled: true,
  },
  {
    id: 'prr-002',
    productId: 'prod-001',
    reorderPoint: 60,
    reorderQty: 100,
    leadTimeDays: 3,
    shortageBehaviour: 'backorder',
    enabled: true,
  },
];

// ── Bills of Materials ─────────────────────────────────────────────
export const billsOfMaterials: BillOfMaterials[] = [
  {
    id: 'bom-001',
    productId: 'prod-001',
    revision: 'A',
    components: [
      { productId: 'prod-002', qtyPer: 1, isManufactured: false },
    ],
    publishedAt: '2026-01-10',
    publishedBy: 'emp-003',
  },
  {
    id: 'bom-002',
    productId: 'prod-003',
    revision: 'B',
    components: [
      { productId: 'prod-002', qtyPer: 2, isManufactured: false },
      { productId: 'prod-001', qtyPer: 4, isManufactured: true },
    ],
    publishedAt: '2026-02-04',
    publishedBy: 'emp-003',
  },
  {
    id: 'bom-003',
    productId: 'prod-005',
    revision: 'A',
    components: [
      { productId: 'prod-002', qtyPer: 0.5, isManufactured: false },
    ],
    publishedAt: '2026-01-20',
    publishedBy: 'emp-003',
  },
  {
    id: 'bom-004',
    productId: 'prod-006',
    revision: 'A',
    components: [
      { productId: 'prod-001', qtyPer: 2, isManufactured: true, isSubcontracted: true },
      { productId: 'prod-007', qtyPer: 1, isManufactured: false },
    ],
    publishedAt: '2026-02-12',
    publishedBy: 'emp-003',
  },
];

// ── Mutable workflow state (mutated by workflowService) ────────────
export const reservations: Reservation[] = [];
export const stockMovements: StockMovement[] = [];
export const pickLists: PickList[] = [];
export const putAwayRecords: PutAwayRecord[] = [];
export const qualityChecks: QualityCheck[] = [];
export const timeEntries: TimeEntry[] = [];
export const variationOrders: VariationOrder[] = [];
export const creditNotes: CreditNote[] = [];
export const concessionRecords: ConcessionRecord[] = [];
export const supplierReturns: SupplierReturn[] = [];
// ── ECO suggestions (decision 14 — floor flags master-BoM doubts) ──
export const ecoSuggestions: EcoSuggestion[] = [];
export const subcontractDispatches: SubcontractDispatch[] = [];

// ── Customer returns (decision D13 minimal RMA) ────────────────────
// One closed fixture so Ship ▸ Returns demonstrates the finished flow;
// live returns are raised from delivered shipments via createReturn.
export const customerReturns: CustomerReturn[] = [
  {
    id: 'crt-001',
    rmaNumber: 'RMA-2026-0001',
    shipmentId: 'shp-001',
    salesOrderId: 'so-004',
    customerId: 'cust-006',
    customerName: 'Kemppi Australia',
    productId: 'prod-006',
    qty: 1,
    reason: 'Damaged in transit',
    status: 'closed',
    disposition: 'scrap',
    createdAt: '2026-03-24T03:00:00Z',
    receivedAt: '2026-03-27T01:30:00Z',
    closedAt: '2026-03-28T05:10:00Z',
  },
];

// ── Pseudo-customer for replenishment Jobs (Phase B3 audit §4.4) ───
// Used instead of nullable `Job.customerId` to avoid a cascade of
// optional-chaining changes across every component that reads it.
export const stockPseudoCustomer: Customer = {
  id: 'cust-stock',
  company: 'Stock (replenishment)',
  contact: 'Internal',
  email: 'inventory@internal.local',
  phone: '',
  address: '',
  city: '',
  state: '',
  postcode: '',
  totalRevenue: 0,
  activeOpportunities: 0,
  status: 'active',
  notes: 'System customer for make-to-stock replenishment Jobs.',
  createdAt: '2026-01-01',
};
