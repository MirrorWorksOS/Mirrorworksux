# Reorder Rules

Per-product replenishment thresholds. When stock on-hand drops below a product's reorder point, the monitor creates a Make-to-Stock Job against the **Stock** pseudo-customer. The rules screen is where you tune those thresholds and watch the monitor's output.

## Where to find it

Sidebar: **Plan → Reorder rules**. Direct URL: `/plan/reorder-rules`.

The **Buy → Reorder rules** screen is a different (purchasing-side) table; this one is about replenishment Jobs that internal manufacturing will fulfil.

## What's on the page

- A **rules table**, one row per product:
  - **Product** — part number + name.
  - **On hand** — current stock.
  - **Reorder point** — when on-hand drops to this number, the monitor trips.
  - **Reorder qty** — how many to make per replenishment Job.
  - **Lead (d)** — typical manufacturing lead in days.
  - **Shortage** — `max(0, reorderPoint − onHand)`. Anything above 0 will trip on the next monitor run.
  - **Enabled** — toggle to pause the rule without losing the threshold values.
- A **Run monitor now** button (top-right) that fires the cron mutation manually. In production this runs on a schedule; here, it's the same code path so you can demo the flow on-screen.
- A **Replenishment Jobs** table below, showing the most-recent Jobs the monitor produced (newest first, last 12).

## When to use it

- Set thresholds for any SKU that should be made-to-stock instead of made-to-order.
- After a busy period, click **Run monitor now** to top up the queue without waiting for the cron.
- When debugging "why didn't this get made?", check the rule's Enabled state + shortage column. If shortage is 0, the monitor is doing the right thing.

## Notes

- The monitor only triggers for products whose route is **Make-to-Stock**. Anything routed MTO / Catalogue / ETO is ignored regardless of stock level.
- Replenishment Jobs use the **Stock** customer — they still show up in customer-scoped Job lists, filed under Stock.
- Disabling a rule doesn't cancel in-flight replenishment Jobs; it only prevents new ones.
