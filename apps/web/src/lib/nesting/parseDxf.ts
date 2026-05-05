// ─── Minimal in-house DXF reader for the Nesting Studio ──────────────
// Parses DXF (R12 ASCII) entities into points and computes a bounding box
// + cut-length proxy. Not a complete DXF reader — handles LINE, LWPOLYLINE
// vertices, POLYLINE vertices, ARC (sampled), CIRCLE (sampled), and skips
// everything else cleanly. Good enough for fab DXFs to extract the bbox
// the studio needs; for full polygon support a third-party parser would
// be wired in here without changing the call sites.

export interface ParsedDxf {
  /** Bounding box of all parsed entities, in DXF units (typically mm). */
  bboxMm: { widthMm: number; heightMm: number; minX: number; minY: number };
  /** Sum of segment lengths across all parsed entities — proxy for cut time. */
  totalCutLengthMm: number;
  /** Number of CIRCLE entities — proxy for hole count. */
  holeCount: number;
  /** Layer names referenced by parsed entities. */
  layers: string[];
  /**
   * Approximate outer polygon for axis-aligned packing today. Populated when
   * at least one closed contour is found; otherwise falls back to bbox.
   * Format: array of [x, y] in DXF units.
   */
  outerPolygon: [number, number][];
}

interface DxfPair {
  code: number;
  value: string;
}

/** Parse the raw DXF text into [code, value] pairs. */
function tokenize(text: string): DxfPair[] {
  const pairs: DxfPair[] = [];
  // DXF lines come as alternating "code\nvalue\n" pairs. We split on \r?\n
  // and zip them. Whitespace-only lines are skipped to be lenient with
  // hand-edited files.
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  for (let i = 0; i + 1 < lines.length; i += 2) {
    const code = Number(lines[i]);
    const value = lines[i + 1];
    if (Number.isFinite(code)) pairs.push({ code, value });
  }
  return pairs;
}

interface ParserState {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  cutLength: number;
  circles: number;
  layers: Set<string>;
  contour: [number, number][];
  bestContour: [number, number][];
}

function trackPoint(state: ParserState, x: number, y: number) {
  if (x < state.minX) state.minX = x;
  if (x > state.maxX) state.maxX = x;
  if (y < state.minY) state.minY = y;
  if (y > state.maxY) state.maxY = y;
}

function pushContour(state: ParserState) {
  if (state.contour.length > state.bestContour.length) {
    state.bestContour = state.contour;
  }
  state.contour = [];
}

/**
 * Parse a DXF source string. Tolerant of unknown sections — we only consume
 * entities we recognise and silently skip the rest.
 */
