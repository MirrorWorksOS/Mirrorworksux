// ─── MirrorWorks Business Entity Types ──────────────────────────────
// Single source of truth for every data entity that flows through the
// Sell → Plan → Make → Ship → Book pipeline. IDs use string (UUID-ready).

import type {
  Priority,
  TrendDirection,
  CustomerStatus,
  OpportunityStage,
  QuoteStatus,
  SalesOrderStatus,
  InvoiceStatus,
  ActivityType,
  ActivityStatus,
  POStatus,
  RequisitionStatus,
  BillStatus,
  JobStatus,
  TaskType,
  ManufacturingOrderStatus,
  MachineStatus,
  WorkOrderStatus,
  NestStatus,
  NestingQueueStatus,
  SheetStockStatus,
  GrainDirection,
  ControlSystem,
  ShipmentStage,
  ShippingExceptionType,
  ExpenseStatus,
  ExpenseCategory,
  ApprovalItemType,
  ModuleKey,
  MaintenanceStatus,
  DocumentStatus,
  ToolStatus,
  CapaStatus,
  CapaSeverity,
  BatchStatus,
  MrpNodeStatus,
  JobScheduleStatus,
} from './common';

// ═════════════════════════════════════════════════��═════════════════════
// SHARED / CROSS-MODULE
// ═══════════════════════════════════════════════════════════════════════

export interface Customer {
  id: string;
  company: string;
  /** Legacy primary-contact name. Prefer `contacts[]` for portal flows. */
  contact: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  totalRevenue: number;
  activeOpportunities: number;
  status: CustomerStatus;
  notes: string;
  createdAt: string;
  /** Employee id of the account manager responsible for this customer. */
  accountManagerId?: string;
  /** Customer-portal contacts (multi-user). Falls back to legacy `contact`+`email` if empty. */
  contacts?: CustomerContact[];
  /** Tag chips (e.g. "Strategic", "Repeat customer", "Export"). */
  tags?: CustomerTag[];
  /** Default payment term id from Control → Settings → Payment terms. */
  paymentTermsId?: string;
  /** When true, this customer has access to the customer portal. */
  portalAccess?: boolean;
  /** Email-notification opt-ins per template kind. */
  notificationPrefs?: NotificationPreferences;
}

/** Tag chip — visual badge on customers/opportunities, also used for filtering. */
export interface CustomerTag {
  id: string;
  label: string;
  /** Optional badge tone — falls back to neutral. */
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'info' | 'error';
}

/** Per-customer email notification opt-ins. Templates configured in Control. */
export interface NotificationPreferences {
  quoteSent?: boolean;
  quoteAccepted?: boolean;
  orderConfirmed?: boolean;
  orderShipped?: boolean;
  invoiceIssued?: boolean;
  statementSent?: boolean;
}

/** Role governs what a customer contact can do inside the portal. Mirrors internal admin/lead/team. */
export type CustomerContactRole = 'admin' | 'lead' | 'team';

/** Invitation/access state for a single customer contact. */
export type CustomerContactStatus =
  | 'invited'          // invite sent, not yet accepted
  | 'active'           // accepted + can log in
  | 'revoked'          // explicitly removed from portal
  | 'pending';         // added but no invite yet

export interface CustomerContact {
  id: string;
  customerId: string;
  name: string;
  email: string;
  phone?: string;
  title?: string;
  role: CustomerContactRole;
  status: CustomerContactStatus;
  invitedAt?: string;
  acceptedAt?: string;
  revokedAt?: string;
  lastLoginAt?: string;
  /** If true, this is the primary billing contact surfaced on invoices. */
  isPrimaryBilling?: boolean;
}

export interface Product {
  id: string;
  /**
   * Internal stock-keeping unit. Owned by us, stable across revisions,
   * used for inventory and barcode generation. Distinct from
   * `partNumber` (the manufacturer / customer part number).
   * Falls back to `partNumber` for legacy seed rows.
   */
  sku?: string;
  partNumber: string;
  description: string;
  material: string;
  unitPrice: number;
  weightKg: number;
  category: string;
  isActive: boolean;
  /** Product image — optional placeholder path */
  imageUrl?: string;
  /** Cuttable geometry, populated for parts that flow through nesting. */
  geometry?: ProductGeometry;
  /** Current engineering revision label (Rev A, Rev B…). */
  revision?: string;
  /** Date the current revision took effect. */
  revisionEffectiveAt?: string;
  /**
   * Preferred / excluded machines per routing operation, keyed by
   * operation id. Surfaced on the Manufacturing tab; consumed by
   * Plan / Make schedulers to enforce capability constraints.
   */
  routingMachinePrefs?: Record<string, RoutingMachinePrefs>;
}

/** Preferred / excluded machines for a single routing step on a product. */
export interface RoutingMachinePrefs {
  preferredMachineIds?: string[];
  excludedMachineIds?: string[];
  toolingIds?: string[];
}

/** Geometry attached to a Product for nesting / cut-routing flows. */
export interface ProductGeometry {
  /** Bounding box of the flat pattern. */
  bboxMm: { widthMm: number; heightMm: number };
  thicknessMm: number;
  grade: string;
  /** Reference to the canonical DXF for this part. */
  dxfAssetId?: string;
  allowRotation: boolean;
  /** Allowed nesting rotations in degrees. */
  rotationStepsDeg: number[];
  /**
   * True when the part may be mirrored (flipped) by the nester to improve
   * yield. Default false — opt-in. Ignored on grain-sensitive sheets, and
   * by part-specific asymmetric features (bend lines, etches) that the
   * programmer flags off.
   */
  allowMirror: boolean;
  /** True when grain direction must be preserved relative to the sheet. */
  grainSensitive: boolean;
}

