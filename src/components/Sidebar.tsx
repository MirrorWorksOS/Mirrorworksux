/**
 * Sidebar - Main navigation sidebar with all modules
 *
 * Uses Animate UI icons for module identifiers (animateOnHover),
 * Lucide icons for utility elements (Search, Plus, ChevronRight).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Search,
  Plus,
  ChevronRight,
  LogOut,
  Bell,
  User,
  TrendingUp,
  X,
  type LucideIcon
} from 'lucide-react';
import { cn } from './ui/utils';
import { MODULE_ICONS, ICON_SIZES } from '@/lib/icon-config';
import { CommandPalette } from './shared/command/CommandPalette';
import { QuickCreatePanel } from './shared/command/QuickCreatePanel';
import { useTheme } from '@/components/theme-provider';
import { motion } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ThemeToggler } from '@/components/animate-ui/primitives/effects/theme-toggler';
import {
  getHighestUsageAcrossModules,
  getUsageStatus,
  getNextTier,
  CURRENT_SUBSCRIPTION,
} from '@/lib/subscription';

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
  section?: string; // section heading rendered before this item
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
    section: 'Operations',
    subItems: [
      { label: 'Dashboard', path: '/sell' },
      { label: 'CRM', path: '/sell/crm' },
      { label: 'Opportunities', path: '/sell/opportunities' },
      { label: 'Orders', path: '/sell/orders' },
      { label: 'Quotes', path: '/sell/quotes' },
      { label: 'Activities', path: '/sell/activities' },
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
      { label: 'Schedule', path: '/plan/schedule' },
      { label: 'NC Connect', path: '/plan/nc-connect' },
      { label: 'Purchase', path: '/plan/purchase' },
      { label: 'Quality', path: '/plan/qc-planning' },
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
      { label: 'Manufacturing Orders', path: '/make/manufacturing-orders' },
      { label: 'Time Clock', path: '/make/time-clock' },
      { label: 'Quality', path: '/make/quality' },
      { label: 'Products', path: '/make/products' },
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
    section: 'Settings',
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
      { label: 'Gamification', path: '/control/gamification' },
      { label: 'Empty states', path: '/control/empty-states' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Animation constants — silky smooth, slower durations
// ---------------------------------------------------------------------------

const EXPAND_DURATION = 'var(--duration-medium2)';
const EXPAND_EASING = 'var(--ease-standard)';

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
          className="ml-6 mt-1.5 flex flex-col gap-1"
          style={{
            opacity: isOpen ? 1 : 0,
            transition: `opacity ${EXPAND_DURATION} ${EXPAND_EASING}`,
            transitionDelay: isOpen ? '140ms' : '0ms',
          }}
        >
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
  isHovered,
}: {
  item: MenuItem;
  isHovered: boolean;
}) {
  const AnimatedIcon = item.animatedIcon;
  const StaticIcon = item.icon;

  return (
    <div
      className="bg-[var(--mw-mirage)] p-2 rounded-[var(--shape-md)] transition-transform duration-[var(--duration-medium1)] ease-[var(--ease-standard)] group-hover:scale-105"
    >
      {AnimatedIcon ? (
        <AnimatedIcon
          size={ICON_SIZES.sidebar}
          animate={isHovered}
          strokeWidth={1.5}
          className="text-white"
        />
      ) : StaticIcon ? (
        <StaticIcon className="w-5 h-5 text-white" strokeWidth={1.5} />
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Menu item row — tracks hover to drive icon animation
// ---------------------------------------------------------------------------

function MenuItemRow({
  item,
  hasSubItems,
  isActive,
  isExpanded,
  onToggle,
  children,
}: {
  item: MenuItem;
  hasSubItems: boolean;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {item.path && !hasSubItems ? (
        <Link to={item.path} className="w-full group">
          <div
            className={cn(
              'flex items-center gap-2.5 p-2 rounded-full cursor-pointer',
              'transition-all duration-[var(--duration-medium1)] ease-[var(--ease-standard)]',
              isActive
                ? 'bg-[var(--mw-mirage)] text-white'
                : 'hover:bg-[var(--neutral-200)]'
            )}
          >
            <ModuleIcon item={item} isHovered={isHovered} />
            <span className="flex-1 text-sm text-current">
              {item.label}
            </span>
            <ChevronRight className={cn(
              "w-4 h-4",
              isActive ? "text-white/50" : "text-[var(--neutral-400)]"
            )} />
          </div>
        </Link>
      ) : (
        <button
          onClick={onToggle}
          className={cn(
            'w-full flex items-center gap-2.5 p-2 rounded-full group',
            'transition-all duration-[var(--duration-medium1)] ease-[var(--ease-standard)]',
            isExpanded
              ? 'bg-[var(--neutral-100)]'
              : 'hover:bg-[var(--neutral-200)]'
          )}
        >
          <ModuleIcon item={item} isHovered={isHovered} />

          <span className="flex-1 text-sm text-foreground text-left">
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

      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Keyboard shortcut pill badge
// ---------------------------------------------------------------------------

function KbdPill({
  keys,
  variant = 'default',
}: {
  keys: string[];
  variant?: 'default' | 'on-yellow';
}) {
  const isYellow = variant === 'on-yellow';
  return (
    <span className="inline-flex items-center gap-0.5 shrink-0" aria-hidden>
      {keys.map((key, i) => (
        <kbd
          key={i}
          className={cn(
            'inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-[var(--shape-sm)] text-xs font-medium leading-none select-none',
            isYellow
              ? 'bg-[#E6A600]/20 text-primary-foreground/60 border border-[#E6A600]/30'
              : 'bg-[var(--neutral-100)] text-[var(--neutral-400)] border border-[var(--neutral-200)]'
          )}
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// M3 split button — user profile + theme toggle
// ---------------------------------------------------------------------------

function UserProfileSplitButton() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="flex items-center rounded-full border border-[var(--neutral-200)] dark:border-[var(--neutral-700)]">
      {/* Leading segment — user profile dropdown trigger */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex flex-1 items-center gap-2.5 py-1.5 pl-1.5 pr-3 rounded-l-full min-w-0 hover:bg-[#0A0A0A]/[0.04] dark:hover:bg-white/[0.06] transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)] focus-visible:outline-none">
            <div className="w-8 h-8 rounded-full bg-[var(--mw-mirage)] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-medium">MQ</span>
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm text-foreground truncate">Matt Quigley</p>
              <p className="text-xs text-muted-foreground truncate">Admin</p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-56 mb-1">
          <DropdownMenuItem asChild>
            <Link to="/control/people" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Account Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex items-center gap-2 text-[var(--error)]">
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* M3 split divider */}
      <div className="w-px self-stretch my-2.5 bg-[var(--neutral-200)] dark:bg-[var(--neutral-700)] shrink-0" />

      {/* Trailing segment — theme toggle */}
      <ThemeToggler
        resolvedTheme={resolvedTheme}
        setTheme={setTheme}
        direction="btt"
        className="self-stretch w-11 shrink-0 rounded-r-full hover:bg-[#0A0A0A]/[0.04] dark:hover:bg-white/[0.06]"
        iconClassName="h-4 w-4 text-foreground"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Usage Warning Banner — shows when any metric hits 90%+
