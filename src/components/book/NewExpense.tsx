import React, { useState } from 'react';
import { ArrowLeft, Upload, CheckCircle, AlertTriangle, Search, Calendar, Trash2, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../ui/utils';

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
    <div className="p-6 space-y-6 overflow-y-auto max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#1A2732]" />
        </button>
        <h1 className="text-2xl tracking-tight text-[#1A2732]">New Expense</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4">
        {/* Left - Form */}
        <Card className="lg:col-span-6 bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[var(--border)] p-6 space-y-4">
          {/* Vendor */}
          <div>
            <Label className="text-sm mb-2 block" style={{ fontWeight: 500 }}>Vendor / Supplier</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
              <Input placeholder="Search suppliers..." className="pl-9 h-14 border-[var(--border)] rounded" />
            </div>
          </div>

          {/* Date */}
          <div>
            <Label className="text-sm mb-2 block" style={{ fontWeight: 500 }}>Expense Date</Label>
            <div className="relative">
              <Input type="text" defaultValue="02 Mar 2026" className="h-14 border-[var(--border)] rounded pr-10" />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
            </div>
          </div>

          {/* Amount */}
          <div>
            <Label className="text-sm mb-2 block" style={{ fontWeight: 500 }}>Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#737373]" style={{ fontFamily: 'Roboto Mono, monospace' }}>$</span>
              <Input
                value={amount} onChange={e => setAmount(e.target.value)}
                className="pl-7 h-14 border-[var(--border)] rounded" style={{ fontFamily: 'Roboto Mono, monospace' }}
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              {['exclusive', 'inclusive'].map(m => (
                <button key={m} onClick={() => setTaxMode(m as any)}
                  className={cn("px-4 py-2 text-xs rounded border transition-colors", taxMode === m ? 'bg-[#FFCF4B] border-[#FFCF4B] text-[#1A2732]' : 'border-[var(--border)] text-[#737373] hover:bg-[#F5F5F5]')}
                  style={{ fontWeight: 500 }}>
                  Tax {m}
                </button>
              ))}
            </div>
            <div className="text-xs text-[#737373] mt-2 space-y-0.5" style={{ fontFamily: 'Roboto Mono, monospace' }}>
              <p>GST (10%): ${gst.toFixed(2)}</p>
              <p>Total incl. GST: ${total.toFixed(2)}</p>
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm mb-2 block" style={{ fontWeight: 500 }}>Category</Label>
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
            <Label className="text-sm mb-2 block" style={{ fontWeight: 500 }}>Payment Method</Label>
            <div className="flex gap-0 border border-[var(--border)] rounded overflow-hidden">
              {['Cash', 'Credit Card', 'Bank Transfer', 'Petty Cash'].map(m => (
                <button key={m} onClick={() => setPaymentMethod(m)}
                  className={cn("flex-1 py-3 text-xs transition-colors", paymentMethod === m ? 'bg-[#FFCF4B] text-[#1A2732]' : 'text-[#737373] hover:bg-[#F5F5F5]')}
                  style={{ fontWeight: 500 }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm mb-2 block" style={{ fontWeight: 500 }}>Description</Label>
            <Textarea placeholder="Add notes about this expense..." className="min-h-[88px] border-[var(--border)] rounded" />
          </div>

          {/* Link to Job */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label className="text-sm" style={{ fontWeight: 500 }}>Link to Job</Label>
              <span className="text-xs text-[#A3A3A3]">Optional</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
              <Input placeholder="Search jobs..." className="pl-9 h-14 border-[var(--border)] rounded" />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center justify-between py-2">
            <Label className="text-sm" style={{ fontWeight: 500 }}>Reimbursable</Label>
            <Switch checked={isReimbursable} onCheckedChange={setIsReimbursable} />
          </div>
          <div className="flex items-center justify-between py-2">
            <Label className="text-sm" style={{ fontWeight: 500 }}>Billable to Customer</Label>
            <Switch checked={isBillable} onCheckedChange={setIsBillable} />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="h-12 px-6 border-[var(--border)] text-[#1A2732] rounded">Save as Draft</Button>
            <Button className="h-12 px-6 bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732] rounded">Submit for Approval</Button>
          </div>
        </Card>

        {/* Right - Receipt */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[var(--border)] p-6">
            {!uploaded ? (
              <div
                onClick={() => setUploaded(true)}
                className="min-h-[200px] border-2 border-dashed border-[var(--border)] rounded-lg bg-[#F5F5F5] flex flex-col items-center justify-center cursor-pointer hover:border-[#FFCF4B] hover:bg-[var(--accent)] transition-colors"
              >
                <Upload className="w-12 h-12 text-[#A3A3A3] mb-3" />
                <p className="text-[#525252]">Drag receipt here or tap to upload</p>
                <p className="text-xs text-[#A3A3A3] mt-1">JPEG, PNG, PDF up to 10MB</p>
              </div>
            ) : (
              <>
                <div className="relative rounded-lg overflow-hidden bg-[#F5F5F5] min-h-[200px] flex items-center justify-center">
                  <div className="text-center text-[#A3A3A3] text-sm p-8">
                    <p className="text-lg text-[#1A2732] mb-1" style={{ fontWeight: 500 }}>Blackwoods_receipt_25Feb.jpg</p>
                    <p className="text-xs">Receipt image preview</p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-[#1A2732]/80 backdrop-blur-sm flex items-center justify-center gap-4 py-2">
                    <button className="p-2 hover:bg-white/10 rounded"><ZoomIn className="w-4 h-4 text-white" /></button>
                    <button className="p-2 hover:bg-white/10 rounded"><ZoomOut className="w-4 h-4 text-white" /></button>
                    <button className="p-2 hover:bg-white/10 rounded"><RotateCw className="w-4 h-4 text-white" /></button>
                    <button className="p-2 hover:bg-white/10 rounded"><Trash2 className="w-4 h-4 text-[#DE350B]" /></button>
                  </div>
                </div>

                {/* OCR Results */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#1A2732]" />
                    <span className="text-sm text-[#1A2732]" style={{ fontWeight: 500 }}>Extracted data:</span>
                  </div>
                  {[
                    { label: 'Vendor', value: 'Blackwoods', confidence: 'green' },
                    { label: 'Date', value: '25 Feb 2026', confidence: 'green' },
                    { label: 'Amount', value: '$2,450.00', confidence: 'green', mono: true },
                    { label: 'GST', value: '$245.00', confidence: 'yellow', mono: true },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-xs text-[#737373]">{row.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm text-[#1A2732]", row.mono && "")}>{row.value}</span>
                        <div className={cn("w-2 h-2 rounded-full", row.confidence === 'green' ? 'bg-[#1A2732]' : row.confidence === 'yellow' ? 'bg-[#FACC15]' : 'bg-[#DE350B]')} />
                      </div>
                    </div>
                  ))}
                  <Button className="w-full h-12 bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732] mt-3">Apply to Form</Button>
                </div>
              </>
            )}
          </Card>

          {/* Duplicate Warning */}
          {uploaded && (
            <Card className="bg-[#FFF4CC] border-[#FACC15] p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#805900] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-[#805900]">Possible duplicate: $2,450.00 from Blackwoods on 23 Feb 2026</p>
                  <Button variant="ghost" className="p-0 h-auto text-sm text-[#805900] underline mt-1">View Existing</Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}