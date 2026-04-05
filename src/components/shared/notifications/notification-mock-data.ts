/**
 * Notification mock data and demo simulator.
 *
 * Provides realistic manufacturing-context notifications and a timer-based
 * simulator that adds one random notification every 60 seconds (capped at
 * a configurable max to avoid flooding localStorage).
 */

import type { NotificationType, NotificationModule } from '@/store/notificationStore';
import { useNotificationStore } from '@/store/notificationStore';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MockNotificationTemplate {
  type: NotificationType;
  title: string;
  message: string;
  module: NotificationModule;
  actionUrl?: string;
}

// ---------------------------------------------------------------------------
// Seed data — initial notifications loaded on first visit
// ---------------------------------------------------------------------------

export const SEED_NOTIFICATIONS: MockNotificationTemplate[] = [
  {
    type: 'warning',
    title: 'Quote Q-2026-0055 expiring soon',
    message: 'TechCorp Industries quote expires in 3 days. Follow up recommended.',
    module: 'sell',
    actionUrl: '/sell/quotes',
  },
  {
    type: 'info',
    title: 'PO-2026-0088 partial delivery',
    message: 'Pacific Metals delivered 12 of 20 items. 8 outstanding.',
    module: 'buy',
    actionUrl: '/buy/orders',
  },
  {
    type: 'success',
    title: 'MO-2026-0001 ahead of schedule',
    message: 'Mounting Bracket Assembly is 15% ahead of planned progress.',
    module: 'make',
    actionUrl: '/make/manufacturing-orders',
  },
  {
    type: 'error',
    title: 'Invoice INV-2026-0234 overdue',
    message: 'TechCorp Industries — $12,400 is 20 days past due.',
    module: 'book',
    actionUrl: '/book/invoices',
  },
  {
    type: 'success',
    title: 'Shipment dispatched',
    message: 'Kemppi Australia order shipped via StarTrack. ETA 2 days.',
    module: 'ship',
    actionUrl: '/ship/tracking',
  },
  {
    type: 'info',
    title: 'Requisition REQ-2026-0089 pending',
    message: 'Priya Sharma submitted a requisition for $8,500 — awaiting approval.',
    module: 'buy',
    actionUrl: '/buy/requisitions',
  },
  {
    type: 'success',
    title: 'Job JOB-2026-0012 materials ready',
    message: 'All materials received for Mounting Bracket job. Ready to schedule.',
    module: 'plan',
    actionUrl: '/plan/jobs',
  },
  {
    type: 'warning',
    title: 'Quality alert: CNC-01 spindle wear',
    message: 'Tooling wear detected on CNC-01 spindle. Replacement recommended.',
    module: 'make',
    actionUrl: '/make/quality',
  },
  {
    type: 'info',
    title: 'Xero sync completed',
    message: '147 invoices synced successfully. No discrepancies found.',
    module: 'book',
  },
  {
    type: 'info',
    title: 'New opportunity created',
    message: 'Aluminium Enclosures — Hunter Steel Co, $22,000 estimated value.',
    module: 'sell',
    actionUrl: '/sell/opportunities',
  },
];

// ---------------------------------------------------------------------------
// Random notification templates — used by the simulator
// ---------------------------------------------------------------------------

