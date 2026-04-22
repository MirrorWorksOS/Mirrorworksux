import { Download, Share2, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export interface BomLine {
  item: number;
  partNumber: string;
  description: string;
  qty: number;
  uom: string;
  unitCost: number;
  source: 'Make' | 'Buy' | 'Subcontract';
}

interface BomOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partName: string;
  partNumber: string;
  lines: BomLine[];
}

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const sourceColor: Record<BomLine['source'], string> = {
  Make: 'bg-[var(--mw-yellow-400)]/20 text-foreground',
  Buy: 'bg-[var(--mw-blue)]/10 text-[var(--mw-blue)]',
  Subcontract: 'bg-[var(--neutral-100)] text-[var(--neutral-500)]',
};

export function BomOverlay({
  open,
  onOpenChange,
  partName,
  partNumber,
  lines,
}: BomOverlayProps) {
  const total = lines.reduce((s, l) => s + l.qty * l.unitCost, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--shape-md)] bg-[var(--mw-yellow-400)]/15 flex items-center justify-center">
              <FileText className="w-5 h-5 text-foreground" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-base font-medium">
                BOM · {partName}
              </SheetTitle>
              <SheetDescription className="text-xs text-[var(--neutral-500)]">
                Part {partNumber} · {lines.length} line items
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[var(--neutral-50)] border-b border-[var(--border)]">
              <tr className="text-[10px] uppercase tracking-wider text-[var(--neutral-500)]">
                <th className="px-6 py-2 text-left w-10">#</th>
                <th className="px-2 py-2 text-left">Part</th>
                <th className="px-2 py-2 text-left">Description</th>
                <th className="px-2 py-2 text-right">Qty</th>
                <th className="px-2 py-2 text-left">UoM</th>
                <th className="px-2 py-2 text-left">Source</th>
                <th className="px-2 py-2 text-right">Unit</th>
                <th className="px-6 py-2 text-right">Ext.</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr
                  key={line.item}
                  className="border-b border-[var(--border)] hover:bg-[var(--neutral-50)]"
                >
                  <td className="px-6 py-3 tabular-nums text-[var(--neutral-500)]">
                    {line.item}
                  </td>
                  <td className="px-2 py-3 font-medium text-foreground">
                    {line.partNumber}
                  </td>
                  <td className="px-2 py-3 text-foreground">{line.description}</td>
                  <td className="px-2 py-3 text-right tabular-nums text-foreground">
                    {line.qty.toLocaleString()}
                  </td>
                  <td className="px-2 py-3 text-[var(--neutral-500)]">{line.uom}</td>
                  <td className="px-2 py-3">
                    <Badge className={`${sourceColor[line.source]} border-0 text-[10px]`}>
                      {line.source}
                    </Badge>
                  </td>
                  <td className="px-2 py-3 text-right tabular-nums text-foreground">
                    {currency(line.unitCost)}
                  </td>
                  <td className="px-6 py-3 text-right tabular-nums text-foreground">
                    {currency(line.qty * line.unitCost)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[var(--neutral-50)]">
                <td colSpan={7} className="px-6 py-3 text-right text-xs font-medium text-foreground">
                  Total
                </td>
                <td className="px-6 py-3 text-right tabular-nums text-sm font-medium text-foreground">
                  {currency(total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-[var(--border)] flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-10 text-xs border-[var(--border)]">
            <Download className="w-4 h-4 mr-1.5" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" className="h-10 text-xs border-[var(--border)]">
            <Share2 className="w-4 h-4 mr-1.5" /> Share
          </Button>
          <span className="ml-auto text-xs text-[var(--neutral-500)]">
            Last updated · 2 hours ago
          </span>
        </div>
      </SheetContent>
    </Sheet>
  );
}
