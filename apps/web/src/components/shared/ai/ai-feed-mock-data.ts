/**
 * AI Feed Mock Data — Per-module insight data for the AI Insight Feed.
 *
 * Message format: wrap entity names, IDs, and key values in **double asterisks**
 * so AIFeedCard can render them with font-medium highlights.
 */

import type { AIFeedInsight, AIFeedModule } from './ai-feed-types';

const SELL_INSIGHTS: AIFeedInsight[] = [
  {
    id: 'sell-1',
    module: 'sell',
    type: 'call',
    priority: 'high',
    message:
      'Call **Dale Harper** — quote **Q-2026-0089** opened 3 times in 2 days',
    timestamp: '2h ago',
    actions: [
      { label: 'Call' },
      { label: 'Create Activity' },
    ],
  },
  {
    id: 'sell-2',
    module: 'sell',
    type: 'email',
    priority: 'medium',
    message:
      'Follow up with **Meridian Steel** — proposal pending 5 days',
    timestamp: '4h ago',
    actions: [
      { label: 'Follow Up' },
      { label: 'View Quote' },
    ],
  },
  {
    id: 'sell-3',
    module: 'sell',
    type: 'quote',
    priority: 'low',
    message:
      'Upsell opportunity: **Carter Fabrication** ordering same profile monthly',
    timestamp: '1d ago',
    actions: [
      { label: 'View Quote' },
      { label: 'Follow Up' },
    ],
  },
  {
    id: 'sell-4',
    module: 'sell',
    type: 'quote',
    priority: 'urgent',
    message:
      'Quote **Q-2026-0091** for **BHP Contractors** expires tomorrow — $128k at risk',
    timestamp: 'Just now',
    actions: [
      { label: 'View Quote' },
      { label: 'Follow Up' },
    ],
  },
];

const BUY_INSIGHTS: AIFeedInsight[] = [
  {
    id: 'buy-1',
    module: 'buy',
    type: 'stock',
    priority: 'urgent',
    message:
      'Stock alert: **3mm Mild Steel Sheet** below reorder point (12 remaining, 50 needed for **MO-2026-041**)',
    timestamp: 'Just now',
    actions: [
      { label: 'Re-order' },
      { label: 'View Stock' },
    ],
  },
  {
    id: 'buy-2',
    module: 'buy',
    type: 'supplier',
    priority: 'high',
    message:
      'Supplier **Pacific Metals** hasn\'t confirmed **PO-2026-0234** — 3 days overdue',
    timestamp: '1h ago',
    actions: [
      { label: 'Follow Up' },
      { label: 'View PO' },
    ],
  },
  {
    id: 'buy-3',
    module: 'buy',
    type: 'price',
    priority: 'medium',
    message:
      'Price increase alert: **Aluminium 6061** up 8% from **BlueScope**',
    timestamp: '3h ago',
    actions: [
      { label: 'View Stock' },
      { label: 'Compare Suppliers' },
    ],
  },
  {
    id: 'buy-4',
    module: 'buy',
    type: 'stock',
    priority: 'low',
    message:
      '**10mm MS Plate** approaching reorder point — 18 sheets remaining (threshold: 15)',
    timestamp: '6h ago',
    actions: [
      { label: 'Re-order' },
      { label: 'View Stock' },
    ],
  },
];

const PLAN_INSIGHTS: AIFeedInsight[] = [
  {
    id: 'plan-1',
    module: 'plan',
    type: 'capacity',
    priority: 'urgent',
    message:
      'Capacity conflict: **CNC-03** double-booked on Apr 12 for **WO-2026-089** and **WO-2026-091**',
    timestamp: '30m ago',
    actions: [
      { label: 'View Job' },
      { label: 'Reschedule' },
    ],
  },
  {
    id: 'plan-2',
    module: 'plan',
    type: 'job-risk',
    priority: 'high',
    message:
      'Job **J-2026-0042** budget overrun risk — materials cost 15% above estimate',
    timestamp: '2h ago',
    actions: [
      { label: 'View Job' },
      { label: 'Reschedule' },
    ],
  },
  {
    id: 'plan-3',
    module: 'plan',
    type: 'job-risk',
    priority: 'medium',
    message:
      'Schedule slip: Job **J-2026-0038** likely 2 days late based on current throughput',
    timestamp: '5h ago',
    actions: [
      { label: 'View Job' },
      { label: 'Reschedule' },
    ],
  },
  {
    id: 'plan-4',
    module: 'plan',
    type: 'capacity',
    priority: 'low',
    message:
      'Welding station at 92% utilisation next week — consider overtime or subcontracting',
    timestamp: '1d ago',
    actions: [
      { label: 'View Job' },
      { label: 'Reschedule' },
    ],
  },
];

const MAKE_INSIGHTS: AIFeedInsight[] = [
  {
    id: 'make-1',
    module: 'make',
    type: 'machine',
    priority: 'urgent',
    message:
      'Machine **CNC-02** vibration anomaly detected — schedule preventive maintenance',
    timestamp: 'Just now',
    actions: [
      { label: 'View Job' },
      { label: 'Reschedule' },
    ],
  },
  {
    id: 'make-2',
    module: 'make',
    type: 'job-risk',
    priority: 'high',
    message:
      'Work order **WO-2026-087** stalled at welding station for 4 hours',
    timestamp: '1h ago',
    actions: [
      { label: 'View Job' },
      { label: 'Reschedule' },
    ],
  },
  {
    id: 'make-3',
    module: 'make',
    type: 'quality',
    priority: 'medium',
    message:
      'Quality alert: Rejection rate at **Station 3** above 5% threshold today',
    timestamp: '3h ago',
    actions: [
      { label: 'View Job' },
      { label: 'Reschedule' },
    ],
  },
  {
    id: 'make-4',
    module: 'make',
    type: 'machine',
    priority: 'low',
    message:
      '**Laser Cutter 01** scheduled maintenance due in 3 days — 12 hours remaining',
    timestamp: '8h ago',
    actions: [
      { label: 'View Job' },
      { label: 'Reschedule' },
    ],
  },
];

const CONTROL_INSIGHTS: AIFeedInsight[] = [
  {
    id: 'control-1',
    module: 'control',
    type: 'job-risk',
    priority: 'high',
    message:
      'User **Sarah Mitchell** has admin access but hasn\'t logged in for 90 days — review access',
    timestamp: '2h ago',
    actions: [
      { label: 'View Job' },
      { label: 'Reschedule' },
    ],
  },
  {
    id: 'control-2',
    module: 'control',
    type: 'capacity',
    priority: 'medium',
    message:
      '3 users approaching their **module seat limit** — 8 of 10 seats used',
    timestamp: '1d ago',
    actions: [
      { label: 'View Job' },
      { label: 'Reschedule' },
    ],
  },
];

export const AI_FEED_DATA: Record<AIFeedModule, AIFeedInsight[]> = {
  sell: SELL_INSIGHTS,
  buy: BUY_INSIGHTS,
  plan: PLAN_INSIGHTS,
  make: MAKE_INSIGHTS,
  control: CONTROL_INSIGHTS,
};

/**
 * Returns mock insights for a given module, sorted by priority (urgent first).
 */
const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function getInsightsForModule(module: AIFeedModule): AIFeedInsight[] {
  return [...(AI_FEED_DATA[module] ?? [])].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4),
  );
}
