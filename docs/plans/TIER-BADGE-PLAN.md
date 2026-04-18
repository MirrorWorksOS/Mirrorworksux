# Tier Badge Rollout Plan

- **Status:** draft — awaiting decisions on open questions below
- **Owner:** unassigned (see §3)
- **Last updated:** 2026-04-18
- **Scope:** all user-facing articles under `docs/user/modules/**/*.md`

---

## 1. Problem statement

The 9-module documentation audit (merged on `main` under `docs/audits/`) found that **zero of ~107 user articles carry a tier badge**. Every article is silent on which MirrorWorks tier (Pilot, Produce, Expand, or Excel) unlocks the feature it describes. Section-level badges — for sub-features whose tier differs from the article baseline — are also entirely absent.

From `docs/audits/AUDIT-SUMMARY-USER.md`:

> **0 of 68 audited articles currently carry a tier badge.** First-move cross-module inconsistency risks exist for AI features / MRP / Reports.

The audit counted 68 because some stubs and README files were excluded; the full count across `docs/user/modules/**/*.md` on `main` is 107. Either number is the problem — the rollout below is sized against the larger number.

Tier gating is a commercial promise, not a cosmetic concern. Without badges:

- Sales and onboarding can't honestly answer "does my tier include X?" from the docs.
- Support agents fall back on code or tribal knowledge to decide whether a feature is reachable for a given tenant.
- Cross-module drift is inevitable — the same feature can (and, based on the audit, likely does) carry different implicit tier assumptions in different articles.

---

## 2. Source of truth

The feature → tier mapping is **not currently defined in this repo**. The following files were checked:

| File | What it contains | What it's missing |
|------|------------------|-------------------|
| [`packages/contracts/src/access.ts`](../../packages/contracts/src/access.ts) | Tier name enum (Pilot / Produce / Expand / Excel), role vocabulary (admin / lead / team), permission key types | No mapping from feature/route/permission → tier |
| [`apps/web/src/guidelines/access/AccessRightsAndPermissions.md`](../../apps/web/src/guidelines/access/AccessRightsAndPermissions.md) | ARCH 00 v7 access model: tiers × roles × groups. Describes the machinery, not the assignments | No feature-level tier table |
| [`apps/web/src/routes.tsx`](../../apps/web/src/routes.tsx) | Route table | No tier metadata per route |
| [`apps/web/src/guidelines/MirrorWorksModuleSpec.pdf`](../../apps/web/src/guidelines/MirrorWorksModuleSpec.pdf) | Module specification PDF (noted by Sell audit as present but link from `AccessRightsAndPermissions.md` is broken) | Not parseable by automation without a PDF → markdown pass |

### Recommendation

Create **`packages/contracts/src/tiers.ts`** with a single exported record keyed by **route path**, not permission key:

```ts
// packages/contracts/src/tiers.ts
import type { Tier } from './access';

export const featureTiers = {
  '/sell/quotes': 'Pilot',
  '/sell/advanced-quoting-rules': 'Expand',
  '/plan/mrp': 'Produce',
  // ...
} as const satisfies Record<string, Tier>;
```

### Why route, not permission key

- Routes are the unit that audit articles already document (`/sell/quotes`, `/plan/mrp`).
- Permission keys (`quotes.scope`, `po.approve`) are finer-grained than user-visible features and cut across multiple routes. A user article describes a screen, not a permission.
- Routes are already maintained in `routes.tsx`; a lint step can cross-check that every `featureTiers` key resolves to a real route and vice versa.

### Section-level exceptions

For sub-features whose tier differs from the article baseline, extend the record with a nested form:

```ts
'/plan/mrp': {
  baseline: 'Produce',
  sections: {
    'ai-suggestions': 'Expand',
  },
},
```

Article writers then render section badges by looking up the section slug.

---

## 3. Decision framework

These questions must be answered before any badge can be applied:

