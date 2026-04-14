import type {
  EffectivePermissionGrant,
  MembershipStatus,
  ModuleAssignment,
  ModuleGroupSummary,
  ModuleKey,
  OrgRole,
  OrganizationMembership,
  PermissionDefinition,
  PermissionSet,
  Viewer,
} from '@mirrorworks/contracts';
import {
  buildMockAuthState,
  mapGroupToModuleGroupSummary,
  mapUserToMembership,
  mapUserToViewer,
  resolveEffectivePermissions,
} from '@/lib/contracts/mappers/control-people';
import { buildPermissionCatalog } from '@/lib/contracts/mappers/permissions';
import {
  mockActivity,
  mockGroups,
  mockUsers,
  moduleColors,
  moduleLabels,
} from './mock-data';

export type PeopleStatus = MembershipStatus;
export type PeopleDisplayRole = 'lead' | 'team';

export interface PeopleModuleAssignmentView extends ModuleAssignment {
  groupNames: string[];
}

export interface PeopleUserView {
  id: string;
  name: string;
  email: string;
  status: PeopleStatus;
  orgRole: OrgRole;
  displayRole: PeopleDisplayRole;
  leadModule?: ModuleKey;
  modules: PeopleModuleAssignmentView[];
  lastActive: string;
  viewer: Viewer;
  membership: OrganizationMembership;
  effectivePermissions: EffectivePermissionGrant[];
}

export interface PeopleGroupView {
  id: string;
  module: ModuleKey;
  name: string;
  description: string;
  isDefault: boolean;
  memberIds: string[];
  memberCount: number;
  permissionSet: PermissionSet;
  summary: ModuleGroupSummary;
}

function resolveGroupNames(assignment: ModuleAssignment): string[] {
  return mockGroups
    .filter((group) => group.module === assignment.module && assignment.groupIds.includes(group.id))
    .map((group) => group.name)
    .sort();
}

export const peoplePermissionCatalog = buildPermissionCatalog();
export const peopleModulePermissionLabels: Record<ModuleKey, PermissionDefinition[]> =
  peoplePermissionCatalog.byModule;

export const peopleGroups: PeopleGroupView[] = mockGroups.map((group) => {
  const summary = mapGroupToModuleGroupSummary(group);
  return {
    id: group.id,
    module: group.module,
    name: group.name,
    description: group.description,
    isDefault: group.isDefault,
    memberIds: [...group.members],
    memberCount: group.members.length,
    permissionSet: summary.permissionSet,
    summary,
  };
});

export const peopleUsers: PeopleUserView[] = mockUsers.map((user) => {
  const viewer = mapUserToViewer(user);
  const membership = mapUserToMembership(user, mockGroups);
  const effectivePermissions = resolveEffectivePermissions(
    membership,
    peopleGroups.map((group) => group.summary),
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    status: membership.status,
    orgRole: membership.orgRole,
    displayRole: membership.moduleAssignments.some((assignment) => assignment.isLead) ? 'lead' : 'team',
    leadModule: membership.moduleAssignments.find((assignment) => assignment.isLead)?.module,
    modules: membership.moduleAssignments.map((assignment) => ({
      ...assignment,
      groupNames: resolveGroupNames(assignment),
    })),
    lastActive: user.lastActive,
    viewer,
    membership,
    effectivePermissions,
  };
});

export const peopleUsersById = new Map(peopleUsers.map((user) => [user.id, user]));
export const peopleGroupsById = new Map(peopleGroups.map((group) => [group.id, group]));
export const controlPeopleAuthState = buildMockAuthState();
export { mockActivity, moduleColors, moduleLabels };
