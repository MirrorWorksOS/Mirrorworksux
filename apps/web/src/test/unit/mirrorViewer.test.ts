/**
 * Unit tests for the MirrorViewer service.
 *
 * The mock implementation is the demo's source of truth — it must continue
 * to return a sentinel ('demo') so the front-end falls back to GLB rendering
 * when no real APS credentials are configured.
 *
 * Phase 2b switched the demo URN map to empty so the dropzone empty-state
 * shows ("Drop a CAD file to view it…") instead of a misleading sample GLB
 * for ownerIds with no real upload yet. Behaviour pinned in the tests below.
 */

import { describe, expect, it } from 'vitest';
import {
  mockMirrorViewerService,
  remoteMirrorViewerService,
} from '@/services/mirrorViewer';

describe('mirrorViewer mock service', () => {
  it('returns a demo sentinel token so the viewer falls back to GLB', async () => {
    const result = await mockMirrorViewerService.getToken();
    expect(result.token).toBeNull();
    expect(result.reason).toBe('demo');
    expect(result.expiresIn).toBe(0);
  });

  it('always exposes a GLB fallback for every owner type', async () => {
    const ownerTypes = ['product', 'job', 'mo', 'workOrder', 'quote'] as const;
    for (const ownerType of ownerTypes) {
      const src = await mockMirrorViewerService.resolveSource({
        ownerType,
        ownerId: 'demo-1',
      });
      expect(src).not.toBeNull();
      expect(src?.glbSrc).toBeTruthy();
      // No URN is provided by the mock service today — real URNs come from
      // Convex listModels after a successful APS translation. The viewer's
      // upload-aware empty state replaces the previous demo-URN placeholder.
      expect(src?.urn).toBeUndefined();
    }
  });
});

describe('mirrorViewer remote service', () => {
  it('returns a result shape regardless of whether Convex is reachable', async () => {
    // Test environment may have VITE_CONVEX_URL pre-populated (from .env.local)
    // so we can't assert null; just pin the shape of the response so callers
    // can always destructure { token, expiresIn } safely.
    const result = await remoteMirrorViewerService.getToken();
    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('expiresIn');
    expect(typeof result.expiresIn).toBe('number');
  });

  it('delegates resolveSource to the mock URN map (Phase 2b)', async () => {
    // The remote source resolver reuses the mock URN map until the upload
    // pipeline writes real `mirrorviewModels` rows for each owner. Until
    // then, every owner yields { glbSrc } so the viewer renders the demo
    // GLB or the upload-empty-state.
    const src = await remoteMirrorViewerService.resolveSource({
      ownerType: 'product',
      ownerId: 'demo-1',
    });
    expect(src).not.toBeNull();
    expect(src?.glbSrc).toBeTruthy();
    expect(src?.urn).toBeUndefined();
  });
});
