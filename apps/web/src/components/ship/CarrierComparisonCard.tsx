/**
 * CarrierComparisonCard — Side-by-side comparison of carrier options
 * for the current shipment. Highlights the cheapest (AI pick) and
 * fastest carriers, with a "Why?" rationale tooltip on each card.
 */
import { Sparkles, Zap, HelpCircle, Star } from 'lucide-react';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { toast } from 'sonner';

export interface CarrierRate {
  carrier: string;
  service: string;
  cost: number;
  days: number;
  ai?: boolean;
  rationale?: string;
}

type Variant = 'recommended' | 'express' | 'preferred';

interface OptionCardProps {
  rate: CarrierRate;
  variant: Variant;
  preferred?: boolean;
}

const variantConfig: Record<Variant, {
  label: string;
  Icon: typeof Sparkles;
  badgeClass: string;
  borderClass: string;
  defaultRationale: string;
}> = {
  recommended: {
    label: 'Recommended (cheapest)',
    Icon: Sparkles,
    badgeClass: 'bg-[var(--mw-yellow-400)] text-[var(--neutral-900)]',
    borderClass: 'border-2 border-[var(--mw-yellow-400)]',
    defaultRationale: 'Lowest cost on +1-day routes for this lane and weight.',
  },
  express: {
    label: 'Express (fastest)',
    Icon: Zap,
    badgeClass: 'bg-[var(--mw-mirage)]/15 text-[var(--mw-mirage)]',
    borderClass: 'border border-[var(--mw-mirage)]/40',
    defaultRationale: 'Fastest guaranteed delivery by 5pm next business day.',
  },
  preferred: {
    label: 'Your preferred',
    Icon: Star,
    badgeClass: 'bg-[var(--neutral-100)] text-foreground',
    borderClass: 'border border-[var(--border)]',
    defaultRationale: 'Your team\'s saved default carrier for this customer.',
  },
};

function OptionCard({ rate, variant, preferred }: OptionCardProps) {
  const cfg = variantConfig[variant];
  const Icon = cfg.Icon;
  const rationale = rate.rationale ?? cfg.defaultRationale;

  return (
    <Card
      className={cn(
        'flex flex-col gap-3 p-5 transition-colors duration-[var(--duration-short2)]',
        cfg.borderClass,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'text-[10px] tracking-widest uppercase px-2 py-0.5 rounded font-medium inline-flex items-center gap-1',
            cfg.badgeClass,
          )}
        >
          <Icon className="w-3.5 h-3.5" /> {cfg.label}
        </span>
        {preferred && variant !== 'preferred' && (
          <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 rounded font-medium bg-[var(--neutral-100)] text-foreground inline-flex items-center gap-1">
            <Star className="w-3 h-3" /> Preferred
          </span>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-base text-foreground font-medium truncate">{rate.carrier}</p>
        <p className="text-xs text-[var(--neutral-500)] truncate">{rate.service}</p>
      </div>

      <div className="flex items-baseline justify-between gap-2 mt-1">
        <span className="text-2xl text-foreground font-medium tabular-nums">
          ${rate.cost.toFixed(2)}
        </span>
        <span className="text-xs text-[var(--neutral-500)] tabular-nums">
          {rate.days}d transit
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border)]">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="text-xs text-[var(--neutral-500)] inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Why?
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[220px] text-left">
            {rationale}
          </TooltipContent>
        </Tooltip>
        <button
          type="button"
          onClick={() => toast.success(`Selected ${rate.carrier} ${rate.service}`)}
          className={cn(
            'h-10 px-4 rounded-full text-xs font-medium transition-colors',
            variant === 'recommended'
              ? 'bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground'
              : 'border border-[var(--border)] text-foreground hover:bg-[var(--neutral-100)]',
          )}
        >
          Select
        </button>
      </div>
    </Card>
  );
}

export interface CarrierComparisonCardProps {
  rates: CarrierRate[];
  /** The user's saved default carrier name (matches CarrierRate.carrier). */
  preferredCarrier?: string;
}

export function CarrierComparisonCard({
  rates,
  preferredCarrier,
}: CarrierComparisonCardProps) {
  if (rates.length === 0) {
    return (
      <p className="text-sm text-[var(--neutral-500)]">No carrier rates available.</p>
    );
  }

  const cheapest = [...rates].sort((a, b) => a.cost - b.cost)[0];
  const fastestPool = rates.filter(r => r.carrier !== cheapest.carrier || r.service !== cheapest.service);
  const fastest = (fastestPool.length > 0 ? fastestPool : rates)
    .slice()
    .sort((a, b) => a.days - b.days || a.cost - b.cost)[0];

  const preferred = preferredCarrier
    ? rates.find(r => r.carrier === preferredCarrier)
    : undefined;
  const showPreferred =
    preferred &&
    preferred.carrier !== cheapest.carrier &&
    preferred.carrier !== fastest.carrier;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-foreground font-medium">Side-by-side comparison</p>
          <p className="text-xs text-[var(--neutral-500)] mt-0.5">
            Based on current lane, weight and dimensions. Hover "Why?" for the rationale.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <OptionCard
            rate={cheapest}
            variant="recommended"
            preferred={preferredCarrier === cheapest.carrier}
          />
          <OptionCard
            rate={fastest}
            variant="express"
            preferred={preferredCarrier === fastest.carrier}
          />
          {showPreferred && preferred && (
            <OptionCard rate={preferred} variant="preferred" />
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
