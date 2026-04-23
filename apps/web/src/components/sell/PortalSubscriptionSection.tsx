/**
 * PortalSubscriptionSection — customer-facing subscription management card.
 *
 * Rendered in the Customer Portal when the logged-in identity has
 * `portal.subscriptions.view`. Shows:
 *   - Active plan card (tier badge, seats, renewal, MRR)
 *   - Usage meters (seats / docs / storage) — only if `showUsage`
 *   - Next invoice preview
 *   - Billing history (recent SubscriptionEvents)
 *   - Plan actions: change tier, toggle billing cycle, update payment,
 *     request cancel
 *
 * Permission gates:
 *   - Modify (tier + cycle + payment method) requires
 *     `portal.subscriptions.modify`
 *   - Cancel requires `portal.subscriptions.cancel` AND plan.closable AND
 *     no open orders / outstanding invoices. Otherwise the cancel button
 *     routes to finance review.
 *
 * Kept separate from lib/subscription.ts (which models the tenant's
 * MirrorWorks subscription) — this surfaces the tenant-customer contract.
 */

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  CreditCard,
  Users,
  FileText,
  HardDrive,
  Sparkles,
  Receipt,
  Check,
  ChevronRight,
  History,
  RefreshCcw,
  X,
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { staggerItem } from '@/components/shared/motion/motion-variants';

import {
  subscriptionService,
  TIER_CATALOGUE,
  describeTier,
} from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import type {
  Subscription,
  SubscriptionEvent,
  SubscriptionTier,
} from '@/types/entities';

interface PortalSubscriptionSectionProps {
  customerId: string;
  showUsage: boolean;
  openOrdersCount: number;
  outstandingInvoicesCount: number;
}

