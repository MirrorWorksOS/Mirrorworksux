/**
 * Design Factory Layout - Canvas-based layout designer
 * Placeholder for future canvas implementation
 */

import React from 'react';
import { Layout, Info } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export function DesignFactoryLayout() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] tracking-tight text-[#1A2732]">Factory Layout Designer</h1>
        <Button className="bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732]">
          <Layout className="w-4 h-4 mr-2" />
          New Layout
        </Button>
      </div>

      <Card className="bg-[#FFCF4B] border-2 border-[#2C2C2C] rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[#2C2C2C] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-['Geist:SemiBold',sans-serif] text-[16px] font-semibold text-[#2C2C2C] mb-2">
              Canvas-Based Layout Designer
            </h3>
            <p className="text-sm text-[#2C2C2C] leading-relaxed">
              This module will provide a drag-and-drop canvas interface for designing factory floor layouts, 
              positioning machines, defining work centers, and planning material flow paths. Implementation requires 
              HTML5 Canvas or similar library (e.g., Konva, Fabric.js).
            </p>
          </div>
        </div>
      </Card>

      <Card className="bg-white border border-[#E5E5E5] rounded-lg p-12">
        <div className="text-center">
          <Layout className="w-16 h-16 text-[#737373] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#0A0A0A] mb-2">Layout Designer Coming Soon</h3>
          <p className="text-sm text-[#737373]">Interactive canvas for factory floor planning</p>
        </div>
      </Card>
    </div>
  );
}
