/**
 * Sidebar - Main navigation sidebar with all modules
 * Supports collapsible sections and routing
 */

import React, { useState } from 'react';
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
  Minus,
  ShoppingCart
} from 'lucide-react';
import { cn } from './ui/utils';

interface SubMenuItem {
  label: string;
  path: string;
}

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  subItems?: SubMenuItem[];
  expanded?: boolean;
}

const menuConfig: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    label: 'Sell',
    icon: TrendingUp,
    expanded: false,
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
    expanded: false,
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
    expanded: false,
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
    expanded: false,
    subItems: [
      { label: 'Dashboard', path: '/make' },
      { label: 'Schedule', path: '/make/schedule' },
      { label: 'Shop Floor', path: '/make/shop-floor' },
      { label: 'Work', path: '/make/work' },
      { label: 'Issues', path: '/make/issues' },
    ],
  },
  {
    label: 'Ship',
    icon: Package,
    expanded: false,
    subItems: [
      { label: 'Dashboard', path: '/ship' },
      { label: 'Orders', path: '/ship/orders' },
      { label: 'Pickups', path: '/ship/pickups' },
    ],
  },
  {
    label: 'Book',
    icon: BookOpen,
    expanded: false,
    subItems: [
      { label: 'Dashboard', path: '/book' },
      { label: 'Budget', path: '/book/budget' },
      { label: 'Transactions', path: '/book/transactions' },
    ],
  },
  {
    label: 'Control',
    icon: SettingsIcon,
    expanded: false,
    subItems: [
      { label: 'Dashboard', path: '/control' },
      { label: 'Locations', path: '/control/locations' },
      { label: 'Machines', path: '/control/machines' },
      { label: 'Inventory', path: '/control/inventory' },
      { label: 'Purchase', path: '/control/purchase' },
      { label: 'People', path: '/control/people' },
      { label: 'Products', path: '/control/products' },
      { label: 'BOMs', path: '/control/boms' },
    ],
  },
  {
    label: 'Design',
    icon: Pencil,
    expanded: false,
    subItems: [
      { label: 'Factory Layout', path: '/design/factory-layout' },
      { label: 'Process Builder', path: '/design/process-builder' },
      { label: 'Role Designer', path: '/design/role-designer' },
      { label: 'Initial Data', path: '/design/initial-data' },
    ],
  },
];

export function Sidebar() {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(['Sell']));
  const location = useLocation();

  const toggleModule = (label: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="bg-[#fafafa] flex flex-col h-screen w-64 border-r border-[#e5e5e5]">
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
        <button className="w-full bg-[#ffcf4b] hover:bg-[#E6A600] h-[32px] rounded-lg flex items-center gap-2 px-3 transition-colors">
          <Plus className="w-4 h-4 text-[#18181b]" />
          <span className="font-['Geist:Regular',sans-serif] text-[14px] text-[#18181b]">Quick Create</span>
        </button>
        <button className="w-full bg-white border border-[#e5e5e5] h-[32px] rounded-lg flex items-center gap-2 px-3 hover:bg-[#f5f5f5] transition-colors">
          <Search className="w-4 h-4 text-[#0a0a0a]" />
          <span className="font-['Geist:Regular',sans-serif] text-[14px] text-[#18181b]">Search (Cmd + K)</span>
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {menuConfig.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedModules.has(item.label);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isActive = item.path ? isActiveRoute(item.path) : false;

          return (
            <div key={item.label} className="w-full">
              {/* Main Module Button */}
              {item.path && !hasSubItems ? (
                <Link to={item.path} className="w-full">
                  <div className={cn(
                    "flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer",
                    isActive ? "bg-[#fffbf0]" : "hover:bg-[#f5f5f5]"
                  )}>
                    <div className="bg-[#171717] p-2 rounded-lg">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="flex-1 font-['Roboto:Medium',sans-serif] font-medium text-[18px] text-[#0a0a0a]">
                      {item.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#0a0a0a]" />
                  </div>
                </Link>
              ) : (
                <button
                  onClick={() => hasSubItems && toggleModule(item.label)}
                  className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-[#f5f5f5] transition-colors"
                >
                  <div className="bg-[#171717] p-2 rounded-lg">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="flex-1 font-['Roboto:Medium',sans-serif] font-medium text-[18px] text-[#0a0a0a] text-left">
                    {item.label}
                  </span>
                  {hasSubItems && (
                    isExpanded ? (
                      <Minus className="w-4 h-4 text-[#0a0a0a]" />
                    ) : (
                      <Plus className="w-4 h-4 text-[#0a0a0a]" />
                    )
                  )}
                </button>
              )}

              {/* Submenu Items */}
              {hasSubItems && isExpanded && (
                <div className="ml-6 mt-1 space-y-1 relative">
                  {/* Vertical Border Line */}
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-[#e5e5e5]" />
                  
                  {item.subItems!.map((subItem) => {
                    const isSubActive = isActiveRoute(subItem.path);
                    return (
                      <Link key={subItem.path} to={subItem.path}>
                        <div className={cn(
                          "h-[28px] flex items-center px-3 rounded-lg transition-colors",
                          isSubActive 
                            ? "bg-[#fffbf0] font-['Geist:Bold',sans-serif] font-bold" 
                            : "hover:bg-[#f5f5f5] font-['Geist:Regular',sans-serif] font-normal"
                        )}>
                          <span className="text-[14px] text-[#0a0a0a]">{subItem.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-[#e5e5e5] space-y-1">
        <button className="w-full flex items-center gap-2 px-2 h-[32px] rounded-lg hover:bg-[#f5f5f5] transition-colors">
          <SettingsIcon className="w-4 h-4 text-[#737373]" />
          <span className="font-['Geist:Regular',sans-serif] text-[14px] text-[#737373]">Settings</span>
        </button>
      </div>
    </div>
  );
}
