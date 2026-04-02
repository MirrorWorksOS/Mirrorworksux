/**
 * Buy Products - Product catalog filtered for procurement
 * Shows stock levels, reorder points, preferred suppliers
 */

import React from 'react';
import { Package, AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '../ui/utils';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';


const mockProducts = [
  { id: '1', name: 'Mild Steel Sheet 1200x2400x3mm', sku: 'MAT-MS-001', stock: 15, reorder: 20, preferredSupplier: 'Hunter Steel Co' },
  { id: '2', name: 'Aluminium Angle 50x50x5mm', sku: 'MAT-AL-042', stock: 8, reorder: 15, preferredSupplier: 'Pacific Metals' },
  { id: '3', name: 'Welding Rod ER70S-6 4mm', sku: 'CONS-WR-001', stock: 45, reorder: 50, preferredSupplier: 'Sydney Welding' },
];

export function BuyProducts() {
  return (
    <PageShell>
      <PageHeader title="Products" />
      <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--neutral-100)] border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">PRODUCT</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">SKU</th>
              <th className="px-4 py-3 text-right text-xs tracking-wider text-[var(--neutral-500)] font-medium">STOCK</th>
              <th className="px-4 py-3 text-right text-xs tracking-wider text-[var(--neutral-500)] font-medium">REORDER</th>
              <th className="px-4 py-3 text-left text-xs tracking-wider text-[var(--neutral-500)] font-medium">PREFERRED SUPPLIER</th>
              <th className="px-4 py-3 text-center text-xs tracking-wider text-[var(--neutral-500)] font-medium">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {mockProducts.map((product, idx) => (
              <tr key={product.id} className={cn("border-b border-[var(--border)] h-14 hover:bg-[var(--accent)] cursor-pointer", idx % 2 === 1 && "bg-[var(--neutral-100)]")}>
                <td className="px-4 text-sm text-[var(--mw-mirage)]">{product.name}</td>
                <td className="px-4  text-sm text-[var(--neutral-600)]">{product.sku}</td>
                <td className="px-4 text-right  text-sm font-medium">{product.stock}</td>
                <td className="px-4 text-right  text-sm text-[var(--neutral-500)]">{product.reorder}</td>
                <td className="px-4 text-sm text-[var(--neutral-600)]">{product.preferredSupplier}</td>
                <td className="px-4">
                  <div className="flex items-center justify-center">
                    {product.stock < product.reorder ? (
                      <Badge className="bg-[var(--mw-amber-50)] text-[var(--mw-yellow-900)] border-0 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        Low Stock
                      </Badge>
                    ) : (
                      <Badge className="bg-[var(--neutral-100)] text-[var(--mw-mirage)] border-0">In Stock</Badge>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageShell>
  );
}
