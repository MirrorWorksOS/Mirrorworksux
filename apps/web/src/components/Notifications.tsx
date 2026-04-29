/**
 * Notifications — Full notifications page with filtering, search, grouping, and bulk actions.
 * Route: /notifications
 *
 * Powered by the Zustand notificationStore for persisted state.
 */

import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  Search,
  Trash2,
  CheckCheck,
  Filter,
  X,
} from 'lucide-react';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { cn } from './ui/utils';
import { toast } from 'sonner';
import { useNotificationStore } from '@/store/notificationStore';
import type { AppNotification, NotificationModule, NotificationType } from '@/store/notificationStore';
import { NotificationCardFull } from '@/components/shared/notifications/NotificationCard';
import { seedNotificationsIfEmpty } from '@/components/shared/notifications/notification-mock-data';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FilterTab = 'all' | 'unread';
type ModuleFilter = NotificationModule | 'all';
type TypeFilter = NotificationType | 'all';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDateGroup(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86_400_000;
  const weekStart = todayStart - 6 * 86_400_000;

  if (timestamp >= todayStart) return 'Today';
  if (timestamp >= yesterdayStart) return 'Yesterday';
  if (timestamp >= weekStart) return 'This Week';
  return 'Older';
}

const DATE_GROUP_ORDER = ['Today', 'Yesterday', 'This Week', 'Older'];

