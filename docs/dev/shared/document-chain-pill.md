# DocumentChainPill

Single lineage surface for detail-page headers. See [ADR-003](../../audits/adr/ADR-003-document-chain-pill.md) for the rationale.

## Location

`apps/web/src/components/shared/data/DocumentChainPill.tsx`

## Consumers

- `SellOpportunityPage`
- `SellOrderDetail`
- `SellQuoteDetail`
- `MakeManufacturingOrderDetail`

## Behaviour

Renders the upstream and downstream documents for the current record as a horizontal pill of mini-links separated by chevrons. The current document is highlighted in place. Clicking a node navigates to that document.

Chain depth is small (typically 2–5 nodes); the component does not lazy-fetch. On narrow viewports it collapses interior nodes behind a count chip rather than wrapping.

## Resolver

The component walks `services/mock/data.ts` relationships today. When real services land, the same resolver shape (`{ upstream: DocRef[]; current: DocRef; downstream: DocRef[] }`) sits on top of the service-layer relationship helpers — consumers don't change.

## Adding a new document type

Extend the chain resolver to know how to walk into and out of the new type. Do not add a bespoke lineage chip on the detail page.

## Pairing with Chatter

DocumentChainPill and [Chatter](chatter.md) share the same chain identity — what Chatter calls "the chain" is what the pill renders. They are independent components but reach the same answer from the same resolver.