// ---------------------------------------------------------------------------

function UsageBanner() {
  const [dismissed, setDismissed] = useState(false);
  const highest = getHighestUsageAcrossModules();

  if (!highest || dismissed) return null;

  const status = getUsageStatus(highest.percentage);
  if (status !== 'critical' && status !== 'exceeded') return null;

  const nextTier = getNextTier(CURRENT_SUBSCRIPTION.tier);
  const remaining = highest.limit - highest.current;
  const isExceeded = status === 'exceeded';

  return (
    <div className="px-3 pb-2">
      <div
        className={cn(
          'rounded-xl p-3 border transition-colors',
          isExceeded
            ? 'bg-[var(--mw-error)]/5 border-[var(--mw-error)]/20'
            : 'bg-[var(--mw-yellow-400)]/5 border-[var(--mw-yellow-400)]/20',
        )}
      >
        <div className="flex items-start gap-2">
          <TrendingUp
            className={cn(
              'w-4 h-4 mt-0.5 shrink-0',
              isExceeded ? 'text-[var(--mw-error)]' : 'text-[var(--mw-yellow-500)]',
            )}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground">
              {isExceeded ? 'Plan limit exceeded' : 'Approaching limit'}
            </p>
            <p className="text-xs text-[var(--neutral-500)] mt-0.5">
              {isExceeded
                ? `${highest.current}/${highest.limit} ${highest.metric} in ${highest.module}.`
                : `${remaining} ${highest.metric.toLowerCase()} remaining in ${highest.module}.`}
              {nextTier && (
                <Link
                  to={`/${highest.module.toLowerCase()}/settings`}
                  className="underline ml-1 text-[var(--neutral-600)] dark:text-[var(--neutral-400)] hover:text-foreground"
                >
                  Upgrade
                </Link>
              )}
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-[var(--neutral-400)] hover:text-foreground transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
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

  const [commandOpen, setCommandOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const [expandedModule, setExpandedModule] = useState<string | null>(
    () => getActiveModule(location.pathname)
  );
  const [hoveredSubPath, setHoveredSubPath] = useState<string | null>(null);

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

  const handleSubItemPointerMove = useCallback((path: string) => {
    setHoveredSubPath(prev => prev === path ? prev : path);
  }, []);

  const handleSubItemPointerLeave = useCallback(() => {
    setHoveredSubPath(null);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setQuickCreateOpen(prev => !prev);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="bg-[var(--neutral-50)] flex flex-col h-screen w-64 border-r border-[var(--neutral-200)]">
      {/* Header */}
      <div className="p-3">
        <div className="h-[36px] flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 bg-[var(--mw-mirage)] rounded-[var(--shape-md)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">MW</span>
          </div>
          <p className="font-medium text-base text-foreground">
            Alliance Metal
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-3 space-y-2">
        <QuickCreatePanel open={quickCreateOpen} onOpenChange={setQuickCreateOpen}>
          <button
            type="button"
            className="flex h-12 min-h-[48px] w-full items-center gap-2 rounded-full bg-[var(--mw-yellow-400)] px-4 transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)] hover:bg-[var(--mw-yellow-500)]"
          >
            <Plus className="h-5 w-5 shrink-0 text-primary-foreground" strokeWidth={1.5} aria-hidden />
            <span className="flex-1 text-left text-sm font-medium text-primary-foreground">
              Quick Create
            </span>
            <KbdPill keys={['⌘', 'N']} variant="on-yellow" />
          </button>
        </QuickCreatePanel>
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="flex h-12 min-h-[48px] w-full items-center gap-2 rounded-full border border-border bg-card px-3 transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)] hover:bg-[var(--neutral-100)]"
        >
          <Search className="h-5 w-5 shrink-0 text-foreground" strokeWidth={1.5} aria-hidden />
          <span className="flex-1 text-left text-sm text-muted-foreground">
            Search
          </span>
          <KbdPill keys={['⌘', 'K']} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5" style={{ scrollbarWidth: 'none' }}>
        {menuConfig.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedModule === item.label;
          const isActive = item.path ? isActiveRoute(item.path) : isExpanded;

          return (
            <React.Fragment key={item.label}>
              {/* Section heading */}
              {item.section && (
                <div className="pt-4 pb-1.5 px-2 first:pt-0">
                  <span className="text-xs font-medium uppercase tracking-wider text-[var(--neutral-400)]">
                    {item.section}
                  </span>
                </div>
              )}

              <MenuItemRow
                item={item}
                hasSubItems={hasSubItems}
                isActive={isActive}
                isExpanded={isExpanded}
                onToggle={() => hasSubItems && toggleModule(item.label)}
              >

                {hasSubItems && (
                  <CollapsibleSubMenu isOpen={isExpanded}>
                    {item.subItems!.map((subItem) => {
                      const isSubActive = isActiveRoute(subItem.path);
                      const isSubHovered = hoveredSubPath === subItem.path;
                      return (
                        <Link key={subItem.path} to={subItem.path}>
                          <div
                            onPointerMove={() => handleSubItemPointerMove(subItem.path)}
                            onPointerLeave={handleSubItemPointerLeave}
                            className={cn(
                              'relative h-12 flex items-center px-4 rounded-full',
                              'transition-[background-color,color] duration-200 ease-[cubic-bezier(0,0,0,1)]',
                              isSubActive
                                ? 'bg-[var(--mw-mirage)] text-white'
                                : 'bg-transparent text-foreground'
                            )}
                          >
                            {!isSubActive && (
                              <span
                                className={cn(
                                  'absolute inset-x-0 rounded-full bg-[var(--neutral-200)] transition-[opacity,inset]',
                                  isSubHovered
                                    ? 'opacity-100 -inset-y-[2px] duration-200 ease-[cubic-bezier(0.3,0,1,1)]'
                                    : 'opacity-0 inset-y-0 duration-[550ms] ease-[cubic-bezier(0,0,0,1)]'
                                )}
                              />
                            )}
                            <span className="relative text-sm">
                              {subItem.label}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </CollapsibleSubMenu>
                )}
              </MenuItemRow>
            </React.Fragment>
          );
        })}
      </div>

      {/* Usage Warning Banner */}
      <UsageBanner />

      {/* Footer — M3 split button: user profile + theme toggle */}
      <div className="p-3 border-t border-border">
        <UserProfileSplitButton />
      </div>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
