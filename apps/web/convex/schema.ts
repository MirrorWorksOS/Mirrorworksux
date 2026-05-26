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

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_urn', ['urn'])
    .index('by_owner', ['ownerType', 'ownerId']),
});
