/**
 * MachineFormDialog — create or edit a machine asset
 * (Control → Machines).
 *
 * Wired to the "Add Machine" toolbar button on `ControlMachines.tsx`.
 * Backend mocked — onSave hands the new/edited machine to the parent.
 */

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { EntityFormDialog } from '@/components/shared/forms/EntityFormDialog';
import { MwFormField } from '@/components/shared/forms/MwFormField';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MACHINE_TYPES = [
  'CNC Mill',
  'CNC Lathe',
  'Laser Cutter',
  'Press Brake',
  'Welder',
  'Grinder',
  'Drill Press',
  'Saw',
] as const;
type MachineType = (typeof MACHINE_TYPES)[number];

const LOCATIONS = [
  'Main Factory — Sydney',
  'Warehouse — Moorebank',
  'Office — Parramatta',
  'Site Storage — Newcastle',
] as const;

export interface MachineFormValues {
  id?: string;
  name: string;
  type: MachineType;
  location: string;
  manufacturer: string;
  model: string;
  serial: string;
  power: string;
  capacity: string;
  tolerances: string;
  maintenanceInterval: string;
}

interface MachineFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machine?: Partial<MachineFormValues>;
  onSave?: (m: MachineFormValues) => void;
}

const EMPTY: MachineFormValues = {
  name: '',
  type: 'CNC Mill',
  location: LOCATIONS[0],
  manufacturer: '',
  model: '',
  serial: '',
  power: '',
  capacity: '',
  tolerances: '',
  maintenanceInterval: '30 days',
};

export function MachineFormDialog({
  open,
  onOpenChange,
  machine,
  onSave,
}: MachineFormDialogProps) {
  const isEdit = Boolean(machine?.id);
  const [form, setForm] = useState<MachineFormValues>(EMPTY);

  useEffect(() => {
    if (!open) return;
    setForm({ ...EMPTY, ...machine });
  }, [open, machine]);

  const set = <K extends keyof MachineFormValues>(
    key: K,
    value: MachineFormValues[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const valid =
    form.name.trim().length > 0 &&
    form.manufacturer.trim().length > 0 &&
    form.model.trim().length > 0;

  const handleSubmit = () => {
    if (!valid) {
      toast.error('Name, manufacturer, and model are required.');
      return;
    }
    const out: MachineFormValues = {
      ...form,
      id: machine?.id ?? `mach-${Date.now()}`,
      name: form.name.trim(),
      manufacturer: form.manufacturer.trim(),
      model: form.model.trim(),
      serial: form.serial.trim(),
    };
    onSave?.(out);
    toast.success(isEdit ? 'Machine saved' : 'Machine added');
    onOpenChange(false);
  };

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit machine' : 'Add machine'}
      description="Capacity, tolerances and maintenance cadence drive scheduling and OEE."
      submitLabel={isEdit ? 'Save' : 'Add'}
      submitDisabled={!valid}
      onSubmit={handleSubmit}
      className="sm:max-w-2xl"
    >
      <div className="grid grid-cols-2 gap-3">
        <MwFormField label="Name" required>
          <Input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Laser Cutter #3"
            autoFocus
          />
        </MwFormField>

        <MwFormField label="Type">
          <Select
            value={form.type}
            onValueChange={(v) => set('type', v as MachineType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MACHINE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </MwFormField>
      </div>

      <MwFormField label="Location">
        <Select value={form.location} onValueChange={(v) => set('location', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOCATIONS.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </MwFormField>

      <div className="grid grid-cols-3 gap-3">
        <MwFormField label="Manufacturer" required>
          <Input
            value={form.manufacturer}
            onChange={(e) => set('manufacturer', e.target.value)}
            placeholder="Trumpf"
          />
        </MwFormField>

        <MwFormField label="Model" required>
          <Input
            value={form.model}
            onChange={(e) => set('model', e.target.value)}
            placeholder="TruLaser 3030"
          />
        </MwFormField>

        <MwFormField label="Serial">
          <Input
            value={form.serial}
            onChange={(e) => set('serial', e.target.value)}
          />
        </MwFormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MwFormField label="Power">
          <Input
            value={form.power}
            onChange={(e) => set('power', e.target.value)}
            placeholder="6 kW CO2"
          />
        </MwFormField>

        <MwFormField label="Tolerances">
          <Input
            value={form.tolerances}
            onChange={(e) => set('tolerances', e.target.value)}
            placeholder="±0.1mm"
          />
        </MwFormField>
      </div>

      <MwFormField
        label="Capacity"
        description="Free-text working envelope, e.g. 3000×1500mm, 25mm steel"
      >
        <Input
          value={form.capacity}
          onChange={(e) => set('capacity', e.target.value)}
        />
      </MwFormField>

      <MwFormField label="Maintenance interval">
        <Input
          value={form.maintenanceInterval}
          onChange={(e) => set('maintenanceInterval', e.target.value)}
          placeholder="30 days"
        />
      </MwFormField>
    </EntityFormDialog>
  );
}
