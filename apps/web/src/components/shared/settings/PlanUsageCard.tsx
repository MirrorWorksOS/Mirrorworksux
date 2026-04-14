/**
 * PlanUsageCard — Shows current plan tier, usage progress bars, and upgrade CTA.
 * Rendered inside ModuleSettingsLayout below the active panel.
 * Matches Figma: Blocks / Sell Settings / General (node 223:132261)
 */

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { cn } from '../../ui/utils';
import {
  getModuleUsage,
  getUsagePercentage,
  getUsageStatus,
  getNextTier,
  CURRENT_SUBSCRIPTION,
  type TierName,
} from '@/lib/subscription';

interface PlanUsageCardProps {
  moduleName: string;
  tierName?: TierName;
}

export function PlanUsageCard({ moduleName, tierName }: PlanUsageCardProps) {
  const tier = tierName ?? CURRENT_SUBSCRIPTION.tier;
  const metrics = getModuleUsage(moduleName);
  const nextTier = getNextTier(tier);
  const renewalDate = new Date(CURRENT_SUBSCRIPTION.renewalDate);

  // Excel tier has no limits to display
  if (tier === 'Excel') return null;

  return (
    <Card className="bg-card border border-border rounded-[var(--shape-lg)] overflow-hidden mt-6">
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <h3 className="text-base font-medium text-foreground">Plan Usage</h3>
          <Badge className="bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] text-[var(--neutral-600)] dark:text-[var(--neutral-400)] border-0 text-xs rounded-full px-2.5 py-0.5 font-medium">
            {tier}
          </Badge>
        </div>

        {/* Usage Metrics */}
        {metrics.length > 0 && (
          <div className="space-y-4">
            {metrics.map((metric) => {
              const pct = getUsagePercentage(metric.current, metric.limit);
              const status = getUsageStatus(pct);

              return (
                <div key={metric.key} className="space-y-2">
                  <span className="text-sm font-medium text-foreground">
                    {metric.current} / {metric.limit} {metric.label}
                  </span>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--neutral-200)] dark:bg-[var(--neutral-700)]">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500 ease-[var(--ease-standard)]',
                        status === 'normal' && 'bg-[var(--mw-mirage)] dark:bg-[var(--neutral-300)]',
                        status === 'warning' && 'bg-[var(--mw-yellow-500)]',
                        status === 'critical' && 'bg-[var(--mw-error)]',
                        status === 'exceeded' && 'bg-[var(--mw-error)]',
                      )}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No numeric limits for this module — show general info */}
        {metrics.length === 0 && (
          <p className="text-sm text-[var(--neutral-500)]">
            No usage limits for {moduleName} on the {tier} plan.
          </p>
        )}

        {/* Renewal Date */}
        <div>
          <p className="text-xs text-[var(--neutral-500)]">Renewal Date</p>
          <p className="text-sm font-medium text-foreground">
            {renewalDate.toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Upgrade CTA */}
      {nextTier && (
        <div className="px-6 pb-6">
          <Button
            className="bg-[var(--mw-mirage)] hover:bg-[var(--mw-mirage)]/90 text-white gap-2"
          >
            Upgrade plan
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}
