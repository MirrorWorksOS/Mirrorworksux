/**
 * Auth — mock current-user hook.
 *
 * Wraps the prototype user context in a hook shape so screens that gate on
 * ownership / platform staff status can migrate to a real backend later
 * without changing call sites.
 *
 * `isSuperAdmin` is derived from the active membership's orgRole so the mock
 * stays in lockstep with the ARCH 00 org-role model (single source of truth).
 */
import { mockUserContext, type MockUserContext } from './mock-user-context';
import { controlPeopleAuthState } from '@/components/control/people/people-data';

export interface CurrentUser extends MockUserContext {
  id: string;
  tenantId: string;
  /** Derived from membership.orgRole === 'super_admin' */
  isSuperAdmin: boolean;
}

const activeMembership = controlPeopleAuthState.activeMembership;

const CURRENT_USER: CurrentUser = {
  ...mockUserContext,
  id: activeMembership?.userId ?? 'u-alex-morgan',
  tenantId: activeMembership?.orgId ?? 't-alliance-metal',
  isSuperAdmin: activeMembership?.orgRole === 'super_admin',
};

export function useCurrentUser(): CurrentUser {
  return CURRENT_USER;
}
