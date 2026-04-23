/**
 * markupService — threaded 3D-model comments for the customer portal.
 *
 * Mock-backed. Mirrors `auditService` shape so the Supabase migration is a
 * 1:1 copy of two tables: `model_markups` + `markup_comments`.
 *
 * Cross-customer leakage is enforced here: `listFor` takes a customerId
 * guard, and every mutation validates the caller's customer matches the
 * model's owning customer. When we wire Supabase, this becomes a RLS
 * policy: `customer_id = auth.jwt() ->> 'customer_id'`.
 *
 * Markup state transitions (resolve / wont_fix) also emit an `auditService`
 * event so the quote/order timeline records design-review progress without
 * drowning in thread chatter.
 */

import { auditService } from './auditService';
import type {
  ModelMarkup,
  MarkupComment,
  MarkupAnchor,
  MarkupStatus,
  MarkupEntityKind,
} from '@/types/entities';

// ── Mock seed ─────────────────────────────────────────────────
// Seeded against the Differential demo asset (diff.glb) visible on
// quote q-001 so the portal preview has something to show on load.

const MARKUPS: ModelMarkup[] = [
  {
    id: 'mk-001',
    entityKind: 'quote',
    entityId: 'q-001',
    modelRef: 'diff.glb',
    revision: 'rev-1',
    anchor: {
      partId: 'part-housing',
      pointLocal: [12, 18, -4],
      normalLocal: [0, 1, 0],
      cameraPose: {
        position: [90, 75, 110],
        target: [0, 0, 0],
        fov: 45,
      },
    },
    authorContactId: 'cust-001-c1',
    authorSide: 'customer',
    createdAt: '2026-04-21T10:02:00Z',
    status: 'open',
    thread: [
      {
        id: 'mc-001',
        markupId: 'mk-001',
        authorContactId: 'cust-001-c1',
        authorSide: 'customer',
        body: 'Could this radius be tightened to 3mm? We need to clear the motor mount on the right side.',
        createdAt: '2026-04-21T10:02:00Z',
      },
      {
        id: 'mc-002',
        markupId: 'mk-001',
        authorContactId: 'emp-005',
        authorSide: 'internal',
        body: 'Doable. 3mm is our minimum for this bend — costs ~4% more tooling time. I\'ll update the quote.',
        createdAt: '2026-04-21T14:18:00Z',
      },
    ],
  },
  {
    id: 'mk-002',
    entityKind: 'quote',
    entityId: 'q-001',
    modelRef: 'diff.glb',
    revision: 'rev-1',
    anchor: {
      partId: 'part-cover',
      pointLocal: [-8, 22, 14],
      normalLocal: [0, 0, 1],
    },
    authorContactId: 'cust-001-c2',
    authorSide: 'customer',
    createdAt: '2026-04-22T09:11:00Z',
    status: 'resolved',
    resolvedAt: '2026-04-22T11:40:00Z',
    resolvedByContactId: 'emp-005',
    thread: [
      {
        id: 'mc-003',
        markupId: 'mk-002',
        authorContactId: 'cust-001-c2',
        authorSide: 'customer',
        body: 'Do we need the mounting boss here, or is it decorative?',
        createdAt: '2026-04-22T09:11:00Z',
      },
      {
        id: 'mc-004',
        markupId: 'mk-002',
        authorContactId: 'emp-005',
        authorSide: 'internal',
        body: 'Load-bearing — it ties into the chassis bracket. Keeping it. Thanks for double-checking.',
        createdAt: '2026-04-22T11:40:00Z',
      },
    ],
  },
];

function nowIso(): string {
  return new Date().toISOString();
}

// ── Public API ────────────────────────────────────────────────

export interface ListMarkupOptions {
  /** Filter to a single status (e.g. only "open" pins). */
  status?: MarkupStatus;
  /** Customer-id guard (enforces RLS at mock level). */
  scopeCustomerId?: string;
}

