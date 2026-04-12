// ─── MirrorWorks Shared Enums & Primitives ─────────────────────────
// Canonical source for cross-module value types used in entities, services,
// and UI components. Keep alphabetical within each section.

// ─── Modules ────────────────────────────────────────────────────────

export type ModuleKey =
  | 'sell'
  | 'plan'
  | 'make'
  | 'ship'
  | 'book'
  | 'buy'
  | 'control';

// ─── Priority & Status ─────────────────────────────────────────────

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TrendDirection = 'up' | 'down' | 'neutral' | 'warning';

// ─── Sell Statuses ──────────────────────────────────────────────────

export type OpportunityStage =
  | 'new'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost';

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired' | 'revision_requested';

export type SalesOrderStatus = 'draft' | 'confirmed' | 'in_production' | 'shipped' | 'invoiced' | 'cancelled';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void';

export type ActivityType = 'email' | 'call' | 'meeting' | 'task' | 'note';

export type ActivityStatus = 'completed' | 'scheduled' | 'overdue' | 'in_progress';

export type CustomerStatus = 'active' | 'prospect' | 'inactive';

// ─── Buy Statuses ───────────────────────────────────────────────────

export type POStatus = 'draft' | 'sent' | 'acknowledged' | 'partial' | 'received' | 'cancelled';

export type RequisitionStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'ordered';

export type BillStatus = 'draft' | 'received' | 'approved' | 'paid' | 'overdue';

// ─── Plan Statuses ──────────────────────────────────────────────────

export type JobStatus = 'draft' | 'planned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

export type TaskType = 'review' | 'schedule' | 'qc' | 'purchase' | 'external' | 'production';

// ─── Make Statuses ──────────────────────────────────────────────────

export type ManufacturingOrderStatus = 'draft' | 'confirmed' | 'in_progress' | 'done';

export type MachineStatus = 'running' | 'idle' | 'down' | 'maintenance' | 'setup';

export type WorkOrderStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

// ─── Ship Statuses ──────────────────────────────────────────────────

export type ShipmentStage = 'pick' | 'pack' | 'ship' | 'transit' | 'delivered';

export type ShippingExceptionType = 'delay' | 'damage' | 'refused' | 'lost' | 'address_issue';

// ─── Book Statuses ──────────────────────────────────────────────────

export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';

export type ExpenseCategory =
  | 'raw_materials'
  | 'utilities'
  | 'maintenance'
  | 'equipment'
  | 'travel'
  | 'mileage'
  | 'subcontract'
  | 'consumables'
  | 'office'
  | 'other';

// ─── Control Statuses ──────────────────────────────────────────────

export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'overdue';

export type DocumentStatus = 'draft' | 'review' | 'approved' | 'archived';

export type ToolStatus = 'available' | 'in_use' | 'maintenance' | 'retired';

// ─── Make Statuses (extended) ──────────────────────────────────────

export type CapaStatus = 'identified' | 'root_cause' | 'containment' | 'corrective_action' | 'verification' | 'closed';

export type CapaSeverity = 'low' | 'medium' | 'high' | 'critical';

export type BatchStatus = 'active' | 'quarantine' | 'released' | 'consumed';

// ─── Plan Statuses (extended) ──────────────────────────────────────

export type MrpNodeStatus = 'fulfilled' | 'partial' | 'pending' | 'shortage';

// ─── Approval Types ─────────────────────────────────────────────────

export type ApprovalItemType = 'quote' | 'order' | 'requisition' | 'po' | 'expense' | 'bill';

// ─── Barcode ───────────────────────────────────────────────────────

/** Supported barcode symbologies across the platform. */
export type BarcodeSymbology =
  | 'code128'    // Internal WO/MO/SKU identifiers
  | 'ean13'      // Product barcodes (retail-facing)
  | 'qrcode'     // URLs, batch traceability links
  | 'datamatrix' // Small labels, GS1 compliance
  | 'code39';    // Legacy compatibility

/** How a barcode value was captured. */
export type ScanSource = 'keyboard' | 'camera';

// ─── Helpers ────────────────────────────────────────────────────────

export interface DateRange {
  from: Date;
  to: Date;
}

/** Monetary value in AUD cents. Display helpers should convert. */
export type Cents = number;
