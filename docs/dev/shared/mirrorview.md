# MirrorView (shared)

Added 2026-05-26 (commit `6c7252b3`), extended through Phases 2a–2f (2026-05-26 to 2026-05-26 same-day burst). Companion ADR: [ADR-005](../../audits/adr/ADR-005-mirrorview-3d-pipeline.md).

MirrorView is the shared 3D system used by every product/job/MO/work-order surface in the app. It replaces the old `GlbViewer` + `DrawingViewer` pair (still present, still used by `PlanProductionTab`) with a Convex-backed Autodesk APS pipeline plus revision, markup, and step-view UX layered on the same model row.

## File map

| Path | Export | Role |
|---|---|---|
| `apps/web/src/components/shared/3d/MirrorViewer.tsx` | `<MirrorViewer>`, `MirrorViewerHandle`, `MirrorViewerCamera`, `MirrorViewerSource`, `MirrorViewerProps` | The shared viewer. Subscribes to `api.mirrorview.getActiveModel` reactively and mounts APS Viewer v7 against the URN. Falls back to bundled `diff.glb` when no model exists (unless `enableUpload` is set). |
| `apps/web/src/components/shared/3d/aps-loader.ts` | `ensureApsInitialised`, `ApsViewerInstance` | Lazy-loads the APS Viewer script + CSS once, returns a handle the viewer mounts. Fits camera to the loaded model bbox after geometry loads. |
| `apps/web/src/components/shared/3d/MirrorViewToolbar.tsx` | `<MirrorViewToolbar>` | Per-surface controls (legacy GLB controls hidden when APS is active). |
| `apps/web/src/components/shared/3d/CadUploadConfirmDialog.tsx` | `<CadUploadConfirmDialog>`, `CadUploadConfirmValue` | Post-drop modal — captures `revisionLabel` (default from `nextRevisionLabel()`) and optional `revisionNotes`. |
| `apps/web/src/components/shared/3d/RevDriftBanner.tsx` | `<RevDriftBanner>` | Operator-facing nudge when a pinned revision is older than the latest *released* revision. Click → dialog with the change-note. |
| `apps/web/src/components/shared/3d/MirrorMarkupPanel.tsx` | `<MirrorMarkupPanel>` | Side-rail of anchored comments + replies. |
| `apps/web/src/components/shared/3d/CadMarkupCaptureDialog.tsx` | `<CadMarkupCaptureDialog>` | Captures camera + dbIds at pin time and persists a root markup. |
| `apps/web/src/components/shared/3d/StepViewsControl.tsx` | `<StepViewsControl>` | Labelled viewpoint dropdown + "Save current view" for engineers. |
| `apps/web/src/services/mirrorViewer.ts` | `mirrorViewerService`, `ViewerContext`, `MirrorViewerService` | Owner-context type + (mockable) service abstraction the viewer uses. |
| `apps/web/src/services/mirrorViewerUpload.ts` | `uploadCadFile`, `nextRevisionLabel`, `UploadProgress`, `UploadOptions`, `UploadResult` | Three-step browser-side upload pipeline: `startUpload` → `PUT` to OSS → `finishUpload`. |
| `apps/web/convex/mirrorview.ts` | `insertModel`, `updateModel`, `getActiveModel`, `listModels`, `deleteModel`, `releaseModel`, `listMarkups`, `createMarkup`, `replyMarkup`, `resolveMarkup`, `reopenMarkup`, `deleteMarkup`, `listStepViews`, `saveStepView`, `deleteStepView` | Convex queries + mutations for models, markups, step views. |
| `apps/web/convex/aps.ts` | `startUpload`, `finishUpload`, manifest poller | APS OSS + Model Derivative actions. |
| `apps/web/convex/schema.ts` | `mirrorviewModels`, `mirrorviewMarkups`, `mirrorviewStepViews` | Tables. See "Schema" below. |

## Schema

### `mirrorviewModels`

One row per uploaded revision. Indexed `by_owner(ownerType, ownerId)` and `by_urn`.

