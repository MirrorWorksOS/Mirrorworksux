# Screen-by-screen specifications (§4)

Structured extracts from the combined module specification PDF live alongside this folder. **Source of truth in-repo:** [`MirrorWorksModuleSpec.pdf`](../MirrorWorksModuleSpec.pdf) (Section 4 per module).

| File | Module | Notes |
| --- | --- | --- |
| [Sell-04-Screen-by-Screen.md](./Sell-04-Screen-by-Screen.md) | Sell | Dashboard bento, CRM, pipeline |
| [Plan-04-Screen-by-Screen.md](./Plan-04-Screen-by-Screen.md) | Plan | `PlanDashboard`, jobs, schedule |
| [Book-04-Screen-by-Screen.md](./Book-04-Screen-by-Screen.md) | Book | Finance bento, settings |
| [Ship-04-Screen-by-Screen.md](./Ship-04-Screen-by-Screen.md) | Ship | 6 KPI strip, fulfilment |
| [Control-04-Screen-by-Screen.md](./Control-04-Screen-by-Screen.md) | Control | Executive overview |
| [Buy-04-Screen-by-Screen.md](./Buy-04-Screen-by-Screen.md) | Buy | Procurement |
| [Make-04-Screen-by-Screen.md](./Make-04-Screen-by-Screen.md) | Make | Andon, shop floor |

## Prototype mapping

Routes are defined in [`src/routes.tsx`](../../routes.tsx). When §4 references paths that differ from the prototype (e.g. `/plan` vs `/plan/dashboard`), add a **Prototype mapping** subsection in each file.

## Process

Replace the placeholder body in each `*-04-*.md` file with the exported §4 text from Confluence/PDF, normalised to:

```markdown
## Screen name
### Purpose
### Data
### Actions
### States
```

Cross-link to routes and to `DESIGN_SYSTEM.md` where tokens supersede older PDF hex or monospace guidance.
