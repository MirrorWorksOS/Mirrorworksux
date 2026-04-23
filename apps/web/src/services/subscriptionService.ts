/**
 * subscriptionService — customer-level service plans, surfaced in the
 * customer portal.
 *
 * Distinct from `lib/subscription.ts` which models the *tenant's* MirrorWorks
 * subscription (Alliance Metal → MirrorWorks). This service models *their
 * customers' service plans with the tenant* (TechCorp → Alliance Metal) —
 * the thing a fab shop's recurring-order customer sees in their portal.
 *
 * Mock-backed. Real impl = Supabase tables `subscriptions` + `subscription_events`
 * joined to `invoices` via `subscription_id`.
 */

import type {
  Subscription,
  SubscriptionEvent,
  SubscriptionTier,
  SubscriptionStatus,
} from '@/types/entities';
import { auditService } from './auditService';

// ── Mock seed ─────────────────────────────────────────────────

const SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-001',
    customerId: 'cust-001',
    tier: 'expand',
    planName: 'Expand — monthly',
    status: 'active',
    billingCycle: 'monthly',
    seats: 10,
    seatsUsed: 7,
    startDate: '2025-06-01',
    renewalDate: '2026-05-01',
    mrrAud: 1900,
    nextInvoiceDate: '2026-05-01',
    nextInvoiceAmount: 1900,
    paymentMethodLabel: 'Visa •••• 4242',
    closable: false,
    usage: {
      docsThisMonth: 187,
      docsCap: 500,
      storageGb: 14.2,
      storageCapGb: 50,
    },
  },
  {
    id: 'sub-002',
    customerId: 'cust-002',
    tier: 'produce',
    planName: 'Produce — annual',
    status: 'active',
    billingCycle: 'annual',
    seats: 5,
    seatsUsed: 3,
    startDate: '2024-09-01',
    renewalDate: '2026-09-01',
    mrrAud: 450,
    nextInvoiceDate: '2026-09-01',
    nextInvoiceAmount: 5400,
    paymentMethodLabel: 'Direct debit — CBA',
    closable: true,
    usage: {
      docsThisMonth: 42,
      docsCap: 200,
      storageGb: 3.1,
      storageCapGb: 20,
    },
  },
];

const EVENTS: SubscriptionEvent[] = [
  {
    id: 'sev-001',
    subscriptionId: 'sub-001',
    type: 'created',
    actorContactId: 'cust-001-c1',
    actorSide: 'customer',
    occurredAt: '2025-06-01T09:00:00Z',
    notes: 'Initial Produce plan (monthly).',
  },
  {
    id: 'sev-002',
    subscriptionId: 'sub-001',
    type: 'upgraded',
    actorContactId: 'cust-001-c1',
    actorSide: 'customer',
    occurredAt: '2025-11-14T14:22:00Z',
    notes: 'Upgraded Produce → Expand. Pro-rated $760 for remainder of cycle.',
  },
  {
    id: 'sev-003',
    subscriptionId: 'sub-001',
    type: 'renewed',
    actorContactId: null,
    actorSide: 'system',
    occurredAt: '2026-04-01T00:00:00Z',
    notes: 'Monthly auto-renew.',
  },
  {
    id: 'sev-004',
    subscriptionId: 'sub-002',
    type: 'created',
    actorContactId: 'cust-002-c1',
    actorSide: 'customer',
    occurredAt: '2024-09-01T10:00:00Z',
    notes: 'Annual plan, paid up front.',
  },
];

// ── Tier catalogue (customer-visible pricing) ─────────────────

export interface TierDescriptor {
  tier: SubscriptionTier;
  displayName: string;
  monthlyAud: number;
  annualAud: number;
  seatsIncluded: number;
  docsCap: number;
  storageCapGb: number;
  features: string[];
  highlight?: string;
}

