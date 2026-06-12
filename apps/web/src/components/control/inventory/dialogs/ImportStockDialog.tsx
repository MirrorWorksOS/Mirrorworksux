/**
 * Import stock dialog — in-page CSV intake for opening balances and
 * mid-life bulk additions. Paste or upload CSV with columns
 * `sku, location_code, qty, unit_cost` (location_code ignored when
 * storage locations are disabled), validate per row, preview, apply.
 *
 * Works standalone; once the shared <DataRoundTrip> component lands,
 * the export → edit → re-import bulk flow plugs in alongside via
 * inventoryRoundTripAdapter.
 */
import { useMemo, useState } from 'react';
import { FileUp, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { cn } from '@/components/ui/utils';
import { parseCsvLine } from '@/lib/round-trip/csv';
import { inventoryService } from '@/services';
import type { InventorySettings, Product, StockLocation } from '@/types/entities';

interface ParsedRow {
  line: number;
  sku: string;
  location_code?: string;
  qty: number;
  unit_cost?: number;
  error?: string;
}

function parseRows(
  text: string,
  products: Product[],
  locations: StockLocation[],
  settings: InventorySettings,
): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return [];

  // Header detection — accept loose variants (Bridge-style column names).
  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/[\s-]+/g, '_'));
  const normalise = (h: string) => {
    if (/sku|part/.test(h)) return 'sku';
    if (/location|bin/.test(h)) return 'location_code';
    if (/qty|quantity|on_hand|onhand|count/.test(h)) return 'qty';
    if (/cost|price/.test(h)) return 'unit_cost';
    return h;
  };
  const cols = header.map(normalise);
  const hasHeader = cols.includes('sku') && cols.includes('qty');
  const dataLines = hasHeader ? lines.slice(1) : lines;
  // No header: assume positional sku, location_code, qty, unit_cost.
  const positional = ['sku', 'location_code', 'qty', 'unit_cost'];
  const skus = new Set(products.map((p) => (p.sku ?? p.partNumber).toLowerCase()));
  const codes = new Set(locations.map((l) => l.code.toLowerCase()));

  return dataLines.map((line, index) => {
    const cells = parseCsvLine(line);
    const get = (field: string) => {
      const colIndex = hasHeader ? cols.indexOf(field) : positional.indexOf(field);
      return colIndex >= 0 ? cells[colIndex] : undefined;
    };
    const row: ParsedRow = {
      line: index + (hasHeader ? 2 : 1),
      sku: get('sku') ?? '',
      location_code: get('location_code') || undefined,
      qty: Number(get('qty')),
      unit_cost: get('unit_cost') ? Number(get('unit_cost')) : undefined,
    };
    if (!row.sku) row.error = 'Missing SKU';
    else if (!skus.has(row.sku.toLowerCase())) row.error = `Unknown SKU "${row.sku}"`;
    else if (!Number.isFinite(row.qty) || row.qty < 0) row.error = 'Invalid quantity';
    else if (
      settings.storageLocationsEnabled &&
      row.location_code &&
      !codes.has(row.location_code.toLowerCase())
    ) row.error = `Unknown location "${row.location_code}"`;
    else if (row.unit_cost !== undefined && (!Number.isFinite(row.unit_cost) || row.unit_cost < 0)) {
      row.error = 'Invalid unit cost';
    }
    return row;
  });
}

interface ImportStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  locations: StockLocation[];
  settings: InventorySettings;
  onDone: () => void;
}

