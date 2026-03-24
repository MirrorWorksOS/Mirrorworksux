/**
 * Sidebar - Main navigation sidebar with all modules
 *
 * Uses Animate UI icons for module identifiers (animateOnHover),
 * Lucide icons for utility elements (Search, Plus, ChevronRight, Settings).
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Settings as SettingsIcon,
  Search,
  Plus,
  ChevronRight,
  type LucideIcon
} from 'lucide-react';
import { cn } from './ui/utils';
import { MODULE_ICONS, ICON_SIZES } from '@/lib/icon-config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SubMenuItem {
  label: string;
  path: string;
}

interface MenuItem {
  label: string;
  icon?: LucideIcon;
  animatedIcon?: React.ComponentType<{ size?: number; animateOnHover?: boolean; className?: string }>;
  path?: string;
  subItems?: SubMenuItem[];
}

// ---------------------------------------------------------------------------
// Menu Configuration
// ---------------------------------------------------------------------------

const menuConfig: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    label: 'Sell',
    animatedIcon: MODULE_ICONS.sell,
    subItems: [
      { label: 'Dashboard', path: '/sell' },
      { label: 'CRM', path: '/sell/crm' },
      { label: 'Opportunities', path: '/sell/opportunities' },
      { label: 'Orders', path: '/sell/orders' },
      { label: 'Invoices', path: '/sell/invoices' },
      { label: 'Products', path: '/sell/products' },
      { label: 'Settings', path: '/sell/settings' },
    ],
  },
  {
    label: 'Buy',
    animatedIcon: MODULE_ICONS.buy,
    subItems: [
      { label: 'Dashboard', path: '/buy' },
      { label: 'Orders', path: '/buy/orders' },
      { label: 'Requisitions', path: '/buy/requisitions' },
      { label: 'Receipts', path: '/buy/receipts' },
      { label: 'Suppliers', path: '/buy/suppliers' },
      { label: 'RFQs', path: '/buy/rfqs' },
      { label: 'Bills', path: '/buy/bills' },
      { label: 'Products', path: '/buy/products' },
      { label: 'Agreements', path: '/buy/agreements' },
      { label: 'Reports', path: '/buy/reports' },
      { label: 'Settings', path: '/buy/settings' },
    ],
  },
  {
    label: 'Plan',
    animatedIcon: MODULE_ICONS.plan,
    subItems: [
      { label: 'Dashboard', path: '/plan' },
      { label: 'Jobs', path: '/plan/jobs' },
      { label: 'Activities', path: '/plan/activities' },
      { label: 'Purchase', path: '/plan/purchase' },
      { label: 'QC Planning', path: '/plan/qc-planning' },
      { label: 'Products', path: '/plan/products' },
      { label: 'Settings', path: '/plan/settings' },
    ],
  },
  {
    label: 'Make',
    animatedIcon: MODULE_ICONS.make,
    subItems: [
      { label: 'Dashboard', path: '/make' },
      { label: 'Schedule', path: '/make/schedule' },
      { label: 'Shop Floor', path: '/make/shop-floor' },
      { label: 'Work', path: '/make/work' },
      { label: 'Issues', path: '/make/issues' },
      { label: 'Settings', path: '/make/settings' },
    ],
  },
  {
    label: 'Ship',
    animatedIcon: MODULE_ICONS.ship,
    subItems: [
      { label: 'Dashboard', path: '/ship' },
      { label: 'Orders', path: '/ship/orders' },
      { label: 'Packaging', path: '/ship/packaging' },
      { label: 'Shipping', path: '/ship/shipping' },
      { label: 'Tracking', path: '/ship/tracking' },
      { label: 'Returns', path: '/ship/returns' },
      { label: 'Warehouse', path: '/ship/warehouse' },
      { label: 'Reports', path: '/ship/reports' },
      { label: 'Settings', path: '/ship/settings' },
    ],
  },
  {
    label: 'Book',
    animatedIcon: MODULE_ICONS.book,
    subItems: [
      { label: 'Dashboard', path: '/book' },
      { label: 'Budget', path: '/book/budget' },
      { label: 'Invoices', path: '/book/invoices' },
      { label: 'Expenses', path: '/book/expenses' },
      { label: 'Purchase Orders', path: '/book/purchases' },
      { label: 'Job Costs', path: '/book/job-costs' },
      { label: 'Stock Valuation', path: '/book/stock-valuation' },
      { label: 'Reports', path: '/book/reports' },
      { label: 'Settings', path: '/book/settings' },
    ],
  },
  {
    label: 'Control',
    animatedIcon: MODULE_ICONS.control,
    subItems: [
      { label: 'Dashboard', path: '/control' },
      { label: 'MirrorWorks Bridge', path: '/control/mirrorworks-bridge' },
      { label: 'Factory designer', path: '/control/factory-layout' },
      { label: 'Process builder', path: '/control/process-builder' },
      { label: 'Locations', path: '/control/locations' },
      { label: 'Machines', path: '/control/machines' },
      { label: 'Inventory', path: '/control/inventory' },
      { label: 'Purchase', path: '/control/purchase' },
      { label: 'People', path: '/control/people' },
      { label: 'Products', path: '/control/products' },
      { label: 'BOMs', path: '/control/boms' },
      { label: 'Role designer', path: '/control/role-designer' },
      { label: 'Workflow designer', path: '/control/workflow-designer' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Animation constants (M3 motion)
// ---------------------------------------------------------------------------

const EXPAND_DURATION = '500ms';
const EXPAND_EASING = 'cubic-bezier(0.2, 0.0, 0, 1.0)';

// ---------------------------------------------------------------------------
// Helper: determine which module owns the current route
// ---------------------------------------------------------------------------

function getActiveModule(pathname: string): string | null {
  for (const item of menuConfig) {
    if (item.subItems) {
      for (const sub of item.subItems) {
        if (pathname === sub.path || pathname.startsWith(sub.path + '/')) {
          return item.label;
        }
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Animated collapsible sub-menu
// ---------------------------------------------------------------------------

function CollapsibleSubMenu({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="grid overflow-hidden"
      style={{
        gridTemplateRows: isOpen ? '1fr' : '0fr',
        transition: `grid-template-rows ${EXPAND_DURATION} ${EXPAND_EASING}`,
      }}
    >
      <div className="min-h-0">
        <div
          className="ml-6 mt-1 space-y-0.5 relative"
          style={{
            opacity: isOpen ? 1 : 0,
            transition: `opacity ${EXPAND_DURATION} ${EXPAND_EASING}`,
          }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-px bg-[var(--border)]" />
          {children}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Icon renderer: Animate UI or Lucide
// ---------------------------------------------------------------------------

function ModuleIcon({
  item,
  isActive,
}: {
  item: MenuItem;
  isActive: boolean;
}) {
  const AnimatedIcon = item.animatedIcon;
  const StaticIcon = item.icon;

  return (
    <div
      className={cn(
        "bg-[var(--mw-mirage)] p-2 rounded-[var(--shape-md)] transition-transform duration-[var(--duration-medium1)] ease-[var(--ease-standard)]",
        "group-hover:scale-110",
        isActive && "ring-2 ring-[var(--mw-yellow-400)]/30",
      )}
    >
      {AnimatedIcon ? (
        <AnimatedIcon
          size={ICON_SIZES.sidebar}
          animateOnHover
          className="text-white"
        />
      ) : StaticIcon ? (
        <StaticIcon className="w-5 h-5 text-white" />
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar component
// ---------------------------------------------------------------------------

export function Sidebar() {
  const location = useLocation();

  const [expandedModule, setExpandedModule] = useState<string | null>(
    () => getActiveModule(location.pathname)
  );

  useEffect(() => {
    const active = getActiveModule(location.pathname);
    if (active && active !== expandedModule) {
      setExpandedModule(active);
    }
  }, [location.pathname]);

  const toggleModule = (label: string) => {
    setExpandedModule(prev => (prev === label ? null : label));
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="bg-[var(--neutral-50)] flex flex-col h-screen w-64 border-r border-[var(--neutral-200)]">
      {/* Header */}
      <div className="p-3">
        <div className="h-[36px] flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 bg-[var(--mw-mirage)] rounded-[var(--shape-md)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">MW</span>
          </div>
          <p className="font-semibold text-base text-foreground">
            Alliance Metal
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-3 space-y-2">
        <button
          type="button"
          className="flex h-12 min-h-[48px] w-full items-center gap-2 rounded-full bg-[var(--mw-yellow-400)] px-4 transition-colors duration-200 hover:bg-[var(--mw-yellow-500)]"
        >
          <Plus className="h-5 w-5 shrink-0 text-[var(--neutral-900)]" strokeWidth={1.5} aria-hidden />
          <span className="text-sm font-medium text-[var(--neutral-900)]">
            Quick Create
          </span>
        </button>
        <button
          type="button"
          className="flex h-12 min-h-[48px] w-full items-center gap-2 rounded-[var(--shape-md)] border border-[var(--border)] bg-white px-3 transition-colors duration-200 hover:bg-[var(--neutral-100)]"
        >
          <Search className="h-5 w-5 shrink-0 text-foreground" strokeWidth={1.5} aria-hidden />
          <span className="text-sm text-muted-foreground">
            Search (Cmd + K)
          </span>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menuConfig.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedModule === item.label;
          const isActive = item.path ? isActiveRoute(item.path) : isExpanded;

          return (
            <div key={item.label} className="w-full">
              {item.path && !hasSubItems ? (
                <Link to={item.path} className="w-full group">
                  <div
                    className={cn(
                      'flex items-center gap-2.5 p-2 rounded-[var(--shape-md)] cursor-pointer',
                      'transition-colors duration-200',
                      isActive ? 'bg-[var(--mw-yellow-50)]' : 'hover:bg-[var(--neutral-100)]'
                    )}
                  >
                    <ModuleIcon item={item} isActive={isActive} />
                    <span className="flex-1 font-medium text-sm text-foreground">
                      {item.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[var(--neutral-400)]" />
                  </div>
                </Link>
              ) : (
                <button
                  onClick={() => hasSubItems && toggleModule(item.label)}
                  className={cn(
                    'w-full flex items-center gap-2.5 p-2 rounded-[var(--shape-md)] group',
                    'transition-colors duration-200',
                    isExpanded ? 'bg-[var(--neutral-100)]' : 'hover:bg-[var(--neutral-100)]'
                  )}
                >
                  <ModuleIcon item={item} isActive={isExpanded} />

                  <span className="flex-1 font-medium text-sm text-foreground text-left">
                    {item.label}
                  </span>

                  {hasSubItems && (
                    <ChevronRight
                      className="w-4 h-4 text-[var(--neutral-400)]"
                      style={{
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: `transform ${EXPAND_DURATION} ${EXPAND_EASING}`,
                      }}
                    />
                  )}
                </button>
              )}

              {hasSubItems && (
                <CollapsibleSubMenu isOpen={isExpanded}>
                  {item.subItems!.map((subItem) => {
                    const isSubActive = isActiveRoute(subItem.path);
                    return (
                      <Link key={subItem.path} to={subItem.path}>
                        <div
                          className={cn(
                            'h-[34px] flex items-center px-3 rounded-[var(--shape-sm)]',
                            'transition-all duration-200',
                            isSubActive
                              ? 'bg-[var(--mw-yellow-50)] font-semibold'
                              : 'hover:bg-[var(--neutral-100)] font-normal'
                          )}
                        >
                          {isSubActive && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--mw-yellow-400)] mr-2 flex-shrink-0" />
                          )}
                          <span className="text-sm text-foreground">
                            {subItem.label}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </CollapsibleSubMenu>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--neutral-200)] space-y-1">
        <button className="w-full flex items-center gap-2 px-2 h-[34px] rounded-[var(--shape-md)] hover:bg-[var(--neutral-100)] transition-colors duration-200 group">
          <SettingsIcon className="w-4 h-4 text-muted-foreground transition-transform duration-300 group-hover:rotate-45" />
          <span className="text-sm text-muted-foreground">
            Settings
          </span>
        </button>
      </div>
    </div>
  );
}
