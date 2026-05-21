/**
 * AssigneeChip — uniform display for an Assignee.
 *
 * Reused by TemplateEditor, TemplatesPanel, KickoffDialog, and (eventually)
 * JobActivity rows once `assignedTo` widens from `string` to `Assignee`.
 *
 * The chip carries a small kind glyph (User / Users / Cog) so the source of
 * the assignment is unambiguous at a glance.
 */

import { Cog, User, Users } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import type { Assignee, AssigneeKind } from '@/types/job-activity';

const ICON_BY_KIND = {
  user: User,
  team: Users,
  machine: Cog,
} as const satisfies Record<AssigneeKind, typeof User>;

const TONE_BY_KIND: Record<AssigneeKind, string> = {
  user: 'bg-[var(--mw-info-light)] text-[var(--mw-info)]',
  team: 'bg-[var(--mw-yellow-50)] text-[var(--mw-yellow-800)] dark:text-yellow-300',
  machine: 'bg-[var(--neutral-100)] text-[var(--neutral-700)] dark:text-neutral-300',
};

interface AssigneeChipProps {
  assignee: Assignee;
  size?: 'sm' | 'md';
  className?: string;
}

export function AssigneeChip({ assignee, size = 'sm', className }: AssigneeChipProps) {
  const Icon = ICON_BY_KIND[assignee.kind];
  const dims = size === 'sm' ? 'h-5 px-1.5 gap-1 text-[10px]' : 'h-6 px-2 gap-1.5 text-xs';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium whitespace-nowrap',
        dims,
        TONE_BY_KIND[assignee.kind],
        className,
      )}
      title={`${assignee.kind}: ${assignee.label}`}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} strokeWidth={2} />
      <span className="truncate max-w-[12rem]">{assignee.label}</span>
    </span>
  );
}
