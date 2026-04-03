/**
 * Notifications — Activity feed page.
 * Route: /notifications
 */

import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Package, FileText, DollarSign, Clock, Truck, Factory } from 'lucide-react';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  description: string;
  module: 'sell' | 'buy' | 'plan' | 'make' | 'ship' | 'book' | 'system';
  type: 'info' | 'warning' | 'success' | 'error';
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n-001', title: 'Quote MW-Q-0055 expiring soon', description: 'TechCorp Industries quote expires in 3 days. Follow up recommended.', module: 'sell', type: 'warning', time: '10 min ago', read: false },
  { id: 'n-002', title: 'PO-2026-0088 partial delivery', description: 'Pacific Metals delivered 12 of 20 items. 8 outstanding.', module: 'buy', type: 'info', time: '25 min ago', read: false },
  { id: 'n-003', title: 'MO-2026-001 ahead of schedule', description: 'Mounting Bracket Assembly is 15% ahead of planned progress.', module: 'make', type: 'success', time: '1h ago', read: false },
  { id: 'n-004', title: 'Invoice INV-2026-0234 overdue', description: 'TechCorp Industries — $12,400 is 20 days past due.', module: 'book', type: 'error', time: '2h ago', read: false },
  { id: 'n-005', title: 'Shipment dispatched', description: 'Kemppi Australia order shipped via StarTrack. ETA 2 days.', module: 'ship', type: 'success', time: '3h ago', read: true },
  { id: 'n-006', title: 'Requisition REQ-2026-0089 pending', description: 'Priya Sharma submitted a requisition for $8,500 — awaiting approval.', module: 'buy', type: 'info', time: '4h ago', read: true },
  { id: 'n-007', title: 'Job MW-009 materials ready', description: 'All materials received for Mounting Bracket job. Ready to schedule.', module: 'plan', type: 'success', time: '5h ago', read: true },
  { id: 'n-008', title: 'Quality alert: CNC-01 spindle wear', description: 'Tooling wear detected on CNC-01 spindle. Replacement recommended.', module: 'make', type: 'warning', time: '6h ago', read: true },
  { id: 'n-009', title: 'Xero sync completed', description: '147 invoices synced successfully. No discrepancies found.', module: 'book', type: 'info', time: '8h ago', read: true },
  { id: 'n-010', title: 'New opportunity created', description: 'Aluminium Enclosures — Hunter Steel Co, $22,000 estimated value.', module: 'sell', type: 'info', time: '1d ago', read: true },
];

const MODULE_ICONS: Record<string, typeof Bell> = {
  sell: DollarSign,
  buy: Package,
  plan: Clock,
  make: Factory,
  ship: Truck,
  book: FileText,
  system: Bell,
};

const TYPE_STYLES: Record<string, string> = {
  info: 'bg-[var(--neutral-100)] text-[var(--neutral-500)]',
  warning: 'bg-[var(--mw-yellow-400)]/10 text-[var(--mw-yellow-600)]',
  success: 'bg-[var(--mw-green)]/10 text-[var(--mw-green)]',
  error: 'bg-[var(--mw-error-100)] text-[var(--mw-error)]',
};

export function Notifications() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <PageShell className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread`}
      />

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 text-xs rounded-[var(--shape-lg)] transition-colors capitalize',
                filter === f
                  ? 'bg-[var(--neutral-100)] text-foreground font-medium'
                  : 'text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]',
              )}
            >
              {f} {f === 'unread' && unreadCount > 0 && `(${unreadCount})`}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-[var(--border)] text-xs"
          onClick={markAllRead}
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
          Mark all read
        </Button>
      </div>

      <div className="space-y-2">
        {filtered.map((n) => {
          const Icon = MODULE_ICONS[n.module] ?? Bell;
          return (
            <Card
              key={n.id}
              className={cn(
                'p-4 flex items-start gap-4 cursor-pointer transition-colors hover:bg-[var(--accent)]',
                !n.read && 'border-l-2 border-l-[var(--mw-yellow-400)]',
              )}
              onClick={() => markRead(n.id)}
            >
              <div className={cn('w-9 h-9 rounded-[var(--shape-md)] flex items-center justify-center flex-shrink-0', TYPE_STYLES[n.type])}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className={cn('text-sm text-foreground', !n.read && 'font-medium')}>{n.title}</p>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-[var(--mw-yellow-400)] flex-shrink-0" />}
                </div>
                <p className="text-xs text-[var(--neutral-500)] line-clamp-1">{n.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-xs text-[var(--neutral-500)] tabular-nums whitespace-nowrap">{n.time}</span>
                <Badge className="border border-[var(--neutral-200)] bg-[var(--neutral-100)] text-[var(--neutral-500)] text-[10px] capitalize">
                  {n.module}
                </Badge>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card className="p-12 flex flex-col items-center justify-center text-center">
            <Bell className="w-8 h-8 text-[var(--neutral-300)] mb-3" />
            <p className="text-sm font-medium text-foreground">All caught up</p>
            <p className="text-xs text-[var(--neutral-500)] mt-1">No unread notifications</p>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
