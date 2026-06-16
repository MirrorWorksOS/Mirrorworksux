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
  { id: 'loc-recv', code: 'RECEIVING', name: 'Goods In', kind: 'raw' },
  { id: 'loc-raw', code: 'RAW', name: 'Raw Materials', kind: 'raw' },
  { id: 'loc-wip', code: 'WIP', name: 'Work in Progress', kind: 'wip' },
  { id: 'loc-fg', code: 'FG', name: 'Finished Goods', kind: 'finished' },
  { id: 'loc-sub', code: 'SUBCONTRACT', name: 'At Subcontractor', kind: 'subcontract' },
  // Virtual write-off location — scrap movements land here; excluded
  // from valuation KPIs (see inventoryService.getValuationSummary).
  { id: 'loc-scrap', code: 'SCRAP', name: 'Scrap (virtual)', kind: 'scrap' },
];

// ── Inventory snapshots ────────────────────────────────────────────
export const inventoryRecords: InventoryRecord[] = [
  // Stocked (stock_sale) items with FG stock — replenished via reorder rules.
  { id: 'inv-001', productId: 'prod-005', locationId: 'loc-fg', qtyOnHand: 240, qtyReserved: 30 },
  { id: 'inv-002', productId: 'prod-001', locationId: 'loc-fg', qtyOnHand: 75, qtyReserved: 10 },
  { id: 'inv-003', productId: 'prod-002', locationId: 'loc-raw', qtyOnHand: 12, qtyReserved: 0 },
  { id: 'inv-004', productId: 'prod-007', locationId: 'loc-raw', qtyOnHand: 8, qtyReserved: 0 },
  { id: 'inv-005', productId: 'prod-010', locationId: 'loc-fg', qtyOnHand: 3, qtyReserved: 0 },
  // Inventory page seeds — every product appears somewhere; covers a
  // multi-location product (prod-001), a low-stock row vs reorder rule
  // (prod-005 raw components), an out-of-stock row (prod-008), and a
  // small balance in the virtual scrap location for demo credibility.
  { id: 'inv-006', productId: 'prod-001', locationId: 'loc-raw', qtyOnHand: 140, qtyReserved: 24 },
  { id: 'inv-007', productId: 'prod-001', locationId: 'loc-wip', qtyOnHand: 16, qtyReserved: 0 },
  { id: 'inv-008', productId: 'prod-003', locationId: 'loc-fg', qtyOnHand: 9, qtyReserved: 2 },
  { id: 'inv-009', productId: 'prod-004', locationId: 'loc-wip', qtyOnHand: 2, qtyReserved: 0 },
  { id: 'inv-010', productId: 'prod-006', locationId: 'loc-sub', qtyOnHand: 6, qtyReserved: 0 },
  { id: 'inv-011', productId: 'prod-008', locationId: 'loc-fg', qtyOnHand: 0, qtyReserved: 0 },
  { id: 'inv-012', productId: 'prod-009', locationId: 'loc-fg', qtyOnHand: 14, qtyReserved: 4 },
  { id: 'inv-013', productId: 'prod-002', locationId: 'loc-scrap', qtyOnHand: 4, qtyReserved: 0 },
  { id: 'inv-014', productId: 'prod-005', locationId: 'loc-raw', qtyOnHand: 90, qtyReserved: 0 },
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
  // Trips the Low badge on the Inventory ledger (prod-009 holds 14 in FG).
  {
    id: 'prr-003',
    productId: 'prod-009',
    reorderPoint: 20,
    reorderQty: 40,
    leadTimeDays: 7,
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
// Seeded with ~3 weeks of representative history so the Inventory
// Movements ledger reads true on first load; workflowService and
// inventoryService both push onto this same array instance.
export const stockMovements: StockMovement[] = [
  { id: 'sm-seed-001', productId: 'prod-002', toLocationId: 'loc-recv', qty: 40, reason: 'gr', at: '2026-05-18T09:12:00Z', refType: 'po', refId: 'po-1041' },
  { id: 'sm-seed-002', productId: 'prod-002', fromLocationId: 'loc-recv', toLocationId: 'loc-raw', qty: 40, reason: 'putaway', at: '2026-05-18T10:05:00Z' },
  { id: 'sm-seed-003', productId: 'prod-007', toLocationId: 'loc-recv', qty: 12, reason: 'gr', at: '2026-05-20T08:40:00Z', refType: 'po', refId: 'po-1043' },
  { id: 'sm-seed-004', productId: 'prod-007', fromLocationId: 'loc-recv', toLocationId: 'loc-raw', qty: 12, reason: 'putaway', at: '2026-05-20T09:15:00Z' },
  { id: 'sm-seed-005', productId: 'prod-001', fromLocationId: 'loc-raw', qty: 24, reason: 'pick', at: '2026-05-22T07:55:00Z', refType: 'work_order', refId: 'wo-2207' },
  { id: 'sm-seed-006', productId: 'prod-001', fromLocationId: 'loc-raw', toLocationId: 'loc-wip', qty: 24, reason: 'consume', at: '2026-05-22T08:20:00Z', refType: 'work_order', refId: 'wo-2207' },
  { id: 'sm-seed-007', productId: 'prod-001', fromLocationId: 'loc-wip', toLocationId: 'loc-fg', qty: 22, reason: 'putaway', at: '2026-05-26T15:30:00Z', refType: 'mo', refId: 'mo-1108' },
  { id: 'sm-seed-008', productId: 'prod-001', fromLocationId: 'loc-wip', toLocationId: 'loc-scrap', qty: 2, reason: 'scrap', at: '2026-05-26T15:42:00Z', refType: 'mo', refId: 'mo-1108', reasonCode: 'QC reject', note: 'Weld porosity on flange' },
  { id: 'sm-seed-009', productId: 'prod-006', fromLocationId: 'loc-wip', toLocationId: 'loc-sub', qty: 6, reason: 'sub_out', at: '2026-05-28T11:00:00Z', refType: 'mo', refId: 'mo-1110' },
  { id: 'sm-seed-010', productId: 'prod-005', fromLocationId: 'loc-raw', qty: 30, reason: 'pick', at: '2026-05-29T08:05:00Z', refType: 'work_order', refId: 'wo-2215' },
  { id: 'sm-seed-011', productId: 'prod-005', fromLocationId: 'loc-wip', toLocationId: 'loc-fg', qty: 30, reason: 'putaway', at: '2026-06-01T16:10:00Z', refType: 'mo', refId: 'mo-1112' },
  { id: 'sm-seed-012', productId: 'prod-002', fromLocationId: 'loc-raw', toLocationId: 'loc-scrap', qty: 2, reason: 'scrap', at: '2026-06-02T13:25:00Z', reasonCode: 'Damaged', note: 'Forklift damage in racking' },
  { id: 'sm-seed-013', productId: 'prod-009', toLocationId: 'loc-fg', qty: 14, reason: 'gr', at: '2026-06-03T09:50:00Z', refType: 'po', refId: 'po-1047' },
  { id: 'sm-seed-014', productId: 'prod-010', fromLocationId: 'loc-fg', qty: 1, reason: 'pick', at: '2026-06-04T10:30:00Z', refType: 'so_line', refId: 'soline-310' },
  { id: 'sm-seed-015', productId: 'prod-003', fromLocationId: 'loc-wip', toLocationId: 'loc-fg', qty: 9, reason: 'putaway', at: '2026-06-05T14:45:00Z', refType: 'mo', refId: 'mo-1115' },
  { id: 'sm-seed-016', productId: 'prod-007', fromLocationId: 'loc-raw', qty: 4, reason: 'adjust', at: '2026-06-06T08:00:00Z', reasonCode: 'Count error', note: 'Quarterly cycle count variance' },
  { id: 'sm-seed-017', productId: 'prod-002', fromLocationId: 'loc-scrap', qty: 1, reason: 'adjust', at: '2026-06-06T08:10:00Z', reasonCode: 'Data entry fix', note: 'Scrap bin reconciliation' },
  { id: 'sm-seed-018', productId: 'prod-008', fromLocationId: 'loc-fg', qty: 1, reason: 'pick', at: '2026-06-08T09:20:00Z', refType: 'so_line', refId: 'soline-318' },
  { id: 'sm-seed-019', productId: 'prod-004', fromLocationId: 'loc-raw', toLocationId: 'loc-wip', qty: 2, reason: 'consume', at: '2026-06-09T07:45:00Z', refType: 'work_order', refId: 'wo-2230' },
  { id: 'sm-seed-020', productId: 'prod-005', toLocationId: 'loc-raw', qty: 18, reason: 'adjust', at: '2026-06-10T11:35:00Z', reasonCode: 'Found stock', note: 'Found in unmarked bin during 5S' },
];
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
