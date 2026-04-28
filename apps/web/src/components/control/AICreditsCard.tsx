/**
 * AICreditsCard — Surface AI action quota, current usage, owned packs, and the
 * "buy more" buying flow. Mounted inside Control → Billing & subscription.
 *
 * Source of truth for quotas + pack pricing: lib/subscription.ts (which
 * mirrors docs/SAL 02 — Pricing Tiers and Strategy.xlsx).
 */

import { useMemo, useState } from 'react';
import { Sparkles, ShoppingBag, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  AI_CREDIT_PACKS,
  AI_OVERAGE_RATE_USD,
  CURRENT_SUBSCRIPTION,
  TIERS,
  getAICreditsRemaining,
  getUsageStatus,
  type AICreditPack,
} from '@/lib/subscription';

function formatActions(n: number): string {
  return n.toLocaleString('en-US');
}

function formatUsd(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}

export function AICreditsCard() {
  const tier = CURRENT_SUBSCRIPTION.tier;
  const tierConfig = TIERS[tier];
  const remaining = getAICreditsRemaining();
  const [packDialogOpen, setPackDialogOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<AICreditPack | null>(null);

  const usagePct = useMemo(() => {
    if (remaining.includedQuota === null || remaining.includedQuota === 0) return 0;
    return Math.round((remaining.includedUsed / remaining.includedQuota) * 100);
  }, [remaining]);

  const usageStatus = getUsageStatus(usagePct);
  const barColor =
    usageStatus === 'exceeded' || usageStatus === 'critical' ? 'bg-[var(--mw-error)]' :
      usageStatus === 'warning' ? 'bg-[var(--mw-yellow-500)]' :
        'bg-[var(--mw-mirage)] dark:bg-[var(--neutral-300)]';

  const handleBuyPack = (pack: AICreditPack) => {
    setSelectedPack(pack);
    setPackDialogOpen(true);
  };

  const handleConfirmBuy = () => {
    if (!selectedPack) return;
    // TODO(backend): aiCredits.purchasePack(selectedPack.id)
    toast.success(`Purchased ${selectedPack.label}`, {
      description: `${formatActions(selectedPack.actions)} actions added (rolls over month-to-month within your subscription year).`,
    });
    setPackDialogOpen(false);
    setSelectedPack(null);
  };

  return (
    <>
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--mw-yellow-400)]" />
            <h2 className="text-lg font-semibold">AI credits</h2>
            <Badge variant="outline" className="text-xs">{tier}</Badge>
          </div>
        </div>

        {/* Quota meter */}
        {remaining.includedQuota === null ? (
          <div className="rounded-md border border-[var(--border)] bg-[var(--neutral-50)] dark:bg-[var(--neutral-900)] p-4">
            <p className="text-sm font-medium text-foreground">Unlimited AI actions</p>
            <p className="mt-1 text-xs text-[var(--neutral-500)]">
              Enterprise tiers receive committed AI quota with no overage surprises.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">Included quota this month</span>
                <span className="tabular-nums text-muted-foreground">
                  {formatActions(remaining.includedUsed)} / {formatActions(remaining.includedQuota)} ({usagePct}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn('h-full rounded-full transition-all', barColor)}
                  style={{ width: `${Math.min(usagePct, 100)}%` }}
                />
              </div>
              <p className="text-xs text-[var(--neutral-500)]">
                1 action ≈ 1 AI-assisted task (avg ~4,000 tokens). Quota resets monthly.
                {tierConfig.aiCreditsPerMonth !== null && (
                  <> Tier includes {formatActions(tierConfig.aiCreditsPerMonth)} actions / month.</>
                )}
              </p>
            </div>

            {/* Packs owned */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-[var(--border)] p-3">
                <p className="text-xs text-[var(--neutral-500)]">Pack actions remaining</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums">
                  {formatActions(remaining.packsRemaining)}
                </p>
                <p className="text-xs text-[var(--neutral-500)]">Rolls over month-to-month within sub year.</p>
              </div>
              <div className="rounded-md border border-[var(--border)] p-3">
                <p className="text-xs text-[var(--neutral-500)]">Total available now</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums">
                  {remaining.total === null ? '∞' : formatActions(remaining.total)}
                </p>
                <p className="text-xs text-[var(--neutral-500)]">
                  Overage charged at {formatUsd(AI_OVERAGE_RATE_USD)} / action.
                </p>
              </div>
            </div>

            {/* Packs to buy */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-2 inline-flex items-center gap-1.5">
                <ShoppingBag className="h-4 w-4" /> Buy more
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {AI_CREDIT_PACKS.map((pack) => (
                  <Card
                    key={pack.id}
                    className="border border-[var(--border)] p-4 transition hover:border-[var(--mw-yellow-400)]"
                  >
                    <div className="flex items-baseline justify-between">
                      <p className="text-base font-semibold">{pack.label}</p>
                      <p className="text-base font-semibold tabular-nums">{formatUsd(pack.priceUsd)}</p>
                    </div>
                    <p className="mt-1 text-xs text-[var(--neutral-500)]">
                      {formatUsd(pack.perActionUsd)} / action · {pack.bestFor}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 w-full"
                      onClick={() => handleBuyPack(pack)}
                    >
                      Buy pack
                    </Button>
                  </Card>
                ))}
              </div>
              <p className="mt-3 text-xs text-[var(--neutral-500)]">
                Packs are non-expiring within the subscription year. If you consistently use more than one pack per month, an upgrade typically beats packs on price.
              </p>
            </div>
          </>
        )}
      </Card>

      <Dialog open={packDialogOpen} onOpenChange={setPackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm pack purchase</DialogTitle>
            <DialogDescription>
              {selectedPack && (
                <>
                  Purchase <strong>{selectedPack.label}</strong> for{' '}
                  <strong>{formatUsd(selectedPack.priceUsd)}</strong>?
                  Charged immediately to your payment method on file. Actions are added now and roll over until your renewal on {CURRENT_SUBSCRIPTION.renewalDate}.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPackDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
              onClick={handleConfirmBuy}
            >
              <Check className="mr-2 h-4 w-4" /> Confirm purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
