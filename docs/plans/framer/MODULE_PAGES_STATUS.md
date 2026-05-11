# Module pages plan — Cursor session status

## Security

Do **not** paste your Framer MCP URL (it contains a **secret**) into chat, tickets, or screenshots. If it was exposed, **rotate/regenerate** the MCP credentials in Framer and update the MCP entry in Cursor.

## Framer canvas (this session)

| Action | Result |
| --- | --- |
| Removed stray test page **`/plan-test-mcp`** | Deleted via MCP `deleteNode`. |
| Created empty web page **`/plan`** | Page id **`J2C4IULVc`** via MCP `createPage` (placeholder while testing duplication). **Duplicate `/sell` in Framer UI** into this route or delete this page if you duplicate from `/sell` instead. |
| Tried MCP **`duplicateNode`** on **`/sell` page** | Failed: *No parent found for node*. |
| Tried MCP **`duplicateNode`** on **root `Desktop`** | Failed: *Cannot set parent of a replica node*. |
| Accidental duplicate **`ShowHide`** layers on **`/sell`** | Removed the extra instances via `deleteNode` so `/sell` is back to a single nav stack. |

Framer MCP must be **open in the same Framer project** that Cursor is linked to. If you see *“plugin not connected”* from the agent, open Framer → **Cmd+K** → **MCP** → connect the plugin, then retry. Do **not** paste the MCP URL (including `secret=`) into chat; store it only in Cursor MCP settings and rotate if exposed.

**`/plan` canvas** (page **`J2C4IULVc`**): main `/sell` subtree was reparented under this page’s `Desktop` in a prior session; **footer/pricing stack may still be missing** — compare to `/sell` and duplicate/move that stack if needed. Next: **`updateXmlForNode`** text and `backgroundImage` from [module-pages-spec.json](module-pages-spec.json) (`path: "/plan"`).

## What stays in-repo

| Deliverable | Purpose |
| --- | --- |
| [module-pages-spec.json](module-pages-spec.json) | Parsed copy + recommended hero image paths per route |
| [MODULE_PAGES_RUNBOOK.md](MODULE_PAGES_RUNBOOK.md) | UI-first duplication, MCP limits, copy/image swap, QA |
| [`scripts/validate-module-pages-spec.mjs`](../../scripts/validate-module-pages-spec.mjs) | Validates spec JSON shape |

## Next step

1. Framer → **Cmd+K** → **MCP** → connect.  
2. In **Pages**, you need **seven** module routes (`/plan` … `/bridge`). Either delete the empty MCP-created **`/plan`** and duplicate **`/sell`** seven times, or paste duplicated `/sell` content into that empty `/plan` and duplicate **`/sell`** six more times for the other slugs. Rename paths to `/plan`, `/make`, `/buy`, `/ship`, `/book`, `/product-studio`, `/bridge`.  
3. With MCP connected, run **getNodeXml** per page and apply **updateXmlForNode** text / `backgroundImage` updates from `module-pages-spec.json`.

If **`iOJYv5VFi`** is not `/sell` anymore, call **getProjectXml** and use the current `nodeId` for `path="/sell"`.