export const TIER_CATALOGUE: TierDescriptor[] = [
  {
    tier: 'pilot',
    displayName: 'Pilot',
    monthlyAud: 0,
    annualAud: 0,
    seatsIncluded: 3,
    docsCap: 50,
    storageCapGb: 5,
    features: ['Quote access', 'Order tracking', 'Email support'],
  },
  {
    tier: 'produce',
    displayName: 'Produce',
    monthlyAud: 450,
    annualAud: 4500,
    seatsIncluded: 5,
    docsCap: 200,
    storageCapGb: 20,
    features: [
      'Everything in Pilot',
      'Invoice PDFs + online payment',
      '3D model review on quotes',
      'Business-hours support',
    ],
  },
  {
    tier: 'expand',
    displayName: 'Expand',
    monthlyAud: 1900,
    annualAud: 19000,
    seatsIncluded: 10,
    docsCap: 500,
    storageCapGb: 50,
    features: [
      'Everything in Produce',
      'Delivery notes + POD',
      'Shared 3D markup threads',
      'Subscription billing',
      'Priority support',
    ],
    highlight: 'Most popular',
  },
  {
    tier: 'excel',
    displayName: 'Excel',
    monthlyAud: 4900,
    annualAud: 49000,
    seatsIncluded: 25,
    docsCap: 2000,
    storageCapGb: 250,
    features: [
      'Everything in Expand',
      'Custom SLA + dedicated CSM',
      'SSO / SAML + audit exports',
      'Sandbox tenant for testing',
      'Anytime support',
    ],
  },
];

export function describeTier(tier: SubscriptionTier): TierDescriptor {
  return TIER_CATALOGUE.find((t) => t.tier === tier) ?? TIER_CATALOGUE[0];
}

// ── Public API ────────────────────────────────────────────────

function nowIso(): string {
  return new Date().toISOString();
}

