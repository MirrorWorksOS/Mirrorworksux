// ─── Rectangle nesting (shelf packer + tight-nest variant) ────────────
// Pure deterministic packer used by the Nesting Studio. Not a true 2D
// nest — handles axis-aligned rectangles only. v2 will plug an irregular
// (polygon) solver behind a flag.
//
// Two functions exported:
//   - packRectangles: FFDH (First-Fit Decreasing Height) shelf packer.
//     Fast, deterministic, good baseline.
//   - packTight: Multi-strategy packer that runs FFDH + BFDH (Best-Fit
//     Decreasing Height) under several sort orders and returns the result
//     with the fewest sheets / highest yield. Slower but tighter — opt-in
//     via the Studio's "Tight nest" toggle.

export interface PackPart {
  /** Stable id used by the caller to reconcile placements. */
  id: string;
  widthMm: number;
  heightMm: number;
  qty: number;
  /** When false, only the supplied W×H orientation is considered. */
  allowRotation: boolean;
  /**
   * When true, the polygon nester may mirror the part (X-flip) to improve
   * yield. The rectangle packer ignores this — bbox is identical mirrored
   * or not — but it's plumbed through so polygon nesting can use it.
   */
  allowMirror?: boolean;
  /**
   * Outer contour in part-local coords [0..widthMm] × [0..heightMm]. Used
   * only by the polygon packer for true-shape collision tests. The
   * rectangle packers ignore it.
   */
  outerPolygon?: [number, number][];
}

export interface PackPlacement {
  partId: string;
  /** Index into the input array — identifies which part this placement is for. */
  partIndex: number;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  rotationDeg: 0 | 90 | 180 | 270;
  /**
   * True when the polygon packer flipped the part along its X axis to fit.
   * Always false for rectangle packers.
   */
  mirror?: boolean;
}

export interface PackedSheet {
  sheetIndex: number;
  placements: PackPlacement[];
  usedAreaMm2: number;
  yieldPercent: number;
}

export interface PackResult {
  sheets: PackedSheet[];
  /** Parts that did not fit on any sheet because they exceed the usable area. */
  unplaced: { partId: string; partIndex: number; reason: string }[];
}

export interface PackOptions {
  sheetWidthMm: number;
  sheetHeightMm: number;
  /** Gap between adjacent placements. */
  partGapMm: number;
  /** Margin from sheet edge. */
  edgeGapMm: number;
  /** Hard cap to avoid runaway sheet creation when inputs are degenerate. */
  maxSheets?: number;
}

interface Shelf {
  yMm: number;
  heightMm: number;
  /** Rightmost edge currently occupied. */
  cursorX: number;
  placements: PackPlacement[];
}

interface SheetCtx {
  sheetIndex: number;
  shelves: Shelf[];
  /** Top edge of the highest open shelf — anything above is unused. */
  topY: number;
  usedArea: number;
}

/** Sort strategy used to seed the FFDH/BFDH inner loop. */
type SortStrategy = 'max-dim-desc' | 'area-desc' | 'width-desc' | 'height-desc';

/** Shelf-selection strategy. */
type ShelfStrategy = 'first-fit' | 'best-fit';

interface PackInternal {
  sortStrategy: SortStrategy;
  shelfStrategy: ShelfStrategy;
}

function compareForStrategy(a: PackPart, b: PackPart, s: SortStrategy): number {
  switch (s) {
    case 'max-dim-desc': {
      const ah = Math.max(a.widthMm, a.heightMm);
      const bh = Math.max(b.widthMm, b.heightMm);
      return bh - ah;
    }
    case 'area-desc':
      return b.widthMm * b.heightMm - a.widthMm * a.heightMm;
    case 'width-desc':
      return b.widthMm - a.widthMm;
    case 'height-desc':
      return b.heightMm - a.heightMm;
  }
}

/**
 * Pack rectangular parts onto one or more sheets.
 * Deterministic — same input always produces the same output.
 *
 * Default strategy: FFDH with max-dim-desc sort. This is the fast baseline.
 * For tight-nest mode use `packTight` which runs multiple strategies and
 * picks the best.
 */
