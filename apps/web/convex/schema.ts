import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * MirrorWorks Convex schema.
 *
 * mirrorviewModels tracks the full lifecycle of a CAD file through the APS
 * Model Derivative pipeline: dropped → uploading to OSS → translating →
 * success (URN ready for the viewer) or failed.
 *
 * One row per uploaded revision. getActiveModel(ownerType, ownerId) picks the
 * most-recent successful or in-flight row so the viewer auto-updates as users
 * re-upload.
 */
export default defineSchema({
  mirrorviewModels: defineTable({
    fileName: v.string(),
    sizeBytes: v.number(),
    ownerType: v.union(
      v.literal('product'),
      v.literal('job'),
      v.literal('mo'),
      v.literal('workOrder'),
      v.literal('quote'),
    ),
    ownerId: v.string(),
    status: v.union(
      v.literal('uploading'),
      v.literal('translating'),
      v.literal('success'),
      v.literal('failed'),
    ),

    // APS object identifier base64-encoded (the URN the viewer loads).
    // Empty until finishUpload completes.
    urn: v.string(),

    // OSS bookkeeping
    bucketKey: v.string(),
    objectKey: v.string(),
    uploadKey: v.optional(v.string()),

    // Translation progress 0-100. Updated by the manifest poller.
    progress: v.number(),
    error: v.optional(v.string()),

    // Revision metadata. `revisionLabel` is short and bumped client-side
    // (Rev A → Rev B → … → Rev AA). `revisionNotes` is the free-text
    // "what changed" line surfaced in the drift banner + history.
    revisionLabel: v.optional(v.string()),
    revisionNotes: v.optional(v.string()),

    // Release gate. New uploads land as 'draft'. Engineering's "Release Rev X"
    // button (Phase 2e) flips to 'released'; only released revisions trigger
    // the stale-rev drift banner on operator surfaces and (Phase 2e-future)
    // gate `isTravellerReadyForRelease()` in the traveller store.
    revisionStatus: v.optional(
      v.union(v.literal('draft'), v.literal('released')),
    ),
    releasedAt: v.optional(v.number()),
    releasedBy: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_urn', ['urn'])
    .index('by_owner', ['ownerType', 'ownerId']),

  /**
   * Anchored 3D markup. Each row is either a root comment (no
   * parentMarkupId) or a reply (parentMarkupId set). Camera + optional
   * dbIds let the viewer restore the exact viewpoint the commenter saw.
   *
   * Root markups carry status ('open' | 'resolved'). Replies inherit
   * their root's status — the resolveMarkup mutation only patches roots.
   */
  mirrorviewMarkups: defineTable({
    modelId: v.id('mirrorviewModels'),
    parentMarkupId: v.optional(v.id('mirrorviewMarkups')),
    body: v.string(),
    author: v.optional(v.string()),
    // Camera state captured at pin time. `null`-able for reply rows.
    camera: v.optional(
      v.object({
        px: v.number(), py: v.number(), pz: v.number(),
        tx: v.number(), ty: v.number(), tz: v.number(),
        ux: v.number(), uy: v.number(), uz: v.number(),
      }),
    ),
    dbIds: v.optional(v.array(v.number())),
    status: v.union(v.literal('open'), v.literal('resolved')),
    resolvedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_model', ['modelId'])
    .index('by_parent', ['parentMarkupId']),
});
