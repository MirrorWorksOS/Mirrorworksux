import { useState, useEffect } from 'react';
import { EntityFormDialog } from '@/components/shared/forms/EntityFormDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { MaintenanceRecord } from '@/types/entities';

const MACHINES_LIST = [
  { id: '1', name: 'Laser Cutter #1' },
  { id: '2', name: 'Laser Cutter #2' },
  { id: '3', name: 'Press Brake #1' },
  { id: '4', name: 'Press Brake #2' },
  { id: '5', name: 'CNC Mill #1' },
  { id: '6', name: 'CNC Lathe #1' },
  { id: '7', name: 'Bandsaw' },
  { id: '8', name: 'Turret Punch' },
];

interface MaintenanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialRecord?: MaintenanceRecord | null;
  onSave: (record: Omit<MaintenanceRecord, 'id'> & { id?: string }) => void;
}

export function MaintenanceFormDialog({
  open,
  onOpenChange,
  initialRecord,
  onSave,
}: MaintenanceFormDialogProps) {
  const [machineId, setMachineId] = useState('');
  const [type, setType] = useState<'preventive' | 'corrective'>('preventive');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [cost, setCost] = useState('');

  useEffect(() => {
    if (initialRecord) {
      setMachineId(initialRecord.machineId);
      setType(initialRecord.type);
      setDescription(initialRecord.description);
      setScheduledDate(initialRecord.scheduledDate);
      setAssignedTo(initialRecord.assignedTo);
      setCost(initialRecord.cost ? String(initialRecord.cost) : '');
    } else {
      setMachineId('');
      setType('preventive');
      setDescription('');
      setScheduledDate('');
      setAssignedTo('');
      setCost('');
    }
  }, [initialRecord, open]);

  const handleSubmit = () => {
    if (!machineId) { toast.error('Select a machine'); return; }
    if (!scheduledDate) { toast.error('Scheduled date is required'); return; }

    const machine = MACHINES_LIST.find(m => m.id === machineId);

    onSave({
      id: initialRecord?.id,
      machineId,
      machineName: machine?.name ?? machineId,
      type,
      description,
      status: 'scheduled',
      scheduledDate,
      assignedTo,
      cost: cost ? Number(cost) : undefined,
    });

    toast.success(initialRecord ? 'Maintenance record updated' : 'Maintenance scheduled');
    onOpenChange(false);
  };

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialRecord ? 'Edit maintenance' : 'Schedule maintenance'}
      description="Schedule a maintenance task for a machine."
      submitLabel={initialRecord ? 'Update' : 'Schedule'}
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <div>
          <Label className="text-sm mb-2 block font-medium">Machine</Label>
          <Select value={machineId} onValueChange={setMachineId}>
            <SelectTrigger className="h-12 rounded-xl border-[var(--border)]">
              <SelectValue placeholder="Select machine" />
            </SelectTrigger>
            <SelectContent>
              {MACHINES_LIST.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm mb-2 block font-medium">Type</Label>
          <Select value={type} onValueChange={v => setType(v as 'preventive' | 'corrective')}>
            <SelectTrigger className="h-12 rounded-xl border-[var(--border)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="preventive">Preventive</SelectItem>
              <SelectItem value="corrective">Corrective</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm mb-2 block font-medium">Description</Label>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the maintenance task"
            className="rounded-xl border-[var(--border)] min-h-[80px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm mb-2 block font-medium">Scheduled date</Label>
            <Input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className="h-12 rounded-xl border-[var(--border)]" />
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Est. cost ($) <span className="text-[var(--neutral-400)] font-normal">(optional)</span></Label>
            <Input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="0" className="h-12 rounded-xl border-[var(--border)]" />
          </div>
        </div>

        <div>
          <Label className="text-sm mb-2 block font-medium">Assigned to</Label>
          <Input value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="Technician name" className="h-12 rounded-xl border-[var(--border)]" />
        </div>
      </div>
    </EntityFormDialog>
  );
}

export { MACHINES_LIST };