export interface Supplier {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  category: string;
  paymentTerms: string;
  onTimePercent: number;
  rating: number;
}

export interface Employee {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: string;
  department: string;
  hourlyRate: number;
  startDate: string;
  status: 'active' | 'invited' | 'deactivated';
  modules: { module: ModuleKey; groups: string[] }[];
  lastActive: string;
}

// ═══════════════════════════════════════════════════════════════════════
// SELL MODULE
// ═══════════════════════════════════════════════════════════════════════

export interface Opportunity {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  value: number;
  expectedClose: string;
  assignedTo: string;
  assignedToInitials: string;
  priority: Priority;
  stage: OpportunityStage;
  probabilityPercent: number;
  tags: string[];
  /** AI-driven lead score 0–100 */
  aiScore?: number;
  /** Reason for loss if stage === 'lost' */
  lossReason?: string;
}

export interface Quote {
  id: string;
  ref: string;
  opportunityId: string;
  customerId: string;
  customerName: string;
  date: string;
  expiryDate: string;
  value: number;
  status: QuoteStatus;
  /** Employee id of the sales rep who owns this quote. */
  repId?: string;
  lineItems: QuoteLineItem[];
  /** E-signature acceptance timestamp */
  acceptedAt?: string;
  /** Who accepted the quote */
  acceptedBy?: string;
  /** Signature image URL placeholder */
  signatureUrl?: string;
  /** Quote revision history */
  revisions?: QuoteRevision[];
  /** Chat messages between shop and customer */
  messages?: QuoteMessage[];
  /** Files uploaded with this quote */
  uploadedFiles?: { name: string; type: string; sizeKb: number }[];
  /** Customer view/open events */
  viewEvents?: QuoteViewEvent[];
  /** Per-quote payment term override (otherwise inherits from customer). */
  paymentTermsId?: string;
  /** Terms & conditions template id from Control → Legal templates. */
  termsAndConditionsId?: string;
  /** Free-form internal/customer-visible notes. */
  notes?: string;
  /** Customer-visible message attached to the emailed quote. */
  customerMessage?: string;
  /** Chronological audit log — populated on edit/send/accept/revise. */
  history?: QuoteHistoryEntry[];
  /** When the quote was sent and locked. */
  sentAt?: string;
  /** Current revision label (e.g. "v2"). */
  currentRevisionLabel?: string;
}

export interface QuoteLineItem {
  productId: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
  /** Per-unit cost — drives margin calculation. */
  unitCost?: number;
  /** Margin percent (0–100). */
  margin?: number;
  /** Product thumbnail URL — falls back to Product.imageUrl. */
  imageUrl?: string;
}

/** Audit entry written every time the quote changes meaningful state. */
export interface QuoteHistoryEntry {
  id: string;
  at: string;
  action: string;
  user: string;
  fromValue?: string;
  toValue?: string;
  note?: string;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  quoteId?: string;
  date: string;
  deliveryDate: string;
  status: SalesOrderStatus;
  total: number;
  jobId?: string;
  /** Employee id of the sales rep who owns this order. */
  repId?: string;
  /** Carrier (e.g. "DHL", "StarTrack") — duplicated from Ship for at-a-glance. */
  carrier?: string;
  /** Tracking number from the carrier. */
  trackingNumber?: string;
  /** Free-form delivery / fulfilment notes. */
  fulfilmentNotes?: string;
  /** Shipping label tags (e.g. "Fragile", "Pickup", "Inside delivery"). */
  fulfilmentLabels?: string[];
  /** When the sales order was confirmed. */
  confirmedAt?: string;
}

export interface SellInvoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  salesOrderId?: string;
  date: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: InvoiceStatus;
}

export interface SellActivity {
  id: string;
  type: ActivityType;
  description: string;
  opportunityId?: string;
  opportunityTitle?: string;
  customerId?: string;
  /** Quote id when the activity attaches to a quote (follow-up, view, etc.). */
  quoteId?: string;
  assignedTo: string;
  dueDate: string;
  status: ActivityStatus;
  /** Activity priority — surfaces in lists, gantt, badges. */
  priority?: 'low' | 'med' | 'high';
  /** Short subject/title rendered in lists; falls back to `description`. */
  subject?: string;
}

/** Capable-to-Promise delivery estimate */
export interface CapableToPromiseResult {
  earliestDate: string;
  confidencePercent: number;
  capacityUtilization: number;
  bottleneckWorkCenter?: string;
}

/** DXF analysis mock result */
export interface DxfAnalysisResult {
  fileName: string;
  materialYieldPercent: number;
  estimatedCutMinutes: number;
  sheetUtilizationPercent: number;
  materialCostAud: number;
  partsPerSheet: number;
  sheetDimensions: { widthMm: number; heightMm: number };
}

// ─── Upload Analysis ───────────────────────────────────────────────

/** Result from AI file upload analysis */
export interface UploadAnalysisResult {
  fileId: string;
  fileName: string;
  fileType: 'cad' | 'spreadsheet' | 'image' | 'document';
  extractedItems: ExtractedLineItem[];
  metadata: {
    customerHint?: string;
    deliveryDateHint?: string;
    materialSummary?: string;
    routingSummary?: string;
  };
}

/** Line item extracted from uploaded file */
export interface ExtractedLineItem {
  id: string;
  description: string;
  suggestedSku?: string;
  material?: string;
  qty: number;
  unit: string;
  estimatedCost: number;
  suggestedPrice: number;
  confidence: number;
  source: string;
  routingSteps?: string[];
}

