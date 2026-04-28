# Changelog — 2026-04-28

Daily documentation review. Run by the `documentation` scheduled task.

## Summary

**No code changes shipped in the past 24 hours.** The most recent commit on `main` is still `3c4dc957` (2026-04-23 12:15 +1000) — *"feat: sell portal enhancements, control ops/routes, shared components, and docs"* — five days old. Yesterday's run (`CHANGELOG-2026-04-27.md`) and the day before (`CHANGELOG-2026-04-26.md`) were no-ops for the same reason.

Two pieces of unshipped work exist in the working tree today, neither committed:

1. **`docs/audits/dev/UX-COMPLETENESS-AUDIT-2026-04-28.md`** (created 2026-04-28 02:21) — a follow-up UX completeness audit comparing current state against the 2026-04-23 baseline. Output of an automated review; not yet linked from `AUDIT-SUMMARY-DEV.md`.
2. **10 unused-import cleanups** across `apps/web/src/components/` — dead-code removals only, no behaviour change. Listed below for traceability.

## Verification

| Check | Result |
|---|---|
| `git log -1` | `3c4dc957` (2026-04-23) — unchanged from 2026-04-26 / 2026-04-27 |
| `git log --since="24 hours ago"` | empty |
| Working tree | dirty: 10 modified files + 3 untracked docs (this changelog, the 2026-04-28 audit, the 2026-04-27 changelog still untracked) |
| Stash | `stash@{0}: buy-new-order-wip — pre-main-pull stash 2026-04-22` (unchanged, carried 6 days) |

## Today's working-tree changes

### Audit output (untracked)

`docs/audits/dev/UX-COMPLETENESS-AUDIT-2026-04-28.md` — 19 KB, 326 lines. Headline findings:

- **No regressions** vs the 2026-04-23 baseline. App structure stable across 96+ routes / 7 modules + Admin + Floor.
- **Resolved since Apr-23:** Book dashboard tabs (Expenses / Purchases / Job Costs) no longer render inline "coming soon" text — they now route to dedicated pages.
- **New sparse page:** `/book/cost-variance` shows three KPI cards (Total Budget $29,400 / Actual $30,850 / Variance +$1,450) but no per-job or per-cost-element table.
- **Persisting P0 issues:** `/sell/portal` content area is empty; `/control/shifts` summary cards render but the weekly shift grid is missing.
- **78+ "coming soon" toast actions** still present, no net change. P1 hotspots: Sell CRUD, Buy CRUD, Plan/Make new-record actions, Control Machines / BOMs / Routes.
- **Module scorecard delta:** Book module dropped a sub-grade due to the new Cost Variance gap; all other modules unchanged.

The audit is the substantive deliverable for today. It is **not** linked from `docs/audits/AUDIT-SUMMARY-DEV.md` yet, mirroring how the 2026-04-23 audit was left unlinked. Wiring it into the index is a deferred manual step.

### Code changes (unstaged dead-import cleanups)

Pure import-list pruning. No runtime, type, or behaviour changes. Total diff: +5 / −13 lines across 10 files.

| File | Removed import |
|---|---|
| `apps/web/src/components/bridge/steps/StepTeamSetup.tsx` | `Users` (lucide-react) |
| `apps/web/src/components/control/ControlBilling.tsx` | `Progress` |
| `apps/web/src/components/control/ControlDocuments.tsx` | `Clock` (lucide-react) |
| `apps/web/src/components/control/ControlPurchase.tsx` | `ShoppingBag`, `staggerItem` |
| `apps/web/src/components/control/ControlWorkflowDesigner.tsx` | `IconWell` |
| `apps/web/src/components/plan/BomGenerator.tsx` | `useEffect`, `RotateCw` |
| `apps/web/src/components/plan/PlanActivities.tsx` | default `React`, `Badge` |
| `apps/web/src/components/plan/PlanScheduleEngine.tsx` | `Badge` |
| `apps/web/src/components/plan/PlanShiftCalendar.tsx` | `Badge` |
| `apps/web/src/components/sell/SellSettings.tsx` | `Separator` |

These are reachable from `868b7c3c` (2026-04-19 *"chore: remove dead imports across plan/sell/shop-floor"*) — same author intent, broader scope, not yet committed.

No dev or user doc updates are required for these changes.

## Carry-over documentation gaps

All gaps catalogued in `CHANGELOG-2026-04-26.md` remain open. Spot-checked today:

- `docs/dev/modules/control/` — no `operations.md` or `routes.md` for the `ControlOperations` / `ControlRoutes` pages registered in the 2026-04-23 commit.
- `docs/dev/modules/sell/customer-portal.md` — `PortalContactsPanel`, `PortalProfileDrawer`, `PortalSubscriptionSection`, `portalPreferences` still unmentioned.
- `docs/dev/shared/` — still missing entries for `PartThumbnail` and `AuthContext`.
- Backing services with no dev-doc coverage (from 04-26): `operationsLibraryService`, `routesLibraryService`, `attachmentService`, `markupService`, `portalAccessService`, `subscriptionService`.
- Carry-overs from `CHANGELOG-2026-04-22.md` §"Not covered by this run" — still open: shop-floor leaderboard screenshot, Bridge review-step screenshot, batch traceability screenshot, Plan Production user doc.

These are deferred to an interactive writing session, not authored autonomously, per the same reasoning given on 2026-04-26 / 2026-04-27.

## Suggested follow-ups for an interactive session

When a human-driven writing pass next runs, the following are the lowest-effort, highest-value next steps:

1. **Link the 2026-04-28 audit from `AUDIT-SUMMARY-DEV.md`** so the index reflects current state — the 2026-04-23 audit was also left unlinked, both should be added together.
2. **Commit the 10 dead-import cleanups** — they are safe and self-contained; ideal as a `chore:` commit modelled on `868b7c3c`.
3. **Author `docs/dev/modules/control/operations.md` and `routes.md`** — the source files include accurate JSDoc that can seed the dev docs (per 04-26 changelog).
4. **Triage the new sparse Cost Variance page** — either populate with mock per-job rows or open a tracked issue. The audit elevates this to P1.

## Output

This file. No other documentation was modified — the substantive work today (the UX audit) was authored before this scheduled run executed, and authoring dev/user pages for the carry-over gaps is a scoped writing task that should be picked up in an interactive session rather than autonomously.
