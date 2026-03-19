/**
 * Buy Reports - Spend analysis and procurement analytics
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '../ui/card';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';

const { animationVariants } = designSystem;

const spendBySupplier = [
  { name: 'Hunter Steel Co', spend: 156000, color: '#0052CC' },
  { name: 'Pacific Metals', spend: 89000, color: '#36B37E' },
  { name: 'Sydney Welding', spend: 45000, color: '#FACC15' },
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
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-6 space-y-6">
      <h1 className="text-[32px] tracking-tight text-[#1A2732]">Procurement Reports</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <h3 className="font-['Geist:SemiBold',sans-serif] text-[16px] font-semibold text-[#0A0A0A] mb-4">Spend by Supplier</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={spendBySupplier} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="spend">
                {spendBySupplier.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <h3 className="font-['Geist:SemiBold',sans-serif] text-[16px] font-semibold text-[#0A0A0A] mb-4">Monthly Spend Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlySpend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Roboto Mono', fill: '#737373' }} />
              <YAxis tickFormatter={v => `$${v / 1000}k`} tick={{ fontSize: 11, fontFamily: 'Roboto Mono', fill: '#737373' }} />
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Bar dataKey="spend" fill="#FFCF4B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </motion.div>
  );
}
