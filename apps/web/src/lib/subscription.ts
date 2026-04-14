/**
 * Subscription & Usage — Tier definitions, usage limits, and grace period logic.
 * Source of truth: SAL 02 — Pricing Tiers and Strategy.xlsx
 *
 * Tiers: Pilot (free trial) → Produce → Expand → Excel
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TierName = 'Pilot' | 'Produce' | 'Expand' | 'Excel';
export type UsageStatus = 'normal' | 'warning' | 'critical' | 'exceeded';
export type GracePhase = 'none' | 'soft_warning' | 'approaching' | 'grace_period' | 'hard_limit';

export interface TierConfig {
  name: TierName;
  priceAnnual: number;   // per user/month billed annually
  priceMonthly: number;  // per user/month billed monthly
  maxUsers: number | null; // null = unlimited
}

export interface UsageMetric {
  key: string;
  label: string;
  current: number;
  limit: number | null; // null = unlimited
}

export interface FeatureGate {
  feature: string;
  label: string;
  available: boolean;
  requiredTier: TierName;
}

// ---------------------------------------------------------------------------
// Tier Definitions (from SAL 02)
// ---------------------------------------------------------------------------

export const TIERS: Record<TierName, TierConfig> = {
  Pilot:   { name: 'Pilot',   priceAnnual: 0,  priceMonthly: 0,  maxUsers: 3 },
  Produce: { name: 'Produce', priceAnnual: 9,  priceMonthly: 11, maxUsers: 20 },
  Expand:  { name: 'Expand',  priceAnnual: 19, priceMonthly: 23, maxUsers: 40 },
  Excel:   { name: 'Excel',   priceAnnual: 39, priceMonthly: 47, maxUsers: null },
};

const TIER_ORDER: TierName[] = ['Pilot', 'Produce', 'Expand', 'Excel'];

// ---------------------------------------------------------------------------
// Module Limits — numeric caps per tier (from SAL 02 FeaturesLimits MAP)
// ---------------------------------------------------------------------------

interface LimitDef { key: string; label: string; limit: number | null }

const MODULE_LIMITS: Record<string, Record<TierName, LimitDef[]>> = {
  Sell: {
    Pilot:   [{ key: 'contacts', label: 'Contacts', limit: 100 }, { key: 'opportunities', label: 'Opportunities', limit: 20 }, { key: 'quotes', label: 'Quotes', limit: 20 }],
    Produce: [{ key: 'contacts', label: 'Contacts', limit: 200 }, { key: 'opportunities', label: 'Opportunities', limit: 100 }, { key: 'quotes', label: 'Quotes', limit: 100 }],
    Expand:  [{ key: 'contacts', label: 'Contacts', limit: 500 }, { key: 'opportunities', label: 'Opportunities', limit: 200 }, { key: 'quotes', label: 'Quotes', limit: 200 }],
    Excel:   [{ key: 'contacts', label: 'Contacts', limit: null }, { key: 'opportunities', label: 'Opportunities', limit: null }, { key: 'quotes', label: 'Quotes', limit: null }],
  },
  Plan: {
    Pilot:   [{ key: 'jobs', label: 'Jobs', limit: 5 }],
    Produce: [{ key: 'jobs', label: 'Jobs', limit: 25 }],
    Expand:  [{ key: 'jobs', label: 'Jobs', limit: 100 }],
    Excel:   [{ key: 'jobs', label: 'Jobs', limit: null }],
  },
  Make: {
    Pilot:   [{ key: 'work_orders', label: 'Work Orders', limit: 5 }, { key: 'machines', label: 'Machines', limit: 5 }],
    Produce: [{ key: 'work_orders', label: 'Work Orders', limit: 25 }, { key: 'machines', label: 'Machines', limit: 25 }],
    Expand:  [{ key: 'work_orders', label: 'Work Orders', limit: 100 }, { key: 'machines', label: 'Machines', limit: null }],
    Excel:   [{ key: 'work_orders', label: 'Work Orders', limit: null }, { key: 'machines', label: 'Machines', limit: null }],
  },
  Ship: {
    Pilot: [], Produce: [], Expand: [], Excel: [],
  },
  Book: {
    Pilot: [], Produce: [], Expand: [], Excel: [],
  },
  Buy: {
    Pilot: [], Produce: [], Expand: [], Excel: [],
  },
};

// ---------------------------------------------------------------------------
// Feature Gates — boolean on/off per tier (from SAL 02)
// ---------------------------------------------------------------------------

export const FEATURE_GATES: Record<string, { feature: string; label: string; tiers: Record<TierName, boolean> }[]> = {
  Sell: [
    { feature: 'activities', label: 'Activities', tiers: { Pilot: false, Produce: true, Expand: true, Excel: true } },
  ],
  Plan: [
    { feature: 'budgets', label: 'Budgets', tiers: { Pilot: false, Produce: true, Expand: true, Excel: true } },
    { feature: 'activities', label: 'Activities', tiers: { Pilot: false, Produce: true, Expand: true, Excel: true } },
    { feature: 'schedule', label: 'Schedule', tiers: { Pilot: false, Produce: true, Expand: true, Excel: true } },
    { feature: 'qc', label: 'Quality Planning', tiers: { Pilot: false, Produce: true, Expand: true, Excel: true } },
  ],
  Make: [
    { feature: 'quality', label: 'Quality', tiers: { Pilot: false, Produce: true, Expand: true, Excel: true } },
    { feature: 'teams', label: 'Teams', tiers: { Pilot: false, Produce: true, Expand: true, Excel: true } },
    { feature: 'reports', label: 'Reports', tiers: { Pilot: false, Produce: true, Expand: true, Excel: true } },
    { feature: 'maintenance', label: 'Maintenance', tiers: { Pilot: false, Produce: true, Expand: true, Excel: true } },
  ],
  Ship: [
    { feature: 'packaging', label: 'Packaging', tiers: { Pilot: false, Produce: true, Expand: true, Excel: true } },
    { feature: 'tracking', label: 'Tracking', tiers: { Pilot: false, Produce: true, Expand: true, Excel: true } },
    { feature: 'returns', label: 'Returns', tiers: { Pilot: false, Produce: false, Expand: true, Excel: true } },
    { feature: 'warehouse', label: 'Warehouse', tiers: { Pilot: false, Produce: true, Expand: true, Excel: true } },
    { feature: 'reports', label: 'Reports', tiers: { Pilot: false, Produce: false, Expand: true, Excel: true } },
  ],
  Book: [
    { feature: 'budgets', label: 'Budgets', tiers: { Pilot: false, Produce: true, Expand: true, Excel: true } },
    { feature: 'cost_analysis', label: 'Cost Analysis', tiers: { Pilot: false, Produce: true, Expand: true, Excel: true } },
  ],
};

// ---------------------------------------------------------------------------
// Mock Current State (simulates API response)
// ---------------------------------------------------------------------------

const MOCK_USAGE: Record<string, Record<string, number>> = {
  Sell: { contacts: 185, opportunities: 72, quotes: 78 },
  Plan: { jobs: 22 },
  Make: { work_orders: 20, machines: 12 },
  Ship: {},
  Book: {},
  Buy: {},
};

export const CURRENT_SUBSCRIPTION = {
  tier: 'Produce' as TierName,
  billingCycle: 'annual' as 'annual' | 'monthly',
  renewalDate: '2025-10-03',
  currentUsers: 8,
  trialEndsAt: null as string | null,       // set for Pilot trial
  gracePeriod: null as { startDate: string; endDate: string; module: string; metric: string } | null,
};

// ---------------------------------------------------------------------------
// Query Functions
// ---------------------------------------------------------------------------

/** Get usage metrics with current values for a module */
export function getModuleUsage(module: string): UsageMetric[] {
  const tier = CURRENT_SUBSCRIPTION.tier;
  const limits = MODULE_LIMITS[module]?.[tier] ?? [];
  const usage = MOCK_USAGE[module] ?? {};

  return limits
    .filter(l => l.limit !== null)
    .map(l => ({
      key: l.key,
      label: l.label,
      current: usage[l.key] ?? 0,
      limit: l.limit,
    }));
}

