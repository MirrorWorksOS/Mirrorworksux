# ADR-001 — Schema-driven ModuleFilterBar

## Context

Every module's list pages (Sell Quotes / Orders / Invoices / CRM, Buy Orders / Bills, Make Work Orders, Plan Jobs, Ship Orders / Tracking, Book Invoices) had its own filter strip. Implementations diverged on chip styling, URL state shape, "Add filter" affordances, preset/saved-view handling, and date-range pickers. Onboarding a new module meant rebuilding the same primitives, and product-level changes (e.g. ownership filters, saved views) had to be re-applied module by module.

## Decision

Introduce `ModuleFilterBar` (`apps/web/src/components/shared/filters/`) as the single filter primitive. Each list page declares a **schema** (`schema.ts`): which facets exist, what type each is (enum / date / multi-select / text), and which presets ship out of the box. The bar handles:

- chip rendering (`FacetChip`, `DateChip`)
- the "Add filter" dropdown (`AddFilterMenu`)
- preset + saved-view persistence (`PresetMenu`, `savedViews.ts`)
- URL state sync (`urlState.ts`, `useFilterState.ts`)
- pure `applyFilters(rows, state)` so the calling page just renders the filtered slice

Sell was the pilot. Once stable, Book / Buy / Make / Plan / Ship list pages were ported in a single sweep.

## Consequences

- New modules describe their filters in a schema instead of writing a bar from scratch.
- Cross-cutting features (ownership presets, saved views, URL deep-links) land in one place.
- Chip visual language is consistent across the app, which is what users perceive as "filtering" working the same everywhere.
- Page code shrinks substantially — most list pages dropped local filter state and the bar component.
- Cost: every list-page port is a coordinated change; a schema bug propagates to every consumer.

## Alternatives

- **Per-module bars, shared chip components only.** Rejected — chip styling was never the divergence point; URL/preset/saved-view logic was, and keeping it per-module preserved the original mess.
- **Headless filter hook only.** Rejected — would still leave each page reimplementing the visual bar, which is the most visible inconsistency.
