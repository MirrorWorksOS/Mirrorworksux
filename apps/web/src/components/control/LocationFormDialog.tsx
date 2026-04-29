/**
 * LocationFormDialog — create or edit a factory site / warehouse / office /
 * storage location (Control → Locations).
 */

import { useEffect, useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

import { EntityFormDialog } from '@/components/shared/forms/EntityFormDialog';
import { MwFormField } from '@/components/shared/forms/MwFormField';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LOCATION_TYPES = ['Factory', 'Warehouse', 'Office', 'Storage'] as const;
export type LocationType = (typeof LOCATION_TYPES)[number];

export interface LocationFormValues {
  id?: string;
  name: string;
  type: LocationType;
  address: string;
  phone: string;
  floorArea: string;
  zones: string[];
  status: 'active' | 'inactive';
}

const EMPTY: LocationFormValues = {
  name: '',
  type: 'Factory',
  address: '',
  phone: '',
  floorArea: '',
  zones: [],
  status: 'active',
};

interface LocationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: Partial<LocationFormValues>;
  onSave?: (loc: LocationFormValues) => void;
}

export function LocationFormDialog({
  open,
  onOpenChange,
  location,
  onSave,
}: LocationFormDialogProps) {
  const isEdit = Boolean(location?.id);
  const [form, setForm] = useState<LocationFormValues>(EMPTY);
  const [zoneInput, setZoneInput] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm({ ...EMPTY, ...location, zones: [...(location?.zones ?? [])] });
    setZoneInput('');
  }, [open, location]);

  const set = <K extends keyof LocationFormValues>(
    key: K,
    value: LocationFormValues[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const addZone = () => {
    const next = zoneInput.trim();
    if (!next) return;
    if (form.zones.includes(next)) {
      setZoneInput('');
      return;
    }
    set('zones', [...form.zones, next]);
    setZoneInput('');
  };

  const removeZone = (z: string) =>
    set(
      'zones',
      form.zones.filter((x) => x !== z),
    );

  const onZoneKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addZone();
    } else if (
      e.key === 'Backspace' &&
      zoneInput === '' &&
      form.zones.length > 0
    ) {
      // Quick remove last chip with backspace.
      removeZone(form.zones[form.zones.length - 1]);
    }
  };

  const valid = form.name.trim().length > 0 && form.address.trim().length > 0;

  const handleSubmit = () => {
    if (!valid) {
      toast.error('Name and address are required.');
      return false;
    }
    onSave?.({
      ...form,
      id: location?.id ?? `loc-${Date.now()}`,
      name: form.name.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      floorArea: form.floorArea.trim(),
    });
    toast.success(isEdit ? 'Location saved' : 'Location created');
  };

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit location' : 'New location'}
      description="Sites, warehouses, and offices used across the org."
      submitLabel={isEdit ? 'Save' : 'Create'}
      submitDisabled={!valid}
      onSubmit={handleSubmit}
      className="sm:max-w-xl"
    >
      <div className="grid grid-cols-2 gap-3">
        <MwFormField label="Name" required>
          <Input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Main Factory — Sydney"
            autoFocus
          />
        </MwFormField>

        <MwFormField label="Type">
          <Select
            value={form.type}
            onValueChange={(v) => set('type', v as LocationType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOCATION_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </MwFormField>
      </div>

      <MwFormField label="Address" required>
        <Input
          value={form.address}
          onChange={(e) => set('address', e.target.value)}
          placeholder="14 Industrial Rd, Silverwater NSW 2128"
        />
      </MwFormField>

      <div className="grid grid-cols-2 gap-3">
        <MwFormField label="Phone">
          <Input
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="+61 2 9748 0001"
          />
        </MwFormField>

        <MwFormField label="Floor area">
          <Input
            value={form.floorArea}
            onChange={(e) => set('floorArea', e.target.value)}
            placeholder="2,400 m²"
          />
        </MwFormField>
      </div>

      <MwFormField
        label="Zones"
        description="Press Enter or comma to add. Backspace deletes the last."
      >
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5 min-h-[26px]">
            {form.zones.map((z) => (
              <span
                key={z}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--neutral-100)] px-2 py-0.5 text-xs text-[var(--neutral-700)]"
              >
                {z}
                <button
                  type="button"
                  onClick={() => removeZone(z)}
                  className="text-[var(--neutral-400)] hover:text-[var(--mw-error)]"
                  aria-label={`Remove ${z}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={zoneInput}
              onChange={(e) => setZoneInput(e.target.value)}
              onKeyDown={onZoneKey}
              placeholder="Cutting"
            />
            <Button
              type="button"
              variant="outline"
              onClick={addZone}
              disabled={zoneInput.trim().length === 0}
            >
              Add
            </Button>
          </div>
        </div>
      </MwFormField>

      <div className="flex items-center justify-between rounded-[var(--shape-md)] border border-[var(--border)] px-3 py-2">
        <div>
          <div className="text-sm font-medium text-foreground">Active</div>
          <div className="text-xs text-[var(--neutral-500)]">
            Inactive locations are hidden from pickers
          </div>
        </div>
        <Switch
          checked={form.status === 'active'}
          onCheckedChange={(checked) =>
            set('status', checked ? 'active' : 'inactive')
          }
        />
      </div>
    </EntityFormDialog>
  );
}
