/**
 * Control Machines — comprehensive machine management with card/table toggle,
 * detail sheet, maintenance tracking, and performance charts.
 */
import React, { useState, useMemo } from 'react';
import {
  Plus, Cog, LayoutGrid, List, Wrench, PowerOff,
  UserPlus, Calendar, Settings2,
  MapPin,
} from 'lucide-react';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { toast } from 'sonner';
import { MwDataTable, type MwColumnDef } from '@/components/shared/data/MwDataTable';
import { PageShell } from '@/components/shared/layout/PageShell';
import { PageHeader } from '@/components/shared/layout/PageHeader';
import { PageToolbar, ToolbarSearch, ToolbarFilterPills, ToolbarSpacer, ToolbarSummaryBar } from '@/components/shared/layout/PageToolbar';
import { ToolbarPrimaryButton } from '@/components/shared/layout/ToolbarPrimaryButton';
import { IconViewToggle } from '@/components/shared/layout/IconViewToggle';
import { StatusBadge } from '@/components/shared/data/StatusBadge';
import { getChartScaleColour } from '@/components/shared/charts/chart-theme';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MW_AXIS_TICK,
  MW_CARTESIAN_GRID,
  MW_RECHARTS_ANIMATION,
  MW_TOOLTIP_STYLE,
  MW_CHART_COLOURS,
} from '@/components/shared/charts/chart-theme';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { cn } from '@/components/ui/utils';
import { MachineFormDialog } from './MachineFormDialog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MachineType = 'CNC Mill' | 'CNC Lathe' | 'Laser Cutter' | 'Press Brake' | 'Welder' | 'Grinder' | 'Drill Press' | 'Saw';
type MachineStatus = 'active' | 'maintenance' | 'idle' | 'offline';

interface MaintenanceRecord {
  date: string;
  type: string;
  description: string;
  technician: string;
  cost: number;
}

