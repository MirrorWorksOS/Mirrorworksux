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
} from './common';

// ═════════════════════════════════════════════════��═════════════════════
// SHARED / CROSS-MODULE
// ═══════════════════════════════════════════════════════════════════════

export interface Customer {
  id: string;
  company: string;
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
}

export interface Product {
  id: string;
  partNumber: string;
  description: string;
  material: string;
  unitPrice: number;
  weightKg: number;
  category: string;
  isActive: boolean;
  /** Product image — optional placeholder path */
  imageUrl?: string;
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
  lineItems: QuoteLineItem[];
  /** E-signature acceptance timestamp */
  acceptedAt?: string;
  /** Who accepted the quote */
  acceptedBy?: string;
  /** Signature image URL placeholder */
  signatureUrl?: string;
}

export interface QuoteLineItem {
  productId: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
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
  assignedTo: string;
  dueDate: string;
  status: ActivityStatus;
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
  operationName: string;
  workCenterId: string;
  workCenterName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  color: string;
}

/** Work centre with capacity info for scheduling */
export interface WorkCentre {
  id: string;
  name: string;
  type: string;
  capacityHoursPerDay: number;
  utilizationPercent: number;
  activeJobs: number;
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

/** Operator chat message */
export interface OperatorMessage {
  id: string;
  jobId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
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
  type: ApprovalItemType;
  id: string;
  refNumber: string;
  amount: number;
  customerOrSupplier: string;
  requestor?: string;
  status: string;
}

export interface OverdueItem {
  type: string;
  id: string;
  refNumber: string;
  customerOrVendor: string;
  amount: number;
  daysOverdue: number;
}

export interface ChartDataPoint {
  label: string;
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