function formatAud(value: number): string {
  return value.toLocaleString('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  });
}

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const eventLabel: Record<SubscriptionEvent['type'], string> = {
  created: 'Plan started',
  upgraded: 'Plan upgraded',
  downgrade_requested: 'Downgrade requested',
  cycle_changed: 'Billing cycle changed',
  payment_method_updated: 'Payment method updated',
  cancel_requested: 'Cancellation requested',
  reactivated: 'Plan reactivated',
  payment_failed: 'Payment failed',
  renewed: 'Auto-renewed',
};

export function PortalSubscriptionSection({
  customerId,
  showUsage,
  openOrdersCount,
  outstandingInvoicesCount,
}: PortalSubscriptionSectionProps) {
  const { hasPermission, identity } = useAuth();

  // Local copy so UI re-renders after mutations hit the mock store.
  const initial = useMemo(
    () => subscriptionService.getForCustomer(customerId),
    [customerId],
  );
  const [sub, setSub] = useState<Subscription | undefined>(initial);

  // Re-pull if customerId changes.
  useMemo(() => {
    setSub(subscriptionService.getForCustomer(customerId));
  }, [customerId]);

  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(
    null,
  );
  const [newPaymentLabel, setNewPaymentLabel] = useState('');

  const canModify = hasPermission('portal.subscriptions.modify');
  const canCancel = hasPermission('portal.subscriptions.cancel');

  const actorContactId =
    identity.kind === 'customer' ? identity.contact.id : 'internal-preview';

  if (!sub) {
    return (
      <motion.div variants={staggerItem}>
        <Card variant="flat" className="p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--shape-md)] bg-[var(--neutral-100)]">
              <Sparkles
                className="h-5 w-5 text-[var(--neutral-600)]"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <p className="text-sm font-semibold">No active subscription</p>
              <p className="text-xs text-[var(--neutral-500)]">
                You're on a pay-per-job arrangement. Contact your account
                manager to explore a recurring service plan.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  const currentTier = describeTier(sub.tier);
  const events = subscriptionService.listEvents(sub.id).slice(0, 6);

  const refresh = () => {
    setSub(subscriptionService.getForCustomer(customerId));
  };

  const handleChangeTier = () => {
    if (!selectedTier || selectedTier === sub.tier) {
      setPlanDialogOpen(false);
      return;
    }
    try {
      const { subscription: next } = subscriptionService.changeTier({
        subscriptionId: sub.id,
        toTier: selectedTier,
        actorContactId,
        actorSide: identity.kind === 'customer' ? 'customer' : 'internal',
      });
      const tierIdx = (t: SubscriptionTier) =>
        ['pilot', 'produce', 'expand', 'excel'].indexOf(t);
      const isUpgrade = tierIdx(selectedTier) > tierIdx(sub.tier);
      toast.success(
        isUpgrade
          ? `Upgraded to ${describeTier(selectedTier).displayName}`
          : 'Downgrade requested',
        {
          description: isUpgrade
            ? 'New features are available immediately.'
            : 'Finance will action this within 2 business days.',
        },
      );
      setSub({ ...next });
      setPlanDialogOpen(false);
      refresh();
    } catch (err) {
      toast.error('Could not change plan', {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const handleToggleCycle = () => {
    const toCycle = sub.billingCycle === 'monthly' ? 'annual' : 'monthly';
    try {
      const next = subscriptionService.changeBillingCycle({
        subscriptionId: sub.id,
        toCycle,
        actorContactId,
      });
      setSub({ ...next });
      toast.success(
        `Switched to ${toCycle} billing`,
        toCycle === 'annual'
          ? { description: 'You save ~17% with annual billing.' }
          : undefined,
      );
    } catch (err) {
      toast.error('Could not change billing cycle', {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const handleUpdatePayment = () => {
    if (!newPaymentLabel.trim()) {
      setPaymentDialogOpen(false);
      return;
    }
    try {
      const next = subscriptionService.updatePaymentMethod({
        subscriptionId: sub.id,
        label: newPaymentLabel.trim(),
        actorContactId,
      });
      setSub({ ...next });
      toast.success('Payment method updated', {
        description: newPaymentLabel.trim(),
      });
      setPaymentDialogOpen(false);
      setNewPaymentLabel('');
    } catch (err) {
      toast.error('Could not update payment method', {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const handleRequestCancel = () => {
    try {
      const result = subscriptionService.requestCancel({
        subscriptionId: sub.id,
        actorContactId,
        reason: cancelReason || undefined,
        openOrdersCount,
        outstandingInvoicesCount,
      });
      if (result.routedToSales) {
        toast.info('Cancellation submitted for review', {
          description:
            'Your account manager will reach out within 2 business days.',
        });
      } else {
        toast.success('Subscription entered grace period', {
          description: `Access remains until ${formatDate(result.subscription.cancelAt)}.`,
        });
      }
      setSub({ ...result.subscription });
      setCancelDialogOpen(false);
      setCancelReason('');
    } catch (err) {
      toast.error('Could not request cancellation', {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const cancelBlocked =
    !sub.closable ||
    openOrdersCount > 0 ||
    outstandingInvoicesCount > 0;

  return (
    <motion.div variants={staggerItem} className="space-y-4">
      {/* ── Plan summary ─────────────────────────────────────────── */}
      <Card variant="flat" className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--shape-md)] bg-[var(--mw-yellow-50)]">
              <Sparkles
                className="h-5 w-5 text-[var(--mw-yellow-700)]"
                strokeWidth={1.5}
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {currentTier.displayName} plan
                </p>
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium uppercase"
                >
                  {sub.billingCycle}
                </Badge>
                {sub.status !== 'active' && (
                  <Badge
                    variant="outline"
                    className="border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] text-[10px] font-medium uppercase text-[var(--mw-yellow-800)]"
                  >
                    {sub.status}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[var(--neutral-500)]">
                Renews {formatDate(sub.renewalDate)} · {formatAud(sub.mrrAud)}
                /mo equivalent
              </p>
              {sub.cancelAt && (
                <p className="text-xs text-[var(--mw-yellow-800)]">
                  Cancels on {formatDate(sub.cancelAt)}. Reach out to
                  reinstate.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedTier(sub.tier);
                setPlanDialogOpen(true);
              }}
              disabled={!canModify}
              title={!canModify ? 'Your role cannot change the plan' : undefined}
            >
              Change plan
              <ChevronRight className="ml-1 h-3.5 w-3.5" strokeWidth={1.5} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleToggleCycle}
              disabled={!canModify}
            >
              <RefreshCcw className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} />
              {sub.billingCycle === 'monthly'
                ? 'Switch to annual'
                : 'Switch to monthly'}
            </Button>
          </div>
        </div>

        {/* Usage meters */}
        {showUsage && (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <UsageMeter
              icon={<Users className="h-3.5 w-3.5" strokeWidth={1.5} />}
              label="Seats"
              used={sub.seatsUsed}
              cap={sub.seats}
              suffix=""
            />
            <UsageMeter
              icon={<FileText className="h-3.5 w-3.5" strokeWidth={1.5} />}
              label="Docs this month"
              used={sub.usage.docsThisMonth}
              cap={sub.usage.docsCap}
              suffix=""
            />
            <UsageMeter
              icon={<HardDrive className="h-3.5 w-3.5" strokeWidth={1.5} />}
              label="Storage"
              used={sub.usage.storageGb}
              cap={sub.usage.storageCapGb}
              suffix=" GB"
              decimals={1}
            />
          </div>
        )}
      </Card>

      {/* ── Next invoice + payment + billing history ────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card variant="flat" className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--shape-md)] bg-[var(--neutral-100)]">
              <Receipt
                className="h-4 w-4 text-[var(--neutral-700)]"
                strokeWidth={1.5}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Next invoice</p>
              {sub.nextInvoiceDate ? (
                <>
                  <p className="text-xs text-[var(--neutral-500)]">
                    {formatDate(sub.nextInvoiceDate)} ·{' '}
                    <span className="font-mono text-foreground">
                      {formatAud(sub.nextInvoiceAmount ?? sub.mrrAud)}
                    </span>
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--neutral-600)]">
                    <CreditCard className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Charged to {sub.paymentMethodLabel ?? 'saved method'}
                  </p>
                </>
              ) : (
                <p className="text-xs text-[var(--neutral-500)]">
                  No invoice scheduled.
                </p>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setNewPaymentLabel(sub.paymentMethodLabel ?? '');
                setPaymentDialogOpen(true);
              }}
              disabled={!canModify}
            >
              Update
            </Button>
          </div>
        </Card>

        <Card variant="flat" className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <History
              className="h-4 w-4 text-[var(--neutral-600)]"
              strokeWidth={1.5}
            />
            <p className="text-sm font-semibold">Billing history</p>
          </div>
          {events.length === 0 ? (
            <p className="text-xs text-[var(--neutral-500)]">
              No events yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {events.map((ev) => (
                <li
                  key={ev.id}
                  className="flex items-start justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {eventLabel[ev.type]}
                    </p>
                    {ev.notes && (
                      <p className="text-[var(--neutral-500)]">{ev.notes}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-[var(--neutral-400)]">
                    {formatDate(ev.occurredAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* ── Cancel footer ────────────────────────────────────────── */}
      {canCancel && (
        <div className="flex items-center justify-between gap-3 rounded-[var(--shape-md)] border border-dashed border-[var(--border)] px-4 py-3 text-xs">
          <div className="text-[var(--neutral-600)]">
            Need to pause or cancel?{' '}
            {cancelBlocked ? (
              <span className="text-[var(--mw-yellow-800)]">
                Your request will be routed to finance because there
                {openOrdersCount > 0
                  ? ` are ${openOrdersCount} open order${openOrdersCount === 1 ? '' : 's'}`
                  : ''}
                {openOrdersCount > 0 && outstandingInvoicesCount > 0
                  ? ' and'
                  : ''}
                {outstandingInvoicesCount > 0
                  ? ` ${outstandingInvoicesCount} unpaid invoice${outstandingInvoicesCount === 1 ? '' : 's'}`
                  : ''}
                {!sub.closable && openOrdersCount === 0 && outstandingInvoicesCount === 0
                  ? ' your plan requires finance approval'
                  : ''}
                .
              </span>
            ) : (
              <span>You can cancel immediately with a 30-day grace period.</span>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCancelDialogOpen(true)}
          >
            <X className="mr-1 h-3.5 w-3.5" strokeWidth={1.5} />
            Request cancellation
          </Button>
        </div>
      )}

      {/* ── Change plan dialog ───────────────────────────────────── */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Change your plan</DialogTitle>
            <DialogDescription>
              Upgrades apply instantly; downgrades are queued for finance
              review. Pricing shown ex-GST.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2 md:grid-cols-2">
            {TIER_CATALOGUE.map((t) => {
              const isCurrent = t.tier === sub.tier;
              const isSelected = t.tier === selectedTier;
              return (
                <button
                  key={t.tier}
                  type="button"
                  onClick={() => setSelectedTier(t.tier)}
                  className={`rounded-[var(--shape-md)] border px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? 'border-[var(--mw-yellow-500)] bg-[var(--mw-yellow-50)]'
                      : 'border-[var(--border)] hover:border-[var(--mw-yellow-300)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{t.displayName}</p>
                      {t.highlight && (
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase"
                        >
                          {t.highlight}
                        </Badge>
                      )}
                    </div>
                    {isCurrent && (
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase"
                      >
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[var(--neutral-500)]">
                    {formatAud(t.monthlyAud)}/mo or{' '}
                    {formatAud(t.annualAud)}/yr · {t.seatsIncluded} seats ·{' '}
                    {t.docsCap} docs · {t.storageCapGb} GB
                  </p>
                  <ul className="mt-2 space-y-0.5 text-xs text-[var(--neutral-600)]">
                    {t.features.slice(0, 3).map((f) => (
                      <li key={f} className="flex items-start gap-1.5">
                        <Check
                          className="mt-0.5 h-3 w-3 shrink-0 text-[var(--mw-success)]"
                          strokeWidth={2}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPlanDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!selectedTier || selectedTier === sub.tier}
              onClick={handleChangeTier}
              className="bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
            >
              Confirm change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Update payment method dialog ─────────────────────────── */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update payment method</DialogTitle>
            <DialogDescription>
              Enter the new stored method label. (Production: opens a
              Stripe SetupIntent.)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="pm-method">Payment method</Label>
              <Select
                value={newPaymentLabel}
                onValueChange={setNewPaymentLabel}
              >
                <SelectTrigger id="pm-method">
                  <SelectValue placeholder="Choose method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Visa •••• 4242">
                    Visa •••• 4242
                  </SelectItem>
                  <SelectItem value="Mastercard •••• 9003">
                    Mastercard •••• 9003
                  </SelectItem>
                  <SelectItem value="Direct debit — CBA">
                    Direct debit — CBA
                  </SelectItem>
                  <SelectItem value="Invoice (NET 30)">
                    Invoice (NET 30)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-[var(--neutral-500)]">
              Or enter a custom label:
            </p>
            <Input
              value={newPaymentLabel}
              onChange={(e) => setNewPaymentLabel(e.target.value)}
              placeholder="e.g. Amex •••• 1001"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaymentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpdatePayment}
              disabled={!newPaymentLabel.trim()}
              className="bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Cancel confirmation ──────────────────────────────────── */}
      <AlertDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelBlocked
                ? 'Your account has open orders or unpaid invoices, so this request will be routed to your account manager instead of being actioned immediately.'
                : 'Your subscription will enter a 30-day grace period. You can reinstate any time before it closes.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1 py-2">
            <Label htmlFor="cancel-reason">Reason (optional)</Label>
            <Textarea
              id="cancel-reason"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Helps us improve — what drove this decision?"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep subscription</AlertDialogCancel>
            <AlertDialogAction onClick={handleRequestCancel}>
              {cancelBlocked ? 'Route to finance' : 'Start grace period'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────

function UsageMeter({
  icon,
  label,
  used,
  cap,
  suffix,
  decimals = 0,
}: {
  icon: React.ReactNode;
  label: string;
  used: number;
  cap: number;
  suffix?: string;
  decimals?: number;
}) {
  const pct = cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : 0;
  const near = pct >= 80;
  const format = (n: number) =>
    decimals > 0 ? n.toFixed(decimals) : n.toLocaleString();

  return (
    <div className="rounded-[var(--shape-md)] border border-[var(--border)] px-3 py-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[var(--neutral-600)]">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-mono text-foreground">
          {format(used)}
          {suffix ?? ''} / {format(cap)}
          {suffix ?? ''}
        </span>
      </div>
      <Progress
        value={pct}
        className={`mt-2 h-1.5 ${near ? '[&_[data-slot=progress-indicator]]:bg-[var(--mw-yellow-500)]' : ''}`}
      />
    </div>
  );
}
