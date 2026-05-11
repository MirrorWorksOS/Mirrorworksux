// ─── Nesting web worker entry ────────────────────────────────────────
// Runs the rectangle packer off the main thread so big nests don't jank
// the Studio. Vite picks this up via the `?worker` import suffix in
// useAsyncPackedNest.ts. Polygon nesting (true SVGnest-style NFP) plugs
// in here as a third strategy when ready — call sites stay the same.

import {
  packRectangles,
  packTight,
  type PackOptions,
  type PackPart,
  type PackResult,
} from './rectanglePacker';
import { packPolygons } from './polygonPacker';

export interface NestRequest {
  reqId: number;
  parts: PackPart[];
  opts: PackOptions;
  /** Strategy: 'fast' = FFDH; 'tight' = multi-strategy; 'polygon' = future. */
  strategy: 'fast' | 'tight' | 'polygon';
}

export interface NestResponse {
  reqId: number;
  result: PackResult;
  durationMs: number;
  /** When 'polygon' is requested but not implemented, we report the fallback. */
  fellBackTo?: 'tight';
}

self.onmessage = (event: MessageEvent<NestRequest>) => {
  const req = event.data;
  const start = performance.now();
  let result: PackResult;
  let fellBackTo: 'tight' | undefined;
  if (req.strategy === 'fast') {
    result = packRectangles(req.parts, req.opts);
  } else if (req.strategy === 'tight') {
    result = packTight(req.parts, req.opts);
  } else {
    // 'polygon' — BLF polygon packer with corner-point candidates and
    // true-shape collision tests. Consumes outerPolygon, allowRotation,
    // and allowMirror on each part. Falls back to a rectangle of the part
    // bbox when no polygon is present.
    result = packPolygons(req.parts, req.opts);
  }
  const durationMs = Math.round(performance.now() - start);
  const res: NestResponse = { reqId: req.reqId, result, durationMs, fellBackTo };
  (self as unknown as { postMessage: (m: NestResponse) => void }).postMessage(res);
};

// Required so Vite treats this as a module worker.
export {};
