# Framer module pages — runbook

This runbook supports the module page duplication plan when the Framer MCP plugin is connected, or when applying changes manually in Framer.

## 1. Connect Framer MCP (required for Cursor automation)

1. Open your MirrorWorks project in **Framer** (desktop).
2. Press **Cmd+K** (macOS) and search **MCP**.
3. Open the **MCP** plugin and ensure it shows as connected for this project.

Without this step, Framer MCP calls from Cursor will time out or return “plugin not connected”.

### MCP limitation: duplicating whole web pages

In practice, **Framer MCP `duplicateNode` does not reliably duplicate a publishable web `Page` node** (it can return “No parent found for node”), and the **root `Desktop` breakpoint** can be treated as a **replica** (“Cannot set parent of a replica node”). Duplicating deep children (for example `ShowHide`) works, but clones are created **on the source page**, not on another page, unless you **reparent** nodes with `updateXmlForNode` (large trees hit payload limits).

**Recommendation:** duplicate `/sell` in the **Framer Pages panel** (right-click the page → **Duplicate**), rename each duplicate’s path to the slug below, then use MCP **getNodeXml** + **updateXmlForNode** on each new page to swap copy and `backgroundImage` URLs from [module-pages-spec.json](module-pages-spec.json).

## 2. Template page

- **Path:** `/sell`
- **Known page node id (from prior MCP session):** `iOJYv5VFi`  
  If your project differs, run **getProjectXml** in Framer MCP and read the `path="/sell"` page `nodeId`.

## 3. Create the seven module pages

Duplicate `/sell` seven times, then set each duplicate’s route to:

| Route | Module (from copy doc) |
| --- | --- |
| `/plan` | Scheduling — Plan |
| `/make` | Production — Make |
| `/buy` | Purchasing — Buy |
| `/ship` | Dispatch — Ship |
| `/book` | Accounting — Book |
| `/product-studio` | Configurator — Product Studio |
| `/bridge` | Onboarding — Bridge |

In Framer: **Pages** → select `/sell` → duplicate → rename path. Repeat for each slug.

If Cursor previously created an empty **`/plan`** page while testing MCP (`createPage`), delete it in Framer or paste the duplicated `/sell` content into it so you do not end up with two `/plan` routes.

## 4. Swap copy and images

Authoritative structured copy (hero, six features, outro) and recommended hero image paths live in:

- [module-pages-spec.json](module-pages-spec.json)

Replace text on each duplicated page to match the `modules[]` entry for that `path`. Swap hero / feature imagery using the listed `recommendedHeroImage.absolutePath` files (synced Google Drive → `Website/images/iw stock`).

## 5. QA checklist

- [ ] All seven routes resolve in preview and publish.
- [ ] No leftover **Sell**-specific headings or CTAs on non-Sell pages.
- [ ] Each page has **six** features with correct names and blurbs.
- [ ] Outro block matches spec (headline + two paragraphs where present).
- [ ] Desktop and mobile layouts match the `/sell` template (spacing, stacks, breakpoints).

## 6. Optional: headless MCP

If you use Unframer server API mode, see `npx unframer mcp login --help` for API-based access when the desktop plugin is not practical.