export const subscriptionService = {
  /** Get the active subscription for a customer (or undefined if none). */
  getForCustomer(customerId: string): Subscription | undefined {
    return SUBSCRIPTIONS.find(
      (s) => s.customerId === customerId && s.status !== 'cancelled',
    );
  },

  /** Full history of events for a subscription. */
  listEvents(subscriptionId: string): SubscriptionEvent[] {
    return EVENTS.filter((e) => e.subscriptionId === subscriptionId).sort(
      (a, b) => b.occurredAt.localeCompare(a.occurredAt),
    );
  },

  /**
   * Change tier. Upgrades are instant + pro-rated; downgrades become a
   * "downgrade_requested" event that finance must process.
   */
  changeTier(input: {
    subscriptionId: string;
    toTier: SubscriptionTier;
    actorContactId: string;
    actorSide: 'customer' | 'internal';
  }): { subscription: Subscription; event: SubscriptionEvent } {
    const sub = SUBSCRIPTIONS.find((s) => s.id === input.subscriptionId);
    if (!sub) throw new Error(`Unknown subscription: ${input.subscriptionId}`);

    const tierOrder: SubscriptionTier[] = ['pilot', 'produce', 'expand', 'excel'];
    const fromIdx = tierOrder.indexOf(sub.tier);
    const toIdx = tierOrder.indexOf(input.toTier);
    const isUpgrade = toIdx > fromIdx;

    const event: SubscriptionEvent = {
      id: `sev-${Math.random().toString(36).slice(2, 10)}`,
      subscriptionId: sub.id,
      type: isUpgrade ? 'upgraded' : 'downgrade_requested',
      actorContactId: input.actorContactId,
      actorSide: input.actorSide,
      occurredAt: nowIso(),
      notes: isUpgrade
        ? `Upgraded ${describeTier(sub.tier).displayName} → ${describeTier(input.toTier).displayName}.`
        : `Downgrade requested: ${describeTier(sub.tier).displayName} → ${describeTier(input.toTier).displayName}. Finance review required.`,
      metadata: { from: sub.tier, to: input.toTier },
    };
    EVENTS.push(event);

    if (isUpgrade) {
      // Apply immediately
      const desc = describeTier(input.toTier);
      sub.tier = input.toTier;
      sub.planName = `${desc.displayName} — ${sub.billingCycle}`;
      sub.seats = Math.max(sub.seats, desc.seatsIncluded);
      sub.mrrAud =
        sub.billingCycle === 'monthly' ? desc.monthlyAud : desc.annualAud / 12;
      sub.usage.docsCap = desc.docsCap;
      sub.usage.storageCapGb = desc.storageCapGb;
    }
    // Downgrades are deferred — no state change to the subscription itself.
    return { subscription: sub, event };
  },

  /** Flip between monthly and annual billing (self-service). */
  changeBillingCycle(input: {
    subscriptionId: string;
    toCycle: 'monthly' | 'annual';
    actorContactId: string;
  }): Subscription {
    const sub = SUBSCRIPTIONS.find((s) => s.id === input.subscriptionId);
    if (!sub) throw new Error(`Unknown subscription: ${input.subscriptionId}`);
    if (sub.billingCycle === input.toCycle) return sub;
    sub.billingCycle = input.toCycle;
    const desc = describeTier(sub.tier);
    sub.planName = `${desc.displayName} — ${input.toCycle}`;
    sub.mrrAud =
      input.toCycle === 'monthly' ? desc.monthlyAud : desc.annualAud / 12;
    EVENTS.push({
      id: `sev-${Math.random().toString(36).slice(2, 10)}`,
      subscriptionId: sub.id,
      type: 'cycle_changed',
      actorContactId: input.actorContactId,
      actorSide: 'customer',
      occurredAt: nowIso(),
      notes: `Billing cycle changed to ${input.toCycle}.`,
    });
    return sub;
  },

  /**
   * Request cancellation. If `plan.closable` is true AND no blockers, flip
   * to `grace`. Otherwise record a cancel_requested event and stay active —
   * finance/sales handles the rest.
   */
  requestCancel(input: {
    subscriptionId: string;
    actorContactId: string;
    reason?: string;
    openOrdersCount?: number;
    outstandingInvoicesCount?: number;
  }): {
    subscription: Subscription;
    routedToSales: boolean;
    event: SubscriptionEvent;
  } {
    const sub = SUBSCRIPTIONS.find((s) => s.id === input.subscriptionId);
    if (!sub) throw new Error(`Unknown subscription: ${input.subscriptionId}`);

    const blocked =
      !sub.closable ||
      (input.openOrdersCount ?? 0) > 0 ||
      (input.outstandingInvoicesCount ?? 0) > 0;

    const event: SubscriptionEvent = {
      id: `sev-${Math.random().toString(36).slice(2, 10)}`,
      subscriptionId: sub.id,
      type: 'cancel_requested',
      actorContactId: input.actorContactId,
      actorSide: 'customer',
      occurredAt: nowIso(),
      notes: blocked
        ? 'Cancel requested — routed to finance review.'
        : 'Cancel requested — entered 30-day grace period.',
      metadata: {
        reason: input.reason,
        openOrdersCount: input.openOrdersCount ?? 0,
        outstandingInvoicesCount: input.outstandingInvoicesCount ?? 0,
      },
    };
    EVENTS.push(event);

    if (!blocked) {
      sub.status = 'grace' as SubscriptionStatus;
      const graceEnd = new Date();
      graceEnd.setDate(graceEnd.getDate() + 30);
      sub.cancelAt = graceEnd.toISOString();
    }

    // Mirror to the global audit feed so internal can follow up.
    auditService.record({
      actorId: input.actorContactId,
      actorType: 'user',
      entityType: 'role_assignment', // TODO: add 'subscription' to AuditEntityType
      entityId: sub.id,
      action: blocked ? 'submitted' : 'cancelled',
      description: blocked
        ? `Subscription cancel request (routed to finance) for customer ${sub.customerId}`
        : `Subscription entered grace — cancels ${sub.cancelAt?.slice(0, 10)}`,
      reason: input.reason,
      metadata: { subscriptionId: sub.id },
    });

    return { subscription: sub, routedToSales: blocked, event };
  },

  /** Customer-side update to stored payment method label. (Real impl = Stripe SetupIntent.) */
  updatePaymentMethod(input: {
    subscriptionId: string;
    label: string;
    actorContactId: string;
  }): Subscription {
    const sub = SUBSCRIPTIONS.find((s) => s.id === input.subscriptionId);
    if (!sub) throw new Error(`Unknown subscription: ${input.subscriptionId}`);
    sub.paymentMethodLabel = input.label;
    EVENTS.push({
      id: `sev-${Math.random().toString(36).slice(2, 10)}`,
      subscriptionId: sub.id,
      type: 'payment_method_updated',
      actorContactId: input.actorContactId,
      actorSide: 'customer',
      occurredAt: nowIso(),
      notes: `Payment method updated to ${input.label}.`,
    });
    return sub;
  },
};
