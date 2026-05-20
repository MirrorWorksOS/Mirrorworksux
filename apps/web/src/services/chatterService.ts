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

/**
 * Demo override: every entity resolves to the canonical chain + thread.
 * This keeps the chatter sheet rich on every record (chain filter pills,
 * agent insights, attachments, mentions, reactions) which is the intended
 * showcase. A production wiring would resolve the real chain per-record
 * — restore the commented-out lookup below when that lands.
 */
function resolveChainForEntity(_type: ChatterEntityType, _id: string): ChatterDocRef[] {
  return CANONICAL_CHAIN;
  // const hit = CANONICAL_CHAIN.find((d) => d.type === _type && d.id === _id);
  // if (hit) return CANONICAL_CHAIN;
  // return [{ type: _type, id: _id, label: _id }];
}

function threadIdForEntity(_type: ChatterEntityType, _id: string): string {
  return CANONICAL_THREAD_ID;
  // const isCanonical = CANONICAL_CHAIN.some((d) => d.type === _type && d.id === _id);
  // return isCanonical ? CANONICAL_THREAD_ID : `thread-${_type}-${_id}`;
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
];

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
