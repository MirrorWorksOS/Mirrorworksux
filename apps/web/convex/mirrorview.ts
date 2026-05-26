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

/* ─────────────────────────────────────────────────────────────────────── */
/* Markup — anchored 3D comments                                           */
/* ─────────────────────────────────────────────────────────────────────── */

const cameraValidator = v.object({
  px: v.number(), py: v.number(), pz: v.number(),
  tx: v.number(), ty: v.number(), tz: v.number(),
  ux: v.number(), uy: v.number(), uz: v.number(),
});

/** Create a root markup (pinned comment) anchored to a model + viewpoint. */
export const createMarkup = mutation({
  args: {
    modelId: v.id('mirrorviewModels'),
    body: v.string(),
    author: v.optional(v.string()),
    camera: v.optional(cameraValidator),
    dbIds: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    const trimmed = args.body.trim();
    if (!trimmed) throw new Error('Markup body cannot be empty');
    const now = Date.now();
    return ctx.db.insert('mirrorviewMarkups', {
      modelId: args.modelId,
      body: trimmed,
      author: args.author,
      camera: args.camera,
      dbIds: args.dbIds,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Reply to an existing root markup. Inherits the root's modelId. */
export const replyToMarkup = mutation({
  args: {
    parentMarkupId: v.id('mirrorviewMarkups'),
    body: v.string(),
    author: v.optional(v.string()),
  },
  handler: async (ctx, { parentMarkupId, body, author }) => {
    const trimmed = body.trim();
    if (!trimmed) throw new Error('Reply body cannot be empty');
    const parent = await ctx.db.get(parentMarkupId);
    if (!parent) throw new Error('Parent markup not found');
    if (parent.parentMarkupId) {
      throw new Error('Replies cannot have replies (flat thread only)');
    }
    const now = Date.now();
    return ctx.db.insert('mirrorviewMarkups', {
      modelId: parent.modelId,
      parentMarkupId,
      body: trimmed,
      author,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Flip a root markup to resolved. Idempotent. */
export const resolveMarkup = mutation({
  args: {
    id: v.id('mirrorviewMarkups'),
    resolvedBy: v.optional(v.string()),
  },
  handler: async (ctx, { id, resolvedBy }) => {
    const row = await ctx.db.get(id);
    if (!row) throw new Error('Markup not found');
    if (row.parentMarkupId) throw new Error('Can only resolve root markups');
    if (row.status === 'resolved') return;
    await ctx.db.patch(id, {
      status: 'resolved',
      resolvedAt: Date.now(),
      resolvedBy,
      updatedAt: Date.now(),
    });
  },
});

/** Re-open a resolved root markup. */
export const reopenMarkup = mutation({
  args: { id: v.id('mirrorviewMarkups') },
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id);
    if (!row) throw new Error('Markup not found');
    if (row.parentMarkupId) throw new Error('Can only re-open root markups');
    await ctx.db.patch(id, {
      status: 'open',
      resolvedAt: undefined,
      resolvedBy: undefined,
      updatedAt: Date.now(),
    });
  },
});

/** Delete a markup row (and its replies if it's a root). */
export const deleteMarkup = mutation({
  args: { id: v.id('mirrorviewMarkups') },
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id);
    if (!row) return;
    if (!row.parentMarkupId) {
      // Root — delete all replies first.
      const replies = await ctx.db
        .query('mirrorviewMarkups')
        .withIndex('by_parent', (q) => q.eq('parentMarkupId', id))
        .collect();
      for (const r of replies) await ctx.db.delete(r._id);
    }
    await ctx.db.delete(id);
  },
});

/**
 * All markup rows for a model, with replies grouped under their roots.
 * Returns roots sorted newest-first; replies sorted oldest-first within
 * each root (natural conversation order).
 */
export const listMarkups = query({
  args: { modelId: v.id('mirrorviewModels') },
  handler: async (ctx, { modelId }) => {
    const rows = await ctx.db
      .query('mirrorviewMarkups')
      .withIndex('by_model', (q) => q.eq('modelId', modelId))
      .collect();
    const roots = rows.filter((r) => !r.parentMarkupId);
    const replies = rows.filter((r) => r.parentMarkupId);
    roots.sort((a, b) => b.createdAt - a.createdAt);
    return roots.map((root) => ({
      ...root,
      replies: replies
        .filter((r) => r.parentMarkupId === root._id)
        .sort((a, b) => a.createdAt - b.createdAt),
    }));
  },
});
