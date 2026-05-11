/**
 * SiteSwitcher — Dropdown switcher for the current site/location.
 *
 * Multi-site is an Operate-tier (and above) feature. On Make/Run, non-active
 * sites show an "Operate plan" badge and a tooltip explaining the upgrade.
 * Clicking a gated site fires a toast and keeps the menu open.
 *
 * State lives in `useSiteStore` (Zustand). Switching sites only updates the
 * trigger label — this is a demo surface.
 */

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Check, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TooltipContent } from '@/components/ui/tooltip';
import { cn } from '@/components/ui/utils';
import { CURRENT_SUBSCRIPTION, type TierName } from '@/lib/subscription';
import { SITES, getSiteById, useSiteStore, type Site } from '@/store/siteStore';

const MULTI_SITE_TIERS: TierName[] = ['Operate', 'Enterprise'];

function canAccessMultipleSites(): boolean {
  return MULTI_SITE_TIERS.includes(CURRENT_SUBSCRIPTION.tier);
}

interface SiteSwitcherProps {
  /** Compact rendering for the rail (icon only / tight). */
  compact?: boolean;
}

export function SiteSwitcher({ compact = false }: SiteSwitcherProps) {
  const currentSiteId = useSiteStore((s) => s.currentSiteId);
  const setCurrentSiteId = useSiteStore((s) => s.setCurrentSiteId);
  const currentSite = getSiteById(currentSiteId);
  const hasMultiSite = canAccessMultipleSites();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-1.5 rounded-full border border-[var(--neutral-200)] bg-card text-xs text-foreground transition-colors hover:bg-[var(--neutral-100)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mw-mirage)]/40',
            compact ? 'h-7 w-7 justify-center px-0' : 'h-7 px-2.5',
          )}
          aria-label={`Current site: ${currentSite.name}. Click to switch site.`}
        >
          {!compact && <span className="truncate max-w-[140px]">{currentSite.name}</span>}
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[var(--neutral-500)]" strokeWidth={1.75} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" sideOffset={6} className="min-w-[220px] p-1">
        <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--neutral-500)]">
          Sites
        </div>
        <TooltipPrimitive.Provider delayDuration={150}>
          {SITES.map((site) => (
            <SiteRow
              key={site.id}
              site={site}
              isCurrent={site.id === currentSiteId}
              hasMultiSite={hasMultiSite}
              onSelect={() => setCurrentSiteId(site.id)}
            />
          ))}
        </TooltipPrimitive.Provider>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SiteRow({
  site,
  isCurrent,
  hasMultiSite,
  onSelect,
}: {
  site: Site;
  isCurrent: boolean;
  hasMultiSite: boolean;
  onSelect: () => void;
}) {
  const isGated = !hasMultiSite && !isCurrent;

  const item = (
    <DropdownMenuItem
      onSelect={(event) => {
        if (isGated) {
          event.preventDefault();
          toast.info('Upgrade to Operate to access multiple sites');
          return;
        }
        onSelect();
      }}
      aria-disabled={isGated || undefined}
      className={cn(
        'gap-2',
        isGated && 'cursor-not-allowed text-[var(--neutral-400)] focus:text-[var(--neutral-400)]',
      )}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        {isCurrent ? <Check className="h-4 w-4 text-[var(--mw-mirage)]" strokeWidth={2} /> : null}
      </span>
      <span className="flex-1 truncate">{site.name}</span>
      {isGated && (
        <Badge variant="outline" className="shrink-0 text-[10px] font-medium">
          Operate plan
        </Badge>
      )}
    </DropdownMenuItem>
  );

  if (!isGated) return item;

  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>
        <span className="block">{item}</span>
      </TooltipPrimitive.Trigger>
      <TooltipContent side="right" sideOffset={8}>
        Available on Operate and Enterprise plans
      </TooltipContent>
    </TooltipPrimitive.Root>
  );
}