/** Get feature gates for a module on current tier */
export function getModuleFeatureGates(module: string): FeatureGate[] {
  const tier = CURRENT_SUBSCRIPTION.tier;
  const gates = FEATURE_GATES[module] ?? [];

  return gates.map(g => {
    const available = g.tiers[tier];
    // Find the minimum tier where this feature becomes available
    const requiredTier = TIER_ORDER.find(t => g.tiers[t]) ?? 'Excel';
    return { feature: g.feature, label: g.label, available, requiredTier };
  });
}

/** Calculate usage percentage (0–100+) */
export function getUsagePercentage(current: number, limit: number | null): number {
  if (limit === null || limit === 0) return 0;
  return Math.round((current / limit) * 100);
}

/** Map percentage to a status level */
export function getUsageStatus(percentage: number): UsageStatus {
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 90) return 'critical';
  if (percentage >= 70) return 'warning';
  return 'normal';
}

/** Get next tier up (or null if already at Excel) */
export function getNextTier(current: TierName): TierName | null {
  const idx = TIER_ORDER.indexOf(current);
  return idx < TIER_ORDER.length - 1 ? TIER_ORDER[idx + 1] : null;
}

/** Find the single highest usage metric across all modules */
export function getHighestUsageAcrossModules(): {
  module: string;
  metric: string;
  current: number;
  limit: number;
  percentage: number;
} | null {
  let highest: ReturnType<typeof getHighestUsageAcrossModules> = null;

  for (const module of Object.keys(MODULE_LIMITS)) {
    for (const m of getModuleUsage(module)) {
      if (m.limit !== null) {
        const pct = getUsagePercentage(m.current, m.limit);
        if (!highest || pct > highest.percentage) {
          highest = { module, metric: m.label, current: m.current, limit: m.limit, percentage: pct };
        }
      }
    }
  }

  return highest;
}

/** Determine which grace phase applies (for modal/banner logic) */
export function getGracePhase(percentage: number): GracePhase {
  if (CURRENT_SUBSCRIPTION.gracePeriod) {
    const now = new Date();
    const end = new Date(CURRENT_SUBSCRIPTION.gracePeriod.endDate);
    if (now > end) return 'hard_limit';
    return 'grace_period';
  }
  if (percentage >= 100) return 'grace_period'; // would start grace
  if (percentage >= 90) return 'approaching';
  if (percentage >= 70) return 'soft_warning';
  return 'none';
}

/** Days remaining in grace period */
export function getGraceDaysRemaining(): number | null {
  if (!CURRENT_SUBSCRIPTION.gracePeriod) return null;
  const now = new Date();
  const end = new Date(CURRENT_SUBSCRIPTION.gracePeriod.endDate);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}
