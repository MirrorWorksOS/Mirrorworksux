/**
 * CommandPalette - Global Cmd+K command palette for MirrorWorks
 *
 * Opens with Cmd+K (Mac) / Ctrl+K (Windows).
 * Provides role-aware fuzzy search across pages, actions, people, and AI.
 * Inspired by Raycast / Linear / Mercury command palettes.
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
  Hash,
  Layers,
  Workflow,
  UserCircle,
  Mail,
  BarChart3,
  Truck,
  Wrench,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Role / Group system – determines which suggestions surface first
// ---------------------------------------------------------------------------

type UserRole = 'sales' | 'production' | 'purchasing' | 'finance' | 'shipping' | 'admin';

interface UserProfile {
  name: string;
  role: UserRole;
  groups: string[];
  recentModules: string[];
}

// Simulated current user – in production this comes from auth context
const CURRENT_USER: UserProfile = {
  name: 'Matt Quigley',
  role: 'admin',
  groups: ['Management', 'Sales', 'Production'],
  recentModules: ['Sell', 'Plan', 'Make'],
};

// Maps roles to their primary modules for priority sorting
const ROLE_MODULE_MAP: Record<UserRole, string[]> = {
  sales: ['Sell'],
  production: ['Plan', 'Make'],
  purchasing: ['Buy'],
  finance: ['Book'],
  shipping: ['Ship'],
  admin: ['Sell', 'Plan', 'Make', 'Ship', 'Book', 'Buy', 'Control'],
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface PageItem {
  label: string;
  path: string;
  section: string;
  icon: LucideIcon;
  keywords?: string[];
}

interface ActionItem {
  label: string;
  icon: LucideIcon;
  section: string;
  description?: string;
  shortcut?: string;
  roles?: UserRole[];
  action: () => void;
}

interface PersonItem {
  name: string;
  email: string;
  role: string;
  icon: LucideIcon;
}

const PAGES: PageItem[] = [
  { label: 'Dashboard', path: '/', section: 'Home', icon: LayoutDashboard, keywords: ['home', 'overview'] },
  { label: 'CRM', path: '/sell/crm', section: 'Sell', icon: Users, keywords: ['contacts', 'customers', 'leads'] },
  { label: 'Opportunities', path: '/sell/opportunities', section: 'Sell', icon: Target, keywords: ['pipeline', 'deals'] },
  { label: 'Activities', path: '/sell/activities', section: 'Sell', icon: Calendar, keywords: ['tasks', 'calls', 'meetings'] },
  { label: 'Quotes', path: '/sell/quotes', section: 'Sell', icon: FileText, keywords: ['estimate', 'proposal', 'pricing'] },
  { label: 'Orders', path: '/sell/orders', section: 'Sell', icon: ShoppingCart, keywords: ['sales orders'] },
  { label: 'Invoices', path: '/sell/invoices', section: 'Sell', icon: Receipt, keywords: ['billing', 'payment'] },
  { label: 'Products', path: '/sell/products', section: 'Sell', icon: Package, keywords: ['catalog', 'items'] },
  { label: 'Dashboard', path: '/buy', section: 'Buy', icon: LayoutDashboard },
  { label: 'Purchase Orders', path: '/buy/orders', section: 'Buy', icon: ShoppingCart, keywords: ['po', 'procurement'] },
  { label: 'Requisitions', path: '/buy/requisitions', section: 'Buy', icon: ClipboardList, keywords: ['request'] },
  { label: 'Suppliers', path: '/buy/suppliers', section: 'Buy', icon: Users, keywords: ['vendors'] },
  { label: 'RFQs', path: '/buy/rfqs', section: 'Buy', icon: FileText, keywords: ['request for quote'] },
  { label: 'Dashboard', path: '/plan', section: 'Plan', icon: LayoutDashboard },
  { label: 'Jobs', path: '/plan/jobs', section: 'Plan', icon: Briefcase, keywords: ['work orders'] },
  { label: 'Schedule', path: '/plan/schedule', section: 'Plan', icon: CalendarDays, keywords: ['gantt', 'timeline'] },
  { label: 'NC Connect', path: '/plan/nc-connect', section: 'Plan', icon: Cpu, keywords: ['nesting', 'cnc'] },
  { label: 'Quality', path: '/plan/qc-planning', section: 'Plan', icon: Shield, keywords: ['qc', 'inspection'] },
  { label: 'Dashboard', path: '/make', section: 'Make', icon: LayoutDashboard },
  { label: 'Manufacturing Orders', path: '/make/manufacturing-orders', section: 'Make', icon: ClipboardList, keywords: ['mo', 'production'] },
  { label: 'Shop Floor', path: '/make/shop-floor', section: 'Make', icon: Factory, keywords: ['production', 'operations'] },
  { label: 'Schedule', path: '/make/schedule', section: 'Make', icon: CalendarDays },
  { label: 'Quality', path: '/make/quality', section: 'Make', icon: Shield, keywords: ['qc', 'inspection'] },
  { label: 'Time Clock', path: '/make/time-clock', section: 'Make', icon: Clock, keywords: ['attendance', 'hours'] },
  { label: 'Dashboard', path: '/ship', section: 'Ship', icon: LayoutDashboard },
  { label: 'Orders', path: '/ship/orders', section: 'Ship', icon: ShoppingCart },
  { label: 'Tracking', path: '/ship/tracking', section: 'Ship', icon: MapPin, keywords: ['delivery', 'freight'] },
  { label: 'Packaging', path: '/ship/packaging', section: 'Ship', icon: Package },
  { label: 'Warehouse', path: '/ship/warehouse', section: 'Ship', icon: Layers, keywords: ['inventory', 'stock'] },
  { label: 'Dashboard', path: '/book', section: 'Book', icon: LayoutDashboard },
  { label: 'Invoices', path: '/book/invoices', section: 'Book', icon: Receipt },
  { label: 'Expenses', path: '/book/expenses', section: 'Book', icon: CreditCard },
  { label: 'Budget', path: '/book/budget', section: 'Book', icon: BarChart3 },
  { label: 'Job Costs', path: '/book/job-costs', section: 'Book', icon: Briefcase, keywords: ['costing'] },
  { label: 'Reports', path: '/book/reports', section: 'Book', icon: BarChart3 },
  { label: 'Dashboard', path: '/control', section: 'Control', icon: LayoutDashboard },
  { label: 'MirrorWorks Bridge', path: '/control/mirrorworks-bridge', section: 'Control', icon: Zap, keywords: ['import', 'migration'] },
  { label: 'Factory Designer', path: '/control/factory-layout', section: 'Control', icon: Factory, keywords: ['layout'] },
  { label: 'Process Builder', path: '/control/process-builder', section: 'Control', icon: Workflow, keywords: ['automation'] },
  { label: 'People', path: '/control/people', section: 'Control', icon: Users, keywords: ['employees', 'team'] },
  { label: 'Machines', path: '/control/machines', section: 'Control', icon: Wrench, keywords: ['equipment'] },
  { label: 'Inventory', path: '/control/inventory', section: 'Control', icon: Package, keywords: ['stock'] },
  { label: 'Workflow Designer', path: '/control/workflow-designer', section: 'Control', icon: Workflow },
  { label: 'Role Designer', path: '/control/role-designer', section: 'Control', icon: Shield, keywords: ['permissions'] },
  { label: 'Settings', path: '/sell/settings', section: 'Sell', icon: Settings },
];

const PEOPLE: PersonItem[] = [
  { name: 'Samuel Stephenson', email: 'samsteve@company.org', role: 'Sales Manager', icon: UserCircle },
  { name: 'Joséphine Dubois', email: 'josephine@company.org', role: 'Finance Director', icon: UserCircle },
  { name: 'Alex Chen', email: 'alex.chen@company.org', role: 'Production Lead', icon: UserCircle },
  { name: 'Sarah Mitchell', email: 'sarah.m@company.org', role: 'Purchasing Manager', icon: UserCircle },
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
  if (t === q) return 5;
  if (t.startsWith(q)) return 4;
  if (t.includes(q)) return 3;
  // Check word boundaries
  const words = t.split(/\s+/);
  if (words.some(w => w.startsWith(q))) return 3;
  if (fuzzyMatch(q, t)) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Filter categories (chips)
// ---------------------------------------------------------------------------

type FilterCategory = 'all' | 'pages' | 'actions' | 'people' | 'ai';

const FILTER_CATEGORIES: { key: FilterCategory; label: string; icon: LucideIcon }[] = [
  { key: 'all', label: 'All', icon: Search },
  { key: 'pages', label: 'Pages', icon: Layers },
  { key: 'actions', label: 'Actions', icon: Zap },
  { key: 'people', label: 'People', icon: Users },
  { key: 'ai', label: 'AI', icon: Sparkles },
];

// ---------------------------------------------------------------------------
// Suggested actions per role
// ---------------------------------------------------------------------------

function getSuggestedSearches(role: UserRole): string[] {
  switch (role) {
    case 'sales':
      return ['Quotes', 'CRM', 'Opportunities', 'Invoices'];
    case 'production':
      return ['Shop Floor', 'Schedule', 'Manufacturing Orders', 'Quality'];
    case 'purchasing':
      return ['Purchase Orders', 'Suppliers', 'RFQs', 'Inventory'];
    case 'finance':
      return ['Invoices', 'Expenses', 'Budget', 'Job Costs'];
    case 'shipping':
      return ['Tracking', 'Packaging', 'Warehouse', 'Orders'];
    case 'admin':
      return ['Dashboard', 'People', 'Bridge', 'Reports'];
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
}

export function CommandPalette({ open, onOpenChange, initialQuery = '' }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const userModules = ROLE_MODULE_MAP[CURRENT_USER.role];

  // Actions – role-aware with shortcuts
  const ACTIONS: ActionItem[] = useMemo(() => [
    { label: 'Create Quote', icon: FileText, section: 'Sell', description: 'New sales quote', shortcut: '⌘Q', roles: ['sales', 'admin'], action: () => navigate('/sell/quotes/new') },
    { label: 'Create Invoice', icon: Receipt, section: 'Sell', description: 'New sales invoice', roles: ['sales', 'finance', 'admin'], action: () => navigate('/sell/invoices/new') },
    { label: 'New Opportunity', icon: Target, section: 'Sell', description: 'Track a new deal', roles: ['sales', 'admin'], action: () => navigate('/sell/opportunities') },
    { label: 'New Job', icon: Briefcase, section: 'Plan', description: 'Create production job', roles: ['production', 'admin'], action: () => toast('New job form coming soon') },
    { label: 'New Manufacturing Order', icon: ClipboardList, section: 'Make', description: 'Create MO', shortcut: '⌘M', roles: ['production', 'admin'], action: () => toast('New MO form coming soon') },
    { label: 'New Purchase Order', icon: ShoppingCart, section: 'Buy', description: 'Create PO', roles: ['purchasing', 'admin'], action: () => navigate('/buy/orders') },
    { label: 'Create Shipment', icon: Truck, section: 'Ship', description: 'New shipment', roles: ['shipping', 'admin'], action: () => navigate('/ship/shipping') },
    { label: 'Import Data', icon: Upload, section: 'Control', description: 'MirrorWorks Bridge', roles: ['admin'], action: () => navigate('/control/mirrorworks-bridge') },
    { label: 'Invite Team Member', icon: Users, section: 'Control', description: 'Add to workspace', roles: ['admin'], action: () => navigate('/control/people') },
    { label: 'Compose Email', icon: Mail, section: 'General', description: 'Send an email', action: () => toast('Email composer coming soon') },
  ], [navigate]);

  // Filter actions by role
  const roleActions = useMemo(() =>
    ACTIONS.filter(a => !a.roles || a.roles.includes(CURRENT_USER.role)),
    [ACTIONS]
  );

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
      setQuery(initialQuery);
      setActiveFilter('all');
      setActiveIndex(0);
      setAiQuery('');
      setAiResponse(null);
      setIsClosing(false);
      requestAnimationFrame(() => {
        const input = inputRef.current;
        if (input) {
          input.focus();
          // Place cursor at end of pre-filled text
          if (initialQuery) {
            input.setSelectionRange(initialQuery.length, initialQuery.length);
          }
        }
      });
    }
  }, [open, initialQuery]);

  // ---- Filter results ----
  const recentItems = useMemo(() => getRecentItems(), [open]);

  const filteredPages = useMemo(() => {
    if (!query) {
      // Sort by role relevance when no query
      return [...PAGES].sort((a, b) => {
        const aRelevant = userModules.includes(a.section) ? 1 : 0;
        const bRelevant = userModules.includes(b.section) ? 1 : 0;
        return bRelevant - aRelevant;
      });
    }
    return PAGES
      .map((p) => ({
        ...p,
        score: Math.max(
          fuzzyScore(query, p.label),
          fuzzyScore(query, p.section),
          fuzzyScore(query, `${p.section} ${p.label}`),
          ...(p.keywords || []).map(k => fuzzyScore(query, k))
        ),
      }))
      .filter((p) => p.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        // Tie-break: prefer user's role modules
        const aRelevant = userModules.includes(a.section) ? 1 : 0;
        const bRelevant = userModules.includes(b.section) ? 1 : 0;
        return bRelevant - aRelevant;
      });
  }, [query, userModules]);

  const filteredActions = useMemo(() => {
    if (!query) return roleActions;
    return roleActions.filter(a =>
      fuzzyMatch(query, a.label) || fuzzyMatch(query, a.description || '')
    );
  }, [query, roleActions]);

  const filteredPeople = useMemo(() => {
    if (!query) return PEOPLE;
    return PEOPLE.filter(p =>
      fuzzyMatch(query, p.name) || fuzzyMatch(query, p.email) || fuzzyMatch(query, p.role)
    );
  }, [query]);

  // Build flat list of selectable items for keyboard nav
  interface SelectableItem {
    type: 'suggested' | 'recent' | 'page' | 'action' | 'person';
    label: string;
    sectionLabel?: string;
    icon: LucideIcon;
    path?: string;
    action?: () => void;
    section?: string;
    description?: string;
    subtitle?: string;
    shortcut?: string;
  }

  const selectableItems = useMemo(() => {
    const items: SelectableItem[] = [];
    if (activeFilter === 'ai') return items;

    // Suggested searches (only when no query, on 'all' tab)
    if (!query && activeFilter === 'all') {
      const suggestions = getSuggestedSearches(CURRENT_USER.role);
      for (const s of suggestions) {
        const page = PAGES.find(p => p.label === s || p.label.includes(s));
        if (page) {
          items.push({
            type: 'suggested',
            label: page.label,
            sectionLabel: 'Suggested for you',
            icon: page.icon,
            path: page.path,
            section: page.section,
          });
        }
      }
    }

    // Recent (only when no query and on 'all' tab)
    if (!query && activeFilter === 'all') {
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
    if (activeFilter === 'all' || activeFilter === 'pages') {
      const pagesToShow = query ? filteredPages : filteredPages.slice(0, 8);
      for (const p of pagesToShow) {
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
    if (activeFilter === 'all' || activeFilter === 'actions') {
      for (const a of filteredActions) {
        items.push({
          type: 'action',
          label: a.label,
          sectionLabel: 'Quick Actions',
          icon: a.icon,
          action: a.action,
          description: a.description,
          shortcut: a.shortcut,
        });
      }
    }

    // People
    if (activeFilter === 'all' || activeFilter === 'people') {
      for (const p of filteredPeople) {
        items.push({
          type: 'person',
          label: p.name,
          sectionLabel: 'People',
          icon: p.icon,
          subtitle: `${p.role} · ${p.email}`,
        });
      }
    }

    return items;
  }, [activeFilter, query, filteredPages, filteredActions, filteredPeople, recentItems, userModules]);

  // Clamp active index
  useEffect(() => {
    setActiveIndex(0);
  }, [query, activeFilter]);

  // ---- Execute item ----
  const executeItem = useCallback(
    (item: SelectableItem) => {
      if (item.path) {
        addRecentItem({ label: item.label, path: item.path, section: item.section || '' });
        navigate(item.path);
      } else if (item.action) {
        item.action();
      } else if (item.type === 'person') {
        toast(`Opening profile for ${item.label}`);
      }
      onOpenChange(false);
    },
    [navigate, onOpenChange]
  );

  // ---- Keyboard navigation ----
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (activeFilter === 'ai') return;

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
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const cats = FILTER_CATEGORIES;
        const idx = cats.findIndex(c => c.key === activeFilter);
        setActiveFilter(cats[(idx + 1) % cats.length].key);
      }
    },
    [activeIndex, selectableItems, executeItem, activeFilter]
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

  // Item type badge color
  function getTypeBadge(type: string) {
    switch (type) {
      case 'action': return 'bg-[var(--mw-yellow-50)] text-[var(--mw-yellow-700)]';
      case 'person': return 'bg-[var(--mw-blue-50)] text-[var(--mw-blue)]';
      case 'suggested': return 'bg-[var(--mw-purple-50)] text-[var(--mw-purple)]';
      default: return '';
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Overlay with blur */}
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-[1050] bg-black/25 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "duration-200"
          )}
        />

        {/* Dialog content */}
        <DialogPrimitive.Content
          className={cn(
            "fixed top-[12%] left-[50%] z-[1050] w-full max-w-[640px] translate-x-[-50%]",
            "rounded-[var(--shape-xl)] border border-[var(--neutral-200)] bg-card",
            "shadow-[0_24px_80px_-12px_rgba(0,0,0,0.18)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-[0.97] data-[state=open]:zoom-in-[0.97]",
            "data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2",
            "duration-[250ms] ease-[cubic-bezier(0.05,0.7,0.1,1.0)]",
            "overflow-hidden"
          )}
          onKeyDown={handleKeyDown}
        >
          {/* Hidden a11y titles */}
          <DialogPrimitive.Title className="sr-only">Command Palette</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search pages, actions, people, and AI across MirrorWorks
          </DialogPrimitive.Description>

          {/* Search input */}
          <div className="flex items-center gap-3 px-5 h-[56px]">
            <Search className="h-[18px] w-[18px] shrink-0 text-[var(--neutral-400)]" strokeWidth={1.5} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or type a command..."
              className="flex-1 h-full bg-transparent text-base text-foreground placeholder:text-[var(--neutral-400)] outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-[var(--shape-sm)] border border-[var(--neutral-200)] bg-[var(--neutral-50)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--neutral-400)]">
              ⌘K
            </kbd>
          </div>

          {/* Divider */}
          <div className="h-px bg-[var(--neutral-200)]" />

          {/* Filter chips */}
          <div className="flex items-center gap-1.5 px-5 py-2.5">
            {FILTER_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeFilter === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveFilter(cat.key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
                    'transition-all duration-[var(--duration-medium1)] ease-[var(--ease-standard)]',
                    isActive
                      ? 'bg-[var(--mw-mirage)] text-white shadow-sm'
                      : 'bg-[var(--neutral-50)] text-[var(--neutral-500)] hover:bg-[var(--neutral-100)] hover:text-[var(--neutral-700)]',
                  )}
                >
                  <Icon className="h-3 w-3" strokeWidth={1.5} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Results */}
          {activeFilter !== 'ai' ? (
            <div
              ref={listRef}
              className="max-h-[380px] overflow-y-auto px-2 pb-2"
            >
              {groupedItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-14 text-[var(--neutral-400)]">
                  <div className="w-12 h-12 rounded-full bg-[var(--neutral-100)] flex items-center justify-center mb-3">
                    <Search className="h-5 w-5 opacity-[0.38]" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-medium text-[var(--neutral-500)]">No results found</p>
                  <p className="text-xs text-[var(--neutral-400)] mt-1">
                    &ldquo;{query}&rdquo; did not match any pages, actions, or people.
                  </p>
                </div>
              )}

              {groupedItems.map((group, gi) => (
                <div key={group.label} className={cn(gi > 0 && "mt-1.5")}>
                  <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-[var(--neutral-400)] font-medium select-none">
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
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--shape-md)] text-left',
                          'transition-all duration-[var(--duration-short2)] ease-[var(--ease-standard)]',
                          isActive
                            ? 'bg-[var(--neutral-100)]'
                            : 'hover:bg-[var(--neutral-50)]'
                        )}
                      >
                        {/* Icon well */}
                        <div className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--shape-md)]',
                          'transition-colors duration-[var(--duration-short2)]',
                          item.type === 'recent'
                            ? 'bg-[var(--neutral-100)]'
                            : item.type === 'action'
                            ? 'bg-[var(--mw-yellow-50)]'
                            : item.type === 'person'
                            ? 'bg-[var(--mw-blue-50)]'
                            : item.type === 'suggested'
                            ? 'bg-[var(--mw-purple-50)]'
                            : 'bg-[var(--neutral-100)]'
                        )}>
                          {item.type === 'recent' ? (
                            <Clock className="h-4 w-4 text-[var(--neutral-400)]" strokeWidth={1.5} />
                          ) : item.type === 'person' ? (
                            <UserCircle className="h-4 w-4 text-[var(--mw-blue)]" strokeWidth={1.5} />
                          ) : item.type === 'action' ? (
                            <Icon className="h-4 w-4 text-[var(--mw-yellow-700)]" strokeWidth={1.5} />
                          ) : item.type === 'suggested' ? (
                            <Icon className="h-4 w-4 text-[var(--mw-purple)]" strokeWidth={1.5} />
                          ) : (
                            <Icon className="h-4 w-4 text-[var(--neutral-500)]" strokeWidth={1.5} />
                          )}
                        </div>

                        {/* Label + metadata */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground truncate">
                              {item.label}
                            </span>
                            {item.section && item.type === 'page' && (
                              <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--neutral-100)] text-[var(--neutral-500)] font-medium shrink-0">
                                {item.section}
                              </span>
                            )}
                          </div>
                          {(item.subtitle || (item.description && item.type !== 'page')) && (
                            <p className="text-xs text-[var(--neutral-400)] mt-0.5 truncate">
                              {item.subtitle || item.description}
                            </p>
                          )}
                        </div>

                        {/* Shortcut or arrow */}
                        {item.shortcut ? (
                          <kbd className="hidden sm:inline-flex text-[10px] font-medium text-[var(--neutral-400)] bg-[var(--neutral-50)] border border-[var(--neutral-200)] rounded px-1.5 py-0.5">
                            {item.shortcut}
                          </kbd>
                        ) : isActive ? (
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--neutral-300)]" strokeWidth={1.5} />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            /* AI tab */
            <div className="px-5 pb-5 pt-2">
              <form onSubmit={handleAiSubmit} className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 border border-[var(--border)] rounded-[var(--shape-md)] px-3 py-2.5 focus-within:ring-2 focus-within:ring-[var(--mw-yellow-400)]/30 transition-shadow duration-200">
                  <Sparkles className="h-4 w-4 shrink-0 text-[var(--mw-purple)]" strokeWidth={1.5} />
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="Ask anything about your data..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-[var(--neutral-400)] outline-none"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 text-xs text-[var(--neutral-400)] hover:text-foreground transition-colors"
                  >
                    <CornerDownLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </form>

              {aiResponse && (
                <div className="mt-3 rounded-[var(--shape-md)] border border-[var(--mw-purple-100)] bg-[var(--mw-purple-50)] p-4">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 mt-0.5 shrink-0 text-[var(--mw-purple)]" strokeWidth={1.5} />
                    <p className="text-sm text-foreground leading-relaxed">{aiResponse}</p>
                  </div>
                </div>
              )}

              {!aiResponse && (
                <div className="flex flex-col items-center justify-center py-14 text-[var(--neutral-400)]">
                  <div className="w-12 h-12 rounded-full bg-[var(--mw-purple-50)] flex items-center justify-center mb-3">
                    <Sparkles className="h-5 w-5 text-[var(--mw-purple)] opacity-60" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-medium text-[var(--neutral-500)]">Ask anything about your data</p>
                  <p className="text-xs text-[var(--neutral-400)] mt-1">
                    AI can analyze orders, costs, schedules, and more
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[var(--neutral-100)] px-5 py-2.5 text-[10px] text-[var(--neutral-400)] bg-[var(--neutral-50)]/50">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-[var(--neutral-200)] bg-background px-1 py-0.5 font-medium text-[9px]">↑↓</kbd>
                <span className="text-[var(--neutral-400)]">navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-[var(--neutral-200)] bg-background px-1 py-0.5 font-medium text-[9px]">↵</kbd>
                <span className="text-[var(--neutral-400)]">open</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-[var(--neutral-200)] bg-background px-1 py-0.5 font-medium text-[9px]">tab</kbd>
                <span className="text-[var(--neutral-400)]">filter</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-[var(--neutral-200)] bg-background px-1 py-0.5 font-medium text-[9px]">esc</kbd>
                <span className="text-[var(--neutral-400)]">close</span>
              </span>
            </div>
            <span className="text-[var(--neutral-300)] font-medium">MirrorWorks</span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
