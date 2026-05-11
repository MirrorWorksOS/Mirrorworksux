// ─── Polygon-aware nester (Bottom-Left Fill + corner-point candidates) ─
// A practical step up from the bbox shelf packer. For each part we test
// true-shape collisions against everything already placed, so concave or
// slanted parts can interlock instead of reserving their full bbox.
//
// Not state-of-the-art — that would be NFP (No-Fit Polygon) à la SVGnest.
// This packer trades absolute optimum for simplicity and determinism:
//
//   1. Expand parts into individual instances (one per qty).
//   2. Sort instances by polygon area, largest first.
//   3. For each instance, generate candidate placement points from the
//      bbox corners of already-placed parts (+ the sheet origin). Sort
//      bottom-left first. Try each enabled orientation (rotation 0/90,
//      optionally mirrored). Place at the first non-colliding fit.
//   4. If nothing fits on the current sheet, start a new one.
//
// Parts without a polygon (queue items, manual rows) are packed as their
// bbox rectangle — same result as the shelf packer would give. Mixing
// polygons and rectangles works fine.

import type {
  PackOptions,
  PackPart,
  PackPlacement,
  PackResult,
  PackedSheet,
} from './rectanglePacker';

type Rot = 0 | 90 | 180 | 270;
type Polygon = [number, number][];

interface Bbox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface PlacedPoly {
  poly: Polygon;
  bbox: Bbox;
}

/* ── Geometry ──────────────────────────────────────────────────────── */

function polygonBbox(poly: Polygon): Bbox {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of poly) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}

