/**
 * UpgradeDialog — Modal prompt for plan upgrades with phase-aware messaging.
 *
 * Phases:
 *   soft_warning  (70%)  — informational, dismissible
 *   approaching   (90%)  — urgent, dismissible
 *   grace_period  (>100%) — blocking with countdown
 *   hard_limit    (grace expired) — feature disabled
 */

import React from 'react';
import { ExternalLink, AlertTriangle, TrendingUp, Lock } from 'lucide-react';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import {
  getNextTier,
  getGraceDaysRemaining,
  CURRENT_SUBSCRIPTION,
  TIERS,
  type TierName,
  type GracePhase,
} from '@/lib/subscription';

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phase: GracePhase;
  moduleName: string;
  metricLabel: string;
  current: number;
  limit: number;
}

const PHASE_CONFIG: Record<GracePhase, {
  icon: React.ElementType;
  iconColor: string;
  title: (metric: string) => string;
  canDismiss: boolean;
}> = {
  none: {
    icon: TrendingUp,
    iconColor: 'text-[var(--neutral-500)]',
    title: () => 'Upgrade your plan',
    canDismiss: true,
  },
  soft_warning: {
    icon: TrendingUp,
    iconColor: 'text-[var(--mw-yellow-500)]',
    title: (metric) => `You're approaching your ${metric} limit`,
    canDismiss: true,
  },
  approaching: {
    icon: AlertTriangle,
    iconColor: 'text-[var(--mw-yellow-500)]',
    title: (metric) => `Almost at your ${metric} limit`,
    canDismiss: true,
  },
  grace_period: {
    icon: AlertTriangle,
    iconColor: 'text-[var(--mw-error)]',
    title: () => "You've exceeded your plan limits",
    canDismiss: true,
  },
  hard_limit: {
    icon: Lock,
    iconColor: 'text-[var(--mw-error)]',
    title: (metric) => `${metric} creation disabled`,
    canDismiss: false,
  },
};

export function UpgradeDialog({
  open,
  onOpenChange,
  phase,
  moduleName,
  metricLabel,
  current,
  limit,
}: UpgradeDialogProps) {
  const config = PHASE_CONFIG[phase];
  const Icon = config.icon;
  const tier = CURRENT_SUBSCRIPTION.tier;
  const nextTier = getNextTier(tier);
  const graceDays = getGraceDaysRemaining();
  const remaining = Math.max(0, limit - current);

  function getDescription() {
    switch (phase) {
      case 'soft_warning':
        return `You're using ${current}/${limit} ${metricLabel.toLowerCase()} this month. Upgrade to ${nextTier} for more capacity.`;
      case 'approaching':
        return `You have ${remaining} ${metricLabel.toLowerCase()} remaining. Upgrade now to avoid interruption.`;
      case 'grace_period':
        return `You've exceeded your plan limits. ${graceDays !== null ? `You have ${graceDays} days remaining in your grace period.` : 'Your grace period has started.'}`;
      case 'hard_limit':
        return `Your grace period has ended. Upgrade to continue creating ${metricLabel.toLowerCase()} in ${moduleName}.`;
      default:
        return `Unlock more capacity by upgrading to ${nextTier}.`;
    }
  }

  return (
    <Dialog open={open} onOpenChange={config.canDismiss ? onOpenChange : undefined}>
      <DialogContent className="sm:max-w-[440px] rounded-[var(--shape-xl)]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className={`p-2 rounded-[var(--shape-md)] bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)]`}>
              <Icon className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            <DialogTitle className="text-lg">
              {config.title(metricLabel)}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-[var(--neutral-500)]">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        {/* Tier comparison */}
        {nextTier && (
          <div className="grid grid-cols-2 gap-3 my-4">
            {/* Current tier */}
            <div className="bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] rounded-[var(--shape-lg)] p-4">
              <Badge className="bg-[var(--neutral-200)] dark:bg-[var(--neutral-700)] text-[var(--neutral-600)] dark:text-[var(--neutral-400)] border-0 text-xs rounded-full mb-2">
                Current
              </Badge>
              <p className="text-sm font-medium text-foreground">{tier}</p>
              <p className="text-xs text-[var(--neutral-500)] mt-0.5">
                {TIERS[tier].priceAnnual === 0 ? 'Free' : `$${TIERS[tier].priceAnnual}/user/mo`}
              </p>
              <p className="text-xs text-[var(--neutral-500)] mt-1">
                {limit} {metricLabel}
              </p>
            </div>
            {/* Next tier */}
            <div className="bg-[var(--mw-yellow-400)]/5 border border-[var(--mw-yellow-400)]/20 rounded-[var(--shape-lg)] p-4">
              <Badge variant="softAccent" className="text-xs rounded-full mb-2">
                Recommended
              </Badge>
              <p className="text-sm font-medium text-foreground">{nextTier}</p>
              <p className="text-xs text-[var(--neutral-500)] mt-0.5">
                ${TIERS[nextTier].priceAnnual}/user/mo
              </p>
              <p className="text-xs text-[var(--neutral-500)] mt-1">
                {nextTier === 'Excel' ? 'Unlimited' : 'More'} {metricLabel}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {config.canDismiss && (
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-[var(--neutral-500)]"
            >
              {phase === 'grace_period' ? 'Continue with limits' : 'Not now'}
            </Button>
          )}
          <Button
            className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground gap-2"
          >
            Upgrade now
            <ExternalLink className="w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
