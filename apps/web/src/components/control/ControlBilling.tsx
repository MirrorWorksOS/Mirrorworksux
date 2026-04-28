import { useMemo, useState } from 'react';
import { Check, CreditCard, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { DarkAccentCard } from '@/components/shared/cards/DarkAccentCard';
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
import {
  CURRENT_SUBSCRIPTION,
  TIERS,
  FEATURE_GATES,
  getModuleUsage,
  getUsagePercentage,
  getUsageStatus,
  type TierName,
} from '@/lib/subscription';
import { useCurrentUser } from '@/lib/auth';
import { AICreditsCard } from './AICreditsCard';

const MODULES_WITH_LIMITS = ['Sell', 'Plan', 'Make', 'Org'];
const TIER_ORDER: TierName[] = ['Trial', 'Make', 'Run', 'Operate', 'Enterprise'];

function priceForTier(tier: TierName, cycle: 'annual' | 'monthly'): string {
  const t = TIERS[tier];
  const price = cycle === 'annual' ? t.priceAnnual : t.priceMonthly;
  if (price === null) return 'Quoted';
  if (price === 0) return 'Free';
  return cycle === 'annual'
    ? `$${price}/yr ($${t.priceAnnualEffectiveMonthly?.toFixed(0) ?? price}/mo)`
    : `$${price}/mo`;
}

function tierFeatureSummary(tier: TierName): string[] {
  const features: string[] = [];
  for (const moduleKey of Object.keys(FEATURE_GATES)) {
    const on = FEATURE_GATES[moduleKey].filter(g => g.tiers[tier]).map(g => g.label);
    if (on.length > 0) features.push(`${moduleKey}: ${on.join(', ')}`);
  }
  return features;
}

export function ControlBilling() {
  const user = useCurrentUser();
  const currentTier = CURRENT_SUBSCRIPTION.tier;
  const cycle = CURRENT_SUBSCRIPTION.billingCycle;
  const [pendingTier, setPendingTier] = useState<TierName | null>(null);

  const usageRows = useMemo(() => {
    const rows: { module: string; metric: string; current: number; limit: number; pct: number }[] = [];
    for (const m of MODULES_WITH_LIMITS) {
      for (const u of getModuleUsage(m)) {
        if (u.limit !== null) {
          rows.push({
            module: m, metric: u.label, current: u.current, limit: u.limit,
            pct: getUsagePercentage(u.current, u.limit),
          });
        }
      }
    }
    return rows.sort((a, b) => b.pct - a.pct);
  }, []);

  if (!user.isOwner) {
    return (
      <div className="space-y-6 bg-[var(--neutral-100)] p-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Billing</h1>
        <Card className="p-6 text-sm text-muted-foreground">
          Only the workspace owner can view or change billing. Contact your owner to make changes.
        </Card>
      </div>
    );
  }

  const handleChangeTier = (target: TierName) => {
    setPendingTier(target);
  };

  const confirmTierChange = () => {
    if (!pendingTier) return;
    const direction =
      TIER_ORDER.indexOf(pendingTier) > TIER_ORDER.indexOf(currentTier) ? 'Upgrade' : 'Downgrade';
    // TODO(backend): isUpgrade ? subscription.upgradeTo(pendingTier) : subscription.requestDowngrade(pendingTier)
    if (direction === 'Upgrade') {
      toast.success(`Upgraded to ${pendingTier}`, {
        description: 'New features are available immediately. Charged the prorated difference today.',
      });
    } else {
      toast.success(`Downgrade to ${pendingTier} requested`, {
        description: 'Finance will action at next renewal. New limits apply from then.',
      });
    }
    setPendingTier(null);
  };

  const handleManageCard = () => {
    // TODO(backend): billing.openStripePortal()
    toast.success('Opening Stripe customer portal…');
  };

  return (
    <div className="space-y-8 bg-[var(--neutral-100)] p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Billing & subscription</h1>
        <p className="mt-1 text-sm text-[var(--neutral-500)]">
          Manage your plan, usage, and payment details for {user.org}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <DarkAccentCard
          icon={CreditCard}
          label="Current plan"
          value={currentTier}
          subtext={`${priceForTier(currentTier, cycle)} · billed ${cycle}`}
        />
        <DarkAccentCard
          icon={Users}
          label="Licensed seats"
          value={`${CURRENT_SUBSCRIPTION.currentUsers}`}
          subtext="Active users"
        />
        <DarkAccentCard
          icon={TrendingUp}
          label="Next renewal"
          value={CURRENT_SUBSCRIPTION.renewalDate}
          subtext={cycle === 'annual' ? 'Annual billing' : 'Monthly billing'}
        />
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Usage this month</h2>
          <Button variant="outline" size="sm" onClick={handleManageCard}>Manage payment method</Button>
        </div>
        <div className="space-y-4">
          {usageRows.map(row => {
            const status = getUsageStatus(row.pct);
            const barColor = status === 'exceeded' ? 'bg-red-600'
              : status === 'critical' ? 'bg-red-500'
              : status === 'warning' ? 'bg-amber-500'
              : 'bg-emerald-500';
            return (
              <div key={`${row.module}-${row.metric}`}>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span className="font-medium">{row.module} · {row.metric}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {row.current} / {row.limit} ({row.pct}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${Math.min(row.pct, 100)}%` }} />
                </div>
              </div>
            );
          })}
          {usageRows.length === 0 && (
            <p className="text-sm text-muted-foreground">No metered usage on this tier.</p>
          )}
        </div>
      </Card>

      <AICreditsCard />

      <div>
        <h2 className="mb-4 text-lg font-semibold">Compare plans</h2>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {TIER_ORDER.map(tier => {
            const isCurrent = tier === currentTier;
            const currentIdx = TIER_ORDER.indexOf(currentTier);
            const thisIdx = TIER_ORDER.indexOf(tier);
            const direction = thisIdx > currentIdx ? 'Upgrade' : thisIdx < currentIdx ? 'Downgrade' : null;
            return (
              <Card
                key={tier}
                className={cn(
                  'p-5 transition',
                  isCurrent && 'ring-2 ring-[var(--mw-yellow-400)]',
                )}
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{tier}</h3>
                  {isCurrent && <Badge>Current</Badge>}
                </div>
                <p className="mb-4 text-2xl font-bold tabular-nums">{priceForTier(tier, cycle)}</p>
                <ul className="mb-5 space-y-2 text-sm">
                  {tierFeatureSummary(tier).map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                {direction && (
                  <Button
                    className="w-full"
                    variant={direction === 'Upgrade' ? 'default' : 'outline'}
                    onClick={() => handleChangeTier(tier)}
                  >
                    {direction} to {tier}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
                {isCurrent && (
                  <Button className="w-full" variant="outline" disabled>
                    Current plan
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="p-6 text-sm text-muted-foreground">
        Tier changes take effect immediately. Downgrades prorate against your next invoice; upgrades charge the difference today.
        See the <a className="underline" href="/pricing" onClick={e => e.preventDefault()}>full pricing page</a> for feature-by-feature comparison.
      </Card>

      <Dialog open={pendingTier !== null} onOpenChange={(open) => { if (!open) setPendingTier(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingTier && TIER_ORDER.indexOf(pendingTier) > TIER_ORDER.indexOf(currentTier)
                ? `Upgrade to ${pendingTier}?`
                : `Downgrade to ${pendingTier}?`}
            </DialogTitle>
            <DialogDescription>
              {pendingTier && (() => {
                const isUpgrade = TIER_ORDER.indexOf(pendingTier) > TIER_ORDER.indexOf(currentTier);
                const cycleLabel = cycle === 'annual' ? '/yr' : '/mo';
                const targetPrice = cycle === 'annual' ? TIERS[pendingTier].priceAnnual : TIERS[pendingTier].priceMonthly;
                const priceLabel = targetPrice === null ? 'Quoted' : `$${targetPrice}/user${cycleLabel}`;
                return isUpgrade ? (
                  <>
                    Moving from <strong>{currentTier}</strong> to <strong>{pendingTier}</strong>{' '}
                    ({priceLabel}). Charged the prorated difference today; new feature access is
                    available immediately. Tier limits update at the same time.
                  </>
                ) : (
                  <>
                    Downgrading from <strong>{currentTier}</strong> to <strong>{pendingTier}</strong>{' '}
                    ({priceLabel}). New billing applies from your next renewal{' '}
                    ({CURRENT_SUBSCRIPTION.renewalDate}). Existing data above the lower tier's caps stays available but new entries will be blocked once you exceed the new limits.
                  </>
                );
              })()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingTier(null)}>Cancel</Button>
            <Button
              className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
              onClick={confirmTierChange}
            >
              {pendingTier && TIER_ORDER.indexOf(pendingTier) > TIER_ORDER.indexOf(currentTier)
                ? `Confirm upgrade`
                : `Request downgrade`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
