import { Check, Minus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';
import {
  AI_CREDIT_PACKS,
  CURRENT_SUBSCRIPTION,
  FEATURE_GATES,
  TIERS,
  VOLUME_DISCOUNT_BANDS,
  type TierName,
} from '@/lib/subscription';

const TIER_ORDER: TierName[] = ['Trial', 'Make', 'Run', 'Operate', 'Enterprise'];

function priceLabel(tier: TierName): string {
  const config = TIERS[tier];
  if (config.priceMonthly === null) return 'Quoted';
  if (config.priceMonthly === 0) return 'Free';
  return `$${config.priceMonthly}/user/mo`;
}

function annualLabel(tier: TierName): string {
  const config = TIERS[tier];
  if (config.priceAnnual === null) return 'Contact sales';
  if (config.priceAnnual === 0) return '30-day trial';
  return `$${config.priceAnnual}/user/year`;
}

function includedFeatures(tier: TierName): string[] {
  const features: string[] = [];
  Object.entries(FEATURE_GATES).forEach(([module, gates]) => {
    gates.forEach((gate) => {
      if (gate.tiers[tier]) features.push(`${module}: ${gate.label}`);
    });
  });
  return features;
}

export function PricingPage() {
  const currentTier = CURRENT_SUBSCRIPTION.tier;

  return (
    <PageShell>
      <PageHeader
        title="Pricing"
        subtitle="Compare MirrorWorks plans, included AI actions, module gates, and volume discounts."
      />

      <div className="grid gap-4 xl:grid-cols-5">
        {TIER_ORDER.map((tier) => {
          const config = TIERS[tier];
          const isCurrent = tier === currentTier;
          const features = includedFeatures(tier);

          return (
            <Card
              key={tier}
              className={cn(
                'flex min-h-[520px] flex-col p-5',
                isCurrent && 'border-[var(--mw-yellow-400)] ring-2 ring-[var(--mw-yellow-400)]/40',
              )}
            >
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-foreground">{tier}</h2>
                  {isCurrent && <Badge className="bg-[var(--mw-yellow-400)] text-primary-foreground">Current</Badge>}
                </div>
                <p className="text-3xl font-semibold tracking-tight text-foreground">{priceLabel(tier)}</p>
                <p className="mt-1 text-xs text-[var(--neutral-500)]">{annualLabel(tier)}</p>
              </div>

              <div className="mb-4 rounded-[var(--shape-md)] border border-[var(--border)] bg-[var(--neutral-100)] p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Sparkles className="h-4 w-4 text-[var(--mw-yellow-400)]" />
                  AI actions
                </div>
                <p className="mt-1 text-sm text-[var(--neutral-600)]">
                  {config.aiCreditsPerMonth === null
                    ? 'Unlimited fair-use pool'
                    : `${config.aiCreditsPerMonth.toLocaleString()} included per month`}
                </p>
              </div>

              <ul className="flex-1 space-y-2 text-sm">
                {features.slice(0, 9).map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mw-success)]" />
                    <span className="text-[var(--neutral-600)]">{feature}</span>
                  </li>
                ))}
                {features.length === 0 && (
                  <li className="flex items-start gap-2">
                    <Minus className="mt-0.5 h-4 w-4 shrink-0 text-[var(--neutral-400)]" />
                    <span className="text-[var(--neutral-600)]">Core dashboard access during evaluation.</span>
                  </li>
                )}
                {features.length > 9 && (
                  <li className="text-xs text-[var(--neutral-500)]">+ {features.length - 9} more features</li>
                )}
              </ul>

              <Button
                className={cn(
                  'mt-5 h-11 rounded-full',
                  isCurrent
                    ? 'border-[var(--border)]'
                    : 'bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]',
                )}
                variant={isCurrent ? 'outline' : 'default'}
                disabled={isCurrent}
                onClick={() => {
                  toast.success(tier === 'Enterprise' ? 'Sales handoff prepared' : `${tier} plan selected`, {
                    description: tier === 'Enterprise'
                      ? 'A workspace plan summary is ready for the sales team.'
                      : 'Review the change in Control > Billing & subscription before confirming.',
                  });
                }}
              >
                {isCurrent ? 'Current plan' : tier === 'Enterprise' ? 'Contact sales' : `Switch to ${tier}`}
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground">AI credit packs</h2>
          <p className="mt-1 text-sm text-[var(--neutral-500)]">
            Packs are available for Make, Run, and Operate teams when seasonal AI usage exceeds the included monthly pool.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {AI_CREDIT_PACKS.map((pack) => (
              <div key={pack.id} className="rounded-[var(--shape-lg)] border border-[var(--border)] bg-card p-4">
                <p className="text-sm font-medium text-foreground">{pack.label}</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">${pack.priceUsd}</p>
                <p className="mt-1 text-xs text-[var(--neutral-500)]">${pack.perActionUsd.toFixed(3)} per action</p>
                <p className="mt-3 text-xs text-[var(--neutral-600)]">{pack.bestFor}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground">Volume discounts</h2>
          <div className="mt-4 space-y-3">
            {VOLUME_DISCOUNT_BANDS.map((band) => (
              <div key={`${band.minSeats}-${band.maxSeats ?? 'plus'}`} className="flex items-center justify-between rounded-[var(--shape-md)] bg-[var(--neutral-100)] px-3 py-2">
                <span className="text-sm text-foreground">
                  {band.minSeats}{band.maxSeats ? `-${band.maxSeats}` : '+'} seats
                </span>
                <span className="text-sm font-medium text-foreground">{band.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