// ─── Quote Heuristics ──────────────────────────────────────────────

/** AI heuristic analysis for a quote */
export interface QuoteHeuristics {
  winProbability: number;
  factors: { label: string; impact: 'positive' | 'negative' | 'neutral'; detail: string }[];
  priceCompetitiveness: {
    thisQuote: number;
    historicalWinRange: [number, number];
    verdict: 'competitive' | 'high' | 'low';
  };
  marginSuggestions: {
    lineItemIndex: number;
    currentMargin: number;
    suggestedMargin: number;
    reason: string;
  }[];
  riskFlags: {
    severity: 'low' | 'medium' | 'high';
    title: string;
    detail: string;
  }[];
  customerInsights: {
    avgOrderValue: number;
    totalLifetimeValue: number;
    avgDaysToAccept: number;
    quotesAccepted: number;
    quotesDeclined: number;
  };
}

// ─── Quote Revisions & Chat ────────────────────────────────────────

/** A single version in quote revision history */
export interface QuoteRevision {
  version: number;
  date: string;
  changedBy: 'shop' | 'customer_request';
  changes: string[];
  totalValue: number;
}

/** Chat message between shop and customer on a quote */
export interface QuoteMessage {
  id: string;
  quoteId: string;
  sender: 'customer' | 'shop';
  senderName: string;
  message: string;
  timestamp: string;
  attachments?: { name: string; sizeKb: number }[];
}

/** Customer view/open event for a quote */
export interface QuoteViewEvent {
  id: string;
  quoteId: string;
  viewedBy: string;
  viewedAt: string;
  source: 'email_link' | 'portal';
  duration?: number;
  deviceType?: 'desktop' | 'mobile';
}

/** Win/loss analysis data point */
export interface WinLossRecord {
  month: string;
  wins: number;
  losses: number;
  winRate: number;
  avgDaysToClose: number;
}

/** Loss reason breakdown */
export interface LossReasonBreakdown {
  reason: string;
  count: number;
  totalValue: number;
}

// ══════════════════════════════════════════════════════════════════════
// BUY MODULE
// ══════════════════════════════════════════════════════════════════════��

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  deliveryDate: string;
  status: POStatus;
  total: number;
  received: number;
  jobId?: string;
}

export interface Requisition {
  id: string;
  reqNumber: string;
  requestorId: string;
  requestorName: string;
  date: string;
  status: RequisitionStatus;
  items: RequisitionItem[];
  total: number;
}

export interface RequisitionItem {
  productId: string;
  description: string;
  qty: number;
  estimatedCost: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  supplierId: string;
  supplierName: string;
  poId?: string;
  date: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: BillStatus;
}

export interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  poId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: GoodsReceiptItem[];
}

export interface GoodsReceiptItem {
  productId: string;
  description: string;
  orderedQty: number;
  receivedQty: number;
  acceptedQty: number;
}

/** MRP-driven purchase suggestion */
export interface MrpSuggestion {
  id: string;
  material: string;
  grade: string;
  totalQtyNeeded: number;
  currentStock: number;
  shortfall: number;
  suggestedSupplierId: string;
  suggestedSupplierName: string;
  estimatedCostAud: number;
  jobIds: string[];
}

/** Reorder rule for automated PO triggers */
export interface ReorderRule {
  id: string;
  material: string;
  grade: string;
  minStock: number;
  maxStock: number;
  currentStock: number;
  reorderPoint: number;
  preferredSupplierId: string;
  preferredSupplierName: string;
  autoPoEnabled: boolean;
}

/** Vendor comparison data */
export interface VendorComparisonData {
  supplierId: string;
  supplierName: string;
  avgLeadTimeDays: number;
  onTimeDeliveryPercent: number;
  qualityRating: number;
  totalSpendAud: number;
  priceHistory: { month: string; avgPrice: number }[];
}

// ═══════════════════════════════════════════════════════════════════════
// PLAN MODULE
// ═══════════════════════════════════════════════════════════════════════

export interface Job {
  id: string;
  jobNumber: string;
  title: string;
  customerId: string;
  customerName: string;
  salesOrderId?: string;
  status: JobStatus;
  priority: Priority;
  startDate: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  value: number;
  progress: number;
  assignedTo: string;
  /**
   * Product nature for activity templating and planning depth.
   *  - widget: repeatable, low planning overhead
   *  - configurable: kit-of-parts, full planning lifecycle
   *  - mixed: blends both
   */
  productKind?: 'widget' | 'configurable' | 'mixed';
}

export interface PlanTask {
  id: string;
  title: string;
  jobId?: string;
  jobNumber?: string;
  time: string;
  type: TaskType;
  assignedTo: string;
  completed: boolean;
}

export interface WeeklyCapacity {
  week: string;
  planned: number;
  actual: number;
}

/** Operation-level routing step */
export interface Operation {
  id: string;
  sequence: number;
  name: string;
  workCenterId: string;
  workCenterName: string;
  setupMinutes: number;
  runMinutes: number;
  queueMinutes: number;
  moveMinutes: number;
  isSubcontracted?: boolean;
  subcontractorId?: string;
  subcontractorName?: string;
  subcontractCost?: number;
}

/** Schedule engine block — a job operation assigned to a work centre */
export interface ScheduleBlock {
  id: string;
  jobId: string;
  jobNumber: string;
  operationId?: string;
  operationName: string;
  workCenterId: string;
  workCenterName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  /** Legacy: per-job tint. New Schedule Engine UI prefers `status`. */
  color: string;
  customerName?: string;
  qty?: number;
  dueDate?: string;
  status?: JobScheduleStatus;
  isRush?: boolean;
}

