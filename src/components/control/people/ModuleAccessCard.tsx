import React, { useMemo, useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
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
import type { Group, GroupPermissionSet, ModuleAssignment, ModuleKey, User } from './types';

interface ModuleAccessCardProps {
  user: User;
  assignment: ModuleAssignment;
  groups: Group[];
}

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
  const grantedBy: Record<keyof GroupPermissionSet, string[]> = {
    'documents.scope': [],
    'quotes.create': [],
    'orders.create': [],
    'jobs.assign': [],
    'quality.approve': [],
    'maintenance.schedule': [],
    'reports.access': [],
    'settings.access': [],
  };

  const resolved = { ...defaultResolved };

  groupRecords.forEach(group => {
    (Object.keys(group.permissions) as Array<keyof GroupPermissionSet>).forEach(key => {
      const value = group.permissions[key];
      if (key === 'documents.scope') {
        if (value === 'all' || resolved[key] === 'all') {
          resolved[key] = 'all';
        }
      } else if (value) {
        resolved[key] = true;
      }
      if ((key === 'documents.scope' && value === 'all') || (key !== 'documents.scope' && value)) {
        grantedBy[key].push(group.name);
      }
    });
  });

  return { resolved, grantedBy };
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
    <div className="rounded-2xl bg-[#F8F7F4] p-5">
      <div className="flex gap-4">
        <div className="w-1 rounded-full" style={{ backgroundColor: moduleMeta.dot }} />
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-semibold text-[#0A0A0A]">{moduleLabels[moduleKey]}</h4>
            <Badge
              className="rounded-full border-0 px-2.5 py-0.5 text-xs"
              style={{ backgroundColor: moduleMeta.bg, color: moduleMeta.text }}
            >
              {moduleLabels[moduleKey]}
            </Badge>
          </div>
          {isLeadForModule ? (
            <p className="text-sm text-[#737373]">Full access to all {moduleLabels[moduleKey]} features.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {assignment.groups.map(group => (
                <button
                  key={group}
                  type="button"
                  className="rounded-full border border-[#E5E5E5] bg-white px-2.5 py-1 text-xs text-[#525252] transition-colors hover:bg-[#F5F5F5]"
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
                className="flex items-center gap-2 text-sm font-medium text-[#2C2C2C] hover:text-[#0A0A0A]"
              >
                View permissions
                <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <PermissionGrid resolved={resolved} grantedBy={grantedBy} />
            </CollapsibleContent>
          </Collapsible>
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-[#E5E5E5] bg-white px-4 text-[#2C2C2C] hover:bg-[#F5F5F5]"
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
            <Button
              variant="ghost"
              className="h-10 rounded-xl px-4 text-[#737373] hover:bg-[#FEF2F2] hover:text-[#EF4444]"
            >
              Remove from module
            </Button>
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
    <div className="flex items-center justify-between rounded-2xl border border-dashed border-[#E5E5E5] bg-white p-4 opacity-60">
      <span className="text-sm text-[#2C2C2C]">{moduleLabels[moduleKey]}</span>
      <Button variant="outline" className="h-9 rounded-lg border-[#E5E5E5] bg-transparent px-3 text-xs">
        + Assign
      </Button>
    </div>
  );
}
