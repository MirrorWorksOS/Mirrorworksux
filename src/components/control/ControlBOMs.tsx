/**
 * Control BOMs - Bill of Materials management
 */

import React from 'react';
import { FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

const mockBOMs = [
  { id: '1', product: 'Server Rack Chassis', bomVersion: 'v1.2', componentCount: 12, status: 'active' },
  { id: '2', product: 'Structural Bracket Type A', bomVersion: 'v1.0', componentCount: 5, status: 'active' },
  { id: '3', product: 'Aluminium Enclosure', bomVersion: 'v2.1', componentCount: 8, status: 'active' },
];

export function ControlBOMs() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] tracking-tight text-[#1A2732]">Bills of Materials</h1>
        <Button className="bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732]">+ New BOM</Button>
      </div>
      <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">PRODUCT</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">VERSION</th>
              <th className="px-4 py-3 text-right text-xs tracking-wider text-[#737373] font-medium">COMPONENTS</th>
              <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] font-medium">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {mockBOMs.map((bom, idx) => (
              <tr key={bom.id} className="border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] cursor-pointer">
                <td className="px-4 text-sm text-[#0A0A0A]">{bom.product}</td>
                <td className="px-4 font-['Roboto_Mono',monospace] text-sm text-[#525252]">{bom.bomVersion}</td>
                <td className="px-4 text-right font-['Roboto_Mono',monospace] text-sm">{bom.componentCount}</td>
                <td className="px-4">
                  <div className="flex items-center justify-center">
                    <Badge className="bg-[#E3FCEF] text-[#36B37E] border-0 text-xs">Active</Badge>
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
