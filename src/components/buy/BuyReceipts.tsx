/**
 * Buy Receipts - Touch-optimized goods receipt logging
 * Large touch targets for shop floor use with gloved hands
 */

import React, { useState } from 'react';
import { Package, CheckCircle2, Scan, Camera } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';


interface POForReceipt {
  id: string;
  poNumber: string;
  supplier: string;
  expectedDate: string;
  items: { name: string; ordered: number; received: number; unit: string }[];
}

const mockPOs: POForReceipt[] = [
  {
    id: '1',
    poNumber: 'PO-2026-0089',
    supplier: 'Hunter Steel Co',
    expectedDate: '2026-03-25',
    items: [
      { name: 'Mild Steel Sheet 1200x2400x3mm', ordered: 50, received: 0, unit: 'sheets' },
      { name: 'Aluminium Angle 50x50x5mm', ordered: 20, received: 0, unit: 'lengths' },
    ]
  },
  {
    id: '2',
    poNumber: 'PO-2026-0088',
    supplier: 'Pacific Metals',
    expectedDate: '2026-03-22',
    items: [
      { name: 'Structural I-Beam 150mm', ordered: 15, received: 10, unit: 'lengths' },
    ]
  },
];

export function BuyReceipts() {
  const [selectedPO, setSelectedPO] = useState<POForReceipt | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const handleReceive = () => {
    setSelectedPO(null);
    setQuantities({});
  };

  return (
    <motion.div initial="initial" animate="animate" variants={staggerContainer} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">Goods Receipt</h1>
          <p className="text-sm text-[var(--neutral-500)] mt-1">{mockPOs.length} POs awaiting receipt</p>
        </div>
      </div>

      {!selectedPO ? (
        /* PO Selection */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockPOs.map((po) => (
            <motion.div key={po.id} variants={staggerItem}>
              <Card
                className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedPO(po)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--mw-mirage)]">{po.poNumber}</h3>
                    <p className="text-sm text-[var(--neutral-500)]">{po.supplier}</p>
                  </div>
                  <Badge className="bg-[var(--mw-amber-50)] text-[var(--mw-yellow-900)] border-0">Pending</Badge>
                </div>
                <p className="text-xs text-[var(--neutral-600)] mb-3">Expected: {new Date(po.expectedDate).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}</p>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                  <span className="text-sm text-[var(--neutral-500)]">{po.items.length} items</span>
                  <Button size="sm" className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-600)] text-[var(--mw-mirage)] h-10 px-5">
                    Start Receipt →
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Receipt Entry Form - TOUCH OPTIMIZED */
        <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--mw-mirage)]">{selectedPO.poNumber}</h2>
              <p className="text-sm text-[var(--neutral-500)]">{selectedPO.supplier}</p>
            </div>
            <Button variant="outline" onClick={() => setSelectedPO(null)} className="h-12 px-6 text-base">
              Cancel
            </Button>
          </div>

          {/* Barcode Scanner (placeholder) */}
          <div className="flex gap-3 mb-6">
            <Button variant="outline" className="flex-1 h-20 text-base border-[var(--border)] hover:bg-[var(--neutral-100)]">
              <Scan className="w-6 h-6 mr-3" />
              Scan Barcode
            </Button>
            <Button variant="outline" className="flex-1 h-20 text-base border-[var(--border)] hover:bg-[var(--neutral-100)]">
              <Camera className="w-6 h-6 mr-3" />
              Take Photo
            </Button>
          </div>

          {/* Items to Receive */}
          <div className="space-y-4">
            {selectedPO.items.map((item, idx) => (
              <div key={idx} className="p-6 bg-[var(--neutral-100)] rounded-lg border border-[var(--border)]">
                <h3 className="text-base font-medium text-[var(--mw-mirage)] mb-2">{item.name}</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <p className="text-xs text-[var(--neutral-500)] mb-1">Ordered</p>
                    <p className=" text-lg font-semibold text-[var(--mw-mirage)]">
                      {item.ordered} {item.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--neutral-500)] mb-1">Already Received</p>
                    <p className=" text-lg font-semibold text-[var(--neutral-500)]">
                      {item.received} {item.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--neutral-500)] mb-1">Outstanding</p>
                    <p className=" text-lg font-semibold text-[var(--mw-yellow-400)]">
                      {item.ordered - item.received} {item.unit}
                    </p>
                  </div>
                </div>

                {/* Touch-optimized quantity input */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-[var(--mw-mirage)] min-w-[120px]">Receiving now:</label>
                  <Input
                    type="number"
                    min="0"
                    max={item.ordered - item.received}
                    value={quantities[idx] || ''}
                    onChange={(e) => setQuantities({ ...quantities, [idx]: parseInt(e.target.value) || 0 })}
                    className="h-16 text-2xl  font-semibold text-center border-[var(--border)] w-32"
                    placeholder="0"
                  />
                  <span className="text-sm text-[var(--neutral-500)]">{item.unit}</span>
                  <Button
                    onClick={() => setQuantities({ ...quantities, [idx]: item.ordered - item.received })}
                    className="ml-auto h-12 bg-[var(--border)] hover:bg-[var(--neutral-300)] text-[var(--mw-mirage)]"
                  >
                    Receive All
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 mt-6">
            <Button
              onClick={handleReceive}
              disabled={Object.values(quantities).every(q => q === 0)}
              className="flex-1 h-16 text-lg bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-600)] text-[var(--mw-mirage)] disabled:bg-[var(--neutral-900)]/[0.12] disabled:text-[var(--neutral-900)]/[0.38]"
            >
              <CheckCircle2 className="w-6 h-6 mr-3" />
              Confirm Receipt
            </Button>
          </div>
        </Card>
      )}
    </motion.div>
  );
}
