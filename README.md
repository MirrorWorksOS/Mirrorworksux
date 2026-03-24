# MirrorWorks Smart FactoryOS — UX Prototype

An interactive UX prototype for MirrorWorks Smart FactoryOS, an AI-native manufacturing ERP designed for metal fabrication SMEs (10-100 employees). This repository is a **design reference and frontend prototype** — not the production application.

The goal is to refine UX patterns, validate information architecture, and establish a component library before building the full-stack product.

The **home dashboard** is a persona/widget prototype (mock user context, bento widgets, skeleton first paint) with module access secondary. **Module dashboards** share **`KpiStatCard`** for KPI rows and the **`AiCommandBar`** (set `aiScope` on `ModuleDashboard`) for a consistent AI entry point.

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

The dev server starts at `http://localhost:5173`.

## Project Structure

```
src/
├── components/
│   ├── ui/              # ShadCN primitives
│   ├── animate-ui/      # Animated icon components
│   ├── shared/          # Cross-module shared component library (15 domains)
│   ├── sell/            # Sell module screens
│   ├── plan/            # Plan module screens
│   ├── make/            # Make module screens
│   ├── ship/            # Ship module screens
│   ├── book/            # Book module screens
│   ├── buy/             # Buy module screens
│   ├── control/         # Control module screens
│   ├── design/          # Onboarding module
│   ├── shop-floor/      # Immersive dark-UI shop floor
│   └── figma/           # Raw Figma exports (reference only)
├── guidelines/          # Design system docs, visual language, build progress
├── lib/                 # Design tokens (colours, shapes)
├── styles/              # Global CSS, M3 type scale, animation keyframes
└── utils/               # Supabase client (future)
```

## Design System

All design decisions follow the MirrorWorks v2.0 design system based on Material Design 3 principles:

- **60-30-10 colour rule:** 60% white, 30% greyscale, 10% MW Yellow (#FFCF4B)
- **Single font:** Roboto with `tabular-nums` for financial data
- **M3 tokens:** Shape scale, elevation hierarchy, motion easing/duration, state layers
- **Shared component library:** 37 reusable components across 15 domains in `src/components/shared/`

See `src/guidelines/DesignSystem.md` for the full specification.

## Important Notes

- **All data is mock/static.** No backend or API calls — realistic manufacturing data for prototype fidelity.
- **Australian/UK English** in all UI copy (colour, organisation, labour).
- **Not production code.** This prototype informs the design of the full-stack application.
