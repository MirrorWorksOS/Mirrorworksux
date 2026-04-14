/**
 * NotificationBell — Interactive bell icon for the sidebar.
 *
 * Shows an unread count badge (red circle, white number) positioned
 * top-right of the bell icon. Badge pulses briefly when new notifications
 * arrive. Bell icon has a subtle shake/ring animation on new notification.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import { NotificationPopover } from './NotificationPopover';
import { cn } from '@/components/ui/utils';

// ---------------------------------------------------------------------------
// CSS keyframes injected once
// ---------------------------------------------------------------------------

const STYLE_ID = 'mw-notification-bell-animations';

function ensureAnimationStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes mw-bell-ring {
      0% { transform: rotate(0deg); }
      10% { transform: rotate(14deg); }
      20% { transform: rotate(-12deg); }
      30% { transform: rotate(10deg); }
      40% { transform: rotate(-8deg); }
      50% { transform: rotate(6deg); }
      60% { transform: rotate(-4deg); }
      70% { transform: rotate(2deg); }
      80% { transform: rotate(-1deg); }
      100% { transform: rotate(0deg); }
    }

    @keyframes mw-badge-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.25); }
    }

    .mw-bell-ring {
      animation: mw-bell-ring 0.8s ease-in-out;
    }

    .mw-badge-pulse {
      animation: mw-badge-pulse 0.6s ease-in-out 2;
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NotificationBell() {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [bellAnimating, setBellAnimating] = useState(false);
  const [badgePulsing, setBadgePulsing] = useState(false);
  const prevUnreadRef = useRef<number | null>(null);

  const unreadCount = useNotificationStore((s) => s.notifications.filter((n) => !n.isRead).length);
  const hasNewArrival = useNotificationStore((s) => s.hasNewArrival);
  const clearNewArrival = useNotificationStore((s) => s.clearNewArrival);

  // Inject keyframes on mount
  useEffect(() => {
    ensureAnimationStyles();
  }, []);

  // Detect new arrivals and trigger animations
  useEffect(() => {
    if (hasNewArrival) {
      setBellAnimating(true);
      setBadgePulsing(true);
      clearNewArrival();

      const bellTimer = setTimeout(() => setBellAnimating(false), 800);
      const badgeTimer = setTimeout(() => setBadgePulsing(false), 1200);

      return () => {
        clearTimeout(bellTimer);
        clearTimeout(badgeTimer);
      };
    }
  }, [hasNewArrival, clearNewArrival]);

  // Also animate when unread count increases (covers edge cases)
  useEffect(() => {
    if (prevUnreadRef.current !== null && unreadCount > prevUnreadRef.current) {
      setBellAnimating(true);
      setBadgePulsing(true);

      const bellTimer = setTimeout(() => setBellAnimating(false), 800);
      const badgeTimer = setTimeout(() => setBadgePulsing(false), 1200);

      return () => {
        clearTimeout(bellTimer);
        clearTimeout(badgeTimer);
      };
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  const displayCount = unreadCount > 9 ? '9+' : unreadCount.toString();

  return (
    <NotificationPopover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <button
        type="button"
        className={cn(
          'relative flex items-center justify-center w-9 h-9 rounded-full',
          'transition-colors duration-150',
          'hover:bg-[var(--neutral-200)] dark:hover:bg-[var(--neutral-700)]',
          popoverOpen && 'bg-[var(--neutral-200)] dark:bg-[var(--neutral-700)]',
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell
          className={cn(
            'w-4.5 h-4.5 text-foreground',
            bellAnimating && 'mw-bell-ring',
          )}
          strokeWidth={1.5}
        />

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute -top-0.5 -right-0.5 inline-flex items-center justify-center',
              'min-w-[16px] h-[16px] px-[3px] rounded-full',
              'bg-[#DE350B] text-white text-[9px] font-bold leading-none',
              'border-2 border-[var(--neutral-50)] dark:border-[var(--neutral-900)]',
              badgePulsing && 'mw-badge-pulse',
            )}
          >
            {displayCount}
          </span>
        )}
      </button>
    </NotificationPopover>
  );
}
