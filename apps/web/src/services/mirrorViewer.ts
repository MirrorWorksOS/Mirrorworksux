/**
 * MirrorViewer service — token + URN resolution for the APS Viewer.
 *
 * Demo path: returns a hardcoded sample URN and a `demo` token sentinel so the
 * front-end runs end-to-end without an Autodesk app or a live Convex deployment.
 * Real path (go-live): proxies to Convex's `aps.viewerToken` action and the
 * `mirrorviewModels` table.
 */

export type ViewerOwnerType = 'product' | 'job' | 'mo' | 'workOrder' | 'quote';

export interface ViewerContext {
  ownerType: ViewerOwnerType;
  ownerId: string;
}

export interface MirrorViewerSource {
  /** Pre-translated APS URN (base64 of `urn:adsk.objects:os.object:…`). */
  urn?: string;
  /** Fallback GLB asset for demo fixtures lacking an APS URN. */
  glbSrc?: string;
}

export interface ViewerTokenResult {
  token: string | null;
  expiresIn: number;
  /** Sentinel telling the component to render the GLB fallback. */
  reason?: 'demo' | 'error';
  error?: string;
}

export interface MirrorViewerService {
  /** Mint a short-lived viewer-only token. Implementations cache until expiry. */
  getToken(): Promise<ViewerTokenResult>;
  /** Resolve the URN/GLB to render for a given owner context (go-live). */
  resolveSource(ctx: ViewerContext): Promise<MirrorViewerSource | null>;
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Mock implementation                                                     */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Per-owner URN map. Each value should be a base64-encoded `urn:adsk.objects:`
 * pointing at a Model Derivative translation in your APS bucket.
 *
 * Empty until you translate your first CAD file. Until then `resolveSource`
 * returns only `glbSrc` so the viewer renders the bundled GLB demo asset
 * instead of trying to load a non-existent URN (which fails inside the APS
 * viewer with a blank canvas).
 *
 * To populate: translate a STEP/RVT/IFC via the Model Derivative API
 * (or `aps.upload` action once it ships), copy the returned base64 URN here.
 */
const DEMO_OWNER_URNS: Partial<Record<ViewerOwnerType, string>> = {
  // product: 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6…',
  // job: 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6…',
  // mo: 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6…',
};

export const mockMirrorViewerService: MirrorViewerService = {
  async getToken() {
    return { token: null, expiresIn: 0, reason: 'demo' };
  },
  async resolveSource(ctx) {
    const urn = DEMO_OWNER_URNS[ctx.ownerType];
    return urn
      ? { urn, glbSrc: '/models/diff.glb' }
      : { glbSrc: '/models/diff.glb' };
  },
};

/* ─────────────────────────────────────────────────────────────────────── */
/* Remote implementation (Convex)                                          */
/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Convex-backed implementation. Calls the `aps.viewerToken` action in the
 * mirrorworks dev deployment and caches the result client-side until just
 * before expiry (`SAFETY_WINDOW_MS` of headroom).
 *
 * Source resolution still falls back to the demo URN map — replace once
 * the `aps.upload` flow lands and customer files have real `mirrorviewModels`
 * rows in Convex.
 */

const SAFETY_WINDOW_MS = 60_000;

interface CachedToken {
  token: string;
  expiresAtMs: number;
}

let cached: CachedToken | null = null;
let inflight: Promise<ViewerTokenResult> | null = null;

async function fetchTokenFromConvex(): Promise<ViewerTokenResult> {
  const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
  if (!convexUrl) return { token: null, expiresIn: 0, reason: 'demo' };

  // Dynamic import so the mock path never pays the Convex bundle cost.
  const { ConvexHttpClient } = await import('convex/browser');
  const { api } = await import('@convex/_generated/api');
  const client = new ConvexHttpClient(convexUrl);

  try {
    const result = await client.action(api.aps.viewerToken, {});
    if (result.token) {
      cached = {
        token: result.token,
        expiresAtMs: Date.now() + result.expiresIn * 1000 - SAFETY_WINDOW_MS,
      };
    }
    return result;
  } catch (error) {
    return {
      token: null,
      expiresIn: 0,
      reason: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export const remoteMirrorViewerService: MirrorViewerService = {
  async getToken() {
    if (cached && cached.expiresAtMs > Date.now()) {
      const remainingMs = cached.expiresAtMs - Date.now();
      return { token: cached.token, expiresIn: Math.round(remainingMs / 1000) };
    }
    if (inflight) return inflight;
    inflight = fetchTokenFromConvex().finally(() => {
      inflight = null;
    });
    return inflight;
  },
  async resolveSource(ctx) {
    // Reuse the demo URN map until real `mirrorviewModels` rows exist.
    // `aps.upload` will switch this to a Convex query at go-live.
    return mockMirrorViewerService.resolveSource(ctx);
  },
};

/* ─────────────────────────────────────────────────────────────────────── */
/* Active service                                                          */
/* ─────────────────────────────────────────────────────────────────────── */

export const mirrorViewerService: MirrorViewerService =
  import.meta.env.VITE_DATA_SOURCE === 'remote'
    ? remoteMirrorViewerService
    : mockMirrorViewerService;
