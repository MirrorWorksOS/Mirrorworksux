import React from 'react';
import { Package, Clock, Truck, AlertTriangle, RotateCcw, ArrowRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const Y = '#FFCF4B';
const D = '#141414';

const KPI = [
  { label: 'Active Shipments', value: '47', icon: Package },
  { label: 'Pending Orders', value: '18', icon: Clock },
  { label: 'On-Time Rate', value: '96.2%', icon: Truck },
  { label: 'Avg Transit', value: '2.4d', icon: Clock },
  { label: 'Exceptions', value: '3', icon: AlertTriangle },
  { label: 'Returns', value: '5', icon: RotateCcw },
];

const PIPELINE = [
  { label: 'Pick', count: 6 },
  { label: 'Pack', count: 3 },
  { label: 'Ship', count: 5 },
  { label: 'Transit', count: 9 },
  { label: 'Delivered', count: 8 },
];

const CARRIER_DATA = [
  { carrier: 'Aus Post', onTime: 97 },
  { carrier: 'StarTrack', onTime: 95 },
  { carrier: 'Toll', onTime: 93 },
  { carrier: 'TNT', onTime: 91 },
  { carrier: 'DHL', onTime: 98 },
  { carrier: 'Sendle', onTime: 94 },
];

const EXCEPTIONS = [
  { id: 'SP270226001', customer: 'Con-form Group', type: 'Delay', time: '2h ago' },
  { id: 'SP260226003', customer: 'Acme Steel', type: 'Damage', time: '5h ago' },
  { id: 'SP250226008', customer: 'Hunter Steel', type: 'Refused', time: '1d ago' },
];

export function ShipDashboard() {
  return (
    <div className="p-8 space-y-8 overflow-y-auto max-w-[1200px] mx-auto">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {KPI.map(k => (
          <div key={k.label} className="bg-white rounded-xl p-5 border border-[#F0F0F0]">
            <k.icon className="w-4 h-4 text-[#A0A0A0] mb-3" strokeWidth={1.5} />
            <div className="text-2xl text-[#141414] tracking-tight" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{k.value}</div>
            <div className="text-xs text-[#8A8A8A] mt-1 tracking-wide">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div className="bg-white rounded-xl p-6 border border-[#F0F0F0]">
        <p className="text-xs text-[#8A8A8A] tracking-widest uppercase mb-5" style={{ fontWeight: 500 }}>Pipeline</p>
        <div className="flex items-center justify-between">
          {PIPELINE.map((s, i) => (
            <React.Fragment key={s.label}>
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: i === PIPELINE.length - 1 ? Y : '#141414', color: i === PIPELINE.length - 1 ? '#141414' : '#fff', fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>
                  {s.count}
                </div>
                <span className="text-xs text-[#8A8A8A]">{s.label}</span>
              </div>
              {i < PIPELINE.length - 1 && <ArrowRight className="w-4 h-4 text-[#D4D4D4] shrink-0 -mt-4" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Carrier Performance */}
        <div className="lg:col-span-3 bg-white rounded-xl p-6 border border-[#F0F0F0]">
          <p className="text-xs text-[#8A8A8A] tracking-widest uppercase mb-4" style={{ fontWeight: 500 }}>Carrier Performance</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={CARRIER_DATA} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: '#8A8A8A', fontFamily: 'Roboto Mono, monospace' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="carrier" type="category" tick={{ fontSize: 12, fill: '#141414' }} width={80} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="onTime" radius={[0, 6, 6, 0]} barSize={16}>
                {CARRIER_DATA.map((e, i) => (
                  <Cell key={`cell-${e.carrier}-${i}`} fill={e.onTime >= 95 ? Y : '#141414'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Exceptions */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-[#F0F0F0] flex flex-col">
          <p className="text-xs text-[#8A8A8A] tracking-widest uppercase mb-4" style={{ fontWeight: 500 }}>Exceptions</p>
          <div className="flex-1 space-y-3">
            {EXCEPTIONS.map(exc => (
              <div key={exc.id} className="flex items-center gap-4 p-4 rounded-lg bg-[#FAFAFA] cursor-pointer hover:bg-[#F5F5F5] transition-colors duration-150">
                <div className="w-2 h-2 rounded-full bg-[#141414] shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-[#141414]" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{exc.id}</span>
                  <p className="text-xs text-[#8A8A8A] mt-0.5">{exc.customer}</p>
                </div>
                <span className="text-[10px] text-[#8A8A8A] tracking-wide uppercase shrink-0">{exc.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}