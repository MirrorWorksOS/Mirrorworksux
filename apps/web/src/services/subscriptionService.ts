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

// Mock subscriptions seeded with new pricing model. `mrrAud` historically held
// AUD; we now store USD per-month (8 seats × Run monthly = $392) — see
// docs/SAL 02 — Pricing Tiers and Strategy.xlsx for canonical USD pricing.
const SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-001',
    customerId: 'cust-001',
    tier: 'run',
    planName: 'Run — monthly',
    status: 'active',
    billingCycle: 'monthly',
    seats: 8,
    seatsUsed: 7,
    startDate: '2025-06-01',
    renewalDate: '2026-05-01',
    mrrAud: 8 * 49,
    nextInvoiceDate: '2026-05-01',
    nextInvoiceAmount: 8 * 49,
    paymentMethodLabel: 'Visa •••• 4242',
    closable: false,
    usage: {
      docsThisMonth: 187,
      docsCap: 500,
      storageGb: 14.2,
      storageCapGb: 500,
    },
  },
  {
    id: 'sub-002',
    customerId: 'cust-002',
    tier: 'make',
    planName: 'Make — annual',
    status: 'active',
    billingCycle: 'annual',
    seats: 5,
    seatsUsed: 3,
    startDate: '2024-09-01',
    renewalDate: '2026-09-01',
    // Annual list price × seats / 12 → effective monthly (≈ $123.33)
    mrrAud: Math.round((5 * 296) / 12),
    nextInvoiceDate: '2026-09-01',
    nextInvoiceAmount: 5 * 296,
    paymentMethodLabel: 'Direct debit — CBA',
    closable: true,
    usage: {
      docsThisMonth: 42,
      docsCap: 250,
      storageGb: 3.1,
      storageCapGb: 50,
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
    notes: 'Initial Make plan (monthly).',
  },
  {
    id: 'sev-002',
    subscriptionId: 'sub-001',
    type: 'upgraded',
    actorContactId: 'cust-001-c1',
    actorSide: 'customer',
    occurredAt: '2025-11-14T14:22:00Z',
    notes: 'Upgraded Make → Run. Pro-rated $80 for remainder of cycle.',
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
// Source: docs/SAL 02 — Pricing Tiers and Strategy.xlsx (USD, per user/month).
// `monthlyAud` / `annualAud` field names retained for callsite compatibility
// but values are USD; rename later if the customer-portal product diverges.

export interface TierDescriptor {
  tier: SubscriptionTier;
  displayName: string;
  /** Per-user monthly price (USD). `null` for Trial (free) and Enterprise (quoted). */
  monthlyAud: number | null;
  /** Per-user annual price billed upfront (USD). `null` for Trial and Enterprise. */
  annualAud: number | null;
  /** AI actions / month included with the tier. `null` = unlimited. */
  aiCreditsPerMonth: number | null;
  /** Sites / locations cap. `null` = unlimited / negotiated. */
  sitesIncluded: number | null;
  /** Storage cap in GB. `null` = unlimited / negotiated. */
  storageCapGb: number | null;
  features: string[];
  highlight?: string;
}

export const TIER_CATALOGUE: TierDescriptor[] = [
  {
    tier: 'trial',
    displayName: 'Trial',
    monthlyAud: 0,
    annualAud: 0,
    aiCreditsPerMonth: 2000,
    sitesIncluded: null,
    storageCapGb: null,
    features: [
      '30-day free trial',
      'Operate-tier feature access during trial',
      'Email support',
    ],
  },
  {
    tier: 'make',
    displayName: 'Make',
    monthlyAud: 29,
    annualAud: 296,
    aiCreditsPerMonth: 750,
    sitesIncluded: 1,
    storageCapGb: 50,
    features: [
      'Single site, up to 9 seats',
      '750 AI actions / month',
      '10 machines, 1,000 API calls / day',
      'Email support',
    ],
  },
  {
    tier: 'run',
    displayName: 'Run',
    monthlyAud: 49,
    annualAud: 500,
    aiCreditsPerMonth: 5000,
    sitesIncluded: 2,
    storageCapGb: 500,
    features: [
      'Everything in Make',
      'Up to 2 sites, 24 seats',
      '5,000 AI actions / month',
      '50 machines, 25,000 API calls / day',
      'Customer Portal, RFQs, Bills, Returns',
      'Priority support',
    ],
    highlight: 'Most popular',
  },
  {
    tier: 'operate',
    displayName: 'Operate',
    monthlyAud: 119,
    annualAud: 1214,
    aiCreditsPerMonth: 20000,
    sitesIncluded: 3,
    storageCapGb: 2000,
    features: [
      'Everything in Run',
      'Up to 3 sites, 49 seats',
      '20,000 AI actions / month',
      '200 machines, 50,000 API calls / day',
      'Predictive scheduling, SSO/SCIM, 4-hr SLA',
      'Vendor Comparison, MRP Suggestions, Reorder Rules',
    ],
  },
  {
    tier: 'enterprise',
    displayName: 'Enterprise',
    monthlyAud: null,
    annualAud: null,
    aiCreditsPerMonth: null,
    sitesIncluded: null,
    storageCapGb: null,
    features: [
      'Quoted ($60k–$150k / yr typical)',
      'Multi-factory + custom data residency',
      'SOC 2 audit reports, dedicated CSM',
      'Custom SLA, custom AI fine-tuning',
      'Compliance packs (AS9100, IATF, ISO 13485, ITAR)',
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

    const tierOrder: SubscriptionTier[] = ['trial', 'make', 'run', 'operate', 'enterprise'];
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
      // Per-seat pricing now; mrrAud holds USD effective monthly.
      const monthly = desc.monthlyAud;
      const annual = desc.annualAud;
      if (monthly !== null && annual !== null) {
        sub.mrrAud =
          sub.billingCycle === 'monthly' ? sub.seats * monthly : (sub.seats * annual) / 12;
      }
      // Storage cap now per-tier (50 / 500 / 2000 GB or null for Trial/Enterprise).
      if (desc.storageCapGb !== null) sub.usage.storageCapGb = desc.storageCapGb;
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
    const monthly = desc.monthlyAud;
    const annual = desc.annualAud;
    if (monthly !== null && annual !== null) {
      sub.mrrAud =
        input.toCycle === 'monthly' ? sub.seats * monthly : (sub.seats * annual) / 12;
    }
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
