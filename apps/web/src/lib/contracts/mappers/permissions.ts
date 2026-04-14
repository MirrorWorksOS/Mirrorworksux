import type {
  BooleanPermissionKey,
  EffectivePermissionGrant,
  ModuleGroupSummary,
  ModuleKey,
  PermissionCatalog,
  PermissionDefinition,
  PermissionKey,
  PermissionSet,
  ScopePermissionKey,
  ScopeValue,
} from '@mirrorworks/contracts';
import { modulePermissionLabels } from '@/components/control/people/mock-data';
import type { Group as LegacyGroup } from '@/components/control/people/types';

export const SCOPE_PERMISSION_KEYS = new Set<ScopePermissionKey>([
  'documents.scope',
  'pipeline.visibility',
  'workorders.scope',
  'timers.scope',
  'orders.scope',
  'expenses.scope',
  'requisitions.scope',
]);

const MODULE_ORDER: ModuleKey[] = ['sell', 'plan', 'make', 'ship', 'book', 'buy', 'control'];

export function isScopePermissionKey(key: string): key is ScopePermissionKey {
  return SCOPE_PERMISSION_KEYS.has(key as ScopePermissionKey);
}

export function normalizePermissionSet(
  input: Record<string, unknown>,
): PermissionSet {
  const normalized: PermissionSet = {};

  for (const [key, raw] of Object.entries(input)) {
    if (raw === undefined) continue;
    if (isScopePermissionKey(key)) {
      normalized[key] = raw === 'all' ? 'all' : 'own';
      continue;
    }

    normalized[key as BooleanPermissionKey] = raw === true;
  }

  return normalized;
}

export function mergePermissionSets(permissionSets: PermissionSet[]): PermissionSet {
  const merged: PermissionSet = {
    'documents.scope': 'own',
    'settings.access': false,
    'reports.access': false,
  };

  for (const permissionSet of permissionSets) {
    for (const [key, raw] of Object.entries(permissionSet) as [PermissionKey, PermissionSet[PermissionKey]][]) {
      if (raw === undefined) continue;
      if (isScopePermissionKey(key)) {
        merged[key] = merged[key] === 'all' || raw === 'all' ? 'all' : 'own';
        continue;
      }

      merged[key] = Boolean(merged[key] || raw);
    }
  }

  return merged;
}

export function resolveGroupIdsByName(
  module: ModuleKey,
  groupNames: string[],
  groups: LegacyGroup[],
): string[] {
  return groupNames
    .map((groupName) => groups.find((group) => group.module === module && group.name === groupName)?.id)
    .filter((groupId): groupId is string => Boolean(groupId))
    .sort();
}

export function buildPermissionCatalog(): PermissionCatalog {
  const byModule = MODULE_ORDER.reduce<Record<ModuleKey, PermissionDefinition[]>>((acc, moduleKey) => {
    const entries: PermissionDefinition[] = [
      {
        key: 'documents.scope',
        label: 'Document visibility',
        module: moduleKey,
        type: 'scope',
        section: 'scope',
      },
      ...modulePermissionLabels[moduleKey].map((entry) => ({
        key: entry.key as PermissionKey,
        label: entry.label,
        module: moduleKey,
        type: entry.type,
        section: entry.section,
      })),
    ];

    acc[moduleKey] = entries;
    return acc;
  }, {
    sell: [],
    plan: [],
    make: [],
    ship: [],
    book: [],
    buy: [],
    control: [],
  });

  return { byModule };
}

export const DEFAULT_PERMISSION_CATALOG = buildPermissionCatalog();

export function getPermissionDefinitionsForModule(module: ModuleKey): PermissionDefinition[] {
  return DEFAULT_PERMISSION_CATALOG.byModule[module];
}

export function buildFullModuleGrants(
  module: ModuleKey,
  source: EffectivePermissionGrant['source'],
  sourceId: string,
): EffectivePermissionGrant[] {
  return getPermissionDefinitionsForModule(module).map((definition) => ({
    module,
    key: definition.key,
    value: definition.type === 'scope' ? 'all' : true,
    source,
    sourceId,
  }));
}

export function buildGroupPermissionGrants(
  module: ModuleKey,
  group: ModuleGroupSummary,
): EffectivePermissionGrant[] {
  return Object.entries(group.permissionSet)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => ({
      module,
      key: key as PermissionKey,
      value: value as ScopeValue | boolean,
      source: 'group' as const,
      sourceId: group.id,
    }));
}
