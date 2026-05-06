# Nests

## Summary

Every nest in the system, across the full lifecycle. Where the planner picks up nests that the programmer has confirmed and drops them onto the schedule.

## Route

`/plan/nests`

## User intent

- See the full pipeline at a glance: Drafts / Ready to schedule / Scheduled / Cutting / Done.
- Schedule a nest (reserves the sheet stock).
- Move a scheduled nest to *Cutting* when the operator starts.
- Mark a nest *Done* when it leaves the machine.

## Page layout

- **Header** — *Nests*, with two top-right buttons: **View queue** (back to Ready to Nest) and **New nest** (jumps into the studio with an empty session).
- **KPI strip** — five tiles, one per status: Drafts / Ready / Scheduled / Cutting / Done.
- **Tabs** — same five statuses; each tab shows a per-status row table.

## Tabs and CTAs

The default tab is **Ready to schedule** — the planner's tray.

| Tab | Description | Per-row CTA |
|---|---|---|
| **Drafts** | Programmer iterating | *(no CTA — open to keep editing)* |
| **Ready to schedule** | Awaiting planner | **Schedule** — reserves stock, moves to Scheduled |
| **Scheduled** | On the engine, stock reserved | **Start cut** — moves to Cutting |
| **Cutting** | On the machine | **Mark done** — moves to Done, consumes stock |
| **Done** | Cut, scrap captured | *(none)* |

Every row also has an **Open** ghost button that opens the [Nest detail](./nest-detail.md) screen.

## Table columns

- **Nest** — number + author.
- **Machine** — machine name.
- **Material** — material + thickness + grade.
- **Sheets** — count of stock sheets in the nest.
- **Yield** — average across sheets, %.
- **Cost** — total in AUD.
- **Source MOs** — count of Manufacturing Orders fulfilled by this nest.
- **Status** — coloured badge.

## Schedule action

Clicking **Schedule** on a `Ready to schedule` row:

1. Reserves the sheet stock for every sheet in the nest (`SheetStock.status: available → reserved`).
2. Stamps a schedule block — the nest then appears on the [Schedule Engine](./schedule-engine.md) timeline.
3. Moves the nest to *Scheduled*.

If you change your mind, opening the nest detail and clicking **Unschedule** releases the stock back to *available* and pushes the nest back to *Ready to schedule*.

## States

- **default** — at least one nest in any status; table populated.
- **empty (per tab)** — friendly placeholder text ("No nests in this state.").
- **busy (per row)** — Schedule / Start cut / Mark done buttons disable while the action is in flight.
