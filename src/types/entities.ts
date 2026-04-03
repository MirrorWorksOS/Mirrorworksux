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

// ══════════════════���════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════════
// PLAN MODULE
// ══════════════════════════════════════════��════════════════════════════

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

// ══════════════════════════════════════════════════════���════════════════
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
