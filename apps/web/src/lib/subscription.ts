/**
 * Subscription & Usage — Tier definitions, usage limits, AI credits, and
 * grace-period logic.
 *
 * Source of truth: docs/SAL 02 — Pricing Tiers and Strategy.xlsx
 *
 * Tiers: Trial (30-day free) → Make → Run → Operate → Enterprise.
 * All prices USD per user/month. Annual billing is paid upfront and discounts
 * to the "annual effective monthly" rate shown below.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TierName = 'Trial' | 'Make' | 'Run' | 'Operate' | 'Enterprise';
export type UsageStatus = 'normal' | 'warning' | 'critical' | 'exceeded';
export type GracePhase = 'none' | 'soft_warning' | 'approaching' | 'grace_period' | 'hard_limit';

export interface TierConfig {
  name: TierName;
  /** Per user/month, billed monthly. `null` for Trial (free) or Enterprise (quoted). */
  priceMonthly: number | null;
  /** Per user/year, billed annually upfront. `null` for Trial (free) or Enterprise (quoted). */
  priceAnnual: number | null;
  /** Annual price expressed as a per-user/month rate. `null` if no annual price. */
  priceAnnualEffectiveMonthly: number | null;
  /** Max users on this tier (`null` = unlimited / negotiated). */
  maxUsers: number | null;
  /** AI actions included per month. `null` = unlimited. */
  aiCreditsPerMonth: number | null;
}

export interface UsageMetric {
  key: string;
  label: string;
  current: number;
  /** `null` = unlimited on this tier. */
  limit: number | null;
}

export interface FeatureGate {
  feature: string;
  label: string;
  available: boolean;
  requiredTier: TierName;
}

/** AI overage / pre-buy pack. Sold across Make, Run, Operate. */
export interface AICreditPack {
  id: string;
  label: string;
  actions: number;
  priceUsd: number;
  perActionUsd: number;
  bestFor: string;
}

/** Volume discount band (auto-applied at checkout, stacks with annual). */
export interface VolumeDiscountBand {
  minSeats: number;
  maxSeats: number | null;
  /** 0–1 fraction off list, or `null` if the band is "contact sales". */
  discount: number | null;
  label: string;
}

// ---------------------------------------------------------------------------
// Tier Definitions (from SAL 02 General Outline)
// ---------------------------------------------------------------------------

export const TIERS: Record<TierName, TierConfig> = {
  Trial: {
    name: 'Trial',
    priceMonthly: 0,
    priceAnnual: 0,
    priceAnnualEffectiveMonthly: 0,
    maxUsers: null, // Operate-tier feature access during 30-day trial
    aiCreditsPerMonth: 2000,
  },
  Make: {
    name: 'Make',
    priceMonthly: 29,
    priceAnnual: 296,
    priceAnnualEffectiveMonthly: 24.67,
    maxUsers: 9,
    aiCreditsPerMonth: 750,
  },
  Run: {
    name: 'Run',
    priceMonthly: 49,
    priceAnnual: 500,
    priceAnnualEffectiveMonthly: 41.67,
    maxUsers: 24,
    aiCreditsPerMonth: 5000,
  },
  Operate: {
    name: 'Operate',
    priceMonthly: 119,
    priceAnnual: 1214,
    priceAnnualEffectiveMonthly: 101.17,
    maxUsers: 49,
    aiCreditsPerMonth: 20000,
  },
  Enterprise: {
    name: 'Enterprise',
    priceMonthly: null,
    priceAnnual: null,
    priceAnnualEffectiveMonthly: null,
    maxUsers: null,
    aiCreditsPerMonth: null,
  },
};

const TIER_ORDER: TierName[] = ['Trial', 'Make', 'Run', 'Operate', 'Enterprise'];

// ---------------------------------------------------------------------------
// AI Credits — overage packs + pricing notes
// ---------------------------------------------------------------------------

/**
 * One "action" = one AI-assisted task. Avg ≈ 4,000 tokens (3,000 in, 1,000 out).
 * Worked examples (from SAL 02):
 *   - Generate quote from RFQ + BOM context → 1 action
 *   - AI-drafted customer email → 1 action
 *   - BOM extraction from CAD file → 1 action
 *   - Multi-turn troubleshooting chat → 1 action per assistant response
 *   - Predictive scheduling refresh (background) → 0 actions (included)
 */
