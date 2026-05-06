# Nesting Studio

## Summary

The Nesting Studio is where a programmer takes parts that need cutting, lays them onto real sheet stock, and hands the result to the schedule. It replaces the older single-part Sheet Calculator. Both `/plan/nesting` and `/plan/sheet-calculator` redirect here.

The studio is one of four screens that share the same data:

- **Nesting Studio** (`/plan/nesting-studio`) — the workspace where you build a nest.
- **Ready to Nest** (`/plan/nesting-queue`) — pending cut demand, grouped by material and thickness.
- **Nests** (`/plan/nests`) — every nest in the system, with tabs for Drafts → Ready to schedule → Scheduled → Cutting → Done.
- **Nest detail** (`/plan/nests/:id`) — operator's read-only view of one nest, with downloads.

## Route

`/plan/nesting-studio`

## User intent

- Pick a machine and a sheet stock.
- Add the parts that need cutting (from the queue, the product library, a DXF you upload, or by typing in W × H).
- See, live, how many sheets it takes, what the yield is, what it'll cost, and how long it'll run.
- Save it as a draft, or confirm it so the planner can drop it onto the schedule.

## Page layout

Top to bottom:

1. **Header** — *Nesting Studio* with two top-right buttons:
    - **Save draft** — keeps everything in `Drafts`. Always available once there's at least one sheet.
    - **Confirm nest** — moves the nest to `Ready to schedule`. Disabled while any part is unplaced (the KPI says "X unplaced" and the chip turns red on the parts table).
2. **KPI strip** — four tiles, always in this order:
    - **Sheets** — how many stock sheets the packer needed, plus an "X of Y parts placed" sub-line.
    - **Avg yield** — average % across all sheets. If anything didn't fit, the sub-line tells you how many.
    - **Runtime** — total cut time across all sheets, plus the machine name.
    - **Cost** — total in AUD, with the material slice on the sub-line.
3. **Two-pane workspace** — *Setup* on the left, *Sheet preview* on the right (stacked on smaller screens):
    - **Setup pane** — Machine / Material / Thickness / Sheet stock selects on top; below them, a small info card showing sheet dimensions + on-hand qty + machine hourly rate; then **Pack settings** (part gap, edge gap, allow-rotation switch); finally a **Strategy** segmented control (Fast / Tight / Polygon) with a one-line note about what it does.
    - **Parts table** — beneath the setup card. Buttons across the top: **From queue**, **From library**, **Upload DXF**, **Manual**. Each row has W / H / Qty / rotation switch / source label. The dot at the start of each row is the colour the packer uses to draw that part on the preview, so you can spot it.
    - **Sheet preview pane** — the right side. Picks one sheet at a time (toggle the index across the top); shows every placement filled with the part's colour and labelled with part number + qty.

## How to add parts

You have four entry points, all on the row above the parts table:

1. **From queue** — opens a dialog of every pending `NestingQueueItem` for the active material and thickness. Tick the ones to add. Items already in the table are dimmed.
2. **From library** — opens a dialog of every `Product` that has geometry attached. Search by part number or description.
3. **Upload DXF** — drag-drop or click to browse. The studio parses the DXF, computes the bounding box, and adds it as a manual row with a `DXF` badge in the source column.
4. **Manual** — adds an empty row. Edit the part number, description, W, H, and qty in place.

Once a part is in the table, the packer re-runs whenever you change anything (W, H, qty, gaps, rotation, strategy, or sheet stock). Live status sits under the strategy picker — it shows "Packing… (worker)" while running and the duration after, so you know the studio isn't stuck.

## Pack strategies

| Strategy | What it does | When to use |
|---|---|---|
| **Fast** | First-Fit Decreasing Height shelf packer. Runs in milliseconds, deterministic. | Default — the answer the studio shows you while you're still adding parts. |
| **Tight** | Best of 8 sort × shelf strategies. Slower, tighter. | Right before saving — squeezes 2-5% extra yield in most cases. |
| **Polygon** | True polygon nesting. **Not yet implemented** — falls back to Tight today. | Future. |

## Save vs Confirm

- **Save draft** — keeps the nest in `draft` state. The planner won't see it. Useful while iterating, or while you're waiting on more parts to drop into the queue. Returns you to the same screen so you can keep working.
- **Confirm nest** — flips the nest to `ready_to_schedule`. The planner picks it up on the **Nests** screen and clicks Schedule, which reserves the stock. Confirm is greyed out while there's any unplaced part — the studio won't let you hand over a half-packed nest by accident.

When you save a nest that contains queue items, those queue items move from `pending` to `placed` and disappear from the **Ready to Nest** screen.

## Coming from the Ready-to-Nest screen

If you click **Open in Studio** from a queue row, the URL carries the queue item along (`?queueItem=…`). The studio:

- Adds that part to the parts table immediately.
- Snaps the machine, material, and thickness selectors to whatever the queue item needs.
- Auto-selects the first eligible sheet stock.

You can keep adding more parts after that — typically you'll batch all the items for the same material + thickness into one nest.

## Related screens

- [Ready to Nest](./nesting-queue.md) — where queue items live before you place them.
- [Nests](./nests.md) — every nest in the system, with the Schedule / Start cut / Mark done CTAs.
- [Nest detail](./nest-detail.md) — operator's view of one scheduled nest, with the DXF + pick-list downloads.
- [Schedule Engine](./schedule-engine.md) — where a scheduled nest shows up as a block on the timeline.

## States

- **default** — empty parts table, no sheets in the preview.
- **packing** — a part was just added or settings changed; "Packing… (worker)" appears under the strategy picker.
- **packed** — at least one sheet drawn; KPIs show the rollup.
- **partial** — some parts didn't fit on the eligible stock; KPI shows "X unplaced", Confirm disabled.
- **saving** — both top buttons disabled while the save round-trip runs.

## Design notes

- The yellow Confirm button is the single primary CTA — Save draft sits next to it as an outline button. This matches the rest of the platform's *one yellow button per screen* rule.
- The colour swatch on the parts table is the same colour the packer uses on the preview. If you place 8 of the same part across 3 sheets, the dot is the same colour on every row that shares the part.
- The studio is fully keyboard-navigable through the parts table — Tab walks W / H / qty / rotation columns; Delete on the trash icon removes the row.
