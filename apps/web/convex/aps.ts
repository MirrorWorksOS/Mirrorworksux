import { action, internalAction } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';

/**
 * Autodesk Platform Services (APS) integration.
 *
 * Lifecycle for a CAD file:
 *   client.startUpload   → mints OSS signed S3 URL + inserts row (status=uploading)
 *   <browser PUTs file>
 *   client.finishUpload  → finalizes S3, kicks off Model Derivative job (status=translating)
 *   pollManifest         → scheduled action; polls every 5s, updates progress,
 *                          flips to success/failed when done
 *
 * Secrets in Convex env: APS_CLIENT_ID, APS_CLIENT_SECRET.
 * Optional: APS_BUCKET_KEY (defaults to mirrorworks-demo-models).
 */

const APS_BASE = 'https://developer.api.autodesk.com';
const APS_TOKEN_URL = `${APS_BASE}/authentication/v2/token`;

const VIEWER_SCOPE = 'viewables:read';
const SERVER_SCOPE = 'data:read data:write data:create bucket:read bucket:create';

interface ApsTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

async function mintToken(scope: string): Promise<ApsTokenResponse | null> {
  const clientId = process.env.APS_CLIENT_ID;
  const clientSecret = process.env.APS_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const res = await fetch(APS_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'client_credentials', scope }),
  });
  if (!res.ok) return null;
  return (await res.json()) as ApsTokenResponse;
}

/** Public action: mint a viewer-only token for the browser. */
export const viewerToken = action({
  args: {},
  handler: async (): Promise<{
    token: string | null;
    expiresIn: number;
    reason?: 'demo' | 'error';
    error?: string;
  }> => {
    const t = await mintToken(VIEWER_SCOPE);
    if (!t) return { token: null, expiresIn: 0, reason: 'demo' };
    return { token: t.access_token, expiresIn: t.expires_in };
  },
});

/* ─────────────────────────────────────────────────────────────────────── */
/* Upload + translation                                                    */
/* ─────────────────────────────────────────────────────────────────────── */

function bucketKey(): string {
  return (process.env.APS_BUCKET_KEY ?? 'mirrorworks-demo-models').toLowerCase();
}

async function ensureBucket(token: string): Promise<void> {
  // Idempotent: creating a bucket that already exists returns 409, which we
  // treat as success.
  const res = await fetch(`${APS_BASE}/oss/v2/buckets`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bucketKey: bucketKey(), policyKey: 'persistent' }),
  });
  if (!res.ok && res.status !== 409) {
    const txt = await res.text();
    throw new Error(`Bucket ensure failed: ${res.status} ${txt}`);
  }
}

function safeObjectKey(fileName: string): string {
  // OSS object keys allow [A-Za-z0-9._-]; replace anything else.
  const slug = fileName.replace(/[^A-Za-z0-9._-]/g, '_');
  return `${Date.now()}-${slug}`;
}

