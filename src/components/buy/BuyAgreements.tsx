/**
 * Buy Agreements — Blanket Purchase Agreements with spend tracking
 */
import React, { useState } from 'react';
import { Plus, Search, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';

const { animationVariants } = designSystem;

const AGREEMENTS = [
  {
    id: '1', agreementNumber: 'BPA-2026-003', supplier: 'Hunter Steel Co',
    category: 'Raw Materials', startDate: 'Jan 2026', endDate: 'Dec 2026',
    value: 300000, used: 89000, committed: 45000, status: 'active' as const,
    contact: 'James Sutton', phone: '+61 2 9301 1234', terms: 'Net 30', discount: '3%',
  },
  {
    id: '2', agreementNumber: 'BPA-2026-002', supplier: 'Pacific Metals',
    category: 'Raw Materials', startDate: 'Jan 2026', endDate: 'Dec 2026',
    value: 150000, used: 142000, committed: 5000, status: 'near-limit' as const,
    contact: 'Angela Torres', phone: '+61 3 9212 5678', terms: 'Net 30', discount: '2%',
  },
  {
    id: '3', agreementNumber: 'BPA-2026-001', supplier: 'Dulux Coatings',
    category: 'Consumables', startDate: 'Jan 2026', endDate: 'Jun 2026',
    value: 50000, used: 18000, committed: 4000, status: 'active' as const,
    contact: 'Brendan White', phone: '+61 2 8800 9988', terms: 'Net 14', discount: '5%',
  },
  {
    id: '4', agreementNumber: 'BPA-2025-005', supplier: 'Sydney Welding Supply',
    category: 'Consumables', startDate: 'Jul 2025', endDate: 'Jun 2026',
    value: 80000, used: 71000, committed: 9200, status: 'near-limit' as const,
    contact: 'Karen Olsen', phone: '+61 2 9748 1122', terms: 'Net 21', discount: '2.5%',
  },
  {
    id: '5', agreementNumber: 'BPA-2025-004', supplier: 'Fasteners Plus',
    category: 'Consumables', startDate: 'Jul 2025', endDate: 'Jun 2026',
    value: 30000, used: 30000, committed: 0, status: 'exhausted' as const,
    contact: 'Tom Brady', phone: '+61 7 3100 2233', terms: 'Net 30', discount: '1%',
  },
];

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string; barColor: string }> = {
  active:      { bg: 'bg-[#E3FCEF]', text: 'text-[#36B37E]', label: 'Active',     barColor: '#36B37E' },
  'near-limit':{ bg: 'bg-[#FFEDD5]', text: 'text-[#FF8B00]', label: 'Near limit', barColor: '#FF8B00' },
  exhausted:   { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', label: 'Exhausted',  barColor: '#EF4444' },
  expired:     { bg: 'bg-[#F5F5F5]', text: 'text-[#737373]', label: 'Expired',    barColor: '#A3A3A3' },
};

export function BuyAgreements() {
  const [search, setSearch] = useState('');

  const filtered = AGREEMENTS.filter(a =>
    a.supplier.toLowerCase().includes(search.toLowerCase()) ||
    a.agreementNumber.toLowerCase().includes(search.toLowerCase())
  );

  const totalCommitted = AGREEMENTS.reduce((s, a) => s + a.value, 0);
  const totalSpent     = AGREEMENTS.reduce((s, a) => s + a.used, 0);

  return (
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] tracking-tight text-[#0A0A0A]">Blanket agreements</h1>
          <p className="text-sm text-[#737373] mt-1">
            {AGREEMENTS.filter(a => a.status === 'active').length} active
            {AGREEMENTS.filter(a => a.status === 'near-limit').length > 0 && (
              <span className="text-[#FF8B00] ml-2">· {AGREEMENTS.filter(a => a.status === 'near-limit').length} near limit</span>
            )}
          </p>
        </div>
        <Button className="bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732] gap-2 h-10">
          <Plus className="w-4 h-4" /> New agreement
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total contracted', value: `$${totalCommitted.toLocaleString()}`, sub: `${AGREEMENTS.length} agreements` },
          { label: 'Total spent YTD',  value: `$${totalSpent.toLocaleString()}`,     sub: `${((totalSpent / totalCommitted) * 100).toFixed(0)}% utilised` },
          { label: 'Remaining',        value: `$${(totalCommitted - totalSpent).toLocaleString()}`, sub: 'Available to spend' },
        ].map(s => (
          <Card key={s.label} className="bg-white border border-[#E5E5E5] rounded-lg p-5">
            <p className="text-xs text-[#737373] font-medium mb-1">{s.label}</p>
            <p className="text-[22px] font-['Roboto_Mono',monospace] font-semibold text-[#0A0A0A]">{s.value}</p>
            <p className="text-xs text-[#737373] mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
        <Input placeholder="Search agreements…" value={search} onChange={e => setSearch(e.target.value)}
          className="pl-10 h-10 bg-[#F5F5F5] border-transparent rounded-lg text-sm" />
      </div>

      <div className="space-y-3">
        {filtered.map(agr => {
          const cfg        = STATUS_CONFIG[agr.status];
          const spendPct   = Math.min(100, ((agr.used + agr.committed) / agr.value) * 100);
          const usedPct    = Math.min(100, (agr.used / agr.value) * 100);
          const remaining  = agr.value - agr.used - agr.committed;

          return (
            <motion.div key={agr.id} variants={animationVariants.listItem}>
              <Card className="bg-white border border-[#E5E5E5] rounded-lg p-5 hover:shadow-md transition-shadow duration-150 cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-['Roboto_Mono',monospace] font-medium text-[#737373]">{agr.agreementNumber}</span>
                      <Badge className={cn('border-0 text-xs rounded-full px-2 py-0.5', cfg.bg, cfg.text)}>{cfg.label}</Badge>
                    </div>
                    <h3 className="text-[15px] font-semibold text-[#0A0A0A]">{agr.supplier}</h3>
                    <p className="text-xs text-[#737373] mt-0.5">{agr.category} · {agr.startDate} – {agr.endDate} · {agr.discount} discount · {agr.terms}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#737373]">Contract value</p>
                    <p className="text-[18px] font-['Roboto_Mono',monospace] font-semibold text-[#0A0A0A]">${agr.value.toLocaleString()}</p>
                  </div>
                </div>

                {/* Spend bar */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#737373]">Spend utilisation</span>
                    <span className="font-['Roboto_Mono',monospace] text-[#0A0A0A] font-medium">{spendPct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
                    {/* Used (solid) */}
                    <div className="h-full rounded-full relative">
                      <div className="absolute inset-y-0 left-0 rounded-l-full" style={{ width: `${usedPct}%`, backgroundColor: cfg.barColor }} />
                      {/* Committed (lighter) */}
                      <div className="absolute inset-y-0 rounded-full opacity-40" style={{ left: `${usedPct}%`, width: `${spendPct - usedPct}%`, backgroundColor: cfg.barColor }} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm pt-3 border-t border-[#F5F5F5]">
                  <div>
                    <p className="text-xs text-[#737373] mb-0.5">Spent</p>
                    <p className="font-['Roboto_Mono',monospace] font-medium">${agr.used.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#737373] mb-0.5">Committed</p>
                    <p className="font-['Roboto_Mono',monospace] font-medium text-[#FF8B00]">${agr.committed.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#737373] mb-0.5">Remaining</p>
                    <p className={cn('font-[\'Roboto_Mono\',monospace] font-medium', remaining <= 0 ? 'text-[#EF4444]' : remaining < agr.value * 0.1 ? 'text-[#FF8B00]' : 'text-[#36B37E]')}>
                      ${remaining.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
