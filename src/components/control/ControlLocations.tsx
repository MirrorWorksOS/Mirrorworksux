/**
 * Control Locations - Factory sites list
 */

import React from 'react';
import { MapPin, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { AnimatedPlus } from '../ui/animated-icons';

const mockLocations = [
  { id: '1', name: 'Main Factory - Sydney', address: '123 Industrial Rd, Sydney NSW 2000', type: 'Factory', status: 'Active' },
  { id: '2', name: 'Warehouse - Melbourne', address: '456 Storage Ave, Melbourne VIC 3000', type: 'Warehouse', status: 'Active' },
];

export function ControlLocations() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] tracking-tight text-[#1A2732]">Locations</h1>
        <Button className="bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732]">
          <AnimatedPlus className="w-4 h-4 mr-2" />
          New Location
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockLocations.map(loc => (
          <Card key={loc.id} className="bg-white border border-[#E5E5E5] rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start gap-3 mb-3">
              <MapPin className="w-5 h-5 text-[#0052CC]" />
              <div>
                <h3 className="font-['Geist:SemiBold',sans-serif] text-[14px] font-semibold text-[#0A0A0A]">{loc.name}</h3>
                <p className="text-sm text-[#737373] mt-1">{loc.address}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#525252]">{loc.type}</span>
              <span className="text-[#36B37E]">{loc.status}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
