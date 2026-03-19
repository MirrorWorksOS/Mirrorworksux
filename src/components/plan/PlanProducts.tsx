/**
 * Plan Products - Read-only product catalog (from Sell module)
 */

import React from 'react';
import { Package, ExternalLink } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';

const mockProducts = [
  { id: '1', name: 'Server Rack Chassis - Custom', sku: 'PROD-SR-001', category: 'Finished Goods', leadTime: 12, routingSteps: 8 },
  { id: '2', name: 'Structural Bracket Type A', sku: 'PROD-BR-042', category: 'Finished Goods', leadTime: 5, routingSteps: 4 },
  { id: '3', name: 'Aluminium Enclosure 400x300x200', sku: 'PROD-EN-156', category: 'Finished Goods', leadTime: 8, routingSteps: 6 },
];

export function PlanProducts() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] tracking-tight text-[#1A2732]">Products</h1>
        <p className="text-sm text-[#737373]">Product master data managed in Sell module</p>
      </div>

      <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">PRODUCT</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">SKU</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] font-medium">CATEGORY</th>
              <th className="px-4 py-3 text-right text-xs tracking-wider text-[#737373] font-medium">LEAD TIME</th>
              <th className="px-4 py-3 text-right text-xs tracking-wider text-[#737373] font-medium">ROUTING STEPS</th>
            </tr>
          </thead>
          <tbody>
            {mockProducts.map((product, idx) => (
              <tr key={product.id} className={cn("border-b border-[#F5F5F5] h-14 hover:bg-[#FFFBF0] cursor-pointer", idx % 2 === 1 && "bg-[#FAFAFA]")}>
                <td className="px-4">
                  <a href={`/sell/products/${product.id}`} className="text-sm text-[#0052CC] hover:underline flex items-center gap-1">
                    {product.name}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
                <td className="px-4 font-['Roboto_Mono',monospace] text-sm text-[#525252]">{product.sku}</td>
                <td className="px-4">
                  <Badge className="bg-[#F5F5F5] text-[#525252] border-0 text-xs">{product.category}</Badge>
                </td>
                <td className="px-4 text-right font-['Roboto_Mono',monospace] text-sm">{product.leadTime} days</td>
                <td className="px-4 text-right font-['Roboto_Mono',monospace] text-sm">{product.routingSteps}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
