import { describe, expect, it } from 'vitest';
import {
  resolveEffectivePermissions,
  buildMockAuthState,
} from '@/lib/contracts/mappers/control-people';
import type {
  EffectivePermissionGrant,
  ModuleGroupSummary,
  ModuleKey,
  OrganizationMembership,
  PermissionSet,
} from '@mirrorworks/contracts';

const ALL_MODULES: ModuleKey[] = ['sell', 'plan', 'make', 'ship', 'book', 'buy', 'control'];
const TS = '2026-01-01T00:00:00.000Z';

function buildMembership(overrides: Partial<OrganizationMembership> = {}): OrganizationMembership {
  return {
    id: 'm-default',
    orgId: 'org-test',
    userId: 'u1',
    status: 'active',
    orgRole: 'team',
    invitedByUserId: null,
    createdAt: TS,
    moduleAssignments: [],
    ...overrides,
  };
}

function buildAssignment(
  module: ModuleKey,
  opts: { isLead?: boolean; groupIds?: string[] } = {},
): OrganizationMembership['moduleAssignments'][number] {
  return {
    module,
    isLead: opts.isLead ?? false,
    groupIds: opts.groupIds ?? [],
    assignedAt: TS,
    assignedByUserId: null,
  };
}

function buildGroup(
  id: string,
  module: ModuleKey,
  permissionSet: PermissionSet,
): ModuleGroupSummary {
  return {
    id,
    module,
    name: id,
    description: '',
    isDefault: false,
    permissionSet,
    memberCount: 1,
  };
}

function findGrant(
  grants: EffectivePermissionGrant[],
  module: ModuleKey,
  key: string,
): EffectivePermissionGrant | undefined {
  return grants.find((g) => g.module === module && g.key === key);
}

