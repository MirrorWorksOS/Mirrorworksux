/**
 * useUsageWarnings — Shows toast notifications when usage approaches limits.
 *
 * Warning phases (not overbearing):
 *   70%  → info toast, once per session per metric
 *   90%  → warning toast with upgrade CTA
 *   100% → error toast + opens UpgradeDialog
 *
 * Also surfaces warnings during specific actions like imports.
 */

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  getModuleUsage,
  getUsagePercentage,
  getUsageStatus,
  getNextTier,
  CURRENT_SUBSCRIPTION,
  type UsageStatus,
} from '@/lib/subscription';

// Track which warnings have fired this session to avoid spamming
const shownWarnings = new Set<string>();

/**
 * Show usage toasts for a module on mount (once per metric per session).
 */
export function useUsageWarnings(moduleName: string) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const metrics = getModuleUsage(moduleName);
    const nextTier = getNextTier(CURRENT_SUBSCRIPTION.tier);

    for (const metric of metrics) {
      if (metric.limit === null) continue;

      const pct = getUsagePercentage(metric.current, metric.limit);
      const status = getUsageStatus(pct);
      const key = `${moduleName}:${metric.key}:${status}`;

      if (status === 'normal' || shownWarnings.has(key)) continue;
      shownWarnings.add(key);

      // Stagger toasts to avoid overwhelming the user
      const delay = metrics.indexOf(metric) * 800;

      setTimeout(() => {
        if (status === 'warning') {
          toast(`You're using ${metric.current}/${metric.limit} ${metric.label.toLowerCase()} this month.${nextTier ? ` Upgrade to ${nextTier} for more.` : ''}`, {
            duration: 6000,
          });
        } else if (status === 'critical') {
          toast.warning(
            `${metric.limit - metric.current} ${metric.label.toLowerCase()} remaining. Upgrade now to avoid interruption.`,
            { duration: 8000 },
          );
        } else if (status === 'exceeded') {
          toast.error(
            `You've exceeded your ${metric.label.toLowerCase()} limit. Your 30-day grace period has started.`,
            { duration: 10000 },
          );
        }
      }, delay);
    }
  }, [moduleName]);
}

/**
 * Trigger an import-specific warning when bulk importing would exceed a limit.
 * Call this imperatively (not as a hook) before starting an import.
 *
 * @returns true if the import should proceed, false if blocked
 */
export function checkImportCapacity(
  moduleName: string,
  metricKey: string,
  importCount: number,
): { allowed: boolean; warning: string | null } {
  const metrics = getModuleUsage(moduleName);
  const metric = metrics.find(m => m.key === metricKey);

  if (!metric || metric.limit === null) return { allowed: true, warning: null };

  const afterImport = metric.current + importCount;
  const pct = getUsagePercentage(afterImport, metric.limit);
  const nextTier = getNextTier(CURRENT_SUBSCRIPTION.tier);

  if (pct > 100) {
    const overage = afterImport - metric.limit;
    return {
      allowed: false,
      warning: `Importing ${importCount} ${metric.label.toLowerCase()} would exceed your limit by ${overage}. You have ${metric.limit - metric.current} remaining.${nextTier ? ` Upgrade to ${nextTier} for more capacity.` : ''}`,
    };
  }

  if (pct >= 70) {
    return {
      allowed: true,
      warning: `After this import you'll be at ${afterImport}/${metric.limit} ${metric.label.toLowerCase()} (${pct}% of your limit).${nextTier ? ` Consider upgrading to ${nextTier}.` : ''}`,
    };
  }

  return { allowed: true, warning: null };
}
