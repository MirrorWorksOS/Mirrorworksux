# ADR-003 — DocumentChainPill

## Context

MirrorWorks documents form a chain: Opportunity → Quote → Order → Manufacturing Order → Invoice (with branches for shipments, requisitions, etc.). Users repeatedly needed to navigate this chain from a detail page — "what's the order behind this MO?", "what shipment closed this order?", "what quote did this invoice come from?" — and detail pages had grown ad-hoc lineage chips in different positions, styles, and depths.

## Decision

Introduce `DocumentChainPill` (`apps/web/src/components/shared/data/DocumentChainPill.tsx`) as the single lineage surface on detail page headers. It shows upstream and downstream documents as a horizontal pill of mini-links with chevrons between them; clicking a node navigates to that document. The current document is highlighted in place.

Initial consumers (wired in the same commit): `SellOpportunityPage`, `SellOrderDetail`, `SellQuoteDetail`, `MakeManufacturingOrderDetail`. Headers that previously rolled their own lineage chips drop them.

The pill resolves the chain by walking `services/mock/data.ts` relationships (and, in production, will sit on top of the same service-layer relationship helpers). It does not fetch lazily — chain depth is small.

## Consequences

- Lineage navigation is a single component to maintain. Visual / interaction changes propagate everywhere.
- New document types join the chain by extending the resolver, not by adding bespoke chips per detail page.
- Pairs naturally with Chatter (ADR-004), which follows the same chain to thread conversation across related documents.
- Cost: pill width on long chains can crowd the header; render must collapse middle nodes gracefully on narrow viewports (responsive handling lives in the component, not consumers).

## Alternatives

- **Per-module lineage chips.** Rejected — the divergence was the problem; users expect lineage to look and behave identically across modules.
- **Breadcrumbs.** Rejected — breadcrumbs imply hierarchy; document chains are bidirectional (upstream + downstream both exist), and the chevron pill conveys that.
- **Side-panel "Related documents" list.** Rejected — slower for the dominant use case (jump to the immediate parent / child), and consumes more screen space than warranted.