1. **Who owns tier decisions?** Product, founders, or a per-module tech lead? This plan assumes a single owner picks the baseline and the section exceptions; per-module owners review.
2. **Gating granularity.** Baseline is per-route (per-article). Section exceptions are per-heading within an article. **Is that right, or should we go finer (per-action, e.g. "the Duplicate button is Expand-only")?**
3. **Multi-capability articles.** What happens when one article covers a mix of Pilot and Expand features? **Split into two articles, or keep one with heavy section gating?** This plan defaults to keeping one article with section gating, on the basis that SMEs navigate by screen, not by feature.
4. **AI features.** AI-assisted capabilities (MRP suggestions, quote scoring) may deserve a cross-cutting tier rule rather than per-feature badges. **Treat AI as always Expand+? Or assign per-feature?**
5. **Tier-gated settings.** Settings pages that expose tier-restricted features — do they badge the page baseline at the lowest tier that can see the page at all, and use section badges for the gated settings? This plan assumes yes.
6. **Deprecated / preview features.** Some routes are Phase 2/3. **Do they badge by planned-launch tier, or are they omitted until GA?** This plan defaults to omitting.

Answering these before starting a module prevents rework across every article in that module.

---

## 4. Feature inventory template

Working table. One row per article under `docs/user/modules/**/*.md`. The **Proposed tier** and **Owner** columns are blank — that's what the decision owner fills in.

| Module | Article path | Route | Permission key(s) | Proposed tier | Section-level exceptions | Owner | Status |
|--------|--------------|-------|-------------------|---------------|--------------------------|-------|--------|
| Sell | `docs/user/modules/sell/quotes.md` | `/sell/quotes` | `quotes.scope` |  |  |  | pending |
| Plan | `docs/user/modules/plan/mrp.md` | `/plan/mrp` | `mrp.run` |  | `ai-suggestions` |  | pending |
| Make | `docs/user/modules/make/manufacturing-orders.md` | `/make/manufacturing-orders` | `mo.scope` |  |  |  | pending |
| Ship | `docs/user/modules/ship/orders.md` | `/ship/orders` | `shipments.scope` |  |  |  | pending |
| Book | `docs/user/modules/book/invoices.md` | `/book/invoices` | (shared with Sell) |  |  |  | pending |
| Buy | `docs/user/modules/buy/mrp-suggestions.md` | `/buy/mrp-suggestions` | `mrp.suggest` |  | cross-refs `/plan/mrp` |  | pending |
| Control | `docs/user/modules/control/groups.md` | `/control/groups` | `groups.manage` |  |  |  | pending |
| Bridge | (no user/ docs yet — dev-only) | `/bridge/import-wizard` | `bridge.import` |  |  |  | pending |
| Shop-Floor | `docs/user/modules/shop-floor/floor-run.md` | `/floor/run` | `floor.execute` |  |  |  | pending |

One illustrative row per module. Full table should be generated by script from `find docs/user/modules -name '*.md'` once the owner is assigned.

---

## 5. Badge placement convention

Lifted verbatim from the original audit criteria (see `docs/audits/AUDIT-SUMMARY-USER.md` §Tier gating):

- **Article-level badge** sits below the article title, above the overview paragraph.
- **Section-level badge** sits immediately after the section heading, before the first paragraph of the section.
- The **same feature must carry the same badge everywhere it is referenced**. Cross-article drift is a lint failure.
- Every article that describes a tier-restricted feature must carry a badge. An article without a badge is implicitly Pilot — which is usually wrong.

### Markup

The exact markup (image asset, component, or text admonition) is **out of scope** of this plan — it's a design-system decision.

This plan takes a position only on placement and wording. Proposed text form, pending design:

```markdown
# Article title

> **Tier:** Produce

Overview paragraph starts here.

## A section that needs its own badge

> **Tier:** Expand

Section body.
```

The text form is safe to roll out immediately; a later PR can upgrade it to a styled component once design is ready.

---

## 6. Rollout sequence

**Order of attack** — most mature modules first so we iron out format drift on well-documented modules before applying it to thinner ones:

| Order | Module | Article count (on main) | Cross-module risks | Effort estimate |
|-------|--------|--------------------------|--------------------|-----------------|
| 1 | Sell | 19 | Invoice overlap with Book | ~3 h |
| 2 | Control | 20 | Permission keys referenced by every other module — badging here establishes the baseline | ~4 h |
| 3 | Plan | 20 | MRP cross-links to Buy | ~3 h |
| 4 | Make | 13 (in `docs/dev/modules/make`; user/ tree not yet seeded) | Depends on user-doc seeding | ~2 h + seeding |
| 5 | Ship | 12 | BOL, carrier-rates overlap with Buy (inbound) | ~2 h |
| 6 | Book | 14 | Invoice/PO duplication with Sell/Buy — must match badges | ~2 h |
| 7 | Buy | 20 | MRP Suggestions must match `/plan/mrp` baseline | ~3 h |
| 8 | Shop-Floor | 2 | None (leaf module) | ~30 min |
| 9 | Bridge | 0 user articles today | Depends on user-doc authoring | ~30 min once user docs exist |

