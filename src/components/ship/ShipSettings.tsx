import React, { useState } from 'react';
import { Settings, Warehouse, Truck, Package, Bell, RotateCcw, Link, Clock } from 'lucide-react';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../ui/utils';

const Y = '#FFCF4B';
const D = '#141414';

const NAV = [
  { icon: Settings, label: 'General' },
  { icon: Truck, label: 'Carriers' },
  { icon: Package, label: 'Packaging' },
  { icon: RotateCcw, label: 'Returns' },
];

function GeneralPanel() {
  return (
    <div className="space-y-8 max-w-[600px]">
      <div>
        <span className="text-[10px] text-[#A0A0A0] tracking-widest uppercase" style={{ fontWeight: 500 }}>Default Carrier</span>
        <Select defaultValue="startrack">
          <SelectTrigger className="h-12 bg-[#FAFAFA] border-0 rounded-lg mt-2"><SelectValue /></SelectTrigger>
          <SelectContent>
            {['Australia Post', 'StarTrack', 'Toll/IPEC', 'TNT', 'DHL', 'Sendle'].map(c => (
              <SelectItem key={c} value={c.toLowerCase().replace(/[\s/]/g, '')}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <span className="text-[10px] text-[#A0A0A0] tracking-widest uppercase" style={{ fontWeight: 500 }}>Prefix</span>
        <Input defaultValue="SH-" className="h-12 bg-[#FAFAFA] border-0 rounded-lg mt-2 max-w-[160px]" />
        <p className="text-[10px] text-[#A0A0A0] mt-1" style={{ fontFamily: 'Roboto Mono, monospace' }}>Preview: SH-202603-001</p>
      </div>

      <div>
        <span className="text-[10px] text-[#A0A0A0] tracking-widest uppercase" style={{ fontWeight: 500 }}>Units</span>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="flex gap-4">
            {['kg', 'lb'].map(u => (
              <label key={u} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="w" defaultChecked={u === 'kg'} className="accent-[#FFCF4B] w-4 h-4" /> {u}
              </label>
            ))}
          </div>
          <div className="flex gap-4">
            {['cm', 'in'].map(u => (
              <label key={u} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="d" defaultChecked={u === 'cm'} className="accent-[#FFCF4B] w-4 h-4" /> {u}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div>
        <span className="text-[10px] text-[#A0A0A0] tracking-widest uppercase" style={{ fontWeight: 500 }}>Schedule</span>
        <div className="mt-3 space-y-4">
          <Select defaultValue="aest">
            <SelectTrigger className="h-12 bg-[#FAFAFA] border-0 rounded-lg"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="aest">Sydney (AEST)</SelectItem>
              <SelectItem value="acst">Adelaide (ACST)</SelectItem>
              <SelectItem value="awst">Perth (AWST)</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-3">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <button key={i} className={cn("w-10 h-10 rounded-full text-xs transition-colors",
                i < 5 ? "bg-[#141414] text-white" : "bg-[#FAFAFA] text-[#8A8A8A]")} style={{ fontWeight: 500 }}>{d}</button>
            ))}
          </div>
          <div>
            <span className="text-xs text-[#8A8A8A]">Cut-off</span>
            <Input defaultValue="14:00" type="time" className="h-12 bg-[#FAFAFA] border-0 rounded-lg mt-1 max-w-[160px]" />
          </div>
        </div>
      </div>

      <button className="h-12 px-8 rounded-lg text-sm bg-[#FFCF4B] text-[#141414] hover:bg-[#F2BF30] transition-colors" style={{ fontWeight: 500 }}>Save</button>
    </div>
  );
}

function CarriersPanel() {
  const carriers = [
    { name: 'Australia Post', on: true }, { name: 'StarTrack', on: true },
    { name: 'Toll/IPEC', on: true }, { name: 'TNT', on: true },
    { name: 'DHL', on: true }, { name: 'Aramex', on: false },
    { name: 'Sendle', on: true }, { name: 'Allied Express', on: false },
  ];
  return (
    <div className="space-y-3 max-w-[600px]">
      {carriers.map(c => (
        <div key={c.name} className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#F0F0F0]">
          <div className="flex items-center gap-3">
            <div className={cn("w-2 h-2 rounded-full", c.on ? "bg-[#FFCF4B]" : "bg-[#D4D4D4]")} />
            <span className="text-sm text-[#141414]" style={{ fontWeight: 500 }}>{c.name}</span>
          </div>
          <button className="h-9 px-4 rounded-lg text-xs border border-[#E8E8E8] text-[#141414] hover:bg-[#FAFAFA] transition-colors" style={{ fontWeight: 500 }}>
            {c.on ? 'Configure' : 'Connect'}
          </button>
        </div>
      ))}
    </div>
  );
}

function PackagingPanel() {
  const pkgs = [
    { name: 'Small Box', dims: '30×20×15', max: '5 kg', cost: '$2.50' },
    { name: 'Medium Box', dims: '45×35×25', max: '15 kg', cost: '$4.00' },
    { name: 'Large Box', dims: '60×45×35', max: '25 kg', cost: '$6.50' },
    { name: 'Pallet', dims: '120×80', max: '500 kg', cost: '$15.00' },
  ];
  return (
    <div className="space-y-4 max-w-[600px]">
      <div className="flex justify-end">
        <button className="h-10 px-5 rounded-lg text-sm bg-[#FFCF4B] text-[#141414] hover:bg-[#F2BF30] transition-colors" style={{ fontWeight: 500 }}>Add Type</button>
      </div>
      <div className="bg-white rounded-xl border border-[#F0F0F0] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F0F0F0]">
              {['NAME', 'DIMENSIONS', 'MAX', 'COST'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] tracking-widest text-[#A0A0A0] uppercase" style={{ fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pkgs.map(p => (
              <tr key={p.name} className="border-b border-[#F8F8F8] hover:bg-[#FAFAFA] transition-colors">
                <td className="px-4 py-3 text-sm text-[#141414]" style={{ fontWeight: 500 }}>{p.name}</td>
                <td className="px-4 py-3 text-sm text-[#8A8A8A]">{p.dims} cm</td>
                <td className="px-4 py-3 text-sm text-[#8A8A8A]">{p.max}</td>
                <td className="px-4 py-3 text-sm" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{p.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReturnsPanel() {
  return (
    <div className="space-y-6 max-w-[600px]">
      <div>
        <span className="text-[10px] text-[#A0A0A0] tracking-widest uppercase" style={{ fontWeight: 500 }}>Return Window</span>
        <div className="relative mt-2 max-w-[160px]">
          <Input defaultValue="30" className="h-12 bg-[#FAFAFA] border-0 rounded-lg pr-12" />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#A0A0A0]">days</span>
        </div>
      </div>
      <div className="flex items-center justify-between py-2">
        <div>
          <span className="text-sm text-[#141414]">Auto-approve under $100</span>
          <p className="text-xs text-[#8A8A8A]">Automatically approve qualifying returns</p>
        </div>
        <Switch defaultChecked />
      </div>
      <div>
        <span className="text-[10px] text-[#A0A0A0] tracking-widest uppercase" style={{ fontWeight: 500 }}>Restocking Fee</span>
        <div className="relative mt-2 max-w-[160px]">
          <Input defaultValue="10" className="h-12 bg-[#FAFAFA] border-0 rounded-lg pr-8" />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#A0A0A0]">%</span>
        </div>
      </div>
      <button className="h-12 px-8 rounded-lg text-sm bg-[#FFCF4B] text-[#141414] hover:bg-[#F2BF30] transition-colors" style={{ fontWeight: 500 }}>Save</button>
    </div>
  );
}

export function ShipSettings() {
  const [active, setActive] = useState('General');

  const panel = () => {
    switch (active) {
      case 'Carriers': return <CarriersPanel />;
      case 'Packaging': return <PackagingPanel />;
      case 'Returns': return <ReturnsPanel />;
      default: return <GeneralPanel />;
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-[200px] shrink-0 border-r border-[#F0F0F0] p-4 flex flex-col gap-1">
        {NAV.map(n => (
          <button key={n.label} onClick={() => setActive(n.label)}
            className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors w-full",
              active === n.label ? "bg-[#141414] text-white" : "text-[#8A8A8A] hover:text-[#141414] hover:bg-[#FAFAFA]")}
            style={{ fontWeight: 500 }}>
            <n.icon className="w-4 h-4" strokeWidth={1.5} /> {n.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-8">{panel()}</div>
    </div>
  );
}
