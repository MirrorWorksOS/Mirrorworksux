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

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';

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

// ─── Approval Types ─────────────────────────────────────────────────

export type ApprovalItemType = 'quote' | 'order' | 'requisition' | 'po' | 'expense' | 'bill';

// ─── Helpers ────────────────────────────────────────────────────────

export interface DateRange {
  from: Date;
  to: Date;
}

/** Monetary value in AUD cents. Display helpers should convert. */
export type Cents = number;
