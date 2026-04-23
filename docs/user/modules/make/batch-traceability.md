# Batch Traceability

## Summary
Tree view that follows a raw-material lot all the way through WIP into finished goods. Use it to answer questions like *"which finished items came from this mill heat?"* or *"this returned part is defective — what raw stock did it come from?"*.

## User Intent
Stand up a complete traceability chain on one screen: lot numbers, quantities, statuses, suppliers, dates — with quick access to the mill test certificate for raw-material lots.

## Primary Actions
- Expand / collapse any node to widen or narrow the view.
- Click the external-link icon next to a raw-material lot to open its **material test certificate** in a new tab.
- Read the heat number printed alongside each raw-material lot for AS/NZS and ISO traceability audits.

## Key UI Sections
- **Raw material node** — lot number, heat number, external-cert link, material, qty, date, supplier, status.
- **WIP node** — child of the raw-material lot that fed it; same detail row minus the cert link.
- **Finished goods node** — child of the WIP that produced it; status moves through released → consumed.

## Data Shown
- Lot number (`LOT-...`)
- Heat number (raw-material only)
- Link to external material certificate (raw-material only, when available)
- Material / spec
- Quantity
- Date received / produced / released
- Supplier (where applicable)
- Status: **Active**, **Quarantine**, **Released**, or **Consumed**

## States
- populated (lots loaded)
- empty (no batch/lot records)

## Design / UX Notes
- Raw-material rows show the heat number as part of the lot header so auditors can cross-reference the mill cert at a glance.
- The certificate link opens in a new tab — keeps your place in the tree.
- Quarantined lots are tinted red; released lots are tinted green.