describe('resolveEffectivePermissions', () => {
  describe('inactive memberships', () => {
    it('returns no grants for an inactive super_admin', () => {
      const membership = buildMembership({ orgRole: 'super_admin', status: 'inactive' });
      expect(resolveEffectivePermissions(membership, [])).toEqual([]);
    });

    it('returns no grants for an inactive team member with assignments', () => {
      const membership = buildMembership({
        status: 'inactive',
        moduleAssignments: [buildAssignment('plan', { groupIds: ['g1'] })],
      });
      const groups = [buildGroup('g1', 'plan', { 'budget.visibility': true })];
      expect(resolveEffectivePermissions(membership, groups)).toEqual([]);
    });

    it('returns no grants for an inactive lead', () => {
      const membership = buildMembership({
        status: 'inactive',
        moduleAssignments: [buildAssignment('make', { isLead: true })],
      });
      expect(resolveEffectivePermissions(membership, [])).toEqual([]);
    });
  });

  describe('super_admin role', () => {
    it('grants permissions across every module', () => {
      const grants = resolveEffectivePermissions(
        buildMembership({ orgRole: 'super_admin' }),
        [],
      );
      const modules = new Set(grants.map((g) => g.module));
      expect(modules).toEqual(new Set(ALL_MODULES));
    });

    it('marks every grant with source="super_admin"', () => {
      const grants = resolveEffectivePermissions(
        buildMembership({ orgRole: 'super_admin' }),
        [],
      );
      expect(grants.length).toBeGreaterThan(0);
      expect(grants.every((g) => g.source === 'super_admin')).toBe(true);
    });

    it('uses the membership id as sourceId', () => {
      const membership = buildMembership({ id: 'm-special', orgRole: 'super_admin' });
      const grants = resolveEffectivePermissions(membership, []);
      expect(grants.every((g) => g.sourceId === 'm-special')).toBe(true);
    });

    it('ignores moduleAssignments and groups entirely', () => {
      // super_admin should bypass: empty assignments, no groups, still full grants.
      const membership = buildMembership({ orgRole: 'super_admin' });
      const grantsNoGroups = resolveEffectivePermissions(membership, []);
      const grantsWithGroups = resolveEffectivePermissions(membership, [
        buildGroup('g1', 'plan', { 'budget.visibility': false }),
      ]);
      expect(grantsNoGroups.length).toBe(grantsWithGroups.length);
    });
  });

  describe('lead role (per-module bypass)', () => {
    it('grants every permission of the lead module', () => {
      const membership = buildMembership({
        moduleAssignments: [buildAssignment('plan', { isLead: true })],
      });
      const grants = resolveEffectivePermissions(membership, []);
      expect(grants.length).toBeGreaterThan(0);
      expect(grants.every((g) => g.module === 'plan')).toBe(true);
      // budget.visibility is a Plan permission and should be true under lead bypass
      expect(findGrant(grants, 'plan', 'budget.visibility')?.value).toBe(true);
    });

    it('marks lead grants with source="lead"', () => {
      const membership = buildMembership({
        moduleAssignments: [buildAssignment('plan', { isLead: true })],
      });
      const grants = resolveEffectivePermissions(membership, []);
      expect(grants.every((g) => g.source === 'lead')).toBe(true);
    });

    it('uses sourceId="lead:<userId>:<module>"', () => {
      const membership = buildMembership({
        userId: 'u-lead-1',
        moduleAssignments: [buildAssignment('make', { isLead: true })],
      });
      const grants = resolveEffectivePermissions(membership, []);
      expect(grants.every((g) => g.sourceId === 'lead:u-lead-1:make')).toBe(true);
    });

    it('ignores any groupIds attached to the lead assignment', () => {
      // Lead bypass means the user gets everything regardless of group membership;
      // the resolver short-circuits before consulting groups for that module.
      const membership = buildMembership({
        moduleAssignments: [buildAssignment('plan', { isLead: true, groupIds: ['g-restrictive'] })],
      });
      const groups = [buildGroup('g-restrictive', 'plan', { 'budget.visibility': false })];
      const grants = resolveEffectivePermissions(membership, groups);
      expect(findGrant(grants, 'plan', 'budget.visibility')?.value).toBe(true);
      expect(grants.every((g) => g.source === 'lead')).toBe(true);
    });

    it('mixes lead and group sources across different modules', () => {
      const membership = buildMembership({
        moduleAssignments: [
          buildAssignment('plan', { isLead: true }),
          buildAssignment('make', { groupIds: ['g-make'] }),
        ],
      });
      const groups = [buildGroup('g-make', 'make', { 'qc.record': true })];
      const grants = resolveEffectivePermissions(membership, groups);

      const planGrants = grants.filter((g) => g.module === 'plan');
      const makeGrants = grants.filter((g) => g.module === 'make');
      expect(planGrants.length).toBeGreaterThan(0);
      expect(makeGrants.length).toBeGreaterThan(0);
      expect(planGrants.every((g) => g.source === 'lead')).toBe(true);
      expect(makeGrants.every((g) => g.source === 'group')).toBe(true);
    });
  });

  describe('team role (group-derived)', () => {
    it('returns no grants when there are no module assignments', () => {
      expect(resolveEffectivePermissions(buildMembership(), [])).toEqual([]);
    });

    it('produces baseline merged grants for an assignment with no groups', () => {
      // mergePermissionSets seeds defaults: documents.scope='own',
      // settings.access=false, reports.access=false. These appear even when
      // the user is in zero groups for that module.
      const membership = buildMembership({
        moduleAssignments: [buildAssignment('plan')],
      });
      const grants = resolveEffectivePermissions(membership, []);
      expect(findGrant(grants, 'plan', 'documents.scope')?.value).toBe('own');
      expect(findGrant(grants, 'plan', 'settings.access')?.value).toBe(false);
      expect(findGrant(grants, 'plan', 'reports.access')?.value).toBe(false);
    });

    it('exposes a single group\'s permissions as group-sourced grants', () => {
      const membership = buildMembership({
        moduleAssignments: [buildAssignment('sell', { groupIds: ['g-sales'] })],
      });
      const groups = [
        buildGroup('g-sales', 'sell', {
          'crm.access': true,
          'pipeline.visibility': 'all',
        }),
      ];
      const grants = resolveEffectivePermissions(membership, groups);
      expect(findGrant(grants, 'sell', 'crm.access')?.value).toBe(true);
      expect(findGrant(grants, 'sell', 'pipeline.visibility')?.value).toBe('all');
      expect(grants.every((g) => g.source === 'group')).toBe(true);
    });

    it('uses sourceId="merged:<userId>:<module>" for group-derived grants', () => {
      const membership = buildMembership({
        userId: 'u-emma',
        moduleAssignments: [buildAssignment('plan', { groupIds: ['g-cost'] })],
      });
      const groups = [buildGroup('g-cost', 'plan', { 'budget.visibility': true })];
      const grants = resolveEffectivePermissions(membership, groups);
      expect(grants.every((g) => g.sourceId === 'merged:u-emma:plan')).toBe(true);
    });
  });

  describe('group union semantics', () => {
    it('boolean: true wins over false (any grant of true → effective true)', () => {
      const membership = buildMembership({
        moduleAssignments: [buildAssignment('sell', { groupIds: ['gA', 'gB'] })],
      });
      const groups = [
        buildGroup('gA', 'sell', { 'quotes.create': true }),
        buildGroup('gB', 'sell', { 'quotes.create': false }),
      ];
      const grants = resolveEffectivePermissions(membership, groups);
      expect(findGrant(grants, 'sell', 'quotes.create')?.value).toBe(true);
    });

    it('boolean: order does not matter (false then true still wins)', () => {
      const membership = buildMembership({
        moduleAssignments: [buildAssignment('sell', { groupIds: ['gB', 'gA'] })],
      });
      const groups = [
        buildGroup('gA', 'sell', { 'quotes.create': true }),
        buildGroup('gB', 'sell', { 'quotes.create': false }),
      ];
      const grants = resolveEffectivePermissions(membership, groups);
      expect(findGrant(grants, 'sell', 'quotes.create')?.value).toBe(true);
    });

    it('scope: "all" wins over "own"', () => {
      const membership = buildMembership({
        moduleAssignments: [buildAssignment('sell', { groupIds: ['gA', 'gB'] })],
      });
      const groups = [
        buildGroup('gA', 'sell', { 'pipeline.visibility': 'own' }),
        buildGroup('gB', 'sell', { 'pipeline.visibility': 'all' }),
      ];
      const grants = resolveEffectivePermissions(membership, groups);
      expect(findGrant(grants, 'sell', 'pipeline.visibility')?.value).toBe('all');
    });

    it('scope: two "own" groups stay "own"', () => {
      const membership = buildMembership({
        moduleAssignments: [buildAssignment('sell', { groupIds: ['gA', 'gB'] })],
      });
      const groups = [
        buildGroup('gA', 'sell', { 'pipeline.visibility': 'own' }),
        buildGroup('gB', 'sell', { 'pipeline.visibility': 'own' }),
      ];
      const grants = resolveEffectivePermissions(membership, groups);
      expect(findGrant(grants, 'sell', 'pipeline.visibility')?.value).toBe('own');
    });

    it('duplicate groupIds do not double-count permissions', () => {
      const membership = buildMembership({
        moduleAssignments: [buildAssignment('plan', { groupIds: ['g1', 'g1'] })],
      });
      const groups = [buildGroup('g1', 'plan', { 'budget.visibility': true })];
      const grants = resolveEffectivePermissions(membership, groups);
      const budgetVis = grants.filter((g) => g.module === 'plan' && g.key === 'budget.visibility');
      expect(budgetVis).toHaveLength(1);
      expect(budgetVis[0].value).toBe(true);
    });

    it('only grants permissions that are present in at least one group (or baselines)', () => {
      const membership = buildMembership({
        moduleAssignments: [buildAssignment('plan', { groupIds: ['g1'] })],
      });
      const groups = [buildGroup('g1', 'plan', { 'budget.visibility': true })];
      const grants = resolveEffectivePermissions(membership, groups);
      // Only baseline keys + budget.visibility should appear:
      // documents.scope, settings.access, reports.access, budget.visibility
      const planKeys = grants.filter((g) => g.module === 'plan').map((g) => g.key).sort();
      expect(planKeys).toEqual([
        'budget.visibility',
        'documents.scope',
        'reports.access',
        'settings.access',
      ]);
    });
  });

  describe('module isolation', () => {
    it('groups in one module do not contribute to a different module\'s grants', () => {
      const membership = buildMembership({
        moduleAssignments: [buildAssignment('sell', { groupIds: ['g-make'] })],
      });
      // The user references g-make from a Sell assignment, but the group is
      // tagged module='make'. The resolver filters by module, so this group
      // contributes nothing.
      const groups = [buildGroup('g-make', 'make', { 'qc.record': true })];
      const grants = resolveEffectivePermissions(membership, groups);
      expect(grants.find((g) => g.key === 'qc.record')).toBeUndefined();
      // Sell still gets baseline grants.
      expect(findGrant(grants, 'sell', 'documents.scope')?.value).toBe('own');
    });

    it('multi-module assignments produce grants for each module', () => {
      const membership = buildMembership({
        moduleAssignments: [
          buildAssignment('sell', { groupIds: ['g-sales'] }),
          buildAssignment('plan', { groupIds: ['g-cost'] }),
        ],
      });
      const groups = [
        buildGroup('g-sales', 'sell', { 'crm.access': true }),
        buildGroup('g-cost', 'plan', { 'budget.visibility': true }),
      ];
      const grants = resolveEffectivePermissions(membership, groups);
      expect(findGrant(grants, 'sell', 'crm.access')?.value).toBe(true);
      expect(findGrant(grants, 'plan', 'budget.visibility')?.value).toBe(true);
    });

    it('a group only appears in grants for its own module key', () => {
      const membership = buildMembership({
        moduleAssignments: [
          buildAssignment('sell', { groupIds: ['g-shared'] }),
          buildAssignment('make', { groupIds: ['g-shared'] }),
        ],
      });
      // Same group id under both assignments, but the group is tagged module='sell'.
      // It should only contribute to sell grants, not make.
      const groups = [buildGroup('g-shared', 'sell', { 'crm.access': true })];
      const grants = resolveEffectivePermissions(membership, groups);
      expect(findGrant(grants, 'sell', 'crm.access')?.value).toBe(true);
      expect(findGrant(grants, 'make', 'crm.access')).toBeUndefined();
    });
  });
});

