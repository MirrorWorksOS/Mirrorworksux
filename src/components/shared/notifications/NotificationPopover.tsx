/**
 * NotificationPopover — Compact popover showing latest 5 notifications.
 *
 * Triggered by clicking the NotificationBell in the sidebar.
 * Includes "Mark All Read" header action and "View All" footer link.
 */

import React from 'react';
import { Link } from 'react-router';
import { CheckCheck, ArrowRight } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { NotificationCardCompact } from './NotificationCard';
import { cn } from '@/components/ui/utils';

interface NotificationPopoverProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationPopover({
  children,
  open,
  onOpenChange,
}: NotificationPopoverProps) {
  const notifications = useNotificationStore((s) => s.notifications);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const markAsRead = useNotificationStore((s) => s.markAsRead);

  const latest = notifications.slice(0, 5);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.preventDefault();
    markAllAsRead();
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="end"
        sideOffset={8}
        className="w-80 p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--mw-error)] text-white text-[10px] font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <CheckCheck className="w-3 h-3" />
              Mark all read
            </button>
          )}
        </div>

        {/* Notification list */}
        <div className="max-h-[320px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {latest.length > 0 ? (
            <div className="p-1.5 space-y-0.5">
              {latest.map((n) => (
                <NotificationCardCompact
                  key={n.id}
                  notification={n}
                  onClick={() => handleNotificationClick(n.id)}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">All caught up</p>
              <p className="text-xs text-muted-foreground/70 mt-1">No notifications yet</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {latest.length > 0 && (
          <div className="border-t border-border">
            <Link
              to="/notifications"
              onClick={() => onOpenChange(false)}
              className={cn(
                'flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium',
                'text-muted-foreground hover:text-foreground hover:bg-[var(--neutral-50)] dark:hover:bg-[var(--neutral-800)]',
                'transition-colors',
              )}
            >
              View all notifications
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
