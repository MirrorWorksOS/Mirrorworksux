/**
 * QuickCreatePanel - Role-aware quick create dropdown
 *
 * Shows contextual creation options based on user role and groups.
 * Inspired by Linear/Notion quick create menus with keyboard shortcuts.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/components/ui/utils';
import {
  FileText,
  Receipt,
  Target,
  Users,
  Briefcase,
  ClipboardList,
  ShoppingCart,
  Truck,
  Package,
  Shield,
  Upload,
  Workflow,
  Factory,
  BarChart3,
  Settings,
  ChevronRight,
  Plus,
  type LucideIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Role system (mirrors CommandPalette)
// ---------------------------------------------------------------------------

type UserRole = 'sales' | 'production' | 'purchasing' | 'finance' | 'shipping' | 'admin';

const CURRENT_USER_ROLE: UserRole = 'admin';

// ---------------------------------------------------------------------------
// Quick create items
// ---------------------------------------------------------------------------

interface QuickCreateItem {
  label: string;
  icon: LucideIcon;
  shortcut?: string;
  description?: string;
  module: string;
  roles: UserRole[];
  action: string; // path or 'toast'
}

const QUICK_CREATE_ITEMS: QuickCreateItem[] = [
  // Sell
  { label: 'Quote', icon: FileText, shortcut: '⌘Q', description: 'New sales quote', module: 'Sell', roles: ['sales', 'admin'], action: '/sell/quotes/new' },
  { label: 'Invoice', icon: Receipt, description: 'New sales invoice', module: 'Sell', roles: ['sales', 'finance', 'admin'], action: '/sell/invoices/new' },
  { label: 'Opportunity', icon: Target, description: 'Track a new deal', module: 'Sell', roles: ['sales', 'admin'], action: '/sell/opportunities/new' },
  { label: 'Lead', icon: Users, description: 'New prospect', module: 'Sell', roles: ['sales', 'admin'], action: '/sell/crm/new' },
  { label: 'Sales Order', icon: ShoppingCart, description: 'New sales order', module: 'Sell', roles: ['sales', 'admin'], action: '/sell/orders/new' },
  // Plan
  // TODO(backend): jobs.create — wire to /plan/jobs/new once the Plan create flow exists.
  { label: 'Job', icon: Briefcase, shortcut: '⌘J', description: 'Create production job', module: 'Plan', roles: ['production', 'admin'], action: 'toast' },
  { label: 'Quality Plan', icon: Shield, description: 'New QC plan', module: 'Plan', roles: ['production', 'admin'], action: '/plan/qc-planning' },
  // Make
  // TODO(backend): manufacturingOrders.create — wire to /make/manufacturing-orders/new once the Make create flow exists.
  { label: 'Manufacturing Order', icon: ClipboardList, shortcut: '⌘M', description: 'Create MO', module: 'Make', roles: ['production', 'admin'], action: 'toast' },
  // Buy
  { label: 'Purchase Order', icon: ShoppingCart, description: 'Create PO', module: 'Buy', roles: ['purchasing', 'admin'], action: '/buy/orders/new' },
  { label: 'Requisition', icon: ClipboardList, description: 'New purchase request', module: 'Buy', roles: ['purchasing', 'admin'], action: '/buy/requisitions/new' },
  { label: 'RFQ', icon: FileText, description: 'Request for quote', module: 'Buy', roles: ['purchasing', 'admin'], action: '/buy/rfqs?new=1' },
  // Ship
  { label: 'Shipment', icon: Truck, description: 'New shipment', module: 'Ship', roles: ['shipping', 'admin'], action: '/ship/shipping' },
  // Book
  { label: 'Expense', icon: BarChart3, description: 'Log an expense', module: 'Book', roles: ['finance', 'admin'], action: '/book/expenses' },
  // Control
  { label: 'Workflow', icon: Workflow, shortcut: '⌘W', description: 'Build automation', module: 'Control', roles: ['admin'], action: '/control/workflow-designer' },
  { label: 'Import Data', icon: Upload, description: 'MirrorWorks Bridge', module: 'Control', roles: ['admin'], action: '/control/mirrorworks-bridge' },
];

// Module display order for grouping
const MODULE_ORDER = ['Sell', 'Plan', 'Make', 'Buy', 'Ship', 'Book', 'Control'];

// Module colors for icon wells
const MODULE_COLORS: Record<string, { bg: string; text: string }> = {
  Sell: { bg: 'bg-[var(--badge-soft-accent-bg)]', text: 'text-[var(--badge-soft-accent-text)]' },
  Plan: { bg: 'bg-[var(--mw-blue-50)]', text: 'text-[var(--mw-blue)]' },
  Make: { bg: 'bg-[var(--mw-green-50)]', text: 'text-[var(--mw-green)]' },
  Buy: { bg: 'bg-[var(--mw-purple-50)]', text: 'text-[var(--mw-purple)]' },
  Ship: { bg: 'bg-[var(--badge-soft-accent-bg)]', text: 'text-[var(--badge-soft-accent-text)]' },
  Book: { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-600)]' },
  Control: { bg: 'bg-[var(--neutral-100)]', text: 'text-foreground' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface QuickCreatePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function QuickCreatePanel({ open, onOpenChange, children }: QuickCreatePanelProps) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter items by role
  const availableItems = useMemo(() =>
    QUICK_CREATE_ITEMS.filter(item => item.roles.includes(CURRENT_USER_ROLE)),
    []
  );

  // Group by module
  const groupedItems = useMemo(() => {
    const groups: { module: string; items: (QuickCreateItem & { flatIndex: number })[] }[] = [];
    const moduleMap = new Map<string, (QuickCreateItem & { flatIndex: number })[]>();
    let flatIdx = 0;

    for (const item of availableItems) {
      if (!moduleMap.has(item.module)) {
        moduleMap.set(item.module, []);
      }
      moduleMap.get(item.module)!.push({ ...item, flatIndex: flatIdx++ });
    }

    for (const mod of MODULE_ORDER) {
      const items = moduleMap.get(mod);
      if (items && items.length > 0) {
        groups.push({ module: mod, items });
      }
    }

    return groups;
  }, [availableItems]);

  const totalItems = availableItems.length;

  // Reset on open
  useEffect(() => {
    if (open) {
      setActiveIndex(0);
    }
  }, [open]);

  // Execute
  const executeItem = useCallback((item: QuickCreateItem) => {
    if (item.action === 'toast') {
      // TODO(backend): wire each item with action: 'toast' to a real create flow.
      toast.success(`${item.label} created`);
    } else {
      navigate(item.action);
    }
    onOpenChange(false);
  }, [navigate, onOpenChange]);

  // Keyboard nav
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, totalItems - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = availableItems[activeIndex];
      if (item) executeItem(item);
    } else if (e.key === 'Escape') {
      onOpenChange(false);
    }
  }, [activeIndex, availableItems, executeItem, totalItems, onOpenChange]);

  // Scroll active into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-qc-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        {children}
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="bottom"
          align="start"
          sideOffset={6}
          className={cn(
            "z-[1050] w-[280px] rounded-[var(--shape-lg)] border border-[var(--neutral-200)] bg-popover",
            "shadow-[0_16px_48px_-8px_rgba(0,0,0,0.15)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-[0.96] data-[state=open]:zoom-in-[0.96]",
            "data-[side=bottom]:slide-in-from-top-1.5",
            "data-[side=top]:slide-in-from-bottom-1.5",
            "duration-[200ms] ease-[cubic-bezier(0.05,0.7,0.1,1.0)]",
            "overflow-hidden outline-none",
          )}
          onKeyDown={handleKeyDown}
        >
          {/* Header */}
          <div className="px-4 pt-3 pb-2">
            <p className="text-[11px] uppercase tracking-wider text-[var(--neutral-400)] font-medium select-none">
              Quick create (⌘+Q)
            </p>
          </div>

          {/* Items list */}
          <div ref={listRef} className="max-h-[380px] overflow-y-auto px-1.5 pb-1.5">
            {groupedItems.map((group, gi) => (
              <div key={group.module} className={cn(gi > 0 && "mt-1")}>
                {/* Module divider label */}
                {groupedItems.length > 1 && (
                  <div className="px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--neutral-400)] font-medium select-none">
                    {group.module}
                  </div>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.flatIndex === activeIndex;
                  const colors = MODULE_COLORS[item.module] || MODULE_COLORS.Control;
                  return (
                    <button
                      key={`${item.module}-${item.label}`}
                      data-qc-index={item.flatIndex}
                      type="button"
                      onClick={() => executeItem(item)}
                      onMouseEnter={() => setActiveIndex(item.flatIndex)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--shape-md)] text-left',
                        'transition-all duration-[var(--duration-short2)] ease-[var(--ease-standard)]',
                        isActive
                          ? 'bg-[var(--neutral-100)]'
                          : 'hover:bg-[var(--neutral-50)]'
                      )}
                    >
                      {/* Icon */}
                      <div className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--shape-sm)]',
                        colors.bg,
                      )}>
                        <Icon className={cn('h-4 w-4', colors.text)} strokeWidth={1.5} />
                      </div>

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground">{item.label}</span>
                      </div>

                      {/* Shortcut */}
                      {item.shortcut && (
                        <kbd className="text-[10px] font-medium text-[var(--neutral-400)] shrink-0">
                          {item.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-[var(--neutral-100)] px-4 py-2 flex items-center justify-between">
            <span className="text-[10px] text-[var(--neutral-400)]">
              <kbd className="rounded border border-[var(--neutral-200)] bg-background px-1 py-0.5 font-medium text-[9px]">↑↓</kbd>
              {' '}navigate{' '}
              <kbd className="rounded border border-[var(--neutral-200)] bg-background px-1 py-0.5 font-medium text-[9px] ml-1">↵</kbd>
              {' '}create
            </span>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
