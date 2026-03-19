/**
 * Buy Requisitions - DataTable with status workflow
 * Status: Draft, Submitted, Approved, Rejected, Converted to PO
 */

import React, { useState } from 'react';
import { Plus, Filter, MoreVertical, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';
import { AnimatedPlus, AnimatedFilter } from '../ui/animated-icons';

const { animationVariants } = designSystem;

type ReqStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'converted';

interface Requisition {
  id: string;
  reqNumber: string;
  requestor: string;
  department: string;
  date: string;
  status: ReqStatus;
  total: number;
  items: number;
}

const mockRequisitions: Requisition[] = [
  { id: '1', reqNumber: 'REQ-2026-0089', requestor: 'Sarah Chen', department: 'Fabrication', date: '2026-03-18', status: 'submitted', total: 8500, items: 3 },
  { id: '2', reqNumber: 'REQ-2026-0088', requestor: 'Mike Thompson', department: 'Welding', date: '2026-03-17', status: 'approved', total: 3200, items: 2 },
  { id: '3', reqNumber: 'REQ-2026-0087', requestor: 'Emma Wilson', department: 'Finishing', date: '2026-03-15', status: 'converted', total: 12400, items: 5 },
  { id: '4', reqNumber: 'REQ-2026-0086', requestor: 'David Lee', department: 'Fabrication', date: '2026-03-14', status: 'rejected', total: 28000, items: 1 },
  { id: '5', reqNumber: 'REQ-2026-DRAFT-01', requestor: 'Sarah Chen', department: 'Fabrication', date: '2026-03-19', status: 'draft', total: 1500, items: 2 },
];

const getStatusBadge = (status: ReqStatus) => {
  switch (status) {
    case 'draft': return { bg: 'bg-[#F5F5F5]', text: 'text-[#737373]', label: 'Draft', dot: '#737373' };
    case 'submitted': return { bg: 'bg-[#DBEAFE]', text: 'text-[#0A7AFF]', label: 'Submitted', dot: '#0A7AFF' };
    case 'approved': return { bg: 'bg-[#E3FCEF]', text: 'text-[#36B37E]', label: 'Approved', dot: '#36B37E' };
    case 'rejected': return { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', label: 'Rejected', dot: '#EF4444' };
    case 'converted': return { bg: 'bg-[#E6F0FF]', text: 'text-[#0052CC]', label: 'Converted', dot: '#0052CC' };
  }
};

export function BuyRequisitions() {
  const [activeTab, setActiveTab] = useState<'all' | ReqStatus>('all');

  const filteredReqs = activeTab === 'all' ? mockRequisitions : mockRequisitions.filter(r => r.status === activeTab);

  return (
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] tracking-tight text-[#1A2732]">Purchase Requisitions</h1>
          <p className="text-sm text-[#737373] mt-1">{filteredReqs.length} requisitions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="h-10 gap-2 border-[#E5E5E5] group">
            <AnimatedFilter className="w-4 h-4" />
            Filter
          </Button>
          <Button className="h-10 px-5 bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732] rounded group">
            <AnimatedPlus className="w-4 h-4 mr-2" />
            New Requisition
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E5E5]">
        {(['all', 'draft', 'submitted', 'approved', 'rejected', 'converted'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn("px-4 py-2 text-[14px] border-b-2 transition-colors",
              activeTab === tab ? 'border-[#FFCF4B] text-[#0A0A0A] font-medium' : 'border-transparent text-[#737373] hover:text-[#0A0A0A]')}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
                <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">REQ #</th>
                <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">REQUESTOR</th>
                <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">DEPARTMENT</th>
                <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">DATE</th>
                <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] font-medium">STATUS</th>
                <th className="px-4 py-3 text-right text-xs tracking-wider text-[#737373] font-medium">ITEMS</th>
                <th className="px-4 py-3 text-right text-xs tracking-wider text-[#737373] font-medium">TOTAL</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filteredReqs.map((req, idx) => {
                const statusBadge = getStatusBadge(req.status);
                return (
                  <tr key={req.id} className={cn("border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] cursor-pointer transition-colors", idx % 2 === 1 && "bg-[#FAFAFA]")}>
                    <td className="px-4">
                      <a href={`/buy/requisitions/${req.id}`} className="text-[#0052CC] font-['Roboto_Mono',monospace] text-sm font-medium hover:underline flex items-center gap-1">
                        {req.reqNumber}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-4 text-sm text-[#0A0A0A]">{req.requestor}</td>
                    <td className="px-4 text-sm text-[#525252]">{req.department}</td>
                    <td className="px-4 text-sm text-[#525252]">{new Date(req.date).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td className="px-4">
                      <div className="flex items-center justify-center">
                        <Badge className={cn("rounded-full text-xs px-2 py-0.5 border-0 flex items-center gap-1.5", statusBadge.bg, statusBadge.text)}>
                          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusBadge.dot }} />
                          {statusBadge.label}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 text-right text-sm font-['Roboto_Mono',monospace]">{req.items}</td>
                    <td className="px-4 text-right text-sm font-['Roboto_Mono',monospace] font-medium">${req.total.toLocaleString()}</td>
                    <td className="px-4">
                      {req.status === 'submitted' && (
                        <div className="flex items-center gap-1">
                          <button className="p-1 hover:bg-[#E3FCEF] rounded transition-colors" title="Approve">
                            <CheckCircle2 className="w-4 h-4 text-[#36B37E]" />
                          </button>
                          <button className="p-1 hover:bg-[#FEE2E2] rounded transition-colors" title="Reject">
                            <XCircle className="w-4 h-4 text-[#EF4444]" />
                          </button>
                        </div>
                      )}
                      {req.status !== 'submitted' && (
                        <button className="p-1 hover:bg-[#F5F5F5] rounded transition-colors">
                          <MoreVertical className="w-4 h-4 text-[#737373]" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}