/** Work centre with capacity info for scheduling */
export interface WorkCentre {
  id: string;
  name: string;
  type: string;
  capacityHoursPerDay: number;
  utilizationPercent: number;
  activeJobs: number;
  /** Live machine status dot in Schedule Engine row labels. */
  liveStatus?: 'running' | 'setup' | 'blocked' | 'idle';
  /** Hourly load curve (0–120%) over the visible day; index 0 = DAY_START_HOUR. */
  hourlyLoad?: number[];
  /** Single-shift bounds in 24h, e.g. ['07:00','17:00']. Lunch defaults to 12:00–12:30. */
  shift?: { start: string; end: string; lunchStart?: string; lunchEnd?: string };
}

// ─── Schedule Engine snapshot ───────────────────────────────────────

/** A single point on the 7-day utilisation sparkline. */
export interface UtilisationPoint {
  date: string; // ISO date
  percent: number;
}

/** Late-risk preview row inside LateRiskCard. */
export interface LateRiskJob {
  jobId: string;
  jobNumber: string;
  customerName: string;
  hoursToDeadline: number; // negative = already late
  valueAud: number;
}

/** Bottleneck queue entry inside BottleneckCard. */
export interface BottleneckQueueEntry {
  jobId: string;
  jobNumber: string;
  customerName: string;
  status: JobScheduleStatus;
}

/** Aggregated KPIs displayed in the 5-card row. */
export interface ScheduleSnapshotKpis {
  /** Average utilisation across all work centres (0–100). */
  avgUtilisationPercent: number;
  /** Last-week delta in percentage points (+/-). */
  avgUtilisationDelta: number;
  /** 7-day sparkline. */
  utilisationHistory: UtilisationPoint[];
  /** Active job counts by status (sums to total). */
  activeJobs: {
    running: number;
    queued: number;
    blocked: number;
    late: number;
    dueToday: number;
    atRisk: number;
  };
  /** 0–100 schedule health score. */
  healthScore: number;
  /** Short reason text for the dark anchor card. */
  healthReason: string;
  /** null = no current bottleneck (all centres healthy). */
  bottleneck:
    | null
    | {
        workCentreId: string;
        workCentreName: string;
        queueDepth: number;
        backlogHours: number;
        overloadPercent: number;
        queue: BottleneckQueueEntry[];
      };
  lateRisk: {
    jobsAtRisk: number;
    valueAtRiskAud: number;
    jobs: LateRiskJob[];
  };
}

/** A schedule issue surfaced by the engine (drives IssuesSheet). */
export interface ScheduleIssue {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  detail: string;
}

/** A complete schedule snapshot — current or proposed. */
export interface ScheduleSnapshot {
  id: string;
  /** ISO timestamp of when this snapshot was generated. */
  generatedAt: string;
  /** Display name for the header state line. */
  source:
    | { kind: 'manual'; byName: string }
    | { kind: 'ai'; movedJobIds: string[]; eliminatedRisks: number };
  workCentres: WorkCentre[];
  blocks: ScheduleBlock[];
  kpis: ScheduleSnapshotKpis;
  issues: ScheduleIssue[];
}

/** Auto-Schedule modal payload. */
export interface AutoScheduleRequest {
  priority: 'balanced' | 'throughput' | 'on_time' | 'setup_minimisation';
  horizon: 'today' | 'next_24h' | 'next_7d' | 'next_14d';
  lockSetupAndRunning: boolean;
  lockRushJobs: boolean;
}

/** Result of a (mocked) AI auto-schedule run. */
export interface AutoScheduleResult {
  proposed: ScheduleSnapshot;
  summary: string;
  movedJobIds: string[];
}

/** MRP demand tree node */
export interface MrpNode {
  id: string;
  type: 'sales_order' | 'job' | 'manufacturing_order' | 'purchase_order';
  refNumber: string;
  description: string;
  qty: number;
  status: MrpNodeStatus;
  date: string;
  children?: MrpNode[];
}

/** Shift assignment for a work centre */
export interface ShiftAssignment {
  id: string;
  workCentreId: string;
  workCentreName: string;
  dayOfWeek: number;
  shift: 'day' | 'afternoon' | 'night';
  startTime: string;
  endTime: string;
}

/**
 * Employee-level shift assignment for the Shift Manager calendar.
 * References an Employee and optionally a work centre. Rows in the
 * Shift Manager grid are employees (grouped by department), columns
 * are weekdays, and cells hold zero or more EmployeeShift blocks.
 */
export interface EmployeeShift {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeInitials: string;
  department: string;
  role: string;
  /** 0 = Sunday, 1 = Monday, …, 6 = Saturday */
  dayOfWeek: number;
  shift: 'day' | 'afternoon' | 'night';
  startTime: string;
  endTime: string;
  /** Optional work centre the employee is scheduled to. Omitted for Sales / Office / etc. */
  workCentreId?: string;
  workCentreName?: string;
}

/** Nesting sheet result */
export interface NestingSheet {
  id: string;
  material: string;
  gauge: string;
  sheetWidthMm: number;
  sheetHeightMm: number;
  parts: NestingPart[];
  yieldPercent: number;
  wastePercent: number;
}

export interface NestingPart {
  partId: string;
  partNumber: string;
  jobNumber: string;
  widthMm: number;
  heightMm: number;
  x: number;
  y: number;
  qty: number;
}

