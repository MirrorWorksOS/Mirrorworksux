import type { InvitationStatus } from './auth';
import type { InvitationId, OrganizationId, UserId, ModuleGroupId, ModuleKey } from './core';
import type { OrgRole } from './organization';

export interface InvitationModuleAssignment {
  module: ModuleKey;
  isLead: boolean;
  groupIds: ModuleGroupId[];
}

export interface InvitationSummary {
  id: InvitationId;
  email: string;
  orgId: OrganizationId;
  status: InvitationStatus;
  expiresAt: string;
  orgRole: OrgRole;
  invitedByUserId?: UserId | null;
  moduleAssignments: InvitationModuleAssignment[];
}
