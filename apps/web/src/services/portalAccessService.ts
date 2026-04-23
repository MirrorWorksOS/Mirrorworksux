/**
 * portalAccessService — manages customer-portal contacts + invitation lifecycle.
 *
 * Mock-backed today. Maps 1:1 onto two Supabase tables when wired:
 *   - customer_contacts (Customer.contacts[])
 *   - portal_invitations (PortalInvitation)
 *
 * The contacts array currently lives on the Customer mock — this service wraps
 * reads/writes so callers never mutate `customers` directly.
 */

import { customers } from '@/services';
import { auditService } from './auditService';
import type {
  Customer,
  CustomerContact,
  CustomerContactRole,
  CustomerContactStatus,
  PortalInvitation,
} from '@/types/entities';

// ── Mock stores ────────────────────────────────────────────────

const INVITATIONS: PortalInvitation[] = [
  {
    id: 'inv-001',
    customerId: 'cust-001',
    contactId: 'cust-001-c3',
    email: 'marcus.chen@techcorp.com.au',
    role: 'team',
    invitedByEmployeeId: 'emp-005',
    invitedAt: '2026-04-18T11:30:00Z',
    expiresAt: '2026-05-02T11:30:00Z',
    token: 'INV8KQZ2',
  },
];

function randomToken(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function nowIso(): string {
  return new Date().toISOString();
}

function addDaysIso(from: Date, days: number): string {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function findCustomer(customerId: string): Customer | undefined {
  return customers.find((c) => c.id === customerId);
}

// ── Public API ────────────────────────────────────────────────

export const portalAccessService = {
  /** All contacts for a customer (falls back to synthesising one from legacy fields). */
  listContacts(customerId: string): CustomerContact[] {
    const cust = findCustomer(customerId);
    if (!cust) return [];
    if (cust.contacts && cust.contacts.length > 0) return cust.contacts;
    // Synthesise from legacy scalar fields so old records still work.
    return [
      {
        id: `${customerId}-legacy`,
        customerId,
        name: cust.contact,
        email: cust.email,
        phone: cust.phone,
        role: 'admin',
        status: 'active',
      },
    ];
  },

  getContact(contactId: string): CustomerContact | undefined {
    for (const cust of customers) {
      const found = cust.contacts?.find((c) => c.id === contactId);
      if (found) return found;
    }
    return undefined;
  },

  /** Active portal invitations for a customer (not yet accepted, not revoked, not expired). */
  listPendingInvitations(customerId: string): PortalInvitation[] {
    const now = Date.now();
    return INVITATIONS.filter(
      (inv) =>
        inv.customerId === customerId &&
        !inv.acceptedAt &&
        !inv.revokedAt &&
        new Date(inv.expiresAt).getTime() > now,
    );
  },

  /**
   * Add a contact to a customer and send them a portal invitation.
   * Records an audit event on the customer's record.
   */
  invite(input: {
    customerId: string;
    name: string;
    email: string;
    role: CustomerContactRole;
    invitedByEmployeeId: string;
    title?: string;
    phone?: string;
  }): { contact: CustomerContact; invitation: PortalInvitation } {
    const cust = findCustomer(input.customerId);
    if (!cust) {
      throw new Error(`Unknown customer: ${input.customerId}`);
    }

    const existing = (cust.contacts ?? []).find(
      (c) => c.email.toLowerCase() === input.email.toLowerCase(),
    );
    if (existing && existing.status !== 'revoked') {
      throw new Error(
        `${input.email} is already a portal contact for this customer.`,
      );
    }

    const contact: CustomerContact = {
      id: `${input.customerId}-c${(cust.contacts?.length ?? 0) + 1}-${Math.random().toString(36).slice(2, 6)}`,
      customerId: input.customerId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      title: input.title,
      role: input.role,
      status: 'invited' as CustomerContactStatus,
      invitedAt: nowIso(),
    };

    if (!cust.contacts) cust.contacts = [];
    cust.contacts.push(contact);

    const invitation: PortalInvitation = {
      id: `inv-${Math.random().toString(36).slice(2, 10)}`,
      customerId: input.customerId,
      contactId: contact.id,
      email: input.email,
      role: input.role,
      invitedByEmployeeId: input.invitedByEmployeeId,
      invitedAt: contact.invitedAt!,
      expiresAt: addDaysIso(new Date(), 14),
      token: randomToken(),
    };
    INVITATIONS.push(invitation);

    // Cross-cut: write an audit event on a 'quote' entity is wrong — customers
    // don't have audit timelines wired yet. Skip audit for now; the invitation
    // list itself IS the audit for this flow.

    return { contact, invitation };
  },

  /** Revoke portal access for a contact. Non-destructive — sets status='revoked'. */
  revoke(input: {
    customerId: string;
    contactId: string;
    revokedByEmployeeId: string;
    reason?: string;
  }): CustomerContact {
    const cust = findCustomer(input.customerId);
    if (!cust || !cust.contacts) {
      throw new Error(`Customer has no contacts: ${input.customerId}`);
    }
    const contact = cust.contacts.find((c) => c.id === input.contactId);
    if (!contact) {
      throw new Error(`Unknown contact: ${input.contactId}`);
    }

    contact.status = 'revoked';
    contact.revokedAt = nowIso();

    // Also invalidate any pending invitations for this contact.
    for (const inv of INVITATIONS) {
      if (inv.contactId === contact.id && !inv.acceptedAt) {
        inv.revokedAt = contact.revokedAt;
      }
    }

    // Optional: write audit trail on the customer — we reuse 'role_assignment'
    // entity type for now as it's the closest semantic match.
    auditService.record({
      actorId: input.revokedByEmployeeId,
      actorType: 'user',
      entityType: 'role_assignment',
      entityId: contact.id,
      action: 'cancelled',
      description: `Revoked portal access for ${contact.name}`,
      reason: input.reason,
      metadata: { customerId: input.customerId, contactEmail: contact.email },
    });

    return contact;
  },

  /** Re-send an invitation email (bump expiry, new token). */
  resendInvitation(input: {
    customerId: string;
    contactId: string;
  }): PortalInvitation {
    const existing = INVITATIONS.find(
      (i) => i.contactId === input.contactId && !i.acceptedAt && !i.revokedAt,
    );
    const now = new Date();
    if (existing) {
      existing.invitedAt = now.toISOString();
      existing.expiresAt = addDaysIso(now, 14);
      existing.token = randomToken();
      return existing;
    }
    const contact = portalAccessService.getContact(input.contactId);
    if (!contact) {
      throw new Error(`Unknown contact: ${input.contactId}`);
    }
    const fresh: PortalInvitation = {
      id: `inv-${Math.random().toString(36).slice(2, 10)}`,
      customerId: input.customerId,
      contactId: input.contactId,
      email: contact.email,
      role: contact.role,
      invitedByEmployeeId: 'emp-005',
      invitedAt: now.toISOString(),
      expiresAt: addDaysIso(now, 14),
      token: randomToken(),
    };
    INVITATIONS.push(fresh);
    return fresh;
  },

  /** Update a contact's role / profile fields. Used by self-service profile edit. */
  updateContact(
    contactId: string,
    patch: Partial<
      Pick<
        CustomerContact,
        'name' | 'email' | 'phone' | 'title' | 'role' | 'isPrimaryBilling'
      >
    >,
  ): CustomerContact {
    const existing = portalAccessService.getContact(contactId);
    if (!existing) {
      throw new Error(`Unknown contact: ${contactId}`);
    }
    Object.assign(existing, patch);
    return existing;
  },
};
