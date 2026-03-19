/**
 * Plan Purchase - Material requirements planning (MRP)
 * Shows what needs to be ordered for production
 */

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';

const mockRequirements = [
  { id: '1', product: 'Mild Steel Sheet 1200x2400x3mm', required: 50, available: 15, shortfall: 35, job: 'JOB-2026-0012', dueDate: '2026-03-25' },
  { id: '2', product: 'Aluminium Angle 50x50x5mm', required: 20, available: 8, shortfall: 12, job: 'JOB-2026-0012', dueDate: '2026-03-25' },
  { id: '3', product: 'Welding Rod ER70S-6 4mm', required: 100, available: 150, shortfall: 0, job: 'JOB-2026-0011', dueDate: '2026-03-28' },
];

export function PlanPurchase() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] tracking-tight text-[#1A2732]">Material Requirements</h1>
        <Button className="bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732]">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Create PRs for Shortfalls
        </Button>
      </div>

      <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">PRODUCT</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">JOB</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">DUE DATE</th>
              <th className="px-4 py-3 text-right text-xs tracking-wider text-[#737373] font-medium">REQUIRED</th>
              <th className="px-4 py-3 text-right text-xs tracking-wider text-[#737373] font-medium">AVAILABLE</th>
              <th className="px-4 py-3 text-right text-xs tracking-wider text-[#737373] font-medium">SHORTFALL</th>
              <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] font-medium">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {mockRequirements.map((req, idx) => (
              <tr key={req.id} className={cn("border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] cursor-pointer", idx % 2 === 1 && "bg-[#FAFAFA]")}>
                <td className="px-4 text-sm text-[#0A0A0A]">{req.product}</td>
                <td className="px-4 font-['Roboto_Mono',monospace] text-sm text-[#0052CC]">{req.job}</td>
                <td className="px-4 text-sm text-[#525252]">{new Date(req.dueDate).toLocaleDateString('en-AU')}</td>
                <td className="px-4 text-right font-['Roboto_Mono',monospace] text-sm font-medium">{req.required}</td>
                <td className="px-4 text-right font-['Roboto_Mono',monospace] text-sm">{req.available}</td>
                <td className="px-4 text-right font-['Roboto_Mono',monospace] text-sm font-medium text-[#EF4444]">
                  {req.shortfall > 0 ? req.shortfall : '—'}
                </td>
                <td className="px-4">
                  <div className="flex items-center justify-center">
                    {req.shortfall > 0 ? (
                      <Badge className="bg-[#FEE2E2] text-[#EF4444] border-0">Shortage</Badge>
                    ) : (
                      <Badge className="bg-[#E3FCEF] text-[#36B37E] border-0">OK</Badge>
                    )}
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
