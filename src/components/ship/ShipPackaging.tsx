/**
 * Ship Packaging — pack station touch interface
 */
import React, { useState, useRef, useEffect } from 'react';
import { ScanBarcode } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { cn } from '../ui/utils';
import { Checklist } from '@/components/shared/checklist/Checklist';
import { ChecklistItem } from '@/components/shared/checklist/ChecklistItem';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';

const ITEMS = [
  { sku: 'AL-5052-BP',  name: 'Base Plate Assembly',      qty: 2, bin: 'A-01-03' },
  { sku: 'AL-5052-SA',  name: 'Support Arm — Left',       qty: 4, bin: 'A-02-01' },
  { sku: 'HW-KIT-001',  name: 'Hardware Kit M10 SS',      qty: 2, bin: 'C-04-02' },
  { sku: 'RHS-50252',   name: 'RHS 50x25x2.5 — Cut',      qty: 6, bin: 'B-02-05' },
  { sku: 'PNT-RAL7035', name: 'Paint — Dulux RAL 7035',   qty: 1, bin: 'Paint-01' },
];

const PACKAGES = [
  { name: 'Small',  dims: '30×20×15' },
  { name: 'Medium', dims: '45×35×25' },
  { name: 'Large',  dims: '60×45×35' },
  { name: 'Pallet', dims: '120×80' },
];

export function ShipPackaging() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [scan, setScan] = useState('');
  const [flash, setFlash] = useState<'none' | 'ok' | 'err'>('none');
  const [pkg, setPkg] = useState('Medium');
  const [fragile, setFragile] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  const handleScan = () => {
    const found = ITEMS.find(i => i.sku === scan.toUpperCase());
    if (found) { setChecked(p => new Set(p).add(found.sku)); setFlash('ok'); }
    else setFlash('err');
    setTimeout(() => setFlash('none'), 500);
    setScan('');
  };

  const toggle = (sku: string) => {
    setChecked(p => { const n = new Set(p); n.has(sku) ? n.delete(sku) : n.add(sku); return n; });
  };

  const allPacked = checked.size === ITEMS.length;

  return (
    <PageShell>
      <PageHeader
        title="Packaging"
        subtitle={
          <>
            <span className="inline-flex items-center rounded-full bg-[var(--mw-mirage)] px-3 py-0.5 text-xs font-medium text-white">Pack Station 1</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--mw-yellow-400)] text-[10px] font-medium text-foreground">MQ</span>
              Matt Quigley
            </span>
          </>
        }
        actions={
          <div className="flex items-center gap-6 text-sm text-[var(--neutral-500)]">
            <span>Packed: <span className="font-medium text-foreground tabular-nums">34</span></span>
            <span>Orders: <span className="font-medium text-foreground tabular-nums">8</span></span>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Items column */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-[var(--shape-lg)] border border-[var(--neutral-200)] bg-card p-6 shadow-xs lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium tracking-tight text-foreground">SH-001</h1>
              <p className="mt-1 text-sm text-[var(--neutral-500)]">Con-form Group</p>
            </div>
            <span className="text-xs tabular-nums text-[var(--neutral-500)]">
              {checked.size}/{ITEMS.length}
            </span>
          </div>

          <div
            className={cn(
              'relative mb-6 rounded-[var(--shape-lg)] transition-all duration-150',
              flash === 'ok' && 'ring-2 ring-[var(--mw-success)]',
              flash === 'err' && 'ring-2 ring-[var(--mw-error)]',
            )}
          >
            <ScanBarcode className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--neutral-400)]" strokeWidth={1.5} />
            <Input
              ref={ref}
              value={scan}
              onChange={(e) => setScan(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder="Scan barcode..."
              className="h-14 rounded-[var(--shape-lg)] border-transparent bg-[var(--neutral-100)] pl-12"
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <Checklist
              progress={{ completed: checked.size, total: ITEMS.length }}
              className="border-0 p-0 shadow-none"
            >
              {ITEMS.map((item) => (
                <ChecklistItem
                  key={item.sku}
                  id={`pack-${item.sku}`}
                  label={item.name}
                  description={`${item.sku} · ×${item.qty} · Bin: ${item.bin}`}
                  checked={checked.has(item.sku)}
                  onToggle={() => toggle(item.sku)}
                />
              ))}
            </Checklist>
          </div>
        </div>

        {/* Package column */}
        <div className="flex min-h-0 flex-col overflow-y-auto rounded-[var(--shape-lg)] border border-[var(--neutral-200)] bg-card p-6 shadow-xs lg:col-span-2">
          <p className="mb-4 text-[10px] font-medium uppercase tracking-widest text-[var(--neutral-500)]">Package</p>
          <div className="mb-6 grid grid-cols-2 gap-2">
            {PACKAGES.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setPkg(p.name)}
                className={cn(
                  'rounded-[var(--shape-lg)] p-4 text-left transition-all duration-150',
                  pkg === p.name
                    ? 'border-2 border-[var(--mw-yellow-400)] bg-card shadow-xs ring-1 ring-[color-mix(in_srgb,var(--mw-yellow-400)_35%,transparent)]'
                    : 'border border-[var(--border)] bg-[var(--neutral-50)] hover:border-[var(--neutral-400)]',
                )}
              >
                <p className="text-sm font-medium text-foreground">{p.name}</p>
                <span
                  className={cn(
                    'text-xs',
                    pkg === p.name ? 'text-[var(--neutral-500)]' : 'text-[var(--neutral-400)]',
                  )}
                >
                  {p.dims} cm
                </span>
              </button>
            ))}
          </div>

          <div className="mb-6 space-y-4">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--neutral-500)]">Weight</span>
              <div className="relative mt-1">
                <Input
                  defaultValue="12.4"
                  className="h-12 rounded-[var(--shape-lg)] border-[var(--border)] bg-card pr-10 font-medium"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--neutral-500)]">kg</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-foreground">Fragile</span>
              <Switch checked={fragile} onCheckedChange={setFragile} />
            </div>
          </div>

          <div className="rounded-[var(--shape-lg)] border border-[var(--neutral-200)] bg-[var(--neutral-50)] p-4 text-xs shadow-xs">
            <p className="font-medium text-foreground">Special instructions</p>
            <p className="mt-1 text-muted-foreground">Handle with care — powder-coated finish. Use corner protectors.</p>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="flex items-center justify-between rounded-[var(--shape-lg)] border border-[var(--neutral-200)] bg-card p-6 shadow-xs">
        <div className="mr-6 h-1.5 max-w-xs flex-1 overflow-hidden rounded-full bg-[var(--neutral-200)]">
          <div
            className="h-full rounded-full transition-all duration-[var(--duration-medium1)] ease-[var(--ease-standard)]"
            style={{
              width: `${(checked.size / ITEMS.length) * 100}%`,
              backgroundColor: allPacked ? 'var(--mw-mirage)' : 'var(--mw-yellow-400)',
            }}
          />
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-12 min-h-[48px] border-[var(--border)] px-6 font-medium text-foreground"
          >
            Park
          </Button>
          <Button
            type="button"
            disabled={!allPacked}
            className={cn(
              'h-12 min-h-[48px] px-8 font-medium',
              allPacked
                ? 'bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]'
                : 'cursor-not-allowed bg-[var(--neutral-100)] text-[var(--neutral-400)]',
            )}
          >
            Complete & print label
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