export const AI_CREDIT_PACKS: AICreditPack[] = [
  {
    id: 'pack-5k',
    label: '5,000 actions',
    actions: 5000,
    priceUsd: 225,
    perActionUsd: 0.045,
    bestFor: 'Make customers regularly hitting quota',
  },
  {
    id: 'pack-10k',
    label: '10,000 actions',
    actions: 10000,
    priceUsd: 400,
    perActionUsd: 0.04,
    bestFor: 'Run customers scaling AI use',
  },
  {
    id: 'pack-25k',
    label: '25,000 actions',
    actions: 25000,
    priceUsd: 875,
    perActionUsd: 0.035,
    bestFor: 'Operate customers with seasonal spikes',
  },
];

/** Per-action overage rate when running over quota without a pack. */
export const AI_OVERAGE_RATE_USD = 0.05;

// ---------------------------------------------------------------------------
// Volume discounts — auto-applied at checkout, stack with annual
// ---------------------------------------------------------------------------

export const VOLUME_DISCOUNT_BANDS: VolumeDiscountBand[] = [
  { minSeats: 1, maxSeats: 9, discount: 0, label: 'List price' },
  { minSeats: 10, maxSeats: 24, discount: 0.1, label: '10% off all seats' },
  { minSeats: 25, maxSeats: 49, discount: 0.15, label: '15% off all seats' },
  { minSeats: 50, maxSeats: null, discount: null, label: 'Contact sales' },
];

// ---------------------------------------------------------------------------
// Module Limits — numeric caps per tier (from FeaturesLimits MAP).
// Cell value ✓ = unlimited (encoded as `null`); X = blocked (no row);
// numeric = 30-day rolling cap.
// ---------------------------------------------------------------------------

interface LimitDef { key: string; label: string; limit: number | null }

const MODULE_LIMITS: Record<string, Record<TierName, LimitDef[]>> = {
  Sell: {
    Trial:      [
      { key: 'contacts', label: 'Contacts', limit: null },
      { key: 'opportunities', label: 'Opportunities', limit: null },
      { key: 'quotes', label: 'Quotes', limit: null },
    ],
    Make: [
      { key: 'contacts', label: 'Contacts', limit: 500 },
      { key: 'opportunities', label: 'Opportunities', limit: 250 },
      { key: 'quotes', label: 'Quotes', limit: 250 },
    ],
    Run: [
      { key: 'contacts', label: 'Contacts', limit: 1000 },
      { key: 'opportunities', label: 'Opportunities', limit: 1000 },
      { key: 'quotes', label: 'Quotes', limit: 1000 },
    ],
    Operate: [
      { key: 'contacts', label: 'Contacts', limit: 1500 },
      { key: 'opportunities', label: 'Opportunities', limit: 1500 },
      { key: 'quotes', label: 'Quotes', limit: 1500 },
    ],
    Enterprise: [
      { key: 'contacts', label: 'Contacts', limit: null },
      { key: 'opportunities', label: 'Opportunities', limit: null },
      { key: 'quotes', label: 'Quotes', limit: null },
    ],
  },
  Plan: {
    Trial:      [{ key: 'jobs', label: 'Jobs', limit: null }],
    Make:       [{ key: 'jobs', label: 'Jobs', limit: 75 }],
    Run:        [{ key: 'jobs', label: 'Jobs', limit: 300 }],
    Operate:    [{ key: 'jobs', label: 'Jobs', limit: 1000 }],
    Enterprise: [{ key: 'jobs', label: 'Jobs', limit: null }],
  },
  Make: {
    Trial:      [{ key: 'manufacturing_orders', label: 'Manufacturing Orders', limit: null }],
    Make:       [{ key: 'manufacturing_orders', label: 'Manufacturing Orders', limit: 75 }],
    Run:        [{ key: 'manufacturing_orders', label: 'Manufacturing Orders', limit: 300 }],
    Operate:    [{ key: 'manufacturing_orders', label: 'Manufacturing Orders', limit: 1000 }],
    Enterprise: [{ key: 'manufacturing_orders', label: 'Manufacturing Orders', limit: null }],
  },
  // Org-wide complexity limits — apply at the tenant level, surfaced in
  // Control → Billing & subscription rather than per-module Settings.
  Org: {
    Trial: [
      { key: 'sites', label: 'Sites / Locations', limit: null },
      { key: 'integrations', label: 'Connected integrations', limit: null },
      { key: 'machines', label: 'Machines tracked', limit: null },
      { key: 'workflows', label: 'Workflow automations', limit: null },
      { key: 'api_calls_per_day', label: 'API calls / day', limit: null },
      { key: 'storage_gb', label: 'Storage (GB)', limit: null },
    ],
    Make: [
      { key: 'sites', label: 'Sites / Locations', limit: 1 },
      { key: 'integrations', label: 'Connected integrations', limit: 1 },
      { key: 'machines', label: 'Machines tracked', limit: 10 },
      { key: 'workflows', label: 'Workflow automations', limit: 5 },
      { key: 'api_calls_per_day', label: 'API calls / day', limit: 1000 },
      { key: 'storage_gb', label: 'Storage (GB)', limit: 50 },
    ],
    Run: [
      { key: 'sites', label: 'Sites / Locations', limit: 2 },
      { key: 'integrations', label: 'Connected integrations', limit: 5 },
      { key: 'machines', label: 'Machines tracked', limit: 50 },
      { key: 'workflows', label: 'Workflow automations', limit: 50 },
      { key: 'api_calls_per_day', label: 'API calls / day', limit: 25000 },
      { key: 'storage_gb', label: 'Storage (GB)', limit: 500 },
    ],
    Operate: [
      { key: 'sites', label: 'Sites / Locations', limit: 3 },
      { key: 'integrations', label: 'Connected integrations', limit: 10 },
      { key: 'machines', label: 'Machines tracked', limit: 200 },
      { key: 'workflows', label: 'Workflow automations', limit: 200 },
      { key: 'api_calls_per_day', label: 'API calls / day', limit: 50000 },
      { key: 'storage_gb', label: 'Storage (GB)', limit: 2000 },
    ],
    Enterprise: [
      { key: 'sites', label: 'Sites / Locations', limit: null },
      { key: 'integrations', label: 'Connected integrations', limit: null },
      { key: 'machines', label: 'Machines tracked', limit: null },
      { key: 'workflows', label: 'Workflow automations', limit: null },
      { key: 'api_calls_per_day', label: 'API calls / day', limit: null },
      { key: 'storage_gb', label: 'Storage (GB)', limit: null },
    ],
  },
  Ship: {
    Trial: [], Make: [], Run: [], Operate: [], Enterprise: [],
  },
  Book: {
    Trial: [], Make: [], Run: [], Operate: [], Enterprise: [],
  },
  Buy: {
    Trial: [], Make: [], Run: [], Operate: [], Enterprise: [],
  },
};

