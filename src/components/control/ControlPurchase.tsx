/**
 * Control Purchase - Supplier master data setup
 */

import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function ControlPurchase() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-[32px] tracking-tight text-[#1A2732]">Purchase Settings</h1>
      <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-[#0A0A0A] mb-4">Global Purchase Parameters</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Default Payment Terms</label>
            <select className="w-full h-10 px-3 border border-[#E5E5E5] rounded text-sm">
              <option>Net 30</option>
              <option>Net 60</option>
              <option>Net 90</option>
              <option>COD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Default Lead Time (days)</label>
            <Input type="number" className="border-[#E5E5E5]" defaultValue="14" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Auto-approve POs under</label>
            <Input type="number" className="border-[#E5E5E5]" defaultValue="1000" placeholder="Amount" />
          </div>
          <Button className="bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732]">Save Settings</Button>
        </div>
      </Card>
    </div>
  );
}