// ─── Nesting v2 ─────────────────────────────────────────────────────
// Replaces the legacy single-part Sheet Calculator. Supports multi-part
// nests sourced from WO/MO demand, sheet-stock inventory, irregular DXF
// geometry, and round-trip with the schedule engine + shop floor.

/**
 * A reusable parsed-once geometry record. One DxfAsset can be referenced by
 * a Product (canonical geometry), a Quote (during estimating), or a Nest
 * part row (ad-hoc upload).
 */
export interface DxfAsset {
  id: string;
  fileName: string;
  fileUrl: string;
  parsedAt: string;
  bboxMm: { widthMm: number; heightMm: number };
  /** Sum of perimeter cut length, used for cut-time estimates. */
  perimeterMm: number;
  /** Internal cut length (holes / inner contours). */
  innerCutMm: number;
  holeCount: number;
  /** Net part area in mm² (excluding holes). */
  areaMm2: number;
  /** Layer names found in the DXF. */
  layers: string[];
  /**
   * Outer contour of the part in bbox-local coordinates (origin at top-left
   * of bboxMm, range [0..widthMm] × [0..heightMm]). Used by the Studio
   * preview to render the true shape. Not used by the rectangle packer.
   */
  outerPolygon?: [number, number][];
  /** Where this DXF originated. */
  source: 'product_library' | 'quote_upload' | 'nest_upload' | 'cad_import';
  sourceUploadId?: string;
}

/** A physical sheet of raw stock available to be cut. */
export interface SheetStock {
  id: string;
  sku: string;
  material: string;
  grade: string;
  thicknessMm: number;
  widthMm: number;
  heightMm: number;
  qtyOnHand: number;
  qtyReserved: number;
  location: string;
  supplierId?: string;
  supplierName?: string;
  costPerSheetAud: number;
  /** Mass per sheet — drives material cost rollup when sold by weight. */
  weightKg?: number;
  grainDirection: GrainDirection;
  /** True when this row is an offcut from a previously cut sheet. */
  isRemnant: boolean;
  parentSheetStockId?: string;
  status: SheetStockStatus;
}

/**
 * Per-machine, per-material, per-thickness nesting config. Programmers and
 * shop leads tune these; the Nesting Studio reads them as defaults.
 */
export interface MachineNestingConfig {
  id: string;
  machineId: string;
  material: string;
  thicknessMm: number;
  kerfMm: number;
  /** Gap between adjacent parts on the sheet. */
  partGapMm: number;
  /** Gap from sheet edge. */
  edgeGapMm: number;
  allowRotation: boolean;
  /** Allowed rotations in degrees, e.g. [0, 90] or [0, 90, 180, 270]. */
  rotationStepsDeg: number[];
  /**
   * Default mirror policy for parts cut on this machine + material combo.
   * Used to seed the per-part `allowMirror` flag; users can override per
   * part in the Studio. Forced off when sheet stock has a grain direction.
   */
  allowMirror: boolean;
  allowCommonCut: boolean;
  leadInRule: 'auto' | 'corner' | 'midpoint' | 'pierce_only';
  /** Plasma/laser process gas — empty for non-gas processes. */
  gasType?: string;
  /** Pierce time in seconds, used for runtime estimates. */
  pierceTimeSec: number;
  /** Cut speed in mm/min for this material × thickness. */
  cutSpeedMmPerMin: number;
}

/**
 * A part demand row that has reached a "cut" workcentre and is waiting to be
 * placed onto a Nest. Created when a WO operation hits a cut workcentre.
 */
export interface NestingQueueItem {
  id: string;
  workOrderId: string;
  woNumber: string;
  manufacturingOrderId: string;
  moNumber: string;
  jobId: string;
  jobNumber: string;
  customerId: string;
  customerName: string;
  productId: string;
  partNumber: string;
  description: string;
  qtyRequired: number;
  material: string;
  grade: string;
  thicknessMm: number;
  /** Bounding box driving sheet-stock matching. */
  bboxMm: { widthMm: number; heightMm: number };
  dxfAssetId?: string;
  dueDate: string;
  enteredQueueAt: string;
  status: NestingQueueStatus;
  /** Set when status === 'placed'. */
  placedOnNestId?: string;
}

/**
 * A single placed instance of a part on a sheet. Many can come from the
 * same source WO if `qtyToCut` < required.
 */
export interface NestPlacement {
  id: string;
  productId?: string;
  partNumber: string;
  /** When the part is an ad-hoc upload (no library product), points at the DXF directly. */
  dxfAssetId?: string;
  qtyOnSheet: number;
  /** Source WOs satisfied by this placement, with qty allocated to each. */
  sources: { workOrderId: string; woNumber: string; qty: number }[];
  /** Top-left corner of bbox on the sheet, in mm. */
  xMm: number;
  yMm: number;
  rotationDeg: number;
  bboxMm: { widthMm: number; heightMm: number };
}

/** A single sheet within a Nest — one stock sheet's worth of placements. */
export interface NestSheet {
  id: string;
  sheetStockId: string;
  sheetIndex: number;
  placements: NestPlacement[];
  yieldPercent: number;
  scrapAreaMm2: number;
  estimatedRuntimeMin: number;
}

/** Cost rollup for a Nest, in AUD. */
export interface NestCostRollup {
  materialCostAud: number;
  machineCostAud: number;
  labourCostAud: number;
  totalCostAud: number;
}

/**
 * The Nest job entity. One Nest fulfils demand from many WOs across many
 * MOs (back-linked via NestPlacement.sources). Lives in the Plan / Make
 * boundary — created in Nesting Studio, consumed by Schedule Engine and
 * the shop floor.
 */
