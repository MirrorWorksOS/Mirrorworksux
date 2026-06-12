/**
 * Products adapter for <DataRoundTrip> — the reference integration.
 * Flattens the Product master to CSV-able rows keyed on part_number;
 * removals mark the product inactive rather than deleting it.
 */
import { controlService } from '@/services';
import type { DataRoundTripAdapter, FlatRow, RowDiff } from '@/lib/round-trip';

export interface ProductRow extends FlatRow {
  part_number: string;
  description: string;
  category?: string;
  material?: string;
  unit_price?: number;
  standard_cost?: number;
  weight_kg?: number;
  is_active?: boolean;
}

function toDomainPatch(row: ProductRow) {
  return {
    description: row.description,
    category: row.category ?? '',
    material: row.material ?? '',
    unitPrice: row.unit_price ?? 0,
    standardCost: row.standard_cost,
    weightKg: row.weight_kg ?? 0,
    isActive: row.is_active ?? true,
  };
}

export const productsRoundTripAdapter: DataRoundTripAdapter<ProductRow> = {
  entity: 'products',
  entityLabel: 'Products',
  exportFileName: 'product-master',
  keyColumns: ['part_number'],
  removalPolicy: 'apply',
  removalDescription: 'Marks the product inactive (never deleted)',

  columns: [
    { key: 'part_number', label: 'Part number', required: true },
    { key: 'description', label: 'Description', required: true },
    { key: 'category', label: 'Category' },
    { key: 'material', label: 'Material' },
    { key: 'unit_price', label: 'Unit price', type: 'number' },
    { key: 'standard_cost', label: 'Standard cost', type: 'number' },
    { key: 'weight_kg', label: 'Weight (kg)', type: 'number' },
    { key: 'is_active', label: 'Active', type: 'boolean' },
  ],

  async fetchRows() {
    const products = await controlService.getProducts();
    return products.map((p) => ({
      part_number: p.partNumber,
      description: p.description,
      category: p.category,
      material: p.material,
      unit_price: p.unitPrice,
      standard_cost: p.standardCost,
      weight_kg: p.weightKg,
      is_active: p.isActive,
    }));
  },

  validateRow(row) {
    const warnings: string[] = [];
    if (row.unit_price !== undefined && row.unit_price < 0) warnings.push('Unit price cannot be negative');
    if (row.standard_cost !== undefined && row.standard_cost < 0) warnings.push('Standard cost cannot be negative');
    if (row.weight_kg !== undefined && row.weight_kg < 0) warnings.push('Weight cannot be negative');
    return warnings;
  },

  async applyDiffs(diffs: RowDiff<ProductRow>[]) {
    const products = await controlService.getProducts();
    const byPartNumber = new Map(products.map((p) => [p.partNumber.toLowerCase(), p]));
    const skipped: { key: string; error: string }[] = [];
    let applied = 0;
    for (const diff of diffs) {
      try {
        if (diff.kind === 'add' && diff.after) {
          await controlService.createProduct({
            partNumber: diff.after.part_number,
            ...toDomainPatch(diff.after),
          });
        } else if (diff.kind === 'change' && diff.after) {
          const existing = byPartNumber.get(diff.after.part_number.toLowerCase());
          if (!existing) throw new Error('Product disappeared during edit');
          await controlService.updateProduct(existing.id, toDomainPatch(diff.after));
        } else if (diff.kind === 'remove' && diff.before) {
          const existing = byPartNumber.get(diff.before.part_number.toLowerCase());
          if (existing) await controlService.updateProduct(existing.id, { isActive: false });
        }
        applied += 1;
      } catch (error) {
        skipped.push({ key: diff.key, error: error instanceof Error ? error.message : 'Apply failed' });
      }
    }
    return { applied, skipped };
  },
};
