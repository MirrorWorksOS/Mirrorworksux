/**
 * Buy Reports - Spend analysis and procurement analytics
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '../ui/card';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';


const spendBySupplier = [
  { name: 'Hunter Steel Co', spend: 156000, color: 'var(--mw-info)' },
  { name: 'Pacific Metals', spend: 89000, color: 'var(--mw-success)' },
  { name: 'Sydney Welding', spend: 45000, color: 'var(--mw-warning)' },
  { name: 'BHP Suppliers', spend: 128000, color: '#7C3AED' },
];

const monthlySpend = [
  { month: 'Oct', spend: 95000 },
  { month: 'Nov', spend: 88000 },
  { month: 'Dec', spend: 92000 },
  { month: 'Jan', spend: 102000 },
  { month: 'Feb', spend: 89000 },
  { month: 'Mar', spend: 105000 },
];

export function BuyReports() {
  return (
    <motion.div initial="initial" animate="animate" variants={staggerContainer} className="p-6 space-y-6">
      <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">Procurement Reports</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
          <h3 className="text-base font-semibold text-[var(--mw-mirage)] mb-4">Spend by Supplier</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={spendBySupplier} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="spend">
                {spendBySupplier.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
          <h3 className="text-base font-semibold text-[var(--mw-mirage)] mb-4">Monthly Spend Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlySpend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-100)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--neutral-500)' }} />
              <YAxis tickFormatter={v => `$${v / 1000}k`} tick={{ fontSize: 11, fill: 'var(--neutral-500)' }} />
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Bar dataKey="spend" fill="#FFCF4B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </motion.div>
  );
}
