import React from 'react';
import { ChevronDown, Crown, Shield } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { moduleLabels, mockActivity, peopleGroups, type PeopleUserView } from './people-data';
import { ModuleAccessCard, UnassignedModuleCard } from './ModuleAccessCard';
import { EffectivePermissionsPanel } from './EffectivePermissionsPanel';
import type { ModuleKey } from '@mirrorworks/contracts';

interface UserDetailSheetProps {
  user: PeopleUserView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const allModules: ModuleKey[] = ['sell', 'plan', 'make', 'ship', 'book', 'buy', 'control'];

const initials = (name: string) =>
  name
    .split(' ')
    .map(part => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2);

export function UserDetailSheet({ user, open, onOpenChange }: UserDetailSheetProps) {
  if (!user) {
    return null;
  }

  const assignedModules = new Set(user.modules.map(item => item.module));
  const unassigned = allModules.filter(moduleKey => !assignedModules.has(moduleKey));
  const leadModules = user.modules.filter(item => item.isLead).map(item => item.module);
  const isSuperAdmin = user.orgRole === 'super_admin';
  const isDeactivated = user.status === 'inactive';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-[520px] overflow-y-auto rounded-l-[var(--shape-lg)] border-l border-[var(--border)] bg-white/95 dark:bg-card/95 p-6 shadow-2xl backdrop-blur-xl sm:max-w-[520px]"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="sr-only">User details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-white dark:ring-card shadow-md">
              <AvatarFallback className="bg-[var(--neutral-100)] text-base font-medium text-[var(--neutral-800)]">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h3 className="text-2xl font-bold text-foreground">{user.name}</h3>
                <Badge
                  className={
                    user.displayRole === 'lead'
                      ? 'rounded-full border-0 bg-[var(--mw-yellow-400)] px-3 py-1 text-primary-foreground'
                      : 'rounded-full border-0 bg-[var(--neutral-100)] px-3 py-1 text-[var(--neutral-600)]'
                  }
                >
                  {user.displayRole === 'lead' && user.leadModule
                    ? `Lead — ${moduleLabels[user.leadModule]}`
                    : 'Team'}
                </Badge>
              </div>
              <p className="text-sm text-[var(--neutral-600)]">{user.email}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-[var(--neutral-500)]">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    user.status === 'active'
                      ? 'bg-[var(--mw-mirage)]'
                      : user.status === 'pending'
                        ? 'bg-[var(--mw-blue)]'
                        : 'bg-[var(--neutral-500)]'
                  }`}
                />
                <span>{user.status === 'pending' ? 'Invited' : user.status === 'inactive' ? 'Deactivated' : 'Active'}</span>
                <span>•</span>
                <span>Last active: {user.lastActive}</span>
              </div>
            </div>
          </div>

          <div className="border-b border-[var(--neutral-100)]" />

          {isDeactivated && (
            <div className="rounded-[var(--shape-lg)] border border-dashed border-[var(--neutral-300)] bg-[var(--neutral-100)] p-4 text-sm text-[var(--neutral-600)]">
              This user is deactivated. They hold no effective permissions in any module until reactivated.
            </div>
          )}

          {!isDeactivated && (isSuperAdmin || leadModules.length > 0) && (
            <div className="rounded-[var(--shape-lg)] border border-[var(--mw-yellow-400)]/40 bg-[var(--mw-yellow-50,theme(colors.yellow.50))] p-4">
              <div className="flex items-start gap-3">
                {isSuperAdmin ? (
                  <Shield className="mt-0.5 h-5 w-5 shrink-0 text-[var(--mw-yellow-500)]" />
                ) : (
                  <Crown className="mt-0.5 h-5 w-5 shrink-0 text-[var(--mw-yellow-500)]" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {isSuperAdmin
                      ? 'Platform super admin — full access to every module'
                      : leadModules.length === 1
                        ? `Module lead — full access in ${moduleLabels[leadModules[0]]}`
                        : `Module lead in ${leadModules.map(m => moduleLabels[m]).join(', ')}`}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--neutral-600)]">
                    {isSuperAdmin
                      ? 'Group memberships are ignored while this flag is active — every permission is granted.'
                      : 'Group memberships are ignored for the module(s) they lead — every permission in that module is granted.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isDeactivated && <EffectivePermissionsPanel user={user} />}

          <div className="space-y-4">
            {user.modules.map(assignment => (
              <ModuleAccessCard key={assignment.module} user={user} assignment={assignment} groups={peopleGroups} />
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium tracking-wider text-[var(--neutral-500)] uppercase">Other modules</p>
            <div className="space-y-2">
              {unassigned.map(moduleKey => (
                <UnassignedModuleCard key={moduleKey} moduleKey={moduleKey} />
              ))}
            </div>
          </div>

          <Collapsible className="rounded-[var(--shape-lg)] border border-[var(--border)] bg-card p-4">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="h-10 w-full justify-between px-0 text-left text-sm font-medium text-[var(--neutral-800)]"
              >
                Activity log
                <ChevronDown className="h-4 w-4 text-[var(--neutral-500)]" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="space-y-3">
                {mockActivity.map(item => (
                  <div key={item.id} className="relative flex gap-3 pl-1">
                    <div className="relative flex flex-col items-center">
                      <Avatar className="h-6 w-6 ring-1 ring-white dark:ring-card">
                        <AvatarFallback className="bg-[var(--neutral-100)] text-[10px] text-[var(--neutral-600)]">
                          {initials(item.actorName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="mt-1 h-8 w-0.5 bg-[var(--neutral-200)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--neutral-800)]">{item.message}</p>
                      <p className="text-xs text-[var(--neutral-500)]">{item.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </SheetContent>
    </Sheet>
  );
}
