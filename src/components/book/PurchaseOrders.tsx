import React, { useState } from 'react';
import { PlusCircle, Search, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, CheckCircle, AlertCircle, Circle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { cn } from '../ui/utils';

type POStatus = 'Draft' | 'Sent' | 'Acknowledged' | 'Partial' | 'Received' | 'Cancelled';

const statusStyles: Record<POStatus, string> = {
  Draft: 'bg-[#F5F5F5] text-[#737373]',
  Sent: 'bg-[#E6F0FF] text-[#0052CC]',
  Acknowledged: 'bg-[#E6F0FF] text-[#0052CC]',
  Partial: 'bg-[#FFF4CC] text-[#805900]',
  Received: 'bg-[#E6F7EF] text-[#1B7D4F]',
  Cancelled: 'bg-[#F5F5F5] text-[#A3A3A3]',
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
  if (match === 'green') return <CheckCircle className="w-4 h-4 text-[#36B37E]" />;
  if (match === 'yellow') return <AlertCircle className="w-4 h-4 text-[#FACC15]" />;
  return <Circle className="w-4 h-4 text-[#D4D4D4]" />;
};

export function PurchaseOrders() {
  const [activeTab, setActiveTab] = useState('All');

  return (
    <div className="p-6 space-y-5 overflow-y-auto max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between">
        <h1 className="text-[32px] tracking-tight text-[#1A2732]">Purchase Orders</h1>
        <Button className="h-10 px-5 bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732] rounded gap-2">
          <PlusCircle className="w-5 h-5" /> New PO
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
          <Input placeholder="Search purchase orders..." className="pl-9 h-10 bg-white border-[#E5E5E5] rounded text-sm" />
        </div>
        <Button variant="outline" size="sm" className="h-10 gap-2 border-[#E5E5E5]"><SlidersHorizontal className="w-4 h-4" /> Filter</Button>
        <Button variant="outline" size="sm" className="h-10 gap-2 border-[#E5E5E5]">Export <ChevronDown className="w-4 h-4" /></Button>
      </div>

      <div className="flex gap-0 border-b border-[#E5E5E5]">
        {TABS.map(tab => (
          <button key={tab.label} onClick={() => setActiveTab(tab.label)}
            className={cn("px-4 py-3 text-sm relative transition-colors", activeTab === tab.label ? "text-[#1A2732] font-medium" : "text-[#737373]")}>
            {tab.label} <span className="text-xs">({tab.count})</span>
            {activeTab === tab.label && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FFCF4B] rounded-t" />}
          </button>
        ))}
      </div>

      <Card className="bg-white rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[#E5E5E5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
                <th className="w-10 px-4 py-3"><Checkbox className="w-[18px] h-[18px]" /></th>
                {['PO #', 'VENDOR', 'ORDER DATE', 'EXPECTED DELIVERY', 'STATUS', 'TOTAL', 'JOB REF', 'MATCH', ''].map(h => (
                  <th key={h} className={cn("px-4 py-3 text-xs tracking-wider text-[#737373]", h === 'TOTAL' ? 'text-right' : h === 'MATCH' ? 'text-center' : 'text-left')} style={{ fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {POS.map((po, i) => (
                <tr key={po.id} className={cn("border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] transition-colors", i % 2 === 1 && "bg-[#FAFAFA]")}>
                  <td className="px-4"><Checkbox className="w-[18px] h-[18px]" /></td>
                  <td className="px-4 text-[13px] text-[#0052CC]" style={{ fontFamily: 'Roboto Mono, monospace' }}>{po.id}</td>
                  <td className="px-4 text-sm text-[#1A2732]">{po.vendor}</td>
                  <td className="px-4 text-sm text-[#525252]">{po.orderDate}</td>
                  <td className="px-4 text-sm text-[#525252]">{po.expectedDelivery}</td>
                  <td className="px-4"><Badge className={cn("rounded-full text-[11px] px-2 py-0.5 border-0", statusStyles[po.status])}>{po.status}</Badge></td>
                  <td className="px-4 text-right text-sm" style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: 500 }}>${po.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 text-[12px]" style={{ fontFamily: 'Roboto Mono, monospace', color: po.jobRef === '—' ? '#A3A3A3' : '#0052CC' }}>{po.jobRef}</td>
                  <td className="px-4 text-center"><MatchIcon match={po.match} /></td>
                  <td className="px-4"><Button variant="ghost" size="icon" className="w-9 h-9"><MoreHorizontal className="w-4 h-4 text-[#737373]" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E5E5]">
          <span className="text-xs text-[#737373]">Showing 1-8 of 89 purchase orders</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="w-8 h-8"><ChevronLeft className="w-4 h-4" /></Button>
            {[1, 2, 3].map(p => (
              <Button key={p} variant={p === 1 ? "default" : "ghost"} size="icon"
                className={cn("w-8 h-8 text-xs", p === 1 ? "bg-[#FFCF4B] text-[#1A2732] hover:bg-[#E6A600]" : "text-[#737373]")}>{p}</Button>
            ))}
            <Button variant="ghost" size="icon" className="w-8 h-8"><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
