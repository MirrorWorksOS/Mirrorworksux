import React, { useMemo, useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/feedback/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';
import { PermissionGrid } from './PermissionGrid';
import { moduleColors, moduleLabels } from './mock-data';
import type { Group, GroupPermissionSet, ModuleAssignment, ModuleKey, ScopeValue, User } from './types';

interface ModuleAccessCardProps {
  user: User;
  assignment: ModuleAssignment;
  groups: Group[];
}

const SCOPE_KEYS = new Set<string>([
  'documents.scope',
  'pipeline.visibility',
  'workorders.scope',
  'timers.scope',
  'orders.scope',
  'requisitions.scope',
  'expenses.scope',
]);

const defaultResolved: GroupPermissionSet = {
  'documents.scope': 'own',
  'quotes.create': false,
  'orders.create': false,
  'jobs.assign': false,
  'quality.approve': false,
  'maintenance.schedule': false,
  'reports.access': false,
  'settings.access': false,
};

function resolvePermissions(groupRecords: Group[]) {
  const grantedBy: Record<string, string[]> = {};
  const acc: Partial<GroupPermissionSet> = {};

  groupRecords.forEach(group => {
    (Object.entries(group.permissions) as [keyof GroupPermissionSet, unknown][]).forEach(([key, raw]) => {
      if (raw === undefined) return;
      const k = String(key);
      if (!grantedBy[k]) grantedBy[k] = [];

      if (SCOPE_KEYS.has(k)) {
        const v = raw as ScopeValue;
        const prev = acc[key] as ScopeValue | undefined;
        if (v === 'all' || prev === 'all') {
          acc[key] = 'all' as GroupPermissionSet[typeof key];
        } else {
          acc[key] = (v ?? prev ?? 'own') as GroupPermissionSet[typeof key];
        }
        grantedBy[k].push(group.name);
      } else if (typeof raw === 'boolean') {
        if (raw) {
          acc[key] = true as GroupPermissionSet[typeof key];
          grantedBy[k].push(group.name);
        } else if (acc[key] === undefined) {
          acc[key] = false as GroupPermissionSet[typeof key];
        }
      }
    });
  });

  return {
    resolved: { ...defaultResolved, ...acc } as GroupPermissionSet,
    grantedBy,
  };
}

export function ModuleAccessCard({ user, assignment, groups }: ModuleAccessCardProps) {
  const [open, setOpen] = useState(false);
  const moduleKey = assignment.module;
  const moduleMeta = moduleColors[moduleKey];
  const groupRecords = useMemo(
    () => groups.filter(group => group.module === moduleKey && assignment.groups.includes(group.name)),
    [assignment.groups, groups, moduleKey],
  );
  const { resolved, grantedBy } = useMemo(() => resolvePermissions(groupRecords), [groupRecords]);
  const available = groups.filter(group => group.module === moduleKey && !assignment.groups.includes(group.name));
  const isLeadForModule = user.role === 'lead' && user.leadModule === moduleKey;

  return (
    <div className="rounded-[var(--shape-lg)] bg-[var(--neutral-100)] p-6">
      <div className="flex gap-4">
        <div className="w-1 rounded-full" style={{ backgroundColor: moduleMeta.dot }} />
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-medium text-[var(--mw-mirage)]">{moduleLabels[moduleKey]}</h4>
            <Badge
              className="rounded-full border-0 px-2.5 py-0.5 text-xs"
              style={{ backgroundColor: moduleMeta.bg, color: moduleMeta.text }}
            >
              {moduleLabels[moduleKey]}
            </Badge>
          </div>
          {isLeadForModule ? (
            <p className="text-sm text-[var(--neutral-500)]">Full access to all {moduleLabels[moduleKey]} features.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {assignment.groups.map(group => (
                <button
                  key={group}
                  type="button"
                  className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-xs text-[var(--neutral-600)] transition-colors hover:bg-[var(--neutral-100)]"
                >
                  {group}
                </button>
              ))}
            </div>
          )}
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium text-[var(--neutral-800)] hover:text-[var(--mw-mirage)]"
              >
                View permissions
                <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <PermissionGrid module={moduleKey} resolved={resolved} grantedBy={grantedBy} />
            </CollapsibleContent>
          </Collapsible>
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-[var(--border)] bg-white px-4 text-[var(--neutral-800)] hover:bg-[var(--neutral-100)]"
                >
                  <Plus className="h-4 w-4" />
                  Add to group
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {available.length > 0 ? (
                  available.map(group => (
                    <DropdownMenuItem key={group.id}>{group.name}</DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No additional groups</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <ConfirmDialog
              trigger={
                <Button
                  variant="ghost"
                  className="h-10 rounded-xl px-4 text-muted-foreground hover:bg-[var(--mw-error-light)] hover:text-destructive"
                >
                  Remove from module
                </Button>
              }
              title={`Remove from ${moduleLabels[moduleKey]}?`}
              description="This user will lose all permissions for this module. You can re-assign them later."
              confirmLabel="Remove"
              onConfirm={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function UnassignedModuleCard({
  moduleKey,
}: {
  moduleKey: ModuleKey;
}) {
  return (
    <div className="flex items-center justify-between rounded-[var(--shape-lg)] border border-dashed border-[var(--border)] bg-white p-4 opacity-60">
      <span className="text-sm text-[var(--neutral-800)]">{moduleLabels[moduleKey]}</span>
      <Button variant="outline" className="h-12 rounded-[var(--shape-lg)] border-[var(--border)] bg-transparent px-3 text-xs">
        + Assign
      </Button>
    </div>
  );
}
