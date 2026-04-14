import type { MembershipStatus } from './auth';
import type { OrganizationId, UserId, ModuleKey, SubscriptionTier, MembershipId, ModuleGroupId } from './core';

export type OrgRole = 'super_admin' | 'team';

export interface ModuleAssignment {
  module: ModuleKey;
  isLead: boolean;
  groupIds: ModuleGroupId[];
  assignedAt: string;
  assignedByUserId: UserId | null;
}

export interface OrganizationSummary {
  id: OrganizationId;
  name: string;
  slug: string;
  tier: SubscriptionTier;
  membershipStatus: MembershipStatus;
  metadata: Record<string, unknown>;
}

export interface OrganizationMembership {
  id: MembershipId;
  orgId: OrganizationId;
  userId: UserId;
  status: MembershipStatus;
  orgRole: OrgRole;
  invitedByUserId: UserId | null;
  createdAt: string;
  moduleAssignments: ModuleAssignment[];
  workosRoleSlugs?: string[];
}
