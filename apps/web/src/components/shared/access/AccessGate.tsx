/**
 * AccessGate — shared access wrapper for pages and sections that need the
 * ARCH 00 three-layer check applied:
 *
 *   1. Tier gate  → does the org's plan include this feature?
 *   2. Role gate  → does the current user have the required role (admin > lead > team)?
 *   3. Permission gate → does the user hold the named PermissionKey?
 *
 * Any gate that's not specified is skipped. All specified gates must pass.
 * Denials render an inline card explaining why, so the user knows what to
 * change (upgrade plan vs ask a lead).
 *
 * Usage:
 *
 *   <AccessGate role="admin" feature="customer_portal">
 *     <ControlCustomerPortal />
 *   </AccessGate>
 */

import * as React from 'react';
import { Lock, ShieldOff, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { useAuth, type PermissionKey } from '@/contexts/AuthContext';
import {
  CURRENT_SUBSCRIPTION,
  FEATURE_GATES,
  type TierName,
} from '@/lib/subscription';

type Role = 'admin' | 'lead' | 'team';

const ROLE_RANK: Record<Role, number> = { team: 0, lead: 1, admin: 2 };

export interface AccessGateProps {
  /** Required ARCH 00 role hierarchy. admin > lead > team. */
  role?: Role;
  /**
   * Feature key from `FEATURE_GATES` (e.g. "customer_portal"). When set,
   * the gate also checks the current subscription tier.
   */
  feature?: string;
  /** Optional flat permission key (Sell portal permissions live here). */
  permission?: PermissionKey;
  /** What's being gated — used in denial copy. */
  label?: string;
  /** When true, wraps denials in a PageShell + PageHeader so a denied route is still framed. */
  asPage?: boolean;
  /** Override the page title rendered on denial when `asPage`. */
  pageTitle?: string;
  children: React.ReactNode;
}

export function AccessGate({
  role,
  feature,
  permission,
  label,
  asPage = false,
  pageTitle,
  children,
}: AccessGateProps) {
  const { identity, hasPermission } = useAuth();

  // ── Role gate ──────────────────────────────────────────────────
  // Customer-side identities are denied on role gates — those are internal-only.
  const internalRole: Role | null =
    identity.kind === 'internal' ? identity.role : null;

  const roleOk =
    !role ||
    (internalRole !== null && ROLE_RANK[internalRole] >= ROLE_RANK[role]);

  // ── Permission gate ────────────────────────────────────────────
  const permissionOk = !permission || hasPermission(permission);

  // ── Tier gate ──────────────────────────────────────────────────
  const tier = CURRENT_SUBSCRIPTION.tier;
  const tierGate = feature ? findFeatureGate(feature) : null;
  const tierOk = !feature || (tierGate ? tierGate.tiers[tier] : true);
  const requiredTier: TierName | null =
    feature && tierGate && !tierGate.tiers[tier] ? minTierFor(tierGate.tiers) : null;

  if (roleOk && permissionOk && tierOk) {
    return <>{children}</>;
  }

  const reason: 'tier' | 'role' = !tierOk ? 'tier' : 'role';
  const denial = (
    <AccessDenialCard
      reason={reason}
      role={role}
      requiredTier={requiredTier}
      featureLabel={tierGate?.label ?? feature ?? null}
      label={label}
    />
  );

  if (!asPage) return denial;

  return (
    <PageShell className="space-y-6">
      <PageHeader
        title={pageTitle ?? label ?? 'Access required'}
        subtitle={
          reason === 'tier'
            ? 'This feature is not available on your current plan.'
            : 'You do not have permission to view this page.'
        }
      />
      {denial}
    </PageShell>
  );
}

// ── Denial card ──────────────────────────────────────────────────

interface AccessDenialCardProps {
  reason: 'role' | 'tier';
  role?: Role;
  requiredTier?: TierName | null;
  featureLabel?: string | null;
  label?: string;
}

function AccessDenialCard({
  reason,
  role,
  requiredTier,
  featureLabel,
  label,
}: AccessDenialCardProps) {
  if (reason === 'tier') {
    return (
      <Card className="max-w-2xl p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-[var(--mw-yellow-400)]/15 p-3">
            <Lock className="h-5 w-5 text-[var(--mw-yellow-600)]" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-medium text-foreground">
              Available on a higher plan
            </h2>
            <p className="mt-1 text-sm text-[var(--neutral-600)]">
              {featureLabel ? <strong>{featureLabel}</strong> : <strong>{label ?? 'This feature'}</strong>}{' '}
              is not included in your current plan
              {requiredTier ? (
                <>
                  {' '}
                  — upgrade to <strong>{requiredTier}</strong> or higher to enable it.
                </>
              ) : (
                '.'
              )}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                asChild
                className="h-10 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
              >
                <Link to="/control/billing">
                  View plans
                  <ArrowUpRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <span className="text-xs text-[var(--neutral-500)]">
                Current plan: <strong>{CURRENT_SUBSCRIPTION.tier}</strong>
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // role denial
  return (
    <Card className="max-w-2xl p-8">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-[var(--neutral-100)] p-3">
          <ShieldOff className="h-5 w-5 text-[var(--neutral-600)]" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-medium text-foreground">
            Permission required
          </h2>
          <p className="mt-1 text-sm text-[var(--neutral-600)]">
            {label ? <strong>{label}</strong> : 'This page'} is restricted to
            users with the <strong>{role ?? 'admin'}</strong> role.
            Ask your admin or module lead to grant access via{' '}
            <Link
              to="/control/people"
              className="font-medium text-foreground hover:underline"
            >
              Control → People
            </Link>
            .
          </p>
        </div>
      </div>
    </Card>
  );
}

// ── Internals ───────────────────────────────────────────────────

function findFeatureGate(feature: string) {
  for (const moduleKey of Object.keys(FEATURE_GATES)) {
    const hit = FEATURE_GATES[moduleKey].find((g) => g.feature === feature);
    if (hit) return hit;
  }
  return null;
}

function minTierFor(tiers: Record<TierName, boolean>): TierName | null {
  // Skip Trial — it's a 30-day-everything plan, not a sustainable target.
  // Recommend the cheapest paid tier that includes the feature.
  const order: TierName[] = ['Make', 'Run', 'Operate', 'Enterprise'];
  return order.find((t) => tiers[t]) ?? null;
}
