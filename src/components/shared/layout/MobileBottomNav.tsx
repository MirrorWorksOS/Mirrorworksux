/**
 * MobileBottomNav — Bottom tab bar for mobile viewports (< 768px)
 *
 * Shows 5 primary module icons + a hamburger "More" button.
 * Active tab highlighted with MW Yellow. Fixed to bottom with safe-area-inset padding.
 * 56px height above safe area. Touch targets are 44x44px minimum.
 */

import React from 'react';
import { Link, useLocation } from 'react-router';
import { LayoutDashboard, Menu, type LucideIcon } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { MODULE_ICONS } from '@/lib/icon-config';

type AnimatedIconComponent = React.ComponentType<{
  size?: number;
  animateOnHover?: boolean;
  className?: string;
}>;

interface TabItem {
  label: string;
  path: string;
  icon?: LucideIcon;
  animatedIcon?: AnimatedIconComponent;
}

const BOTTOM_TABS: TabItem[] = [
  { label: 'Home', path: '/', icon: LayoutDashboard },
  { label: 'Sell', path: '/sell', animatedIcon: MODULE_ICONS.sell },
  { label: 'Plan', path: '/plan', animatedIcon: MODULE_ICONS.plan },
  { label: 'Make', path: '/make', animatedIcon: MODULE_ICONS.make },
  { label: 'Ship', path: '/ship', animatedIcon: MODULE_ICONS.ship },
];

interface MobileBottomNavProps {
  onMenuOpen: () => void;
}

export function MobileBottomNav({ onMenuOpen }: MobileBottomNavProps) {
  const location = useLocation();

  function isActive(path: string): boolean {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 border-t border-[var(--neutral-200)] dark:border-[var(--neutral-700)] bg-[var(--neutral-50)] dark:bg-[var(--neutral-50)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-14">
        {BOTTOM_TABS.map((tab) => {
          const active = isActive(tab.path);
          const AnimIcon = tab.animatedIcon;
          const StaticIcon = tab.icon;

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] px-2 py-1',
                'transition-colors duration-150',
                active
                  ? 'text-[var(--mw-yellow-600)] dark:text-[var(--mw-yellow-400)]'
                  : 'text-[var(--neutral-500)] dark:text-[var(--neutral-400)]'
              )}
            >
              <span
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-150',
                  active && 'bg-[var(--mw-yellow-400)]/15 dark:bg-[var(--mw-yellow-400)]/20'
                )}
              >
                {AnimIcon ? (
                  <AnimIcon
                    size={20}
                    className={cn(
                      active
                        ? 'text-[var(--mw-yellow-600)] dark:text-[var(--mw-yellow-400)]'
                        : 'text-current'
                    )}
                  />
                ) : StaticIcon ? (
                  <StaticIcon
                    className={cn(
                      'w-5 h-5',
                      active
                        ? 'text-[var(--mw-yellow-600)] dark:text-[var(--mw-yellow-400)]'
                        : 'text-current'
                    )}
                    strokeWidth={1.5}
                  />
                ) : null}
              </span>
              <span className="text-[10px] font-medium leading-none">
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* More / hamburger button */}
        <button
          type="button"
          onClick={onMenuOpen}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px] px-2 py-1',
            'text-[var(--neutral-500)] dark:text-[var(--neutral-400)]',
            'transition-colors duration-150 active:text-foreground'
          )}
        >
          <span className="flex items-center justify-center w-8 h-8">
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <span className="text-[10px] font-medium leading-none">More</span>
        </button>
      </div>
    </nav>
  );
}
