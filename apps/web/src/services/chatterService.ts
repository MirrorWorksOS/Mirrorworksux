/**
 * Chatter service — record-following thread storage modelled on Odoo's chatter.
 *
 * One ChatterThread lives per document chain (OPP → Q → SO → JOB → WO → MO → INV).
 * Every document in the chain reads/writes the same thread; messages keep a
 * `postedOn` ref so we can label "posted on OPP-2026-0001" when the reader is
 * viewing a different chain document.
 *
 * Mock-backed today. The exposed surface maps cleanly to a single Supabase
 * `chatter_messages` table with RLS by org (deferred to a follow-up phase).
 */

import { employees } from '@/services';
import { buildManufacturingFlow } from '@/components/shared/data/DocumentChainPill';

// ── Types ──────────────────────────────────────────────────────
export type ChatterEntityType =
  | 'opportunity'
  | 'quote'
  | 'sales_order'
  | 'job'
  | 'work_order'
  | 'manufacturing_order'
  | 'invoice';

export interface ChatterDocRef {
  type: ChatterEntityType;
  id: string;
  label: string;
}

export interface ChatterAttachment {
  id: string;
  name: string;
  size: number;
  mime: string;
  url: string;
}

export interface ChatterMessage {
  id: string;
  threadId: string;
  postedOn: ChatterDocRef;
  authorId: string | 'agent' | 'system';
  authorName: string;
  authorAvatar?: string;
  /** Plain text body. `@name` tokens are surfaced separately in `mentions`. */
  body: string;
  mentions: string[];
  attachments?: ChatterAttachment[];
  reactions?: Record<string, string[]>;
  parentId?: string;
  createdAt: string;
}

export interface ChatterThread {
  id: string;
  chain: ChatterDocRef[];
  followers: string[];
}

// ── Chain resolution ───────────────────────────────────────────
// For demo we only have one canonical chain rooted at OPP-2026-0001.
// Any chain document resolves to the same thread.
const CANONICAL_CHAIN: ChatterDocRef[] = [
  { type: 'opportunity',         id: 'opp-001',        label: 'OPP-2026-0001' },
  { type: 'quote',               id: 'qt-001',         label: 'Q-2026-0055'   },
  { type: 'sales_order',         id: 'so-001',         label: 'SO-2026-0085'  },
  { type: 'job',                 id: 'JOB-2026-0015',  label: 'JOB-2026-0015' },
  { type: 'work_order',          id: 'wo-001',         label: 'WO-2026-0001'  },
  { type: 'manufacturing_order', id: 'mo-001',         label: 'MO-2026-0001'  },
  { type: 'invoice',             id: 'inv-001',        label: 'INV-2026-0234' },
];

const CANONICAL_THREAD_ID = 'thread-chain-001';

function resolveChainForEntity(type: ChatterEntityType, id: string): ChatterDocRef[] {
  const hit = CANONICAL_CHAIN.find((d) => d.type === type && d.id === id);
  if (hit) return CANONICAL_CHAIN;
  // Standalone document — generate a one-doc chain so the thread surface
  // still functions. Label falls back to the id.
  return [{ type, id, label: id }];
}

function threadIdForEntity(type: ChatterEntityType, id: string): string {
  const isCanonical = CANONICAL_CHAIN.some((d) => d.type === type && d.id === id);
  return isCanonical ? CANONICAL_THREAD_ID : `thread-${type}-${id}`;
}

// Keep the chain helper in sync with the breadcrumb pill labels.
// (Sanity check — silent in production; surfaced in dev if labels diverge.)
if (typeof window !== 'undefined' && import.meta?.env?.DEV) {
  const flowLabels = buildManufacturingFlow().map((d) => d.label);
  const chainLabels = CANONICAL_CHAIN.filter((d) => d.type !== 'invoice').map((d) => d.label);
  for (const lbl of chainLabels) {
    if (!flowLabels.includes(lbl)) {
      // eslint-disable-next-line no-console
      console.warn(`[chatterService] chain label ${lbl} missing from DocumentChainPill flow`);
    }
  }
}

// ── Mock store ─────────────────────────────────────────────────
function ref(type: ChatterEntityType, id: string): ChatterDocRef {
  return CANONICAL_CHAIN.find((d) => d.type === type && d.id === id)
    ?? { type, id, label: id };
}

