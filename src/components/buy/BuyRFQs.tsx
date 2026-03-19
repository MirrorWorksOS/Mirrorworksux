/**
 * Buy RFQs - Request for Quotations management
 * Simple list view with status badges
 */

import React from 'react';
import { Plus, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';
import { AnimatedPlus } from '../ui/animated-icons';

const { animationVariants } = designSystem;

const mockRFQs = [
  { id: '1', rfqNumber: 'RFQ-2026-0012', title: 'Structural Steel Package', suppliers: 3, responses: 2, dueDate: '2026-03-28', status: 'open' as const },
  { id: '2', rfqNumber: 'RFQ-2026-0011', title: 'Aluminium Extrusions', suppliers: 4, responses: 4, dueDate: '2026-03-22', status: 'closed' as const },
];

export function BuyRFQs() {
  return (
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] tracking-tight text-[#1A2732]">RFQs</h1>
        <Button className="h-10 px-5 bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732]">
          <AnimatedPlus className="w-4 h-4 mr-2" />
          New RFQ
        </Button>
      </div>
      <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">RFQ #</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">TITLE</th>
              <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] font-medium">SUPPLIERS</th>
              <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] font-medium">RESPONSES</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">DUE DATE</th>
              <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] font-medium">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {mockRFQs.map((rfq, idx) => (
              <tr key={rfq.id} className={cn("border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] cursor-pointer", idx % 2 === 1 && "bg-[#FAFAFA]")}>
                <td className="px-4">
                  <a href={`/buy/rfqs/${rfq.id}`} className="text-[#0052CC] font-['Roboto_Mono',monospace] text-sm hover:underline flex items-center gap-1">
                    {rfq.rfqNumber}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
                <td className="px-4 text-sm text-[#0A0A0A]">{rfq.title}</td>
                <td className="px-4 text-center text-sm">{rfq.suppliers}</td>
                <td className="px-4 text-center text-sm">{rfq.responses}</td>
                <td className="px-4 text-sm text-[#525252]">{new Date(rfq.dueDate).toLocaleDateString('en-AU')}</td>
                <td className="px-4">
                  <div className="flex items-center justify-center">
                    <Badge className={cn("rounded-full text-xs px-2 py-0.5 border-0",
                      rfq.status === 'open' ? "bg-[#DBEAFE] text-[#0A7AFF]" : "bg-[#E3FCEF] text-[#36B37E]")}>
                      {rfq.status === 'open' ? 'Open' : 'Closed'}
                    </Badge>
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
