/**
 * ModuleLeadRow — Module Lead assignment surface for module Settings → Access.
 *
 * Per ARCH 00 §2, each module has exactly one Lead (the `is_lead` flag on
 * module_assignments). The Lead has full access to that module and is outside
 * the group system. Only a Super Admin may swap the Lead.
 *
 * This is a sibling surface to the per-person "Make Lead" action in
 * Control → People → user drawer (ModuleAccessCard). Both write to the same
 * underlying `is_lead` flag.
 */

import React from 'react';
import { toast } from 'sonner';
import { Crown } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { peopleUsers } from '@/components/control/people/people-data';
import { controlPeopleAuthState } from '@/components/control/people/people-data';
import type { ModuleKey } from '@mirrorworks/contracts';

function initials(name: string) {
  return name
    .split(' ')
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);
}

interface ModuleLeadRowProps {
  moduleKey: ModuleKey;
  moduleName: string;
}

export function ModuleLeadRow({ moduleKey, moduleName }: ModuleLeadRowProps) {
  const currentLead = peopleUsers.find(user =>
    user.modules.some(assignment => assignment.module === moduleKey && assignment.isLead),
  );
  const candidates = peopleUsers.filter(user => user.status !== 'inactive');
  const isSuperAdmin = controlPeopleAuthState.activeMembership?.orgRole === 'super_admin';

  const handleAssign = (userId: string, userName: string) => {
    if (currentLead?.id === userId) {
      toast(`${userName} is already Lead of ${moduleName}.`);
      return;
    }
    if (currentLead) {
      toast.success(
        `${userName} is now Lead of ${moduleName}. ${currentLead.name} stepped down to Team.`,
      );
    } else {
      toast.success(`${userName} is now Lead of ${moduleName}.`);
    }
  };

  return (
    <Card className="bg-card border border-[var(--mw-yellow-400)]/30 rounded-lg p-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[var(--mw-yellow-400)] flex items-center justify-center shrink-0">
          <Crown className="w-5 h-5 text-[var(--mw-mirage)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Module Lead</span>
            <Badge className="bg-[var(--neutral-100)] text-[var(--neutral-500)] border-0 text-[10px] rounded-full px-2">
              One per module
            </Badge>
          </div>
          <p className="text-xs text-[var(--neutral-500)] mt-0.5">
            Has full access to {moduleName} regardless of group membership. Only Super Admin can change this.
          </p>
        </div>

        {currentLead ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[var(--mw-mirage)] flex items-center justify-center text-white text-xs font-medium shrink-0">
              {initials(currentLead.name)}
            </div>
            <div className="text-right min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{currentLead.name}</div>
              <div className="text-xs text-[var(--neutral-500)] truncate">{currentLead.email}</div>
            </div>
          </div>
        ) : (
          <span className="text-sm text-[var(--neutral-500)] italic">No Lead assigned</span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={!isSuperAdmin}
              className="h-9 border-[var(--border)] bg-card text-[var(--neutral-800)] hover:bg-[var(--neutral-100)]"
            >
              {currentLead ? 'Change' : 'Assign'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="text-xs uppercase tracking-wider text-[var(--neutral-500)] font-medium">
              Assign {moduleName} Lead
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {candidates.map(user => {
              const isCurrent = currentLead?.id === user.id;
              return (
                <DropdownMenuItem
                  key={user.id}
                  onSelect={() => handleAssign(user.id, user.name)}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[var(--mw-mirage)] flex items-center justify-center text-white text-[10px] font-medium shrink-0">
                      {initials(user.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-foreground truncate">{user.name}</div>
                      <div className="text-xs text-[var(--neutral-500)] truncate">{user.email}</div>
                    </div>
                  </div>
                  {isCurrent && (
                    <Badge className="bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] border-0 text-[10px] rounded-full px-2 shrink-0">
                      Current
                    </Badge>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
