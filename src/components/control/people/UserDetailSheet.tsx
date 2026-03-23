import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { moduleLabels, mockActivity, mockGroups } from './mock-data';
import { ModuleAccessCard, UnassignedModuleCard } from './ModuleAccessCard';
import type { ModuleKey, User } from './types';

interface UserDetailSheetProps {
  user: User | null;
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-[520px] overflow-y-auto rounded-l-2xl border-l border-[var(--border)] bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:max-w-[520px]"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="sr-only">User details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-white shadow-md">
              <AvatarFallback className="bg-[#F5F5F5] text-base font-semibold text-[#2C2C2C]">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h3 className="text-2xl font-bold text-[#1A2732]">{user.name}</h3>
                <Badge
                  className={
                    user.role === 'lead'
                      ? 'rounded-full border-0 bg-[#FFCF4B] px-3 py-1 text-[#2C2C2C]'
                      : 'rounded-full border-0 bg-[#F5F5F5] px-3 py-1 text-[#525252]'
                  }
                >
                  {user.role === 'lead' && user.leadModule
                    ? `Lead — ${moduleLabels[user.leadModule]}`
                    : 'Team'}
                </Badge>
              </div>
              <p className="text-sm text-[#525252]">{user.email}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-[#737373]">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    user.status === 'active'
                      ? 'bg-[#1A2732]'
                      : user.status === 'invited'
                        ? 'bg-[#0A7AFF]'
                        : 'bg-[#737373]'
                  }`}
                />
                <span className="capitalize">{user.status}</span>
                <span>•</span>
                <span>Last active: {user.lastActive}</span>
              </div>
            </div>
          </div>

          <div className="border-b border-[#F5F5F5]" />

          <div className="space-y-4">
            {user.modules.map(assignment => (
              <ModuleAccessCard key={assignment.module} user={user} assignment={assignment} groups={mockGroups} />
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium tracking-wider text-[#737373] uppercase">Other modules</p>
            <div className="space-y-2">
              {unassigned.map(moduleKey => (
                <UnassignedModuleCard key={moduleKey} moduleKey={moduleKey} />
              ))}
            </div>
          </div>

          <Collapsible className="rounded-2xl border border-[var(--border)] bg-white p-4">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="h-10 w-full justify-between rounded-xl px-0 text-left text-sm font-medium text-[#2C2C2C]"
              >
                Activity log
                <ChevronDown className="h-4 w-4 text-[#737373]" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="space-y-3">
                {mockActivity.map(item => (
                  <div key={item.id} className="relative flex gap-3 pl-1">
                    <div className="relative flex flex-col items-center">
                      <Avatar className="h-6 w-6 ring-1 ring-white">
                        <AvatarFallback className="bg-[#F5F5F5] text-[10px] text-[#525252]">
                          {initials(item.actorName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="mt-1 h-8 w-0.5 bg-[#E5E5E5]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[#2C2C2C]">{item.message}</p>
                      <p className="text-xs text-[#737373]">{item.timestamp}</p>
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
