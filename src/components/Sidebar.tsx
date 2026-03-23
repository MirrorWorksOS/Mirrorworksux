/**
 * Sidebar - Main navigation sidebar with all modules
 *
 * Updated design: warm cream palette, softer borders, rounded elements
 * matching the Crextio-inspired reference design system.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  TrendingUp,
  Clock,
  Box,
  Package,
  BookOpen,
  Settings as SettingsIcon,
  Pencil,
  Search,
  Plus,
  ChevronRight,
  ShoppingCart,
  type LucideIcon
} from 'lucide-react';
import { cn } from './ui/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SubMenuItem {
  label: string;
  path: string;
}

interface MenuItem {
  label: string;
  icon: LucideIcon;
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
    icon: TrendingUp,
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
    icon: ShoppingCart,
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
    icon: Clock,
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
    icon: Box,
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
    icon: Package,
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
    icon: BookOpen,
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
    icon: SettingsIcon,
    subItems: [
      { label: 'Dashboard',          path: '/control' },
      { label: 'Locations',          path: '/control/locations' },
      { label: 'Machines',           path: '/control/machines' },
      { label: 'Inventory',          path: '/control/inventory' },
      { label: 'Purchase',           path: '/control/purchase' },
      { label: 'People',             path: '/control/people' },
      { label: 'Products',           path: '/control/products' },
      { label: 'BOMs',               path: '/control/boms' },
      { label: 'Role designer',      path: '/control/role-designer' },
      { label: 'Workflow designer',   path: '/control/workflow-designer' },
    ],
  },
  {
    label: 'Design',
    icon: Pencil,
    subItems: [
      { label: 'Factory layout',  path: '/design/factory-layout' },
      { label: 'Process builder', path: '/design/process-builder' },
      { label: 'Initial data',    path: '/design/initial-data' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Animation constants (M3 motion)
// ---------------------------------------------------------------------------

const EXPAND_DURATION = '500ms';
const EXPAND_EASING = 'cubic-bezier(0.2, 0.0, 0, 1.0)';
const ICON_EASING = 'cubic-bezier(0.05, 0.7, 0.1, 1.0)';

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
          {/* Vertical connector line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-[var(--border)]" />
          {children}
        </div>
      </div>
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

  const [clickedIcon, setClickedIcon] = useState<string | null>(null);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const active = getActiveModule(location.pathname);
    if (active && active !== expandedModule) {
      setExpandedModule(active);
    }
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  const toggleModule = (label: string) => {
    setExpandedModule(prev => (prev === label ? null : label));
    setClickedIcon(label);
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => setClickedIcon(null), 400);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="bg-[#FAFAFA] flex flex-col h-screen w-64 border-r border-[#E5E5E5]">
      {/* Header */}
      <div className="p-3">
        <div className="h-[36px] flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 bg-[#1A2732] rounded-[var(--shape-md)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">MW</span>
          </div>
          <p className="font-semibold text-[16px] text-[#0A0A0A]">
            Alliance Metal
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-3 space-y-2">
        <button className="w-full bg-[#FFCF4B] hover:bg-[#F2BF30] h-[36px] rounded-[var(--shape-md)] flex items-center gap-2 px-3 transition-colors duration-200">
          <Plus className="w-4 h-4 text-[#0A0A0A]" />
          <span className="text-[14px] text-[#0A0A0A] font-medium">
            Quick Create
          </span>
        </button>
        <button className="w-full bg-white border border-[var(--border)] h-[36px] rounded-[var(--shape-md)] flex items-center gap-2 px-3 hover:bg-[#F5F5F5] transition-colors duration-200">
          <Search className="w-4 h-4 text-[#0A0A0A]" />
          <span className="text-[14px] text-[#737373]">
            Search (Cmd + K)
          </span>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menuConfig.map((item) => {
          const Icon = item.icon;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedModule === item.label;
          const isActive = item.path ? isActiveRoute(item.path) : false;
          const isIconBouncing = clickedIcon === item.label;

          return (
            <div key={item.label} className="w-full">
              {item.path && !hasSubItems ? (
                <Link to={item.path} className="w-full">
                  <div
                    className={cn(
                      'flex items-center gap-2.5 p-2 rounded-[var(--shape-md)] cursor-pointer',
                      'transition-colors duration-200',
                      isActive ? 'bg-[#FFFBF0]' : 'hover:bg-[#F5F5F5]'
                    )}
                  >
                    <div className="bg-[#1A2732] p-2 rounded-[var(--shape-md)]">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="flex-1 font-medium text-[15px] text-[#0A0A0A]">
                      {item.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#A3A3A3]" />
                  </div>
                </Link>
              ) : (
                <button
                  onClick={() => hasSubItems && toggleModule(item.label)}
                  className={cn(
                    'w-full flex items-center gap-2.5 p-2 rounded-[var(--shape-md)]',
                    'transition-colors duration-200',
                    isExpanded ? 'bg-[#F5F5F5]' : 'hover:bg-[#F5F5F5]'
                  )}
                >
                  <div
                    className="bg-[#1A2732] p-2 rounded-[var(--shape-md)]"
                    style={{
                      transform: isIconBouncing ? 'scale(1.15)' : 'scale(1)',
                      transition: `transform 300ms ${ICON_EASING}`,
                    }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>

                  <span className="flex-1 font-medium text-[15px] text-[#0A0A0A] text-left">
                    {item.label}
                  </span>

                  {hasSubItems && (
                    <ChevronRight
                      className="w-4 h-4 text-[#A3A3A3]"
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
                            'h-[34px] flex items-center px-3 rounded-lg',
                            'transition-all duration-200',
                            isSubActive
                              ? 'bg-[#FFFBF0] font-semibold'
                              : 'hover:bg-[#F5F5F5] font-normal'
                          )}
                        >
                          {isSubActive && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#FFCF4B] mr-2 flex-shrink-0" />
                          )}
                          <span className="text-[14px] text-[#0A0A0A]">
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
      <div className="p-3 border-t border-[#E5E5E5] space-y-1">
        <button className="w-full flex items-center gap-2 px-2 h-[34px] rounded-[var(--shape-md)] hover:bg-[#F5F5F5] transition-colors duration-200 group">
          <SettingsIcon className="w-4 h-4 text-[#737373] transition-transform duration-300 group-hover:rotate-45" />
          <span className="text-[14px] text-[#737373]">
            Settings
          </span>
        </button>
      </div>
    </div>
  );
}
