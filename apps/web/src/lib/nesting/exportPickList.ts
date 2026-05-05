// ─── Picklist + DXF export helpers for Nest detail screens ──────────
// Generates downloadable artefacts the operator carries to the machine:
//   1. Pick-list — CSV summary of parts, qty, source WOs.
//   2. Nest DXF — minimal DXF (R12 ASCII) with part bboxes labelled.
// These are placeholders for a future native CAM post-processor pipeline.

import type { Nest } from '@/types/entities';

/** Build a pick-list CSV string for a Nest. */
export function buildPickListCsv(nest: Nest): string {
  const rows: string[][] = [];
  rows.push([
    'Nest',
    'Sheet',
    'Part',
    'Qty on sheet',
    'Source WO',
    'Source qty',
    'Material',
    'Thickness mm',
    'Sheet stock',
  ]);
  for (const ns of nest.sheets) {
    for (const p of ns.placements) {
      const sourceLabels =
        p.sources.length === 0
          ? [['', '']]
          : p.sources.map((s) => [s.woNumber, String(s.qty)]);
      for (const [wo, qty] of sourceLabels) {
        rows.push([
          nest.nestNumber,
          `#${ns.sheetIndex}`,
          p.partNumber,
          String(p.qtyOnSheet),
          wo,
          qty,
          nest.material,
          String(nest.thicknessMm),
          ns.sheetStockId,
        ]);
      }
    }
  }
  return rows.map((r) => r.map(csvEscape).join(',')).join('\n') + '\n';
}

function csvEscape(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Build a minimal DXF (AutoCAD R12 ASCII) of a single nest sheet showing
 * each placement as a labelled rectangle. Real-world cut programmers swap
 * this for the actual part DXF — this is only a hand-off artefact for the
 * Nesting Studio v1 (template-for-CAM mode).
 */
export function buildSheetDxf(nest: Nest, sheetIndex: number): string {
  const sheet = nest.sheets.find((s) => s.sheetIndex === sheetIndex);
  if (!sheet) return '';
  const lines: string[] = [];
  // Header
  lines.push('0', 'SECTION', '2', 'HEADER');
  lines.push('0', 'ENDSEC');
  // Tables (minimal — just one layer named CUT)
  lines.push('0', 'SECTION', '2', 'TABLES');
  lines.push('0', 'TABLE', '2', 'LAYER', '70', '1');
  lines.push('0', 'LAYER', '2', 'CUT', '70', '0', '62', '7', '6', 'CONTINUOUS');
  lines.push('0', 'ENDTAB', '0', 'ENDSEC');
  // Entities
  lines.push('0', 'SECTION', '2', 'ENTITIES');

  for (const p of sheet.placements) {
    const x1 = p.xMm.toFixed(3);
    const y1 = p.yMm.toFixed(3);
    const x2 = (p.xMm + p.bboxMm.widthMm).toFixed(3);
    const y2 = (p.yMm + p.bboxMm.heightMm).toFixed(3);
    // Rectangle as 4 LINE entities (AutoCAD R12 doesn't have LWPOLYLINE).
    appendLine(lines, x1, y1, x2, y1);
    appendLine(lines, x2, y1, x2, y2);
    appendLine(lines, x2, y2, x1, y2);
    appendLine(lines, x1, y2, x1, y1);
    // TEXT label at part centre.
    appendText(
      lines,
      ((p.xMm + p.bboxMm.widthMm / 2)).toFixed(3),
      ((p.yMm + p.bboxMm.heightMm / 2)).toFixed(3),
      p.partNumber,
    );
  }

  lines.push('0', 'ENDSEC');
  lines.push('0', 'EOF');
  return lines.join('\n') + '\n';
}

function appendLine(lines: string[], x1: string, y1: string, x2: string, y2: string) {
  lines.push('0', 'LINE', '8', 'CUT');
  lines.push('10', x1, '20', y1, '30', '0.0');
  lines.push('11', x2, '21', y2, '31', '0.0');
}

function appendText(lines: string[], x: string, y: string, value: string) {
  lines.push('0', 'TEXT', '8', 'CUT');
  lines.push('10', x, '20', y, '30', '0.0');
  lines.push('40', '8.0'); // text height mm
  lines.push('1', value);
}

/** Browser-side download trigger for a string blob. */
export function downloadStringAsFile(content: string, filename: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Free the blob shortly after.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
