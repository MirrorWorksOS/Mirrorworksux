# Changelog — 2026-04-27

Daily documentation review. Run by the `documentation` scheduled task.

## Summary

**No code changes shipped in the past 24 hours.** The most recent commit on `main` is still `3c4dc957` (2026-04-23 12:15 +1000) — *"feat: sell portal enhancements, control ops/routes, shared components, and docs"* — four days old. Yesterday's daily run (`CHANGELOG-2026-04-26.md`) was a no-op for the same reason.

There is nothing new to write up for 2026-04-27.

## Verification

| Check | Result |
|---|---|
| `git log -1` | `3c4dc957` (2026-04-23) — unchanged from yesterday |
| Files modified in past 24h (excluding `node_modules`/`.git`) | `docs/audits/CHANGELOG-2026-04-26.md` only — yesterday's run output |
| Files modified in past 48h | same |
| Working tree | clean |
| Stash | `stash@{0}: buy-new-order-wip — pre-main-pull stash 2026-04-22` (unchanged, carried 5 days) |

## Carry-over documentation gaps

All gaps catalogued in `CHANGELOG-2026-04-26.md` remain open. Spot-checked today:

- `docs/dev/modules/control/` — no `operations.md` or `routes.md` (the two routes registered in `apps/web/src/routes.tsx` from the 2026-04-23 commit are still undocumented).
- `docs/dev/modules/sell/customer-portal.md` — `PortalContactsPanel`, `PortalProfileDrawer`, `PortalSubscriptionSection`, `portalPreferences` still unmentioned.
- `docs/dev/shared/` — still missing `PartThumbnail` and `AuthContext` entries.
- Carry-overs from `CHANGELOG-2026-04-22.md` §"Not covered by this run" — still open.

These are deferred to an interactive writing session, not authored autonomously, per the same reasoning given on 2026-04-26.

## Output

This file. No other documentation was modified.
