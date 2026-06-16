# ADR-005 — MirrorView: Autodesk APS Viewer + Convex revision lifecycle

Date: 2026-05-26
Triggering commits: `6c7252b3` (initial APS + Convex bootstrap), Phases 2a–2f (`0c78ee8a`, `3b3b1f01`, `2a1d3106`, `09691193`, `3a669856`, `4f109647`).

## Context

The April Plan Production rebuild shipped two GLB-based viewers (`GlbViewer`, `DrawingViewer`) against a single bundled `diff.glb`. That covered the demo but couldn't go any further:

- Customers upload STEP, DWG, RVT, IFC, IGES, JT, Catia, NX, etc. GLB-only meant a manual export pass to even render a part.
- There was no notion of a model row: nothing persisted, nothing addressable across pages, nothing the shop floor could pin a work order to.
- There was no revision concept — every page showed the same demo asset regardless of who uploaded what.
- The shop floor had no way to know it was about to cut a part against an obsolete revision.

We needed a single shared 3D surface that every consumer (Sell/Buy/Plan/Make/Control product detail, Plan job detail, Make MO detail, shop-floor execution) could mount with a `context` and get back a live, revision-aware viewer.

## Decision

Adopt the **Autodesk Platform Services (APS) Viewer v7** behind one shared component (`MirrorViewer`) and back it with a **Convex-managed model lifecycle** rather than client-side state.

Three Convex tables encode the lifecycle:

- `mirrorviewModels` — one row per uploaded revision. Columns track APS state machine (`uploading` → `translating` → `success` | `failed`), OSS bookkeeping (`bucketKey`, `objectKey`, `uploadKey`), the resulting `urn` the viewer loads, plus `revisionLabel`, `revisionNotes`, `revisionStatus` (`draft` | `released`), `releasedAt`, `releasedBy`. Indexed `by_owner(ownerType, ownerId)` and `by_urn`.
- `mirrorviewMarkups` — anchored 3D comments. Each row carries the camera + isolated dbIds at pin time, an optional `parentMarkupId` for flat-thread replies, and a `status` (`open` | `resolved`) that the resolve mutation only patches on roots.
- `mirrorviewStepViews` — saved viewpoints per model. Engineers capture once, operators jump via a labelled dropdown. Anchored to a model so a new revision starts with a clean slate.

The upload pipeline is three actions:

1. `client.action(api.aps.startUpload, { fileName, sizeBytes, ownerType, ownerId, revisionLabel?, revisionNotes? })` — Convex inserts a row in `uploading`, mints a signed OSS PUT URL, returns `{ modelId, signedUrl, uploadKey, bucketKey, objectKey }`.
2. Browser PUTs the file bytes straight to APS OSS via signed URL (XHR progress reporting).
3. `client.action(api.aps.finishUpload, { modelId, uploadKey, bucketKey, objectKey })` — Convex finalises the OSS upload, kicks off Model Derivative translation, flips the row to `translating`, returns the URN.

Viewer surfaces never poll. They subscribe to `api.mirrorview.getActiveModel({ ownerType, ownerId })` (or `listModels` for sidebars). Convex pushes status transitions and the eventual `urn` straight into React. The viewer mounts APS against the URN as soon as the row reads `success`.

Revision UX is layered on top of that lifecycle in five visible affordances:

- **Tag-on-upload** (`CadUploadConfirmDialog`) — auto-fills `nextRevisionLabel()` and captures a short "what changed" note before the upload kicks off.
- **Release gate** (`revisionStatus`) — uploads land as `draft`; engineering's "Release Rev X" button on `ProductDetail` flips the row to `released` (gated by the new `mirrorview.revision.release` permission held by admin + lead). Only released revisions drive downstream UX.
- **Stale-rev banner** (`RevDriftBanner`) — mounts on operator surfaces (MO detail, shop-floor `ReferencePanel`), compares the pinned revision against the product's latest released revision via the same `getActiveModel` query, and dialog-surfaces the change-note on click.
- **Anchored markup** (`MirrorMarkupPanel` + `CadMarkupCaptureDialog`) — uses the imperative `MirrorViewerHandle` (`captureCamera()`, `captureSelection()`, `restoreCamera()`, `isolate()`) so any new shared surface can attach pin / view-restore behaviour without re-implementing camera plumbing.
- **Step viewpoints** (`StepViewsControl`) — same handle, same model-scoped Convex query. Engineers (admin/lead) capture; operators jump.

A `MirrorViewer` instance is fully described by a `ViewerContext` (`{ ownerType: 'product' | 'job' | 'mo' | 'workOrder' | 'quote', ownerId: string }`) plus an optional `enableUpload` flag. The "no model" state falls back to the bundled `diff.glb` so demo URLs never show a blank canvas — unless `enableUpload` is set, in which case the empty state is a drop affordance.

## Consequences

**Easier:**

- Any new surface that wants 3D drops `<MirrorViewer context={…} />` and gets the full lifecycle for free — uploads, translation progress, revision chip, drift banner, markup, step views — without owning any of that state itself.
- Convex's reactive query model means cross-screen consistency is automatic: an upload finished on Plan shows up on the shop-floor `ReferencePanel` the instant it translates, without polling or socket plumbing.
- The release gate gives engineering a single point of control over what the floor sees; before this, every successful translation was implicitly "in production".
- Revision archaeology is cheap — `mirrorviewModels` is the audit log. No separate revision table to keep in sync.

**Harder / paid for:**

- APS adds a hard external dependency. Translation latency is APS-bound; the `translating` UI state needs to look good and stay informative. The translation manifest poller (`apps/web/convex/aps.ts`) is the only piece that polls — the rest of the system is push.
- A `mirrorviewModels` row exists per revision per owner. Storage costs scale with revision churn; we may need a retention policy later (e.g. keep last N drafts per owner, all released).
- `mirrorviewStepViews` is keyed by `modelId`, so a new revision means re-capturing step views. That's intentional — geometry can move under the camera between revisions — but it's a real ergonomic cost engineers will feel.
- `revisionLabel` is currently a freeform string with a `Rev X` parser. Anything outside the `Rev [A-Z]+` shape gets numeric value 0 in `RevDriftBanner` comparisons. We accept that on the assumption customers won't name revisions `1`, `v2`, or `Final_FINAL`; if they do, the banner will under-report drift on those rows rather than over-report.
- `_generated/` is now committed (see `d5d90a7a`) because the deploy targets (Netlify, CF Pages) need it to resolve `@convex/_generated/api`. Re-running `convex codegen` locally now produces a dirty tree.

## Alternatives

- **Stay on GLB.** Free, fully offline, no APS dependency. Rejected: customers send native CAD; export-to-GLB is friction we can't ship to a fabricator SME.
- **Self-host the translation layer (e.g. CadExchanger, CGAL pipeline).** Rejected for v1: APS coverage is wider, the licensing model is per-translation rather than per-CPU, and we'd rather pay for translation than operate it.
- **Client-side state for revisions (Zustand / React Query).** Rejected: revisions need to be visible across roles, screens, and devices. Server-truth was non-negotiable once the drift banner became part of the design.
- **Per-owner sub-collection for revisions** (`products/:id/revisions` shape). Rejected: flat `mirrorviewModels` keyed by `(ownerType, ownerId)` is simpler to index, easier to query for cross-product totals, and Convex doesn't reward sub-collection hierarchies the way Firestore does.