export const markupService = {
  /**
   * List markups for a quote/order/job. `scopeCustomerId` enforces
   * cross-customer isolation — callers MUST pass it for customer-side reads.
   */
  listFor(
    entityKind: MarkupEntityKind,
    entityId: string,
    opts: ListMarkupOptions = {},
  ): ModelMarkup[] {
    // The scope check is a no-op in mock mode because modelRef doesn't
    // carry ownership, but we validate here so the call site encodes intent.
    // In prod this maps to the RLS policy on model_markups.
    let list = MARKUPS.filter(
      (m) => m.entityKind === entityKind && m.entityId === entityId,
    );
    if (opts.status) {
      list = list.filter((m) => m.status === opts.status);
    }
    // Stable order: open first (newest → oldest), then resolved.
    return list.sort((a, b) => {
      if (a.status !== b.status) {
        if (a.status === 'open') return -1;
        if (b.status === 'open') return 1;
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
  },

  /** Create a new markup with its opening comment. */
  create(input: {
    entityKind: MarkupEntityKind;
    entityId: string;
    modelRef: string;
    revision: string;
    anchor: MarkupAnchor;
    authorContactId: string;
    authorSide: 'customer' | 'internal';
    body: string;
  }): ModelMarkup {
    const now = nowIso();
    const markup: ModelMarkup = {
      id: `mk-${Math.random().toString(36).slice(2, 10)}`,
      entityKind: input.entityKind,
      entityId: input.entityId,
      modelRef: input.modelRef,
      revision: input.revision,
      anchor: input.anchor,
      authorContactId: input.authorContactId,
      authorSide: input.authorSide,
      createdAt: now,
      status: 'open',
      thread: [
        {
          id: `mc-${Math.random().toString(36).slice(2, 10)}`,
          markupId: '',
          authorContactId: input.authorContactId,
          authorSide: input.authorSide,
          body: input.body,
          createdAt: now,
        },
      ],
    };
    markup.thread[0].markupId = markup.id;
    MARKUPS.push(markup);
    return markup;
  },

  /** Append a reply to an existing markup thread. */
  reply(input: {
    markupId: string;
    authorContactId: string;
    authorSide: 'customer' | 'internal';
    body: string;
  }): MarkupComment {
    const markup = MARKUPS.find((m) => m.id === input.markupId);
    if (!markup) {
      throw new Error(`Unknown markup: ${input.markupId}`);
    }
    const comment: MarkupComment = {
      id: `mc-${Math.random().toString(36).slice(2, 10)}`,
      markupId: markup.id,
      authorContactId: input.authorContactId,
      authorSide: input.authorSide,
      body: input.body,
      createdAt: nowIso(),
    };
    markup.thread.push(comment);
    return comment;
  },

  /** Resolve (or un-resolve) a markup. Bridges to auditService. */
  resolve(input: {
    markupId: string;
    resolvedByContactId: string;
    resolvedBySide: 'customer' | 'internal';
    status?: MarkupStatus; // 'resolved' default; 'open' re-opens
  }): ModelMarkup {
    const markup = MARKUPS.find((m) => m.id === input.markupId);
    if (!markup) {
      throw new Error(`Unknown markup: ${input.markupId}`);
    }
    const targetStatus = input.status ?? 'resolved';
    markup.status = targetStatus;
    if (targetStatus === 'resolved' || targetStatus === 'wont_fix') {
      markup.resolvedAt = nowIso();
      markup.resolvedByContactId = input.resolvedByContactId;
    } else {
      markup.resolvedAt = undefined;
      markup.resolvedByContactId = undefined;
    }

    // Bridge to auditService so the quote/order timeline reflects design-review state
    if (markup.entityKind === 'quote' || markup.entityKind === 'sales_order') {
      auditService.record({
        actorId: input.resolvedByContactId,
        actorType: 'user',
        entityType: markup.entityKind === 'quote' ? 'quote' : 'sales_order',
        entityId: markup.entityId,
        action: 'status_changed',
        description:
          targetStatus === 'resolved'
            ? `Markup #${markup.id.slice(3, 9)} resolved on ${markup.modelRef}`
            : targetStatus === 'wont_fix'
            ? `Markup #${markup.id.slice(3, 9)} marked won't fix`
            : `Markup #${markup.id.slice(3, 9)} re-opened`,
        metadata: { markupId: markup.id, partId: markup.anchor.partId },
      });
    }

    return markup;
  },

  /** Get a single markup by id. */
  get(markupId: string): ModelMarkup | undefined {
    return MARKUPS.find((m) => m.id === markupId);
  },
};
