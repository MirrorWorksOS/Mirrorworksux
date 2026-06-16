/**
 * Data round-trip — shared contract for export → edit → re-import flows.
 *
 * An adapter flattens its domain entity into FlatRows (one CSV-able
 * record per row), and the shared engine handles serialization,
 * header mapping, diffing and the apply pipeline. Each page plugs in
 * with ~50 lines; see docs/dev/shared/data-round-trip.md.
 */

export type FlatValue = string | number | boolean | undefined;
export type FlatRow = Record<string, FlatValue>;

export interface RoundTripColumn {
  /** Key in the flat row, and the canonical CSV header on export. */
  key: string;
  label: string;
  /** Uploads missing this column (or with empty cells) are flagged. */
  required?: boolean;
  /** Cell coercion on import. Default 'string'. */
  type?: 'string' | 'number' | 'boolean';
}

export type DiffKind = 'add' | 'change' | 'remove';

export interface RowDiff<TRow extends FlatRow = FlatRow> {
  kind: DiffKind;
  /** Identity built from the adapter's keyColumns. */
  key: string;
  before?: TRow;
  after?: TRow;
  /** Column keys whose values differ (kind === 'change'). */
  changedKeys?: string[];
  /** Validation messages from adapter.validateRow for the incoming row. */
  warnings?: string[];
}

export interface ApplyResult {
  applied: number;
  skipped: { key: string; error: string }[];
}

export interface DataRoundTripAdapter<TRow extends FlatRow = FlatRow> {
  /** Stable id, e.g. 'products'. */
  entity: string;
  /** Human label for dialog copy, e.g. 'Products'. */
  entityLabel: string;
  /** Download name for exports (without extension). */
  exportFileName: string;
  columns: RoundTripColumn[];
  /** Column keys that identify a row for diffing, e.g. ['sku'] or ['sku','location_code']. */
  keyColumns: string[];
  /** Current dataset, flattened. */
  fetchRows(): Promise<TRow[]>;
  /** Per-row validation; returned messages surface as warnings in the preview. */
  validateRow?(row: TRow): string[];
  /** Apply the user-approved diffs. Only included rows reach this. */
  applyDiffs(diffs: RowDiff<TRow>[]): Promise<ApplyResult>;
  /**
   * What to do with rows that exist now but are absent from the upload.
   * 'ignore' (default): never produce remove diffs — uploads are treated
   * as upserts. 'apply': produce remove diffs for the adapter to handle.
   */
  removalPolicy?: 'ignore' | 'apply';
  /** Shown next to remove diffs, e.g. 'Zeroes the on-hand balance'. */
  removalDescription?: string;
}

/** Identity for a row, from the adapter's keyColumns (case-insensitive). */
export function rowKeyOf(row: FlatRow, keyColumns: string[]): string {
  return keyColumns.map((k) => String(row[k] ?? '').trim().toLowerCase()).join('::');
}
