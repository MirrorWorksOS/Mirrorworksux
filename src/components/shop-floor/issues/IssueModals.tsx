import React, { useState } from 'react';
import { 
  X, Camera, Mic, Info, History, AlertTriangle, 
  CheckCircle2, AlertOctagon, FileText, Pause,
  Image as ImageIcon, Upload, Recycle
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Checkbox } from '../../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Separator } from '../../ui/separator';
import { cn } from '../../ui/utils';
import { toast } from 'sonner';

// --- Shared Components ---

const VoiceNoteButton = () => {
  const [isRecording, setIsRecording] = useState(false);
  return (
    <Button 
      variant="outline" 
      size="icon"
      className={cn(
        "shrink-0 transition-all duration-300", 
        isRecording ? "bg-[var(--mw-error-light)] text-destructive border-[var(--mw-error)]/20 animate-pulse" : "text-muted-foreground"
      )}
      onClick={() => setIsRecording(!isRecording)}
    >
      {isRecording ? <Pause className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </Button>
  );
};

const SectionHeader = ({ title }: { title: string }) => (
  <h3 className="font-medium text-foreground mt-4 mb-2 text-sm uppercase tracking-wide">{title}</h3>
);

// --- Forms ---

export const MaterialIssueForm = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <div className="flex items-center justify-between p-6 border-b border-[var(--neutral-100)]">
        <h2 className="text-xl font-bold text-foreground">Report Material Issue</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <SectionHeader title="Issue Type" />
          <RadioGroup defaultValue="shortage" className="grid grid-cols-2 gap-3">
             {['Shortage', 'Wrong Material', 'Damaged', 'Missing'].map((opt) => (
                <div key={opt} className="flex items-center space-x-2 border border-[var(--neutral-200)] p-3 rounded-[var(--shape-lg)] hover:bg-[var(--neutral-50)] cursor-pointer">
                  <RadioGroupItem value={opt.toLowerCase().replace(' ', '-')} id={opt} />
                  <Label htmlFor={opt} className="cursor-pointer font-medium">{opt}</Label>
                </div>
             ))}
          </RadioGroup>
        </div>

        <div>
          <SectionHeader title="Material Details" />
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <Label>Part Number</Label>
                <Input placeholder="e.g. AL-5052-SHEET" />
             </div>
             <div className="space-y-1.5">
                <Label>Quantity Needed</Label>
                <Input type="number" placeholder="0" />
             </div>
             <div className="col-span-2 space-y-1.5">
                <Label>Description</Label>
                <Input placeholder="Material description..." />
             </div>
          </div>
        </div>

        <div>
           <SectionHeader title="Impact" />
           <RadioGroup defaultValue="blocking" className="space-y-2">
              <div className="flex items-center space-x-2">
                 <RadioGroupItem value="blocking" id="blocking" className="text-destructive border-[var(--mw-error)]" />
                 <Label htmlFor="blocking" className="text-[var(--mw-error)] font-bold">Blocking production now - URGENT</Label>
              </div>
              <div className="flex items-center space-x-2">
                 <RadioGroupItem value="2hours" id="2hours" />
                 <Label htmlFor="2hours">Will run out in next 2 hours</Label>
              </div>
              <div className="flex items-center space-x-2">
                 <RadioGroupItem value="today" id="today" />
                 <Label htmlFor="today">Will run out today</Label>
              </div>
           </RadioGroup>
        </div>

        <div>
           <SectionHeader title="Additional Notes" />
           <div className="relative">
              <Textarea placeholder="Describe the issue..." className="min-h-[100px] pr-12" />
              <div className="absolute bottom-2 right-2">
                 <VoiceNoteButton />
              </div>
           </div>
        </div>

        <div className="bg-[var(--neutral-50)] border border-[var(--neutral-200)] rounded-xl p-4">
           <div className="flex items-center gap-2 mb-2 text-[var(--mw-info)] font-bold text-sm">
              <Info className="w-4 h-4" /> Intelligence Hub Detected
           </div>
           <ul className="space-y-1 text-sm text-[var(--mw-info)]">
              <li>• 5052 Aluminum sheets inventory: <strong>6 remaining</strong></li>
              <li>• Current job needs: <strong>8 sheets</strong> (2 short)</li>
              <li>• Supplier lead time: <strong>4 hours</strong> (Central Steel)</li>
           </ul>
        </div>
      </div>

      <div className="p-6 border-t border-[var(--neutral-100)] bg-[var(--neutral-50)] flex gap-3">
         <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
         <Button className="flex-1 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]" onClick={() => { toast.success('Issue submitted successfully'); onClose(); }}>Submit Issue</Button>
      </div>
    </div>
  );
};

