/**
 * Ship Packaging — pack station touch interface
 */
import React, { useRef, useState } from 'react';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { cn } from '../ui/utils';
import { ScanInput, type ScanInputHandle } from '@/components/shared/barcode/ScanInput';
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

const CURRENT_ORDER = { id: 'SH-001', customer: 'Meridian Fabrication' };

export function ShipPackaging() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [pkg, setPkg] = useState('Medium');
  const [fragile, setFragile] = useState(false);
  const [packedCount, setPackedCount] = useState(34);
  const [labelOpen, setLabelOpen] = useState(false);
  const scanRef = useRef<ScanInputHandle>(null);

  const handleScan = (value: string) => {
    const found = ITEMS.find(i => i.sku === value);
    if (found) {
      setChecked(p => new Set(p).add(found.sku));
      scanRef.current?.flash('ok');
    } else {
      scanRef.current?.flash('err');
    }
  };

  const toggle = (sku: string) => {
    setChecked(p => { const n = new Set(p); n.has(sku) ? n.delete(sku) : n.add(sku); return n; });
  };

  const handlePark = () => {
    setChecked(new Set());
    toast(`${CURRENT_ORDER.id} parked`, {
      description: 'Order returned to the pack queue — progress saved for the next packer.',
    });
  };

  const handlePrintLabel = () => {
    setLabelOpen(false);
    setChecked(new Set());
    setPackedCount((n) => n + 1);
    toast.success(`${CURRENT_ORDER.id} complete`, {
      description: `Label sent to Zebra ZD420 — Dispatch (${pkg} package).`,
    });
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
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--mw-yellow-400)] text-[10px] font-medium text-primary-foreground">MQ</span>
              Matt Quigley
            </span>
          </>
        }
        actions={
          <div className="flex items-center gap-6 text-sm text-[var(--neutral-500)]">
            <span>Packed: <span className="font-medium text-foreground tabular-nums">{packedCount}</span></span>
            <span>Orders: <span className="font-medium text-foreground tabular-nums">8</span></span>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Items column */}
        <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-[var(--neutral-200)] bg-card p-6 shadow-xs lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium tracking-tight text-foreground">SH-001</h1>
              <p className="mt-1 text-sm text-[var(--neutral-500)]">Meridian Fabrication</p>
            </div>
            <span className="text-xs tabular-nums text-[var(--neutral-500)]">
              {checked.size}/{ITEMS.length}
            </span>
          </div>

          <div className="mb-6">
            <ScanInput
              onScan={(value) => handleScan(value)}
              placeholder="Scan barcode..."
              flash
              scanRef={scanRef}
              showCamera
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
        <div className="flex min-h-0 flex-col overflow-y-auto rounded-lg border border-[var(--neutral-200)] bg-card p-6 shadow-xs lg:col-span-2">
          <p className="mb-4 text-[10px] font-medium uppercase tracking-widest text-[var(--neutral-500)]">Package</p>
          <div className="mb-6 grid grid-cols-2 gap-2">
            {PACKAGES.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setPkg(p.name)}
                className={cn(
                  'rounded-lg p-4 text-left transition-all duration-150',
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
                  className="h-12 rounded-lg border-[var(--border)] bg-card pr-10 font-medium"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--neutral-500)]">kg</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-foreground">Fragile</span>
              <Switch checked={fragile} onCheckedChange={setFragile} />
            </div>
          </div>

          <div className="rounded-lg border border-[var(--neutral-200)] bg-[var(--neutral-50)] p-4 text-xs shadow-xs">
            <p className="font-medium text-foreground">Special instructions</p>
            <p className="mt-1 text-muted-foreground">Handle with care — powder-coated finish. Use corner protectors.</p>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="flex items-center justify-between rounded-lg border border-[var(--neutral-200)] bg-card p-6 shadow-xs">
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
            onClick={handlePark}
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
            onClick={() => setLabelOpen(true)}
          >
            Complete & print label
          </Button>
        </div>
      </div>

      {/* Shipping label preview — confirm before "printing" */}
      <Dialog open={labelOpen} onOpenChange={setLabelOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Shipping label</DialogTitle>
            <DialogDescription>
              Review the label before sending it to the pack-station printer.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-[var(--neutral-300)] bg-white p-5 text-[var(--mw-mirage)] shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
                MirrorWorks
              </span>
              <span className="rounded-full border border-[var(--mw-mirage)] bg-[var(--mw-mirage)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--mw-yellow-400)]">
                Dispatch
              </span>
            </div>
            <h4 className="mt-4 text-lg font-medium leading-tight">{CURRENT_ORDER.customer}</h4>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-600)]">
              {CURRENT_ORDER.id}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--neutral-500)]">
              <div className="rounded-sm bg-[var(--neutral-100)] px-2.5 py-2">
                <div>Package</div>
                <div className="mt-0.5 text-sm font-medium normal-case tracking-normal text-[var(--mw-mirage)]">
                  {pkg}
                </div>
              </div>
              <div className="rounded-sm bg-[var(--neutral-100)] px-2.5 py-2">
                <div>Items</div>
                <div className="mt-0.5 text-sm font-medium normal-case tracking-normal text-[var(--mw-mirage)] tabular-nums">
                  {ITEMS.reduce((sum, i) => sum + i.qty, 0)}
                </div>
              </div>
              <div className="rounded-sm bg-[var(--neutral-100)] px-2.5 py-2">
                <div>Fragile</div>
                <div className="mt-0.5 text-sm font-medium normal-case tracking-normal text-[var(--mw-mirage)]">
                  {fragile ? 'Yes — corner protectors' : 'No'}
                </div>
              </div>
              <div className="rounded-sm bg-[var(--neutral-100)] px-2.5 py-2">
                <div>Printer</div>
                <div className="mt-0.5 text-sm font-medium normal-case tracking-normal text-[var(--mw-mirage)]">
                  Zebra ZD420
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-12 min-h-[48px] border-[var(--border)]"
              onClick={() => setLabelOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-12 min-h-[48px] bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
              onClick={handlePrintLabel}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print label
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
