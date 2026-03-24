/**
 * Ship Packaging — pack station touch interface
 * Token-aligned: #141414 → var(--neutral-900), #F0F0F0 → var(--neutral-200), #8A8A8A → var(--neutral-500)
 */
import React, { useState, useRef, useEffect } from 'react';
import { ScanBarcode } from 'lucide-react';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { cn } from '../ui/utils';
import { Checklist } from '@/components/shared/checklist/Checklist';
import { ChecklistItem } from '@/components/shared/checklist/ChecklistItem';

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
  const [scan, setScan]       = useState('');
  const [flash, setFlash]     = useState<'none' | 'ok' | 'err'>('none');
  const [pkg, setPkg]         = useState('Medium');
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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Station Bar — intentional dark header for pack-station context */}
      <div className="bg-[var(--mw-mirage)] text-white px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-[var(--mw-yellow-400)] flex items-center justify-center text-[var(--mw-mirage)] text-xs font-medium">
            MQ
          </div>
          <div>
            <p className="text-sm font-medium">Pack Station 1</p>
            <p className="text-xs text-[var(--neutral-500)]">Matt Quigley</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs text-[var(--neutral-500)]">
          <span>Packed: <span className="text-white ">34</span></span>
          <span>Orders: <span className="text-white ">8</span></span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-0 overflow-hidden">
        {/* Left — Items */}
        <div className="lg:col-span-3 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-[var(--mw-mirage)]  font-medium text-lg">SH-001</h4>
              <p className="text-xs text-[var(--neutral-500)] mt-1">Con-form Group</p>
            </div>
            <span className="text-xs text-[var(--neutral-500)] ">{checked.size}/{ITEMS.length}</span>
          </div>

          {/* Scanner */}
          <div className={cn(
            'relative mb-6 rounded-[var(--shape-lg)] transition-all duration-150',
            flash === 'ok' && 'ring-2 ring-[var(--mw-success)]',
            flash === 'err' && 'ring-2 ring-[var(--mw-error)]'
          )}>
            <ScanBarcode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--neutral-400)]" strokeWidth={1.5} />
            <Input
              ref={ref}
              value={scan}
              onChange={e => setScan(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
              placeholder="Scan barcode..."
              className="pl-12 h-14 bg-[var(--neutral-100)] border-transparent rounded-[var(--shape-lg)] "
            />
          </div>

          {/* Checklist */}
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

        {/* Right — Package */}
        <div className="lg:col-span-2 p-6 overflow-y-auto border-l border-[var(--border)] bg-[var(--neutral-100)]">
          <p className="text-[10px] text-[var(--neutral-500)] tracking-widest uppercase mb-4 font-medium">Package</p>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {PACKAGES.map(p => (
              <button
                key={p.name}
                onClick={() => setPkg(p.name)}
                className={cn(
                  'p-4 rounded-[var(--shape-lg)] text-left transition-all duration-150',
                  pkg === p.name
                    ? 'bg-[var(--mw-mirage)] text-white'
                    : 'bg-white border border-[var(--border)] hover:border-[var(--neutral-400)]'
                )}
              >
                <p className="text-sm font-medium">{p.name}</p>
                <span className={cn('text-xs', pkg === p.name ? 'text-[var(--neutral-500)]' : 'text-[var(--neutral-400)]')}>{p.dims} cm</span>
              </button>
            ))}
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <span className="text-[10px] text-[var(--neutral-500)] tracking-widest uppercase font-medium">Weight</span>
              <div className="relative mt-1">
                <Input
                  defaultValue="12.4"
                  className="h-12 bg-white border-[var(--border)] rounded-[var(--shape-lg)] pr-10  font-medium"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--neutral-500)]">kg</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[var(--mw-mirage)]">Fragile</span>
              <Switch checked={fragile} onCheckedChange={setFragile} />
            </div>
          </div>

          <div className="rounded-[var(--shape-lg)] border border-[var(--neutral-200)] bg-white p-4 text-xs shadow-xs">
            <p className="font-medium text-[var(--mw-mirage)]">Special instructions</p>
            <p className="mt-1 text-muted-foreground">Handle with care — powder-coated finish. Use corner protectors.</p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-white border-t border-[var(--border)] px-6 py-4 flex items-center justify-between shrink-0">
        <div className="h-1.5 bg-[var(--neutral-200)] rounded-full flex-1 max-w-xs overflow-hidden mr-6">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(checked.size / ITEMS.length) * 100}%`,
              backgroundColor: checked.size === ITEMS.length ? 'var(--mw-success)' : 'var(--mw-yellow-400)',
            }}
          />
        </div>
        <div className="flex gap-3">
          <button className="h-12 px-6 rounded-[var(--shape-lg)] text-sm border border-[var(--border)] text-[var(--mw-mirage)] hover:bg-[var(--neutral-100)] transition-colors font-medium">
            Park
          </button>
          <button
            className={cn(
              'h-12 px-8 rounded-[var(--shape-lg)] text-sm transition-all font-medium',
              checked.size === ITEMS.length
                ? 'bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--mw-mirage)]'
                : 'bg-[var(--neutral-100)] text-[var(--neutral-400)] cursor-not-allowed'
            )}
            disabled={checked.size < ITEMS.length}
          >
            Complete & print label
          </button>
        </div>
      </div>
    </div>
  );
}
