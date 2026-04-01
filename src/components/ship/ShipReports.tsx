/**
 * Ship Reports — charts dashboard
 * Token-aligned: #141414 → var(--neutral-900), #F0F0F0 → var(--neutral-200), #8A8A8A → var(--neutral-500)
 */
import React from 'react';
import { Calendar, Download } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { ChartCard } from '@/components/shared/charts/ChartCard';
import {
  MW_AXIS_TICK,
  MW_BAR_TOOLTIP_CURSOR,
  MW_CARTESIAN_GRID,
  MW_CHART_COLOURS,
  MW_RECHARTS_ANIMATION_BAR,
  getChartScaleColour,
} from '@/components/shared/charts/chart-theme';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { toast } from 'sonner';

const LINE_STROKE = 'var(--chart-scale-mid)';

const shipVolume = [
  { d: '24', v: 12 }, { d: '25', v: 15 }, { d: '26', v: 8 },
  { d: '27', v: 18 }, { d: '28', v: 22 }, { d: '01', v: 14 }, { d: '02', v: 11 },
];
const onTime = [
  { d: '24', r: 94 }, { d: '25', r: 96 }, { d: '26', r: 92 },
  { d: '27', r: 97 }, { d: '28', r: 95 }, { d: '01', r: 98 }, { d: '02', r: 96 },
];
const carrierCost = [
  { c: 'AusPost',   v: 11.2 }, { c: 'StarTrack', v: 14.8 },
  { c: 'Toll',      v: 18.9 }, { c: 'TNT',        v: 16.5 },
  { c: 'DHL',       v: 22.0 }, { c: 'Sendle',     v: 8.5 },
];
const statusDist = [
  { name: 'Delivered',  value: 45 },
  { name: 'In Transit', value: 18 },
  { name: 'Shipped',    value: 12 },
  { name: 'Exception',  value: 3 },
];
const destData = [
  { s: 'NSW', v: 42 }, { s: 'VIC', v: 28 }, { s: 'QLD', v: 18 },
  { s: 'WA',  v: 12 }, { s: 'SA',  v: 8 },  { s: 'TAS', v: 4 },
];
const returnRate = [
  { d: '24', r: 2.5 }, { d: '25', r: 3.1 }, { d: '26', r: 2.8 },
  { d: '27', r: 2.2 }, { d: '28', r: 2.9 }, { d: '01', r: 3.0 }, { d: '02', r: 2.6 },
];

const pieColors = [...MW_CHART_COLOURS];

export function ShipReports() {
  const carrierCostMax = Math.max(...carrierCost.map((c) => c.v), 1);

  return (
    <PageShell className="overflow-y-auto">
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-6"
    >
      <PageHeader
        title="Reports"
        actions={
          <>
            <button type="button" className="flex h-10 items-center gap-2 rounded-[var(--shape-lg)] border border-[var(--border)] px-4 text-sm font-medium text-[var(--mw-mirage)] transition-colors hover:bg-[var(--neutral-100)]">
              <Calendar className="h-4 w-4" strokeWidth={1.5} /> This Week
            </button>
            <button type="button" className="flex h-10 items-center gap-2 rounded-[var(--shape-lg)] border border-[var(--border)] px-4 text-sm font-medium text-[var(--mw-mirage)] transition-colors hover:bg-[var(--neutral-100)]" onClick={() => toast.success('Exporting report…')}>
              <Download className="h-4 w-4" strokeWidth={1.5} /> Export
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div variants={staggerItem}>
          <ChartCard title="Shipments">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={shipVolume}>
                <CartesianGrid {...MW_CARTESIAN_GRID} />
                <XAxis dataKey="d" tick={MW_AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={MW_AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line key="v" type="monotone" dataKey="v" stroke={LINE_STROKE} strokeWidth={2} dot={{ r: 2.5, fill: LINE_STROKE }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>

        <motion.div variants={staggerItem}>
          <ChartCard title="On-Time %">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={onTime}>
                <CartesianGrid {...MW_CARTESIAN_GRID} />
                <XAxis dataKey="d" tick={MW_AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis domain={[85, 100]} tickFormatter={v => `${v}%`} tick={MW_AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <ReferenceLine y={95} stroke="var(--mw-yellow-400)" strokeWidth={2} />
                <Line key="r" type="monotone" dataKey="r" stroke={LINE_STROKE} strokeWidth={2} dot={{ r: 2.5, fill: LINE_STROKE }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>

        <motion.div variants={staggerItem}>
          <ChartCard title="Carrier cost (avg)">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={carrierCost}>
                <CartesianGrid {...MW_CARTESIAN_GRID} />
                <XAxis dataKey="c" tick={MW_AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${v}`} tick={MW_AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip cursor={MW_BAR_TOOLTIP_CURSOR} formatter={(v: number) => `$${v.toFixed(2)}`} />
                <Bar key="v" dataKey="v" radius={[4, 4, 0, 0]} barSize={20} {...MW_RECHARTS_ANIMATION_BAR}>
                  {carrierCost.map((e, i) => (
                    <Cell
                      key={`carrier-cost-${e.c}-${i}`}
                      fill={getChartScaleColour((e.v / carrierCostMax) * 100)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div variants={staggerItem}>
          <ChartCard title="Status distribution">
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie data={statusDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                    {statusDist.map((s, i) => (
                      <Cell key={`status-dist-${s.name}-${i}`} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {statusDist.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                    <span className="text-[var(--neutral-500)] w-16">{s.name}</span>
                    <span className="text-[var(--mw-mirage)] font-medium tabular-nums">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </motion.div>

        <motion.div variants={staggerItem}>
          <ChartCard title="Destinations">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={destData} layout="vertical" margin={{ left: 5 }}>
                <XAxis type="number" tick={MW_AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis dataKey="s" type="category" tick={{ ...MW_AXIS_TICK, fill: 'var(--mw-mirage)', fontWeight: 500 }} width={30} axisLine={false} tickLine={false} />
                <Tooltip cursor={MW_BAR_TOOLTIP_CURSOR} />
                <Bar key="v" dataKey="v" fill="var(--chart-scale-mid)" radius={[0, 4, 4, 0]} barSize={12} {...MW_RECHARTS_ANIMATION_BAR} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>

        <motion.div variants={staggerItem}>
          <ChartCard title="Return rate">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={returnRate}>
                <CartesianGrid {...MW_CARTESIAN_GRID} />
                <XAxis dataKey="d" tick={MW_AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `${v}%`} tick={MW_AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Line key="r" type="monotone" dataKey="r" stroke="var(--mw-yellow-400)" strokeWidth={2} dot={{ r: 2.5, fill: 'var(--mw-yellow-400)' }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>
      </div>
    </motion.div>
    </PageShell>
  );
}