function toBase64Urn(objectId: string): string {
  // base64url, no padding — Model Derivative requirement.
  return btoa(objectId)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

const ownerType = v.union(
  v.literal('product'),
  v.literal('job'),
  v.literal('mo'),
  v.literal('workOrder'),
  v.literal('quote'),
);

/**
 * Step 1 — client calls this with file metadata. Returns a signed S3 URL the
 * browser PUTs the bytes to directly. Single-chunk for simplicity (works up
 * to 5GB which covers any CAD file we'd demo).
 */
export const startUpload = action({
  args: {
    fileName: v.string(),
    sizeBytes: v.number(),
    ownerType,
    ownerId: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    modelId: string;
    signedUrl: string;
    uploadKey: string;
    bucketKey: string;
    objectKey: string;
  }> => {
    const tok = await mintToken(SERVER_SCOPE);
    if (!tok) throw new Error('APS credentials missing in Convex env');

    await ensureBucket(tok.access_token);

    const objectKey = safeObjectKey(args.fileName);
    const url = `${APS_BASE}/oss/v2/buckets/${bucketKey()}/objects/${objectKey}/signeds3upload?minutesExpiration=60`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${tok.access_token}` },
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`signeds3upload failed: ${res.status} ${txt}`);
    }
    const json = (await res.json()) as { uploadKey: string; urls: string[] };

    const modelId = await ctx.runMutation(internal.mirrorview.insertModel, {
      fileName: args.fileName,
      sizeBytes: args.sizeBytes,
      ownerType: args.ownerType,
      ownerId: args.ownerId,
      bucketKey: bucketKey(),
      objectKey,
      uploadKey: json.uploadKey,
    });

    return {
      modelId,
      signedUrl: json.urls[0],
      uploadKey: json.uploadKey,
      bucketKey: bucketKey(),
      objectKey,
    };
  },
});

/**
 * Step 2 — client calls this after the browser → S3 PUT completes. Finalizes
 * the OSS object, kicks off Model Derivative translation, and schedules the
 * manifest poller.
 */
export const finishUpload = action({
  args: {
    modelId: v.id('mirrorviewModels'),
    uploadKey: v.string(),
    bucketKey: v.string(),
    objectKey: v.string(),
  },
  handler: async (ctx, args): Promise<{ urn: string }> => {
    const tok = await mintToken(SERVER_SCOPE);
    if (!tok) throw new Error('APS credentials missing in Convex env');

    const finalize = await fetch(
      `${APS_BASE}/oss/v2/buckets/${args.bucketKey}/objects/${args.objectKey}/signeds3upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tok.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uploadKey: args.uploadKey }),
      },
    );
    if (!finalize.ok) {
      const txt = await finalize.text();
      await ctx.runMutation(internal.mirrorview.updateModel, {
        id: args.modelId,
        status: 'failed',
        error: `OSS finalize failed: ${finalize.status} ${txt.slice(0, 200)}`,
      });
      throw new Error(`OSS finalize failed: ${finalize.status}`);
    }

    const objectId = `urn:adsk.objects:os.object:${args.bucketKey}/${args.objectKey}`;
    const urn = toBase64Urn(objectId);

    const job = await fetch(`${APS_BASE}/modelderivative/v2/designdata/job`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tok.access_token}`,
        'Content-Type': 'application/json',
        'x-ads-force': 'true',
      },
      body: JSON.stringify({
        input: { urn },
        output: { formats: [{ type: 'svf2', views: ['2d', '3d'] }] },
      }),
    });
    if (!job.ok) {
      const txt = await job.text();
      await ctx.runMutation(internal.mirrorview.updateModel, {
        id: args.modelId,
        status: 'failed',
        error: `Translate job failed: ${job.status} ${txt.slice(0, 200)}`,
      });
      throw new Error(`Translate job failed: ${job.status} ${txt}`);
    }

    await ctx.runMutation(internal.mirrorview.updateModel, {
      id: args.modelId,
      urn,
      status: 'translating',
      progress: 0,
    });

    await ctx.scheduler.runAfter(5_000, internal.aps.pollManifest, {
      modelId: args.modelId,
      urn,
    });

    return { urn };
  },
});

/**
 * Scheduled action: polls the Model Derivative manifest and updates the row.
 * Reschedules itself every 5s until status is `success` or `failed`.
 */
export const pollManifest = internalAction({
  args: { modelId: v.id('mirrorviewModels'), urn: v.string() },
  handler: async (ctx, args) => {
    const tok = await mintToken(VIEWER_SCOPE);
    if (!tok) return;

    const res = await fetch(
      `${APS_BASE}/modelderivative/v2/designdata/${args.urn}/manifest`,
      { headers: { Authorization: `Bearer ${tok.access_token}` } },
    );
    if (!res.ok) {
      // Right after job submission the manifest 404s for a few seconds; retry.
      await ctx.scheduler.runAfter(5_000, internal.aps.pollManifest, args);
      return;
    }
    const manifest = (await res.json()) as {
      status?: string;
      progress?: string;
    };
    const progress =
      typeof manifest.progress === 'string'
        ? parseInt(manifest.progress.replace(/[^\d]/g, ''), 10) || 0
        : 0;

    if (manifest.status === 'success') {
      await ctx.runMutation(internal.mirrorview.updateModel, {
        id: args.modelId,
        status: 'success',
        progress: 100,
      });
      return;
    }
    if (manifest.status === 'failed' || manifest.status === 'timeout') {
      await ctx.runMutation(internal.mirrorview.updateModel, {
        id: args.modelId,
        status: 'failed',
        error: `Translation ${manifest.status}`,
      });
      return;
    }

    await ctx.runMutation(internal.mirrorview.updateModel, {
      id: args.modelId,
      progress,
    });
    await ctx.scheduler.runAfter(5_000, internal.aps.pollManifest, args);
  },
});

/* ─────────────────────────────────────────────────────────────────────── */
/* Go-live placeholders                                                    */
/* ─────────────────────────────────────────────────────────────────────── */

/** Stream the source CAD file from APS OSS into Cloudflare R2. */
export const archiveToR2 = action({
  args: { urn: v.string() },
  handler: async () => {
    throw new Error('archiveToR2 not implemented — wires up at go-live');
  },
});
