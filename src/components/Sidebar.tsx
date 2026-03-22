/**
 * Sidebar - Main navigation sidebar with all modules
 * 
 * Features:
 * - Accordion behavior: only one parent module open at a time
 * - Smooth CSS grid-row animation for expand/collapse (500ms)
 * - Animated chevron rotation on toggle
 * - Icon scale animation on click
 * - Increased border contrast (#d4d4d4)
 * - Auto-opens parent when navigating to a child route
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
      { label: 'Workflow designer',  path: '/control/workflow-designer' },
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
// Uses CSS grid-template-rows trick for smooth height animation.
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
          <div className="absolute left-0 top-0 bottom-0 w-px bg-[#d4d4d4]" />
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

  // Accordion: only one module open at a time
  const [expandedModule, setExpandedModule] = useState<string | null>(
    () => getActiveModule(location.pathname)
  );

  // Icon bounce animation state
  const [clickedIcon, setClickedIcon] = useState<string | null>(null);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Auto-open the parent module when route changes (e.g. direct URL nav)
  useEffect(() => {
    const active = getActiveModule(location.pathname);
    if (active && active !== expandedModule) {
      setExpandedModule(active);
    }
  }, [location.pathname]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  const toggleModule = (label: string) => {
    // Accordion: toggle current, or switch to new (closes the old one)
    setExpandedModule(prev => (prev === label ? null : label));

    // Trigger icon click bounce
    setClickedIcon(label);
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => setClickedIcon(null), 400);
  };

  const isActiveRoute = (path: string) => {
    // Exact match only — prefix matching causes parent index routes like
    // "/buy" to activate whenever any child route (e.g. "/buy/requisitions")
    // is current, producing multiple active dots in the same module.
    return location.pathname === path;
  };

  return (
    <div className="bg-[#fafafa] flex flex-col h-screen w-64 border-r border-[#d4d4d4]">
      {/* Header */}
      <div className="p-2">
        <div className="h-[32px] flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-[#171717] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">MW</span>
          </div>
          <p className="font-['Geist:SemiBold',sans-serif] font-semibold text-[16px] text-[#0a0a0a]">
            Alliance Metal
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-2 space-y-2">
        <button className="w-full bg-[#ffcf4b] hover:bg-[#EBC028] h-[32px] rounded-lg flex items-center gap-2 px-3 transition-colors duration-200">
          <Plus className="w-4 h-4 text-[#18181b]" />
          <span className="font-['Geist:Regular',sans-serif] text-[14px] text-[#18181b]">
            Quick Create
          </span>
        </button>
        <button className="w-full bg-white border border-[#d4d4d4] h-[32px] rounded-lg flex items-center gap-2 px-3 hover:bg-[#f5f5f5] transition-colors duration-200">
          <Search className="w-4 h-4 text-[#0a0a0a]" />
          <span className="font-['Geist:Regular',sans-serif] text-[14px] text-[#18181b]">
            Search (Cmd + K)
          </span>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {menuConfig.map((item) => {
          const Icon = item.icon;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedModule === item.label;
          const isActive = item.path ? isActiveRoute(item.path) : false;
          const isIconBouncing = clickedIcon === item.label;

          return (
            <div key={item.label} className="w-full">
              {/* Top-level item (no children) */}
              {item.path && !hasSubItems ? (
                <Link to={item.path} className="w-full">
                  <div
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg cursor-pointer',
                      'transition-colors duration-200',
                      isActive ? 'bg-[#fffbf0]' : 'hover:bg-[#f5f5f5]'
                    )}
                  >
                    <div className="bg-[#171717] p-2 rounded-lg">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="flex-1 font-['Geist:Medium',sans-serif] font-medium text-[16px] text-[#0a0a0a]">
                      {item.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#a3a3a3]" />
                  </div>
                </Link>
              ) : (
                /* Module parent (collapsible) */
                <button
                  onClick={() => hasSubItems && toggleModule(item.label)}
                  className={cn(
                    'w-full flex items-center gap-2 p-2 rounded-lg',
                    'transition-colors duration-200',
                    isExpanded ? 'bg-[#f5f5f5]' : 'hover:bg-[#f5f5f5]'
                  )}
                >
                  {/* Icon with click bounce animation */}
                  <div
                    className="bg-[#171717] p-2 rounded-lg"
                    style={{
                      transform: isIconBouncing ? 'scale(1.15)' : 'scale(1)',
                      transition: `transform 300ms ${ICON_EASING}`,
                    }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>

                  <span className="flex-1 font-['Geist:Medium',sans-serif] font-medium text-[16px] text-[#0a0a0a] text-left">
                    {item.label}
                  </span>

                  {/* Animated chevron: rotates 90deg when expanded */}
                  {hasSubItems && (
                    <ChevronRight
                      className="w-4 h-4 text-[#a3a3a3]"
                      style={{
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: `transform ${EXPAND_DURATION} ${EXPAND_EASING}`,
                      }}
                    />
                  )}
                </button>
              )}

              {/* Animated sub-menu */}
              {hasSubItems && (
                <CollapsibleSubMenu isOpen={isExpanded}>
                  {item.subItems!.map((subItem) => {
                    const isSubActive = isActiveRoute(subItem.path);
                    return (
                      <Link key={subItem.path} to={subItem.path}>
                        <div
                          className={cn(
                            'h-[32px] flex items-center px-3 rounded-lg',
                            'transition-all duration-200',
                            isSubActive
                              ? "bg-[#fffbf0] font-['Geist:SemiBold',sans-serif] font-semibold"
                              : "hover:bg-[#f0f0f0] font-['Geist:Regular',sans-serif] font-normal"
                          )}
                        >
                          {/* Active indicator dot */}
                          {isSubActive && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#ffcf4b] mr-2 flex-shrink-0" />
                          )}
                          <span className="text-[14px] text-[#0a0a0a]">
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
      <div className="p-2 border-t border-[#d4d4d4] space-y-1">
        <button className="w-full flex items-center gap-2 px-2 h-[32px] rounded-lg hover:bg-[#f5f5f5] transition-colors duration-200 group">
          <SettingsIcon className="w-4 h-4 text-[#737373] transition-transform duration-300 group-hover:rotate-45" />
          <span className="font-['Geist:Regular',sans-serif] text-[14px] text-[#737373]">
            Settings
          </span>
        </button>
      </div>
    </div>
  );
}