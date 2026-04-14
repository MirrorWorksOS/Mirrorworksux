# MirrorWorks Smart FactoryOS — Guidelines

This directory contains the canonical design and project documentation for MirrorWorks Smart FactoryOS.

## Design Documentation

| Document | Description |
|---|---|
| [DesignSystem.md](./DesignSystem.md) | v2.0 design system — colours, typography, spacing, components, patterns, M3 tokens |
| [VisualLanguage.md](./VisualLanguage.md) | Visual language reference — Crextio benchmark, 20 design patterns with rationale |

## Project Documentation

| Document | Description |
|---|---|
| [FrontendPhase2.md](./FrontendPhase2.md) | Frontend Phase 2 — shared component library, motion system, module migration |
| [BuildProgress.md](./BuildProgress.md) | Component build tracker — all 50 components across 8 modules |
| [NavigationUpdate.md](./NavigationUpdate.md) | Routing and sidebar navigation architecture |
| [BudgetFunctionalityReview.md](./BudgetFunctionalityReview.md) | Budget module audit and implementation plan |
| [Attributions.md](./Attributions.md) | Third-party licence attributions |

## AI Rules (Cursor)

The AI-consumable rules live in `.cursor/rules/`:

- **project.mdc** — always-active project rules (tech stack, naming, coding standards)
- **design-system.mdc** — design system rules applied to all `.tsx` and `.css` files
- **shared-components.mdc** — shared component selection guide and anti-patterns

## Key Principles (v2.0)

- **Single font:** Roboto (300/400/500/700/900). Use `tabular-nums` for financial values and IDs.
- **60-30-10 colour rule:** 60% white/light grey, 30% greyscale structure, 10% MW Yellow accent.
- **M3 foundation:** Shape scale, elevation hierarchy, motion tokens, state layers, split disabled states.
- **Monochromatic palette:** MW Yellow is the only accent colour. Status colours for dots and badges only.

**Last updated:** March 2026
