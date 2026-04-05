/**
 * NotificationCard — Reusable notification item component.
 *
 * Used in both the popover (compact mode) and the full Notifications page.
 */

import React from 'react';
import { Link } from 'react-router';
import {
  Bell,
  Package,
  FileText,
  DollarSign,
  Clock,
  Truck,
  Factory,
  Settings,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react';
import type { AppNotification, NotificationModule, NotificationType } from '@/store/notificationStore';
import { cn } from '@/components/ui/utils';
import { Badge } from '@/components/ui/badge';

// ---------------------------------------------------------------------------
// Module icon & type style maps
// ---------------------------------------------------------------------------

const MODULE_ICON_MAP: Record<NotificationModule, LucideIcon> = {
  sell: DollarSign,
  buy: Package,
  plan: Clock,
  make: Factory,
  ship: Truck,
  book: FileText,
  control: Settings,
  system: Bell,
};

const TYPE_STYLES: Record<NotificationType, string> = {
  info: 'bg-[var(--neutral-100)] text-[var(--neutral-500)] dark:bg-[var(--neutral-800)] dark:text-[var(--neutral-400)]',
  warning: 'bg-[var(--mw-yellow-400)]/10 text-[var(--mw-yellow-600)] dark:bg-[var(--mw-yellow-400)]/15 dark:text-[var(--mw-yellow-400)]',
  success: 'bg-[var(--mw-green)]/10 text-[var(--mw-green)] dark:bg-[var(--mw-green)]/15',
  error: 'bg-[var(--mw-error)]/10 text-[var(--mw-error)] dark:bg-[var(--mw-error)]/15',
  system: 'bg-[#0052CC]/10 text-[#0052CC] dark:bg-[#0052CC]/15 dark:text-[#4C9AFF]',
};

// ---------------------------------------------------------------------------
// Relative time formatter
// ---------------------------------------------------------------------------

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Date(timestamp).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
  });
}

// ---------------------------------------------------------------------------
// Compact variant — used in the popover
// ---------------------------------------------------------------------------

export function NotificationCardCompact({
  notification,
  onClick,
}: {
  notification: AppNotification;
  onClick?: () => void;
}) {
  const Icon = MODULE_ICON_MAP[notification.module] ?? Bell;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-2.5 p-2 rounded-lg text-left',
        'transition-colors duration-150 hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-800)]',
        !notification.isRead && 'bg-[var(--neutral-50)] dark:bg-[var(--neutral-800)]/50',
      )}
    >
      <div className={cn('w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5', TYPE_STYLES[notification.type])}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className={cn('text-xs text-foreground truncate', !notification.isRead && 'font-medium')}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--mw-yellow-400)] flex-shrink-0" />
          )}
        </div>
        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
          {notification.message}
        </p>
      </div>
      <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0 mt-0.5">
        {formatRelativeTime(notification.timestamp)}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Full variant — used on the Notifications page
// ---------------------------------------------------------------------------

export interface NotificationCardFullProps {
  notification: AppNotification;
  onMarkRead?: () => void;
  onDismiss?: () => void;
  selected?: boolean;
  onSelect?: (checked: boolean) => void;
  showCheckbox?: boolean;
}

export function NotificationCardFull({
  notification,
  onMarkRead,
  onDismiss,
  selected,
  onSelect,
  showCheckbox,
}: NotificationCardFullProps) {
  const Icon = MODULE_ICON_MAP[notification.module] ?? Bell;

  return (
    <div
      className={cn(
        'p-4 flex items-start gap-4 rounded-xl border border-border bg-card transition-colors',
        'hover:bg-[var(--accent)]',
        !notification.isRead && 'border-l-2 border-l-[var(--mw-yellow-400)]',
        selected && 'ring-2 ring-[var(--mw-yellow-400)]/40',
      )}
    >
      {showCheckbox && (
        <div className="flex items-center pt-1">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect?.(e.target.checked)}
            className="w-4 h-4 rounded border-[var(--neutral-300)] text-[var(--mw-yellow-400)] focus:ring-[var(--mw-yellow-400)]/30 cursor-pointer accent-[var(--mw-yellow-400)]"
          />
        </div>
      )}

      <div className={cn('w-9 h-9 rounded-[var(--shape-md)] flex items-center justify-center flex-shrink-0', TYPE_STYLES[notification.type])}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0" onClick={onMarkRead} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onMarkRead?.()}>
        <div className="flex items-center gap-2 mb-0.5">
          <p className={cn('text-sm text-foreground', !notification.isRead && 'font-medium')}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <div className="w-2 h-2 rounded-full bg-[var(--mw-yellow-400)] flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
      </div>

      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
          {formatRelativeTime(notification.timestamp)}
        </span>
        <Badge className="border border-[var(--neutral-200)] dark:border-[var(--neutral-700)] bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] text-[var(--neutral-500)] dark:text-[var(--neutral-400)] text-[10px] capitalize">
          {notification.module}
        </Badge>
        {notification.actionUrl && (
          <Link
            to={notification.actionUrl}
            className="inline-flex items-center gap-1 text-[10px] text-[#0052CC] dark:text-[#4C9AFF] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            View <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
