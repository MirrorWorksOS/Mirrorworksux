import React, { useState, useRef, useEffect } from 'react';
import { ScanBarcode, Package, CheckCircle } from 'lucide-react';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { cn } from '../ui/utils';

const Y = '#FFCF4B';
const D = '#141414';

const ITEMS = [
  { sku: 'AL-5052-BP', name: 'Base Plate Assembly', qty: 2, bin: 'A-01-03' },
  { sku: 'AL-5052-SA', name: 'Support Arm — Left', qty: 4, bin: 'A-02-01' },
  { sku: 'HW-KIT-001', name: 'Hardware Kit M10 SS', qty: 2, bin: 'C-04-02' },
  { sku: 'RHS-50252', name: 'RHS 50x25x2.5 — Cut', qty: 6, bin: 'B-02-05' },
  { sku: 'PNT-RAL7035', name: 'Paint — Dulux RAL 7035', qty: 1, bin: 'Paint-01' },
];

const PACKAGES = [
  { name: 'Small', dims: '30×20×15' },
  { name: 'Medium', dims: '45×35×25' },
  { name: 'Large', dims: '60×45×35' },
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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Station Bar */}
      <div className="bg-[#141414] text-white px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-[#FFCF4B] flex items-center justify-center text-[#141414] text-xs" style={{ fontWeight: 500 }}>MQ</div>
          <div>
            <p className="text-sm" style={{ fontWeight: 500 }}>Pack Station 1</p>
            <p className="text-xs text-[#8A8A8A]">Matt Quigley</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs text-[#8A8A8A]">
          <span>Packed: <span className="text-white" style={{ fontFamily: 'Roboto Mono, monospace' }}>34</span></span>
          <span>Orders: <span className="text-white" style={{ fontFamily: 'Roboto Mono, monospace' }}>8</span></span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-0 overflow-hidden">
        {/* Left — Items */}
        <div className="lg:col-span-3 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-[#141414]" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>SH-001</h4>
              <p className="text-xs text-[#8A8A8A] mt-1">Con-form Group</p>
            </div>
            <span className="text-xs text-[#8A8A8A]" style={{ fontFamily: 'Roboto Mono, monospace' }}>{checked.size}/{ITEMS.length}</span>
          </div>

          {/* Scanner */}
          <div className={cn(
            "relative mb-6 rounded-lg transition-all duration-150",
            flash === 'ok' && "ring-2 ring-[#FFCF4B]",
            flash === 'err' && "ring-2 ring-[#141414]"
          )}>
            <ScanBarcode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C0C0C0]" strokeWidth={1.5} />
            <Input ref={ref} value={scan} onChange={e => setScan(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleScan()}
              placeholder="Scan barcode..." className="pl-12 h-14 bg-[#FAFAFA] border-0 rounded-lg" style={{ fontFamily: 'Roboto Mono, monospace' }} />
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            {ITEMS.map(item => {
              const done = checked.has(item.sku);
              return (
                <div key={item.sku} onClick={() => toggle(item.sku)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all duration-150 min-h-[72px]",
                    done ? "bg-[#FAFAFA] opacity-50" : "bg-white border border-[#F0F0F0] hover:border-[#D4D4D4]"
                  )}>
                  <div className={cn("w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                    done ? "bg-[#141414] border-[#141414]" : "border-[#D4D4D4]")}>
                    {done && <CheckCircle className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-[#8A8A8A] tracking-wider" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{item.sku}</span>
                    <p className={cn("text-sm text-[#141414]", done && "line-through")}>{item.name}</p>
                  </div>
                  <span className="text-lg text-[#141414] shrink-0" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>×{item.qty}</span>
                  <span className="text-[10px] text-[#8A8A8A] bg-[#FAFAFA] px-2 py-1 rounded shrink-0" style={{ fontFamily: 'Roboto Mono, monospace' }}>{item.bin}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right — Package */}
        <div className="lg:col-span-2 p-8 overflow-y-auto border-l border-[#F0F0F0] bg-[#FAFAFA]">
          <p className="text-[10px] text-[#8A8A8A] tracking-widest uppercase mb-4" style={{ fontWeight: 500 }}>Package</p>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {PACKAGES.map(p => (
              <button key={p.name} onClick={() => setPkg(p.name)}
                className={cn("p-4 rounded-lg text-left transition-all duration-150",
                  pkg === p.name ? "bg-[#141414] text-white" : "bg-white border border-[#F0F0F0] hover:border-[#D4D4D4]")}>
                <p className="text-sm" style={{ fontWeight: 500 }}>{p.name}</p>
                <span className={cn("text-xs", pkg === p.name ? "text-[#8A8A8A]" : "text-[#A0A0A0]")}>{p.dims} cm</span>
              </button>
            ))}
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <span className="text-[10px] text-[#8A8A8A] tracking-widest uppercase" style={{ fontWeight: 500 }}>Weight</span>
              <div className="relative mt-1">
                <Input defaultValue="12.4" className="h-12 bg-white border-[#F0F0F0] rounded-lg pr-10" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#A0A0A0]">kg</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#141414]">Fragile</span>
              <Switch checked={fragile} onCheckedChange={setFragile} />
            </div>
          </div>

          <div className="bg-[#FFCF4B]/15 rounded-lg p-4 text-xs text-[#141414]">
            <p style={{ fontWeight: 500 }}>Special instructions</p>
            <p className="mt-1 text-[#8A8A8A]">Handle with care — powder-coated finish. Use corner protectors.</p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-white border-t border-[#F0F0F0] px-8 py-4 flex items-center justify-between shrink-0">
        <div className="h-1.5 bg-[#F0F0F0] rounded-full flex-1 max-w-xs overflow-hidden mr-6">
          <div className="h-full rounded-full transition-all" style={{ width: `${(checked.size / ITEMS.length) * 100}%`, backgroundColor: checked.size === ITEMS.length ? D : Y }} />
        </div>
        <div className="flex gap-3">
          <button className="h-12 px-6 rounded-lg text-sm border border-[#E8E8E8] text-[#141414] hover:bg-[#FAFAFA] transition-colors" style={{ fontWeight: 500 }}>Park</button>
          <button
            className={cn("h-12 px-8 rounded-lg text-sm transition-all", checked.size === ITEMS.length ? "bg-[#141414] text-white" : "bg-[#F0F0F0] text-[#A0A0A0] cursor-not-allowed")}
            disabled={checked.size < ITEMS.length} style={{ fontWeight: 500 }}>
            Complete & Print Label
          </button>
        </div>
      </div>
    </div>
  );
}
