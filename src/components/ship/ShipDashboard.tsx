/**
 * Ship Dashboard — token-aligned to Book/Sell/Plan standard
 * #F0F0F0 → var(--neutral-200), #141414 → var(--neutral-900), #8A8A8A → var(--neutral-500)
 * Added motion/react animation
 */
import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Package, Clock, Truck, AlertTriangle, RotateCcw, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '../ui/card';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { ModuleDashboard } from '@/components/shared/dashboard/ModuleDashboard';
import {
  MW_AXIS_TICK,
  MW_BAR_TOOLTIP_CURSOR,
  MW_RECHARTS_ANIMATION_BAR,
  MW_TOOLTIP_STYLE,
  MW_BAR_RADIUS_H,
  getChartScalePattern,
} from '@/components/shared/charts/chart-theme';
import { mwChartPatternDefs } from '@/components/shared/charts/ChartPatternDefs';
import { ChartCard } from '@/components/shared/charts/ChartCard';
import { KpiStatCard, type IconSurface } from '@/components/shared/cards/KpiStatCard';

const KPI: {
  label: string;
  value: string;
  icon: LucideIcon;
  iconSurface: IconSurface;
}[] = [
  { label: 'Active Shipments', value: '47', icon: Package, iconSurface: 'onLight' },
  { label: 'Pending Orders', value: '18', icon: Clock, iconSurface: 'onLight' },
  { label: 'On-Time Rate', value: '96.2%', icon: Truck, iconSurface: 'key' },
  { label: 'Avg Transit', value: '2.4d', icon: Clock, iconSurface: 'onLight' },
  { label: 'Exceptions', value: '3', icon: AlertTriangle, iconSurface: 'onLight' },
  { label: 'Returns', value: '5', icon: RotateCcw, iconSurface: 'onLight' },
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

const shipTabs = [{ key: 'overview', label: 'Overview' }];

export function ShipDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <ModuleDashboard
      title="Shipments"
      tabs={shipTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      aiScope="ship"
    >
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
        {KPI.map((k) => (
          <motion.div key={k.label} variants={staggerItem}>
            <KpiStatCard
              layout="compact"
              label={k.label}
              value={k.value}
              icon={k.icon}
              iconSurface={k.iconSurface}
              iconSize="sm"
            />
          </motion.div>
        ))}
      </div>

      {/* Pipeline */}
      <motion.div variants={staggerItem}>
        <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
          <p className="text-xs text-[var(--neutral-500)] tracking-widest uppercase mb-4 font-medium">Fulfilment pipeline</p>
          <div className="flex items-center justify-between">
            {PIPELINE.map((s, i) => (
              <React.Fragment key={s.label}>
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm  font-medium"
                    style={{
                      backgroundColor: i === PIPELINE.length - 1 ? 'var(--mw-yellow-400)' : 'var(--mw-mirage)',
                      color:           i === PIPELINE.length - 1 ? 'var(--mw-mirage)' : 'white',
                    }}
                  >
                    {s.count}
                  </div>
                  <span className="text-xs text-[var(--neutral-500)]">{s.label}</span>
                </div>
                {i < PIPELINE.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-[var(--neutral-200)] shrink-0 -mt-4" />
                )}
              </React.Fragment>
            ))}
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Carrier Performance */}
        <motion.div variants={staggerItem} className="lg:col-span-3">
          <ChartCard title="Carrier performance">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={CARRIER_DATA} layout="vertical" margin={{ left: 20 }}>
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={v => `${v}%`}
                  tick={MW_AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="carrier"
                  type="category"
                  tick={{ ...MW_AXIS_TICK, fill: 'var(--mw-mirage)' }}
                  width={80}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip cursor={MW_BAR_TOOLTIP_CURSOR} contentStyle={MW_TOOLTIP_STYLE} formatter={(v: number) => `${v}%`} />
                {mwChartPatternDefs()}
                <Bar key="onTime" dataKey="onTime" radius={MW_BAR_RADIUS_H} barSize={16} {...MW_RECHARTS_ANIMATION_BAR}>
                  {CARRIER_DATA.map((e, i) => (
                    <Cell key={`carrier-cell-${e.carrier}-${i}`} fill={getChartScalePattern(e.onTime)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>

        {/* Exceptions */}
        <motion.div variants={staggerItem} className="lg:col-span-2">
          <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6 flex flex-col h-full">
            <p className="text-xs text-[var(--neutral-500)] tracking-widest uppercase mb-4 font-medium">Exceptions</p>
            <div className="flex-1 space-y-4">
              {EXCEPTIONS.map(exc => (
                <div
                  key={exc.id}
                  className="flex items-center gap-4 p-4 rounded-[var(--shape-lg)] bg-[var(--neutral-100)] cursor-pointer hover:bg-[var(--neutral-100)] transition-colors duration-[var(--duration-short2)]"
                >
                  <div className="w-2 h-2 rounded-full bg-[var(--mw-error)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-[var(--mw-mirage)] font-medium tabular-nums">{exc.id}</span>
                    <p className="text-xs text-[var(--neutral-500)] mt-0.5">{exc.customer}</p>
                  </div>
                  <span className="text-[10px] text-[var(--neutral-500)] tracking-wide uppercase shrink-0">{exc.type}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
      </motion.div>
    </ModuleDashboard>
  );
}
