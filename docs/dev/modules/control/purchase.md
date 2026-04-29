# Developer stub — control/purchase.md

> **Page deleted on 2026-04-29.** `ControlPurchase.tsx` (304 lines) was removed in commit `b7ba9ae7`. `/control/purchase` is now a `<Navigate to="/buy/settings" replace />` in [`routes.tsx`](apps/web/src/routes.tsx).

## What replaced it
Each of the four panels (General / Approvals / Suppliers / Notifications / Reports) became a section inside [`apps/web/src/components/buy/BuySettings.tsx`](apps/web/src/components/buy/BuySettings.tsx). The Sidebar's *Purchase* link now points at `/buy/settings`.

## Off-spec role labels normalised
The legacy panel had three role pickers using *Supervisor* / *Manager* / *Director*. Per the [access role vocabulary](../../../../.claude/projects/-Users-mattquigley-Documents-GitHub-Mirrorworksux/memory/project_access_role_vocab.md) (only three canonical roles), those labels were rewritten to `team` / `lead` / `admin` during the merge.

## Migration notes for new development
- Do not re-create `ControlPurchase.tsx`. Add new procurement-settings work to `BuySettings`.
- If the merged settings page grows large enough to warrant splitting, do so by panel (e.g. `BuyApprovalsSettings.tsx`) rather than by tenant scope.

## See also
- [`docs/dev/modules/buy/settings.md`](../buy/settings.md) — replacement home for all Purchase Control panels.
