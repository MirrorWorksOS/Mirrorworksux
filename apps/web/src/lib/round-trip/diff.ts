/**
 * Round-trip diff engine — build incoming rows from a parsed upload +
 * confirmed mapping, then diff against the adapter's current dataset.
 */
import { coerceCell, type ParsedCsv } from './csv';
import type { HeaderMapping } from './mapping';
import {
  rowKeyOf,
  type DataRoundTripAdapter,
  type FlatRow,
  type RowDiff,
} from './types';

/** Apply the confirmed mapping to raw CSV rows, coercing per column type. */
export function buildIncomingRows<TRow extends FlatRow>(
  parsed: ParsedCsv,
  mappings: HeaderMapping[],
  adapter: DataRoundTripAdapter<TRow>,
): TRow[] {
  const columnByKey = new Map(adapter.columns.map((c) => [c.key, c]));
  return parsed.rows.map((cells) => {
    const row: FlatRow = {};
    for (const mapping of mappings) {
      if (!mapping.targetKey) continue;
      const column = columnByKey.get(mapping.targetKey);
      if (!column) continue;
      row[mapping.targetKey] = coerceCell(cells[mapping.headerIndex], column);
    }
    return row as TRow;
  });
}

/** Structural validation shared by every adapter (before adapter.validateRow). */
function baseWarnings<TRow extends FlatRow>(
  row: TRow,
  adapter: DataRoundTripAdapter<TRow>,
): string[] {
  const warnings: string[] = [];
  for (const column of adapter.columns) {
    if (column.required && (row[column.key] === undefined || row[column.key] === '')) {
      warnings.push(`Missing required "${column.label}"`);
    }
  }
  return warnings;
}

export interface DiffResult<TRow extends FlatRow> {
  diffs: RowDiff<TRow>[];
  /** Incoming rows that collided on identity (later row wins; earlier reported). */
  duplicateKeys: string[];
}

export function computeDiffs<TRow extends FlatRow>(
  current: TRow[],
  incoming: TRow[],
  adapter: DataRoundTripAdapter<TRow>,
): DiffResult<TRow> {
  const { keyColumns } = adapter;
  const currentByKey = new Map(current.map((r) => [rowKeyOf(r, keyColumns), r]));

  const incomingByKey = new Map<string, TRow>();
  const duplicateKeys: string[] = [];
  for (const row of incoming) {
    const key = rowKeyOf(row, keyColumns);
    if (incomingByKey.has(key)) duplicateKeys.push(key);
    incomingByKey.set(key, row);
  }

  const diffs: RowDiff<TRow>[] = [];
  const comparableKeys = adapter.columns.map((c) => c.key);

  for (const [key, after] of incomingByKey) {
    const warnings = [
      ...baseWarnings(after, adapter),
      ...(adapter.validateRow?.(after) ?? []),
    ];
    const before = currentByKey.get(key);
    if (!before) {
      diffs.push({ kind: 'add', key, after, warnings });
      continue;
    }
    const changedKeys = comparableKeys.filter((k) => {
      const incomingValue = after[k];
      // Columns absent from the upload (unmapped) are left untouched,
      // not treated as cleared.
      if (incomingValue === undefined) return false;
      return incomingValue !== before[k];
    });
    if (changedKeys.length > 0) {
      diffs.push({ kind: 'change', key, before, after, changedKeys, warnings });
    }
  }

  if (adapter.removalPolicy === 'apply') {
    for (const [key, before] of currentByKey) {
      if (!incomingByKey.has(key)) diffs.push({ kind: 'remove', key, before });
    }
  }

  return { diffs, duplicateKeys };
}