export function packRectangles(parts: PackPart[], opts: PackOptions): PackResult {
  return packWithStrategy(parts, opts, {
    sortStrategy: 'max-dim-desc',
    shelfStrategy: 'first-fit',
  });
}

/**
 * Tight-nest mode — runs the inner packer under several sort × shelf
 * strategies and returns the result with the fewest sheets / highest yield.
 * Cost: ~8× slower than `packRectangles`. Worth it on jobs where yield
 * matters more than determinism, behind the Studio's "Tight nest" toggle.
 */
export function packTight(parts: PackPart[], opts: PackOptions): PackResult {
  const sorts: SortStrategy[] = ['max-dim-desc', 'area-desc', 'width-desc', 'height-desc'];
  const shelves: ShelfStrategy[] = ['first-fit', 'best-fit'];
  const results: PackResult[] = [];
  for (const sortStrategy of sorts) {
    for (const shelfStrategy of shelves) {
      results.push(packWithStrategy(parts, opts, { sortStrategy, shelfStrategy }));
    }
  }
  results.sort((a, b) => {
    if (a.sheets.length !== b.sheets.length) return a.sheets.length - b.sheets.length;
    if (a.unplaced.length !== b.unplaced.length) return a.unplaced.length - b.unplaced.length;
    const aYield = avgYieldPercent(a);
    const bYield = avgYieldPercent(b);
    return bYield - aYield;
  });
  return results[0];
}

function avgYieldPercent(r: PackResult): number {
  if (r.sheets.length === 0) return 0;
  return r.sheets.reduce((s, sh) => s + sh.yieldPercent, 0) / r.sheets.length;
}