const RANDOM_TEMPLATES: MockNotificationTemplate[] = [
  // Job status changes (Plan/Make)
  { type: 'success', title: 'Job JOB-2026-0018 completed', message: 'Steel Bracket Assembly finished. All QC checks passed.', module: 'plan', actionUrl: '/plan/jobs' },
  { type: 'warning', title: 'Job JOB-2026-0021 delayed', message: 'Material shortage on 6mm Mild Steel Plate. ETA 2 days.', module: 'plan', actionUrl: '/plan/jobs' },
  { type: 'info', title: 'Job JOB-2026-0023 started', message: 'CNC machining operation started on CNC-02.', module: 'make', actionUrl: '/make/shop-floor' },

  // Quality alerts (Make)
  { type: 'error', title: 'QC fail: Surface finish out of spec', message: 'Part P-4412 rejected — Ra 3.2 exceeds tolerance of Ra 1.6.', module: 'make', actionUrl: '/make/quality' },
  { type: 'warning', title: 'Calibration due: CMM-01', message: 'Coordinate measuring machine calibration due in 5 days.', module: 'make', actionUrl: '/make/quality' },

  // Delivery updates (Ship)
  { type: 'success', title: 'Delivery confirmed', message: 'Order SO-2026-0045 received by Matrix Engineering.', module: 'ship', actionUrl: '/ship/tracking' },
  { type: 'info', title: 'Shipment in transit', message: 'StarTrack tracking updated — package in Melbourne hub.', module: 'ship', actionUrl: '/ship/tracking' },

  // Quote approvals (Sell)
  { type: 'warning', title: 'Quote approval needed', message: 'Q-2026-0061 for $45,000 requires manager sign-off.', module: 'sell', actionUrl: '/sell/quotes' },
  { type: 'success', title: 'Quote accepted', message: 'Hunter Steel Co accepted Q-2026-0058 — $18,500.', module: 'sell', actionUrl: '/sell/quotes' },

  // Low stock warnings (Control/Inventory)
  { type: 'warning', title: 'Low stock: 3mm Aluminium Sheet', message: 'Only 12 sheets remaining. Reorder point is 20.', module: 'control', actionUrl: '/control/inventory' },
  { type: 'error', title: 'Stock depleted: M8 Hex Bolts', message: 'Zero stock — 3 pending jobs require this item.', module: 'control', actionUrl: '/control/inventory' },

  // Invoice reminders (Book)
  { type: 'warning', title: 'Invoice due in 3 days', message: 'INV-2026-0267 for Kemppi Australia — $8,200.', module: 'book', actionUrl: '/book/invoices' },
  { type: 'success', title: 'Payment received', message: 'Matrix Engineering paid INV-2026-0251 — $14,600.', module: 'book', actionUrl: '/book/invoices' },

  // Purchase order confirmations (Buy)
  { type: 'success', title: 'PO confirmed by supplier', message: 'Pacific Metals confirmed PO-2026-0092. Ships in 5 days.', module: 'buy', actionUrl: '/buy/orders' },
  { type: 'info', title: 'New supplier quote received', message: 'BHP Flat Products quoted $2.85/kg for 5mm HR plate.', module: 'buy', actionUrl: '/buy/rfqs' },

  // System announcements
  { type: 'system', title: 'Scheduled maintenance', message: 'System maintenance window: Sunday 2am–4am AEST.', module: 'system' },
  { type: 'system', title: 'New feature: Process Builder', message: 'Define reusable manufacturing processes. Try it in Control.', module: 'system', actionUrl: '/control/process-builder' },
];

// ---------------------------------------------------------------------------
// Seed loader — called once on app boot to populate empty stores
// ---------------------------------------------------------------------------

export function seedNotificationsIfEmpty(): void {
  const { notifications } = useNotificationStore.getState();
  if (notifications.length > 0) return;

  // Build seed notifications with staggered timestamps for realism
  const now = Date.now();
  const seeded = SEED_NOTIFICATIONS.map((template, i) => ({
    ...template,
    id: `seed-${i}`,
    timestamp: now - i * 30 * 60 * 1000, // 30 min apart, newest first
    isRead: i >= 6, // First 6 are unread, rest are read
  }));

  // Set all at once — no hasNewArrival trigger for seed data
  useNotificationStore.setState({ notifications: seeded });
}

// ---------------------------------------------------------------------------
// Simulator — adds a random notification every 60 seconds
// ---------------------------------------------------------------------------

let simulatorInterval: ReturnType<typeof setInterval> | null = null;
let simulatorCount = 0;
const MAX_SIMULATED = 15;

export function startNotificationSimulator(options?: {
  intervalMs?: number;
  maxNotifications?: number;
  showToast?: boolean;
}): void {
  if (simulatorInterval) return; // already running

  const interval = options?.intervalMs ?? 60_000;
  const max = options?.maxNotifications ?? MAX_SIMULATED;
  const showToast = options?.showToast ?? true;

  simulatorInterval = setInterval(() => {
    if (simulatorCount >= max) {
      stopNotificationSimulator();
      return;
    }

    const template = RANDOM_TEMPLATES[Math.floor(Math.random() * RANDOM_TEMPLATES.length)];
    useNotificationStore.getState().addNotification(template);
    simulatorCount++;

    if (showToast) {
      const toastFn =
        template.type === 'error' ? toast.error
        : template.type === 'warning' ? toast.warning
        : template.type === 'success' ? toast.success
        : toast.info;

      toastFn(template.title, {
        description: template.message,
        duration: 4000,
      });
    }
  }, interval);
}

export function stopNotificationSimulator(): void {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
    simulatorInterval = null;
  }
}

export function isSimulatorRunning(): boolean {
  return simulatorInterval !== null;
}
