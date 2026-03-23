import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { moduleColors, moduleLabels, mockUsers } from './mock-data';
import type { Group } from './types';

interface GroupDetailSheetProps {
  group: Group | null;
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
  const members = mockUsers.filter(user => group.members.includes(user.id));
  const moduleMeta = moduleColors[group.module];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-[520px] overflow-y-auto rounded-l-[var(--shape-lg)] border-l border-[var(--border)] bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:max-w-[520px]"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="text-2xl font-bold text-[var(--mw-mirage)]">{group.name}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-5">
          <div className="rounded-[var(--shape-lg)] border border-[var(--border)] bg-[var(--neutral-100)] p-5">
            <p className="text-xs font-medium tracking-wider text-[var(--neutral-500)] uppercase">Module</p>
            <div className="mt-2 inline-flex rounded-full px-3 py-1 text-sm" style={{ backgroundColor: moduleMeta.bg, color: moduleMeta.text }}>
              {moduleLabels[group.module]}
            </div>
            <p className="mt-3 text-sm text-[var(--neutral-600)]">{group.description}</p>
          </div>

          <div className="rounded-[var(--shape-lg)] border border-[var(--border)] bg-white p-5">
            <p className="mb-3 text-xs font-medium tracking-wider text-[var(--neutral-500)] uppercase">Members</p>
            <div className="space-y-2">
              {members.map(member => (
                <div key={member.id} className="flex items-center gap-3 rounded-xl bg-[var(--neutral-100)] p-2">
                  <Avatar className="h-8 w-8 ring-1 ring-white">
                    <AvatarFallback className="bg-[var(--neutral-100)] text-xs text-[var(--neutral-800)]">{initials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-[var(--mw-mirage)]">{member.name}</p>
                    <p className="text-xs text-[var(--neutral-500)]">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
