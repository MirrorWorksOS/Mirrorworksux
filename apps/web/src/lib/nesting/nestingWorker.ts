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
    // 'polygon' — true polygon nesting (SVGnest / NFP) lands here. Until
    // then we transparently fall back to tight-nest and report the swap so
    // the UI can label the result honestly.
    result = packTight(req.parts, req.opts);
    fellBackTo = 'tight';
  }
  const durationMs = Math.round(performance.now() - start);
  const res: NestResponse = { reqId: req.reqId, result, durationMs, fellBackTo };
  (self as unknown as { postMessage: (m: NestResponse) => void }).postMessage(res);
};

// Required so Vite treats this as a module worker.
export {};
