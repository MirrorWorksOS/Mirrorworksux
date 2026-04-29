# Purchase Control

> **Merged into Buy Settings on 2026-04-29.** `/control/purchase` is now a redirect to `/buy/settings`. The four panels (General / Approvals / Suppliers / Notifications / Reports) live there now.

## Route
`/control/purchase` → redirects to `/buy/settings`

## What replaced it
- **General / Approvals / Suppliers / Notifications / Reports panels** — all five panels are now sections inside [Buy → Settings](../buy/settings.md) (`/buy/settings`).
- **Sidebar entry** — the *Purchase* link in the sidebar now points at `/buy/settings`.
- **Off-spec role labels** — the legacy *Supervisor* / *Manager* / *Director* labels were normalised to the canonical `team` / `lead` / `admin` set as part of the merge.

## Why it changed
Purchase Control was a tenant-scoped settings surface; it logically belongs alongside the rest of the Buy-module configuration rather than under Control's master-data tier.

## Migrating links / bookmarks
Anything that linked to `/control/purchase` will redirect transparently — no action required.

## See also
- [Buy → Settings](../buy/settings.md) — replacement home for all Purchase Control panels.
