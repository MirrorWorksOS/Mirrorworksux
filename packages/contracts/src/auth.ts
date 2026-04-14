import type { EffectivePermissionGrant, TierFeatureGrant } from './access';
import type { OrganizationMembership, OrganizationSummary } from './organization';
import type { UserId } from './core';

export type AuthStatus = 'loading' | 'signed_out' | 'signed_in';
export type MembershipStatus = 'pending' | 'active' | 'inactive';
export type InvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';
export type ImpersonationStatus = 'inactive' | 'active';

export interface Viewer {
  id: UserId;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  avatarUrl: string | null;
  metadata: Record<string, unknown>;
  workosRoleSlugs?: string[];
}

export interface ImpersonationContext {
  status: ImpersonationStatus;
  actorUserId: UserId;
  actorEmail: string;
  startedAt: string;
  reason?: string | null;
}

export interface AuthState {
  status: AuthStatus;
  viewer: Viewer | null;
  activeOrgId: string | null;
  organizations: OrganizationSummary[];
  activeMembership: OrganizationMembership | null;
  effectivePermissions: EffectivePermissionGrant[];
  tierFeatures: TierFeatureGrant[];
  impersonator: ImpersonationContext | null;
}
