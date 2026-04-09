/**
 * Buy Agreements — Blanket Purchase Agreements with spend tracking
 */
import React, { useState } from 'react';
import { Plus, Search, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { SpotlightCard } from '@/components/shared/surfaces/SpotlightCard';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';


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
  active:      { bg: 'bg-[var(--neutral-100)]', text: 'text-foreground', label: 'Active',     barColor: 'var(--mw-yellow-400)' },
  'near-limit':{ bg: 'bg-[var(--mw-amber-100)]', text: 'text-[var(--mw-amber)]', label: 'Near limit', barColor: 'var(--mw-amber)' },
  exhausted:   { bg: 'bg-[var(--mw-error-100)]', text: 'text-[var(--mw-error)]', label: 'Exhausted',  barColor: 'var(--mw-error)' },
  expired:     { bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-500)]', label: 'Expired',    barColor: 'var(--neutral-400)' },
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
    <PageShell>
      <PageHeader
        title="Blanket agreements"
        subtitle={`${AGREEMENTS.filter(a => a.status === 'active').length} active${AGREEMENTS.filter(a => a.status === 'near-limit').length > 0 ? ` · ${AGREEMENTS.filter(a => a.status === 'near-limit').length} near limit` : ''}`}
        actions={
          <Button className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground gap-2 h-10">
            <Plus className="w-4 h-4" /> New agreement
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-3 items-stretch gap-4">
        {[
          { label: 'Total contracted', value: `$${totalCommitted.toLocaleString()}`, sub: `${AGREEMENTS.length} agreements` },
          { label: 'Total spent YTD',  value: `$${totalSpent.toLocaleString()}`,     sub: `${((totalSpent / totalCommitted) * 100).toFixed(0)}% utilised` },
          { label: 'Remaining',        value: `$${(totalCommitted - totalSpent).toLocaleString()}`, sub: 'Available to spend' },
        ].map(s => (
          <SpotlightCard key={s.label} radius="rounded-[var(--shape-lg)]" className="h-full min-h-0">
            <Card variant="flat" className="h-full border-[var(--border)] p-6">
              <p className="mb-1 text-xs font-medium text-[var(--neutral-500)]">{s.label}</p>
              <p className="text-xl font-medium tabular-nums text-foreground">{s.value}</p>
              <p className="mt-0.5 text-xs text-[var(--neutral-500)]">{s.sub}</p>
            </Card>
          </SpotlightCard>
        ))}
      </div>

      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
        <Input placeholder="Search agreements…" value={search} onChange={e => setSearch(e.target.value)}
          className="pl-10 h-10 bg-[var(--neutral-100)] border-transparent rounded-xl text-sm" />
      </div>

      <div className="space-y-3">
        {filtered.map(agr => {
          const cfg        = STATUS_CONFIG[agr.status];
          const spendPct   = Math.min(100, ((agr.used + agr.committed) / agr.value) * 100);
          const usedPct    = Math.min(100, (agr.used / agr.value) * 100);
          const remaining  = agr.value - agr.used - agr.committed;

          return (
            <motion.div key={agr.id} variants={staggerItem} className="h-full min-h-0">
              <SpotlightCard radius="rounded-[var(--shape-lg)]" className="h-full min-h-0">
                <Card
                  variant="flat"
                  className="group h-full cursor-pointer border-[var(--border)] p-6 transition-colors duration-[var(--duration-medium1)] ease-[var(--ease-standard)]"
                >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm  font-medium text-[var(--neutral-500)]">{agr.agreementNumber}</span>

                      <StatusBadge variant={agr.status === 'active' ? 'success' : agr.status === 'near-limit' ? 'warning' : agr.status === 'exhausted' ? 'error' : 'neutral'}>{cfg.label}</StatusBadge>
                    </div>
                    <h3 className="text-sm font-medium text-foreground">{agr.supplier}</h3>
                    <p className="text-xs text-[var(--neutral-500)] mt-0.5">{agr.category} · {agr.startDate} – {agr.endDate} · {agr.discount} discount · {agr.terms}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--neutral-500)]">Contract value</p>
                    <p className="text-lg font-medium tabular-nums text-foreground">${agr.value.toLocaleString()}</p>
                  </div>
                </div>

                {/* Spend bar */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--neutral-500)]">Spend utilisation</span>
                    <span className=" text-foreground font-medium">{spendPct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-[var(--neutral-100)] rounded-full overflow-hidden">
                    {/* Used (solid) */}
                    <div className="h-full rounded-full relative">
                      <div className="absolute inset-y-0 left-0 rounded-l-full" style={{ width: `${usedPct}%`, backgroundColor: cfg.barColor }} />
                      {/* Committed (lighter) */}
                      <div className="absolute inset-y-0 rounded-full opacity-40" style={{ left: `${usedPct}%`, width: `${spendPct - usedPct}%`, backgroundColor: cfg.barColor }} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm pt-3 border-t border-[var(--border)]">
                  <div>
                    <p className="text-xs text-[var(--neutral-500)] mb-0.5">Spent</p>
                    <p className="font-medium tabular-nums">${agr.used.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--neutral-500)] mb-0.5">Committed</p>
                    <p className="font-medium tabular-nums text-[var(--mw-amber)]">${agr.committed.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--neutral-500)] mb-0.5">Remaining</p>
                    <p className={cn('tabular-nums font-medium', remaining <= 0 ? 'text-[var(--mw-error)]' : remaining < agr.value * 0.1 ? 'text-[var(--mw-amber)]' : 'text-foreground')}>
                      ${remaining.toLocaleString()}
                    </p>
                  </div>
                </div>
                </Card>
              </SpotlightCard>
            </motion.div>
          );
        })}
      </div>
    </PageShell>
  );
}