Total effort: ~20 h of mapping, assuming the decision framework is settled before work starts.

**Cross-module consistency callouts** — the same feature referenced by multiple modules must carry the same badge in every reference:

- **Invoices** — appear in Sell and Book. Both must badge the feature at the same tier.
- **Purchase orders** — appear in Buy and Book. Same rule.
- **MRP Suggestions** — appear in Plan (`/plan/mrp`) and Buy (`/buy/mrp-suggestions`). Same baseline required.
- **Shop-Floor scan-to-ship** — referenced from Ship and Shop-Floor. Same tier.

A lint rule (§7) catches drift after the fact; reviewer discipline catches it at the PR.

---

## 7. Follow-up work

### Lint rule

Add a CI check that fails if any `docs/user/modules/**/*.md` file lacks a tier badge in the first 20 lines.

Implementation options:
- **`remark-lint` custom rule** — best option if the repo already uses remark. A small plugin greps for `> **Tier:** (Pilot|Produce|Expand|Excel)` within the file head.
- **Custom Node script in `scripts/`** — 20 lines, zero deps. Fine if remark isn't set up.
- **`repo-lint` or `markdown-lint-cli2`** — overkill for one rule.

Proposed regex: `/^>\s*\*\*Tier:\*\*\s*(Pilot|Produce|Expand|Excel)\b/m`.

**When to add the rule:** after the first two modules (Sell + Control) are badged, so CI doesn't red-block unrelated PRs.

### Matching code-side check

Add a matching unit test in `packages/contracts` that asserts every key in `featureTiers` resolves to a real route in `routes.tsx`, and every route shown in the user docs has an entry in `featureTiers`. This stops the mapping drifting from reality.

### Design-system handover

Once the text form is ruled out (or kept), the design team picks:
- Badge asset per tier (SVG or component).
- Placement within the doc renderer (whatever system ends up rendering `docs/user/`).
- Accessibility: badges must have a text label, not colour-only.

This plan does not block on design — the text form is accessible and ships immediately.

---

## 8. Open questions

Answers needed before rollout can start. Ordered by impact on scope.

1. **Who owns the final tier mapping — Matt, Sharjeel, or a product owner?** The decisions in §3 are cheap to make but must be made by one person.
2. **Where does MRP Suggestions sit — Produce or Expand?** Referenced from two modules; the decision bounds the badge for both.
3. **Does AgentWorks / the AI agent panel have a uniform tier, or per-feature?** Appears on the dashboard of every module.
4. **Does Bridge gate by data source (Acumatica ⇒ Expand?) or by feature (scheduled imports ⇒ Produce)?** Affects the per-source rows in the Bridge import wizard docs.
5. **Shop-Floor — always-on at Produce+, or per-capability gating (e.g. scan-to-ship at Produce, andon dashboards at Expand)?**
6. **Reports module** — reporting features are scattered across modules. **Badge each report individually, or badge the "Reports" container at the module's minimum tier?**
7. **Section-level granularity — per-heading only, or also per-action?** E.g. on a Pilot article, is the "Duplicate" button a section-level Expand badge, or do we avoid per-button gating entirely?
8. **Multi-capability articles — split or section-gate?** (Answered default in §3; confirm the default is correct.)
9. **Deprecated features (e.g. `ControlRoleDesigner` — now removed)** — do they get a historical tier badge, or are they delisted? This plan defaults to delisting.
10. **Does the same `featureTiers` record need to gate the runtime UI?** If yes, this plan is load-bearing for product logic, not just docs — pulls in frontend work.

---

## Appendix — references

- `docs/audits/AUDIT-SUMMARY-DEV.md` — cross-module developer audit summary.
- `docs/audits/AUDIT-SUMMARY-USER.md` — cross-module user audit summary (contains the tier-gating finding cited in §1).
- `docs/audits/user/AUDIT-{module}.md` — per-module user audit findings.
- `packages/contracts/src/access.ts` — tier and role type definitions.
- `apps/web/src/guidelines/access/AccessRightsAndPermissions.md` — ARCH 00 v7 permission spec.
- `apps/web/src/routes.tsx` — the route table that should match `featureTiers`.
