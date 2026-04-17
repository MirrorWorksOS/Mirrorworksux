import { useMemo } from 'react';
import { Crown, Shield, Users, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/components/ui/utils';
import {
  moduleColors,
  moduleLabels,
  peopleGroups,
  peopleModulePermissionLabels,
  type PeopleUserView,
} from './people-data';
import { isScopePermissionKey } from '@/lib/contracts/mappers/permissions';
import type {
  ModuleKey,
  PermissionDefinition,
  PermissionKey,
  ScopeValue,
} from '@mirrorworks/contracts';

interface PermissionContribution {
  groupName: string;
  value: boolean | ScopeValue;
}

interface PermissionRowTrail {
  key: PermissionKey;
  label: string;
  type: PermissionDefinition['type'];
  resolved: boolean | ScopeValue | undefined;
  contributions: PermissionContribution[];
  /** True when at least two contributions disagreed on the winning value */
  conflict: boolean;
  /** Groups whose contribution matched the resolved value */
  winningGroups: string[];
}

type ModuleTrailSource = 'super_admin' | 'lead' | 'group' | 'none';

interface ModuleTrail {
  module: ModuleKey;
  source: ModuleTrailSource;
  rows: PermissionRowTrail[];
}

function resolveModuleTrail(user: PeopleUserView, module: ModuleKey): ModuleTrail {
  const definitions = peopleModulePermissionLabels[module];

  if (user.orgRole === 'super_admin') {
    return {
      module,
      source: 'super_admin',
      rows: definitions.map((def) => ({
        key: def.key as PermissionKey,
        label: def.label,
        type: def.type,
        resolved: def.type === 'scope' ? 'all' : true,
        contributions: [],
        conflict: false,
        winningGroups: [],
      })),
    };
  }

  const assignment = user.modules.find((a) => a.module === module);
  if (!assignment) {
    return { module, source: 'none', rows: [] };
  }

  if (assignment.isLead) {
    return {
      module,
      source: 'lead',
      rows: definitions.map((def) => ({
        key: def.key as PermissionKey,
        label: def.label,
        type: def.type,
        resolved: def.type === 'scope' ? 'all' : true,
        contributions: [],
        conflict: false,
        winningGroups: [],
      })),
    };
  }

  const memberGroups = peopleGroups.filter(
    (g) => g.module === module && assignment.groupIds.includes(g.id),
  );

  const rows = definitions.map((def) => {
    const key = def.key as PermissionKey;
    const contributions: PermissionContribution[] = memberGroups
      .map((group) => ({ groupName: group.name, value: group.permissionSet[key] }))
      .filter((c): c is PermissionContribution => c.value !== undefined);

    let resolved: boolean | ScopeValue | undefined;
    if (def.type === 'scope') {
      resolved = contributions.some((c) => c.value === 'all') ? 'all' : contributions.length > 0 ? 'own' : undefined;
    } else {
      resolved = contributions.some((c) => c.value === true);
    }

    const winningGroups = contributions
      .filter((c) => c.value === resolved)
      .map((c) => c.groupName);

    const values = new Set(contributions.map((c) => String(c.value)));
    const conflict = values.size > 1;

    return { key, label: def.label, type: def.type, resolved, contributions, conflict, winningGroups };
  });

  return { module, source: 'group', rows };
}

function formatValue(type: PermissionDefinition['type'], value: boolean | ScopeValue | undefined): string {
  if (type === 'scope') {
    if (value === 'all') return 'All records';
    if (value === 'own') return 'Own records';
    return '—';
  }
  return value ? 'Enabled' : 'Off';
}

interface EffectivePermissionsPanelProps {
  user: PeopleUserView;
}

export function EffectivePermissionsPanel({ user }: EffectivePermissionsPanelProps) {
  const trails = useMemo(() => {
    const modules: ModuleKey[] =
      user.orgRole === 'super_admin'
        ? (['sell', 'plan', 'make', 'ship', 'book', 'buy', 'control'] as ModuleKey[])
        : user.modules.map((a) => a.module);
    return modules.map((m) => resolveModuleTrail(user, m));
  }, [user]);

  if (trails.length === 0) {
    return null;
  }

  return (
    <Collapsible className="rounded-[var(--shape-lg)] border border-[var(--border)] bg-card p-4">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between text-left text-sm font-medium text-[var(--neutral-800)]"
        >
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[var(--neutral-500)]" />
            Effective permissions
            <span className="text-xs font-normal text-[var(--neutral-500)]">· why</span>
          </span>
          <span className="text-xs text-[var(--neutral-500)]">
            {user.orgRole === 'super_admin'
              ? 'Super admin override'
              : `${trails.length} module${trails.length === 1 ? '' : 's'}`}
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">
        <div className="space-y-3">
          {trails.map((trail) => (
            <ModuleTrailCard key={trail.module} trail={trail} />
          ))}
        </div>
        <p className="mt-3 text-xs text-[var(--neutral-500)]">
          Rules: allow wins over deny; <span className="font-medium">all</span> scope wins over <span className="font-medium">own</span>. There is no explicit deny — to revoke access, remove the user from the group.
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ModuleTrailCard({ trail }: { trail: ModuleTrail }) {
  const meta = moduleColors[trail.module];

  const headerRight = (() => {
    if (trail.source === 'super_admin') {
      return (
        <Badge className="gap-1 rounded-full border-0 bg-[var(--mw-yellow-400)] px-2.5 py-0.5 text-[10px] text-primary-foreground">
          <Crown className="h-3 w-3" /> Super admin
        </Badge>
      );
    }
    if (trail.source === 'lead') {
      return (
        <Badge className="gap-1 rounded-full border-0 bg-[var(--mw-yellow-400)] px-2.5 py-0.5 text-[10px] text-primary-foreground">
          <Crown className="h-3 w-3" /> Lead
        </Badge>
      );
    }
    return null;
  })();

  return (
    <div className="rounded-[var(--shape-lg)] bg-[var(--neutral-100)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.dot }} />
          <span className="text-sm font-medium text-foreground">{moduleLabels[trail.module]}</span>
        </div>
        {headerRight}
      </div>

      {trail.source === 'super_admin' || trail.source === 'lead' ? (
        <p className="text-xs text-[var(--neutral-600)]">
          Full access to every {moduleLabels[trail.module]} feature.
          {trail.source === 'lead' ? ' Granted because the user is lead of this module.' : ' Granted because the user is a platform super admin.'}
        </p>
      ) : (
        <div className="space-y-1.5">
          {trail.rows.map((row) => (
            <PermissionTrailRow key={String(row.key)} row={row} />
          ))}
          {trail.rows.every((r) => r.contributions.length === 0) && (
            <p className="text-xs text-[var(--neutral-500)]">
              No groups assigned in this module — user has no effective permissions here.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function PermissionTrailRow({ row }: { row: PermissionRowTrail }) {
  const hasValue =
    row.type === 'scope' ? row.resolved !== undefined : Boolean(row.resolved);

  return (
    <div className="grid grid-cols-[1fr_auto] items-start gap-3 rounded-md bg-card px-2.5 py-1.5">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-xs font-medium text-[var(--neutral-800)]">{row.label}</p>
          {row.conflict && (
            <AlertTriangle className="h-3 w-3 shrink-0 text-[var(--mw-yellow-500)]" aria-label="Groups disagreed on this permission" />
          )}
        </div>
        {row.contributions.length > 0 && (
          <p className="mt-0.5 text-[11px] text-[var(--neutral-500)]">
            <Users className="mr-1 inline h-3 w-3 align-[-2px]" />
            {row.contributions.map((c, i) => (
              <span key={c.groupName}>
                <span
                  className={cn(
                    row.winningGroups.includes(c.groupName) && hasValue
                      ? 'font-medium text-[var(--neutral-800)]'
                      : 'text-[var(--neutral-500)] line-through decoration-[var(--neutral-300)]',
                  )}
                >
                  {c.groupName}
                  {row.type === 'scope' ? ` (${c.value})` : c.value === true ? ' ✓' : ' ·'}
                </span>
                {i < row.contributions.length - 1 && <span className="text-[var(--neutral-400)]">, </span>}
              </span>
            ))}
          </p>
        )}
      </div>
      <span
        className={cn(
          'shrink-0 rounded-full px-2 py-0.5 text-[11px]',
          hasValue
            ? 'bg-[var(--mw-yellow-50,theme(colors.yellow.100))] text-[var(--neutral-800)]'
            : 'bg-[var(--neutral-200)] text-[var(--neutral-500)]',
        )}
      >
        {formatValue(row.type, row.resolved)}
      </span>
    </div>
  );
}

// Re-export so other surfaces can reuse the resolver if needed.
export { resolveModuleTrail, isScopePermissionKey };