export interface Nest {
  id: string;
  nestNumber: string;
  status: NestStatus;
  machineId: string;
  machineName: string;
  material: string;
  grade: string;
  thicknessMm: number;
  sheets: NestSheet[];
  cost: NestCostRollup;
  /** Aggregate yield across all sheets in the nest. */
  totalYieldPercent: number;
  /** Sum of estimated cut + pierce time across sheets. */
  totalRuntimeMin: number;
  createdBy: string;
  createdAt: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  /** Schedule block id if scheduled onto the engine. */
  scheduleBlockId?: string;
  /** WO ids back-linked from sources (denormalised for fast filtering). */
  sourceWorkOrderIds: string[];
  /** MO ids back-linked from sources (denormalised). */
  sourceManufacturingOrderIds: string[];
  notes?: string;
}

/** AI-generated BOM line item */
export interface BomGeneratorLine {
  id: string;
  partNumber: string;
  description: string;
  material: string;
  qty: number;
  operation: string;
  confidencePercent: number;
}

//══════════════════════════════════════════════════════���════════════════
// MAKE MODULE
// ═══════════════════════════════════════════════════════════════════════

export interface Machine {
  id: string;
  name: string;
  workCenter: string;
  status: MachineStatus;
  currentJobId?: string;
  currentJobNumber?: string;
  operatorId?: string;
  operatorName?: string;
  utilizationToday: number;
  /** Structured capabilities used by Nesting Studio + Schedule Engine. */
  capabilities?: MachineCapabilities;
}

/**
 * Structured machine capability fields. Typed where every control needs the
 * same shape (sheet bounds, rates, materials). Open `extras` map for
 * control-specific settings we don't want to model yet.
 */
export interface MachineCapabilities {
  /** Identifies any future native post-processor target. */
  controlSystem?: ControlSystem;
  maxSheetWidthMm: number;
  maxSheetHeightMm: number;
  supportedMaterials: string[];
  thicknessRangeByMaterial: Record<string, { minMm: number; maxMm: number }>;
  hourlyRateAud: number;
  /** Per-material default kerf — refined further in MachineNestingConfig. */
  defaultKerfByMaterial?: Record<string, number>;
  /** Pierce time in seconds keyed by thickness bucket label, e.g. "3mm". */
  pierceTimeSecByThickness?: Record<string, number>;
  /** Cut speed mm/min keyed by `${material}|${thicknessMm}`. */
  cutSpeedMmPerMinByMaterialThickness?: Record<string, number>;
  /** Escape hatch for control-specific knobs (lens map, turret stations, etc.). */
  extras?: Record<string, unknown>;
}

export interface ManufacturingOrder {
  id: string;
  moNumber: string;
  productId: string;
  productName: string;
  jobId: string;
  jobNumber: string;
  customerId: string;
  customerName: string;
  status: ManufacturingOrderStatus;
  priority: Priority;
  dueDate: string;
  progress: number;
  workOrders: number;
  operatorId: string;
  operatorName: string;
}

export interface WorkOrder {
  id: string;
  woNumber: string;
  manufacturingOrderId: string;
  machineId: string;
  machineName: string;
  operation: string;
  sequence: number;
  estimatedMinutes: number;
  actualMinutes: number;
  status: WorkOrderStatus;
  operatorId?: string;
  operatorName?: string;
  /** Set when this WO's cut step is being fulfilled by a Nest job. */
  nestId?: string;
}

/** CAPA (Corrective and Preventive Action) record */
export interface CapaRecord {
  id: string;
  title: string;
  description: string;
  severity: CapaSeverity;
  status: CapaStatus;
  assignedTo: string;
  assignedToName: string;
  jobId?: string;
  jobNumber?: string;
  identifiedDate: string;
  dueDate: string;
  rootCause?: string;
  correctiveAction?: string;
}

/** Batch/lot traceability node */
export interface BatchLot {
  id: string;
  lotNumber: string;
  type: 'raw_material' | 'wip' | 'finished_goods';
  material: string;
  qty: number;
  date: string;
  status: BatchStatus;
  supplierId?: string;
  supplierName?: string;
  /** Heat number / cast lot — required for AS/NZS + ISO metal traceability. */
  heatNumber?: string;
  /** Link to the supplier material certificate PDF. */
  certUrl?: string;
  children?: BatchLot[];
}

/** Material consumption line for an MO */
export interface MaterialConsumptionLine {
  id: string;
  material: string;
  plannedQty: number;
  consumedQty: number;
  uom: string;
  variance: number;
  status: 'ok' | 'over' | 'under';
}

/** Scrap record for heat map analysis */
export interface ScrapRecord {
  id: string;
  machineId: string;
  machineName: string;
  operatorId: string;
  operatorName: string;
  jobId: string;
  jobNumber: string;
  week: string;
  scrapRatePercent: number;
  scrapQty: number;
}

// ═══════════════════════════════════════════════════════════════════════
// SHIP MODULE
// ═══════════════════════════════════════════════════════════════════════

export interface Shipment {
  id: string;
  shipmentNumber: string;
  salesOrderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  carrier: string;
  trackingNumber?: string;
  stage: ShipmentStage;
  dispatchDate: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  weight: number;
  packages: number;
}

export interface Carrier {
  id: string;
  name: string;
  onTimePercent: number;
  avgTransitDays: number;
}

