import React, { useState } from 'react';
import { Upload, CheckCircle, AlertTriangle, Search, Calendar, Trash2, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../ui/utils';
import { ModuleInfoCallout } from '@/components/shared/layout/ModuleInfoCallout';
import { toast } from 'sonner';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';

export function NewExpense({ onBack }: { onBack: () => void }) {
  const [amount, setAmount] = useState('2450.00');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [taxMode, setTaxMode] = useState<'inclusive' | 'exclusive'>('exclusive');
  const [isReimbursable, setIsReimbursable] = useState(false);
  const [isBillable, setIsBillable] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const amtNum = parseFloat(amount) || 0;
  const gst = amtNum * 0.1;
  const total = taxMode === 'exclusive' ? amtNum + gst : amtNum;

  return (
    <PageShell className="p-6 space-y-6 overflow-y-auto max-w-[1200px] mx-auto">
      <PageHeader
        title="New expense"
        breadcrumbs={[{ label: 'Book', href: '/book' }, { label: 'New expense' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4">
        {/* Left - Form */}
        <Card className="lg:col-span-6 bg-white shadow-xs border border-[var(--border)] p-6 space-y-4">
          {/* Vendor */}
          <div>
            <Label className="text-sm mb-2 block font-medium">Vendor / Supplier</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
              <Input placeholder="Search suppliers..." className="pl-9 h-14 border-[var(--border)] rounded" />
            </div>
          </div>

          {/* Date */}
          <div>
            <Label className="text-sm mb-2 block font-medium">Expense Date</Label>
            <div className="relative">
              <Input type="text" defaultValue="02 Mar 2026" className="h-14 border-[var(--border)] rounded pr-10" />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
            </div>
          </div>

          {/* Amount */}
          <div>
            <Label className="text-sm mb-2 block font-medium">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--neutral-500)] tabular-nums">$</span>
              <Input
                value={amount} onChange={e => setAmount(e.target.value)}
                className="pl-7 h-14 border-[var(--border)] rounded tabular-nums"
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              {['exclusive', 'inclusive'].map(m => (
                <button key={m} onClick={() => setTaxMode(m as any)}
                  className={cn("px-4 py-2 text-xs rounded border transition-colors font-medium", taxMode === m ? 'bg-[var(--mw-yellow-400)] border-[var(--mw-yellow-400)] text-[var(--mw-mirage)]' : 'border-[var(--border)] text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]')}>
                  Tax {m}
                </button>
              ))}
            </div>
            <div className="text-xs text-[var(--neutral-500)] mt-2 space-y-0.5 tabular-nums">
              <p>GST (10%): ${gst.toFixed(2)}</p>
              <p>Total incl. GST: ${total.toFixed(2)}</p>
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm mb-2 block font-medium">Category</Label>
            <Select>
              <SelectTrigger className="h-14 border-[var(--border)] rounded"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                <SelectGroup><SelectLabel>Operating</SelectLabel>
                  {['Raw Materials', 'Utilities', 'Maintenance', 'Consumables', 'Freight', 'Subcontractor'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectGroup>
                <SelectGroup><SelectLabel>Capital</SelectLabel>
                  {['Equipment', 'Vehicles', 'Tooling'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectGroup>
                <SelectGroup><SelectLabel>Reimbursement</SelectLabel>
                  {['Travel', 'Mileage', 'Training', 'Meals'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div>
            <Label className="text-sm mb-2 block font-medium">Payment Method</Label>
            <div className="flex gap-0 border border-[var(--border)] rounded overflow-hidden">
              {['Cash', 'Credit Card', 'Bank Transfer', 'Petty Cash'].map(m => (
                <button key={m} onClick={() => setPaymentMethod(m)}
                  className={cn("flex-1 py-3 text-xs transition-colors font-medium", paymentMethod === m ? 'bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)]' : 'text-[var(--neutral-500)] hover:bg-[var(--neutral-100)]')}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm mb-2 block font-medium">Description</Label>
            <Textarea placeholder="Add notes about this expense..." className="min-h-[88px] border-[var(--border)] rounded" />
          </div>

          {/* Link to Job */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label className="text-sm font-medium">Link to Job</Label>
              <span className="text-xs text-[var(--neutral-400)]">Optional</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
              <Input placeholder="Search jobs..." className="pl-9 h-14 border-[var(--border)] rounded" />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center justify-between py-2">
            <Label className="text-sm font-medium">Reimbursable</Label>
            <Switch checked={isReimbursable} onCheckedChange={setIsReimbursable} />
          </div>
          <div className="flex items-center justify-between py-2">
            <Label className="text-sm font-medium">Billable to Customer</Label>
            <Switch checked={isBillable} onCheckedChange={setIsBillable} />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="h-12 px-6 border-[var(--border)] text-[var(--mw-mirage)] rounded" onClick={() => toast.success('Expense saved as draft')}>Save as Draft</Button>
            <Button className="h-12 px-6 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-600)] text-[var(--mw-mirage)] rounded" onClick={() => toast.success('Expense submitted for approval')}>Submit for Approval</Button>
          </div>
        </Card>

        {/* Right - Receipt */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="bg-white shadow-xs border border-[var(--border)] p-6">
            {!uploaded ? (
              <div
                onClick={() => setUploaded(true)}
                className="min-h-[200px] border-2 border-dashed border-[var(--border)] rounded-[var(--shape-lg)] bg-[var(--neutral-100)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--mw-yellow-400)] hover:bg-[var(--accent)] transition-colors"
              >
                <Upload className="w-12 h-12 text-[var(--neutral-400)] mb-3" />
                <p className="text-[var(--neutral-600)]">Drag receipt here or tap to upload</p>
                <p className="text-xs text-[var(--neutral-400)] mt-1">JPEG, PNG, PDF up to 10MB</p>
              </div>
            ) : (
              <>
                <div className="relative rounded-[var(--shape-lg)] overflow-hidden bg-[var(--neutral-100)] min-h-[200px] flex items-center justify-center">
                  <div className="text-center text-[var(--neutral-400)] text-sm p-8">
                    <p className="text-lg text-[var(--mw-mirage)] mb-1 font-medium">Blackwoods_receipt_25Feb.jpg</p>
                    <p className="text-xs">Receipt image preview</p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-[var(--mw-mirage)]/80 backdrop-blur-sm flex items-center justify-center gap-4 py-2">
                    <button className="p-2 hover:bg-white/10 rounded"><ZoomIn className="w-4 h-4 text-white" /></button>
                    <button className="p-2 hover:bg-white/10 rounded"><ZoomOut className="w-4 h-4 text-white" /></button>
                    <button className="p-2 hover:bg-white/10 rounded"><RotateCw className="w-4 h-4 text-white" /></button>
                    <button className="p-2 hover:bg-white/10 rounded"><Trash2 className="w-4 h-4 text-[var(--mw-error)]" /></button>
                  </div>
                </div>

                {/* OCR Results */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--mw-mirage)]" />
                    <span className="text-sm text-[var(--mw-mirage)] font-medium">Extracted data:</span>
                  </div>
                  {[
                    { label: 'Vendor', value: 'Blackwoods', confidence: 'green' },
                    { label: 'Date', value: '25 Feb 2026', confidence: 'green' },
                    { label: 'Amount', value: '$2,450.00', confidence: 'green', mono: true },
                    { label: 'GST', value: '$245.00', confidence: 'yellow', mono: true },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-xs text-[var(--neutral-500)]">{row.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm text-[var(--mw-mirage)]", row.mono && "")}>{row.value}</span>
                        <div className={cn("w-2 h-2 rounded-full", row.confidence === 'green' ? 'bg-[var(--mw-mirage)]' : row.confidence === 'yellow' ? 'bg-[var(--mw-warning)]' : 'bg-[var(--mw-error)]')} />
                      </div>
                    </div>
                  ))}
                  <Button className="w-full h-12 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-600)] text-[var(--mw-mirage)] mt-3">Apply to Form</Button>
                </div>
              </>
            )}
          </Card>

          {/* Duplicate Warning */}
          {uploaded && (
            <ModuleInfoCallout
              icon={<AlertTriangle className="w-5 h-5 text-[var(--mw-warning)]" />}
              title="Possible duplicate"
              descriptionClassName="text-[var(--mw-mirage)]"
              description={
                <>
                  <p>$2,450.00 from Blackwoods on 23 Feb 2026</p>
                  <Button variant="ghost" className="mt-2 h-auto p-0 text-sm font-medium text-[var(--mw-mirage)] underline">
                    View existing
                  </Button>
                </>
              }
            />
          )}
        </div>
      </div>
    </PageShell>
  );
}