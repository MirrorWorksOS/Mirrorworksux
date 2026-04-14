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
import { moduleColors, moduleLabels, type PeopleGroupView, type PeopleModuleAssignmentView, type PeopleUserView } from './people-data';
import { mergePermissionSets } from '@/lib/contracts/mappers/permissions';
import type { ModuleKey, PermissionSet } from '@mirrorworks/contracts';

interface ModuleAccessCardProps {
  user: PeopleUserView;
  assignment: PeopleModuleAssignmentView;
  groups: PeopleGroupView[];
}

const defaultResolved: PermissionSet = {
  'documents.scope': 'own',
  'settings.access': false,
  'reports.access': false,
};

function resolvePermissions(groupRecords: PeopleGroupView[]) {
  const grantedBy = groupRecords.reduce<Record<string, string[]>>((acc, group) => {
    for (const [key, value] of Object.entries(group.permissionSet)) {
      if (value === undefined) continue;
      if (!acc[key]) acc[key] = [];
      acc[key].push(group.name);
    }
    return acc;
  }, {});

  return {
    resolved: { ...defaultResolved, ...mergePermissionSets(groupRecords.map(group => group.permissionSet)) },
    grantedBy,
  };
}

export function ModuleAccessCard({ user, assignment, groups }: ModuleAccessCardProps) {
  const [open, setOpen] = useState(false);
  const moduleKey = assignment.module;
  const moduleMeta = moduleColors[moduleKey];
  const groupRecords = useMemo(
    () => groups.filter(group => group.module === moduleKey && assignment.groupIds.includes(group.id)),
    [assignment.groupIds, groups, moduleKey],
  );
  const { resolved, grantedBy } = useMemo(() => resolvePermissions(groupRecords), [groupRecords]);
  const available = groups.filter(group => group.module === moduleKey && !assignment.groupIds.includes(group.id));
  const isLeadForModule = assignment.isLead;

  return (
    <div className="rounded-[var(--shape-lg)] bg-[var(--neutral-100)] p-6">
      <div className="flex gap-4">
        <div className="w-1 rounded-full" style={{ backgroundColor: moduleMeta.dot }} />
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-medium text-foreground">{moduleLabels[moduleKey]}</h4>
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
              {assignment.groupNames.map(group => (
                <button
                  key={group}
                  type="button"
                  className="rounded-full border border-[var(--border)] bg-card px-2.5 py-1 text-xs text-[var(--neutral-600)] transition-colors hover:bg-[var(--neutral-100)]"
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
                className="flex items-center gap-2 text-sm font-medium text-[var(--neutral-800)] hover:text-foreground"
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
                  className="h-10 border-[var(--border)] bg-card px-4 text-[var(--neutral-800)] hover:bg-[var(--neutral-100)]"
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
                  className="h-10 px-4 text-muted-foreground hover:bg-[var(--mw-error-light)] hover:text-destructive"
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
    <div className="flex items-center justify-between rounded-[var(--shape-lg)] border border-dashed border-[var(--border)] bg-card p-4 opacity-60">
      <span className="text-sm text-[var(--neutral-800)]">{moduleLabels[moduleKey]}</span>
      <Button variant="outline" className="h-12 border-[var(--border)] bg-transparent px-3 text-xs">
        + Assign
      </Button>
    </div>
  );
}
