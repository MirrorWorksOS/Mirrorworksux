/**
 * ModuleQuickNav — bento-style quick navigation grid for module dashboards.
 *
 * Surfaces every sub-item in a module as a hoverable card so users can jump
 * directly without using the sidebar (B2B SaaS "mega-menu on the dashboard"
 * pattern). Reads `menuConfig` from the sidebar as the single source of truth
 * for labels and routes; pulls icons + descriptions from `sub-item-meta.ts`.
 *
 * Implementation notes:
 *  - Built on the existing `SpotlightCard` so we don't introduce a second
 *    animation philosophy (heuristic #4 — consistency).
 *  - Excludes the module's own dashboard route since we're already on it.
 *  - Responsive grid: 1/2/3/4 columns at sm/md/lg/xl.
 *  - `motion` stagger entrance reuses the same variants as the surrounding
 *    KPI grid so the dashboard loads cohesively.
 */

import React from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { SpotlightCard } from '@/components/shared/surfaces/SpotlightCard';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { menuConfig, type MenuItem, type SubMenuItem } from '@/components/Sidebar';
import { getSubItemMeta } from '@/lib/sub-item-meta';

export type ModuleKey = 'sell' | 'buy' | 'plan' | 'make' | 'ship' | 'book' | 'control';

interface ModuleQuickNavProps {
  moduleKey: ModuleKey;
  /** Optional title shown above the grid. Pass `null` to hide it. */
  title?: string | null;
  /** Optional subtitle shown beneath the title. */
  subtitle?: string | null;
  className?: string;
}

const MODULE_LABEL_MAP: Record<ModuleKey, string> = {
  sell: 'Sell',
  buy: 'Buy',
  plan: 'Plan',
  make: 'Make',
  ship: 'Ship',
  book: 'Book',
  control: 'Control',
};

interface QuickNavItem {
  label: string;
  path: string;
  icon: LucideIcon | null;
  description: string;
  group: string | null;
}

/** Flatten a `MenuItem` into a list of nav cards, skipping the dashboard root. */
function getQuickNavItems(moduleKey: ModuleKey): QuickNavItem[] {
  const moduleLabel = MODULE_LABEL_MAP[moduleKey];
  const item = menuConfig.find((m) => m.label === moduleLabel);
  if (!item) return [];

  const dashboardPath = `/${moduleKey}`;
  const items: QuickNavItem[] = [];

  const pushSub = (sub: SubMenuItem, group: string | null) => {
    if (sub.path === dashboardPath) return; // skip the page we're on
    const meta = getSubItemMeta(sub.path);
    items.push({
      label: sub.label,
      path: sub.path,
      icon: meta?.icon ?? null,
      description: meta?.description ?? '',
      group,
    });
  };

  if (item.subItems) {
    item.subItems.forEach((sub) => pushSub(sub, null));
  }
  if (item.groupedSubItems) {
    item.groupedSubItems.forEach((g) => {
      g.items.forEach((sub) => pushSub(sub, g.heading || null));
    });
  }

  return items;
}

export function ModuleQuickNav({
  moduleKey,
  title = 'Quick navigation',
  subtitle,
  className,
}: ModuleQuickNavProps) {
  const items = React.useMemo(() => getQuickNavItems(moduleKey), [moduleKey]);

  if (items.length === 0) return null;

  return (
    <section className={cn('space-y-4', className)} aria-label={`${MODULE_LABEL_MAP[moduleKey]} quick navigation`}>
      {(title || subtitle) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-sm font-medium text-foreground">{title}</h2>
          )}
          {subtitle && (
            <p className="text-xs text-[var(--neutral-500)]">{subtitle}</p>
          )}
        </div>
      )}

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {items.map((nav) => {
          const Icon = nav.icon;
          return (
            <motion.div key={nav.path} variants={staggerItem}>
              <Link to={nav.path} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mw-yellow-400)]/60 rounded-2xl">
                <SpotlightCard className="h-full border border-[var(--border)] bg-card transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)] hover:border-[var(--neutral-300)] dark:hover:border-[var(--neutral-700)]">
                  <div className="relative z-20 flex h-full items-start gap-3 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--shape-md)] bg-[var(--mw-mirage)] text-white">
                      {Icon ? (
                        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {nav.label}
                        </p>
                        <ChevronRight
                          className="h-3.5 w-3.5 shrink-0 text-[var(--neutral-400)] transition-transform duration-[var(--duration-medium1)] ease-[var(--ease-standard)] group-hover:translate-x-0.5 group-hover:text-foreground"
                          aria-hidden
                        />
                      </div>
                      {nav.description && (
                        <p className="text-xs text-[var(--neutral-500)] line-clamp-2">
                          {nav.description}
                        </p>
                      )}
                    </div>
                  </div>
                </SpotlightCard>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
