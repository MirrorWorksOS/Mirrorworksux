// ─── Minimal in-house DXF reader for the Nesting Studio ──────────────
// Parses DXF (R12 ASCII and modern AC1009+) entities into points and
// computes a bounding box + cut-length proxy. Not a full DXF reader —
// handles LINE, LWPOLYLINE, POLYLINE/VERTEX/SEQEND, ARC (sampled bbox),
// and CIRCLE (sampled bbox). Tracks the current SECTION so it only reads
// geometry out of ENTITIES (BLOCKS / OBJECTS / TABLES are ignored). Falls
// back to $EXTMIN/$EXTMAX from the HEADER section when no entities are
// found. Good enough for typical fab DXFs to extract the bbox the
// studio needs.

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

/**
 * Tokenise raw DXF text into (code, value) pairs.
 *
 * DXF is strictly line-paired: every group code line is followed by its
 * value line, including when the value is an empty string. We must NOT
 * filter blank lines — doing so misaligns every pair after the first
 * empty value, which is a common occurrence in CAD-exported DXFs.
 */
function tokenize(text: string): DxfPair[] {
  const lines = text.split(/\r?\n/);
  // Strip a trailing empty line if the file ends with a newline.
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  const pairs: DxfPair[] = [];
  for (let i = 0; i + 1 < lines.length; i += 2) {
    const codeStr = lines[i].trim();
    if (codeStr === '') continue;
    const code = Number(codeStr);
    if (!Number.isFinite(code)) continue;
    // Preserve the raw value — string values may be intentionally empty.
    pairs.push({ code, value: lines[i + 1] ?? '' });
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
  bestContour: [number, number][];
}

function trackPoint(state: ParserState, x: number, y: number) {
  if (x < state.minX) state.minX = x;
  if (x > state.maxX) state.maxX = x;
  if (y < state.minY) state.minY = y;
  if (y > state.maxY) state.maxY = y;
}

const NUMERIC_CODES = new Set([10, 20, 11, 21, 40, 41, 42, 50, 51, 70, 90]);

/**
 * Parse a DXF source string. Tolerant of unknown sections — we only consume
 * entities we recognise inside the ENTITIES section and silently skip the
 * rest. Falls back to header $EXTMIN/$EXTMAX when no geometry is found.
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
    bestContour: [],
  };

  // Header bbox (collected from $EXTMIN / $EXTMAX) — used as a fallback
  // when the ENTITIES section is empty or unreadable.
  const headerExtMin: { x?: number; y?: number } = {};
  const headerExtMax: { x?: number; y?: number } = {};
  let lastHeaderVar: string | null = null;

  let section: string | null = null;
  let entity: string | null = null;
  let buf: Map<number, string> = new Map();
  let polyVertices: [number, number][] = [];

  function commitContour(verts: [number, number][]) {
    if (verts.length < 2) return;
    for (const [x, y] of verts) trackPoint(state, x, y);
    for (let v = 1; v < verts.length; v++) {
      const [px, py] = verts[v - 1];
      const [qx, qy] = verts[v];
      state.cutLength += Math.hypot(qx - px, qy - py);
    }
    if (verts.length > state.bestContour.length) {
      state.bestContour = verts.slice();
    }
  }

  function flushEntity() {
    if (!entity) return;
    const layer = buf.get(8);
    if (typeof layer === 'string' && layer.length > 0) state.layers.add(layer);

    const num = (code: number): number => {
      const raw = buf.get(code);
      return raw === undefined ? NaN : Number(raw);
    };

    switch (entity) {
      case 'LINE': {
        const x = num(10), y = num(20), x2 = num(11), y2 = num(21);
        if ([x, y, x2, y2].every(Number.isFinite)) {
          trackPoint(state, x, y);
          trackPoint(state, x2, y2);
          state.cutLength += Math.hypot(x2 - x, y2 - y);
        }
        break;
      }
      case 'CIRCLE': {
        const x = num(10), y = num(20), r = num(40);
        if ([x, y, r].every(Number.isFinite)) {
          trackPoint(state, x - r, y - r);
          trackPoint(state, x + r, y + r);
          state.cutLength += 2 * Math.PI * r;
          state.circles += 1;
        }
        break;
      }
      case 'ARC': {
        const x = num(10), y = num(20), r = num(40);
        const a1 = Number.isFinite(num(50)) ? num(50) : 0;
        const a2 = Number.isFinite(num(51)) ? num(51) : 0;
        if ([x, y, r].every(Number.isFinite)) {
          // Conservative — track the full circle bbox.
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
        commitContour(polyVertices);
        break;
      }
      default:
        break;
    }

    entity = null;
    buf = new Map();
    polyVertices = [];
  }

  for (let i = 0; i < pairs.length; i++) {
    const { code, value } = pairs[i];

    if (code === 0) {
      const v = value.trim();

      if (v === 'SECTION') {
        flushEntity();
        section = null;
        // The next pair should be code 2 with the section name.
        if (i + 1 < pairs.length && pairs[i + 1].code === 2) {
          section = pairs[i + 1].value.trim();
          i += 1;
        }
        continue;
      }
      if (v === 'ENDSEC') {
        flushEntity();
        section = null;
        continue;
      }
      if (v === 'EOF') {
        flushEntity();
        break;
      }

      if (section !== 'ENTITIES') {
        // Outside the ENTITIES section we don't open entities, but we still
        // need to walk past code-0 markers so the section state machine
        // stays correct.
        continue;
      }

      if (v === 'SEQEND') {
        // Closes the open POLYLINE — flush with the accumulated vertices.
        flushEntity();
        continue;
      }
      if (v === 'VERTEX') {
        // Child of POLYLINE — collect x/y by reading ahead to the next
        // code-0, then continue (don't flush, the POLYLINE stays open).
        let vx = NaN, vy = NaN;
        let layer: string | null = null;
        let j = i + 1;
        while (j < pairs.length && pairs[j].code !== 0) {
          if (pairs[j].code === 10) vx = Number(pairs[j].value);
          else if (pairs[j].code === 20) vy = Number(pairs[j].value);
          else if (pairs[j].code === 8) layer = pairs[j].value.trim();
          j++;
        }
        if (Number.isFinite(vx) && Number.isFinite(vy)) {
          polyVertices.push([vx, vy]);
        }
        if (layer) state.layers.add(layer);
        i = j - 1; // outer loop will increment
        continue;
      }

      // Any other entity start — flush the previous, open a new one.
      flushEntity();
      entity = v;
      buf = new Map();
      polyVertices = [];
      continue;
    }

    // Non-code-0 pairs — data for the current section / entity.
    if (section === 'HEADER') {
      if (code === 9) {
        lastHeaderVar = value.trim();
      } else if (lastHeaderVar === '$EXTMIN') {
        if (code === 10) headerExtMin.x = Number(value);
        if (code === 20) headerExtMin.y = Number(value);
      } else if (lastHeaderVar === '$EXTMAX') {
        if (code === 10) headerExtMax.x = Number(value);
        if (code === 20) headerExtMax.y = Number(value);
      }
      continue;
    }

    if (section !== 'ENTITIES' || !entity) continue;

    // LWPOLYLINE: inline (x, y) pairs streamed as (10, 20).
    if (entity === 'LWPOLYLINE') {
      if (code === 10) {
        const x = Number(value);
        // Look ahead for the next 20 within this entity.
        let j = i + 1;
        while (j < pairs.length && pairs[j].code !== 20 && pairs[j].code !== 0) j++;
        if (j < pairs.length && pairs[j].code === 20) {
          const y = Number(pairs[j].value);
          if (Number.isFinite(x) && Number.isFinite(y)) {
            polyVertices.push([x, y]);
          }
        }
        continue;
      }
      if (code === 20) continue; // already consumed by the matching 10
      if (code === 8) buf.set(8, value);
      continue;
    }

    // For LINE / CIRCLE / ARC, buffer the codes we care about.
    if (code === 8) {
      buf.set(8, value);
    } else if (NUMERIC_CODES.has(code)) {
      buf.set(code, value);
    }
  }
  flushEntity();

  // Did we get a bbox from entities?
  const haveEntityBbox = Number.isFinite(state.minX) && Number.isFinite(state.minY);

  if (!haveEntityBbox) {
    // Fall back to $EXTMIN / $EXTMAX from the HEADER section.
    if (
      typeof headerExtMin.x === 'number' && typeof headerExtMin.y === 'number' &&
      typeof headerExtMax.x === 'number' && typeof headerExtMax.y === 'number' &&
      headerExtMax.x > headerExtMin.x && headerExtMax.y > headerExtMin.y
    ) {
      state.minX = headerExtMin.x;
      state.minY = headerExtMin.y;
      state.maxX = headerExtMax.x;
      state.maxY = headerExtMax.y;
    } else {
      return {
        bboxMm: { widthMm: 0, heightMm: 0, minX: 0, minY: 0 },
        totalCutLengthMm: 0,
        holeCount: 0,
        layers: [],
        outerPolygon: [],
      };
    }
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
