/**
 * Buy Bills - Supplier bills with three-way matching
 */

import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';

const { animationVariants } = designSystem;

const mockBills = [
  { id: '1', billNumber: 'BILL-2026-089', supplier: 'Hunter Steel Co', poNumber: 'PO-2026-0087', amount: 12400, status: 'matched' as const, matchStatus: { po: true, receipt: true, bill: true } },
  { id: '2', billNumber: 'BILL-2026-088', supplier: 'Pacific Metals', poNumber: 'PO-2026-0086', amount: 8500, status: 'pending' as const, matchStatus: { po: true, receipt: false, bill: true } },
  { id: '3', billNumber: 'BILL-2026-087', supplier: 'Sydney Welding', poNumber: 'PO-2026-0085', amount: 3200, status: 'mismatch' as const, matchStatus: { po: true, receipt: true, bill: true } },
];

export function BuyBills() {
  return (
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-6 space-y-6">
      <h1 className="text-[32px] tracking-tight text-[#1A2732]">Bills</h1>
      <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">BILL #</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">SUPPLIER</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">PO #</th>
              <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] font-medium">3-WAY MATCH</th>
              <th className="px-4 py-3 text-right text-xs tracking-wider text-[#737373] font-medium">AMOUNT</th>
              <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] font-medium">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {mockBills.map((bill, idx) => (
              <tr key={bill.id} className={cn("border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] cursor-pointer", idx % 2 === 1 && "bg-[#FAFAFA]")}>
                <td className="px-4 font-['Roboto_Mono',monospace] text-sm">{bill.billNumber}</td>
                <td className="px-4 text-sm text-[#0A0A0A]">{bill.supplier}</td>
                <td className="px-4 font-['Roboto_Mono',monospace] text-sm text-[#0052CC]">{bill.poNumber}</td>
                <td className="px-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", bill.matchStatus.po ? "bg-[#36B37E]" : "bg-[#EF4444]")} title="PO" />
                    <div className={cn("w-2 h-2 rounded-full", bill.matchStatus.receipt ? "bg-[#36B37E]" : "bg-[#EF4444]")} title="Receipt" />
                    <div className={cn("w-2 h-2 rounded-full", bill.matchStatus.bill ? "bg-[#36B37E]" : "bg-[#EF4444]")} title="Bill" />
                  </div>
                </td>
                <td className="px-4 text-right font-['Roboto_Mono',monospace] text-sm font-medium">${bill.amount.toLocaleString()}</td>
                <td className="px-4">
                  <div className="flex items-center justify-center gap-2">
                    {bill.status === 'matched' && (
                      <><CheckCircle2 className="w-4 h-4 text-[#36B37E]" /><span className="text-sm text-[#36B37E]">Matched</span></>
                    )}
                    {bill.status === 'pending' && (
                      <Badge className="bg-[#FFF4CC] text-[#805900] border-0">Pending</Badge>
                    )}
                    {bill.status === 'mismatch' && (
                      <><AlertTriangle className="w-4 h-4 text-[#EF4444]" /><span className="text-sm text-[#EF4444]">Mismatch</span></>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </motion.div>
  );
}