const MODULE_OPTIONS: { value: ModuleFilter; label: string }[] = [
  { value: 'all', label: 'All Modules' },
  { value: 'sell', label: 'Sell' },
  { value: 'buy', label: 'Buy' },
  { value: 'plan', label: 'Plan' },
  { value: 'make', label: 'Make' },
  { value: 'ship', label: 'Ship' },
  { value: 'book', label: 'Book' },
  { value: 'control', label: 'Control' },
  { value: 'system', label: 'System' },
];

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'success', label: 'Success' },
  { value: 'error', label: 'Error' },
  { value: 'system', label: 'System' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Notifications() {
  // Ensure store is seeded
  React.useEffect(() => {
    seedNotificationsIfEmpty();
  }, []);

  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const dismissNotification = useNotificationStore((s) => s.dismissNotification);
  const dismissMultiple = useNotificationStore((s) => s.dismissMultiple);
  const markMultipleAsRead = useNotificationStore((s) => s.markMultipleAsRead);

  // Local UI state
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [moduleFilter, setModuleFilter] = useState<ModuleFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Computed values
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const filtered = useMemo(() => {
    let result = [...notifications];

    // Tab filter
    if (filterTab === 'unread') {
      result = result.filter((n) => !n.isRead);
    }

    // Module filter
    if (moduleFilter !== 'all') {
      result = result.filter((n) => n.module === moduleFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((n) => n.type === typeFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          n.module.toLowerCase().includes(q)
      );
    }

    return result;
  }, [notifications, filterTab, moduleFilter, typeFilter, searchQuery]);

  // Group by date
  const grouped = useMemo(() => {
    const groups = new Map<string, AppNotification[]>();
    for (const n of filtered) {
      const group = getDateGroup(n.timestamp);
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push(n);
    }
    // Sort groups by date order
    const sorted: [string, AppNotification[]][] = [];
    for (const label of DATE_GROUP_ORDER) {
      const items = groups.get(label);
      if (items && items.length > 0) {
        sorted.push([label, items]);
      }
    }
    return sorted;
  }, [filtered]);

  // Selection handlers
  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filtered.map((n) => n.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Bulk actions
  const handleMarkAllRead = () => {
    markAllAsRead();
    toast.success('All notifications marked as read');
  };

  const handleBulkMarkRead = () => {
    if (selectedIds.size === 0) return;
    markMultipleAsRead(Array.from(selectedIds));
    setSelectedIds(new Set());
    toast.success(`${selectedIds.size} notifications marked as read`);
  };

  const handleBulkDismiss = () => {
    if (selectedIds.size === 0) return;
    dismissMultiple(Array.from(selectedIds));
    setSelectedIds(new Set());
    toast.success(`Notifications dismissed`);
  };

  const hasActiveFilters = moduleFilter !== 'all' || typeFilter !== 'all' || searchQuery.trim() !== '';

  return (
    <PageShell className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread`}
        actions={
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <>
                <span className="text-xs text-muted-foreground">
                  {selectedIds.size} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[var(--border)] text-xs"
                  onClick={handleBulkMarkRead}
                >
                  <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
                  Mark Read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[var(--border)] text-xs text-[var(--mw-error)]"
                  onClick={handleBulkDismiss}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Dismiss
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={clearSelection}
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Clear
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Filter bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {(['all', 'unread'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterTab(f)}
                className={cn(
                  'px-4 py-2 text-xs rounded-[var(--shape-lg)] transition-colors capitalize min-h-[44px] sm:min-h-0',
                  filterTab === f
                    ? 'bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] text-foreground font-medium'
                    : 'text-[var(--neutral-500)] hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-800)]',
                )}
              >
                {f} {f === 'unread' && unreadCount > 0 && `(${unreadCount})`}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-10 sm:h-8 w-full sm:w-48 text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'border-[var(--border)] text-xs h-10 sm:h-8 min-w-[44px]',
                hasActiveFilters && 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)]/10',
              )}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 w-1.5 h-1.5 rounded-full bg-[var(--mw-yellow-400)]" />
              )}
            </Button>

            {/* Select all / Mark all read */}
            <Button
              variant="outline"
              size="sm"
              className="border-[var(--border)] text-xs h-10 sm:h-8 min-w-[44px]"
              onClick={selectAll}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-[var(--border)] text-xs h-10 sm:h-8 min-w-[44px]"
              onClick={handleMarkAllRead}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Mark all read
            </Button>
          </div>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--neutral-50)] dark:bg-[var(--neutral-900)] border border-border">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground whitespace-nowrap">Module:</label>
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value as ModuleFilter)}
                className="h-7 rounded-lg border border-border bg-card text-xs px-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--mw-yellow-400)]/30"
              >
                {MODULE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground whitespace-nowrap">Type:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
                className="h-7 rounded-lg border border-border bg-card text-xs px-2 text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--mw-yellow-400)]/30"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setModuleFilter('all');
                  setTypeFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Notification groups */}
      <div className="space-y-6">
        {grouped.map(([groupLabel, items]) => (
          <div key={groupLabel}>
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 px-1">
              {groupLabel}
            </h3>
            <div className="space-y-2">
              {items.map((n) => (
                <NotificationCardFull
                  key={n.id}
                  notification={n}
                  onMarkRead={() => markAsRead(n.id)}
                  onDismiss={() => dismissNotification(n.id)}
                  selected={selectedIds.has(n.id)}
                  onSelect={(checked) => toggleSelect(n.id, checked)}
                  showCheckbox={selectedIds.size > 0}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {filtered.length === 0 && (
          <Card className="py-16 items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] flex items-center justify-center mb-4">
              <Bell className="w-5 h-5 text-[var(--neutral-400)]" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {filterTab === 'unread' ? 'All caught up' : 'No notifications'}
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              {filterTab === 'unread'
                ? 'You have no unread notifications. Great job staying on top of things.'
                : hasActiveFilters
                  ? 'No notifications match your current filters. Try adjusting them.'
                  : 'Notifications about jobs, quotes, deliveries, and more will appear here.'
              }
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setModuleFilter('all');
                  setTypeFilter('all');
                  setSearchQuery('');
                  setFilterTab('all');
                }}
                className="mt-3 text-xs text-[#0052CC] dark:text-[#4C9AFF] hover:underline"
              >
                Clear all filters
              </button>
            )}
          </Card>
        )}
      </div>
    </PageShell>
  );
}