describe('buildMockAuthState (resolver + tier integration)', () => {
  it('returns a signed_in state with viewer, membership, and grants', () => {
    const auth = buildMockAuthState();
    expect(auth.status).toBe('signed_in');
    expect(auth.viewer).not.toBeNull();
    expect(auth.activeMembership).not.toBeNull();
    expect(auth.effectivePermissions.length).toBeGreaterThan(0);
  });

  it('treats the active mock user as super_admin (full module bypass)', () => {
    const auth = buildMockAuthState();
    const modules = new Set(auth.effectivePermissions.map((g) => g.module));
    for (const module of ALL_MODULES) {
      expect(modules.has(module)).toBe(true);
    }
    expect(auth.effectivePermissions.every((g) => g.source === 'super_admin')).toBe(true);
  });

  it('produces a non-empty list of tier feature grants', () => {
    const auth = buildMockAuthState();
    expect(auth.tierFeatures.length).toBeGreaterThan(0);
    for (const grant of auth.tierFeatures) {
      expect(grant.featureKey).toMatch(/^[a-z]+\..+$/);
      expect(grant.requiredTier).toMatch(/^(trial|make|run|operate|enterprise)$/);
      expect(typeof grant.allowed).toBe('boolean');
    }
  });

  it('falls back to the first mock user when given an unknown id', () => {
    const auth = buildMockAuthState('does-not-exist');
    expect(auth.viewer).not.toBeNull();
    expect(auth.activeMembership).not.toBeNull();
  });

  it('exposes a single organization summary with a recognised tier', () => {
    const auth = buildMockAuthState();
    expect(auth.organizations).toHaveLength(1);
    expect(auth.organizations[0].tier).toMatch(/^(trial|make|run|operate|enterprise)$/);
  });
});
