import React from 'react';
import { Calendar, Download } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

const Y = '#FFCF4B';
const D = '#141414';
const G = '#8A8A8A';

const shipVolume = [
  { d: '24', v: 12 }, { d: '25', v: 15 }, { d: '26', v: 8 },
  { d: '27', v: 18 }, { d: '28', v: 22 }, { d: '01', v: 14 }, { d: '02', v: 11 },
];

const onTime = [
  { d: '24', r: 94 }, { d: '25', r: 96 }, { d: '26', r: 92 },
  { d: '27', r: 97 }, { d: '28', r: 95 }, { d: '01', r: 98 }, { d: '02', r: 96 },
];

const carrierCost = [
  { c: 'AusPost', v: 11.2 }, { c: 'StarTrack', v: 14.8 },
  { c: 'Toll', v: 18.9 }, { c: 'TNT', v: 16.5 },
  { c: 'DHL', v: 22.0 }, { c: 'Sendle', v: 8.5 },
];

const statusDist = [
  { name: 'Delivered', value: 45 },
  { name: 'In Transit', value: 18 },
  { name: 'Shipped', value: 12 },
  { name: 'Exception', value: 3 },
];

const destData = [
  { s: 'NSW', v: 42 }, { s: 'VIC', v: 28 }, { s: 'QLD', v: 18 },
  { s: 'WA', v: 12 }, { s: 'SA', v: 8 }, { s: 'TAS', v: 4 },
];

const returnRate = [
  { d: '24', r: 2.5 }, { d: '25', r: 3.1 }, { d: '26', r: 2.8 },
  { d: '27', r: 2.2 }, { d: '28', r: 2.9 }, { d: '01', r: 3.0 }, { d: '02', r: 2.6 },
];

const Chart = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl p-6 border border-[#F0F0F0]">
    <p className="text-xs text-[#8A8A8A] tracking-widest uppercase mb-4" style={{ fontWeight: 500 }}>{title}</p>
    {children}
  </div>
);

const axisStyle = { fontSize: 10, fill: G, fontFamily: 'Roboto Mono, monospace' };

export function ShipReports() {
  return (
    <div className="p-8 space-y-6 overflow-y-auto max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <h4 className="text-[#141414] tracking-tight">Reports</h4>
        <div className="flex gap-2">
          <button className="h-10 px-4 rounded-lg text-sm border border-[#E8E8E8] text-[#141414] hover:bg-[#FAFAFA] transition-colors flex items-center gap-2" style={{ fontWeight: 500 }}><Calendar className="w-4 h-4" /> This Week</button>
          <button className="h-10 px-4 rounded-lg text-sm border border-[#E8E8E8] text-[#141414] hover:bg-[#FAFAFA] transition-colors flex items-center gap-2" style={{ fontWeight: 500 }}><Download className="w-4 h-4" /> Export</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Chart title="Shipments">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={shipVolume}>
              <CartesianGrid stroke="#F5F5F5" strokeDasharray="3 3" />
              <XAxis dataKey="d" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="v" stroke={D} strokeWidth={2} dot={{ r: 2.5, fill: D }} />
            </LineChart>
          </ResponsiveContainer>
        </Chart>

        <Chart title="On-Time %">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={onTime}>
              <CartesianGrid stroke="#F5F5F5" strokeDasharray="3 3" />
              <XAxis dataKey="d" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis domain={[85, 100]} tickFormatter={v => `${v}%`} tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <ReferenceLine y={95} stroke={Y} strokeWidth={2} />
              <Line type="monotone" dataKey="r" stroke={D} strokeWidth={2} dot={{ r: 2.5, fill: D }} />
            </LineChart>
          </ResponsiveContainer>
        </Chart>

        <Chart title="Carrier Cost (avg)">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={carrierCost}>
              <CartesianGrid stroke="#F5F5F5" strokeDasharray="3 3" />
              <XAxis dataKey="c" tick={{ fontSize: 9, fill: G }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${v}`} tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
              <Bar dataKey="v" radius={[4, 4, 0, 0]} barSize={20}>
                {carrierCost.map((e, i) => (
                  <Cell key={`carrier-${e.c}-${i}`} fill={e.v <= 10 ? Y : D} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Chart>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Chart title="Status Distribution">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={180}>
              <PieChart>
                <Pie data={statusDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                  {statusDist.map((s, i) => (
                    <Cell key={`status-${s.name}-${i}`} fill={i === 0 ? Y : i === statusDist.length - 1 ? D : `rgba(20,20,20,${0.15 + i * 0.2})`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {statusDist.map((s, i) => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: i === 0 ? Y : i === statusDist.length - 1 ? D : `rgba(20,20,20,${0.15 + i * 0.2})` }} />
                  <span className="text-[#8A8A8A] w-16">{s.name}</span>
                  <span className="text-[#141414]" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Chart>

        <Chart title="Destinations">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={destData} layout="vertical" margin={{ left: 5 }}>
              <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis dataKey="s" type="category" tick={{ fontSize: 10, fill: D, fontWeight: 500 }} width={30} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="v" fill={D} radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </Chart>

        <Chart title="Return Rate">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={returnRate}>
              <CartesianGrid stroke="#F5F5F5" strokeDasharray="3 3" />
              <XAxis dataKey="d" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `${v}%`} tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Line type="monotone" dataKey="r" stroke={Y} strokeWidth={2} dot={{ r: 2.5, fill: Y }} />
            </LineChart>
          </ResponsiveContainer>
        </Chart>
      </div>
    </div>
  );
}