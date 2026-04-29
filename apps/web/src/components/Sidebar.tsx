/**
 * Sidebar - Main navigation sidebar with all modules
 *
 * Uses Animate UI icons for module identifiers (animateOnHover),
 * Lucide icons for utility elements (ChevronRight); Animate UI Plus and Search for Quick Create / command palette.
 */

import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  ChevronRight,
  LogOut,
  Bell,
  User,
  TrendingUp,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon
} from 'lucide-react';
import { cn } from './ui/utils';
import { MODULE_ICONS, ICON_SIZES } from '@/lib/icon-config';
import { getSubItemMeta } from '@/lib/sub-item-meta';
import { CommandPalette } from './shared/command/CommandPalette';
import { QuickCreatePanel } from './shared/command/QuickCreatePanel';
import { useCommandPaletteStore } from '@/store/commandPaletteStore';
import { useTheme } from '@/components/theme-provider';
import { mockUserContext, getUserInitials } from '@/lib/mock-user-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ThemeToggler } from '@/components/animate-ui/primitives/effects/theme-toggler';
import { Plus } from '@/components/animate-ui/icons/plus';
import { Search } from '@/components/animate-ui/icons/search';
import {
  getHighestUsageAcrossModules,
  getUsageStatus,
  getNextTier,
  CURRENT_SUBSCRIPTION,
} from '@/lib/subscription';
import mirrorworksLogomark from '@/art/empty-states/logo/mirrorworks_logomark.svg';
import { NotificationBell } from './shared/notifications/NotificationBell';
import { DockNav, type DockItemData } from './shared/layout/DockNav';
import {
  seedNotificationsIfEmpty,
  startNotificationSimulator,
} from './shared/notifications/notification-mock-data';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SubMenuItem {
  label: string;
  path: string;
}

export interface SubMenuGroup {
  heading: string;
  items: SubMenuItem[];
}

export interface MenuItem {
  label: string;
  icon?: LucideIcon;
  animatedIcon?: React.ComponentType<{
    size?: number;
    animateOnHover?: boolean;
    className?: string;
    strokeWidth?: number;
  }>;
  path?: string;
  subItems?: SubMenuItem[];
  /** Grouped sub-items with collapsible section headings */
  groupedSubItems?: SubMenuGroup[];
  section?: string; // section heading rendered before this item
}

// ---------------------------------------------------------------------------
// Menu Configuration
// ---------------------------------------------------------------------------