const STORE: ChatterMessage[] = [
  // ── OPP — early customer dialogue ────────────────────────────────────
  {
    id: 'cm-001',
    threadId: CANONICAL_THREAD_ID,
    postedOn: ref('opportunity', 'opp-001'),
    authorId: 'emp-001',
    authorName: 'Sarah Chen',
    body: "Lars at Kemppi confirmed scope on the call — happy to proceed with @Mike Thompson estimating. Drawings to follow.",
    mentions: ['emp-002'],
    reactions: { '👍': ['emp-002'] },
    createdAt: '2026-04-12T01:15:00Z',
  },
  {
    id: 'cm-002',
    threadId: CANONICAL_THREAD_ID,
    postedOn: ref('opportunity', 'opp-001'),
    authorId: 'emp-002',
    authorName: 'Mike Thompson',
    body: 'Got it — pulling parts list together now. Targeting AUD pricing by EOD.',
    mentions: [],
    createdAt: '2026-04-12T02:40:00Z',
  },
  {
    id: 'cm-002b',
    threadId: CANONICAL_THREAD_ID,
    postedOn: ref('opportunity', 'opp-001'),
    authorId: 'emp-002',
    authorName: 'Mike Thompson',
    body: 'Customer drawing pack attached — Rev C, dated last week.',
    mentions: [],
    attachments: [
      { id: 'att-000', name: 'Kemppi-MachineGuard-RevC.pdf', size: 1_240_512, mime: 'application/pdf', url: '#' },
    ],
    createdAt: '2026-04-12T04:55:00Z',
  },

  // ── Q — quote build, sent, AI signal, customer reply ─────────────────
  {
    id: 'cm-003',
    threadId: CANONICAL_THREAD_ID,
    postedOn: ref('quote', 'qt-001'),
    authorId: 'system',
    authorName: 'System',
    body: 'Quote sent to lars@kemppi.com.au.',
    mentions: [],
    createdAt: '2026-04-14T08:22:00Z',
  },
  {
    id: 'cm-004',
    threadId: CANONICAL_THREAD_ID,
    postedOn: ref('quote', 'qt-001'),
    authorId: 'agent',
    authorName: 'MirrorWorks Agent',
    body: 'Quote email opened twice in 24 hours. Good time to call Lars.',
    mentions: [],
    reactions: { '👍': ['emp-001'] },
    createdAt: '2026-04-15T22:05:00Z',
  },
  {
    id: 'cm-004b',
    threadId: CANONICAL_THREAD_ID,
    postedOn: ref('quote', 'qt-001'),
    authorId: 'emp-001',
    authorName: 'Sarah Chen',
    body: "Called Lars. He's pushing for ex-works pricing — sending a revised quote with two delivery options.",
    mentions: [],
    createdAt: '2026-04-16T03:30:00Z',
  },
  {
    id: 'cm-004c',
    threadId: CANONICAL_THREAD_ID,
    postedOn: ref('quote', 'qt-001'),
    authorId: 'system',
    authorName: 'System',
    body: 'Revision v2 sent — payment terms Net 30, delivery split into Sydney/Melbourne.',
    mentions: [],
    createdAt: '2026-04-17T01:10:00Z',
  },

  // ── SO — accepted, handover to planning ──────────────────────────────
  {
    id: 'cm-005',
    threadId: CANONICAL_THREAD_ID,
    postedOn: ref('sales_order', 'so-001'),
    authorId: 'emp-001',
    authorName: 'Sarah Chen',
    body: 'Order confirmed. @Emma Wilson — over to you for scheduling. Delivery target 18 May.',
    mentions: ['emp-003'],
    reactions: { '🎉': ['emp-002', 'emp-003'] },
    createdAt: '2026-04-18T00:10:00Z',
  },

  // ── JOB — planning, BOM, materials ───────────────────────────────────
  {
    id: 'cm-006',
    threadId: CANONICAL_THREAD_ID,
    postedOn: ref('job', 'JOB-2026-0015'),
    authorId: 'emp-003',
    authorName: 'Emma Wilson',
    body: 'BOM reviewed and approved. Moving to production planning. Materials due Wed.',
    mentions: [],
    attachments: [
      { id: 'att-001', name: 'BOM-Rev2.xlsx', size: 48_210, mime: 'application/vnd.ms-excel', url: '#' },
    ],
    reactions: { '✅': ['emp-005'] },
    createdAt: '2026-04-22T03:18:00Z',
  },
  {
    id: 'cm-006b',
    threadId: CANONICAL_THREAD_ID,
    postedOn: ref('job', 'JOB-2026-0015'),
    authorId: 'emp-005',
    authorName: 'Priya Sharma',
    body: 'Materials POs raised — Hunter Steel for sections, Pacific Metals for plate. ETA Tue.',
    mentions: [],
    createdAt: '2026-04-22T05:40:00Z',
  },
  {
    id: 'cm-006c',
    threadId: CANONICAL_THREAD_ID,
    postedOn: ref('job', 'JOB-2026-0015'),
    authorId: 'agent',
    authorName: 'MirrorWorks Agent',
    body: 'Heads-up: nesting yield on the 6mm plate is 82% — adding a part orientation flip can lift it to 91%.',
    mentions: [],
    createdAt: '2026-04-22T06:30:00Z',
  },

  // ── WO — work-order release ──────────────────────────────────────────
  {
    id: 'cm-006d',
    threadId: CANONICAL_THREAD_ID,
    postedOn: ref('work_order', 'WO-2026-0001'),
    authorId: 'system',
    authorName: 'System',
    body: 'Work order released to floor — Traveller TR-1015 issued.',
    mentions: [],
    createdAt: '2026-04-24T22:00:00Z',
  },
  {
    id: 'cm-006e',
    threadId: CANONICAL_THREAD_ID,
    postedOn: ref('work_order', 'WO-2026-0001'),
    authorId: 'emp-004',
    authorName: 'David Lee',
    body: 'CNC setup complete. Running first article now.',
    mentions: [],
    createdAt: '2026-04-25T19:15:00Z',
  },

  // ── MO — shop floor QC hold + recovery ───────────────────────────────
  {
    id: 'cm-007',
    threadId: CANONICAL_THREAD_ID,
    postedOn: ref('manufacturing_order', 'mo-001'),
    authorId: 'emp-007',
    authorName: 'Anh Nguyen',
    body: 'QC hold — 3 brackets with porosity. Quarantined in bay 4. @Emma Wilson advise.',
    mentions: ['emp-003'],
    reactions: { '👀': ['emp-003', 'emp-006'] },
    createdAt: '2026-04-25T23:45:00Z',
  },
  {
    id: 'cm-008',
    threadId: CANONICAL_THREAD_ID,
    postedOn: ref('manufacturing_order', 'mo-001'),
    authorId: 'emp-003',
    authorName: 'Emma Wilson',
    body: 'Noted. Adjusted schedule — extra 2hrs welding tomorrow to rework. 👍',
    mentions: [],
    parentId: 'cm-007',
    createdAt: '2026-04-26T00:00:00Z',
  },
  {
    id: 'cm-008b',
    threadId: CANONICAL_THREAD_ID,
    postedOn: ref('manufacturing_order', 'mo-001'),
    authorId: 'emp-006',
    authorName: 'James Murray',
    body: 'Rework done — first article passed QC this morning. Back to schedule.',
    mentions: [],
    reactions: { '🎉': ['emp-003', 'emp-007'], '🙏': ['emp-003'] },
    createdAt: '2026-04-27T02:10:00Z',
  },

  // ── INV — invoice raised ─────────────────────────────────────────────
  {
    id: 'cm-009',
    threadId: CANONICAL_THREAD_ID,
    postedOn: ref('invoice', 'inv-001'),
    authorId: 'system',
    authorName: 'System',
    body: 'Invoice INV-2026-0234 raised — $12,400 to Kemppi Australia, Net 30.',
    mentions: [],
    createdAt: '2026-04-30T03:20:00Z',
  },
  {
    id: 'cm-009b',
    threadId: CANONICAL_THREAD_ID,
    postedOn: ref('invoice', 'inv-001'),
    authorId: 'emp-001',
    authorName: 'Sarah Chen',
    body: 'Invoice pushed to Xero. Sent the customer the dispatch note as well.',
    mentions: [],
    reactions: { '✅': ['emp-002'] },
    createdAt: '2026-04-30T04:00:00Z',
  },

  // ───────────────────────────────────────────────────────────────────
  //  Per-record demo seeds — every standalone document gets a short
  //  conversation so the empty state never wins on a demo click-through.
  //  Built with the `seed()` helper at the bottom of this file.
  // ───────────────────────────────────────────────────────────────────
  ...seedConversations(),
];

