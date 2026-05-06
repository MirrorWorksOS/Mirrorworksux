# Nest Detail

## Summary

Operator's read-only view of one nest. Use it on the floor: pull the DXF for the cutter, print the pick-list, see exactly which Work Orders this nest fulfils, and move the nest through Scheduled → Cutting → Done.

## Route

`/plan/nests/:id`

## User intent

- Pull the cut file for the machine.
- Print the pick-list so the operator knows what comes off the sheet.
- See, at a glance, which jobs and Work Orders this nest covers.
- Advance the nest's status without going back to the Nests list.

## Page layout

- **Header** — nest number + status badge + breadcrumbs back to Plan / Nests. The same status-conditional CTA from the Nests list (Schedule / Start cut / Mark done) sits in the header so an operator never has to bounce.
- **KPI strip** — Sheets / Yield / Runtime / Cost (same four tiles as the studio).
- **Sheet picker** — segmented control across the top of the preview when the nest has more than one sheet.
- **Sheet preview** — full-size SVG of the selected sheet. Each placement is filled with the part's colour and labelled with part number + qty.
- **Placements table** — one row per placement on the selected sheet: Part / Qty on sheet / Source WOs (with qty per WO) / position.
- **Source MOs / WOs panel** — a small card listing every Manufacturing Order and Work Order this nest fulfils, with a link out to each.
- **Cost rollup** — material / machine / labour / total in AUD.
- **Downloads** — two buttons:
    - **Download sheet DXF** — minimal R12 ASCII DXF for the selected sheet, named `<nest>-sheet-<n>.dxf`. Placeholder for the future CAM post-processor.
    - **Download pick-list CSV** — every placement on every sheet with WO sources, ready to print.

## Status CTAs (header)

- *Ready to schedule* → **Schedule** (reserves stock).
- *Scheduled* → **Start cut** (moves to *Cutting*).
- *Cutting* → **Mark done** (moves to *Done*, consumes stock).
- *Done* / *Cancelled* → no CTA.

## Disconnected / loading

- While loading, the page renders a centred "Loading…" card.
- If the `:id` doesn't match any nest, the page falls back to the loading state (a 404 surface is on the follow-up).

## Related screens

- [Nesting Studio](./nesting-studio.md) — where nests are built.
- [Nests](./nests.md) — list across the lifecycle.
- [Schedule Engine](./schedule-engine.md) — where a scheduled nest appears as a block.

## States

- **default** — nest loaded, sheet 1 selected.
- **loading** — fetching nest by id.
- **busy** — header CTA disabled while a status mutation is in flight.
