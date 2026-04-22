/**
 * Audit service — append-only event log for document-state changes.
 * MVP is mock-backed; the same interface maps to a single `audit_events`
 * table when we wire Supabase.
 *
 * See: /Users/mattquigley/.claude/plans/looking-at-the-buy-sparkling-lantern.md
 * (system design — §3 data model).
 */

import { employees } from '@/services';

// ── Types ──────────────────────────────────────────────────────
export type AuditEntityType =
  | 'purchase_order'
  | 'purchase_requisition'
  | 'goods_receipt'
  | 'vendor_bill'
  | 'purchase_agreement'
  | 'quote'
  | 'sales_order'
  | 'invoice'
  | 'manufacturing_order'
  | 'delivery_order'
  | 'capa'
  | 'role_assignment';

export type AuditAction =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'approved'
  | 'rejected'
  | 'submitted'
  | 'sent'
  | 'amended'
  | 'cancelled'
  | 'commented'
  | 'received';

export interface FieldChange {
  path: string;        // e.g. "status" or "items[2].unitPrice"
  label?: string;      // human-friendly label (e.g. "Sanctioned limit")
  before: unknown;
  after: unknown;
  format?: 'currency' | 'date' | 'text';
}

export interface AuditEvent {
  id: string;
  occurredAt: string;         // ISO timestamp

  // Actor
  actorId: string | null;     // employee id; null for system events
  actorType: 'user' | 'system' | 'api';

  // Subject
  entityType: AuditEntityType;
  entityId: string;

  // What happened
  action: AuditAction;
  description: string;        // one-line summary, e.g. "Approved this requisition"
  fieldChanges?: FieldChange[];
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface ResolvedActor {
  id: string | null;
  name: string;
  initials: string;
  role?: string;
}

// ── Mock store ─────────────────────────────────────────────────
// In-memory append-only list. Real impl = Supabase insert + RLS.
const STORE: AuditEvent[] = [
  // Purchase order PO-2026-0089 (po-001) — richest sample
  {
    id: 'evt-po001-001',
    occurredAt: '2026-03-15T09:12:00Z',
    actorId: 'emp-005', actorType: 'user',
    entityType: 'purchase_order', entityId: 'po-001',
    action: 'created',
    description: 'Created this purchase order',
  },
  {
    id: 'evt-po001-002',
    occurredAt: '2026-03-15T09:47:00Z',
    actorId: 'emp-005', actorType: 'user',
    entityType: 'purchase_order', entityId: 'po-001',
    action: 'amended',
    description: 'Added 2 line items',
    metadata: { addedLineCount: 2 },
  },
  {
    id: 'evt-po001-003',
    occurredAt: '2026-03-15T11:02:00Z',
    actorId: 'emp-002', actorType: 'user',
    entityType: 'purchase_order', entityId: 'po-001',
    action: 'approved',
    description: 'Approved this purchase order',
    reason: 'Matches quarterly forecast; supplier on preferred list.',
  },
  {
    id: 'evt-po001-004',
    occurredAt: '2026-03-15T11:05:00Z',
    actorId: 'emp-005', actorType: 'user',
    entityType: 'purchase_order', entityId: 'po-001',
    action: 'sent',
    description: 'Sent to Hunter Steel Co',
    metadata: { recipient: 'sales@huntersteel.com.au' },
  },
  {
    id: 'evt-po001-005',
    occurredAt: '2026-03-16T08:14:00Z',
    actorId: null, actorType: 'system',
    entityType: 'purchase_order', entityId: 'po-001',
    action: 'status_changed',
    description: 'Supplier acknowledged the order',
    fieldChanges: [{ path: 'status', label: 'Status', before: 'sent', after: 'acknowledged' }],
  },

  // po-002 — partial receipt flow
  {
    id: 'evt-po002-001',
    occurredAt: '2026-03-12T10:00:00Z',
    actorId: 'emp-002', actorType: 'user',
    entityType: 'purchase_order', entityId: 'po-002',
    action: 'created',
    description: 'Created this purchase order',
  },
  {
    id: 'evt-po002-002',
    occurredAt: '2026-03-12T10:30:00Z',
    actorId: 'emp-002', actorType: 'user',
    entityType: 'purchase_order', entityId: 'po-002',
    action: 'sent',
    description: 'Sent to Pacific Metals',
  },
  {
    id: 'evt-po002-003',
    occurredAt: '2026-03-18T14:22:00Z',
    actorId: null, actorType: 'system',
    entityType: 'purchase_order', entityId: 'po-002',
    action: 'amended',
    description: 'Price adjusted on line 1 by supplier',
    fieldChanges: [
      { path: 'items[0].unitPrice', label: 'I-Beam unit price', before: 4350, after: 4500, format: 'currency' },
    ],
    reason: 'Steel index moved — supplier notified',
  },
  {
    id: 'evt-po002-004',
    occurredAt: '2026-03-22T09:05:00Z',
    actorId: 'emp-008', actorType: 'user',
    entityType: 'purchase_order', entityId: 'po-002',
    action: 'received',
    description: 'Partial receipt recorded (GR-2026-0035)',
    metadata: { goodsReceiptId: 'gr-002' },
  },

  // Requisition REQ-2026-0089 (req-001) — the screen in the screenshot
  {
    id: 'evt-req001-001',
    occurredAt: '2026-03-18T09:30:00Z',
    actorId: 'emp-005', actorType: 'user',
    entityType: 'purchase_requisition', entityId: 'req-001',
    action: 'created',
    description: 'Created this requisition',
  },
  {
    id: 'evt-req001-002',
    occurredAt: '2026-03-18T09:45:00Z',
    actorId: 'emp-005', actorType: 'user',
    entityType: 'purchase_requisition', entityId: 'req-001',
    action: 'submitted',
    description: 'Submitted for approval',
  },
];

// ── Public API ─────────────────────────────────────────────────
export interface ListOptions {
  limit?: number;
  actions?: AuditAction[];
}

export const auditService = {
  list(entityType: AuditEntityType, entityId: string, opts: ListOptions = {}): AuditEvent[] {
    let events = STORE
      .filter(e => e.entityType === entityType && e.entityId === entityId)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    if (opts.actions) {
      events = events.filter(e => opts.actions!.includes(e.action));
    }
    if (opts.limit) {
      events = events.slice(0, opts.limit);
    }
    return events;
  },

  record(event: Omit<AuditEvent, 'id' | 'occurredAt'> & { occurredAt?: string }): AuditEvent {
    const full: AuditEvent = {
      id: `evt-${Math.random().toString(36).slice(2, 10)}`,
      occurredAt: event.occurredAt ?? new Date().toISOString(),
      ...event,
    };
    STORE.push(full);
    return full;
  },

  resolveActor(actorId: string | null, actorType: AuditEvent['actorType']): ResolvedActor {
    if (actorType === 'system' || !actorId) {
      return { id: null, name: 'System', initials: 'SY' };
    }
    const emp = employees.find(e => e.id === actorId);
    if (!emp) return { id: actorId, name: 'Unknown user', initials: '??' };
    return { id: emp.id, name: emp.name, initials: emp.initials, role: emp.role };
  },
};
