/**
 * Buy Products - Product catalog filtered for procurement
 * Shows stock levels, reorder points, preferred suppliers
 */

import React from 'react';
import { Package, AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';


interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  reorder: number;
  preferredSupplier: string;
}

const mockProducts: Product[] = [
  { id: '1', name: 'Mild Steel Sheet 1200x2400x3mm', sku: 'MAT-MS-001', stock: 15, reorder: 20, preferredSupplier: 'Hunter Steel Co' },
  { id: '2', name: 'Aluminium Angle 50x50x5mm', sku: 'MAT-AL-042', stock: 8, reorder: 15, preferredSupplier: 'Pacific Metals' },
  { id: '3', name: 'Welding Rod ER70S-6 4mm', sku: 'CONS-WR-001', stock: 45, reorder: 50, preferredSupplier: 'Sydney Welding' },
];

const productColumns: MwColumnDef<Product>[] = [
  {
    key: 'name',
    header: 'PRODUCT',
    cell: (row) => <span className="text-[var(--mw-mirage)]">{row.name}</span>,
  },
  {
    key: 'sku',
    header: 'SKU',
    cell: (row) => <span className="text-[var(--neutral-600)]">{row.sku}</span>,
  },
  {
    key: 'stock',
    header: 'STOCK',
    headerClassName: 'text-right',
    className: 'text-right font-medium',
    cell: (row) => row.stock,
  },
  {
    key: 'reorder',
    header: 'REORDER',
    headerClassName: 'text-right',
    className: 'text-right text-[var(--neutral-500)]',
    cell: (row) => row.reorder,
  },
  {
    key: 'preferredSupplier',
    header: 'PREFERRED SUPPLIER',
    cell: (row) => <span className="text-[var(--neutral-600)]">{row.preferredSupplier}</span>,
  },
  {
    key: 'status',
    header: 'STATUS',
    headerClassName: 'text-center',
    cell: (row) => (
      <div className="flex items-center justify-center">
        {row.stock < row.reorder ? (
          <Badge className="bg-[var(--mw-amber-50)] text-[var(--mw-yellow-900)] border-0 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            Low Stock
          </Badge>
        ) : (
          <Badge className="bg-[var(--neutral-100)] text-[var(--mw-mirage)] border-0">In Stock</Badge>
        )}
      </div>
    ),
  },
];

export function BuyProducts() {
  return (
    <PageShell>
      <PageHeader title="Products" />
      <MwDataTable<Product>
        columns={productColumns}
        data={mockProducts}
        keyExtractor={(row) => row.id}
        onRowClick={() => {}}
        striped
      />
    </PageShell>
  );
}
