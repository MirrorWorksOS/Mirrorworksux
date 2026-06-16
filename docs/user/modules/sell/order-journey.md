# Order Journey

The Order Journey is one canonical page per Sales Order that shows the order's full lifecycle — quote → SO → job → BoM → MRP → schedule → manufacturing → dispatch → invoice — and lets the team move it through every fulfilment archetype from a single screen.

## Where to find it

Open any Sales Order (`/sell/orders/:id`) and click **Journey**, or jump straight to `/sell/orders/:id/journey`.

## What's on the page

- A **horizontal stage strip** across the top (the Journey Stepper). Completed stages render filled, the current stage is highlighted, future stages are outlined.
- **Stage banners inline** in the body of the page — each stage adds its own card as the order progresses, so you can see "where are we now" without scrolling through a wall of placeholder text.
- A **sticky action panel** on the right with one button per archetype demo (B1–B7). Use these on a customer click-through to walk through every fulfilment path without leaving the screen.
- A **gate banner** at the top of the body when a transition is blocked (e.g. "BoM missing for line 2" with a one-click fix link).

## The seven archetypes

The Journey page renders any of these from the same screen — the buttons in the action panel drive each one:

- **MTO** — Make-to-order. The default. Confirming the SO spawns a Job; releasing to Plan kicks off the routing.
- **Catalogue sale** — Pick from stock; no Job is created. The journey skips manufacturing and runs straight through dispatch.
- **MTS Replenishment** — The reorder monitor (`/plan/reorder-rules`) creates Jobs against the **Stock** customer when a SKU dips below its reorder point. You see those Jobs as parents in the journey graph.
- **ETO** — Engineering-to-order. Confirming an ETO line creates an engineering Job for the BoM author. Publishing the BoM (`/plan/engineering`) spawns the production Job, linked via `parentJobId`.
- **Variation order** — Use the VO action to preview the impact on MOs / WOs / dates before applying. Apply only after the impact panel reads sensibly.
- **Rework** — A failed QC decision opens a rework chain on the original WO. The journey surfaces the chain so you can see why the order's stuck.
- **Subcontract** — Dispatch the material to the supplier; the order pauses at the subcontract step until you record receipt + QC.

## Advancing a stage

Each stage banner has an **Advance** button. Clicking it:

1. Runs the appropriate gate (SO → Job, Plan → Make, Make → Ship, Receiving).
2. If the gate fails, the page surfaces a banner explaining what's missing — with deep-link fix CTAs where applicable (e.g. "Product X has no BoM" → opens `/plan/products/X/bom`).
3. If the gate passes, the state moves and the next stage banner renders inline.

## Notes

- The page is the canonical demo URL. If a customer asks to "see your fulfilment flow", drop them on this URL with a fixture SO — every archetype is one button away.
- The **route chip** on each line (visible from the parent SO detail) controls which archetype that line takes. Override per line if a single SO mixes archetypes.
- Replenishment / engineering / variation Jobs use the **Stock** pseudo-customer instead of a nullable customer — they still appear in customer-scoped lists under "Stock".