function polygonArea(poly: Polygon): number {
  // Shoelace — sign indicates winding, magnitude is the area.
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

/**
 * Build a part-local polygon for the given orientation. The input polygon
 * lives in [0..bboxW] × [0..bboxH]. Mirror is applied first (X-flip),
 * then rotation, then translation. Output coordinates are sheet-absolute.
 */
function transformPolygon(
  poly: Polygon,
  bboxW: number,
  bboxH: number,
  rot: Rot,
  mirror: boolean,
  dx: number,
  dy: number,
): Polygon {
  const out: Polygon = new Array(poly.length);
  for (let i = 0; i < poly.length; i++) {
    let x = poly[i][0];
    let y = poly[i][1];
    if (mirror) x = bboxW - x;
    let rx = x, ry = y;
    switch (rot) {
      case 0:
        break;
      case 90:
        rx = bboxH - y; ry = x; break;
      case 180:
        rx = bboxW - x; ry = bboxH - y; break;
      case 270:
        rx = y; ry = bboxW - x; break;
    }
    out[i] = [dx + rx, dy + ry];
  }
  return out;
}

/** Rectangle polygon for a part that has no `outerPolygon`. */
function rectPolygon(w: number, h: number): Polygon {
  return [[0, 0], [w, 0], [w, h], [0, h]];
}

/** Standard 2D segment-segment intersection (proper, no shared endpoints). */
function segmentsIntersect(
  a1: [number, number],
  a2: [number, number],
  b1: [number, number],
  b2: [number, number],
): boolean {
  const d1 = (a2[0] - a1[0]) * (b1[1] - a1[1]) - (a2[1] - a1[1]) * (b1[0] - a1[0]);
  const d2 = (a2[0] - a1[0]) * (b2[1] - a1[1]) - (a2[1] - a1[1]) * (b2[0] - a1[0]);
  const d3 = (b2[0] - b1[0]) * (a1[1] - b1[1]) - (b2[1] - b1[1]) * (a1[0] - b1[0]);
  const d4 = (b2[0] - b1[0]) * (a2[1] - b1[1]) - (b2[1] - b1[1]) * (a2[0] - b1[0]);
  return (
    ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
    ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
  );
}

function pointInPolygon(p: [number, number], poly: Polygon): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    const intersect =
      yi > p[1] !== yj > p[1] &&
      p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Centroid of a polygon — used as a reliably interior test point. Picking
 * a polygon vertex doesn't work for `pointInPolygon` since boundary points
 * are ambiguous (and identical polygons would falsely report disjoint).
 */
function polygonCentroid(poly: Polygon): [number, number] {
  let sx = 0, sy = 0;
  for (const [x, y] of poly) {
    sx += x;
    sy += y;
  }
  return [sx / poly.length, sy / poly.length];
}

/**
 * Shift a point a tiny fraction of the way toward an "inward" reference
 * (typically the polygon's centroid). Used to disambiguate `pointInPolygon`
 * when the test point sits exactly on another polygon's edge — common in
 * slid-tight nests where vertices land on neighbouring edges. The shift
 * is small enough not to invent fake overlaps.
 */
function nudgeToward(p: [number, number], toward: [number, number]): [number, number] {
  const EPS = 0.001;
  return [p[0] + EPS * (toward[0] - p[0]), p[1] + EPS * (toward[1] - p[1])];
}

function polygonsOverlap(a: Polygon, aBbox: Bbox, b: Polygon, bBbox: Bbox, gapMm: number): boolean {
  // Bbox fast-reject — inflate by gapMm so we only test when actually close.
  if (aBbox.maxX + gapMm <= bBbox.minX) return false;
  if (bBbox.maxX + gapMm <= aBbox.minX) return false;
  if (aBbox.maxY + gapMm <= bBbox.minY) return false;
  if (bBbox.maxY + gapMm <= aBbox.minY) return false;

  // Edge intersection — proper crossings count as overlap. Strict inequality
  // misses T-touches (vertex landing on an edge), so the vertex-containment
  // pass below is essential, not redundant.
  for (let i = 0; i < a.length; i++) {
    const a1 = a[i];
    const a2 = a[(i + 1) % a.length];
    for (let j = 0; j < b.length; j++) {
      const b1 = b[j];
      const b2 = b[(j + 1) % b.length];
      if (segmentsIntersect(a1, a2, b1, b2)) return true;
    }
  }

  // Vertex-in-polygon — catches the cases edge-crossing misses:
  //   • Two polygons sharing a vertex / T-touching (vertex on edge),
  //   • One wholly inside the other,
  //   • Identical overlapping polygons.
  // We nudge each vertex slightly toward its own polygon's centroid so
  // boundary touches (which `pointInPolygon` reports ambiguously) don't
  // produce false positives. Real overlaps survive the nudge.
  const cA = polygonCentroid(a);
  const cB = polygonCentroid(b);
  for (const v of a) {
    if (pointInPolygon(nudgeToward(v, cA), b)) return true;
  }
  for (const v of b) {
    if (pointInPolygon(nudgeToward(v, cB), a)) return true;
  }
  return false;
}

/* ── Packer ────────────────────────────────────────────────────────── */

interface SheetCtx {
  sheetIndex: number;
  placements: PackPlacement[];
  placed: PlacedPoly[];
}

interface Orientation { rot: Rot; mirror: boolean; }

function orientationsFor(part: PackPart): Orientation[] {
  const orients: Orientation[] = [{ rot: 0, mirror: false }];
  if (part.allowRotation) {
    orients.push({ rot: 90, mirror: false });
    orients.push({ rot: 180, mirror: false });
    orients.push({ rot: 270, mirror: false });
  }
  if (part.allowMirror) {
    orients.push({ rot: 0, mirror: true });
    if (part.allowRotation) {
      orients.push({ rot: 90, mirror: true });
      orients.push({ rot: 180, mirror: true });
      orients.push({ rot: 270, mirror: true });
    }
  }
  return orients;
}

/**
 * Build candidate placement points for the next part. We anchor on:
 *   1. The sheet origin (edge-gap inset).
 *   2. The right-edge and top-edge of every placed part's bbox — gives
 *      "stack to the right" and "stack on top" candidates that mirror
 *      the rectangle packer.
 *   3. Every vertex of every placed polygon. These are what let a
 *      mirrored part nestle into the slant of an adjacent one — the
 *      interlocking case that bbox-only candidates can't reach.
 * Sorted by (y, x) so the lowest fit always wins, deduped to keep the
 * candidate set manageable.
 */
function candidatePoints(sheet: SheetCtx, edgeGap: number, partGap: number): Array<[number, number]> {
  const seen = new Set<string>();
  const out: Array<[number, number]> = [];
  const push = (x: number, y: number) => {
    if (x < edgeGap) x = edgeGap;
    if (y < edgeGap) y = edgeGap;
    const key = `${Math.round(x * 10)}:${Math.round(y * 10)}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push([x, y]);
  };
  push(edgeGap, edgeGap);
  for (const placed of sheet.placed) {
    const b = placed.bbox;
    // Bbox corners — the classic rectangle-packer candidates.
    push(b.maxX + partGap, b.minY);
    push(b.minX, b.maxY + partGap);
    push(b.maxX + partGap, b.maxY + partGap);
    push(edgeGap, b.maxY + partGap);
    // Polygon-vertex candidates. We offset each by ±partGap to nudge the
    // candidate out of the placed shape; the collision test rejects any
    // that don't actually fit.
    for (const [vx, vy] of placed.poly) {
      push(vx + partGap, vy);
      push(vx, vy + partGap);
    }
  }
  out.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  return out;
}

/**
 * Try to place a part on the given sheet. Returns the chosen placement or
 * null if nothing fits.
 */
function tryPlace(
  partIndex: number,
  part: PackPart,
  sheet: SheetCtx,
  sheetW: number,
  sheetH: number,
  edgeGap: number,
  partGap: number,
): { placement: PackPlacement; placed: PlacedPoly } | null {
  const polyLocal: Polygon = part.outerPolygon && part.outerPolygon.length >= 3
    ? part.outerPolygon
    : rectPolygon(part.widthMm, part.heightMm);
  const orientations = orientationsFor(part);
  const candidates = candidatePoints(sheet, edgeGap, partGap);

  // BLF picks the first orientation × first candidate that fits, sorted by
  // (y, x). We iterate candidates outermost so the "lowest" placement wins
  // regardless of how many orientations a part has.
  for (const [cx, cy] of candidates) {
    for (const o of orientations) {
      const isQuarter = o.rot === 90 || o.rot === 270;
      const bboxW = isQuarter ? part.heightMm : part.widthMm;
      const bboxH = isQuarter ? part.widthMm : part.heightMm;
      // Reject if the bbox would clip the sheet (cheaper than building the polygon).
      if (cx + bboxW > sheetW - edgeGap) continue;
      if (cy + bboxH > sheetH - edgeGap) continue;

      const transformed = transformPolygon(polyLocal, part.widthMm, part.heightMm, o.rot, o.mirror, cx, cy);
      const tBbox = polygonBbox(transformed);

      let collides = false;
      for (const other of sheet.placed) {
        if (polygonsOverlap(transformed, tBbox, other.poly, other.bbox, partGap)) {
          collides = true;
          break;
        }
      }
      if (collides) continue;

      // Slide-left: nudge the placement towards the sheet's left edge in
      // small steps while it still fits. This is what lets a polygon
      // (especially a mirrored one) slot into the dead-corner wedge that
      // a previous part's slanted edge leaves behind. Without it, the
      // packer only ever places parts at bbox-corner candidates and can't
      // exploit non-axis-aligned geometry.
      const SLIDE_STEP = 5;
      let bestX = cx;
      let bestPoly = transformed;
      let bestBbox = tBbox;
      while (bestX - SLIDE_STEP >= edgeGap) {
        const tryX = bestX - SLIDE_STEP;
        const dxStep = tryX - bestX;
        const slidPoly: Polygon = bestPoly.map(([px, py]) => [px + dxStep, py]);
        const slidBbox: Bbox = {
          minX: bestBbox.minX + dxStep,
          maxX: bestBbox.maxX + dxStep,
          minY: bestBbox.minY,
          maxY: bestBbox.maxY,
        };
        let slidCollides = false;
        for (const other of sheet.placed) {
          if (polygonsOverlap(slidPoly, slidBbox, other.poly, other.bbox, partGap)) {
            slidCollides = true;
            break;
          }
        }
        if (slidCollides) break;
        bestX = tryX;
        bestPoly = slidPoly;
        bestBbox = slidBbox;
      }

      const placement: PackPlacement = {
        partId: part.id,
        partIndex,
        xMm: bestX,
        yMm: cy,
        widthMm: bboxW,
        heightMm: bboxH,
        rotationDeg: o.rot,
        mirror: o.mirror,
      };
      return { placement, placed: { poly: bestPoly, bbox: bestBbox } };
    }
  }
  return null;
}

export function packPolygons(parts: PackPart[], opts: PackOptions): PackResult {
  const sheetArea = opts.sheetWidthMm * opts.sheetHeightMm;
  const maxSheets = opts.maxSheets ?? 50;

  // Expand by qty into placement instances, retaining the input partIndex
  // so callers can reconcile placements back to their row.
  interface Instance { partIndex: number; part: PackPart; area: number; }
  const instances: Instance[] = [];
  for (let pi = 0; pi < parts.length; pi++) {
    const p = parts[pi];
    const poly = p.outerPolygon && p.outerPolygon.length >= 3 ? p.outerPolygon : rectPolygon(p.widthMm, p.heightMm);
    const area = polygonArea(poly);
    for (let q = 0; q < p.qty; q++) instances.push({ partIndex: pi, part: p, area });
  }
  // Largest first — standard nesting heuristic.
  instances.sort((a, b) => b.area - a.area);

  const sheets: PackedSheet[] = [];
  const unplaced: PackResult['unplaced'] = [];

  let current: SheetCtx = { sheetIndex: 1, placements: [], placed: [] };
  let currentUsedArea = 0;

  const finalize = () => {
    if (current.placements.length === 0) return;
    const yieldPercent = Math.round((currentUsedArea / sheetArea) * 1000) / 10;
    sheets.push({
      sheetIndex: current.sheetIndex,
      placements: current.placements,
      usedAreaMm2: currentUsedArea,
      yieldPercent,
    });
  };

  for (const inst of instances) {
    let placed = tryPlace(
      inst.partIndex,
      inst.part,
      current,
      opts.sheetWidthMm,
      opts.sheetHeightMm,
      opts.edgeGapMm,
      opts.partGapMm,
    );

    if (!placed && current.placements.length > 0) {
      // Current sheet is full enough — start a new one.
      finalize();
      if (sheets.length >= maxSheets) {
        unplaced.push({ partId: inst.part.id, partIndex: inst.partIndex, reason: 'max sheets reached' });
        continue;
      }
      current = { sheetIndex: sheets.length + 1, placements: [], placed: [] };
      currentUsedArea = 0;
      placed = tryPlace(
        inst.partIndex,
        inst.part,
        current,
        opts.sheetWidthMm,
        opts.sheetHeightMm,
        opts.edgeGapMm,
        opts.partGapMm,
      );
    }

    if (!placed) {
      unplaced.push({
        partId: inst.part.id,
        partIndex: inst.partIndex,
        reason: 'part exceeds sheet usable area',
      });
      continue;
    }

    current.placements.push(placed.placement);
    current.placed.push(placed.placed);
    currentUsedArea += inst.area;
  }
  finalize();

  return { sheets, unplaced };
}
