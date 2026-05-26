import { internalMutation, mutation, query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Model lifecycle queries + mutations. The viewer subscribes to
 * `getActiveModel` reactively — Convex pushes status transitions
 * (uploading → translating → success) straight into the UI.
 */

const ownerType = v.union(
  v.literal('product'),
  v.literal('job'),
  v.literal('mo'),
  v.literal('workOrder'),
  v.literal('quote'),
);

export const insertModel = internalMutation({
  args: {
    fileName: v.string(),
    sizeBytes: v.number(),
    ownerType,
    ownerId: v.string(),
    bucketKey: v.string(),
    objectKey: v.string(),
    uploadKey: v.string(),
    revisionLabel: v.optional(v.string()),
    revisionNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return ctx.db.insert('mirrorviewModels', {
      ...args,
      urn: '',
      status: 'uploading',
      progress: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateModel = internalMutation({
  args: {
    id: v.id('mirrorviewModels'),
    urn: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal('uploading'),
        v.literal('translating'),
        v.literal('success'),
        v.literal('failed'),
      ),
    ),
    progress: v.optional(v.number()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...patch } = args;
    await ctx.db.patch(id, { ...patch, updatedAt: Date.now() });
  },
});

export const getActiveModel = query({
  args: { ownerType, ownerId: v.string() },
  handler: async (ctx, { ownerType, ownerId }) => {
    const rows = await ctx.db
      .query('mirrorviewModels')
      .withIndex('by_owner', (q) =>
        q.eq('ownerType', ownerType).eq('ownerId', ownerId),
      )
      .collect();
    if (rows.length === 0) return null;
    rows.sort((a, b) => b.createdAt - a.createdAt);
    return rows[0];
  },
});

/**
 * Full list of models for an owner, newest first. Used by the file-list
 * sidebar so uploaded models persist across reloads with live status pills.
 */
export const listModels = query({
  args: { ownerType, ownerId: v.string() },
  handler: async (ctx, { ownerType, ownerId }) => {
    const rows = await ctx.db
      .query('mirrorviewModels')
      .withIndex('by_owner', (q) =>
        q.eq('ownerType', ownerType).eq('ownerId', ownerId),
      )
      .collect();
    rows.sort((a, b) => b.createdAt - a.createdAt);
    return rows;
  },
});

/**
 * Delete a model row from the sidebar.
 *
 * NOTE: this only removes the metadata row from Convex. The translated SVF
 * derivative in APS Object Storage is left behind — at go-live we'll add an
 * `aps.deleteObject` action wired here to keep OSS tidy. Until then,
 * orphaned derivatives are harmless (just APS storage quota).
 */
export const deleteModel = mutation({
  args: { id: v.id('mirrorviewModels') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

/**
 * Flip a revision from draft → released. Called by the Release Rev X
 * button in ProductDetail. UI-side permission gate (admin|lead) blocks
 * the button for team-level operators; once WorkOS lands at go-live
 * this mutation will also verify `ctx.auth.getUserIdentity()` for
 * server-side enforcement.
 *
 * `releasedBy` is provided by the client (employee display name) for now
 * because Convex doesn't yet see WorkOS identities.
 */
export const releaseRevision = mutation({
  args: {
    id: v.id('mirrorviewModels'),
    releasedBy: v.optional(v.string()),
  },
  handler: async (ctx, { id, releasedBy }) => {
    const row = await ctx.db.get(id);
    if (!row) throw new Error('Model not found');
    if (row.status !== 'success') {
      throw new Error('Can only release a successfully translated revision');
    }
    if (row.revisionStatus === 'released') return; // idempotent
    await ctx.db.patch(id, {
      revisionStatus: 'released',
      releasedAt: Date.now(),
      releasedBy,
      updatedAt: Date.now(),
    });
  },
});
