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

/** Mirrors the MachineConnection shape in ControlMachines.tsx — see there for docs. */
export type MachineConnectionProtocol =
  | 'None'
  | 'MQTT'
  | 'OPC-UA'
  | 'Modbus TCP'
  | 'MTConnect'
  | 'Custom HTTP';

const CONNECTION_PROTOCOLS: MachineConnectionProtocol[] = [
  'None',
  'MQTT',
  'OPC-UA',
  'Modbus TCP',
  'MTConnect',
  'Custom HTTP',
];

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
  connectionProtocol: MachineConnectionProtocol;
  connectionHost: string;
  connectionPort: string;
  connectionEndpoint: string;
  connectionMac: string;
}

/** Shape used by the parent — accepts the legacy MachineFormValues OR a
 *  Machine record with a nested `connection`. The form flattens connection
 *  fields into form state when populated from edit mode. */
export interface MachineEditInput extends Partial<MachineFormValues> {
  connection?: {
    protocol?: MachineConnectionProtocol;
    host?: string;
    port?: number;
    endpoint?: string;
    mac?: string;
  };
}

interface MachineFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machine?: MachineEditInput;
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
  connectionProtocol: 'None',
  connectionHost: '',
  connectionPort: '',
  connectionEndpoint: '',
  connectionMac: '',
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
    const conn = machine?.connection;
    const { connection: _omit, ...rest } = machine ?? {};
    void _omit; // silence unused destructure warning
    setForm({
      ...EMPTY,
      ...rest,
      connectionProtocol:
        conn?.protocol ?? machine?.connectionProtocol ?? 'None',
      connectionHost: conn?.host ?? machine?.connectionHost ?? '',
      connectionPort:
        conn?.port !== undefined ? String(conn.port) : machine?.connectionPort ?? '',
      connectionEndpoint:
        conn?.endpoint ?? machine?.connectionEndpoint ?? '',
      connectionMac: conn?.mac ?? machine?.connectionMac ?? '',
    });
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

      {/* Connection — networking config for live data ingest */}
      <div className="rounded-[var(--shape-md)] border border-[var(--border)] p-3 space-y-3">
        <div>
          <div className="text-sm font-medium text-foreground">Connection</div>
          <div className="text-xs text-[var(--neutral-500)]">
            Optional — for live OEE and shop-floor telemetry. Leave protocol
            as <span className="font-medium">None</span> to skip.
          </div>
        </div>

        <MwFormField label="Protocol">
          <Select
            value={form.connectionProtocol}
            onValueChange={(v) =>
              set('connectionProtocol', v as MachineConnectionProtocol)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONNECTION_PROTOCOLS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </MwFormField>

        {form.connectionProtocol !== 'None' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <MwFormField label="Host">
                  <Input
                    value={form.connectionHost}
                    onChange={(e) => set('connectionHost', e.target.value)}
                    placeholder="10.10.20.31"
                    className="font-mono text-xs"
                  />
                </MwFormField>
              </div>
              <MwFormField label="Port">
                <Input
                  type="number"
                  value={form.connectionPort}
                  onChange={(e) => set('connectionPort', e.target.value)}
                  placeholder={defaultPortForProtocol(form.connectionProtocol)}
                  className="font-mono text-xs"
                />
              </MwFormField>
            </div>

            <MwFormField
              label="Endpoint"
              description={endpointHint(form.connectionProtocol)}
            >
              <Input
                value={form.connectionEndpoint}
                onChange={(e) => set('connectionEndpoint', e.target.value)}
                placeholder={endpointPlaceholder(form.connectionProtocol)}
                className="font-mono text-xs"
              />
            </MwFormField>

            <MwFormField label="MAC address">
              <Input
                value={form.connectionMac}
                onChange={(e) => set('connectionMac', e.target.value)}
                placeholder="B8:27:EB:1C:9A:42"
                className="font-mono text-xs"
              />
            </MwFormField>
          </>
        )}
      </div>
    </EntityFormDialog>
  );
}

function defaultPortForProtocol(p: MachineConnectionProtocol): string {
  switch (p) {
    case 'MQTT': return '1883';
    case 'OPC-UA': return '4840';
    case 'Modbus TCP': return '502';
    case 'MTConnect': return '5000';
    case 'Custom HTTP': return '80';
    default: return '';
  }
}

function endpointHint(p: MachineConnectionProtocol): string {
  switch (p) {
    case 'MQTT': return 'Topic prefix, e.g. factory/laser-1';
    case 'OPC-UA': return 'Node id or full opc.tcp:// URL';
    case 'Modbus TCP': return 'Slave id (1-247) or register range';
    case 'MTConnect': return 'Probe path, e.g. /probe';
    case 'Custom HTTP': return 'Path or full URL';
    default: return '';
  }
}

function endpointPlaceholder(p: MachineConnectionProtocol): string {
  switch (p) {
    case 'MQTT': return 'factory/laser-1';
    case 'OPC-UA': return 'opc.tcp://10.10.20.31:4840/Trumpf';
    case 'Modbus TCP': return '1';
    case 'MTConnect': return '/probe';
    case 'Custom HTTP': return '/api/status';
    default: return '';
  }
}
