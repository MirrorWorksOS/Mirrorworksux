# Chatter

App-wide record-following chat. See [ADR-004](../../audits/adr/ADR-004-chatter.md) for the rationale and the deliberate removal of `OperatorChat`.

## Location

`apps/web/src/components/shared/chatter/`

```
ChatterButton.tsx        Header affordance opening the sheet
ChatterChainFilter.tsx   Toggle: "this document" vs "whole chain"
ChatterComposer.tsx      Message input (text, mentions, attachments)
ChatterMessage.tsx       Single message render
ChatterSheet.tsx         Slide-over chat panel
ChatterSummaryCard.tsx   Embeddable summary for dashboards / overview tabs
useChatterFollow.ts      Hook that subscribes to messages by chain identity
index.ts                 Public re-exports
```

Service + store:

- `apps/web/src/services/chatterService.ts` — thread CRUD, mention parsing, attachment links (mock-backed today)
- `apps/web/src/store/chatterStore.ts` — Zustand store for open-sheet state, unread counts, optimistic appends

## Consumers

- `Layout` — global Chatter button
- Sell — `SellOrderDetail`, `SellOpportunityPage`, `SellQuoteDetail`
- Make — `MakeManufacturingOrderDetail`, `MakeWorkOrderDetail`
- Plan — `PlanJobDetail`, `PlanOverviewTab`, `PlanIntelligenceHubTab`
- Book — `InvoiceDetail`

## Behaviour

- A message is posted against a record (e.g. a Quote).
- In **chain-scoped** mode, viewers on related documents (the Order that followed, the MO, the Invoice) see the message in their Chatter sheet with a chain-source badge identifying the original document.
- In **this-document** mode, the sheet shows only messages posted directly against the current record.
- `ChatterSummaryCard` surfaces recent activity on dashboards and overview tabs without opening the sheet.

## Chain identity

Chatter reuses the same chain resolver as [DocumentChainPill](document-chain-pill.md). One chain identity, two surfaces.

## OperatorChat removed

`apps/web/src/components/make/OperatorChat.tsx` was deleted in the same commit. Floor operators now use the same Chatter surface as office users — deliberately flattening the two-conversation model.

## Adding Chatter to a new detail page

Mount `<ChatterButton recordRef={{ type, id }} />` in the page header. The hook and store handle everything else. No per-page setup beyond passing the record reference.
