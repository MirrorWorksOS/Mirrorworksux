/**
 * Minimal CSV parse / serialize for round-trip flows.
 * Handles quoted cells (including escaped quotes); no embedded
 * newlines inside cells. XLSX is a future extension — no parser
 * dependency exists in the repo yet.
 */
import type { FlatRow, FlatValue, RoundTripColumn } from './types';

export function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else current += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { cells.push(current); current = ''; }
    else current += ch;
  }
  cells.push(current);
  return cells.map((c) => c.trim());
}

export interface ParsedCsv {
  headers: string[];
  /** Data rows as raw string cells, aligned to `headers` by index. */
  rows: string[][];
}

export function parseCsv(text: string): ParsedCsv {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = parseCsvLine(lines[0]);
  return { headers, rows: lines.slice(1).map(parseCsvLine) };
}

function escapeCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function serializeCsv(columns: RoundTripColumn[], rows: FlatRow[]): string {
  const header = columns.map((c) => c.key).join(',');
  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const value = row[c.key];
        if (value === undefined || value === null) return '';
        if (typeof value === 'number') return String(value);
        if (typeof value === 'boolean') return value ? 'true' : 'false';
        return escapeCell(String(value));
      })
      .join(','),
  );
  return [header, ...lines].join('\n');
}

/** Coerce a raw CSV cell per column type. Empty cells become undefined. */
export function coerceCell(raw: string | undefined, column: RoundTripColumn): FlatValue {
  if (raw === undefined || raw.trim() === '') return undefined;
  const value = raw.trim();
  switch (column.type) {
    case 'number': {
      const n = Number(value.replace(/[$,\s]/g, ''));
      return Number.isFinite(n) ? n : undefined;
    }
    case 'boolean':
      return /^(true|yes|y|1|active)$/i.test(value);
    default:
      return value;
  }
}

export function downloadCsv(fileName: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