// ---------------------------------------------------------------------------
// Feature Gates — boolean on/off per tier (from FeaturesLimits MAP).
// Trial inherits Operate access for 30 days, so all gates default to true.
// ---------------------------------------------------------------------------

export const FEATURE_GATES: Record<string, { feature: string; label: string; tiers: Record<TierName, boolean> }[]> = {
  Sell: [
    { feature: 'customer_portal', label: 'Customer Portal', tiers: { Trial: true, Make: false, Run: true, Operate: true, Enterprise: true } },
  ],
  Plan: [
    { feature: 'machine_io', label: 'Machine I/O (CAD import + NC connect)', tiers: { Trial: true, Make: false, Run: true, Operate: true, Enterprise: true } },
    { feature: 'nesting', label: 'Nesting', tiers: { Trial: true, Make: false, Run: true, Operate: true, Enterprise: true } },
    { feature: 'what_if', label: 'What-If scenarios', tiers: { Trial: true, Make: false, Run: true, Operate: true, Enterprise: true } },
    { feature: 'mrp', label: 'MRP', tiers: { Trial: true, Make: false, Run: true, Operate: true, Enterprise: true } },
  ],
  Make: [
    { feature: 'scrap_analysis', label: 'Scrap Analysis', tiers: { Trial: true, Make: false, Run: true, Operate: true, Enterprise: true } },
    { feature: 'capa', label: 'CAPA', tiers: { Trial: true, Make: false, Run: true, Operate: true, Enterprise: true } },
  ],
  Ship: [
    { feature: 'scan_to_ship', label: 'Scan-to-Ship', tiers: { Trial: true, Make: false, Run: true, Operate: true, Enterprise: true } },
    { feature: 'returns', label: 'Returns', tiers: { Trial: true, Make: false, Run: true, Operate: true, Enterprise: true } },
    { feature: 'reports', label: 'Reports (Logistics analytics)', tiers: { Trial: true, Make: false, Run: true, Operate: true, Enterprise: true } },
  ],
  Book: [
    { feature: 'wip_valuation', label: 'WIP Valuation', tiers: { Trial: true, Make: false, Run: true, Operate: true, Enterprise: true } },
    { feature: 'cost_variance', label: 'Cost Variance', tiers: { Trial: true, Make: false, Run: true, Operate: true, Enterprise: true } },
  ],
  Buy: [
    { feature: 'rfqs', label: 'RFQs', tiers: { Trial: true, Make: false, Run: true, Operate: true, Enterprise: true } },
    { feature: 'bills', label: 'Bills (AP)', tiers: { Trial: true, Make: false, Run: true, Operate: true, Enterprise: true } },
    { feature: 'agreements', label: 'Agreements', tiers: { Trial: true, Make: false, Run: true, Operate: true, Enterprise: true } },
    { feature: 'mrp_suggestions', label: 'MRP Suggestions', tiers: { Trial: true, Make: false, Run: false, Operate: true, Enterprise: true } },
    { feature: 'planning_grid', label: 'Planning Grid', tiers: { Trial: true, Make: false, Run: false, Operate: true, Enterprise: true } },
    { feature: 'vendor_comparison', label: 'Vendor Comparison', tiers: { Trial: true, Make: false, Run: false, Operate: true, Enterprise: true } },
    { feature: 'reorder_rules', label: 'Reorder Rules', tiers: { Trial: true, Make: false, Run: false, Operate: true, Enterprise: true } },
  ],
  Control: [
    { feature: 'process_builder', label: 'Process Builder', tiers: { Trial: true, Make: false, Run: true, Operate: true, Enterprise: true } },
    { feature: 'gamification', label: 'Gamification', tiers: { Trial: true, Make: false, Run: true, Operate: true, Enterprise: true } },
    { feature: 'audit', label: 'Audit (Access review)', tiers: { Trial: true, Make: false, Run: true, Operate: true, Enterprise: true } },
    { feature: 'advanced_api', label: 'Advanced API & webhook access', tiers: { Trial: true, Make: false, Run: false, Operate: true, Enterprise: true } },
  ],
  Premium: [
    { feature: 'predictive_scheduling', label: 'Predictive scheduling (AI capacity planning)', tiers: { Trial: true, Make: false, Run: false, Operate: true, Enterprise: true } },
    { feature: 'sso_scim', label: 'SSO / SCIM (corporate identity)', tiers: { Trial: true, Make: false, Run: false, Operate: true, Enterprise: true } },
    { feature: 'sla_4hr', label: '4-hour SLA', tiers: { Trial: true, Make: false, Run: false, Operate: true, Enterprise: true } },
    { feature: 'cross_site_analytics', label: 'Cross-site analytics & rollups', tiers: { Trial: true, Make: false, Run: false, Operate: true, Enterprise: true } },
    { feature: 'custom_fields_org', label: 'Custom field creation (org-wide)', tiers: { Trial: true, Make: false, Run: false, Operate: true, Enterprise: true } },
    { feature: 'multi_factory', label: 'Multi-factory planning', tiers: { Trial: false, Make: false, Run: false, Operate: false, Enterprise: true } },
    { feature: 'soc2', label: 'SOC 2 audit reports', tiers: { Trial: false, Make: false, Run: false, Operate: false, Enterprise: true } },
    { feature: 'dedicated_csm', label: 'Dedicated CSM', tiers: { Trial: false, Make: false, Run: false, Operate: false, Enterprise: true } },
    { feature: 'sla_1hr', label: '1-hour SLA', tiers: { Trial: false, Make: false, Run: false, Operate: false, Enterprise: true } },
  ],
};