/**
 * Compact helper for batching demo messages. Returns a flat ChatterMessage[]
 * with stable ids derived from the record + index. Authors are picked from
 * a small rotation so threads feel populated by multiple people.
 */
function seedConversations(): ChatterMessage[] {
  const out: ChatterMessage[] = [];
  let counter = 1_000;
  const nextId = () => `cm-seed-${counter++}`;

  // Slot timestamps relative to a recent demo date so messages always look fresh.
  const baseDate = new Date('2026-04-28T01:00:00Z').getTime();
  const dayMs = 86_400_000;
  const hourMs = 3_600_000;
  const at = (daysOffset: number, hoursOffset: number) =>
    new Date(baseDate + daysOffset * dayMs + hoursOffset * hourMs).toISOString();

  /** Author rotation — keeps demo conversations feeling populated. */
  type Author = { id: string; name: string };
  const SARAH: Author = { id: 'emp-001', name: 'Sarah Chen' };
  const MIKE: Author = { id: 'emp-002', name: 'Mike Thompson' };
  const EMMA: Author = { id: 'emp-003', name: 'Emma Wilson' };
  const DAVID: Author = { id: 'emp-004', name: 'David Lee' };
  const PRIYA: Author = { id: 'emp-005', name: 'Priya Sharma' };
  const JAMES: Author = { id: 'emp-006', name: 'James Murray' };
  const ANH: Author = { id: 'emp-007', name: 'Anh Nguyen' };
  const SYSTEM: Author = { id: 'system', name: 'System' };
  const AGENT: Author = { id: 'agent', name: 'MirrorWorks Agent' };

  const seed = (
    type: ChatterEntityType,
    id: string,
    label: string,
    messages: Array<{
      author: Author;
      body: string;
      daysAgo?: number;
      hoursAgo?: number;
      mentions?: string[];
      reactions?: Record<string, string[]>;
      attachments?: ChatterAttachment[];
    }>,
  ) => {
    const threadId = `thread-${type}-${id}`;
    const postedOn: ChatterDocRef = { type, id, label };
    messages.forEach((m, idx) => {
      // Distribute across the last ~6 days if no explicit offset given.
      const dayOff = m.daysAgo !== undefined ? -m.daysAgo : -(5 - idx * 1.2);
      const hourOff = m.hoursAgo !== undefined ? m.hoursAgo : idx * 2;
      out.push({
        id: nextId(),
        threadId,
        postedOn,
        authorId: m.author.id,
        authorName: m.author.name,
        body: m.body,
        mentions: m.mentions ?? [],
        reactions: m.reactions,
        attachments: m.attachments,
        createdAt: at(dayOff, hourOff),
      });
    });
  };

  // ── Opportunities (opp-002 through opp-010) ────────────────────────

  seed('opportunity', 'opp-002', 'OPP-2026-0002', [
    { author: MIKE, body: 'BHP procurement called — they want a firm number by Friday so they can put it through committee.', daysAgo: 4 },
    { author: AGENT, body: 'Opportunity value is in the top 5% for this rep. Suggest assigning a senior estimator.', daysAgo: 3, reactions: { '👍': ['emp-002'] } },
    { author: SARAH, body: 'I can take the estimating pass tomorrow if @Mike Thompson is buried.', daysAgo: 3, mentions: ['emp-002'] },
    { author: MIKE, body: 'Appreciated — go for it. I\'ll do customer comms.', daysAgo: 2, parentId: undefined },
  ]);

  seed('opportunity', 'opp-003', 'OPP-2026-0003', [
    { author: EMMA, body: "Pacific Fab repeat customer — they liked last year's brackets. Mirror the spec sheet from JOB-2025-0089.", daysAgo: 5 },
    { author: SYSTEM, body: 'Stage changed: new → qualified.', daysAgo: 5, hoursAgo: 4 },
    { author: PRIYA, body: 'Materials in stock — galvanised 4mm plate, plenty of stock at Hunter.', daysAgo: 4, reactions: { '✅': ['emp-003'] } },
    { author: EMMA, body: 'Sent the proposal. Should hear back by EOW.', daysAgo: 2 },
  ]);

  seed('opportunity', 'opp-004', 'OPP-2026-0004', [
    { author: DAVID, body: 'Sydney Rail wants the platform components in stainless 316 — pricier than our usual 304.', daysAgo: 6 },
    { author: AGENT, body: 'Comparable Sydney Rail orders in 316 have an avg margin of 28% — pricing input ready if useful.', daysAgo: 6, hoursAgo: 2 },
    { author: SARAH, body: 'Looped in @Mike Thompson for material sourcing — needs lead time check.', daysAgo: 4, mentions: ['emp-002'] },
    { author: MIKE, body: '316 lead time is 9 days. Push the customer for an early decision.', daysAgo: 3 },
  ]);

  seed('opportunity', 'opp-005', 'OPP-2026-0005', [
    { author: SARAH, body: 'Kemppi machine guards — they want it cheap and fast. Margins will be tight.', daysAgo: 4 },
    { author: AGENT, body: 'Kemppi historical close rate is 31% — flag aiScore is low on this one.', daysAgo: 4, hoursAgo: 1 },
    { author: SARAH, body: 'Going to qualify before spending more time on it.', daysAgo: 2 },
  ]);

  seed('opportunity', 'opp-006', 'OPP-2026-0006', [
    { author: MIKE, body: 'Hunter Steel reached out about aluminium enclosures for their new warehouse. They need design help.', daysAgo: 5 },
    { author: SYSTEM, body: 'Design assist tag added.', daysAgo: 5, hoursAgo: 1 },
    { author: DAVID, body: 'I can do the design pass — booked Thursday afternoon.', daysAgo: 3, reactions: { '👍': ['emp-002'] } },
  ]);

  seed('opportunity', 'opp-007', 'OPP-2026-0007', [
    { author: SARAH, body: 'BHP went with Acme. Price was the killer — we were 14% above.', daysAgo: 30 },
    { author: SYSTEM, body: 'Stage changed: negotiation → lost (reason: Price too high).', daysAgo: 30, hoursAgo: 1 },
    { author: AGENT, body: 'Post-mortem flag: 4 of the last 7 lost-to-Acme deals share the same loss-reason. Consider a pricing review.', daysAgo: 28 },
  ]);

  seed('opportunity', 'opp-010', 'OPP-2026-0010', [
    { author: MIKE, body: 'Closed-won! Repeat TechCorp deal — third year running.', daysAgo: 65, reactions: { '🎉': ['emp-001', 'emp-003', 'emp-005'] } },
    { author: SYSTEM, body: 'Stage changed: proposal → won. Quote QT-2026-0144 converted.', daysAgo: 65, hoursAgo: 2 },
    { author: SARAH, body: 'Nice one. Add to the FY26 forecast.', daysAgo: 64 },
  ]);

  // ── Quotes (qt-002 through qt-007) ─────────────────────────────────

  seed('quote', 'qt-002', 'Q-2026-0048', [
    { author: SARAH, body: 'First-draft quote built. Customer asked for two delivery options — covered both.', daysAgo: 8 },
    { author: SYSTEM, body: 'Quote sent to procurement@techcorp.com.au.', daysAgo: 7, hoursAgo: 5 },
    { author: AGENT, body: 'Customer opened the quote email 3 times in the last 24h — strong interest signal.', daysAgo: 5 },
  ]);

  seed('quote', 'qt-003', 'QT-2026-0142', [
    { author: MIKE, body: 'BHP wants the structural package broken into 3 phases. Re-quoting per phase.', daysAgo: 6 },
    { author: PRIYA, body: 'Material take-off ready for phase 1. 12 t of 350MPa C-section.', daysAgo: 5, attachments: [{ id: 'att-101', name: 'TakeOff-Phase1.pdf', size: 220_113, mime: 'application/pdf', url: '#' }] },
    { author: SYSTEM, body: 'Quote v2 sent — phased payment terms agreed.', daysAgo: 4 },
  ]);

  seed('quote', 'qt-004', 'QT-2026-0143', [
    { author: EMMA, body: 'Pacific Fab quote ready — borrowed pricing from Q-2025-0089 with a 4% uplift for materials.', daysAgo: 7 },
    { author: SYSTEM, body: 'Quote sent.', daysAgo: 7, hoursAgo: 2 },
    { author: EMMA, body: 'Following up Friday if no response.', daysAgo: 4 },
  ]);

  seed('quote', 'qt-005', 'QT-2026-0144', [
    { author: MIKE, body: 'TechCorp accepted v2 — going through to sales order.', daysAgo: 12, reactions: { '🎉': ['emp-001'] } },
    { author: SYSTEM, body: 'Quote accepted by customer. Converted to SO-2026-0085.', daysAgo: 12, hoursAgo: 1 },
  ]);

  seed('quote', 'qt-006', 'Q-2026-0062', [
    { author: SARAH, body: 'Revised quote — added the express finishing option per the customer\'s request.', daysAgo: 3 },
    { author: AGENT, body: 'Express finishing on this part has run 22% over estimate on recent jobs — worth flagging the risk to ops.', daysAgo: 3, hoursAgo: 1 },
    { author: SARAH, body: 'Noted — explicitly flagged in the cover note.', daysAgo: 2 },
  ]);

  seed('quote', 'qt-007', 'Q-2026-0058', [
    { author: DAVID, body: 'Sydney Rail platform components quote out. Long lead time for 316SS could be a sticking point.', daysAgo: 5 },
    { author: SYSTEM, body: 'Quote sent to procurement@sydneyrail.gov.au.', daysAgo: 5, hoursAgo: 3 },
  ]);

  // ── Sales orders (so-002 through so-005) ───────────────────────────

  seed('sales_order', 'so-002', 'SO-2026-0086', [
    { author: EMMA, body: 'Order confirmed. Custom brackets x50 for Pacific Fab — production slot booked.', daysAgo: 10, reactions: { '✅': ['emp-003', 'emp-005'] } },
    { author: PRIYA, body: 'Materials staged. Cutting can start Tuesday.', daysAgo: 8 },
    { author: SYSTEM, body: 'Job JOB-2026-0011 created and assigned to Emma Wilson.', daysAgo: 8, hoursAgo: 1 },
  ]);

  seed('sales_order', 'so-003', 'SO-2026-0087', [
    { author: DAVID, body: 'Sydney Rail confirmed. Cable tray supports — 200hr job, big one.', daysAgo: 9 },
    { author: SYSTEM, body: 'Job JOB-2026-0013 created. Assigned to Emma Wilson.', daysAgo: 9, hoursAgo: 1 },
    { author: EMMA, body: 'I\'ll plan the routing this week. Mixed configurable/widget approach.', daysAgo: 7 },
  ]);

  seed('sales_order', 'so-004', 'SO-2026-0088', [
    { author: SARAH, body: 'Kemppi machine guards shipped today. All checks passed.', daysAgo: 35, reactions: { '🎉': ['emp-003', 'emp-007'] } },
    { author: SYSTEM, body: 'Shipping status: shipped. Tracking #TR-AU-94821.', daysAgo: 35, hoursAgo: 1 },
    { author: SARAH, body: 'Invoice raised — INV-2026-0240.', daysAgo: 34 },
  ]);

  seed('sales_order', 'so-005', 'SO-2026-0089', [
    { author: MIKE, body: 'Pacific Fab second order — re-run of the SO-2026-0086 brackets but in stainless.', daysAgo: 5 },
    { author: AGENT, body: 'Stainless material lead time is 7 days. Consider scheduling cutting in the second week.', daysAgo: 5, hoursAgo: 1 },
    { author: PRIYA, body: 'Raised PO for 304SS plate — ETA 8 May.', daysAgo: 3 },
  ]);

  // ── Jobs ───────────────────────────────────────────────────────────
  // PlanJobDetail uses whatever id is in the route. Cover both internal ids
  // (job-001 .. job-005) and the jobNumber forms (JOB-2026-XXXX) so the chatter
  // shows regardless of how the user navigated in.

  const jobConvos: Record<string, Array<Parameters<typeof seed>[3][number]>> = {
    'JOB-2026-0012': [
      { author: EMMA, body: 'Mounting brackets — first article passes QC. Releasing the run.', daysAgo: 6, reactions: { '✅': ['emp-007'] } },
      { author: DAVID, body: 'CNC programs loaded. Starting cuts now.', daysAgo: 5 },
      { author: AGENT, body: 'Nesting yield could lift from 78% → 86% if we flip Part 4 by 90°.', daysAgo: 5, hoursAgo: 1 },
      { author: ANH, body: 'QC pass on the first 12 units. Looking clean.', daysAgo: 3, reactions: { '👍': ['emp-003'] } },
    ],
    'JOB-2026-0011': [
      { author: EMMA, body: 'Pacific Fab brackets — production tracking. Should ship Friday.', daysAgo: 5 },
      { author: PRIYA, body: 'Materials all delivered. Cutting started yesterday.', daysAgo: 4 },
      { author: SYSTEM, body: 'Work order WO-2026-0011 released to floor.', daysAgo: 3 },
    ],
    'JOB-2026-0013': [
      { author: EMMA, body: 'Cable tray supports — big job for Sydney Rail. Phased into 3 batches.', daysAgo: 8 },
      { author: AGENT, body: 'Batch 1 capacity check: Welding is at 92% next week — consider batching less aggressively.', daysAgo: 7, hoursAgo: 2 },
      { author: DAVID, body: 'Routing finalised. First batch starts next Monday.', daysAgo: 5, mentions: ['emp-003'] },
    ],
    'JOB-2026-0010': [
      { author: EMMA, body: 'Machine guards completed. Customer accepted. Closing out.', daysAgo: 35, reactions: { '🎉': ['emp-001', 'emp-007'] } },
      { author: ANH, body: 'Final QC pack signed off. All photos attached to traveller.', daysAgo: 35, hoursAgo: 1 },
      { author: SYSTEM, body: 'Job status: completed. Hours actual 55 vs estimated 60 (–8%).', daysAgo: 34 },
    ],
    'JOB-2026-0016': [
      { author: SARAH, body: 'AeroSpace laser cut panels — they want AS9100-compliant paperwork. Have we got the cert pack ready?', daysAgo: 4 },
      { author: ANH, body: 'I\'ll prep the QC pack. Need an extra day to compile.', daysAgo: 3, mentions: ['emp-001'] },
      { author: AGENT, body: 'Drawing pack revision is at B — last reviewed 28 days ago. Worth checking with engineering before cutting.', daysAgo: 3, hoursAgo: 1 },
    ],
    'JOB-2026-0017': [
      { author: SARAH, body: '8mm steel shortage is the central issue. Supplier promised next-day delivery — chasing.', daysAgo: 2, reactions: { '👀': ['emp-002', 'emp-003'] } },
      { author: SYSTEM, body: 'Job promise risk escalated: on-track → at-risk.', daysAgo: 2, hoursAgo: 1 },
      { author: EMMA, body: 'Adjusted the schedule — pushed bending by half a day. Should recover with the powder-coat express line.', daysAgo: 1 },
      { author: AGENT, body: 'Comparable urgent jobs that hit at-risk this late have a 41% on-time rate. Heads-up.', daysAgo: 1, hoursAgo: 3 },
    ],
    'JOB-2026-0018': [
      { author: EMMA, body: 'Climate Systems turret punch parts — waiting on the galv coil PO.', daysAgo: 3 },
      { author: PRIYA, body: 'PO-2026-0438 raised. ETA 4 days. Will start tooling pre-stage now.', daysAgo: 3, hoursAgo: 1 },
      { author: AGENT, body: 'HVAC parts tend to have tight sampling plans — consider running 1-in-25 instead of 1-in-50.', daysAgo: 2 },
    ],
  };

  for (const [jobNumber, msgs] of Object.entries(jobConvos)) {
    seed('job', jobNumber, jobNumber, msgs);
  }

  // Same conversations under the internal job ids — PlanJobs links use these.
  const internalIdMap: Record<string, string> = {
    'job-001': 'JOB-2026-0012',
    'job-002': 'JOB-2026-0011',
    'job-003': 'JOB-2026-0013',
    'job-004': 'JOB-2026-0010',
  };
  for (const [internalId, jobNumber] of Object.entries(internalIdMap)) {
    const msgs = jobConvos[jobNumber];
    if (msgs) seed('job', internalId, jobNumber, msgs);
  }

  // ── Manufacturing orders (mo-002 through mo-005) ───────────────────

  seed('manufacturing_order', 'mo-002', 'MO-2026-0002', [
    { author: DAVID, body: 'Differential Housing run — first cut on Laser Cutter #1 in progress.', daysAgo: 3 },
    { author: SYSTEM, body: 'WO-2026-0005 advanced to in-progress.', daysAgo: 3, hoursAgo: 1 },
    { author: ANH, body: 'First article QC scheduled for tomorrow morning.', daysAgo: 2 },
  ]);

  seed('manufacturing_order', 'mo-003', 'MO-2026-0003', [
    { author: EMMA, body: 'Cable tray support MO — confirmed and ready to release.', daysAgo: 4 },
    { author: AGENT, body: 'Welding is the bottleneck this week — consider shifting some load to Bay 2.', daysAgo: 4, hoursAgo: 2 },
    { author: SYSTEM, body: 'Status: confirmed. Awaiting release to floor.', daysAgo: 3 },
  ]);

  seed('manufacturing_order', 'mo-004', 'MO-2026-0004', [
    { author: MIKE, body: 'Kemppi machine guards MO completed and despatched.', daysAgo: 36, reactions: { '🎉': ['emp-001', 'emp-007', 'emp-003'] } },
    { author: ANH, body: 'Final QC paperwork in the cabinet. All photos in DAM.', daysAgo: 36, hoursAgo: 1 },
    { author: SYSTEM, body: 'Status: done. 100% progress.', daysAgo: 35 },
  ]);

  seed('manufacturing_order', 'mo-005', 'MO-2026-0005', [
    { author: SARAH, body: 'Aluminium enclosure panel — draft MO. Waiting on the Hunter Steel material PO.', daysAgo: 2 },
    { author: PRIYA, body: '5052 ali sheet stock confirmed at Hunter — 4 sheets reserved.', daysAgo: 1, reactions: { '✅': ['emp-001'] } },
  ]);

  return out;
}

