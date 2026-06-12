/**
 * Inventory adapter for the shared <DataRoundTrip> export → edit →
 * re-import flow. Rows are opening balances keyed on sku + location;
 * applying writes through inventoryService.importOpeningBalances so
 * every change lands as an auditable `adjust` movement. Removals
 * (rows deleted from the spreadsheet) zero the balance rather than
 * deleting the record.
 */
import { inventoryService } from '@/services';
import type { DataRoundTripAdapter, FlatRow, RowDiff } from '@/lib/round-trip';

export interface OpeningBalanceRow extends FlatRow {
  sku: string;
  location_code?: string;
  qty: number;
  unit_cost?: number;
}

export const inventoryRoundTripAdapter: DataRoundTripAdapter<OpeningBalanceRow> = {
  entity: 'inventory',
  entityLabel: 'Inventory balances',
  exportFileName: 'inventory-ledger',
  keyColumns: ['sku', 'location_code'],
  removalPolicy: 'apply',
  removalDescription: 'Zeroes the on-hand balance (recorded as an adjustment)',

  columns: [
    { key: 'sku', label: 'SKU', required: true },
    { key: 'location_code', label: 'Location code' },
    { key: 'qty', label: 'Quantity', required: true, type: 'number' },
    { key: 'unit_cost', label: 'Unit cost', type: 'number' },
  ],

  async fetchRows() {
    const ledger = await inventoryService.listLedger();
    return ledger.map((row) => ({
      sku: row.product.sku ?? row.product.partNumber,
      location_code: row.location?.code,
      qty: row.qtyOnHand,
      unit_cost: row.unitCost,
    }));
  },

  validateRow(row) {
    const warnings: string[] = [];
    if (row.qty !== undefined && row.qty < 0) warnings.push('Quantity cannot be negative');
    if (row.unit_cost !== undefined && row.unit_cost < 0) warnings.push('Unit cost cannot be negative');
    return warnings;
  },

  async applyDiffs(diffs: RowDiff<OpeningBalanceRow>[]) {
    const rows = diffs.map((diff) =>
      diff.kind === 'remove'
        ? { ...diff.before!, qty: 0 }
        : diff.after!,
    );
    const result = await inventoryService.importOpeningBalances(
      rows.map((r) => ({
        sku: r.sku,
        location_code: r.location_code,
        qty: r.qty,
        unit_cost: r.unit_cost,
      })),
    );
    return {
      applied: result.applied,
      skipped: result.skipped.map((s) => ({ key: `row ${s.row}`, error: s.error })),
    };
  },
};
