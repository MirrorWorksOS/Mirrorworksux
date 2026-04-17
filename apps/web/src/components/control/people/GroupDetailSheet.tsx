import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/components/ui/utils';
import { moduleColors, moduleLabels, peopleUsers, type PeopleGroupView } from './people-data';

interface GroupDetailSheetProps {
  group: PeopleGroupView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initials = (name: string) =>
  name
    .split(' ')
    .map(part => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2);

export function GroupDetailSheet({ group, open, onOpenChange }: GroupDetailSheetProps) {
  if (!group) return null;
  const members = peopleUsers.filter(user => group.memberIds.includes(user.id));
  const moduleMeta = moduleColors[group.module];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-[520px] overflow-y-auto rounded-l-[var(--shape-lg)] border-l border-[var(--border)] bg-white/95 dark:bg-card/95 p-6 shadow-2xl backdrop-blur-xl sm:max-w-[520px]"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="text-2xl font-bold text-foreground">{group.name}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-5">
          <div className="rounded-[var(--shape-lg)] border border-[var(--border)] bg-[var(--neutral-100)] p-6">
            <p className="text-xs font-medium tracking-wider text-[var(--neutral-500)] uppercase">Module</p>
            <div className="mt-2 inline-flex rounded-full px-3 py-1 text-sm" style={{ backgroundColor: moduleMeta.bg, color: moduleMeta.text }}>
              {moduleLabels[group.module]}
            </div>
            <p className="mt-3 text-sm text-[var(--neutral-600)]">{group.description}</p>
          </div>

          <div className="rounded-[var(--shape-lg)] border border-[var(--border)] bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-medium tracking-wider text-[var(--neutral-500)] uppercase">Members</p>
              {members.some(m => m.status === 'inactive') && (
                <p className="text-[11px] text-[var(--neutral-500)]">
                  Deactivated members receive no permissions from this group.
                </p>
              )}
            </div>
            <div className="space-y-2">
              {members.map(member => {
                const inactive = member.status === 'inactive';
                const pending = member.status === 'pending';
                return (
                  <div
                    key={member.id}
                    className={cn(
                      'flex items-center gap-3 rounded-xl bg-[var(--neutral-100)] p-2',
                      inactive && 'opacity-50',
                    )}
                  >
                    <Avatar className="h-8 w-8 ring-1 ring-white dark:ring-card">
                      <AvatarFallback className="bg-[var(--neutral-100)] text-xs text-[var(--neutral-800)]">{initials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-sm text-foreground', inactive && 'line-through decoration-[var(--neutral-400)]')}>
                        {member.name}
                      </p>
                      <p className="text-xs text-[var(--neutral-500)]">{member.email}</p>
                    </div>
                    {inactive && (
                      <Badge variant="secondary" className="shrink-0 text-[10px]">Deactivated</Badge>
                    )}
                    {pending && (
                      <Badge variant="outline" className="shrink-0 text-[10px]">Invited</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
