# ADR-004 — App-wide Chatter

## Context

Conversation on a manufacturing job naturally spans the whole document chain. A question raised on a Quote often resurfaces on the Order, then the Manufacturing Order, then the Invoice. Per-document comment threads forced users to repost context every time the work moved downstream, and there was no single inbox surface for "everything happening on this job". A previous narrow implementation existed (`make/OperatorChat.tsx`), but it was floor-specific and didn't follow lineage.

## Decision

Introduce **Chatter** (`apps/web/src/components/shared/chatter/`) — a single record-following chat surface available on every detail page that belongs to a document chain. Architecture:

- `ChatterButton` — header affordance opening the sheet
- `ChatterSheet` — slide-over chat panel
- `ChatterComposer` — message input (text, mentions, attachments)
- `ChatterMessage` — single message render with avatar / timestamp / chain-source badge
- `ChatterChainFilter` — toggle to scope visible messages to "this document only" vs "whole chain"
- `ChatterSummaryCard` — embeddable summary for dashboards / overview tabs
- `useChatterFollow` — hook that subscribes to messages by chain identity
- `services/chatterService.ts` — service-layer contract (mock-backed today; thread CRUD, mention parsing, attachment links)
- `store/chatterStore.ts` — Zustand store for open-sheet state, unread counts, optimistic message append

`OperatorChat.tsx` (the floor-specific implementation) is removed in the same commit. Wired into `Layout` (global button), Sell (`SellOrderDetail`, `SellOpportunityPage`, `SellQuoteDetail`), Make (`MakeManufacturingOrderDetail`, `MakeWorkOrderDetail`), Plan (`PlanJobDetail`, `PlanOverviewTab`, `PlanIntelligenceHubTab`), and Book (`InvoiceDetail`).

## Consequences

- One conversation surface; messages posted on a Quote remain visible — in chain-scoped mode — when the user lands on the resulting Order / MO / Invoice.
- Pairs with DocumentChainPill (ADR-003): the same chain resolver feeds Chatter's "what is this record connected to" question.
- Floor execution loses the bespoke `OperatorChat` — operators get the same surface as everyone else, which is a deliberate flattening.
- Cost: a single store for chat state across the app needs careful unread-count + websocket handling once it leaves mock mode. The service-layer boundary (`chatterService`) is the place to absorb that.

## Alternatives

- **Per-document comment threads, keep them isolated.** Rejected — fails the cross-chain use case which is the whole reason this exists.
- **Build on top of an external chat platform (Slack-embed, Stream, etc.).** Rejected — auth and lineage semantics don't map cleanly, and we want chat data inside the same service-layer / audit surface as the rest of the ERP.
- **Keep `OperatorChat` plus a separate threaded comment system for office users.** Rejected — two surfaces, two unread inboxes, two mental models, and the lineage problem still isn't solved.
