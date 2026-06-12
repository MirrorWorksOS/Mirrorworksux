# Engineering Jobs (ETO)

The Engineering Jobs screen is the ETO queue — Sales Order lines marked as engineering-to-order create an engineering Job for the BoM author. Publishing the BoM spawns the production Job that the floor actually runs.

## Where to find it

Sidebar: **Plan → Engineering**. Direct URL: `/plan/engineering`.

## What's on the page

- **Awaiting BoM publication** — a table of engineering Jobs that don't yet have a published BoM. Columns: Job number, customer, product, status, lead engineer, age.
- A **Publish BoM** action on each row. Clicking it authors the BoM revision, links the production Job via `parentJobId`, and toasts the new production Job number.
- **Production Jobs spawned from this queue** — a second table below, showing every production Job whose parent is in the queue above. Includes a mini graph of the parent → child chain.

## When to use it

- Customer confirms an SO with an ETO line. Confirming the SO creates the engineering Job here automatically.
- Engineering authors the BoM in the product BoM editor.
- When the BoM is signed off, click **Publish BoM** on the engineering Job. The production Job appears below; the SO line is now linked to a real production schedule.

## Notes

- Engineering Jobs use the **Stock** pseudo-customer until the BoM is published; the production Job inherits the real customer from the source SO line.
- The mini graph (`JobGraphMini`) shows the parent → child relationship — useful when an ETO part has been re-engineered and you have multiple production Jobs branching from the same engineering parent.
- Empty queue? Confirm an SO with an ETO line to seed one (the page links to a fixture SO that does it in one click).
