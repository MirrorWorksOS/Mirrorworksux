/**
 * Customer-portal payment methods — central catalog used by:
 *   - Sell → Settings → Payments  (toggles which methods are accepted)
 *   - Portal quote view           (shows the customer what's accepted)
 *   - Portal invoice "Pay" flow   (renders the method picker)
 *
 * Each entry is keyed by a stable string id stored in PortalPreferences
 * `acceptedPaymentMethods`. Adding a new method = add one entry here.
 */
import { CreditCard, Building2, Receipt, Banknote, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type PaymentMethodId = 'card' | 'eft' | 'bpay' | 'payid' | 'terms';

export interface PaymentMethodDef {
  id: PaymentMethodId;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  /** Customer-facing rail destination — phase-2 routes to a real provider. */
  handoff: 'stripe' | 'bank' | 'bpay' | 'payid' | 'invoice';
}

export const PAYMENT_METHODS: PaymentMethodDef[] = [
  {
    id: 'card',
    label: 'Credit or debit card',
    shortLabel: 'Card',
    description: 'Visa, Mastercard, Amex via Stripe Checkout.',
    icon: CreditCard,
    handoff: 'stripe',
  },
  {
    id: 'eft',
    label: 'Bank transfer (EFT)',
    shortLabel: 'EFT',
    description: 'Pay by direct deposit to our bank account.',
    icon: Building2,
    handoff: 'bank',
  },
  {
    id: 'bpay',
    label: 'BPAY',
    shortLabel: 'BPAY',
    description: 'Pay from your Australian bank using a BPAY biller code.',
    icon: Receipt,
    handoff: 'bpay',
  },
  {
    id: 'payid',
    label: 'PayID',
    shortLabel: 'PayID',
    description: 'Instant transfer using our ABN as the PayID.',
    icon: Banknote,
    handoff: 'payid',
  },
  {
    id: 'terms',
    label: 'Net 30 account terms',
    shortLabel: 'Terms',
    description: 'Approved account customers — pay against this invoice within 30 days.',
    icon: Clock,
    handoff: 'invoice',
  },
];

export const DEFAULT_ACCEPTED_PAYMENT_METHODS: PaymentMethodId[] = [
  'card',
  'eft',
  'bpay',
];

export function getPaymentMethod(id: string): PaymentMethodDef | undefined {
  return PAYMENT_METHODS.find((m) => m.id === id);
}

export function getEnabledPaymentMethods(
  ids: readonly string[] | undefined,
): PaymentMethodDef[] {
  if (!ids?.length) return [];
  // Preserve PAYMENT_METHODS catalog order so the UI is stable.
  return PAYMENT_METHODS.filter((m) => ids.includes(m.id));
}