export interface ShippingException {
  id: string;
  shipmentId: string;
  shipmentNumber: string;
  customerId: string;
  customerName: string;
  type: ShippingExceptionType;
  description: string;
  createdAt: string;
  resolved: boolean;
}

/** Carrier rate quote for rate comparison */
export interface CarrierRate {
  id: string;
  carrierId: string;
  carrierName: string;
  service: string;
  estimatedDays: number;
  priceAud: number;
  pickupAvailable: boolean;
}

/** Bill of Lading */
export interface BillOfLading {
  id: string;
  shipmentId: string;
  shipperName: string;
  shipperAddress: string;
  consigneeName: string;
  consigneeAddress: string;
  carrierName: string;
  items: { description: string; qty: number; weightKg: number; freightClass: string }[];
  totalWeightKg: number;
  date: string;
}

// ══════════════════════════════════════════════════��════════════════════
// BOOK MODULE
// ═══════════════════════════════════════════════════════════════════════

export interface Expense {
  id: string;
  expenseNumber: string;
  date: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  tax: number;
  submittedBy: string;
  status: ExpenseStatus;
  reimbursable: boolean;
  billable: boolean;
  jobId?: string;
  jobNumber?: string;
}

export interface JobCost {
  id: string;
  jobId: string;
  jobNumber: string;
  customerId: string;
  customerName: string;
  quotedValue: number;
  materialCost: number;
  labourCost: number;
  overheadCost: number;
  totalCost: number;
  margin: number;
  marginPercent: number;
}

/** WIP valuation line */
export interface WipValuation {
  id: string;
  jobId: string;
  jobNumber: string;
  customerName: string;
  percentComplete: number;
  costsIncurred: number;
  valueEarned: number;
  wipBalance: number;
}

/** Cost variance analysis record */
export interface CostVarianceRecord {
  id: string;
  jobId: string;
  jobNumber: string;
  category: 'labour' | 'materials' | 'overhead' | 'subcontract';
  budgetAmount: number;
  actualAmount: number;
  varianceAmount: number;
  variancePercent: number;
}

// ═══════════════════════════════════════════════════════════════════════
// CONTROL MODULE
// ═══════════════════════════════════════════════════════════════════════

export interface SystemHealth {
  totalUsers: number;
  activeUsers: number;
  totalProducts: number;
  totalMachines: number;
  totalSuppliers: number;
  openIssues: number;
  systemStatus: 'healthy' | 'degraded' | 'down';
}

/** Maintenance record for equipment */
export interface MaintenanceRecord {
  id: string;
  machineId: string;
  machineName: string;
  type: 'preventive' | 'corrective';
  description: string;
  status: MaintenanceStatus;
  scheduledDate: string;
  completedDate?: string;
  durationMinutes?: number;
  assignedTo: string;
  cost?: number;
}

/** Tooling inventory item */
export interface ToolingItem {
  id: string;
  toolId: string;
  type: string;
  description: string;
  location: string;
  lifePercent: number;
  calibrationDueDate: string;
  status: ToolStatus;
  lastServiceDate: string;
  /** Optional machine this tool is dedicated to */
  linkedMachineId?: string;
  linkedMachineName?: string;
}

/** Document with revision control */
export interface ControlDocument {
  id: string;
  title: string;
  type: 'drawing' | 'spec' | 'procedure' | 'certificate' | 'manual';
  revisionNumber: string;
  status: DocumentStatus;
  lastUpdated: string;
  owner: string;
  revisions: DocumentRevision[];
}

export interface DocumentRevision {
  revision: string;
  date: string;
  author: string;
  description: string;
}

// ─── Control → Settings: templates (Sell overhaul, 2026-05) ────────

/** Reusable payment-term template (e.g. Net 30, 50% deposit + balance on delivery). */
export interface PaymentTerm {
  id: string;
  label: string;
  /** Days from invoice/order date to payment due. */
  days: number;
  /** Optional deposit required up-front (percent of total). */
  depositPct?: number;
  /** Marks this row as the global default applied to new customers. */
  isDefault?: boolean;
  notes?: string;
}

/** Email notification template — customer comms (quote sent, order shipped…). */
export interface NotificationTemplate {
  id: string;
  /** Stable kind used by the trigger system. */
  kind:
    | 'quote_sent'
    | 'quote_accepted'
    | 'order_confirmed'
    | 'order_shipped'
    | 'invoice_issued'
    | 'statement_sent';
  /** Display name for the Control UI. */
  name: string;
  /** Email subject; supports {{customer}}, {{ref}}, {{total}} placeholders. */
  subject: string;
  /** Markdown body. */
  bodyMd: string;
  /** When false, the template is disabled and won't fire. */
  enabled: boolean;
  updatedAt: string;
}

/** Legal / finance text template — T&Cs, payment details, customer-visible notes. */
export interface LegalTemplate {
  id: string;
  kind: 'terms_and_conditions' | 'payment_details' | 'quote_notes' | 'order_notes';
  name: string;
  /** Markdown body inserted into quote/order/invoice PDFs. */
  body: string;
  /** Default for new quotes/orders of this kind. */
  isDefault?: boolean;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════
// DASHBOARD / KPI
// ═══════════════════════════════════════════════════════════════════════

export interface KpiMetric {
  value: number;
  change?: number;
  trend?: TrendDirection;
  count?: number;
  budget?: number;
}

export interface ApprovalItem {
  type: string;
  id: string;
  refNumber?: string;
  amount?: number;
  value?: number;
  customer?: string;
  supplier?: string;
  requestor?: string;
  customerOrSupplier?: string;
  status?: string;
}

export interface OverdueItem {
  type: string;
  id: string;
  refNumber?: string;
  customer?: string;
  vendor?: string;
  customerOrVendor?: string;
  amount?: number;
  value?: number;
  daysOverdue: number;
}

export interface ChartDataPoint {
  [key: string]: string | number | null;
}

export interface FunnelStage {
  stage: string;
  count: number;
  value: number;
}

export interface PerformerSummary {
  employeeId: string;
  name: string;
  initials: string;
  revenue: number;
  deals: number;
}

export interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  iconName: string;
  module: ModuleKey;
}

