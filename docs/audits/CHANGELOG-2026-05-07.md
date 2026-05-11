# Changelog — 2026-05-07

Daily documentation review. Run by the `documentation` scheduled task at 2026-05-08 07:36 +1000.

## Summary

**Empty commit window.** Zero commits landed on `main` between 2026-05-07 00:00 and 2026-05-08 07:36 (run start). `git log --since="2026-05-07 00:00"` returns no rows; the working tree carries only the docs/changelog edits from yesterday's run, still uncommitted.

This run did three things:

1. Confirmed no new code shipped on 2026-05-07 — nothing to document.
2. Caught up the screenshot gap from the 2026-05-06 run (which marked headless capture as **failed** because the React bundle didn't boot in the preview tab). Re-running today against the same dev server, with `--virtual-time-budget=8000` so the lazy chunks finish before the screenshot fires, the captures succeeded.
3. Edited [`CHANGELOG-2026-05-06.md`](CHANGELOG-2026-05-06.md) — Verification row updated, new "Screenshots (Run 2 — 2026-05-08 07:36)" section appended listing the eight files now on disk.

## Verification

| Check | Result |
|---|---|
| `git log --since="2026-05-07 00:00"` | empty |
| `git log -1` | `1303f72e` (2026-05-06 21:44 +1000) — unchanged from yesterday's run |
| Working tree | 19 modified docs + 1 untracked changelog from the 2026-05-06 run, all still uncommitted |
| Stash | unchanged (`buy-new-order-wip — pre-main-pull stash 2026-04-22`) |
| Dev server | started on port 5173, React bundle booted (`#root` populated, page title "MirrorWorks — Smart FactoryOS") |
| Headless screenshot capture | **8 captured** — see `CHANGELOG-2026-05-06.md` "Screenshots (Run 2)" |

## Screenshots captured this run

All written under `docs/audits/screenshots/` and listed in `CHANGELOG-2026-05-06.md`. Filenames keep the `-2026-05-06` suffix because the date refers to the change, not the capture.

- `buy/buy-reports-2026-05-06.png`
- `buy/buy-supplier-detail-2026-05-06.png`
- `buy/buy-vendor-comparison-2026-05-06.png`
- `buy/buy-requisition-new-2026-05-06.png`
- `ship/ship-scan-to-ship-2026-05-06.png`
- `ship/ship-tracking-2026-05-06.png`
- `book/book-job-cost-detail-2026-05-06.png`
- `control/control-machines-form-2026-05-06.png`

## Doc deltas (this run)

| Doc | Change |
|---|---|
| `docs/audits/CHANGELOG-2026-05-07.md` | **NEW** — this file |
| `docs/audits/CHANGELOG-2026-05-06.md` | Verification row updated; Run 2 screenshots section appended |
| `docs/dev/**` and `docs/user/**` | **No edits this run** — yesterday's substantive doc rewrites still apply unchanged |

## Outstanding (carry-forward from 2026-05-06)

- **Uncommitted.** All 19 modified docs + `CHANGELOG-2026-05-06.md` from yesterday's run, plus today's two changelog edits, are sitting in the working tree. No commit yet — flagging in case the next run expects a clean tree.
- **Route discrepancy still live.** `apps/web/src/components/plan/PlanSchedule.tsx` is unwired; `routes.tsx` still resolves `/plan/schedule` → `/plan/schedule-engine`. Already documented in `docs/dev/modules/plan/schedule.md`; restating here so it doesn't get lost on the next quiet day.
- **Headless capture gaps to chase.** The new requisition Line Items editor and the Control machines form-dialog only render after a tab/button click; a `--virtual-time-budget` static screenshot won't reach them. A follow-up run should drive those interactions through the preview MCP (`preview_click` then a save path) rather than headless Chrome.