function packWithStrategy(
  parts: PackPart[],
  opts: PackOptions,
  cfg: PackInternal,
): PackResult {
  const {
    sheetWidthMm,
    sheetHeightMm,
    partGapMm,
    edgeGapMm,
    maxSheets = 50,
  } = opts;

  const usableW = sheetWidthMm - edgeGapMm * 2;
  const usableH = sheetHeightMm - edgeGapMm * 2;
  const sheetArea = sheetWidthMm * sheetHeightMm;

  // Expand qty into individual placement candidates, then sort by strategy.
  const queue: { part: PackPart; partIndex: number }[] = [];
  parts.forEach((part, idx) => {
    for (let i = 0; i < part.qty; i++) queue.push({ part, partIndex: idx });
  });

  queue.sort((a, b) => compareForStrategy(a.part, b.part, cfg.sortStrategy));

  const sheets: SheetCtx[] = [];
  const unplaced: PackResult['unplaced'] = [];

  function newSheet(): SheetCtx {
    const ctx: SheetCtx = {
      sheetIndex: sheets.length + 1,
      shelves: [],
      topY: edgeGapMm,
      usedArea: 0,
    };
    sheets.push(ctx);
    return ctx;
  }

  for (const { part, partIndex } of queue) {
    // Candidate orientations.
    const candidates: { w: number; h: number; rot: 0 | 90 }[] = [
      { w: part.widthMm, h: part.heightMm, rot: 0 },
    ];
    if (part.allowRotation && part.widthMm !== part.heightMm) {
      candidates.push({ w: part.heightMm, h: part.widthMm, rot: 90 });
    }

    // Reject anything that can't fit even in isolation on a fresh sheet.
    const fitsAtAll = candidates.some((c) => c.w <= usableW && c.h <= usableH);
    if (!fitsAtAll) {
      unplaced.push({
        partId: part.id,
        partIndex,
        reason: `Part ${part.widthMm}×${part.heightMm} exceeds usable sheet ${usableW}×${usableH}.`,
      });
      continue;
    }

    let placed = false;

    if (cfg.shelfStrategy === 'first-fit') {
      // FFDH — first shelf that fits wins.
      outer: for (const sheet of sheets) {
        for (const shelf of sheet.shelves) {
          for (const cand of candidates) {
            if (cand.h > shelf.heightMm) continue;
            const x = shelf.cursorX + (shelf.placements.length === 0 ? 0 : partGapMm);
            if (x + cand.w > edgeGapMm + usableW) continue;
            shelf.placements.push({
              partId: part.id,
              partIndex,
              xMm: x,
              yMm: shelf.yMm,
              widthMm: cand.w,
              heightMm: cand.h,
              rotationDeg: cand.rot,
            });
            shelf.cursorX = x + cand.w;
            sheet.usedArea += cand.w * cand.h;
            placed = true;
            break outer;
          }
        }
      }
    } else {
      // BFDH — pick the shelf with the LEAST horizontal slack that still
      // fits, biasing toward tighter packing at the cost of more compute.
      let best: {
        sheet: SheetCtx;
        shelf: Shelf;
        cand: { w: number; h: number; rot: 0 | 90 };
        x: number;
        slack: number;
      } | null = null;
      for (const sheet of sheets) {
        for (const shelf of sheet.shelves) {
          for (const cand of candidates) {
            if (cand.h > shelf.heightMm) continue;
            const x = shelf.cursorX + (shelf.placements.length === 0 ? 0 : partGapMm);
            if (x + cand.w > edgeGapMm + usableW) continue;
            const slack = (edgeGapMm + usableW) - (x + cand.w);
            if (!best || slack < best.slack) {
              best = { sheet, shelf, cand, x, slack };
            }
          }
        }
      }
      if (best) {
        best.shelf.placements.push({
          partId: part.id,
          partIndex,
          xMm: best.x,
          yMm: best.shelf.yMm,
          widthMm: best.cand.w,
          heightMm: best.cand.h,
          rotationDeg: best.cand.rot,
        });
        best.shelf.cursorX = best.x + best.cand.w;
        best.sheet.usedArea += best.cand.w * best.cand.h;
        placed = true;
      }
    }

    if (placed) continue;

    // Open a new shelf on an existing sheet (cheaper than a new sheet).
    for (const sheet of sheets) {
      // Try the orientation that minimises shelf height.
      const cand = candidates.slice().sort((a, b) => a.h - b.h)[0];
      const newShelfTop = sheet.topY + (sheet.shelves.length === 0 ? 0 : partGapMm);
      if (newShelfTop + cand.h > edgeGapMm + usableH) continue;
      if (cand.w > usableW) continue;

      const shelf: Shelf = {
        yMm: newShelfTop,
        heightMm: cand.h,
        cursorX: edgeGapMm + cand.w,
        placements: [
          {
            partId: part.id,
            partIndex,
            xMm: edgeGapMm,
            yMm: newShelfTop,
            widthMm: cand.w,
            heightMm: cand.h,
            rotationDeg: cand.rot,
          },
        ],
      };
      sheet.shelves.push(shelf);
      sheet.topY = newShelfTop + cand.h;
      sheet.usedArea += cand.w * cand.h;
      placed = true;
      break;
    }

    if (placed) continue;

    // Otherwise start a new sheet.
    if (sheets.length >= maxSheets) {
      unplaced.push({
        partId: part.id,
        partIndex,
        reason: `Reached max sheet cap (${maxSheets}).`,
      });
      continue;
    }
    const ctx = newSheet();
    const cand = candidates.slice().sort((a, b) => a.h - b.h)[0];
    const shelf: Shelf = {
      yMm: edgeGapMm,
      heightMm: cand.h,
      cursorX: edgeGapMm + cand.w,
      placements: [
        {
          partId: part.id,
          partIndex,
          xMm: edgeGapMm,
          yMm: edgeGapMm,
          widthMm: cand.w,
          heightMm: cand.h,
          rotationDeg: cand.rot,
        },
      ],
    };
    ctx.shelves.push(shelf);
    ctx.topY = edgeGapMm + cand.h;
    ctx.usedArea = cand.w * cand.h;
  }

  // Flatten + compute yield.
  const packedSheets: PackedSheet[] = sheets.map((s) => {
    const placements = s.shelves.flatMap((sh) => sh.placements);
    return {
      sheetIndex: s.sheetIndex,
      placements,
      usedAreaMm2: s.usedArea,
      yieldPercent: sheetArea > 0 ? Math.round((s.usedArea / sheetArea) * 1000) / 10 : 0,
    };
  });

  return { sheets: packedSheets, unplaced };
}