```ts
{
  fileName: string,
  sizeBytes: number,
  ownerType: 'product' | 'job' | 'mo' | 'workOrder' | 'quote',
  ownerId: string,
  status: 'uploading' | 'translating' | 'success' | 'failed',
  urn: string,            // base64 APS object identifier; empty until finishUpload
  bucketKey: string,
  objectKey: string,
  uploadKey?: string,
  progress: number,       // 0–100, updated by the manifest poller
  error?: string,
  revisionLabel?: string,   // "Rev A", "Rev B", … bumped client-side
  revisionNotes?: string,   // optional 1-line "what changed"
  revisionStatus?: 'draft' | 'released',  // gate for RevDriftBanner
  releasedAt?: number,
  releasedBy?: string,    // user id of the engineer who released
  createdAt: number,
  updatedAt: number,
}
```

`getActiveModel(ownerType, ownerId)` returns the most-recent row for the owner (any status). `listModels` returns all rows newest-first; consumers like `ProductDetail`'s Uploaded list filter for `success` themselves.

### `mirrorviewMarkups`

Anchored 3D comments. Indexed `by_model(modelId)` and `by_parent(parentMarkupId)`.

```ts
{
  modelId: Id<'mirrorviewModels'>,
  parentMarkupId?: Id<'mirrorviewMarkups'>,  // set → reply
  body: string,
  author?: string,
  camera?: { px,py,pz, tx,ty,tz, ux,uy,uz },  // null on replies
  dbIds?: number[],                            // isolation at pin time
  status: 'open' | 'resolved',
  resolvedAt?: number,
  resolvedBy?: string,
  createdAt: number,
  updatedAt: number,
}
```

Roots carry `status`. Replies inherit their root's status — `resolveMarkup` only patches roots.

### `mirrorviewStepViews`

Saved viewpoints, anchored to a single model so a new revision starts fresh. Indexed `by_model(modelId)`.

```ts
{
  modelId: Id<'mirrorviewModels'>,
  label: string,
  camera: { px,py,pz, tx,ty,tz, ux,uy,uz },
  dbIds?: number[],
  capturedBy?: string,
  createdAt: number,
  updatedAt: number,
}
```

## MirrorViewer

```ts
interface MirrorViewerSource { urn?: string; glbSrc?: string }
interface MirrorViewerProps {
  source?: MirrorViewerSource;       // explicit override (escape hatch)
  context: ViewerContext;            // { ownerType, ownerId }
  density?: 'full' | 'compact';
  className?: string;
  service?: MirrorViewerService;
  hideToolbar?: boolean;
  enableUpload?: boolean;            // drag-and-drop uploads on the surface
}
interface MirrorViewerHandle {
  captureCamera(): MirrorViewerCamera | null;
  restoreCamera(snapshot: MirrorViewerCamera): void;
  captureSelection(): number[];
  isolate(dbIds: number[]): void;
}
```

Internal `Mode` state machine: `loading` → `uploading` → `translating` → `aps` | `glb` | `empty` | `failed`. `aps` is the steady state once a row reaches `success`; `glb` is the demo fallback; `empty` is the drop affordance when `enableUpload` is set.

The viewer subscribes to `api.mirrorview.getActiveModel(context)` only when `VITE_DATA_SOURCE === 'remote'` (the `REMOTE_MODE` guard). In mock mode the query is `'skip'`-ed and the GLB fallback drives the demo.

`enableUpload` opens `CadUploadConfirmDialog` on a drop, calls `uploadCadFile` from `mirrorViewerUpload.ts`, and lets the reactive `getActiveModel` query do the rest.

## Imperative handle pattern

Surfaces that want to attach extra UI on top of the viewer (markup pins, step views) use `useRef<MirrorViewerHandle>` and pass it to `MirrorMarkupPanel` / `StepViewsControl`. The handle is the contract: `captureCamera`, `captureSelection`, `restoreCamera`, `isolate`. New surfaces that need different UI should add methods here rather than reach into APS directly — keeps the GLB / APS fallback paths honest.

