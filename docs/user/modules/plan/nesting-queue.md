# Ready to Nest

## Summary

Cut-step demand waiting for a programmer. Every time a Work Order's cut step lands on a cutting machine, a `NestingQueueItem` shows up here until someone places it onto a sheet in the [Nesting Studio](./nesting-studio.md).

## Route

`/plan/nesting-queue`

## User intent

- See, at a glance, how much cut work is queued and how urgent it is.
- Group by material and thickness so you can batch a single sheet run.
- Open the studio with one item already loaded.

## Page layout

- **Header** — *Ready to Nest* with a single yellow **Open Nesting Studio** button.
- **KPI strip** — four tiles:
    - **Pending** — items not yet on a nest.
    - **Placed** — items that have been added to a draft or confirmed nest.
    - **Overdue** — pending items where the WO due date has already passed.
    - **Due ≤ 3 days** — pending items due in the next three days.
- **Material groups** — one card per `material × thickness` combo, with a row count badge. Inside each card, a table: Part / WO / MO / qty / due / "Open in Studio" button.

## How items move

| Where | What happens |
|---|---|
| **In** | A WO operation hits a cut workcentre → a `NestingQueueItem` appears with `status: pending`. |
| **Out** | A programmer adds the item to a nest in the studio and clicks Save draft or Confirm — the item flips to `placed` and falls off this list. |
| **Cancelled** | If the WO is cancelled or the cut step is removed, the item flips to `cancelled` and falls off too. |

If a draft nest containing the item is *deleted* before save, the item returns to `pending`.

## Open-in-Studio handoff

The "Open in Studio" link carries the item id in the URL (`?queueItem=…`). When the studio loads it, it:

- Adds the part to the parts table.
- Snaps Machine / Material / Thickness to the item's spec.
- Auto-picks the first matching sheet stock.

You can keep adding more items after that — typically you'll batch every queue row for the same material + thickness into one nest.

## States

- **default** — at least one queue item present.
- **empty** — friendly empty state ("Nothing in the queue. New cut work shows up here when WOs progress.").
- **loading** — table skeleton while the queue fetches.
