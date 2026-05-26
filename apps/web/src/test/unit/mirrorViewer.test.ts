/**
 * Unit tests for the MirrorViewer service.
 *
 * The mock implementation is the demo's source of truth — it must continue to
 * return a sentinel ('demo') so the front-end falls back to GLB rendering when
 * no real APS credentials are configured.
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

  it('resolves a URN and a GLB fallback for every owner type', async () => {
    const ownerTypes = ['product', 'job', 'mo', 'workOrder', 'quote'] as const;
    for (const ownerType of ownerTypes) {
      const src = await mockMirrorViewerService.resolveSource({
        ownerType,
        ownerId: 'demo-1',
      });
      expect(src).not.toBeNull();
      expect(src?.glbSrc).toBeTruthy();
      // demo URN is base64 — sanity-check it decodes to something starting with urn:
      expect(src?.urn).toBeTruthy();
      expect(atob(src!.urn!)).toMatch(/^urn:/);
    }
  });
});

describe('mirrorViewer remote service (stub)', () => {
  it('returns a demo sentinel until Convex wiring lands at go-live', async () => {
    const result = await remoteMirrorViewerService.getToken();
    expect(result.token).toBeNull();
    expect(result.reason).toBe('demo');
  });

  it('returns null source so the caller passes its own to the component', async () => {
    const src = await remoteMirrorViewerService.resolveSource({
      ownerType: 'product',
      ownerId: 'demo-1',
    });
    expect(src).toBeNull();
  });
});
