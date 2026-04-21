# AGENTS.md

## Cursor Cloud specific instructions

### Overview

MirrorWorks Smart FactoryOS is a React 18 + TypeScript + Vite 6 frontend prototype for a manufacturing ERP. It is an npm workspaces monorepo with one app (`apps/web`) and two shared packages (`packages/contracts`, `packages/config`). All data is mock — no backend services are required.

### Key commands (run from repo root)

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (port 3001) |
| Lint | `npm run lint` (ESLint, zero warnings) |
| Typecheck | `npm run typecheck` (`tsc --noEmit`) |
| Tests | `npm run test` (Vitest, 4 smoke test files) |
| Build | `npm run build` |

### Caveats

- The dev server binds to port **3001** (configured in `apps/web/vite.config.ts`).
- Mock auth is active by default (`VITE_DATA_SOURCE` defaults to `mock`). No login credentials are needed — the app loads directly to the dashboard.
- Remote service adapters (Convex, WorkOS) are stubs that throw errors. Do **not** set `VITE_DATA_SOURCE=remote` unless those services are actually configured.
- Path alias `@` maps to `apps/web/src`. The `@mirrorworks/contracts` alias is resolved by both Vite and TypeScript config.
- Tailwind CSS v4 is used via the `@tailwindcss/vite` plugin — there is no `tailwind.config.js`.
