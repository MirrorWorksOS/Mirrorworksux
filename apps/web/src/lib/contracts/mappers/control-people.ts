import type {
  AuthState,
  EffectivePermissionGrant,
  MembershipStatus,
  ModuleAssignment,
  ModuleGroupSummary,
  OrgRole,
  OrganizationMembership,
  OrganizationSummary,
  PermissionSet,
  SubscriptionTier,
  TierFeatureGrant,
  Viewer,
} from '@mirrorworks/contracts';
import { FEATURE_GATES, CURRENT_SUBSCRIPTION } from '@/lib/subscription';
import { mockGroups, mockUsers } from '@/components/control/people/mock-data';
import type { Group as LegacyGroup, User as LegacyUser } from '@/components/control/people/types';
import {
  buildFullModuleGrants,
  buildGroupPermissionGrants,
  mergePermissionSets,
  normalizePermissionSet,
  resolveGroupIdsByName,
} from './permissions';

const DEFAULT_ORG_ID = 'org-alliance-metal';
const DEFAULT_ORG_NAME = 'Alliance Metal Pty Ltd';
const DEFAULT_ORG_SLUG = 'alliance-metal';
const DEFAULT_ASSIGNED_AT = '2026-04-14T00:00:00.000Z';

const MODULE_ORDER = ['sell', 'plan', 'make', 'ship', 'book', 'buy', 'control'] as const;

function splitDisplayName(name: string) {
  const [firstName, ...rest] = name.trim().split(/\s+/);
  return {
    firstName: firstName ?? null,
    lastName: rest.length > 0 ? rest.join(' ') : null,
  };
}

function toMembershipStatus(status: LegacyUser['status']): MembershipStatus {
  switch (status) {
    case 'invited':
      return 'pending';
    case 'deactivated':
      return 'inactive';
    default:
      return 'active';
  }
}

function toSubscriptionTier(tier: typeof CURRENT_SUBSCRIPTION.tier): SubscriptionTier {
  switch (tier) {
    case 'Produce':
      return 'produce';
    case 'Expand':
      return 'expand';
    case 'Excel':
      return 'excel';
    default:
      return 'pilot';
  }
}

function mapModuleAssignments(
  user: LegacyUser,
  groups: LegacyGroup[],
): ModuleAssignment[] {
  return user.modules.map((moduleAssignment) => ({
    module: moduleAssignment.module,
    isLead: user.leadModule === moduleAssignment.module,
    groupIds: resolveGroupIdsByName(moduleAssignment.module, moduleAssignment.groups, groups),
    assignedAt: DEFAULT_ASSIGNED_AT,
    assignedByUserId: null,
  }));
}

export function mapUserToViewer(user: LegacyUser): Viewer {
  const { firstName, lastName } = splitDisplayName(user.name);
  return {
    id: user.id,
    email: user.email,
    firstName,
    lastName,
    displayName: user.name,
    avatarUrl: null,
    metadata: {},
  };
}

export function mapUserToMembership(
  user: LegacyUser,
  groups: LegacyGroup[],
  options?: {
    orgId?: string;
    orgRole?: OrgRole;
    superAdminUserId?: string | null;
  },
): OrganizationMembership {
  const orgId = options?.orgId ?? DEFAULT_ORG_ID;
  const orgRole: OrgRole =
    options?.orgRole ??
    (options?.superAdminUserId && user.id === options.superAdminUserId ? 'super_admin' : 'team');

  return {
    id: `membership-${orgId}-${user.id}`,
    orgId,
    userId: user.id,
    status: toMembershipStatus(user.status),
    orgRole,
    invitedByUserId: null,
    createdAt: DEFAULT_ASSIGNED_AT,
    moduleAssignments: mapModuleAssignments(user, groups),
  };
}

export function mapGroupToModuleGroupSummary(
  group: LegacyGroup,
): ModuleGroupSummary {
  return {
    id: group.id,
    module: group.module,
    name: group.name,
    description: group.description,
    isDefault: group.isDefault,
    permissionSet: normalizePermissionSet(group.permissions as unknown as Record<string, unknown>),
    memberCount: group.members.length,
  };
}

