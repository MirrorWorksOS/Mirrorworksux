import React, { useState } from 'react';
import { MoreVertical, FileText, Download, Eye, Calendar as CalendarIcon, User, Package } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

export function PlanProductionTab() {
  const [activeView, setActiveView] = useState<'list' | 'grid'>('list');

  // Mock data for products
  const products = [
    {
      id: 1,
      image: '🔩',
      name: 'Z-shaped-stand',
      status: 'Done',
      quantity: 12500,
      produced: 200,
      remaining: 12,
      date: '2024.01.01',
      assigned: ['U1', 'U2'],
      priority: 'high',
      tags: ['Tunnel period', 'Press broke']
    },
    {
      id: 2,
      image: '🔧',
      name: 'Hollow Stem',
      status: 'WIP',
      quantity: 850,
      produced: 0,
      remaining: 0,
      date: '2024.02.01',
      assigned: ['U1'],
      priority: 'medium',
      tags: []
    },
    {
      id: 3,
      image: '⚙️',
      name: 'Z-shaped-u-knurl',
      status: 'New',
      quantity: 600,
      produced: 0,
      remaining: 0,
      date: '2024.01.01',
      assigned: [],
      priority: 'low',
      tags: []
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Products Section */}
      <div className="bg-white border border-[#E5E5E5]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
          <div>
            <h2 className="font-['Geist:SemiBold',sans-serif] text-[18px] font-semibold text-[#0A0A0A] mb-1">
              Products
            </h2>
            <p className="font-['Geist:Regular',sans-serif] text-[14px] text-[#737373]">
              3 Products • 14,350 units total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-8 px-3 text-xs border border-[#E5E5E5] rounded hover:bg-[#FAFAFA] transition-colors">
              <Eye className="w-3.5 h-3.5 inline mr-1.5" />
              Filter
            </button>
            <button className="h-8 px-3 text-xs border border-[#E5E5E5] rounded hover:bg-[#FAFAFA] transition-colors">
              <Download className="w-3.5 h-3.5 inline mr-1.5" />
              Export
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div className="px-6 py-3 bg-[#FAFAFA] border-b border-[#E5E5E5]">
          <div className="grid grid-cols-12 gap-4 items-center font-['Geist:Medium',sans-serif] text-[12px] font-medium text-[#737373] uppercase tracking-wider">
            <div className="col-span-1"></div>
            <div className="col-span-2">Name</div>
            <div className="col-span-1">Produced</div>
            <div className="col-span-1">Quantity</div>
            <div className="col-span-1">Remaining</div>
            <div className="col-span-1">Date</div>
            <div className="col-span-2">Est Price</div>
            <div className="col-span-1">Operator</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-right">Action</div>
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-[#E5E5E5]">
          {products.map((product) => (
            <div key={product.id} className="px-6 py-4 hover:bg-[#FAFAFA] transition-colors">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Image/Icon */}
                <div className="col-span-1">
                  <div className="w-10 h-10 bg-[#F5F5F5] rounded flex items-center justify-center text-lg">
                    {product.image}
                  </div>
                </div>

                {/* Name */}
                <div className="col-span-2">
                  <p className="font-['Geist:Medium',sans-serif] text-[14px] font-medium text-[#0A0A0A]">
                    {product.name}
                  </p>
                  {product.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {product.tags.map((tag, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-[#FFCF4B] text-[10px] text-[#0A0A0A]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Produced */}
                <div className="col-span-1">
                  <p className="font-['Roboto_Mono:Regular',monospace] text-[13px] text-[#0A0A0A]">
                    {product.produced}
                  </p>
                </div>

                {/* Quantity */}
                <div className="col-span-1">
                  <p className="font-['Roboto_Mono:Regular',monospace] text-[13px] text-[#0A0A0A]">
                    {product.quantity.toLocaleString()}
                  </p>
                </div>

                {/* Remaining */}
                <div className="col-span-1">
                  <p className="font-['Roboto_Mono:Regular',monospace] text-[13px] text-[#0A0A0A]">
                    {product.remaining}
                  </p>
                </div>

                {/* Date */}
                <div className="col-span-1">
                  <p className="font-['Geist:Regular',sans-serif] text-[13px] text-[#737373]">
                    {product.date}
                  </p>
                </div>

                {/* Est Price - Progress Bar */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[#E5E5E5] rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full",
                          product.status === 'Done' ? 'bg-[#4CAF50]' :
                          product.status === 'WIP' ? 'bg-[#FFCF4B]' :
                          'bg-[#E5E5E5]'
                        )}
                        style={{ width: product.status === 'Done' ? '100%' : product.status === 'WIP' ? '50%' : '0%' }}
                      />
                    </div>
                    <span className="font-['Roboto_Mono:Regular',monospace] text-[11px] text-[#737373]">
                      {product.status === 'Done' ? '100%' : product.status === 'WIP' ? '50%' : '0%'}
                    </span>
                  </div>
                </div>

                {/* Operator */}
                <div className="col-span-1">
                  <div className="flex -space-x-1">
                    {product.assigned.map((user, i) => (
                      <div 
                        key={i}
                        className="w-6 h-6 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-[10px] font-medium border-2 border-white"
                      >
                        {user}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded",
                    product.status === 'Done' ? 'bg-[#4CAF50]/10 text-[#4CAF50]' :
                    product.status === 'WIP' ? 'bg-[#FFCF4B]/20 text-[#0A0A0A]' :
                    'bg-[#E5E5E5] text-[#737373]'
                  )}>
                    {product.status}
                  </span>
                </div>

                {/* Action */}
                <div className="col-span-1 text-right">
                  <button className="p-1 hover:bg-[#F5F5F5] rounded transition-colors">
                    <MoreVertical className="w-4 h-4 text-[#737373]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#FAFAFA] border-t border-[#E5E5E5] flex items-center justify-between">
          <p className="font-['Geist:Regular',sans-serif] text-[13px] text-[#737373]">
            Page 1 of 1
          </p>
          <div className="flex items-center gap-2">
            <button className="h-8 px-3 text-xs border border-[#E5E5E5] rounded hover:bg-white transition-colors">
              Previous
            </button>
            <button className="h-8 px-3 text-xs border border-[#E5E5E5] rounded hover:bg-white transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* MirrorView Section */}
      <div className="bg-white border border-[#E5E5E5]">
        <div className="px-6 py-4 border-b border-[#E5E5E5]">
          <h2 className="font-['Geist:SemiBold',sans-serif] text-[18px] font-semibold text-[#0A0A0A]">
            MirrorView
          </h2>
          <p className="font-['Geist:Regular',sans-serif] text-[14px] text-[#737373] mt-1">
            3D view of production progress
          </p>
        </div>
        <div className="p-6">
          <div className="aspect-video bg-[#FAFAFA] rounded flex items-center justify-center">
            <div className="text-center">
              <Package className="w-16 h-16 text-[#E5E5E5] mx-auto mb-3" />
              <p className="font-['Geist:Regular',sans-serif] text-[14px] text-[#737373]">
                3D Model View Placeholder
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions & Activities Section */}
      <div className="bg-white border border-[#E5E5E5]">
        <div className="px-6 py-4 border-b border-[#E5E5E5]">
          <h2 className="font-['Geist:SemiBold',sans-serif] text-[18px] font-semibold text-[#0A0A0A]">
            Instructions & Activities
          </h2>
          <p className="font-['Geist:Regular',sans-serif] text-[14px] text-[#737373] mt-1">
            Recent activities and production notes
          </p>
        </div>

        {/* Table Header */}
        <div className="px-6 py-3 bg-[#FAFAFA] border-b border-[#E5E5E5]">
          <div className="grid grid-cols-7 gap-4 items-center font-['Geist:Medium',sans-serif] text-[12px] font-medium text-[#737373] uppercase tracking-wider">
            <div>Partner</div>
            <div>Work Center</div>
            <div>Operation</div>
            <div>Minutes</div>
            <div>QC</div>
            <div>Operator ID</div>
            <div className="text-right">Status</div>
          </div>
        </div>

        {/* Table Rows - Mock Data */}
        <div className="divide-y divide-[#E5E5E5]">
          {[
            { partner: 'External-supplier-01', center: 'Tools X', operation: 'Weld, 3 production', minutes: '20', qc: 'Pass', operator: 'OP-14513', status: 'In progress' },
            { partner: 'Outram', center: 'Table 3', operation: 'Weld, 3 production', minutes: '20', qc: 'Pass', operator: 'OP-14513', status: 'In check' },
            { partner: 'Fillmore', center: 'Piece here', operation: 'Weld, 3 production', minutes: '20', qc: 'Pass', operator: 'OP-14513', status: 'Awaiting consumable' },
            { partner: 'Park', center: 'Table 3', operation: '50520 Sub', minutes: '20', qc: 'In progress', operator: 'OP-14513', status: 'Awaiting consumable' },
          ].map((row, i) => (
            <div key={i} className="px-6 py-4 hover:bg-[#FAFAFA] transition-colors">
              <div className="grid grid-cols-7 gap-4 items-center">
                <div className="font-['Geist:Regular',sans-serif] text-[13px] text-[#0A0A0A]">
                  {row.partner}
                </div>
                <div className="font-['Geist:Regular',sans-serif] text-[13px] text-[#737373]">
                  {row.center}
                </div>
                <div className="font-['Geist:Regular',sans-serif] text-[13px] text-[#737373]">
                  {row.operation}
                </div>
                <div className="font-['Roboto_Mono:Regular',monospace] text-[13px] text-[#0A0A0A]">
                  {row.minutes}
                </div>
                <div>
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded",
                    row.qc === 'Pass' ? 'bg-[#4CAF50]/10 text-[#4CAF50]' : 'bg-[#FFCF4B]/20 text-[#0A0A0A]'
                  )}>
                    {row.qc}
                  </span>
                </div>
                <div className="font-['Roboto_Mono:Regular',monospace] text-[13px] text-[#737373]">
                  {row.operator}
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 text-xs font-medium text-[#737373] bg-[#F5F5F5] rounded">
                    {row.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#FAFAFA] border-t border-[#E5E5E5] flex items-center justify-between">
          <p className="font-['Geist:Regular',sans-serif] text-[13px] text-[#737373]">
            Page 1 of 1
          </p>
        </div>
      </div>
    </div>
  );
}