// ── Public API ─────────────────────────────────────────────────
export interface ListMessagesOptions {
  limit?: number;
  /** When set, only messages posted on this entity (rare — most callers want the full thread). */
  postedOn?: { type: ChatterEntityType; id: string };
}

export const chatterService = {
  threadForEntity(type: ChatterEntityType, id: string): ChatterThread {
    return {
      id: threadIdForEntity(type, id),
      chain: resolveChainForEntity(type, id),
      followers: [],
    };
  },

  listMessages(threadId: string, opts: ListMessagesOptions = {}): ChatterMessage[] {
    let msgs = STORE
      .filter((m) => m.threadId === threadId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (opts.postedOn) {
      msgs = msgs.filter(
        (m) => m.postedOn.type === opts.postedOn!.type && m.postedOn.id === opts.postedOn!.id,
      );
    }
    if (opts.limit) {
      msgs = msgs.slice(-opts.limit);
    }
    return msgs;
  },

  post(
    threadId: string,
    draft: {
      postedOn: ChatterDocRef;
      authorId: string | 'agent' | 'system';
      authorName: string;
      authorAvatar?: string;
      body: string;
      mentions?: string[];
      attachments?: ChatterAttachment[];
      parentId?: string;
    },
  ): ChatterMessage {
    const msg: ChatterMessage = {
      id: `cm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      threadId,
      postedOn: draft.postedOn,
      authorId: draft.authorId,
      authorName: draft.authorName,
      authorAvatar: draft.authorAvatar,
      body: draft.body,
      mentions: draft.mentions ?? [],
      attachments: draft.attachments,
      parentId: draft.parentId,
      createdAt: new Date().toISOString(),
    };
    STORE.push(msg);
    return msg;
  },

  react(messageId: string, emoji: string, userId: string): void {
    const msg = STORE.find((m) => m.id === messageId);
    if (!msg) return;
    msg.reactions ??= {};
    const list = msg.reactions[emoji] ?? [];
    if (list.includes(userId)) {
      msg.reactions[emoji] = list.filter((u) => u !== userId);
      if (msg.reactions[emoji].length === 0) delete msg.reactions[emoji];
    } else {
      msg.reactions[emoji] = [...list, userId];
    }
  },

  /** Returns the canonical chain order for the given thread (used by the Sheet header). */
  chainForThread(threadId: string): ChatterDocRef[] {
    if (threadId === CANONICAL_THREAD_ID) return CANONICAL_CHAIN;
    const first = STORE.find((m) => m.threadId === threadId);
    return first ? [first.postedOn] : [];
  },

  /** Mention-autocomplete source. */
  searchMentionables(query: string, limit = 6): { id: string; name: string; initials: string; role: string }[] {
    const q = query.trim().toLowerCase();
    const list = employees.filter((e) => e.status === 'active');
    const matches = q
      ? list.filter((e) => e.name.toLowerCase().includes(q) || e.initials.toLowerCase().startsWith(q))
      : list;
    return matches.slice(0, limit).map((e) => ({
      id: e.id,
      name: e.name,
      initials: e.initials,
      role: e.role,
    }));
  },
};
