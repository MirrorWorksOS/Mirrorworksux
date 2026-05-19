/**
 * ChatterButton — header-action trigger for the global ChatterSheet.
 *
 * Ghost / outline by default. When the current thread has unread messages, a
 * small mw-yellow-400 dot appears on the icon (yellow as "thread", per
 * DesignSystem.md §Colour — no full yellow CTA per the "one primary yellow
 * per card" rule).
 */

import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';
import { useChatterFollow } from './useChatterFollow';
import type { ChatterEntityType } from '@/services/chatterService';

export interface ChatterButtonProps {
  entity: { type: ChatterEntityType; id: string };
  className?: string;
  /** Optional label override — default is "Chatter". */
  label?: string;
}

export function ChatterButton({ entity, className, label = 'Chatter' }: ChatterButtonProps) {
  const { unreadCount, open } = useChatterFollow(entity);
  const hasUnread = unreadCount > 0;

  return (
    <Button
      variant="outline"
      className={cn('h-12 border-[var(--border)] relative', className)}
      onClick={open}
      aria-label={hasUnread ? `${label} — ${unreadCount} unread` : label}
    >
      <span className="relative mr-2 inline-flex">
        <MessageSquare className="h-4 w-4" strokeWidth={1.5} />
        {hasUnread && (
          <span
            aria-hidden
            className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[var(--mw-yellow-400)] ring-2 ring-[var(--card)]"
          />
        )}
      </span>
      {label}
      {hasUnread && (
        <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--neutral-100)] px-1 text-[10px] font-medium tabular-nums text-foreground">
          {unreadCount}
        </span>
      )}
    </Button>
  );
}
