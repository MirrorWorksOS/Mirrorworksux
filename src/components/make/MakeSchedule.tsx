/**
 * Make Schedule - Gantt chart and calendar views
 * Shows MO scheduling across work centers
 */

import React, { useState } from 'react';
import { Calendar, List } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';

const mockSchedule = [
  { id: '1', moNumber: 'MO-2026-0045', job: 'JOB-2026-0012', workCenter: 'Cutting', startDate: '2026-03-20', endDate: '2026-03-22', status: 'in_progress' as const },
  { id: '2', moNumber: 'MO-2026-0046', job: 'JOB-2026-0012', workCenter: 'Forming', startDate: '2026-03-22', endDate: '2026-03-24', status: 'scheduled' as const },
  { id: '3', moNumber: 'MO-2026-0044', job: 'JOB-2026-0011', workCenter: 'Welding', startDate: '2026-03-20', endDate: '2026-03-23', status: 'in_progress' as const },
  { id: '4', moNumber: 'MO-2026-0047', job: 'JOB-2026-0010', workCenter: 'Machining', startDate: '2026-03-23', endDate: '2026-03-25', status: 'scheduled' as const },
];

export function MakeSchedule() {
  const [viewMode, setViewMode] = useState<'gantt' | 'list'>('list');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] tracking-tight text-[#1A2732]">Production Schedule</h1>
        <div className="flex items-center border border-[#E5E5E5] rounded-lg p-1">
          <button onClick={() => setViewMode('list')} className={cn("p-2 rounded transition-all", viewMode === 'list' ? "bg-[#FFCF4B] text-[#2C2C2C]" : "text-[#737373] hover:bg-[#F5F5F5]")}>
            <List className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('gantt')} className={cn("p-2 rounded transition-all", viewMode === 'gantt' ? "bg-[#FFCF4B] text-[#2C2C2C]" : "text-[#737373] hover:bg-[#F5F5F5]")}>
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === 'list' && (
        <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
                <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">MO #</th>
                <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">JOB</th>
                <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">WORK CENTER</th>
                <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">START DATE</th>
                <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">END DATE</th>
                <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] font-medium">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {mockSchedule.map((mo, idx) => (
                <tr key={mo.id} className={cn("border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] cursor-pointer", idx % 2 === 1 && "bg-[#FAFAFA]")}>
                  <td className="px-4 font-['Roboto_Mono',monospace] text-sm text-[#0052CC]">{mo.moNumber}</td>
                  <td className="px-4 font-['Roboto_Mono',monospace] text-sm text-[#525252]">{mo.job}</td>
                  <td className="px-4 text-sm text-[#0A0A0A]">{mo.workCenter}</td>
                  <td className="px-4 text-sm text-[#525252]">{new Date(mo.startDate).toLocaleDateString('en-AU')}</td>
                  <td className="px-4 text-sm text-[#525252]">{new Date(mo.endDate).toLocaleDateString('en-AU')}</td>
                  <td className="px-4">
                    <div className="flex items-center justify-center">
                      <Badge className={cn("rounded-full text-xs px-2 py-0.5 border-0",
                        mo.status === 'in_progress' ? "bg-[#DBEAFE] text-[#0A7AFF]" : "bg-[#F5F5F5] text-[#737373]")}>
                        {mo.status === 'in_progress' ? 'In Progress' : 'Scheduled'}
                      </Badge>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {viewMode === 'gantt' && (
        <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
          <p className="text-sm text-[#737373] text-center">Gantt chart visualization would render here</p>
        </Card>
      )}
    </div>
  );
}
