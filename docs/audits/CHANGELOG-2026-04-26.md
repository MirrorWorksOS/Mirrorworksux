# Changelog — 2026-04-26

Daily documentation review. Run by the `documentation` scheduled task.

## Summary

**No code changes shipped in the past 24 hours.** Working tree is clean. The most recent commit on `main` is `3c4dc957` (2026-04-23 12:15 +1000) — *"feat: sell portal enhancements, control ops/routes, shared components, and docs"* — three days old.

There is nothing new to write up for 2026-04-26.

## Verification

| Check | Result |
|---|---|
| `git log --since="24 hours ago"` | empty |
| `git log --since="48 hours ago"` | empty |
| `git status` | clean |
| Files modified since 2026-04-25 (excluding `node_modules`/`.git`) | none |
| Open stash | `stash@{0}: buy-new-order-wip — pre-main-pull stash 2026-04-22` (not applied; carried since 2026-04-22) |

## Documentation gaps surfaced during the review

While verifying that the 2026-04-23 commit was fully documented, the following gaps were identified. These are **carried forward** rather than blocking — they belong in a follow-up writing pass, not a no-op daily report.

### Control module — new pages with no dev or user doc

The 2026-04-23 commit registered two new routes in `apps/web/src/routes.tsx` but did not add module docs for them.

| Surface | Component | Route | Dev doc | User doc | Screenshot |
|---|---|---|---|---|---|
| Control → Operations | `ControlOperations.tsx` | `/control/operations` | missing | missing | missing |
| Control → Routes | `ControlRoutes.tsx` | `/control/routes` | missing | missing | missing |

Both pages are wired and reachable. Source files include accurate JSDoc that can seed the dev docs:
- `apps/web/src/components/control/ControlOperations.tsx:1-8` — atomic Standard Operation library; feeds the `Add op` picker on `BomRoutingTree`.
- `apps/web/src/components/control/ControlRoutes.tsx:1-8` — named operation-sequence templates; bundles operations from Control → Operations into one-click "Apply route" templates.

Backing services (also undocumented):
- `apps/web/src/services/operationsLibraryService.ts`
- `apps/web/src/services/routesLibraryService.ts`

### Sell portal — new components partially covered

`docs/dev/modules/sell/customer-portal.md` was updated on 2026-04-23 and now references `PortalMarkupViewer`. The other three siblings are not yet mentioned in any doc:
- `apps/web/src/components/sell/PortalContactsPanel.tsx`
- `apps/web/src/components/sell/PortalProfileDrawer.tsx`
- `apps/web/src/components/sell/PortalSubscriptionSection.tsx`
- `apps/web/src/components/sell/portalPreferences.ts`

Backing services with no dev-doc coverage:
- `apps/web/src/services/attachmentService.ts`
- `apps/web/src/services/markupService.ts`
- `apps/web/src/services/portalAccessService.ts`
- `apps/web/src/services/subscriptionService.ts`

### Shared layer — new primitives with no shared doc

`docs/dev/shared/` gained `3d-viewers.md`, `audit-timeline.md`, `pill-nav.md` on 2026-04-23. Two further additions from the same commit are not yet documented:
- `apps/web/src/components/shared/product/PartThumbnail.tsx` — no entry in `docs/dev/shared/`.
- `apps/web/src/contexts/AuthContext.tsx` — no entry; this is a cross-cutting concern (the `docs/dev/architecture/` shelf flagged in `AUDIT-SUMMARY-DEV.md` §1 would be the natural home).

### Carry-overs already flagged on 2026-04-22

`CHANGELOG-2026-04-22.md` §"Not covered by this run" lists four open items (shop-floor leaderboard screenshot, Bridge review-step screenshot, batch traceability screenshot, Plan Production user doc). None were closed in the past three days. They are still open as of today.

## Output

This file. No other documentation was modified — there is no shipped work today to document, and authoring dev/user pages for the carry-over gaps is a scoped writing task that should be picked up in an interactive session rather than autonomously.
