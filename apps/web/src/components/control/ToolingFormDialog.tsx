import { useState, useEffect } from 'react';
import { EntityFormDialog } from '@/components/shared/forms/EntityFormDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { ToolingItem } from '@/types/entities';
import { TOOLING_TEMPLATES, TOOLING_CATEGORIES } from '@/services/toolingLibrary';
import { MACHINES_LIST } from './MaintenanceFormDialog';

interface ToolingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: Omit<ToolingItem, 'id' | 'lifePercent' | 'status'> & { id?: string }) => void;
}

// Radix Select.Item rejects empty-string values; use a sentinel for "no machine linked".
const NO_MACHINE = '__none__';

export function ToolingFormDialog({ open, onOpenChange, onSave }: ToolingFormDialogProps) {
  const [toolId, setToolId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [linkedMachineId, setLinkedMachineId] = useState('');
  const [expectedLifeDays, setExpectedLifeDays] = useState('');
  const [lastServiceDate, setLastServiceDate] = useState('');
  const [calibrationDueDate, setCalibrationDueDate] = useState('');

  useEffect(() => {
    if (!open) {
      setToolId('');
      setTemplateId('');
      setType('');
      setDescription('');
      setLocation('');
      setLinkedMachineId('');
      setExpectedLifeDays('');
      setLastServiceDate('');
      setCalibrationDueDate('');
    }
  }, [open]);

  const handleTemplateChange = (id: string) => {
    setTemplateId(id);
    const tmpl = TOOLING_TEMPLATES.find(t => t.id === id);
    if (tmpl) {
      setType(tmpl.category);
      setDescription(tmpl.name);
    }
  };

  const handleSubmit = () => {
    if (!toolId.trim()) { toast.error('Tool ID is required'); return; }
    if (!type.trim()) { toast.error('Select a template or enter a type'); return; }

    const realLinkedId = linkedMachineId === NO_MACHINE ? '' : linkedMachineId;
    const machine = MACHINES_LIST.find(m => m.id === realLinkedId);

    onSave({
      toolId,
      type,
      description,
      location,
      calibrationDueDate: calibrationDueDate || '—',
      lastServiceDate: lastServiceDate || '—',
      linkedMachineId: realLinkedId || undefined,
      linkedMachineName: machine?.name,
    });

    toast.success('Tool added');
    onOpenChange(false);
  };

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add tool"
      description="Register a new tool in the tooling inventory."
      submitLabel="Add tool"
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <div>
          <Label className="text-sm mb-2 block font-medium">Tool ID</Label>
          <Input value={toolId} onChange={e => setToolId(e.target.value)} placeholder="e.g. TL-001" className="h-12 rounded-xl border-[var(--border)]" />
        </div>

        <div>
          <Label className="text-sm mb-2 block font-medium">Template <span className="text-[var(--neutral-400)] font-normal">(optional)</span></Label>
          <Select value={templateId} onValueChange={handleTemplateChange}>
            <SelectTrigger className="h-12 rounded-xl border-[var(--border)]">
              <SelectValue placeholder="Choose a standard tool type" />
            </SelectTrigger>
            <SelectContent>
              {TOOLING_CATEGORIES.map(cat => (
                <SelectGroup key={cat}>
                  <SelectLabel>{cat}</SelectLabel>
                  {TOOLING_TEMPLATES.filter(t => t.category === cat).map(tmpl => (
                    <SelectItem key={tmpl.id} value={tmpl.id}>{tmpl.name}</SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-2 block font-medium">Type</Label>
            <Input value={type} onChange={e => setType(e.target.value)} placeholder="e.g. Cutting" className="h-12 rounded-xl border-[var(--border)]" />
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Description</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Tool description" className="h-12 rounded-xl border-[var(--border)]" />
          </div>
        </div>

        <div>
          <Label className="text-sm mb-2 block font-medium">Location</Label>
          <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Tool crib Bay A" className="h-12 rounded-xl border-[var(--border)]" />
        </div>

        <div>
          <Label className="text-sm mb-2 block font-medium">Linked machine <span className="text-[var(--neutral-400)] font-normal">(optional)</span></Label>
          <Select
            value={linkedMachineId === '' ? NO_MACHINE : linkedMachineId}
            onValueChange={(v) => setLinkedMachineId(v === NO_MACHINE ? '' : v)}
          >
            <SelectTrigger className="h-12 rounded-xl border-[var(--border)]">
              <SelectValue placeholder="No machine linked" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_MACHINE}>No machine</SelectItem>
              {MACHINES_LIST.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-2 block font-medium">Expected life (days)</Label>
            <Input type="number" value={expectedLifeDays} onChange={e => setExpectedLifeDays(e.target.value)} placeholder="365" className="h-12 rounded-xl border-[var(--border)]" />
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Last service date</Label>
            <Input type="date" value={lastServiceDate} onChange={e => setLastServiceDate(e.target.value)} className="h-12 rounded-xl border-[var(--border)]" />
          </div>
        </div>

        <div>
          <Label className="text-sm mb-2 block font-medium">Calibration due <span className="text-[var(--neutral-400)] font-normal">(optional)</span></Label>
          <Input type="date" value={calibrationDueDate} onChange={e => setCalibrationDueDate(e.target.value)} className="h-12 rounded-xl border-[var(--border)]" />
        </div>
      </div>
    </EntityFormDialog>
  );
}