function resolveGroupSummariesForMembership(
  membership: OrganizationMembership,
  groups: ModuleGroupSummary[],
): ModuleGroupSummary[] {
  const groupIds = new Set(
    membership.moduleAssignments.flatMap((assignment) => assignment.groupIds),
  );
  return groups.filter((group) => groupIds.has(group.id));
}

export function resolveEffectivePermissions(
  membership: OrganizationMembership,
  groups: ModuleGroupSummary[],
): EffectivePermissionGrant[] {
  // Deactivated/inactive memberships yield zero grants — even super-admin or
  // lead flags are ignored until the membership is reactivated. This is the
  // authoritative cut-off; UI layers should not need to re-check status.
  if (membership.status === 'inactive') {
    return [];
  }

  if (membership.orgRole === 'super_admin') {
    return MODULE_ORDER.flatMap((module) =>
      buildFullModuleGrants(module, 'super_admin', membership.id),
    );
  }

  const grants: EffectivePermissionGrant[] = [];
  const groupSummaries = resolveGroupSummariesForMembership(membership, groups);

  for (const assignment of membership.moduleAssignments) {
    if (assignment.isLead) {
      grants.push(...buildFullModuleGrants(assignment.module, 'lead', `lead:${membership.userId}:${assignment.module}`));
      continue;
    }

    const relevantGroups = groupSummaries.filter(
      (group) => group.module === assignment.module && assignment.groupIds.includes(group.id),
    );

    const merged = mergePermissionSets(relevantGroups.map((group) => group.permissionSet));
    const mergedGroup: ModuleGroupSummary = {
      id: `merged:${membership.userId}:${assignment.module}`,
      module: assignment.module,
      name: 'Merged permissions',
      description: 'Derived from group membership',
      isDefault: false,
      permissionSet: merged,
      memberCount: 1,
    };

    grants.push(...buildGroupPermissionGrants(assignment.module, mergedGroup));
  }

  return grants;
}

function buildOrganizationSummary(
  membership: OrganizationMembership,
): OrganizationSummary {
  return {
    id: membership.orgId,
    name: DEFAULT_ORG_NAME,
    slug: DEFAULT_ORG_SLUG,
    tier: toSubscriptionTier(CURRENT_SUBSCRIPTION.tier),
    membershipStatus: membership.status,
    metadata: {},
  };
}

function buildTierFeatureGrants(): TierFeatureGrant[] {
  const tier = toSubscriptionTier(CURRENT_SUBSCRIPTION.tier);

  return Object.entries(FEATURE_GATES).flatMap(([module, gates]) =>
    gates.map((gate) => {
      const requiredTier: SubscriptionTier =
        gate.tiers.Pilot ? 'pilot' :
        gate.tiers.Produce ? 'produce' :
        gate.tiers.Expand ? 'expand' :
        'excel';

      return {
        featureKey: `${module.toLowerCase()}.${gate.feature}`,
        module: module.toLowerCase() as TierFeatureGrant['module'],
        allowed: gate.tiers[CURRENT_SUBSCRIPTION.tier],
        limit: null,
        requiredTier,
      };
    }),
  ).filter((grant) => grant.requiredTier === tier || grant.allowed || grant.requiredTier !== 'pilot');
}

export function buildMockAuthState(activeUserId = mockUsers[0]?.id ?? '1'): AuthState {
  const activeUser = mockUsers.find((user) => user.id === activeUserId) ?? mockUsers[0];
  const viewer = activeUser ? mapUserToViewer(activeUser) : null;
  const activeMembership = activeUser
    ? mapUserToMembership(activeUser, mockGroups, { superAdminUserId: activeUser.id })
    : null;
  const groupSummaries = mockGroups.map(mapGroupToModuleGroupSummary);

  return {
    status: viewer ? 'signed_in' : 'signed_out',
    viewer,
    activeOrgId: activeMembership?.orgId ?? null,
    organizations: activeMembership ? [buildOrganizationSummary(activeMembership)] : [],
    activeMembership,
    effectivePermissions: activeMembership
      ? resolveEffectivePermissions(activeMembership, groupSummaries)
      : [],
    tierFeatures: buildTierFeatureGrants(),
    impersonator: null,
  };
}
