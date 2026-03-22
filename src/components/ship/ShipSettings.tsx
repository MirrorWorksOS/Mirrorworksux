/**
 * Ship Settings — 4 panels with real form controls
 * Token-aligned. Active nav uses MW Yellow tint (#FFFBF0) matching other modules.
 */
import React, { useState } from 'react';
import { Settings, Truck, Package, RotateCcw } from 'lucide-react';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';

const NAV = [
  { icon: Settings,   label: 'General' },
  { icon: Truck,      label: 'Carriers' },
  { icon: Package,    label: 'Packaging' },
  { icon: RotateCcw,  label: 'Returns' },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs tracking-wider text-[#737373] font-medium mb-2">{children}</div>
      <Separator className="mb-4" />
    </div>
  );
}

function SaveRow() {
  return (
    <div className="flex justify-end gap-3 pt-4">
      <Button variant="ghost" className="text-[#737373] text-sm">Discard</Button>
      <Button className="h-10 bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732] rounded">Save changes</Button>
    </div>
  );
}

function GeneralPanel() {
  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />

      <div>
        <SectionLabel>DEFAULT CARRIER</SectionLabel>
        <Select defaultValue="startrack">
          <SelectTrigger className="h-12 border-[#E5E5E5] rounded bg-[#F5F5F5]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {['Australia Post', 'StarTrack', 'Toll/IPEC', 'TNT', 'DHL', 'Sendle'].map(c => (
              <SelectItem key={c} value={c.toLowerCase().replace(/[\s/]/g, '')}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <SectionLabel>DOCUMENT NUMBERING</SectionLabel>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Shipment prefix</label>
            <div className="flex gap-3 items-center">
              <Input defaultValue="SH-" className="h-12 border-[#E5E5E5] rounded bg-[#F5F5F5] max-w-[140px]" />
              <span className="text-xs text-[#737373] font-['Roboto_Mono',monospace]">Preview: SH-202603-001</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>UNITS</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">Weight</label>
            <Select defaultValue="kg">
              <SelectTrigger className="h-12 border-[#E5E5E5] rounded bg-[#F5F5F5]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="lb">lb</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Dimensions</label>
            <Select defaultValue="cm">
              <SelectTrigger className="h-12 border-[#E5E5E5] rounded bg-[#F5F5F5]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cm">cm</SelectItem>
                <SelectItem value="in">in</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>DISPATCH SCHEDULE</SectionLabel>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Timezone</label>
            <Select defaultValue="aest">
              <SelectTrigger className="h-12 border-[#E5E5E5] rounded bg-[#F5F5F5]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="aest">Sydney (AEST)</SelectItem>
                <SelectItem value="acst">Adelaide (ACST)</SelectItem>
                <SelectItem value="awst">Perth (AWST)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Cut-off time</label>
            <Input defaultValue="14:00" type="time" className="h-12 border-[#E5E5E5] rounded bg-[#F5F5F5] max-w-[160px]" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Dispatch days</label>
            <div className="flex gap-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <button
                  key={i}
                  className={cn(
                    'w-10 h-10 rounded-full text-xs transition-colors font-medium',
                    i < 5 ? 'bg-[#0A0A0A] text-white' : 'bg-[#F5F5F5] text-[#737373]'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CarriersPanel() {
  const [carriers, setCarriers] = useState([
    { name: 'Australia Post', on: true,  account: 'ACC-10293847' },
    { name: 'StarTrack',      on: true,  account: 'ST-882991' },
    { name: 'Toll/IPEC',      on: true,  account: 'TOLL-44291' },
    { name: 'TNT',            on: true,  account: 'TNT-992011' },
    { name: 'DHL Express',    on: true,  account: 'DHL-772341' },
    { name: 'Aramex',         on: false, account: '' },
    { name: 'Sendle',         on: true,  account: 'SND-112233' },
    { name: 'Allied Express', on: false, account: '' },
  ]);

  return (
    <div className="space-y-3 max-w-[640px]">
      {carriers.map((c, i) => (
        <Card key={c.name} className="bg-white border border-[#E5E5E5] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch
                checked={c.on}
                onCheckedChange={val => {
                  const next = [...carriers];
                  next[i] = { ...c, on: val };
                  setCarriers(next);
                }}
              />
              <div>
                <span className="text-sm text-[#0A0A0A] font-medium">{c.name}</span>
                {c.account && (
                  <p className="text-xs text-[#737373] font-['Roboto_Mono',monospace] mt-0.5">{c.account}</p>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-[#E5E5E5] h-8 text-xs">
              {c.on ? 'Configure' : 'Connect'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function PackagingPanel() {
  const pkgs = [
    { name: 'Small Box',  dims: '30×20×15', max: '5 kg',   cost: '$2.50' },
    { name: 'Medium Box', dims: '45×35×25', max: '15 kg',  cost: '$4.00' },
    { name: 'Large Box',  dims: '60×45×35', max: '25 kg',  cost: '$6.50' },
    { name: 'Pallet',     dims: '120×80',   max: '500 kg', cost: '$15.00' },
  ];
  return (
    <div className="space-y-4 max-w-[640px]">
      <div className="flex justify-end">
        <Button className="bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732]">Add type</Button>
      </div>
      <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
              {['NAME', 'DIMENSIONS', 'MAX WEIGHT', 'COST'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] uppercase font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pkgs.map(p => (
              <tr key={p.name} className="border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] transition-colors">
                <td className="px-4 text-sm text-[#0A0A0A] font-medium">{p.name}</td>
                <td className="px-4 text-sm text-[#737373]">{p.dims} cm</td>
                <td className="px-4 text-sm text-[#737373]">{p.max}</td>
                <td className="px-4 text-sm font-['Roboto_Mono',monospace] font-medium">{p.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function ReturnsPanel() {
  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />

      <div>
        <SectionLabel>RETURN POLICY</SectionLabel>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Return window</label>
            <div className="flex items-center gap-3">
              <Input defaultValue="30" type="number" className="h-12 border-[#E5E5E5] rounded bg-[#F5F5F5] w-24" />
              <span className="text-sm text-[#737373]">days</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Restocking fee</label>
            <div className="flex items-center gap-3">
              <Input defaultValue="10" type="number" className="h-12 border-[#E5E5E5] rounded bg-[#F5F5F5] w-24" />
              <span className="text-sm text-[#737373]">%</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>AUTOMATION</SectionLabel>
        <div className="space-y-4">
          {[
            { label: 'Auto-approve returns under $100',          sub: 'Automatically approve qualifying returns',    checked: true },
            { label: 'Send customer confirmation on RMA creation', sub: 'Email customer when RMA is created',          checked: true },
            { label: 'Require photos for damage claims',           sub: 'Customer must attach photos to submit claim', checked: false },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-[#F5F5F5] last:border-0">
              <div>
                <span className="text-sm text-[#0A0A0A] font-medium">{r.label}</span>
                <p className="text-xs text-[#737373] mt-0.5">{r.sub}</p>
              </div>
              <Switch defaultChecked={r.checked} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ShipSettings() {
  const [active, setActive] = useState('General');

  const panel = () => {
    switch (active) {
      case 'Carriers':  return <CarriersPanel />;
      case 'Packaging': return <PackagingPanel />;
      case 'Returns':   return <ReturnsPanel />;
      default:          return <GeneralPanel />;
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar — MW Yellow tint for active, matching all other modules */}
      <div className="w-56 shrink-0 border-r border-[#E5E5E5] p-4 flex flex-col gap-1 bg-white">
        <p className="text-xs text-[#737373] font-medium mb-3 px-3">Ship Settings</p>
        {NAV.map(n => (
          <button
            key={n.label}
            onClick={() => setActive(n.label)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors w-full',
              active === n.label
                ? 'bg-[#FFFBF0] text-[#0A0A0A] font-medium'
                : 'text-[#737373] hover:bg-[#F5F5F5] hover:text-[#0A0A0A]'
            )}
          >
            <n.icon className="w-4 h-4" strokeWidth={1.5} />
            {n.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFA]">{panel()}</div>
    </div>
  );
}