## Upload pipeline

`uploadCadFile(file, context, onProgress?, options?)` in `mirrorViewerUpload.ts`:

1. `client.action(api.aps.startUpload, …)` returns `{ modelId, signedUrl, uploadKey, bucketKey, objectKey }`. Convex inserts a `mirrorviewModels` row in `uploading` and `revisionStatus: 'draft'`.
2. Browser XHR `PUT`s the file bytes to `signedUrl`; progress fires via `xhr.upload.onprogress`.
3. `client.action(api.aps.finishUpload, …)` returns `{ urn }`. Convex flips the row to `translating` and kicks off Model Derivative; the manifest poller patches `status` / `progress` as APS reports back.

`nextRevisionLabel(existing)` parses trailing letters from existing `Rev X` labels (case-insensitive), returns `Rev <next>` where next is the letter after the highest seen. Empty → `Rev A`. `Rev Z` → `Rev AA`. Engineer can always override in the confirm dialog.

`UploadOptions = { revisionLabel?, revisionNotes? }` is passed through to `startUpload` and stamped on the row before translation starts.

## Revision release gate

Uploads land as `revisionStatus: 'draft'`. The "Release Rev X" button on `ProductDetail` calls `api.mirrorview.releaseModel`, which patches `revisionStatus: 'released'`, `releasedAt`, `releasedBy`. The action is gated client-side by the `mirrorview.revision.release` permission (admin + lead; see `AuthContext`).

`RevDriftBanner` treats only released rows as drift triggers. Pre-Phase-2e rows without `revisionStatus` fall through to `status === 'success'` so back-compat demo data still triggers detection.

## Consumers

| File | Mounts | Notes |
|---|---|---|
| `apps/web/src/components/shared/product/ProductDetail.tsx` | `<MirrorViewer enableUpload>`, Uploaded list via `listModels`, Release Rev X button | The cross-module product surface used by Sell / Plan / Make / Buy / Control product-detail pages. |
| `apps/web/src/components/plan/PlanMirrorViewTab.tsx` | `<MirrorViewer enableUpload>` + `<StepViewsControl canCapture>` | Plan job MirrorView tab. Engineers capture step views here. |
| `apps/web/src/components/plan/PlanCADImport.tsx` | `<MirrorViewer enableUpload>` + `<CadUploadConfirmDialog>` | Drop-and-tag entry point under `/plan/machine-io?tab=cad-import`. |
| `apps/web/src/components/make/MakeManufacturingOrderDetail.tsx` | `<MirrorViewer enableUpload>` + `<RevDriftBanner>` + `<MirrorMarkupPanel>` | MO detail surface. Operators see drift banner; admin/lead can pin markup. |
| `apps/web/src/components/floor/execution/ReferencePanel.tsx` | `<MirrorViewer>` (read-only) + `<RevDriftBanner>` + `<StepViewsControl canCapture={false}>` | Shop-floor execution. Read-only; operators consume step views, engineers don't capture here. |

## Known gaps

- `revisionLabel` is freeform; `RevDriftBanner` comparison only understands `Rev [A-Z]+`. Anything else compares as 0 and silently under-reports drift.
- Step views are bound to `modelId`, so re-uploading a revision means re-capturing the labels. Intentional but ergonomically painful — a "copy step views from previous rev" affordance would help.
- The manifest poller in `apps/web/convex/aps.ts` is the only piece that polls externally. Translation latency is APS-bound.
- `_generated/` is now tracked (commit `d5d90a7a`). Re-running `convex codegen` locally produces a dirty tree; the team needs to either gitignore-on-build or accept it.
- `RevDriftBanner` queries against `ownerType: 'product'` — it expects MO/WO surfaces to know their product id. `productIdForMo` (in `ReferencePanel`) maps MO numbers → product ids from the mock fixture; in production this needs to come from the MO record.