// ---------------------------------------------------------------------------
// Mock Current State (simulates API response)
// ---------------------------------------------------------------------------

const MOCK_USAGE: Record<string, Record<string, number>> = {
  Sell: { contacts: 185, opportunities: 72, quotes: 78 },
  Plan: { jobs: 22 },
  Make: { manufacturing_orders: 20 },
  Org: { sites: 1, integrations: 3, machines: 12, workflows: 4, api_calls_per_day: 412, storage_gb: 14 },
  Ship: {},
  Book: {},
  Buy: {},
};

export const CURRENT_SUBSCRIPTION = {
  tier: 'Run' as TierName,
  billingCycle: 'annual' as 'annual' | 'monthly',
  renewalDate: '2026-10-03',
  currentUsers: 8,
  /** Current month AI actions consumed against the included quota. */
  aiActionsUsedThisMonth: 1280,
  /** Active credit packs purchased (rolls over monthly within sub year). */
  aiPacksOwned: [] as { packId: string; remainingActions: number }[],
  trialEndsAt: null as string | null,
  gracePeriod: null as { startDate: string; endDate: string; module: string; metric: string } | null,
};

// ---------------------------------------------------------------------------
// Query Functions
// ---------------------------------------------------------------------------

/** Get usage metrics with current values for a module (or 'Org' for tenant-wide). */
export function getModuleUsage(module: string): UsageMetric[] {
  const tier = CURRENT_SUBSCRIPTION.tier;
  const limits = MODULE_LIMITS[module]?.[tier] ?? [];
  const usage = MOCK_USAGE[module] ?? {};

  return limits
    .filter((l) => l.limit !== null)
    .map((l) => ({
      key: l.key,
      label: l.label,
      current: usage[l.key] ?? 0,
      limit: l.limit,
    }));
}