export function ImportStockDialog({
  open, onOpenChange, products, locations, settings, onDone,
}: ImportStockDialogProps) {
  const [csvText, setCsvText] = useState('');
  const [busy, setBusy] = useState(false);

  const rows = useMemo(
    () => parseRows(csvText, products, locations, settings),
    [csvText, products, locations, settings],
  );
  const validRows = rows.filter((r) => !r.error);
  const invalidRows = rows.filter((r) => r.error);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setCsvText(String(reader.result ?? ''));
    reader.readAsText(file);
  };

  const handleApply = async () => {
    if (validRows.length === 0) {
      toast.error('No valid rows to import.');
      return;
    }
    setBusy(true);
    try {
      const result = await inventoryService.importOpeningBalances(
        validRows.map((r) => ({
          sku: r.sku,
          location_code: r.location_code,
          qty: r.qty,
          unit_cost: r.unit_cost,
        })),
      );
      toast.success(
        `Imported ${result.applied} balance${result.applied !== 1 ? 's' : ''}` +
          (result.skipped.length ? ` · ${result.skipped.length} skipped` : ''),
      );
      onOpenChange(false);
      setCsvText('');
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setBusy(false);
    }
  };

  const exampleHeader = settings.storageLocationsEnabled
    ? 'sku,location_code,qty,unit_cost'
    : 'sku,qty,unit_cost';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import stock</DialogTitle>
          <DialogDescription>
            Load opening balances from CSV — columns <code className="text-xs">{exampleHeader}</code>.
            Quantities <em>replace</em> current on-hand for each SKU{settings.storageLocationsEnabled ? ' / location' : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label
              className="flex items-center gap-2 px-4 h-10 rounded-full border border-[var(--neutral-200)] dark:border-[var(--border)] text-sm cursor-pointer hover:border-[var(--neutral-400)] transition-colors"
            >
              <FileUp className="w-4 h-4" />
              Upload CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                  e.target.value = '';
                }}
              />
            </label>
            <span className="text-xs text-[var(--neutral-500)]">or paste below</span>
          </div>

          <div>
            <Label htmlFor="import-csv" className="text-sm font-medium sr-only">CSV content</Label>
            <Textarea
              id="import-csv"
              className="mt-1.5 font-mono text-xs"
              rows={6}
              placeholder={`${exampleHeader}\nBKT-001,RAW,350,9.80`}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
            />
          </div>

          {rows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <StatusBadge variant="success">{validRows.length} valid</StatusBadge>
                {invalidRows.length > 0 && (
                  <StatusBadge variant="error">{invalidRows.length} with errors (skipped)</StatusBadge>
                )}
              </div>
              <div className="max-h-[200px] overflow-y-auto rounded-md border border-[var(--neutral-200)] dark:border-[var(--border)]">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-[var(--neutral-50)] dark:bg-[var(--neutral-200)]/50">
                    <tr className="text-left text-[var(--neutral-500)]">
                      <th className="px-3 py-2 font-medium">Line</th>
                      <th className="px-3 py-2 font-medium">SKU</th>
                      {settings.storageLocationsEnabled && <th className="px-3 py-2 font-medium">Location</th>}
                      <th className="px-3 py-2 font-medium text-right">Qty</th>
                      <th className="px-3 py-2 font-medium text-right">Unit cost</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r.line}
                        className={cn(
                          'border-t border-[var(--neutral-100)] dark:border-[var(--border)]',
                          r.error && 'bg-[var(--mw-error-light)] dark:bg-[var(--mw-error)]/10',
                        )}
                      >
                        <td className="px-3 py-1.5 text-[var(--neutral-500)] tabular-nums">{r.line}</td>
                        <td className="px-3 py-1.5 font-medium text-foreground">{r.sku || '—'}</td>
                        {settings.storageLocationsEnabled && (
                          <td className="px-3 py-1.5">{r.location_code ?? 'default'}</td>
                        )}
                        <td className="px-3 py-1.5 text-right tabular-nums">{Number.isFinite(r.qty) ? r.qty : '—'}</td>
                        <td className="px-3 py-1.5 text-right tabular-nums">{r.unit_cost?.toFixed(2) ?? '—'}</td>
                        <td className="px-3 py-1.5">
                          {r.error
                            ? <span className="text-[var(--mw-error)]">{r.error}</span>
                            : <span className="text-[var(--mw-success)]">OK</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className="rounded-full gap-2 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
            onClick={handleApply}
            disabled={busy || validRows.length === 0}
          >
            <Upload className="w-4 h-4" />
            Import {validRows.length > 0 ? `${validRows.length} rows` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
