/**
 * MobileMenu — Full-screen mobile navigation overlay
 *
 * Opens from the "More" hamburger in MobileBottomNav.
 * Shows complete navigation: all modules with sub-items, user profile, theme toggle.
 * Animated slide-up with backdrop.
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import {
  X,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Bell,
  User,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { MODULE_ICONS, ICON_SIZES } from '@/lib/icon-config';
import { useTheme } from '@/components/theme-provider';
import { ThemeToggler } from '@/components/animate-ui/primitives/effects/theme-toggler';
import { mockUserContext, getUserInitials } from '@/lib/mock-user-context';
import { NotificationBell } from '@/components/shared/notifications/NotificationBell';
import mirrorworksLogomark from '@/art/empty-states/logo/mirrorworks_logomark.svg';

type AnimatedIconComponent = React.ComponentType<{
  size?: number;
  animateOnHover?: boolean;
  className?: string;
}>;

interface SubMenuItem {
  label: string;
  path: string;
}

interface SubMenuGroup {
  heading: string;
  items: SubMenuItem[];
}

interface MobileMenuItem {
  label: string;
  icon?: LucideIcon;
  animatedIcon?: AnimatedIconComponent;
  path?: string;
  subItems?: SubMenuItem[];
  groupedSubItems?: SubMenuGroup[];
  section?: string;
}

const menuConfig: MobileMenuItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  {
    label: 'Sell', animatedIcon: MODULE_ICONS.sell, section: 'Operations',
    subItems: [
      { label: 'Dashboard', path: '/sell' },
      { label: 'CRM', path: '/sell/crm' },
      { label: 'Opportunities', path: '/sell/opportunities' },
      { label: 'Orders', path: '/sell/orders' },
      { label: 'Quotes', path: '/sell/quotes' },
      { label: 'Customer portal', path: '/sell/portal' },
      { label: 'Activities', path: '/sell/activities' },
      { label: 'Invoices', path: '/sell/invoices' },
      { label: 'Products', path: '/sell/products' },
      { label: 'Settings', path: '/sell/settings' },
    ],
  },
  {
    label: 'Buy', animatedIcon: MODULE_ICONS.buy,
    subItems: [
      { label: 'Dashboard', path: '/buy' },
      { label: 'Orders', path: '/buy/orders' },
      { label: 'Requisitions', path: '/buy/requisitions' },
      { label: 'Suppliers', path: '/buy/suppliers' },
      { label: 'MRP suggestions', path: '/buy/mrp-suggestions' },
      { label: 'Planning grid', path: '/buy/planning-grid' },
      { label: 'Vendor comparison', path: '/buy/vendor-comparison' },
      { label: 'Reorder rules', path: '/buy/reorder-rules' },
      { label: 'Products', path: '/buy/products' },
      { label: 'Settings', path: '/buy/settings' },
    ],
  },
  {
    label: 'Plan', animatedIcon: MODULE_ICONS.plan,
    subItems: [
      { label: 'Dashboard', path: '/plan' },
      { label: 'Jobs', path: '/plan/jobs' },
      { label: 'Schedule', path: '/plan/schedule' },
      { label: 'What-if', path: '/plan/what-if' },
      { label: 'Nesting', path: '/plan/nesting' },
      { label: 'MRP', path: '/plan/mrp' },
      { label: 'Sheet calculator', path: '/plan/sheet-calculator' },
      { label: 'Products', path: '/plan/products' },
      { label: 'Product Studio', path: '/plan/product-studio' },
      { label: 'Settings', path: '/plan/settings' },
    ],
  },
  {
    label: 'Make', animatedIcon: MODULE_ICONS.make,
    subItems: [
      { label: 'Dashboard', path: '/make' },
      { label: 'Shop Floor', path: '/make/shop-floor' },
      { label: 'Manufacturing Orders', path: '/make/manufacturing-orders' },
      { label: 'Scan station', path: '/make/scan' },
      { label: 'Scrap analysis', path: '/make/scrap-analysis' },
      { label: 'CAPA', path: '/make/capa' },
      { label: 'Schedule', path: '/make/schedule' },
      { label: 'Quality', path: '/make/quality' },
      { label: 'Settings', path: '/make/settings' },
    ],
  },
  {
    label: 'Ship', animatedIcon: MODULE_ICONS.ship,
    subItems: [
      { label: 'Dashboard', path: '/ship' },
      { label: 'Orders', path: '/ship/orders' },
      { label: 'Tracking', path: '/ship/tracking' },
      { label: 'Carrier rates', path: '/ship/carrier-rates' },
      { label: 'Scan to ship', path: '/ship/scan-to-ship' },
      { label: 'Warehouse', path: '/ship/warehouse' },
    ],
  },
  {
    label: 'Book', animatedIcon: MODULE_ICONS.book,
    subItems: [
      { label: 'Dashboard', path: '/book' },
      { label: 'Invoices', path: '/book/invoices' },
      { label: 'Expenses', path: '/book/expenses' },
      { label: 'WIP valuation', path: '/book/wip' },
      { label: 'Cost variance', path: '/book/cost-variance' },
      { label: 'Reports', path: '/book/reports' },
      { label: 'Settings', path: '/book/settings' },
    ],
  },
  {
    label: 'Control', animatedIcon: MODULE_ICONS.control, section: 'Settings',
    subItems: [
      { label: 'Dashboard', path: '/control' },
      { label: 'Factory Designer', path: '/control/factory-layout' },
      { label: 'Process Builder', path: '/control/process-builder' },
      { label: 'Machines', path: '/control/machines' },
      { label: 'People', path: '/control/people' },
      { label: 'Shifts', path: '/control/shifts' },
      { label: 'Maintenance', path: '/control/maintenance' },
      { label: 'Tooling', path: '/control/tooling' },
      { label: 'Documents', path: '/control/documents' },
    ],
  },
];

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const location = useLocation();
  const { resolvedTheme, setTheme } = useTheme();
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  // Close menu on route change
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  function isActiveRoute(path: string): boolean {
    return location.pathname === path;
  }

  function getActiveModule(): string | null {
    for (const item of menuConfig) {
      const subs = item.subItems || (item.groupedSubItems?.flatMap(g => g.items) ?? []);
      for (const sub of subs) {
        if (location.pathname === sub.path || location.pathname.startsWith(sub.path + '/')) {
          return item.label;
        }
      }
    }
    return null;
  }

  // Auto-expand the active module when the menu opens
  useEffect(() => {
    if (open) {
      setExpandedModule(getActiveModule());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const initials = getUserInitials(mockUserContext.displayName);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative flex flex-1 flex-col bg-[var(--neutral-50)] dark:bg-[var(--neutral-50)] animate-in slide-in-from-bottom duration-300 overflow-hidden"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--neutral-200)] dark:border-[var(--neutral-700)]">
          <div className="flex items-center gap-2.5">
            <img
              src={mirrorworksLogomark}
              alt=""
              className="h-8 w-8 shrink-0 object-contain"
              aria-hidden
            />
            <p className="text-base font-bold tracking-tight text-foreground">
              Alliance Metal
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-[var(--neutral-200)] dark:hover:bg-[var(--neutral-700)] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Scrollable nav content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1" style={{ scrollbarWidth: 'none' }}>
          {menuConfig.map((item) => {
            const hasSubItems = !!(item.subItems?.length || item.groupedSubItems?.length);
            const isExpanded = expandedModule === item.label;
            const isActive = item.path ? isActiveRoute(item.path) : isExpanded;

            return (
              <React.Fragment key={item.label}>
                {item.section && (
                  <div className="pt-4 pb-1.5 px-2 first:pt-0">
                    <span className="text-xs font-medium uppercase tracking-wider text-[var(--neutral-400)]">
                      {item.section}
                    </span>
                  </div>
                )}

                {item.path && !hasSubItems ? (
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-2xl min-h-[48px]',
                      'transition-colors duration-150',
                      isActive
                        ? 'bg-[var(--mw-mirage)] text-white'
                        : 'text-foreground active:bg-[var(--neutral-200)] dark:active:bg-[var(--neutral-700)]'
                    )}
                  >
                    <div className="bg-[var(--mw-mirage)] p-2 rounded-xl">
                      {item.icon ? (
                        <item.icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                      ) : item.animatedIcon ? (
                        <item.animatedIcon size={ICON_SIZES.sidebar} className="text-white" />
                      ) : null}
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                    <ChevronRight className="ml-auto w-4 h-4 text-[var(--neutral-400)]" />
                  </Link>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => setExpandedModule(prev => prev === item.label ? null : item.label)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-3 rounded-2xl min-h-[48px]',
                        'transition-colors duration-150',
                        isExpanded
                          ? 'bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)]'
                          : 'active:bg-[var(--neutral-200)] dark:active:bg-[var(--neutral-700)]'
                      )}
                    >
                      <div className="bg-[var(--mw-mirage)] p-2 rounded-xl">
                        {item.icon ? (
                          <item.icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                        ) : item.animatedIcon ? (
                          <item.animatedIcon size={ICON_SIZES.sidebar} className="text-white" />
                        ) : null}
                      </div>
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                      <ChevronRight
                        className={cn(
                          'ml-auto w-4 h-4 text-[var(--neutral-400)] transition-transform duration-200',
                          isExpanded && 'rotate-90'
                        )}
                      />
                    </button>

                    {/* Sub-items */}
                    {isExpanded && item.subItems && (
                      <div className="ml-8 mt-1 mb-2 flex flex-col gap-0.5">
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            className={cn(
                              'flex items-center px-4 py-3 rounded-xl min-h-[44px] text-sm',
                              'transition-colors duration-150',
                              isActiveRoute(sub.path)
                                ? 'bg-[var(--mw-mirage)] text-white font-medium'
                                : 'text-foreground active:bg-[var(--neutral-200)] dark:active:bg-[var(--neutral-700)]'
                            )}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--neutral-200)] dark:border-[var(--neutral-700)] px-4 py-3 space-y-3">
          {/* User + theme + notifications */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--mw-mirage)] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{mockUserContext.displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{mockUserContext.role}</p>
            </div>
            <NotificationBell />
            <ThemeToggler
              resolvedTheme={resolvedTheme}
              setTheme={setTheme}
              direction="btt"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-[var(--neutral-200)] dark:hover:bg-[var(--neutral-700)]"
              iconClassName="h-5 w-5 text-foreground"
            />
          </div>
          {/* Quick links */}
          <div className="flex items-center gap-2">
            <Link
              to="/control/people"
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-border text-sm text-foreground hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-800)] transition-colors"
              onClick={onClose}
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
            <Link
              to="/notifications"
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-border text-sm text-foreground hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-800)] transition-colors"
              onClick={onClose}
            >
              <Bell className="w-4 h-4" />
              Notifications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
