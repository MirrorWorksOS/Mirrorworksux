/**
 * Control Inventory - Inventory master data settings
 */

import React from 'react';
import { Package } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';

export function ControlInventory() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-[32px] tracking-tight text-[#1A2732]">Inventory Settings</h1>
      <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-[#0A0A0A] mb-4">Global Inventory Parameters</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Default Reorder Method</label>
            <select className="w-full h-10 px-3 border border-[#E5E5E5] rounded text-sm">
              <option>Manual</option>
              <option>Auto (Min/Max)</option>
              <option>MRP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Stock Valuation Method</label>
            <select className="w-full h-10 px-3 border border-[#E5E5E5] rounded text-sm">
              <option>FIFO</option>
              <option>LIFO</option>
              <option>Average</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Low Stock Warning Threshold (%)</label>
            <Input type="number" className="border-[#E5E5E5]" defaultValue="20" />
          </div>
          <Button className="bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732]">Save Settings</Button>
        </div>
      </Card>
    </div>
  );
}
