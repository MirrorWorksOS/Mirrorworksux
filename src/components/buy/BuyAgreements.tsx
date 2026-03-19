/**
 * Buy Agreements - Blanket Purchase Orders
 */

import React from 'react';
import { FileText } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';

const mockAgreements = [
  { id: '1', agreementNumber: 'BPA-2026-001', supplier: 'Hunter Steel Co', startDate: '2026-01-01', endDate: '2026-12-31', value: 250000, used: 89000, status: 'active' as const },
  { id: '2', agreementNumber: 'BPA-2025-012', supplier: 'Pacific Metals', startDate: '2025-07-01', endDate: '2026-06-30', value: 150000, used: 142000, status: 'active' as const },
];

export function BuyAgreements() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-[32px] tracking-tight text-[#1A2732]">Blanket Purchase Agreements</h1>
      <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">AGREEMENT #</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">SUPPLIER</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">PERIOD</th>
              <th className="px-4 py-3 text-right text-xs tracking-wider text-[#737373] font-medium">VALUE</th>
              <th className="px-4 py-3 text-right text-xs tracking-wider text-[#737373] font-medium">USED</th>
              <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] font-medium">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {mockAgreements.map((agr, idx) => (
              <tr key={agr.id} className={cn("border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] cursor-pointer", idx % 2 === 1 && "bg-[#FAFAFA]")}>
                <td className="px-4 font-['Roboto_Mono',monospace] text-sm text-[#0052CC]">{agr.agreementNumber}</td>
                <td className="px-4 text-sm text-[#0A0A0A]">{agr.supplier}</td>
                <td className="px-4 text-sm text-[#525252]">
                  {new Date(agr.startDate).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })} - {new Date(agr.endDate).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 text-right font-['Roboto_Mono',monospace] text-sm font-medium">${agr.value.toLocaleString()}</td>
                <td className="px-4 text-right font-['Roboto_Mono',monospace] text-sm font-medium">${agr.used.toLocaleString()}</td>
                <td className="px-4">
                  <div className="flex items-center justify-center">
                    <Badge className="bg-[#E3FCEF] text-[#36B37E] border-0">Active</Badge>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
