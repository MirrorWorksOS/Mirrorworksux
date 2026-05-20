# EditableCard + EditField

Inline-edit pattern adopted across Sell detail pages during the 2026-05-12 Sell module overhaul.

## Location

`apps/web/src/components/shared/forms/`

```
EditField.tsx     Single inline-editable field (display value → edit input → save / cancel)
EditableCard.tsx  Card shell that wraps a group of EditFields with shared edit-mode state
```

## Consumers

- `SellCustomerDetail`
- `SellOpportunityPage`
- `SellOrderDetail`
- `SellQuoteDetail`

## Behaviour

`EditableCard` owns a single `editing` state for the whole card. While idle it renders read-only `EditField` values; entering edit mode flips each `EditField` to its input control. Save commits via the consumer's callback; cancel restores the original snapshot.

`EditField` supports text, number, currency, select, and date variants. Validation hooks let callers reject a value before the card exits edit mode.

## Pairing with the broader Sell pattern

The Sell module overhaul (commit `e9cf242f`) introduced a wider editable-detail pattern:

- `EditableCard` + `EditField` for inline fields
- `LogActivityModal` (under `shared/activities/`) for logged interactions
- `HistoryPanel` (under `shared/history/`) for the audit timeline on the side panel
- `EntityPickerModal` (under `shared/pickers/`) for relation pickers (customer, contact, account, etc.)

These four pieces compose the canonical "editable detail page" shape. New detail surfaces should reach for them before rolling local equivalents.

## Numbering service

The same overhaul added `apps/web/src/services/numbering.ts` — a shared document-numbering service used by the quote / order / invoice state machine. It lives in `services/` rather than `shared/forms/` because numbering is a domain concern, not a form concern, but it pairs naturally with EditableCard for new-document flows.
