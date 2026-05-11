# Architecture Decision Records

One file per decision. Naming: `ADR-NNN-short-title.md` (sequential, never reuse a number).

Write an ADR when a choice sets a pattern others will copy: service-layer shape, auth flow, routing structure, new shared component that replaces existing patterns, state strategy, design tokens that affect multiple modules, build config that shapes how code is written.

Don't write ADRs for: one-off fixes, isolated component changes, dependency bumps.

## Format

```markdown
# ADR-NNN — Title

## Context
What's the situation that forces a decision?

## Decision
What did we choose, in one paragraph?

## Consequences
What changes downstream? What does this make easier / harder?

## Alternatives
What else was on the table, and why not?
```
