/**
 * Control Products - Central product definition
 */

import React from 'react';
import { Package } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

const mockProducts = [
  { id: '1', name: 'Server Rack Chassis', sku: 'PROD-SR-001', category: 'Finished Goods', type: 'Manufactured' },
  { id: '2', name: 'Mild Steel Sheet', sku: 'MAT-MS-001', category: 'Raw Materials', type: 'Purchased' },
  { id: '3', name: 'Welding Rod', sku: 'CONS-WR-001', category: 'Consumables', type: 'Purchased' },
];

export function ControlProducts() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] tracking-tight text-[#1A2732]">Product Master</h1>
        <Button className="bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732]">+ New Product</Button>
      </div>
      <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">PRODUCT</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">SKU</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">CATEGORY</th>
              <th className="px-4 py-3 text-center text-xs tracking-wider text-[#737373] font-medium">TYPE</th>
            </tr>
          </thead>
          <tbody>
            {mockProducts.map((product, idx) => (
              <tr key={product.id} className="border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] cursor-pointer">
                <td className="px-4 text-sm text-[#0A0A0A]">{product.name}</td>
                <td className="px-4 font-['Roboto_Mono',monospace] text-sm text-[#525252]">{product.sku}</td>
                <td className="px-4">
                  <Badge className="bg-[#F5F5F5] text-[#525252] border-0 text-xs">{product.category}</Badge>
                </td>
                <td className="px-4">
                  <div className="flex items-center justify-center">
                    <Badge className={product.type === 'Manufactured' ? "bg-[#DBEAFE] text-[#0A7AFF] border-0 text-xs" : "bg-[#E3FCEF] text-[#36B37E] border-0 text-xs"}>
                      {product.type}
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
