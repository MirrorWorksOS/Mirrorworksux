/**
 * CommandPalette - Global Cmd+K command palette for MirrorWorks
 *
 * Opens with Cmd+K (Mac) / Ctrl+K (Windows).
 * Provides fuzzy search across pages, quick actions, recent items, and AI.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/components/ui/utils';
import {
  Search,
  LayoutDashboard,
  Users,
  Target,
  Calendar,
  FileText,
  ShoppingCart,
  Receipt,
  Package,
  Briefcase,
  CalendarDays,
  Cpu,
  ClipboardList,
  Factory,
  Shield,
  MapPin,
  CreditCard,
  Zap,
  Settings,
  Plus,
  Upload,
  Clock,
  ArrowRight,
  Sparkles,
  CornerDownLeft,
  type LucideIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface PageItem {
  label: string;
  path: string;
  section: string;
  icon: LucideIcon;
}

interface ActionItem {
  label: string;
  icon: LucideIcon;
  action: () => void;
}

const PAGES: PageItem[] = [
  { label: 'Dashboard', path: '/', section: 'Home', icon: LayoutDashboard },
  { label: 'CRM', path: '/sell/crm', section: 'Sell', icon: Users },
  { label: 'Opportunities', path: '/sell/opportunities', section: 'Sell', icon: Target },
  { label: 'Activities', path: '/sell/activities', section: 'Sell', icon: Calendar },
  { label: 'Quotes', path: '/sell/quotes', section: 'Sell', icon: FileText },
  { label: 'Orders', path: '/sell/orders', section: 'Sell', icon: ShoppingCart },
  { label: 'Invoices', path: '/sell/invoices', section: 'Sell', icon: Receipt },
  { label: 'Products', path: '/sell/products', section: 'Sell', icon: Package },
  { label: 'Dashboard', path: '/plan', section: 'Plan', icon: LayoutDashboard },
  { label: 'Jobs', path: '/plan/jobs', section: 'Plan', icon: Briefcase },
  { label: 'Schedule', path: '/plan/schedule', section: 'Plan', icon: CalendarDays },
  { label: 'NC Connect', path: '/plan/nc-connect', section: 'Plan', icon: Cpu },
  { label: 'Dashboard', path: '/make', section: 'Make', icon: LayoutDashboard },
  { label: 'Manufacturing Orders', path: '/make/manufacturing-orders', section: 'Make', icon: ClipboardList },
  { label: 'Shop Floor', path: '/make/shop-floor', section: 'Make', icon: Factory },
  { label: 'Schedule', path: '/make/schedule', section: 'Make', icon: CalendarDays },
  { label: 'Quality', path: '/make/quality', section: 'Make', icon: Shield },
  { label: 'Dashboard', path: '/ship', section: 'Ship', icon: LayoutDashboard },
  { label: 'Orders', path: '/ship/orders', section: 'Ship', icon: ShoppingCart },
  { label: 'Tracking', path: '/ship/tracking', section: 'Ship', icon: MapPin },
  { label: 'Dashboard', path: '/book', section: 'Book', icon: LayoutDashboard },
  { label: 'Invoices', path: '/book/invoices', section: 'Book', icon: Receipt },
  { label: 'Expenses', path: '/book/expenses', section: 'Book', icon: CreditCard },
  { label: 'Dashboard', path: '/buy', section: 'Buy', icon: LayoutDashboard },
  { label: 'Purchase Orders', path: '/buy/orders', section: 'Buy', icon: ShoppingCart },
  { label: 'Dashboard', path: '/control', section: 'Control', icon: LayoutDashboard },
  { label: 'MirrorWorks Bridge', path: '/control/mirrorworks-bridge', section: 'Control', icon: Zap },
  { label: 'Settings', path: '/sell/settings', section: 'Sell', icon: Settings },
];

// ---------------------------------------------------------------------------
// Recent items (localStorage)
// ---------------------------------------------------------------------------

const RECENT_KEY = 'mw-recent-commands';
const MAX_RECENT = 5;

interface RecentItem {
  label: string;
  path: string;
  section: string;
}

function getRecentItems(): RecentItem[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addRecentItem(item: RecentItem) {
  const items = getRecentItems().filter((r) => r.path !== item.path);
  items.unshift(item);
  localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, MAX_RECENT)));
}

// ---------------------------------------------------------------------------
// Fuzzy match
// ---------------------------------------------------------------------------

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.startsWith(q)) return 3;
  if (t.includes(q)) return 2;
  if (fuzzyMatch(q, t)) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

type Tab = 'all' | 'pages' | 'actions' | 'ai';

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pages', label: 'Pages' },
  { key: 'actions', label: 'Actions' },
  { key: 'ai', label: 'AI' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Actions need navigate, so define them inside component
  const ACTIONS: ActionItem[] = useMemo(() => [
    { label: 'Create Quote', icon: Plus, action: () => navigate('/sell/quotes/new') },
    { label: 'Create Invoice', icon: Plus, action: () => navigate('/sell/invoices/new') },
    { label: 'New Job', icon: Plus, action: () => toast('New job form coming soon') },
    { label: 'New MO', icon: Plus, action: () => toast('New MO form coming soon') },
    { label: 'Import Data', icon: Upload, action: () => navigate('/control/mirrorworks-bridge') },
  ], [navigate]);

  // ---- Global Cmd+K listener ----
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  // Reset state on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveTab('all');
      setActiveIndex(0);
      setAiQuery('');
      setAiResponse(null);
      // Focus input after dialog animation
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // ---- Filter results ----
  const recentItems = useMemo(() => getRecentItems(), [open]);

  const filteredPages = useMemo(() => {
    if (!query) return PAGES;
    return PAGES
      .map((p) => ({
        ...p,
        score: Math.max(
          fuzzyScore(query, p.label),
          fuzzyScore(query, p.section),
          fuzzyScore(query, `${p.section} ${p.label}`)
        ),
      }))
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [query]);

  const filteredActions = useMemo(() => {
    if (!query) return ACTIONS;
    return ACTIONS.filter(
      (a) => fuzzyMatch(query, a.label)
    );
  }, [query, ACTIONS]);

  // Build flat list of selectable items for keyboard nav
  interface SelectableItem {
    type: 'recent' | 'page' | 'action';
    label: string;
    sectionLabel?: string;
    icon: LucideIcon;
    path?: string;
    action?: () => void;
    section?: string;
  }

  const selectableItems = useMemo(() => {
    const items: SelectableItem[] = [];

    if (activeTab === 'ai') return items;

    // Recent (only when no query and on 'all' tab)
    if (!query && (activeTab === 'all')) {
      for (const r of recentItems) {
        const page = PAGES.find((p) => p.path === r.path);
        if (page) {
          items.push({
            type: 'recent',
            label: page.label,
            sectionLabel: 'Recent',
            icon: page.icon,
            path: page.path,
            section: page.section,
          });
        }
      }
    }

    // Pages
    if (activeTab === 'all' || activeTab === 'pages') {
      for (const p of filteredPages) {
        items.push({
          type: 'page',
          label: p.label,
          sectionLabel: 'Pages',
          icon: p.icon,
          path: p.path,
          section: p.section,
        });
      }
    }

    // Actions
    if (activeTab === 'all' || activeTab === 'actions') {
      for (const a of filteredActions) {
        items.push({
          type: 'action',
          label: a.label,
          sectionLabel: 'Actions',
          icon: a.icon,
          action: a.action,
        });
      }
    }

    return items;
  }, [activeTab, query, filteredPages, filteredActions, recentItems]);

  // Clamp active index
  useEffect(() => {
    setActiveIndex(0);
  }, [query, activeTab]);

  // ---- Execute item ----
  const executeItem = useCallback(
    (item: SelectableItem) => {
      if (item.path) {
        addRecentItem({ label: item.label, path: item.path, section: item.section || '' });
        navigate(item.path);
      } else if (item.action) {
        item.action();
      }
      onOpenChange(false);
    },
    [navigate, onOpenChange]
  );

  // ---- Keyboard navigation ----
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (activeTab === 'ai') return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, selectableItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = selectableItems[activeIndex];
        if (item) executeItem(item);
      }
    },
    [activeIndex, selectableItems, executeItem, activeTab]
  );

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // ---- AI submit ----
  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiResponse(
      `Based on your current data, here is what I found for "${aiQuery}": This is a contextual AI response that would analyze your manufacturing data, recent orders, and operational metrics to provide actionable insights.`
    );
  };

  // ---- Group items by section for rendering ----
  const groupedItems = useMemo(() => {
    const groups: { label: string; items: (SelectableItem & { flatIndex: number })[] }[] = [];
    let currentLabel = '';
    for (let i = 0; i < selectableItems.length; i++) {
      const item = selectableItems[i];
      const sLabel = item.sectionLabel || '';
      if (sLabel !== currentLabel) {
        currentLabel = sLabel;
        groups.push({ label: sLabel, items: [] });
      }
      groups[groups.length - 1].items.push({ ...item, flatIndex: i });
    }
    return groups;
  }, [selectableItems]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[1050] bg-black/20 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed top-[15%] left-[50%] z-[1050] w-full max-w-2xl translate-x-[-50%] rounded-[var(--shape-lg)] border border-[var(--border)] bg-white shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200"
          onKeyDown={handleKeyDown}
        >
          {/* Hidden title for a11y */}
          <DialogPrimitive.Title className="sr-only">
            Command Palette
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search pages, actions, and AI across MirrorWorks
          </DialogPrimitive.Description>

          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 h-14">
            <Search className="h-5 w-5 shrink-0 text-[var(--neutral-400)]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages, actions, AI..."
              className="flex-1 h-full bg-transparent text-base text-foreground placeholder:text-[var(--neutral-400)] outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-[var(--neutral-100)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--neutral-500)]">
              ESC
            </kbd>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 pt-2 pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-full transition-colors duration-150',
                  activeTab === tab.key
                    ? 'bg-[var(--mw-mirage)] text-white'
                    : 'text-[var(--neutral-500)] hover:bg-[var(--neutral-100)] hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Results */}
          {activeTab !== 'ai' ? (
            <div
              ref={listRef}
              className="max-h-[400px] overflow-y-auto px-2 pb-2"
            >
              {groupedItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-[var(--neutral-400)]">
                  <Search className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">No results found</p>
                </div>
              )}

              {groupedItems.map((group) => (
                <div key={group.label} className="mt-2">
                  <div className="px-3 py-1.5 text-xs uppercase tracking-wider text-[var(--neutral-500)] font-medium">
                    {group.label}
                  </div>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.flatIndex === activeIndex;
                    return (
                      <button
                        key={`${item.type}-${item.path || item.label}-${item.flatIndex}`}
                        data-index={item.flatIndex}
                        type="button"
                        onClick={() => executeItem(item)}
                        onMouseEnter={() => setActiveIndex(item.flatIndex)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--shape-md)] text-left transition-colors duration-100',
                          isActive
                            ? 'bg-[var(--neutral-100)]'
                            : 'hover:bg-[var(--neutral-50)]'
                        )}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--shape-md)] bg-[var(--neutral-100)]">
                          {item.type === 'recent' ? (
                            <Clock className="h-4 w-4 text-[var(--neutral-500)]" />
                          ) : (
                            <Icon className="h-4 w-4 text-[var(--neutral-500)]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground">
                            {item.label}
                          </span>
                          {item.section && (
                            <span className="ml-2 text-xs text-[var(--neutral-400)]">
                              {item.section}
                              {item.path && (
                                <>
                                  <span className="mx-1">/</span>
                                  {item.label}
                                </>
                              )}
                            </span>
                          )}
                        </div>
                        {isActive && (
                          <ArrowRight className="h-4 w-4 shrink-0 text-[var(--neutral-400)]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            /* AI tab */
            <div className="px-4 pb-4 pt-2">
              <form onSubmit={handleAiSubmit} className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 border border-[var(--border)] rounded-[var(--shape-md)] px-3 py-2.5 focus-within:ring-2 focus-within:ring-[var(--mw-yellow-400)]/30">
                  <Sparkles className="h-4 w-4 shrink-0 text-[var(--mw-yellow-400)]" />
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="Ask anything..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-[var(--neutral-400)] outline-none"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 text-xs text-[var(--neutral-400)] hover:text-foreground transition-colors"
                  >
                    <CornerDownLeft className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>

              {aiResponse && (
                <div className="mt-3 rounded-[var(--shape-md)] border border-[var(--border)] bg-[var(--neutral-50)] p-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 mt-0.5 shrink-0 text-[var(--mw-yellow-400)]" />
                    <p className="text-sm text-foreground leading-relaxed">
                      {aiResponse}
                    </p>
                  </div>
                </div>
              )}

              {!aiResponse && (
                <div className="flex flex-col items-center justify-center py-12 text-[var(--neutral-400)]">
                  <Sparkles className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">Ask anything about your data</p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-2 text-[10px] text-[var(--neutral-400)]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-[var(--neutral-100)] px-1 py-0.5 font-medium">
                  <span className="text-[9px]">&#8593;&#8595;</span>
                </kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-[var(--neutral-100)] px-1 py-0.5 font-medium">
                  <span className="text-[9px]">&#9166;</span>
                </kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-[var(--neutral-100)] px-1 py-0.5 font-medium">esc</kbd>
                Close
              </span>
            </div>
            <span className="text-[var(--neutral-300)]">MirrorWorks</span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
