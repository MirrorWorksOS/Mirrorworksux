# MirrorWorks Documentation

Internal documentation for the MirrorWorks frontend (`apps/web`). Every doc lives under one of five top-level folders. If you can't decide where something goes, that's a sign it doesn't belong yet — write it as a note in the relevant PR first.

```
docs/
├── user/        How to use a feature           (end-user audience)
├── dev/         How a feature is built         (engineer audience)
├── audits/      Snapshots + decisions          (CHANGELOG, ADRs, per-module audits)
├── reference/   Evergreen specs                (architecture docs that rarely change)
└── plans/       In-flight initiatives          (proposals, owner, target date)
```

## User docs

Per-module, per-page. Plain language.

- [Platform](./user/modules/platform/README.md)
- [Sell](./user/modules/sell/README.md)
- [Buy](./user/modules/buy/README.md)
- [Plan](./user/modules/plan/README.md)
- [Make](./user/modules/make/README.md) *(missing — P0)*
- [Ship](./user/modules/ship/README.md)
- [Control](./user/modules/control/README.md)
- [Book](./user/modules/book/README.md)
- Bridge *(missing — P0)*
- Shop Floor *(missing — P0)*

## Developer docs

Per-module, per-page, mirroring user docs. Plus cross-cutting components.

- [Shared components](./dev/shared/) — pill-nav, 3D viewers, audit-timeline, EntityFormDialog, operation category colors
- Modules: [sell](./dev/modules/sell/) · [buy](./dev/modules/buy/) · [plan](./dev/modules/plan/) · [make](./dev/modules/make/) · [ship](./dev/modules/ship/) · [control](./dev/modules/control/) · [book](./dev/modules/book/) · [bridge](./dev/modules/bridge/) · [shop-floor](./dev/modules/shop-floor/) · [platform](./dev/modules/platform/)

## Audits

- [CHANGELOG.md](./audits/CHANGELOG.md) — rolling log of what shipped to `main`
- [adr/](./audits/adr/) — Architecture Decision Records
- [user/](./audits/user/) — per-module user-doc audits
- [dev/](./audits/dev/) — per-module dev-doc audits
- [screenshots/](./audits/screenshots/) — UI snapshots per module
- [_archive/](./audits/_archive/) — superseded snapshots (recoverable history)

## Reference

Evergreen architectural docs. Update in place when reality changes.

- [ai-feature-audit.md](./reference/ai-feature-audit.md) — AI surfaces map (mock vs real)
- [backend-handover.md](./reference/backend-handover.md) — service boundary + `VITE_DATA_SOURCE` switch
- [product-studio-spec.md](./reference/product-studio-spec.md) — Blockly v2 specification
- [sidebar-audit.md](./reference/sidebar-audit.md) — full route inventory
- [SAL 02 — Pricing Tiers and Strategy.xlsx](./reference/) — pricing model source of truth

## Plans

In-flight initiatives. Each must have an owner and a target date or it's a note, not a plan.

- [TIER-BADGE-PLAN.md](./plans/TIER-BADGE-PLAN.md) *(no owner — needs commitment or removal)*
- [framer/](./plans/framer/) — Framer landing-page experimentation

## How to add a doc

| Adding... | Goes in... |
|---|---|
| New user-facing page | `user/modules/<module>/<page>.md` |
| Developer reference for that page | `dev/modules/<module>/<page>.md` |
| Shared component | `dev/shared/<component>.md` |
| Architecture decision | `audits/adr/ADR-NNN-title.md` |
| Daily ship summary | append to `audits/CHANGELOG.md` (don't create dated files) |
| Spec that rarely changes | `reference/<topic>.md` |
| Proposal with an owner | `plans/<initiative>.md` |