export interface QuarterlyTarget {
  quarter: string;
  target: number;
  current: number;
  status: 'complete' | 'active' | 'upcoming';
}

// ═══════════════════════════════════════════════════════════════════════
// CUSTOMER PORTAL — subscriptions, invitations, attachments, markup
// (Added 2026-04-23 — see docs/dev/modules/sell/customer-portal.md §P1)
// ═══════════════════════════════════════════════════════════════════════

/** MirrorWorks pricing tier codes. Source: docs/SAL 02 — Pricing Tiers and Strategy.xlsx */
export type SubscriptionTier = 'trial' | 'make' | 'run' | 'operate' | 'enterprise';

/** Subscription billing status. */
export type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'past_due'
  | 'grace'           // cancelled but inside 30-day grace
  | 'cancelled';

export interface Subscription {
  id: string;
  customerId: string;
  tier: SubscriptionTier;
  planName: string;           // e.g. "Produce — monthly"
  status: SubscriptionStatus;
  billingCycle: 'monthly' | 'annual';
  seats: number;
  seatsUsed: number;
  startDate: string;
  renewalDate: string;
  cancelAt?: string;
  closedAt?: string;
  mrrAud: number;
  nextInvoiceDate?: string;
  nextInvoiceAmount?: number;
  paymentMethodLabel?: string; // "Visa •••• 4242"
  /** Finance opt-in for self-service cancel. Default false. */
  closable: boolean;
  usage: {
    docsThisMonth: number;
    docsCap: number;
    storageGb: number;
    storageCapGb: number;
  };
}

export interface SubscriptionEvent {
  id: string;
  subscriptionId: string;
  type:
    | 'created'
    | 'upgraded'
    | 'downgrade_requested'
    | 'cycle_changed'
    | 'payment_method_updated'
    | 'cancel_requested'
    | 'reactivated'
    | 'payment_failed'
    | 'renewed';
  actorContactId: string | null;
  actorSide: 'customer' | 'internal' | 'system';
  occurredAt: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

// ── Attachments (PDF pipeline) ──────────────────────────────────────

export type AttachmentEntityType =
  | 'quote'
  | 'sales_order'
  | 'invoice'
  | 'shipment'
  | 'markup'
  | 'purchase_order';

export type AttachmentKind =
  | 'quote_pdf'
  | 'signed_quote'
  | 'invoice_pdf'
  | 'delivery_note'
  | 'proof_of_delivery'
  | 'markup_image'
  | 'other';

export interface Attachment {
  id: string;
  entityType: AttachmentEntityType;
  entityId: string;
  kind: AttachmentKind;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  /** Data URL or mock blob URL. Real impl = S3/Supabase signed URL. */
  url: string;
  /** Who/what produced this artifact. */
  generatedBy: 'system' | 'customer' | 'internal';
  generatedAt: string;
  /** Locks visibility to the portal. Default true once generated. */
  customerVisible: boolean;
}

// ── Portal invitations ──────────────────────────────────────────────

export interface PortalInvitation {
  id: string;
  customerId: string;
  contactId: string;        // references CustomerContact.id
  email: string;
  role: CustomerContactRole;
  invitedByEmployeeId: string;
  invitedAt: string;
  /** Expires if not accepted within 14 days. */
  expiresAt: string;
  acceptedAt?: string;
  revokedAt?: string;
  /** Short token the invite URL carries. 8-char alnum. */
  token: string;
}

// ── 3D model markup + threaded comments ────────────────────────────

export type MarkupStatus = 'open' | 'resolved' | 'wont_fix';

export type MarkupEntityKind = 'quote' | 'sales_order' | 'job';

export interface MarkupAnchor {
  /** PartNode id resolved via mesh name convention in the loaded GLB. */
  partId: string;
  /** Local-space point on the part (relative to part's local origin). */
  pointLocal: [number, number, number];
  /** Local-space surface normal (used to float pin off-surface). */
  normalLocal: [number, number, number];
  /** Captured camera pose so "jump to this view" reproduces the look. */
  cameraPose?: {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
  };
}

export interface ModelMarkup {
  id: string;
  entityKind: MarkupEntityKind;
  entityId: string;         // quoteId / orderId / jobId
  modelRef: string;         // e.g. "diff.glb" — identifier for the loaded asset
  revision: string;         // e.g. "rev-1" — anchor invalidates on revision change
  anchor: MarkupAnchor;
  authorContactId: string;  // customer-contact id OR employee id
  authorSide: 'customer' | 'internal';
  createdAt: string;
  status: MarkupStatus;
  resolvedAt?: string;
  resolvedByContactId?: string;
  /** Denormalised thread. First message duplicates the markup's "opening comment". */
  thread: MarkupComment[];
}

export interface MarkupComment {
  id: string;
  markupId: string;
  authorContactId: string;
  authorSide: 'customer' | 'internal';
  body: string;
  createdAt: string;
  editedAt?: string;
}

// ── Shipment → delivery-note attachment convenience type ───────────
// (Actual storage goes through `Attachment` with kind='delivery_note')
