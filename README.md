# MirrorWorks Smart FactoryOS — UX Prototype

An interactive UX prototype for MirrorWorks Smart FactoryOS, an AI-native manufacturing ERP designed for metal fabrication SMEs (10-100 employees). This repository is a **design reference and frontend prototype** — not the production application.

The goal is to refine UX patterns, validate information architecture, and establish a component library before building the full-stack product.

The **home dashboard** is a persona/widget prototype (mock user context, bento widgets, skeleton first paint) with module access secondary. **Module dashboards** share **`KpiStatCard`** (`iconSurface` + **`IconWell`**) for KPI rows and the **`AiCommandBar`** (set `aiScope` on `ModuleDashboard`) for a consistent AI entry point. Visual hierarchy follows **~60/30/10** canvas/chrome/yellow-thread guidance (see `apps/web/src/guidelines/DesignSystem.md` — **Implementation checklist** for tokens, `PageShell`/`PageHeader`, `MwDataTable`, and charts).

**Figma source:** [MirrorWorks UX on Figma](https://www.figma.com/design/GHlDNdtoNbRuObqFEPr2eV/MirrorWorks-UX)

## Modules

The app covers 8 modules following the manufacturing lifecycle:

| Module | Purpose |
|---|---|
| **Sell** | CRM, opportunities, quotes, customers |
| **Plan** | Scheduling, budgets, resource planning |
| **Make** | Shop floor, work orders, quality, production |
| **Ship** | Dispatch, packaging, tracking, logistics |
| **Book** | Invoicing, expenses, financial reporting |
| **Buy** | Purchase orders, suppliers, receipts |
| **Control** | Settings, users, permissions, integrations |
| **Design** | Onboarding and factory configuration |

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build:** Vite 6
- **Styling:** Tailwind CSS v4 + ShadCN/Radix UI
- **Animation:** Motion (Framer Motion) + Animate UI icons
- **Charts:** Recharts
- **Routing:** React Router
- **Fonts:** Roboto (300/400/500/700/900)

## Getting Started

```bash
npm install
npm run dev
```

Run these commands from the repository root. The root scripts proxy to the Vite app in `apps/web`.

The dev server starts at `http://localhost:3001`.

## Project Structure

```text
apps/
└── web/
    ├── src/
    │   ├── components/   # UI primitives, shared library, and module screens
    │   ├── guidelines/   # Design system docs, specs, audits
    │   ├── lib/          # Tokens, routing, auth, and domain helpers
    │   ├── services/     # Mock/remote service adapters
    │   ├── store/        # Zustand stores
    │   ├── styles/       # Global CSS, typography, motion
    │   ├── test/         # Vitest smoke coverage
    │   └── utils/        # Shared utilities
    ├── package.json
    └── vite.config.ts
packages/
├── config/              # Shared ESLint/TS config
└── contracts/           # Shared frontend/backend contracts
scripts/
└── audit-charts.mjs     # Recharts token guardrail
```

## Design System

All design decisions follow the MirrorWorks v2.0 design system based on Material Design 3 principles:

- **60-30-10 colour rule:** 60% white, 30% greyscale, 10% MW Yellow (#FFCF4B)
- **Single font:** Roboto with `tabular-nums` for financial data
- **M3 tokens:** Shape scale, elevation hierarchy, motion easing/duration, state layers
- **Shared component library:** 37 reusable components across 15 domains in `apps/web/src/components/shared/`

See `apps/web/src/guidelines/DesignSystem.md` for the full specification.

## Important Notes

- **All data is mock/static.** No backend or API calls — realistic manufacturing data for prototype fidelity.
- **Australian/UK English** in all UI copy (colour, organisation, labour).
- **Not production code.** This prototype informs the design of the full-stack application.