export const MachineIssueForm = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <div className="flex items-center justify-between p-6 border-b border-[var(--neutral-100)]">
        <h2 className="text-xl font-bold text-foreground">Report Machine Issue</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
           <Label>Machine</Label>
           <Select defaultValue="cnc01">
              <SelectTrigger className="mt-1.5 h-12">
                 <SelectValue placeholder="Select Machine" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="cnc01">Amada Ensis Laser (Current)</SelectItem>
                 <SelectItem value="cnc02">Trumpf TruBend 5000</SelectItem>
                 <SelectItem value="press">Haeger Insert Press</SelectItem>
              </SelectContent>
           </Select>
        </div>

        <div>
          <SectionHeader title="Issue Type" />
          <RadioGroup defaultValue="stopped" className="grid grid-cols-1 gap-2">
             <div className="flex items-center space-x-2 border border-[var(--neutral-200)] p-3 rounded-[var(--shape-lg)] hover:bg-[var(--neutral-50)]">
               <RadioGroupItem value="stopped" id="stopped" />
               <Label htmlFor="stopped" className="font-medium">Machine stopped - Will not start</Label>
             </div>
             <div className="flex items-center space-x-2 border border-[var(--neutral-200)] p-3 rounded-[var(--shape-lg)] hover:bg-[var(--neutral-50)]">
               <RadioGroupItem value="error" id="error" />
               <Label htmlFor="error" className="font-medium">Error Code / Alarm</Label>
             </div>
             <div className="flex items-center space-x-2 border border-[var(--neutral-200)] p-3 rounded-[var(--shape-lg)] hover:bg-[var(--neutral-50)]">
               <RadioGroupItem value="noise" id="noise" />
               <Label htmlFor="noise" className="font-medium">Unusual Noise / Vibration</Label>
             </div>
          </RadioGroup>
        </div>

        <div>
           <SectionHeader title="Severity" />
           <RadioGroup defaultValue="medium" className="flex flex-col gap-0 rounded-[var(--shape-lg)] border border-[var(--neutral-200)] overflow-hidden bg-card">
             {['Critical', 'High', 'Medium'].map((option, index) => (
               <div key={option} className={cn("flex items-center px-4 py-3 hover:bg-[var(--neutral-100)] transition-colors cursor-pointer", index !== 2 && "border-b border-[var(--neutral-200)]")}>
                  <RadioGroupItem 
                    value={option.toLowerCase()} 
                    id={`severity-${option.toLowerCase()}`}
                    className="h-6 w-6 border-2 border-[var(--neutral-200)] bg-card text-white shadow-none data-[state=checked]:border-[var(--mw-yellow-400)] data-[state=checked]:bg-[var(--mw-yellow-400)] transition-all"
                  />
                  <Label htmlFor={`severity-${option.toLowerCase()}`} className="ml-4 flex-1 text-base font-medium text-[var(--neutral-800)] cursor-pointer">
                    {option}
                  </Label>
               </div>
             ))}
           </RadioGroup>
        </div>

        <div>
           <SectionHeader title="Description & Evidence" />
           <Textarea placeholder="What happened?" className="mb-3" />
           <div className="flex gap-2">
              <Button variant="outline" className="flex-1"><Camera className="w-4 h-4 mr-2" /> Take Photo</Button>
              <Button variant="outline" className="flex-1"><Mic className="w-4 h-4 mr-2" /> Voice Note</Button>
           </div>
        </div>

        <div className="bg-[var(--neutral-50)] border border-[var(--neutral-200)] rounded-xl p-4">
           <div className="flex items-center gap-2 mb-2 text-[var(--mw-warning)] font-bold text-sm">
              <History className="w-4 h-4" /> Machine History
           </div>
           <ul className="space-y-1 text-sm text-[var(--mw-warning)]">
              <li>• Last maintenance: <strong>5 days ago</strong></li>
              <li>• Similar issue: <strong>3 weeks ago</strong> (resolved: tool change)</li>
              <li>• Uptime this week: <strong>94%</strong> (above target)</li>
           </ul>
        </div>
      </div>

      <div className="p-6 border-t border-[var(--neutral-100)] bg-[var(--neutral-50)] flex gap-3">
         <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
         <Button className="flex-1 bg-[var(--mw-mirage)] text-white hover:bg-[var(--mw-mirage)]/90" onClick={() => { toast.success('Machine issue reported — maintenance notified'); onClose(); }}>Stop & Submit</Button>
      </div>
    </div>
  );
};