/** Get feature gates for a module on the current tier. */
export function getModuleFeatureGates(module: string): FeatureGate[] {
  const tier = CURRENT_SUBSCRIPTION.tier;
  const gates = FEATURE_GATES[module] ?? [];

  return gates.map((g) => {
    const available = g.tiers[tier];
    const requiredTier = TIER_ORDER.find((t) => g.tiers[t]) ?? 'Enterprise';
    return { feature: g.feature, label: g.label, available, requiredTier };
  });
}

/** Calculate usage percentage (0–100+). */
export function getUsagePercentage(current: number, limit: number | null): number {
  if (limit === null || limit === 0) return 0;
  return Math.round((current / limit) * 100);
}

/** Map percentage to a status level. */
export function getUsageStatus(percentage: number): UsageStatus {
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 90) return 'critical';
  if (percentage >= 70) return 'warning';
  return 'normal';
}

/** Get next tier up (or `null` if already at Enterprise). */
export function getNextTier(current: TierName): TierName | null {
  const idx = TIER_ORDER.indexOf(current);
  return idx < TIER_ORDER.length - 1 ? TIER_ORDER[idx + 1] : null;
}

/** Find the single highest usage metric across all modules. */
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

/** Total AI actions available this month: included quota + remaining packs. */
export function getAICreditsRemaining(): {
  includedQuota: number | null;
  includedUsed: number;
  packsRemaining: number;
  total: number | null;
} {
  const tier = CURRENT_SUBSCRIPTION.tier;
  const includedQuota = TIERS[tier].aiCreditsPerMonth;
  const includedUsed = CURRENT_SUBSCRIPTION.aiActionsUsedThisMonth;
  const packsRemaining = CURRENT_SUBSCRIPTION.aiPacksOwned.reduce(
    (sum, p) => sum + p.remainingActions,
    0,
  );
  if (includedQuota === null) {
    return { includedQuota: null, includedUsed, packsRemaining, total: null };
  }
  const includedRemaining = Math.max(0, includedQuota - includedUsed);
  return {
    includedQuota,
    includedUsed,
    packsRemaining,
    total: includedRemaining + packsRemaining,
  };
}

/** Compute the volume-discount band for a given seat count. */
export function getVolumeDiscount(seats: number): VolumeDiscountBand {
  return (
    VOLUME_DISCOUNT_BANDS.find(
      (b) => seats >= b.minSeats && (b.maxSeats === null || seats <= b.maxSeats),
    ) ?? VOLUME_DISCOUNT_BANDS[0]
  );
}

/** Determine which grace phase applies (for modal/banner logic). */
export function getGracePhase(percentage: number): GracePhase {
  if (CURRENT_SUBSCRIPTION.gracePeriod) {
    const now = new Date();
    const end = new Date(CURRENT_SUBSCRIPTION.gracePeriod.endDate);
    if (now > end) return 'hard_limit';
    return 'grace_period';
  }
  if (percentage >= 100) return 'grace_period';
  if (percentage >= 90) return 'approaching';
  if (percentage >= 70) return 'soft_warning';
  return 'none';
}

/** Days remaining in grace period. */
export function getGraceDaysRemaining(): number | null {
  if (!CURRENT_SUBSCRIPTION.gracePeriod) return null;
  const now = new Date();
  const end = new Date(CURRENT_SUBSCRIPTION.gracePeriod.endDate);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}