export function parseDxf(source: string): ParsedDxf {
  const pairs = tokenize(source);
  const state: ParserState = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
    cutLength: 0,
    circles: 0,
    layers: new Set<string>(),
    contour: [],
    bestContour: [],
  };

  let i = 0;
  // Buffer the current entity's interesting fields. We only emit on entity
  // boundaries (code 0).
  let currentEntity: string | null = null;
  let buf: Record<string, number | string | undefined> = {};
  let polyVertices: [number, number][] = [];

  function flushEntity() {
    if (!currentEntity) return;
    const xRaw = buf[10];
    const yRaw = buf[20];
    const x = typeof xRaw === 'number' ? xRaw : NaN;
    const y = typeof yRaw === 'number' ? yRaw : NaN;
    const layer = typeof buf[8] === 'string' ? (buf[8] as string) : 'CUT';
    state.layers.add(layer);

    switch (currentEntity) {
      case 'LINE': {
        const xRaw11 = buf[11];
        const yRaw21 = buf[21];
        const x2 = typeof xRaw11 === 'number' ? xRaw11 : NaN;
        const y2 = typeof yRaw21 === 'number' ? yRaw21 : NaN;
        if ([x, y, x2, y2].every(Number.isFinite)) {
          trackPoint(state, x, y);
          trackPoint(state, x2, y2);
          state.cutLength += Math.hypot(x2 - x, y2 - y);
          // Lines aren't grouped into a contour automatically — we'd need
          // to walk an adjacency graph. Track them as point candidates.
          state.contour.push([x, y]);
          state.contour.push([x2, y2]);
        }
        break;
      }
      case 'CIRCLE': {
        const r = typeof buf[40] === 'number' ? (buf[40] as number) : NaN;
        if ([x, y, r].every(Number.isFinite)) {
          trackPoint(state, x - r, y - r);
          trackPoint(state, x + r, y + r);
          state.cutLength += 2 * Math.PI * r;
          state.circles += 1;
        }
        break;
      }
      case 'ARC': {
        const r = typeof buf[40] === 'number' ? (buf[40] as number) : NaN;
        const a1 = typeof buf[50] === 'number' ? (buf[50] as number) : 0;
        const a2 = typeof buf[51] === 'number' ? (buf[51] as number) : 0;
        if ([x, y, r].every(Number.isFinite)) {
          // Track the arc bbox conservatively as the full circle bbox.
          trackPoint(state, x - r, y - r);
          trackPoint(state, x + r, y + r);
          let sweep = a2 - a1;
          if (sweep < 0) sweep += 360;
          state.cutLength += (sweep / 360) * 2 * Math.PI * r;
        }
        break;
      }
      case 'LWPOLYLINE':
      case 'POLYLINE': {
        if (polyVertices.length >= 2) {
          for (let v = 0; v < polyVertices.length; v++) {
            trackPoint(state, polyVertices[v][0], polyVertices[v][1]);
          }
          for (let v = 1; v < polyVertices.length; v++) {
            const [px, py] = polyVertices[v - 1];
            const [qx, qy] = polyVertices[v];
            state.cutLength += Math.hypot(qx - px, qy - py);
          }
          // Treat each polyline as a candidate contour; keep the longest.
          state.contour = polyVertices.slice();
          pushContour(state);
        }
        polyVertices = [];
        break;
      }
      // VERTEX entities are children of POLYLINE; tracked above.
      default:
        break;
    }

    currentEntity = null;
    buf = {};
  }

  while (i < pairs.length) {
    const { code, value } = pairs[i];
    if (code === 0) {
      flushEntity();
      currentEntity = value;
      buf = {};
      polyVertices = [];
      // Special handling for VERTEX which lives inside POLYLINE.
      if (value === 'VERTEX') {
        // The next pairs until the next code-0 belong to this vertex.
        i++;
        let vx = NaN;
        let vy = NaN;
        while (i < pairs.length && pairs[i].code !== 0) {
          if (pairs[i].code === 10) vx = Number(pairs[i].value);
          if (pairs[i].code === 20) vy = Number(pairs[i].value);
          i++;
        }
        if (Number.isFinite(vx) && Number.isFinite(vy)) {
          polyVertices.push([vx, vy]);
        }
        // Reset currentEntity since VERTEX is a child — the next code-0
        // will be either another VERTEX, SEQEND, or a new entity.
        currentEntity = null;
        continue;
      }
      i++;
      continue;
    }

    // Numeric codes used for coordinates / radii / angles.
    if (
      code === 10 || code === 20 || code === 11 || code === 21 ||
      code === 40 || code === 50 || code === 51
    ) {
      buf[code] = Number(value);
    } else if (code === 8) {
      // Layer name.
      buf[8] = value;
    } else if (code === 90) {
      // LWPOLYLINE vertex count — informational only.
      buf[90] = Number(value);
    } else if (code === 70) {
      // LWPOLYLINE flag (1 = closed).
      buf[70] = Number(value);
    }

    // For LWPOLYLINE the vertices come as a stream of (10, 20) pairs.
    if (currentEntity === 'LWPOLYLINE' && code === 10) {
      // Look ahead for the matching 20 code and record the vertex.
      const x = Number(value);
      let y = NaN;
      let j = i + 1;
      while (j < pairs.length && pairs[j].code !== 20 && pairs[j].code !== 0) j++;
      if (j < pairs.length && pairs[j].code === 20) {
        y = Number(pairs[j].value);
      }
      if (Number.isFinite(x) && Number.isFinite(y)) {
        polyVertices.push([x, y]);
      }
    }

    i++;
  }
  flushEntity();
  pushContour(state);

  if (!Number.isFinite(state.minX) || !Number.isFinite(state.minY)) {
    return {
      bboxMm: { widthMm: 0, heightMm: 0, minX: 0, minY: 0 },
      totalCutLengthMm: 0,
      holeCount: 0,
      layers: [],
      outerPolygon: [],
    };
  }

  const widthMm = state.maxX - state.minX;
  const heightMm = state.maxY - state.minY;

  return {
    bboxMm: {
      widthMm: Math.round(widthMm * 1000) / 1000,
      heightMm: Math.round(heightMm * 1000) / 1000,
      minX: state.minX,
      minY: state.minY,
    },
    totalCutLengthMm: Math.round(state.cutLength * 1000) / 1000,
    holeCount: state.circles,
    layers: Array.from(state.layers),
    outerPolygon: state.bestContour,
  };
}
