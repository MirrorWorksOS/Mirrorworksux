/**
 * Ship Dashboard — token-aligned to Book/Sell/Plan standard
 * #F0F0F0 → #E5E5E5, #141414 → #0A0A0A, #8A8A8A → #737373
 * Added motion/react animation
 */
import React from 'react';
import { Package, Clock, Truck, AlertTriangle, RotateCcw, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '../ui/card';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';

const { animationVariants } = designSystem;

const KPI = [
  { label: 'Active Shipments', value: '47', icon: Package },
  { label: 'Pending Orders',   value: '18', icon: Clock },
  { label: 'On-Time Rate',     value: '96.2%', icon: Truck },
  { label: 'Avg Transit',      value: '2.4d', icon: Clock },
  { label: 'Exceptions',       value: '3', icon: AlertTriangle },
  { label: 'Returns',          value: '5', icon: RotateCcw },
];

const PIPELINE = [
  { label: 'Pick',      count: 6 },
  { label: 'Pack',      count: 3 },
  { label: 'Ship',      count: 5 },
  { label: 'Transit',   count: 9 },
  { label: 'Delivered', count: 8 },
];

const CARRIER_DATA = [
  { carrier: 'Aus Post',  onTime: 97 },
  { carrier: 'StarTrack', onTime: 95 },
  { carrier: 'Toll',      onTime: 93 },
  { carrier: 'TNT',       onTime: 91 },
  { carrier: 'DHL',       onTime: 98 },
  { carrier: 'Sendle',    onTime: 94 },
];

const EXCEPTIONS = [
  { id: 'SP270226001', customer: 'Con-form Group', type: 'Delay',   time: '2h ago' },
  { id: 'SP260226003', customer: 'Acme Steel',     type: 'Damage',  time: '5h ago' },
  { id: 'SP250226008', customer: 'Hunter Steel',   type: 'Refused', time: '1d ago' },
];

export function ShipDashboard() {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={animationVariants.stagger}
      className="p-6 space-y-6 overflow-y-auto"
    >
      <h1 className="text-[32px] tracking-tight text-[#0A0A0A]">Shipments</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {KPI.map(k => (
          <motion.div key={k.label} variants={animationVariants.listItem}>
            <Card className="bg-white border border-[#E5E5E5] rounded-lg p-5 hover:shadow-md transition-shadow duration-150">
              <k.icon className="w-4 h-4 text-[#737373] mb-3" strokeWidth={1.5} />
              <div className="font-['Roboto_Mono',monospace] text-[24px] font-semibold text-[#0A0A0A] tracking-tight">{k.value}</div>
              <div className="text-[12px] text-[#737373] mt-1 font-['Geist:Medium',sans-serif]">{k.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pipeline */}
      <motion.div variants={animationVariants.listItem}>
        <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <p className="text-xs text-[#737373] tracking-widest uppercase mb-5 font-medium">Fulfilment pipeline</p>
          <div className="flex items-center justify-between">
            {PIPELINE.map((s, i) => (
              <React.Fragment key={s.label}>
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-['Roboto_Mono',monospace] font-medium"
                    style={{
                      backgroundColor: i === PIPELINE.length - 1 ? '#FFCF4B' : '#0A0A0A',
                      color:           i === PIPELINE.length - 1 ? '#1A2732' : '#fff',
                    }}
                  >
                    {s.count}
                  </div>
                  <span className="text-xs text-[#737373]">{s.label}</span>
                </div>
                {i < PIPELINE.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-[#E5E5E5] shrink-0 -mt-4" />
                )}
              </React.Fragment>
            ))}
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Carrier Performance */}
        <motion.div variants={animationVariants.listItem} className="lg:col-span-3">
          <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
            <p className="text-xs text-[#737373] tracking-widest uppercase mb-4 font-medium">Carrier performance</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={CARRIER_DATA} layout="vertical" margin={{ left: 20 }}>
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={v => `${v}%`}
                  tick={{ fontSize: 11, fill: '#737373', fontFamily: 'Roboto Mono, monospace' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="carrier"
                  type="category"
                  tick={{ fontSize: 12, fill: '#0A0A0A' }}
                  width={80}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar key="onTime" dataKey="onTime" radius={[0, 6, 6, 0]} barSize={16}>
                  {CARRIER_DATA.map((e, i) => (
                    <Cell key={`carrier-cell-${e.carrier}-${i}`} fill={e.onTime >= 95 ? '#FFCF4B' : '#0A0A0A'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Exceptions */}
        <motion.div variants={animationVariants.listItem} className="lg:col-span-2">
          <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6 flex flex-col h-full">
            <p className="text-xs text-[#737373] tracking-widest uppercase mb-4 font-medium">Exceptions</p>
            <div className="flex-1 space-y-3">
              {EXCEPTIONS.map(exc => (
                <div
                  key={exc.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-[#FAFAFA] cursor-pointer hover:bg-[#F5F5F5] transition-colors duration-150"
                >
                  <div className="w-2 h-2 rounded-full bg-[#EF4444] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-[#0A0A0A] font-['Roboto_Mono',monospace] font-medium">{exc.id}</span>
                    <p className="text-xs text-[#737373] mt-0.5">{exc.customer}</p>
                  </div>
                  <span className="text-[10px] text-[#737373] tracking-wide uppercase shrink-0">{exc.type}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