interface Machine {
  id: string;
  name: string;
  type: MachineType;
  status: MachineStatus;
  location: string;
  manufacturer: string;
  model: string;
  serial: string;
  purchaseDate: string;
  lastMaintenance: string;
  nextMaintenance: string;
  maintenanceInterval: string;
  currentJob: string | null;
  assignedOperator: string | null;
  power: string;
  capacity: string;
  tolerances: string;
  oee: number;
  availability: number;
  utilisation: number;
  utilisationHistory: { month: string; value: number }[];
  maintenanceHistory: MaintenanceRecord[];
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MACHINES: Machine[] = [
  {
    id: '1', name: 'Laser Cutter #1', type: 'Laser Cutter', status: 'active',
    location: 'Bay A - Cutting', manufacturer: 'Trumpf', model: 'TruLaser 3030', serial: 'TL3030-2021-0847',
    purchaseDate: '2021-03-15', lastMaintenance: '2026-03-20', nextMaintenance: '2026-04-12',
    maintenanceInterval: '30 days', currentJob: 'JOB-2026-0412', assignedOperator: 'James Wilson',
    power: '6 kW CO2', capacity: '3000x1500mm, 25mm steel', tolerances: '±0.1mm',
    oee: 87, availability: 94, utilisation: 85,
    utilisationHistory: [
      { month: 'Nov', value: 82 }, { month: 'Dec', value: 78 }, { month: 'Jan', value: 80 },
      { month: 'Feb', value: 84 }, { month: 'Mar', value: 88 }, { month: 'Apr', value: 85 },
    ],
    maintenanceHistory: [
      { date: '2026-03-20', type: 'Preventive', description: 'Lens cleaning and alignment', technician: 'Mike Chen', cost: 450 },
      { date: '2026-02-18', type: 'Preventive', description: 'Gas nozzle replacement', technician: 'Mike Chen', cost: 320 },
      { date: '2026-01-10', type: 'Corrective', description: 'Beam calibration drift repair', technician: 'Trumpf Service', cost: 1200 },
    ],
  },
  {
    id: '2', name: 'Laser Cutter #2', type: 'Laser Cutter', status: 'active',
    location: 'Bay A - Cutting', manufacturer: 'Trumpf', model: 'TruLaser 3030', serial: 'TL3030-2022-1203',
    purchaseDate: '2022-06-10', lastMaintenance: '2026-03-15', nextMaintenance: '2026-04-18',
    maintenanceInterval: '30 days', currentJob: 'JOB-2026-0398', assignedOperator: 'Sarah Park',
    power: '6 kW CO2', capacity: '3000x1500mm, 25mm steel', tolerances: '±0.1mm',
    oee: 82, availability: 91, utilisation: 72,
    utilisationHistory: [
      { month: 'Nov', value: 68 }, { month: 'Dec', value: 65 }, { month: 'Jan', value: 70 },
      { month: 'Feb', value: 74 }, { month: 'Mar', value: 76 }, { month: 'Apr', value: 72 },
    ],
    maintenanceHistory: [
      { date: '2026-03-15', type: 'Preventive', description: 'Full service and lens replacement', technician: 'Mike Chen', cost: 680 },
      { date: '2026-02-12', type: 'Preventive', description: 'Gas system check', technician: 'Mike Chen', cost: 250 },
    ],
  },
  {
    id: '3', name: 'Press Brake #1', type: 'Press Brake', status: 'active',
    location: 'Bay B - Forming', manufacturer: 'Amada', model: 'HFE3 220', serial: 'HFE3-220-19-4521',
    purchaseDate: '2019-11-20', lastMaintenance: '2026-03-10', nextMaintenance: '2026-04-20',
    maintenanceInterval: '45 days', currentJob: 'JOB-2026-0405', assignedOperator: 'Tom Richards',
    power: '22 kW', capacity: '220 tonnes, 3100mm', tolerances: '±0.05mm',
    oee: 78, availability: 88, utilisation: 68,
    utilisationHistory: [
      { month: 'Nov', value: 62 }, { month: 'Dec', value: 58 }, { month: 'Jan', value: 65 },
      { month: 'Feb', value: 70 }, { month: 'Mar', value: 72 }, { month: 'Apr', value: 68 },
    ],
    maintenanceHistory: [
      { date: '2026-03-10', type: 'Preventive', description: 'Hydraulic fluid change and filter', technician: 'Dave Turner', cost: 520 },
      { date: '2026-01-25', type: 'Corrective', description: 'Back gauge motor replacement', technician: 'Amada Service', cost: 2100 },
    ],
  },
  {
    id: '4', name: 'Press Brake #2', type: 'Press Brake', status: 'idle',
    location: 'Bay B - Forming', manufacturer: 'Amada', model: 'HFE3 175', serial: 'HFE3-175-20-6103',
    purchaseDate: '2020-04-08', lastMaintenance: '2026-03-05', nextMaintenance: '2026-04-25',
    maintenanceInterval: '45 days', currentJob: null, assignedOperator: null,
    power: '18.5 kW', capacity: '175 tonnes, 2500mm', tolerances: '±0.05mm',
    oee: 65, availability: 92, utilisation: 55,
    utilisationHistory: [
      { month: 'Nov', value: 50 }, { month: 'Dec', value: 45 }, { month: 'Jan', value: 52 },
      { month: 'Feb', value: 58 }, { month: 'Mar', value: 60 }, { month: 'Apr', value: 55 },
    ],
    maintenanceHistory: [
      { date: '2026-03-05', type: 'Preventive', description: 'Ram alignment check and calibration', technician: 'Dave Turner', cost: 380 },
    ],
  },
  {
    id: '5', name: 'MIG Welder A', type: 'Welder', status: 'active',
    location: 'Bay C - Welding', manufacturer: 'Lincoln Electric', model: 'PowerMIG 256', serial: 'PM256-22-8847',
    purchaseDate: '2022-01-15', lastMaintenance: '2026-03-25', nextMaintenance: '2026-04-30',
    maintenanceInterval: '30 days', currentJob: 'JOB-2026-0410', assignedOperator: 'Ravi Patel',
    power: '9.8 kW', capacity: '256A, MIG/Flux Core', tolerances: 'N/A',
    oee: 91, availability: 96, utilisation: 91,
    utilisationHistory: [
      { month: 'Nov', value: 88 }, { month: 'Dec', value: 85 }, { month: 'Jan', value: 87 },
      { month: 'Feb', value: 90 }, { month: 'Mar', value: 93 }, { month: 'Apr', value: 91 },
    ],
    maintenanceHistory: [
      { date: '2026-03-25', type: 'Preventive', description: 'Wire feed roller and liner replacement', technician: 'Dave Turner', cost: 180 },
      { date: '2026-02-22', type: 'Preventive', description: 'Contact tip and nozzle replacement', technician: 'Dave Turner', cost: 95 },
    ],
  },
  {
    id: '6', name: 'TIG Welder', type: 'Welder', status: 'active',
    location: 'Bay C - Welding', manufacturer: 'Kemppi', model: 'MasterTig 335', serial: 'MT335-21-5569',
    purchaseDate: '2021-08-20', lastMaintenance: '2026-03-18', nextMaintenance: '2026-05-10',
    maintenanceInterval: '60 days', currentJob: 'JOB-2026-0408', assignedOperator: 'Chris Lee',
    power: '7.5 kW', capacity: '335A, TIG AC/DC', tolerances: 'N/A',
    oee: 74, availability: 90, utilisation: 60,
    utilisationHistory: [
      { month: 'Nov', value: 55 }, { month: 'Dec', value: 52 }, { month: 'Jan', value: 58 },
      { month: 'Feb', value: 62 }, { month: 'Mar', value: 64 }, { month: 'Apr', value: 60 },
    ],
    maintenanceHistory: [
      { date: '2026-03-18', type: 'Preventive', description: 'Torch and gas lens service', technician: 'Dave Turner', cost: 210 },
    ],
  },
  {
    id: '7', name: 'CNC Mill #1', type: 'CNC Mill', status: 'maintenance',
    location: 'Bay D - Machining', manufacturer: 'Haas', model: 'VF-2SS', serial: 'VF2SS-20-3341',
    purchaseDate: '2020-02-28', lastMaintenance: '2026-03-22', nextMaintenance: '2026-04-05',
    maintenanceInterval: '14 days', currentJob: null, assignedOperator: null,
    power: '22.4 kW', capacity: '762x406x508mm, 12000 RPM', tolerances: '±0.005mm',
    oee: 42, availability: 65, utilisation: 0,
    utilisationHistory: [
      { month: 'Nov', value: 75 }, { month: 'Dec', value: 70 }, { month: 'Jan', value: 60 },
      { month: 'Feb', value: 45 }, { month: 'Mar', value: 30 }, { month: 'Apr', value: 0 },
    ],
    maintenanceHistory: [
      { date: '2026-03-22', type: 'Corrective', description: 'Spindle bearing replacement — awaiting parts', technician: 'Haas Service', cost: 4500 },
      { date: '2026-03-01', type: 'Preventive', description: 'Coolant system flush', technician: 'Mike Chen', cost: 350 },
      { date: '2026-02-01', type: 'Preventive', description: 'Way cover and axis lubrication', technician: 'Mike Chen', cost: 280 },
    ],
  },
  {
    id: '8', name: 'Drill Press #1', type: 'Drill Press', status: 'active',
    location: 'Bay D - Machining', manufacturer: 'GMC', model: 'DP-1650', serial: 'DP1650-19-2234',
    purchaseDate: '2019-05-12', lastMaintenance: '2026-02-28', nextMaintenance: '2026-05-15',
    maintenanceInterval: '90 days', currentJob: null, assignedOperator: 'Tom Richards',
    power: '1.5 kW', capacity: '16mm steel, 400mm throat', tolerances: '±0.1mm',
    oee: 58, availability: 95, utilisation: 45,
    utilisationHistory: [
      { month: 'Nov', value: 40 }, { month: 'Dec', value: 35 }, { month: 'Jan', value: 42 },
      { month: 'Feb', value: 48 }, { month: 'Mar', value: 50 }, { month: 'Apr', value: 45 },
    ],
    maintenanceHistory: [
      { date: '2026-02-28', type: 'Preventive', description: 'Chuck and quill inspection', technician: 'Dave Turner', cost: 120 },
    ],
  },
  {
    id: '9', name: 'Grinder #1', type: 'Grinder', status: 'active',
    location: 'Bay E - Finishing', manufacturer: 'Makita', model: 'GA7062', serial: 'GA7062-23-1187',
    purchaseDate: '2023-09-01', lastMaintenance: '2026-03-28', nextMaintenance: '2026-04-28',
    maintenanceInterval: '30 days', currentJob: 'JOB-2026-0411', assignedOperator: 'Ravi Patel',
    power: '1.8 kW', capacity: '180mm disc, variable speed', tolerances: 'N/A',
    oee: 70, availability: 93, utilisation: 62,
    utilisationHistory: [
      { month: 'Nov', value: 58 }, { month: 'Dec', value: 55 }, { month: 'Jan', value: 60 },
      { month: 'Feb', value: 64 }, { month: 'Mar', value: 66 }, { month: 'Apr', value: 62 },
    ],
    maintenanceHistory: [
      { date: '2026-03-28', type: 'Preventive', description: 'Guard and disc inspection', technician: 'Dave Turner', cost: 85 },
    ],
  },
  {
    id: '10', name: 'Band Saw #1', type: 'Saw', status: 'offline',
    location: 'Bay A - Cutting', manufacturer: 'Cosen', model: 'AH-300H', serial: 'AH300H-18-0921',
    purchaseDate: '2018-07-22', lastMaintenance: '2026-01-15', nextMaintenance: '2026-04-15',
    maintenanceInterval: '90 days', currentJob: null, assignedOperator: null,
    power: '2.2 kW', capacity: '300mm round, 350x300mm rect', tolerances: '±1mm',
    oee: 0, availability: 0, utilisation: 0,
    utilisationHistory: [
      { month: 'Nov', value: 40 }, { month: 'Dec', value: 38 }, { month: 'Jan', value: 35 },
      { month: 'Feb', value: 0 }, { month: 'Mar', value: 0 }, { month: 'Apr', value: 0 },
    ],
    maintenanceHistory: [
      { date: '2026-01-15', type: 'Corrective', description: 'Motor failure — decommission pending', technician: 'External', cost: 0 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MACHINE_TYPES: MachineType[] = ['CNC Mill', 'CNC Lathe', 'Laser Cutter', 'Press Brake', 'Welder', 'Grinder', 'Drill Press', 'Saw'];

const STATUS_CONFIG: Record<MachineStatus, { label: string; variant: 'success' | 'warning' | 'neutral' | 'error' }> = {
  active:      { label: 'Active',      variant: 'success' },
  maintenance: { label: 'Maintenance', variant: 'warning' },
  idle:        { label: 'Idle',        variant: 'neutral' },
  offline:     { label: 'Offline',     variant: 'error'   },
};

const VIEW_OPTIONS = [
  { key: 'grid', icon: LayoutGrid, label: 'Grid view' },
  { key: 'table', icon: List, label: 'Table view' },
];

// ---------------------------------------------------------------------------
// Table Columns
// ---------------------------------------------------------------------------

const machineColumns: MwColumnDef<Machine>[] = [
  {
    key: 'machine', header: 'Machine', tooltip: 'Machine name and type',
    cell: (m) => (
      <div className="flex items-center gap-2">
        <Cog className="w-4 h-4 text-[var(--neutral-400)] shrink-0" />
        <div>
          <span className="text-sm text-foreground font-medium block">{m.name}</span>
          <span className="text-xs text-[var(--neutral-500)]">{m.type}</span>
        </div>
      </div>
    ),
  },
  {
    key: 'manufacturer', header: 'Manufacturer / Model', tooltip: 'OEM and model number',
    cell: (m) => <span className="text-xs text-[var(--neutral-500)]">{m.manufacturer} {m.model}</span>,
  },
  {
    key: 'location', header: 'Location', tooltip: 'Physical location',
    cell: (m) => (
      <div className="flex items-center gap-1.5">
        <MapPin className="w-3 h-3 text-[var(--neutral-400)]" />
        <span className="text-sm text-[var(--neutral-500)]">{m.location}</span>
      </div>
    ),
  },
  {
    key: 'utilisation', header: 'Utilisation', tooltip: 'Current utilisation rate', headerClassName: 'w-36',
    cell: (m) => {
      const utilColour = getChartScaleColour(m.utilisation);
      return (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-200 ease-[var(--ease-standard)]" style={{ width: `${m.utilisation}%`, backgroundColor: utilColour }} />
          </div>
          <span className="text-xs tabular-nums text-[var(--neutral-500)] w-8 text-right">{m.utilisation}%</span>
        </div>
      );
    },
  },
  {
    key: 'lastMaint', header: 'Last Maintenance', tooltip: 'Last maintenance date',
    cell: (m) => <span className="text-sm text-[var(--neutral-500)]">{formatDate(m.lastMaintenance)}</span>,
  },
  {
    key: 'nextMaint', header: 'Next Maint.', tooltip: 'Next scheduled maintenance date',
    cell: (m) => <span className="text-sm text-[var(--neutral-500)]">{formatDate(m.nextMaintenance)}</span>,
  },
  {
    key: 'status', header: 'Status', headerClassName: 'text-center', tooltip: 'Operational status',
    cell: (m) => (
      <div className="flex justify-center">
        <StatusBadge variant={STATUS_CONFIG[m.status].variant}>
          {STATUS_CONFIG[m.status].label}
        </StatusBadge>
      </div>
    ),
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCurrency(v: number): string {
  return `$${v.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`;
}

// ---------------------------------------------------------------------------
// Machine Card (Grid View)
// ---------------------------------------------------------------------------

function MachineCard({ machine, onClick }: { machine: Machine; onClick: () => void }) {
  const config = STATUS_CONFIG[machine.status];
  const utilColour = getChartScaleColour(machine.utilisation);

  return (
    <motion.div
      variants={staggerItem}
      onClick={onClick}
      className={cn(
        'flex flex-col bg-card text-card-foreground rounded-[var(--shape-lg)] p-6 cursor-pointer',
        'border border-[var(--neutral-200)] dark:border-[var(--neutral-700)]',
        'shadow-[var(--card-shadow-rest)] transition-[box-shadow] duration-[var(--duration-medium1)] ease-[var(--ease-standard)] hover:shadow-[var(--card-shadow-elevated)]',
        'transition-shadow duration-[var(--duration-medium1)] ease-[var(--ease-standard)]',
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-foreground truncate">{machine.name}</h3>
          <p className="text-xs text-[var(--neutral-500)] mt-0.5">{machine.type}</p>
        </div>
        <StatusBadge variant={config.variant} withDot>{config.label}</StatusBadge>
      </div>

      <div className="space-y-2 text-xs text-[var(--neutral-500)]">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 shrink-0" strokeWidth={1.5} />
          <span className="truncate">{machine.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Settings2 className="w-3 h-3 shrink-0" strokeWidth={1.5} />
          <span className="truncate">{machine.manufacturer} {machine.model}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3 shrink-0" strokeWidth={1.5} />
          <span>Last maint: {formatDate(machine.lastMaintenance)}</span>
        </div>
      </div>

      {/* Utilisation bar */}
      <div className="mt-5 pt-4 border-t border-[var(--neutral-200)] dark:border-[var(--neutral-700)]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-[var(--neutral-500)]">Utilisation</span>
          <span className="text-xs tabular-nums font-medium text-foreground">{machine.utilisation}%</span>
        </div>
        <div className="h-1.5 bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-[var(--ease-standard)]"
            style={{ width: `${machine.utilisation}%`, backgroundColor: utilColour }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Machine Detail Sheet
// ---------------------------------------------------------------------------

function MachineDetailSheet({
  machine,
  open,
  onOpenChange,
  onEdit,
}: {
  machine: Machine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (machine: Machine) => void;
}) {
  if (!machine) return null;

  const config = STATUS_CONFIG[machine.status];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-[var(--neutral-200)] dark:border-[var(--neutral-700)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--shape-md)] bg-[var(--mw-mirage)] flex items-center justify-center shrink-0">
              <Cog className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-lg font-bold text-foreground">{machine.name}</SheetTitle>
              <SheetDescription className="text-sm text-[var(--neutral-500)]">
                {machine.manufacturer} {machine.model} · {machine.type}
              </SheetDescription>
            </div>
            <StatusBadge variant={config.variant}>{config.label}</StatusBadge>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* ---- Overview Tab ---- */}
          <TabsContent value="overview" className="space-y-6 mt-4">
            {/* Machine Info */}
            <DetailSection title="Machine Details">
              <DetailRow label="Serial Number" value={machine.serial} />
              <DetailRow label="Purchase Date" value={formatDate(machine.purchaseDate)} />
              <DetailRow label="Location" value={machine.location} />
              <DetailRow label="Type" value={machine.type} />
            </DetailSection>

            {/* Current Assignment */}
            <DetailSection title="Current Assignment">
              <DetailRow label="Current Job" value={machine.currentJob ?? 'None'} />
              <DetailRow label="Assigned Operator" value={machine.assignedOperator ?? 'Unassigned'} />
            </DetailSection>

            {/* Specifications */}
            <DetailSection title="Specifications">
              <DetailRow label="Power" value={machine.power} />
              <DetailRow label="Capacity" value={machine.capacity} />
              <DetailRow label="Tolerances" value={machine.tolerances} />
            </DetailSection>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="outline"
                className="h-10 gap-2 rounded-full"
                onClick={() => {
                  onOpenChange(false);
                  onEdit?.(machine);
                }}
              >
                <Settings2 className="w-4 h-4" /> Edit
              </Button>
              <Button
                variant="outline"
                className="h-10 gap-2 rounded-full"
                onClick={() => {
                  // TODO(backend): maintenance.schedule(machine.id)
                  toast.success('Maintenance scheduled');
                }}
              >
                <Wrench className="w-4 h-4" /> Schedule Maintenance
              </Button>
              <Button
                variant="outline"
                className="h-10 gap-2 rounded-full"
                onClick={() => {
                  // TODO(backend): machines.takeOffline(machine.id)
                  toast.success('Machine taken offline');
                }}
              >
                <PowerOff className="w-4 h-4" /> Take Offline
              </Button>
              <Button
                variant="outline"
                className="h-10 gap-2 rounded-full"
                onClick={() => {
                  // TODO(backend): machines.assignOperator(machine.id, operatorId)
                  toast.success('Operator assigned');
                }}
              >
                <UserPlus className="w-4 h-4" /> Assign Operator
              </Button>
            </div>
          </TabsContent>

          {/* ---- Maintenance Tab ---- */}
          <TabsContent value="maintenance" className="space-y-6 mt-4">
            {/* Schedule */}
            <DetailSection title="Maintenance Schedule">
              <DetailRow label="Next Scheduled" value={formatDate(machine.nextMaintenance)} />
              <DetailRow label="Interval" value={machine.maintenanceInterval} />
              <DetailRow label="Last Performed" value={formatDate(machine.lastMaintenance)} />
            </DetailSection>

            {/* Maintenance History */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--neutral-500)] mb-3">History</h4>
              <div className="space-y-2">
                {machine.maintenanceHistory.map((record, i) => (
                  <div
                    key={i}
                    className="bg-[var(--neutral-50)] dark:bg-[var(--neutral-800)]/50 rounded-[var(--shape-md)] p-3 border border-[var(--neutral-200)] dark:border-[var(--neutral-700)]"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="text-sm font-medium text-foreground">{record.description}</p>
                        <p className="text-xs text-[var(--neutral-500)] mt-0.5">{record.technician} · {record.type}</p>
                      </div>
                      <span className="text-xs tabular-nums text-[var(--neutral-500)] shrink-0 ml-2">
                        {formatDate(record.date)}
                      </span>
                    </div>
                    {record.cost > 0 && (
                      <p className="text-xs text-[var(--neutral-500)]">Cost: {formatCurrency(record.cost)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ---- Performance Tab ---- */}
          <TabsContent value="performance" className="space-y-6 mt-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-3">
              <KpiMini label="OEE" value={`${machine.oee}%`} color={getChartScaleColour(machine.oee)} />
              <KpiMini label="Availability" value={`${machine.availability}%`} color={getChartScaleColour(machine.availability)} />
              <KpiMini label="Utilisation" value={`${machine.utilisation}%`} color={getChartScaleColour(machine.utilisation)} />
            </div>

            {/* Utilisation Chart */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--neutral-500)] mb-3">Utilisation Trend</h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={machine.utilisationHistory} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid {...MW_CARTESIAN_GRID} />
                    <XAxis dataKey="month" tick={MW_AXIS_TICK} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={MW_AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={MW_TOOLTIP_STYLE}
                      formatter={(value: number) => [`${value}%`, 'Utilisation']}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={MW_CHART_COLOURS[0]}
                      strokeWidth={2}
                      dot={{ r: 3, fill: MW_CHART_COLOURS[0] }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                      {...MW_RECHARTS_ANIMATION}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Detail Section helpers
// ---------------------------------------------------------------------------

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--neutral-500)] mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--neutral-500)]">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

function KpiMini({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-[var(--neutral-50)] dark:bg-[var(--neutral-800)]/50 rounded-[var(--shape-md)] p-3 border border-[var(--neutral-200)] dark:border-[var(--neutral-700)] text-center">
      <p className="text-xs text-[var(--neutral-500)]">{label}</p>
      <p className="text-xl font-bold tabular-nums mt-1" style={{ color }}>{value}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ControlMachines() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [view, setView] = useState('grid');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [machineToEdit, setMachineToEdit] = useState<Machine | null>(null);

  const filtered = useMemo(() => {
    return MACHINES.filter(m => {
      const matchSearch = search === '' ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
        m.type.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'All' || m.type === typeFilter;
      const matchStatus = statusFilter === 'All' || m.status === statusFilter;
      const matchLocation = locationFilter === 'All' || m.location === locationFilter;
      return matchSearch && matchType && matchStatus && matchLocation;
    });
  }, [search, typeFilter, statusFilter, locationFilter]);

  const counts = useMemo(() => ({
    active: MACHINES.filter(m => m.status === 'active').length,
    maintenance: MACHINES.filter(m => m.status === 'maintenance').length,
    idle: MACHINES.filter(m => m.status === 'idle').length,
    offline: MACHINES.filter(m => m.status === 'offline').length,
  }), []);

  const handleMachineClick = (machine: Machine) => {
    setSelectedMachine(machine);
    setSheetOpen(true);
  };

  const typeFilterOptions = [
    { key: 'All', label: 'All Types' },
    ...MACHINE_TYPES.filter(t => MACHINES.some(m => m.type === t)).map(t => ({ key: t, label: t })),
  ];

  const statusFilterOptions = [
    { key: 'All', label: 'All' },
    { key: 'active', label: 'Active', count: counts.active },
    { key: 'maintenance', label: 'Maintenance', count: counts.maintenance },
    { key: 'idle', label: 'Idle', count: counts.idle },
    { key: 'offline', label: 'Offline', count: counts.offline },
  ];

  return (
    <PageShell>
      <PageHeader
        title="Machines"
        subtitle={`${counts.active} active · ${counts.maintenance} in maintenance · ${counts.idle} idle · ${counts.offline} offline`}
        actions={
          <ToolbarPrimaryButton
            icon={Plus}
            onClick={() => {
              setMachineToEdit(null);
              setFormDialogOpen(true);
            }}
          >
            Add Machine
          </ToolbarPrimaryButton>
        }
      />

      <ToolbarSummaryBar
        segments={[
          { key: 'active', label: 'Active', value: counts.active, color: 'var(--mw-success)' },
          { key: 'maintenance', label: 'Maintenance', value: counts.maintenance, color: 'var(--mw-warning)' },
          { key: 'idle', label: 'Idle', value: counts.idle, color: 'var(--neutral-400)' },
          { key: 'offline', label: 'Offline', value: counts.offline, color: 'var(--mw-error)' },
        ]}
        formatValue={(v) => String(v)}
      />

      <PageToolbar>
        <ToolbarSearch value={search} onChange={setSearch} placeholder="Search machines..." />
        <ToolbarFilterPills value={statusFilter} onChange={setStatusFilter} options={statusFilterOptions} />
        <ToolbarSpacer />
        <ToolbarFilterPills value={typeFilter} onChange={setTypeFilter} options={typeFilterOptions} />
        <IconViewToggle options={VIEW_OPTIONS} value={view} onChange={setView} />
      </PageToolbar>

      {view === 'grid' ? (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filtered.map(machine => (
            <MachineCard
              key={machine.id}
              machine={machine}
              onClick={() => handleMachineClick(machine)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-[var(--neutral-500)] text-sm">
              No machines match your filters.
            </div>
          )}
        </motion.div>
      ) : (
        <MwDataTable<Machine>
          columns={machineColumns}
          data={filtered}
          keyExtractor={(m) => m.id}
          selectable
          onRowClick={handleMachineClick}
          onExport={(keys) => toast.success(`Exporting ${keys.size} items...`)}
          onDelete={(keys) => toast.success(`Deleting ${keys.size} items...`)}
        />
      )}

      <MachineDetailSheet
        machine={selectedMachine}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onEdit={(m) => {
          setMachineToEdit(m);
          setFormDialogOpen(true);
        }}
      />

      <MachineFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        machine={machineToEdit ?? undefined}
      />
    </PageShell>
  );
}