export const QualityIssueForm = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <div className="flex items-center justify-between p-6 border-b border-[var(--neutral-100)]">
        <h2 className="text-xl font-bold text-foreground">Report Quality Issue</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
           <div>
              <SectionHeader title="Issue Type" />
              <RadioGroup defaultValue="dimension" className="space-y-2">
                 {['Dimension out of tolerance', 'Surface finish defect', 'Assembly error', 'Visual defect'].map(opt => (
                    <div key={opt} className="flex items-center space-x-2">
                       <RadioGroupItem value={opt} id={opt} />
                       <Label htmlFor={opt}>{opt}</Label>
                    </div>
                 ))}
              </RadioGroup>
           </div>
           <div>
              <SectionHeader title="Specs" />
              <div className="space-y-3">
                 <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Required:</span>
                    <span className=" font-medium">10.50 mm</span>
                    <span className="text-muted-foreground">Tolerance:</span>
                    <span className=" font-medium">± 0.05 mm</span>
                 </div>
                 <Separator />
                 <div className="space-y-1.5">
                    <Label className="text-xs uppercase">Actual Measurement</Label>
                    <div className="relative">
                       <Input placeholder="0.00" className="pr-8  text-destructive font-bold" defaultValue="10.58" />
                       <span className="absolute right-3 top-2.5 text-[var(--neutral-400)] text-sm">mm</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div>
           <SectionHeader title="Affected Units" />
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                 <Label>Serial / Lot #</Label>
                 <Input placeholder="e.g. LOT-2025-X" />
              </div>
              <div className="space-y-1.5">
                 <Label>Qty Affected</Label>
                 <Input type="number" placeholder="0" />
              </div>
           </div>
        </div>

        <div className="bg-[var(--neutral-50)] border border-[var(--neutral-200)] rounded-xl p-4">
           <div className="flex items-center gap-2 mb-2 text-[var(--neutral-800)] font-bold text-sm">
              <AlertOctagon className="w-4 h-4" /> Quality Pattern Detection
           </div>
           <p className="text-sm text-[var(--neutral-700)] mb-2">
              ⚠️ <strong>Alert:</strong> Last 5 parts trending toward upper limit. Likely cause: Tool wear.
           </p>
           <Button size="sm" variant="outline" className="bg-card text-[var(--neutral-700)] border-[var(--neutral-200)] h-14">View Quality Chart</Button>
        </div>
      </div>

      <div className="p-6 border-t border-[var(--neutral-100)] bg-[var(--neutral-50)] flex gap-3">
         <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
         <Button className="flex-1 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]" onClick={() => { toast.success('NCR submitted and part quarantined'); onClose(); }}>Submit & Quarantine</Button>
      </div>
    </div>
  );
};

export const ScrapIssueForm = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <div className="flex items-center justify-between p-6 border-b border-[var(--neutral-100)]">
        <h2 className="text-xl font-bold text-foreground">Report Scrap / Waste</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
           <SectionHeader title="Scrap Type" />
           <div className="grid grid-cols-2 gap-3">
              {['Material Waste', 'Defective Part', 'Setup Scrap', 'Rework Failed', 'Damaged', 'Obsolete'].map(opt => (
                 <Button key={opt} variant="outline" className="justify-start h-12 font-normal">
                    {opt}
                 </Button>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
              <SectionHeader title="Quantity" />
              <Input type="number" placeholder="0" />
           </div>
           <div>
              <SectionHeader title="Cost Estimate" />
              <Input disabled value="$ 45.00" className="bg-[var(--neutral-50)]" />
           </div>
        </div>

        <div>
           <SectionHeader title="Reason for Scrap" />
           <Textarea placeholder="Explain why this happened..." className="mb-3" />
           <div className="flex items-center gap-2">
               <Checkbox id="prevent" />
               <Label htmlFor="prevent">Create corrective action task</Label>
           </div>
        </div>

        <div className="bg-[var(--neutral-100)] border border-[var(--neutral-200)] rounded-xl p-4">
           <div className="flex items-center gap-2 mb-2 text-[var(--neutral-700)] font-bold text-sm">
              <Recycle className="w-4 h-4" /> Waste Analysis
           </div>
           <ul className="space-y-1 text-sm text-[var(--neutral-600)]">
              <li>• Scrap rate this job: <strong>8%</strong> (Target: 5%)</li>
              <li>• Est. annual impact: <strong>$2,400</strong> if pattern continues</li>
           </ul>
        </div>
      </div>

      <div className="p-6 border-t border-[var(--neutral-100)] bg-[var(--neutral-50)] flex gap-3">
         <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
         <Button className="flex-1 bg-[var(--mw-yellow-400)] text-primary-foreground hover:bg-[var(--mw-yellow-500)]" onClick={() => { toast.success('Scrap logged successfully'); onClose(); }}>Log Scrap</Button>
      </div>
    </div>
  );
};