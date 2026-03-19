/**
 * Control Machines - Work centre master data
 */

import React from 'react';
import { Wrench } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';

const mockMachines = [
  { id: '1', name: 'Laser Cutter #1', workCenter: 'Cutting', capacity: 8, status: 'active' },
  { id: '2', name: 'Press Brake #2', workCenter: 'Forming', capacity: 8, status: 'active' },
  { id: '3', name: 'Welding Station A', workCenter: 'Welding', capacity: 8, status: 'active' },
  { id: '4', name: 'CNC Mill #3', workCenter: 'Machining', capacity: 8, status: 'maintenance' },
];

export function ControlMachines() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] tracking-tight text-[#1A2732]">Machines</h1>
        <Button className="bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732]">+ New Machine</Button>
      </div>
      <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">MACHINE</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">WORK CENTER</th>
              <th className="px-4 py-3 text-right text-xs tracking-wider text-[#737373] font-medium">CAPACITY (hrs/day)</th>
              <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] font-medium">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {mockMachines.map((machine, idx) => (
              <tr key={machine.id} className={cn("border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] cursor-pointer", idx % 2 === 1 && "bg-[#FAFAFA]")}>
                <td className="px-4 text-sm text-[#0A0A0A]">{machine.name}</td>
                <td className="px-4 text-sm text-[#525252]">{machine.workCenter}</td>
                <td className="px-4 text-right font-['Roboto_Mono',monospace] text-sm">{machine.capacity}</td>
                <td className="px-4">
                  <div className="flex items-center justify-center">
                    <Badge className={cn("rounded-full text-xs px-2 py-0.5 border-0",
                      machine.status === 'active' ? "bg-[#E3FCEF] text-[#36B37E]" : "bg-[#FFF4CC] text-[#805900]")}>
                      {machine.status === 'active' ? 'Active' : 'Maintenance'}
                    </Badge>
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
