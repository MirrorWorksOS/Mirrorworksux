# MirrorWorks Smart FactoryOS — Guidelines

This directory contains the canonical design and project documentation for MirrorWorks Smart FactoryOS.

## Design Documentation

| Document | Description |
|---|---|
| [DesignSystem.md](./DesignSystem.md) | Canonical design system — colours, typography, spacing, components, patterns, M3 tokens, dark mode |
| [VisualLanguage.md](./VisualLanguage.md) | Visual language reference — Crextio benchmark, 20 design patterns with rationale |

## Project Documentation

| Document | Description |
|---|---|
| [NavigationUpdate.md](./NavigationUpdate.md) | Routing and sidebar navigation architecture (rolling — has changelog) |
| [Attributions.md](./Attributions.md) | Third-party licence attributions |

## AI Rules (Cursor)

The AI-consumable rules live in `.cursor/rules/`:

- **project.mdc** — always-active project rules (tech stack, naming, coding standards)
- **design-system.mdc** — design system rules applied to all `.tsx` and `.css` files
- **shared-components.mdc** — shared component selection guide and anti-patterns

## Key Principles

- **Single font:** Roboto (300/400/500/700/900). Use `tabular-nums` for financial values and IDs.
- **60-30-10 colour rule:** 60% white/light grey, 30% greyscale structure, 10% MW Yellow accent.
- **M3 foundation:** Shape scale, elevation hierarchy, motion tokens, state layers, split disabled states.
- **Monochromatic palette:** MW Yellow is the only accent colour. Status colours for dots and badges only.

**Last updated:** 2026-05-19