export const menuConfig: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    label: 'Sell',
    animatedIcon: MODULE_ICONS.sell,
    section: 'Operations',
    groupedSubItems: [
      {
        heading: '',
        items: [
          { label: 'Dashboard', path: '/sell' },
        ],
      },
      {
        heading: 'Pipeline',
        items: [
          { label: 'CRM', path: '/sell/crm' },
          { label: 'Opportunities', path: '/sell/opportunities' },
          { label: 'Quotes', path: '/sell/quotes' },
        ],
      },
      {
        heading: 'Transactions',
        items: [
          { label: 'Orders', path: '/sell/orders' },
          { label: 'Invoices', path: '/sell/invoices' },
        ],
      },
      {
        heading: 'Customer engagement',
        items: [
          { label: 'Activities', path: '/sell/activities' },
          { label: 'Customer portal', path: '/sell/portal' },
        ],
      },
      {
        heading: 'Catalog & Config',
        items: [
          { label: 'Products', path: '/sell/products' },
          { label: 'Settings', path: '/sell/settings' },
        ],
      },
    ],
  },
  {
    label: 'Buy',
    animatedIcon: MODULE_ICONS.buy,
    groupedSubItems: [
      {
        heading: '',
        items: [
          { label: 'Dashboard', path: '/buy' },
        ],
      },
      {
        heading: 'Transactions',
        items: [
          { label: 'Orders', path: '/buy/orders' },
          { label: 'Requisitions', path: '/buy/requisitions' },
          { label: 'Receipts', path: '/buy/receipts' },
          { label: 'Bills', path: '/buy/bills' },
        ],
      },
      {
        heading: 'Sourcing',
        items: [
          { label: 'Suppliers', path: '/buy/suppliers' },
          { label: 'RFQs', path: '/buy/rfqs' },
          { label: 'Agreements', path: '/buy/agreements' },
          { label: 'Vendor comparison', path: '/buy/vendor-comparison' },
        ],
      },
      {
        heading: 'Planning',
        items: [
          { label: 'MRP suggestions', path: '/buy/mrp-suggestions' },
          { label: 'Planning grid', path: '/buy/planning-grid' },
          { label: 'Reorder rules', path: '/buy/reorder-rules' },
        ],
      },
      {
        heading: 'Catalog & Config',
        items: [
          { label: 'Products', path: '/buy/products' },
          { label: 'Reports', path: '/buy/reports' },
          { label: 'Settings', path: '/buy/settings' },
        ],
      },
    ],
  },
  {
    label: 'Plan',
    animatedIcon: MODULE_ICONS.plan,
    groupedSubItems: [
      {
        heading: '',
        items: [
          { label: 'Dashboard', path: '/plan' },
        ],
      },
      {
        heading: 'Execution',
        items: [
          { label: 'Jobs', path: '/plan/jobs' },
          { label: 'Schedule', path: '/plan/schedule' },
          { label: 'What-if', path: '/plan/what-if' },
        ],
      },
      {
        heading: 'Engineering',
        items: [
          { label: 'Product Studio', path: '/plan/product-studio' },
          { label: 'Machine I/O', path: '/plan/machine-io' },
          { label: 'Nesting', path: '/plan/nesting' },
        ],
      },
      {
        heading: 'Planning tools',
        items: [
          { label: 'MRP', path: '/plan/mrp' },
          { label: 'Sheet calculator', path: '/plan/sheet-calculator' },
          { label: 'Purchase', path: '/plan/purchase' },
        ],
      },
      {
        heading: 'Libraries',
        items: [
          { label: 'Libraries', path: '/plan/libraries' },
          { label: 'Products', path: '/plan/products' },
        ],
      },
      {
        heading: 'Quality & Config',
        items: [
          { label: 'Quality', path: '/plan/qc-planning' },
          { label: 'Settings', path: '/plan/settings' },
        ],
      },
    ],
  },
  {
    label: 'Make',
    animatedIcon: MODULE_ICONS.make,
    groupedSubItems: [
      {
        heading: '',
        items: [
          { label: 'Dashboard', path: '/make' },
        ],
      },
      {
        heading: 'Execution',
        items: [
          { label: 'Schedule', path: '/make/schedule' },
          { label: 'Shop Floor', path: '/make/shop-floor' },
          { label: 'Manufacturing Orders', path: '/make/manufacturing-orders' },
          // Scan station and Time Clock moved into the unified Shop Floor
          // kiosk at /floor — removed from the office sidebar to eliminate
          // multiple entry points. See FloorHome for the gated funnel.
        ],
      },
      {
        heading: 'Quality & People',
        items: [
          { label: 'Quality', path: '/make/quality' },
          { label: 'Scrap analysis', path: '/make/scrap-analysis' },
          { label: 'CAPA', path: '/make/capa' },
        ],
      },
      {
        heading: 'Catalog & Config',
        items: [
          { label: 'Products', path: '/make/products' },
          { label: 'Settings', path: '/make/settings' },
        ],
      },
    ],
  },
  {
    label: 'Ship',
    animatedIcon: MODULE_ICONS.ship,
    groupedSubItems: [
      {
        heading: '',
        items: [
          { label: 'Dashboard', path: '/ship' },
        ],
      },
      {
        heading: 'Fulfillment',
        items: [
          { label: 'Orders', path: '/ship/orders' },
          { label: 'Packaging', path: '/ship/packaging' },
          { label: 'Shipping', path: '/ship/shipping' },
          { label: 'Scan to ship', path: '/ship/scan-to-ship' },
        ],
      },
      {
        heading: 'Logistics',
        items: [
          { label: 'Tracking', path: '/ship/tracking' },
          { label: 'Warehouse', path: '/ship/warehouse' },
          { label: 'Carrier rates', path: '/ship/carrier-rates' },
        ],
      },
      {
        heading: 'Returns & Config',
        items: [
          { label: 'Returns', path: '/ship/returns' },
          { label: 'Reports', path: '/ship/reports' },
          { label: 'Settings', path: '/ship/settings' },
        ],
      },
    ],
  },
  {
    label: 'Book',
    animatedIcon: MODULE_ICONS.book,
    groupedSubItems: [
      {
        heading: '',
        items: [
          { label: 'Dashboard', path: '/book' },
        ],
      },
      {
        heading: 'Receivables & Payables',
        items: [
          { label: 'Invoices', path: '/book/invoices' },
          { label: 'Expenses', path: '/book/expenses' },
          { label: 'Purchase Orders', path: '/book/purchases' },
        ],
      },
      {
        heading: 'Costing & Valuation',
        items: [
          { label: 'Job Costs', path: '/book/job-costs' },
          { label: 'WIP valuation', path: '/book/wip' },
          { label: 'Cost variance', path: '/book/cost-variance' },
          { label: 'Stock Valuation', path: '/book/stock-valuation' },
        ],
      },
      {
        heading: 'Budget & Config',
        items: [
          { label: 'Budget', path: '/book/budget' },
          { label: 'Reports', path: '/book/reports' },
          { label: 'Settings', path: '/book/settings' },
        ],
      },
    ],
  },
  {
    label: 'Control',
    animatedIcon: MODULE_ICONS.control,
    section: 'Settings',
    groupedSubItems: [
      {
        heading: '',
        items: [
          { label: 'Dashboard', path: '/control' },
        ],
      },
      {
        heading: 'Factory',
        items: [
          { label: 'Factory Designer', path: '/control/factory-layout' },
          { label: 'Process Builder', path: '/control/process-builder' },
          { label: 'Machines', path: '/control/machines' },
          { label: 'Operations', path: '/control/operations' },
          { label: 'Routes', path: '/control/routes' },
          { label: 'Locations', path: '/control/locations' },
        ],
      },
      {
        heading: 'Inventory & Products',
        items: [
          { label: 'Products', path: '/control/products' },
          { label: 'Product Studio', path: '/plan/product-studio' },
          { label: 'BOMs', path: '/control/boms' },
          { label: 'Purchase', path: '/control/purchase' },
        ],
      },
      {
        heading: 'People & Access',
        items: [
          { label: 'People', path: '/control/people' },
          { label: 'Groups', path: '/control/groups' },
          { label: 'Shifts', path: '/control/shifts' },
          { label: 'Gamification', path: '/control/gamification' },
          { label: 'Access audit', path: '/control/audit' },
        ],
      },
      {
        heading: 'Workspace',
        items: [
          { label: 'Billing & subscription', path: '/control/billing' },
        ],
      },
      {
        heading: 'Operations',
        items: [
          { label: 'Maintenance', path: '/control/maintenance' },
          { label: 'Tooling', path: '/control/tooling' },
          { label: 'Documents', path: '/control/documents' },
        ],
      },
      {
        heading: 'Configuration',
        items: [
          { label: 'Workflow Designer', path: '/control/workflow-designer' },
          { label: 'MirrorWorks Bridge', path: '/control/mirrorworks-bridge' },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Animation constants — silky smooth, slower durations
// ---------------------------------------------------------------------------

const EXPAND_DURATION = 'var(--duration-medium2)';
const EXPAND_EASING = 'var(--ease-standard)';

/** M3 `--ease-standard`: cubic-bezier(0.2, 0, 0, 1) — Y at linear time t (X=t on curve). */
function easeStandardAt(t: number): number {
  const p1x = 0.2;
  const p1y = 0;
  const p2x = 0;
  const p2y = 1;
  const bez = (u: number, a: number, b: number, c: number, d: number) => {
    const o = 1 - u;
    return o * o * o * a + 3 * o * o * u * b + 3 * o * u * u * c + u * u * u * d;
  };
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    if (bez(mid, 0, p1x, p2x, 1) < t) lo = mid;
    else hi = mid;
  }
  const u = (lo + hi) / 2;
  return bez(u, 0, p1y, p2y, 1);
}

const SNAP_UNDER_SEARCH_PADDING_PX = 5;
const SNAP_SCROLL_DURATION_MS = 500;

function animateScrollTop(
  el: HTMLElement,
  targetTop: number,
  durationMs: number,
  animToken: { cancelled: boolean }
) {
  const start = el.scrollTop;
  const delta = targetTop - start;
  if (Math.abs(delta) < 0.5) return;

  const t0 = performance.now();

  function frame(now: number) {
    if (animToken.cancelled) return;
    const t = Math.min(1, (now - t0) / durationMs);
    const eased = easeStandardAt(t);
    // Recompute max scroll each frame — content may still be expanding
    // via CSS grid transition, so scrollHeight grows over time.
    const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
    const clampedTarget = Math.max(0, Math.min(maxScroll, targetTop));
    el.scrollTop = start + (clampedTarget - start) * eased;
    if (t < 1) {
      requestAnimationFrame(frame);
    }
  }
  requestAnimationFrame(frame);
}

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
    if (item.groupedSubItems) {
      for (const group of item.groupedSubItems) {
        for (const sub of group.items) {
          if (pathname === sub.path || pathname.startsWith(sub.path + '/')) {
            return item.label;
          }
        }
      }
    }
  }
  return null;
}

/** Flatten grouped sub-items for lookup convenience */
function getAllSubItems(item: MenuItem): SubMenuItem[] {
  if (item.subItems) return item.subItems;
  if (item.groupedSubItems) return item.groupedSubItems.flatMap(g => g.items);
  return [];
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
          className="ml-6 mt-1.5 flex flex-col gap-[5px]"
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
          animateOnHover={isHovered}
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
  outerRef,
}: {
  item: MenuItem;
  hasSubItems: boolean;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
  /** Root element for scroll-into-view under the search bar (parent + subtree block). */
  outerRef?: React.Ref<HTMLDivElement>;
}) {
  const [isHovered, setIsHovered] = useState(false);

  // When this module is expanded, pin its header to the top of the
  // scroll container so the user can always see where they are even when
  // the sub-item list overflows. Only the header is sticky — children
  // scroll underneath it.
  const headerWrapperClass = cn(
    'w-full',
    isExpanded && 'sticky top-0 z-10 bg-[var(--neutral-50)]'
  );

  return (
    <div
      ref={outerRef}
      className="w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={headerWrapperClass}>
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
      </div>

      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared sub-item link — icon + label + hover tooltip with description
// ---------------------------------------------------------------------------

function SubItemLink({
  subItem,
  isActive,
  isHovered,
  onPointerMove,
  onPointerLeave,
  size = 'md',
}: {
  subItem: SubMenuItem;
  isActive: boolean;
  isHovered: boolean;
  onPointerMove: () => void;
  onPointerLeave: () => void;
  /** md = 48px (flat), sm = 40px (grouped) */
  size?: 'md' | 'sm';
}) {
  const meta = getSubItemMeta(subItem.path);
  const Icon = meta?.icon;
  const heightClass = size === 'sm' ? 'h-10' : 'h-12';

  return (
    <Link to={subItem.path} className="group/sub relative block">
      <div
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className={cn(
          'relative flex items-center gap-2.5 px-4 rounded-full',
          heightClass,
          'transition-[background-color,color] duration-200 ease-[cubic-bezier(0,0,0,1)]',
          isActive
            ? 'bg-[var(--mw-mirage)] text-white'
            : 'bg-transparent text-foreground'
        )}
      >
        {!isActive && (
          <span
            className={cn(
              'absolute inset-x-0 rounded-full bg-[var(--neutral-200)] transition-[opacity,inset]',
              isHovered
                ? 'opacity-100 -inset-y-[2px] duration-200 ease-[cubic-bezier(0.3,0,1,1)]'
                : 'opacity-0 inset-y-0 duration-[550ms] ease-[cubic-bezier(0,0,0,1)]'
            )}
          />
        )}
        {Icon && (
          <Icon
            className={cn(
              'relative w-4 h-4 shrink-0',
              isActive ? 'text-white' : 'text-[var(--neutral-500)]'
            )}
            strokeWidth={1.75}
            aria-hidden
          />
        )}
        <span className="relative text-sm truncate flex-1">
          {subItem.label}
        </span>
      </div>

      {/* Description tooltip on hover (progressive disclosure, heuristic #6) */}
      {meta?.description && (
        <span
          className={cn(
            'pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50',
            'px-2.5 py-1.5 rounded-lg bg-[var(--mw-mirage)] text-white text-xs font-medium whitespace-nowrap',
            'opacity-0 -translate-x-1 transition-all duration-150',
            'group-hover/sub:opacity-100 group-hover/sub:translate-x-0',
            'shadow-lg max-w-[260px]'
          )}
        >
          {meta.description}
        </span>
      )}
    </Link>
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
              ? 'bg-[var(--mw-yellow-600)]/20 text-primary-foreground/60 border border-[var(--mw-yellow-600)]/30'
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
              <span className="text-white text-xs font-medium">
                {getUserInitials(mockUserContext.displayName)}
              </span>
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm text-foreground truncate">{mockUserContext.displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{mockUserContext.role}</p>
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
// Rail icon button — used in tablet icon-rail mode
// ---------------------------------------------------------------------------

function RailIconButton({
  item,
  isActive,
}: {
  item: MenuItem;
  isActive: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const firstSubPath = getAllSubItems(item)[0]?.path ?? item.path ?? '/';

  return (
    <Link
      to={firstSubPath}
      className={cn(
        'group relative flex items-center justify-center w-11 h-11 rounded-[var(--shape-md)]',
        'transition-all duration-[var(--duration-medium1)] ease-[var(--ease-standard)]',
        isActive
          ? 'bg-[var(--mw-mirage)] text-white'
          : 'text-foreground hover:bg-[var(--neutral-200)]'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={item.label}
    >
      {item.animatedIcon ? (
        <item.animatedIcon
          size={ICON_SIZES.sidebar}
          animateOnHover
          className={isActive ? 'text-white' : 'text-foreground'}
        />
      ) : item.icon ? (
        <item.icon
          className={cn('w-5 h-5', isActive ? 'text-white' : 'text-foreground')}
          strokeWidth={1.5}
        />
      ) : null}
      {/* Tooltip on hover */}
      <span
        className={cn(
          'absolute left-full ml-2 px-2.5 py-1.5 rounded-lg bg-[var(--mw-mirage)] text-white text-xs font-medium whitespace-nowrap z-50 pointer-events-none',
          'opacity-0 -translate-x-1 transition-all duration-150',
          'group-hover:opacity-100 group-hover:translate-x-0'
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Sidebar component
// ---------------------------------------------------------------------------

interface SidebarProps {
  /** 'full' = desktop expanded sidebar, 'rail' = tablet icon-only rail */
  variant?: 'full' | 'rail';
  /** Whether the user can manually toggle between full and rail (desktop only). */
  canToggleCollapse?: boolean;
  /** True when the user has manually collapsed the sidebar (used for icon state). */
  collapsed?: boolean;
  /** Callback fired when the user clicks the collapse/expand toggle. */
  onToggleCollapse?: () => void;
}

export function Sidebar({
  variant = 'full',
  canToggleCollapse = false,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isRail = variant === 'rail';

  const { open: commandOpen, initialQuery, setOpen: setCommandOpen } = useCommandPaletteStore();
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const [expandedModule, setExpandedModule] = useState<string | null>(
    () => getActiveModule(location.pathname)
  );
  const [hoveredSubPath, setHoveredSubPath] = useState<string | null>(null);

  const navScrollRef = useRef<HTMLDivElement | null>(null);
  const searchBarRef = useRef<HTMLButtonElement | null>(null);
  const moduleRowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollSnapTokenRef = useRef<{ cancelled: boolean } | null>(null);
  /** Set only when the user opens a module; cleared in layout effect after snapping. */
  const pendingScrollSnapLabelRef = useRef<string | null>(null);

  useEffect(() => {
    const active = getActiveModule(location.pathname);
    if (active && active !== expandedModule) {
      setExpandedModule(active);
    }
  }, [location.pathname]);

  const runScrollSnapUnderSearch = useCallback((label: string) => {
    const scrollEl = navScrollRef.current;
    const searchEl = searchBarRef.current;
    const rowEl = moduleRowRefs.current[label];
    if (!scrollEl || !searchEl || !rowEl) return;

    if (scrollSnapTokenRef.current) {
      scrollSnapTokenRef.current.cancelled = true;
    }
    const token = { cancelled: false };
    scrollSnapTokenRef.current = token;

    const searchRect = searchEl.getBoundingClientRect();
    const rowRect = rowEl.getBoundingClientRect();
    const delta =
      rowRect.top - searchRect.bottom - SNAP_UNDER_SEARCH_PADDING_PX;
    if (Math.abs(delta) < 1) return;

    const targetScroll = scrollEl.scrollTop + delta;
    animateScrollTop(
      scrollEl,
      targetScroll,
      SNAP_SCROLL_DURATION_MS,
      token
    );
  }, []);

  useLayoutEffect(() => {
    const label = pendingScrollSnapLabelRef.current;
    if (label === null) return;
    pendingScrollSnapLabelRef.current = null;

    const scrollIfReady = () => {
      if (!moduleRowRefs.current[label]) return false;
      runScrollSnapUnderSearch(label);
      return true;
    };

    if (!scrollIfReady()) {
      requestAnimationFrame(() => {
        scrollIfReady();
      });
    }
  }, [expandedModule, runScrollSnapUnderSearch]);

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

  // Seed mock notifications on first visit & start demo simulator
  useEffect(() => {
    seedNotificationsIfEmpty();
    startNotificationSimulator();
  }, []);

  // Helper: is a module currently active?
  const isModuleActive = (item: MenuItem): boolean => {
    if (item.path) return isActiveRoute(item.path);
    const allSubs = getAllSubItems(item);
    return allSubs.some(sub =>
      location.pathname === sub.path || location.pathname.startsWith(sub.path + '/')
    );
  };

  // ─── Rail (tablet) mode ───
  if (isRail) {
    return (
      <div className="bg-[var(--neutral-50)] flex flex-col h-screen w-14 border-r border-[var(--neutral-200)] items-center py-3 gap-1 shrink-0">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center w-11 h-11 mb-2">
          <img
            src={mirrorworksLogomark}
            alt=""
            className="h-8 w-8 shrink-0 object-contain"
            aria-hidden
          />
        </Link>

        {/* Manual collapse toggle — desktop only (canToggleCollapse=true) */}
        {canToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="group relative flex items-center justify-center w-11 h-9 rounded-[var(--shape-md)] text-foreground hover:bg-[var(--neutral-200)] transition-colors"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" strokeWidth={1.5} />
            <span className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg bg-[var(--mw-mirage)] text-white text-xs font-medium whitespace-nowrap z-50 pointer-events-none opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0">
              Expand sidebar
            </span>
          </button>
        )}

        {/* Quick Create — icon only */}
        <QuickCreatePanel open={quickCreateOpen} onOpenChange={setQuickCreateOpen}>
          <button
            type="button"
            className="group relative flex items-center justify-center w-11 h-11 rounded-[var(--shape-md)] bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] transition-colors"
            title="Quick Create"
          >
            <Plus
              size={20}
              animateOnHover
              className="text-primary-foreground"
              strokeWidth={1.5}
            />
            <span className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg bg-[var(--mw-mirage)] text-white text-xs font-medium whitespace-nowrap z-50 pointer-events-none opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0">
              Quick Create
            </span>
          </button>
        </QuickCreatePanel>

        {/* Search — icon only */}
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="group relative flex items-center justify-center w-11 h-11 rounded-[var(--shape-md)] border border-border bg-card hover:bg-[var(--neutral-100)] transition-colors"
          title="Search"
        >
          <Search
            size={20}
            animateOnHover
            className="text-foreground"
            strokeWidth={1.5}
          />
          <span className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg bg-[var(--mw-mirage)] text-white text-xs font-medium whitespace-nowrap z-50 pointer-events-none opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0">
            Search
          </span>
        </button>

        {/* Divider */}
        <div className="w-7 h-px bg-[var(--neutral-200)] my-1" />

        {/* Nav icons — Dock magnification */}
        <div className="flex-1 flex flex-col overflow-y-auto items-center" style={{ scrollbarWidth: 'none' }}>
          <DockNav
            orientation="vertical"
            magnification={52}
            distance={120}
            baseItemSize={44}
            spring={{ mass: 0.1, stiffness: 170, damping: 14 }}
            items={menuConfig.map((item) => {
              const firstSubPath = getAllSubItems(item)[0]?.path ?? item.path ?? '/';
              const active = isModuleActive(item);
              return {
                icon: item.animatedIcon ? (
                  <item.animatedIcon
                    size={ICON_SIZES.sidebar}
                    animateOnHover
                    className={active ? 'text-white' : 'text-foreground'}
                  />
                ) : item.icon ? (
                  <item.icon
                    className={cn('w-5 h-5', active ? 'text-white' : 'text-foreground')}
                    strokeWidth={1.5}
                  />
                ) : null,
                label: item.label,
                onClick: () => {
                  navigate(firstSubPath);
                },
                isActive: active,
                className: active ? 'bg-[var(--mw-mirage)] text-white' : '',
              } satisfies DockItemData;
            })}
          />
        </div>

        {/* Footer — just icons */}
        <div className="flex flex-col items-center gap-1 pt-2 border-t border-border">
          <NotificationBell />
          <div className="w-8 h-8 rounded-full bg-[var(--mw-mirage)] flex items-center justify-center">
            <span className="text-white text-[10px] font-medium">
              {getUserInitials(mockUserContext.displayName)}
            </span>
          </div>
        </div>

        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} initialQuery={initialQuery} />
      </div>
    );
  }

  // ─── Full (desktop) mode ───
  return (
    <div className="bg-[var(--neutral-50)] flex flex-col h-screen w-64 border-r border-[var(--neutral-200)] shrink-0">
      {/* Header */}
      <div className="p-3">
        <div className="h-[36px] flex items-center gap-2.5 px-2">
          <img
            src={mirrorworksLogomark}
            alt=""
            className="h-9 w-9 shrink-0 object-contain"
            aria-hidden
          />
          <p className="flex-1 text-lg font-bold tracking-tight text-foreground truncate">
            Alliance Metal
          </p>
          {canToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="flex items-center justify-center w-7 h-7 rounded-[var(--shape-sm)] text-[var(--neutral-500)] hover:bg-[var(--neutral-200)] hover:text-foreground transition-colors"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-3 space-y-2">
        <QuickCreatePanel open={quickCreateOpen} onOpenChange={setQuickCreateOpen}>
          <button
            type="button"
            className="flex h-12 min-h-[48px] w-full items-center gap-2 rounded-full bg-[var(--mw-yellow-400)] px-4 transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)] hover:bg-[var(--mw-yellow-500)]"
          >
            <Plus
              size={20}
              animateOnHover
              className="shrink-0 text-primary-foreground"
              strokeWidth={1.5}
              aria-hidden
            />
            <span className="flex-1 text-left text-sm font-medium text-primary-foreground">
              Quick Create
            </span>
            <KbdPill keys={['⌘', 'N']} variant="on-yellow" />
          </button>
        </QuickCreatePanel>
        <button
          ref={searchBarRef}
          type="button"
          onClick={() => setCommandOpen(true)}
          className="flex h-12 min-h-[48px] w-full items-center gap-2 rounded-full border border-border bg-card px-3 transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)] hover:bg-[var(--neutral-100)]"
        >
          <Search
            size={20}
            animateOnHover
            className="shrink-0 text-foreground"
            strokeWidth={1.5}
            aria-hidden
          />
          <span className="flex-1 text-left text-sm text-muted-foreground">
            Search
          </span>
          <KbdPill keys={['⌘', 'K']} />
        </button>
      </div>

      {/* Navigation */}
      {/*
        Padding lives on the inner wrapper, not the scroll container, so the
        scrollport has no top/bottom padding gap for content to leak through
        above the sticky expanded-module header.
      */}
      <div
        ref={navScrollRef}
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: 'none' }}
      >
       <div className="px-3 py-4 space-y-0.5">
        {menuConfig.map((item) => {
          const hasSubItems = (item.subItems && item.subItems.length > 0) || (item.groupedSubItems && item.groupedSubItems.length > 0);
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
                hasSubItems={!!hasSubItems}
                isActive={isActive}
                isExpanded={isExpanded}
                outerRef={(el) => {
                  moduleRowRefs.current[item.label] = el;
                }}
                onToggle={() => {
                  if (!hasSubItems) return;
                  const isClosing = expandedModule === item.label;
                  if (isClosing) {
                    if (scrollSnapTokenRef.current) {
                      scrollSnapTokenRef.current.cancelled = true;
                      scrollSnapTokenRef.current = null;
                    }
                    setExpandedModule(null);
                    return;
                  }
                  pendingScrollSnapLabelRef.current = item.label;
                  flushSync(() => {
                    setExpandedModule(item.label);
                  });
                }}
              >

                {/* Flat sub-items (modules with no grouping) */}
                {item.subItems && item.subItems.length > 0 && (
                  <CollapsibleSubMenu isOpen={isExpanded}>
                    {item.subItems.map((subItem) => (
                      <SubItemLink
                        key={subItem.path}
                        subItem={subItem}
                        isActive={isActiveRoute(subItem.path)}
                        isHovered={hoveredSubPath === subItem.path}
                        onPointerMove={() => handleSubItemPointerMove(subItem.path)}
                        onPointerLeave={handleSubItemPointerLeave}
                        size="md"
                      />
                    ))}
                  </CollapsibleSubMenu>
                )}

                {/* Grouped sub-items (Plan, Buy, Control) */}
                {item.groupedSubItems && item.groupedSubItems.length > 0 && (
                  <CollapsibleSubMenu isOpen={isExpanded}>
                    {item.groupedSubItems.map((group) => (
                      <div key={group.heading || '_dashboard'}>
                        {group.heading && (
                          <div className="px-4 pt-3 pb-1">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--neutral-500)]">
                              {group.heading}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-col gap-[5px]">
                          {group.items.map((subItem) => (
                            <SubItemLink
                              key={subItem.path}
                              subItem={subItem}
                              isActive={isActiveRoute(subItem.path)}
                              isHovered={hoveredSubPath === subItem.path}
                              onPointerMove={() => handleSubItemPointerMove(subItem.path)}
                              onPointerLeave={handleSubItemPointerLeave}
                              size="sm"
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </CollapsibleSubMenu>
                )}
              </MenuItemRow>
            </React.Fragment>
          );
        })}
       </div>
      </div>

      {/* Usage Warning Banner */}
      <UsageBanner />

      <p className="px-5 pb-2 text-center text-[10px] font-medium uppercase tracking-wider text-[var(--neutral-400)]">
        Smart FactoryOS
      </p>

      {/* Footer — notification bell + M3 split button: user profile + theme toggle */}
      <div className="p-3 border-t border-border flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <UserProfileSplitButton />
        </div>
        <NotificationBell />
      </div>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} initialQuery={initialQuery} />
    </div>
  );
}
