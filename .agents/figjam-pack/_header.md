# FigJam content pack — MirrorWorks Workflows board

Date: 2026-06-11
Ground truth: [workflow-decisions-2026-06-11.md](workflow-decisions-2026-06-11.md) — the 13 grill-me decisions plus assembly amendments. Where this pack and any older doc disagree, the decisions file wins.
Target board: `https://www.figma.com/board/sbb1GwGMG89qx88298UJiD/MirrorWorks---Workflows`

## How to use this pack

Each section below replaces one frame on the board. Content is organised as
PASTE BLOCKS: the block heading names the FigJam element to create (frame
title, text panel, sticky, node label); the text under it is pasted verbatim.
Styling/layout instructions are marked "do NOT paste". Every section ends with
a change log accounting for every old-board item (kept / moved / renamed /
removed) — nothing was dropped silently.

A generated reference diagram of the corrected spine (7 stages, 5 gates, Buy
branch) has already been inserted into the board canvas — drag it beside frame
0a while rebuilding.

## Frame map

| Frame | Replaces | Contents |
|---|---|---|
| 0a | "0a. Job Lifecycle — Flat (Spine View)" | 7-stage spine, gate diamonds G1–G5, Buy parallel branch, spokes, deviations, money annotations, key |
| 0b | "Validation gates" cards + "Backend fields" chips | 5 gate cards + BoM-publish check, Background crons panel, Backend build sheet (schema-delta chips), code remediation stickies, open questions |
| 0c | (new frame) | Architecture overlay: service × stage matrix, six service cards (Convex / WorkOS / R2 / Resend / Xero / APS), webhooks panel, badge legend |
| 0d | "Workflow archetypes — quick reference" | 9 cards in 4 groups: 3 routes + 1 trigger + 3 deviations + 2 stock-truth flows |

## Decisions still open (need Matt, not Sharjeel)

1. Requisition approval role — decide against the ARCH 00 access spec
   (admin / lead / team) before wiring approval enforcement.
2. `PaymentTerm.depositPct` migration — auto-convert to an `order_confirmed`
   milestone row, or drop and re-enter terms manually?
3. Invoice ↔ milestone link shape — fields on Invoice `{event, pct, shipmentId?}`
   vs a separate join row (G4's dedup check depends on it).
4. Payment as a persisted entity vs status-only pull from Xero.
5. Cron cadences (all proposed: hourly reorder monitor, nightly overdue
   flagger, 5-min VO re-fire retry, hourly Xero pull).
6. G5 qty tolerance — global, per-product, or per-PO-line?
7. G2 `material_short` — does a covering PO need to be sent/acknowledged, or
   does a draft count?
8. ETO waiver shape — fields on the engineering Job vs a separate record.
9. Xero payment status — webhook vs polling; contacts sync direction.
10. APS translation — keep 5-second polling in production or register a webhook?
11. New `Attachment.kind` names for DXF/CAD and Bill of Lading; extend
    `Attachment.entityType` with `job`.
12. Resend bounce handling; supplier-facing PO emails in/out of MVP.
13. Archetype frequency/revenue context lines are typical-fab estimates —
    eyeball against the old board's numbers before deleting it.

---
