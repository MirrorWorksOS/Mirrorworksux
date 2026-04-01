import React, { useState } from 'react';
import { PlusCircle, Search, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, CheckCircle, AlertCircle, Circle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { cn } from '../ui/utils';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { toast } from 'sonner';

type POStatus = 'Draft' | 'Sent' | 'Acknowledged' | 'Partial' | 'Received' | 'Cancelled';

const statusStyles: Record<POStatus, string> = {
  Draft: 'bg-[var(--neutral-100)] text-[var(--neutral-500)]',
  Sent: 'bg-[var(--neutral-100)] text-[var(--mw-mirage)]',
  Acknowledged: 'bg-[var(--neutral-100)] text-[var(--mw-mirage)]',
  Partial: 'bg-[var(--mw-amber-50)] text-[var(--mw-yellow-900)]',
  Received: 'bg-[var(--neutral-100)] text-[var(--mw-mirage)]',
  Cancelled: 'bg-[var(--neutral-100)] text-[var(--neutral-400)]',
};

interface PO {
  id: string; vendor: string; orderDate: string; expectedDelivery: string; status: POStatus; total: number; jobRef: string; match: 'green' | 'yellow' | 'grey';
}

const POS: PO[] = [
  { id: 'PO-2026-034', vendor: 'Blackwoods Steel', orderDate: '22 Feb', expectedDelivery: '01 Mar', status: 'Sent', total: 4850, jobRef: 'JOB-2026-0012', match: 'grey' },
  { id: 'PO-2026-033', vendor: 'BOC Gas', orderDate: '20 Feb', expectedDelivery: '25 Feb', status: 'Received', total: 670, jobRef: '—', match: 'green' },
  { id: 'PO-2026-032', vendor: 'OneSteel', orderDate: '18 Feb', expectedDelivery: '28 Feb', status: 'Partial', total: 12300, jobRef: 'JOB-2026-0010', match: 'yellow' },
  { id: 'PO-2026-031', vendor: 'Kemppi', orderDate: '15 Feb', expectedDelivery: '22 Feb', status: 'Received', total: 2100, jobRef: '—', match: 'green' },
  { id: 'PO-2026-030', vendor: 'Dulux Powder Coats', orderDate: '12 Feb', expectedDelivery: '19 Feb', status: 'Received', total: 1450, jobRef: 'JOB-2026-0012', match: 'green' },
  { id: 'PO-2026-029', vendor: 'Bolt & Nut', orderDate: '10 Feb', expectedDelivery: '15 Feb', status: 'Received', total: 340, jobRef: '—', match: 'green' },
  { id: 'PO-2026-028', vendor: 'Lincoln Electric', orderDate: '08 Feb', expectedDelivery: '14 Feb', status: 'Draft', total: 2800, jobRef: 'JOB-2026-0008', match: 'grey' },
  { id: 'PO-2026-027', vendor: 'Freight Corp', orderDate: '05 Feb', expectedDelivery: '12 Feb', status: 'Cancelled', total: 450, jobRef: '—', match: 'grey' },
];

const TABS = [
  { label: 'All', count: 89 }, { label: 'Draft', count: 12 }, { label: 'Sent', count: 23 },
  { label: 'Partial', count: 8 }, { label: 'Received', count: 41 }, { label: 'Cancelled', count: 5 },
];

const MatchIcon = ({ match }: { match: string }) => {
  if (match === 'green') return <CheckCircle className="w-4 h-4 text-[var(--mw-mirage)]" />;
  if (match === 'yellow') return <AlertCircle className="w-4 h-4 text-[var(--mw-yellow-400)]" />;
  return <Circle className="w-4 h-4 text-[var(--neutral-300)]" />;
};

export function PurchaseOrders() {
  const [activeTab, setActiveTab] = useState('All');

  return (
    <PageShell className="mx-auto max-w-[1200px] overflow-y-auto">
      <PageHeader
        title="Purchase orders"
        actions={
          <Button className="h-12 gap-2 rounded-full bg-[var(--mw-yellow-400)] px-5 text-[var(--neutral-900)] hover:bg-[var(--mw-yellow-500)]">
            <PlusCircle className="h-5 w-5" /> New PO
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
          <Input placeholder="Search purchase orders..." className="pl-9 h-10 bg-white border-[var(--border)] rounded text-sm" />
        </div>
        <Button variant="outline" size="sm" className="h-10 gap-2 rounded-full border-[var(--border)]" onClick={() => toast('Filter panel coming soon')}><SlidersHorizontal className="w-4 h-4" /> Filter</Button>
        <Button variant="outline" size="sm" className="h-10 gap-2 rounded-full border-[var(--border)]" onClick={() => toast.success('Exporting purchase orders…')}>Export <ChevronDown className="w-4 h-4" /></Button>
      </div>

      <div className="flex gap-0 border-b border-[var(--border)]">
        {TABS.map(tab => (
          <button key={tab.label} onClick={() => setActiveTab(tab.label)}
            className={cn("px-4 py-3 text-sm relative transition-colors", activeTab === tab.label ? "text-[var(--mw-mirage)] font-medium" : "text-[var(--neutral-500)]")}>
            {tab.label} <span className="text-xs">({tab.count})</span>
            {activeTab === tab.label && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--mw-yellow-400)] rounded-t" />}
          </button>
        ))}
      </div>

      <Card className="bg-white rounded-[var(--shape-lg)] shadow-xs border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
                <th className="w-10 px-4 py-3"><Checkbox className="w-[18px] h-[18px]" /></th>
                {['PO #', 'VENDOR', 'ORDER DATE', 'EXPECTED DELIVERY', 'STATUS', 'TOTAL', 'JOB REF', 'MATCH', ''].map(h => (
                  <th key={h} className={cn("px-4 py-3 text-xs tracking-wider text-[var(--neutral-500)] font-medium", h === 'TOTAL' ? 'text-right' : h === 'MATCH' ? 'text-center' : 'text-left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {POS.map((po, i) => (
                <tr key={po.id} className={cn("border-b border-[var(--neutral-100)] h-14 hover:bg-[var(--accent)] transition-colors", i % 2 === 1 && "bg-[var(--neutral-100)]")}>
                  <td className="px-4"><Checkbox className="w-[18px] h-[18px]" /></td>
                  <td className="px-4 text-xs text-[var(--mw-mirage)] tabular-nums">{po.id}</td>
                  <td className="px-4 text-sm text-[var(--mw-mirage)]">{po.vendor}</td>
                  <td className="px-4 text-sm text-[var(--neutral-600)]">{po.orderDate}</td>
                  <td className="px-4 text-sm text-[var(--neutral-600)]">{po.expectedDelivery}</td>
                  <td className="px-4"><Badge className={cn("rounded-full text-xs px-2 py-0.5 border-0", statusStyles[po.status])}>{po.status}</Badge></td>
                  <td className="px-4 text-right text-sm tabular-nums font-medium">${po.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 text-xs tabular-nums" style={{ color: po.jobRef === '—' ? 'var(--neutral-400)' : 'var(--mw-info)' }}>{po.jobRef}</td>
                  <td className="px-4 text-center"><MatchIcon match={po.match} /></td>
                  <td className="px-4"><Button variant="ghost" size="icon" className="w-9 h-9"><MoreHorizontal className="w-4 h-4 text-[var(--neutral-500)]" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
          <span className="text-xs text-[var(--neutral-500)]">Showing 1-8 of 89 purchase orders</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="w-8 h-8"><ChevronLeft className="w-4 h-4" /></Button>
            {[1, 2, 3].map(p => (
              <Button key={p} variant={p === 1 ? "default" : "ghost"} size="icon"
                className={cn("w-8 h-8 text-xs", p === 1 ? "bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)] hover:bg-[var(--mw-yellow-600)]" : "text-[var(--neutral-500)]")}>{p}</Button>
            ))}
            <Button variant="ghost" size="icon" className="w-8 h-8"><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
