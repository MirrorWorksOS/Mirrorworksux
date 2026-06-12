/**
 * Inventory Settings — /control/inventory-settings.
 * Odoo-style settings-gated dimensionality: the Storage Locations
 * toggle controls whether the location dimension exists across the
 * Inventory page; deferred capabilities render as locked toggles.
 * Reached via the gear on /control/inventory and the Control sidebar.
 */
import { useEffect, useState } from 'react';
import { Lock, Package, Plus, Settings, Tags, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  ModuleSettingsLayout,
  SectionLabel,
  type PermissionGroup,
  type PermissionKey,
  type SettingsPanel,
} from '@/components/shared/settings/ModuleSettingsLayout';
import { SettingsRow } from '@/components/shared/settings/SettingsRow';
import { inventoryService } from '@/services';
import type { InventorySettings, StockLocation } from '@/types/entities';

// ── Permission keys (ARCH 00 group model) ──
const inventoryPermissionKeys: PermissionKey[] = [
  { key: 'ledger.view', label: 'View ledger', description: 'See on-hand quantities and values', type: 'boolean' },
  { key: 'adjust.create', label: 'Record adjustments', description: 'Count corrections after stocktakes', type: 'boolean' },
  { key: 'scrap.create', label: 'Scrap stock', description: 'Write off material to the scrap location', type: 'boolean' },
  { key: 'transfer.create', label: 'Transfer stock', description: 'Move stock between locations', type: 'boolean' },
  { key: 'stocktake.approve', label: 'Approve stocktakes', description: 'Apply count variances to the ledger', type: 'boolean' },
  { key: 'import.run', label: 'Import balances', description: 'Load opening balances from CSV / Bridge', type: 'boolean' },
  { key: 'settings.access', label: 'Settings access', description: 'Access this settings panel', type: 'boolean' },
];

const inventoryDefaultGroups: PermissionGroup[] = [
  {
    name: 'Stores',
    description: 'Storepersons, goods-in staff',
    isDefault: true,
    members: [
      { name: 'Jake Wilson', email: 'jake@alliancemetal.com.au', initials: 'JW' },
    ],
    permissions: {
      'ledger.view': 'true', 'adjust.create': 'true', 'scrap.create': 'true',
      'transfer.create': 'true', 'stocktake.approve': 'false', 'import.run': 'false',
      'settings.access': 'false',
    },
  },
  {
    name: 'Production',
    description: 'Shop-floor leads recording consumption and scrap',
    isDefault: true,
    members: [],
    permissions: {
      'ledger.view': 'true', 'adjust.create': 'false', 'scrap.create': 'true',
      'transfer.create': 'false', 'stocktake.approve': 'false', 'import.run': 'false',
      'settings.access': 'false',
    },
  },
  {
    name: 'Office',
    description: 'Planners and admin — full inventory control',
    isDefault: true,
    members: [
      { name: 'Sarah Park', email: 'sarah@alliancemetal.com.au', initials: 'SP' },
    ],
    permissions: {
      'ledger.view': 'true', 'adjust.create': 'true', 'scrap.create': 'true',
      'transfer.create': 'true', 'stocktake.approve': 'true', 'import.run': 'true',
      'settings.access': 'true',
    },
  },
];

// ── Shared settings hook (per-panel) ──

function useInventorySettings() {
  const [settings, setSettings] = useState<InventorySettings | null>(null);
  const [locations, setLocations] = useState<StockLocation[]>([]);

  useEffect(() => {
    inventoryService.getSettings().then(setSettings);
    inventoryService.listLocations({ includeVirtual: true }).then(setLocations);
  }, []);

  const update = async (patch: Partial<InventorySettings>) => {
    const next = await inventoryService.updateSettings(patch);
    setSettings(next);
    toast.success('Inventory settings saved');
  };

  return { settings, locations, update };
}

// ── General panel ──

function GeneralPanel() {
  const { settings, locations, update } = useInventorySettings();
  const [confirmDisableOpen, setConfirmDisableOpen] = useState(false);
  if (!settings) return null;

  const realLocations = locations.filter((l) => l.kind !== 'scrap');

  const locationSelect = (
    label: string,
    key: 'defaultReceivingLocationId' | 'defaultFinishedLocationId',
  ) => (
    <SettingsRow>
      <div>
        <p className="text-sm text-foreground">{label}</p>
      </div>
      <Select
        value={settings[key]}
        onValueChange={(v) => update({ [key]: v })}
        disabled={!settings.storageLocationsEnabled}
      >
        <SelectTrigger className="h-10 w-56"><SelectValue /></SelectTrigger>
        <SelectContent>
          {realLocations.map((l) => (
            <SelectItem key={l.id} value={l.id}>{l.code} — {l.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SettingsRow>
  );

  return (
    <div className="space-y-6">
      <SectionLabel>Operations</SectionLabel>

      <SettingsRow>
        <div>
          <p className="text-sm text-foreground">Storage locations</p>
          <p className="text-xs text-[var(--neutral-500)] mt-0.5">
            Track stock per bin. Off = one implicit location; the ledger aggregates per product.
          </p>
        </div>
        <Switch
          checked={settings.storageLocationsEnabled}
          onCheckedChange={(next) => {
            if (next) update({ storageLocationsEnabled: true });
            else setConfirmDisableOpen(true);
          }}
        />
      </SettingsRow>

      <AlertDialog open={confirmDisableOpen} onOpenChange={setConfirmDisableOpen}>
        <AlertDialogContent className="rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Disable storage locations?</AlertDialogTitle>
            <AlertDialogDescription>
              Per-location balances are kept but the ledger will aggregate per product.
              Transfers are disabled while off.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => update({ storageLocationsEnabled: false })}
            >
              Disable
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {locationSelect('Default receiving location', 'defaultReceivingLocationId')}
      {locationSelect('Default finished-goods location', 'defaultFinishedLocationId')}

      <SettingsRow>
        <div>
          <p className="text-sm text-foreground">Allow negative stock</p>
          <p className="text-xs text-[var(--neutral-500)] mt-0.5">
            Permit scrap, transfers and consumption to take on-hand below zero.
          </p>
        </div>
        <Switch
          checked={settings.allowNegativeStock}
          onCheckedChange={(v) => update({ allowNegativeStock: v })}
        />
      </SettingsRow>

      <SectionLabel>Valuation</SectionLabel>

      <SettingsRow>
        <div>
          <p className="text-sm text-foreground">Costing method</p>
          <p className="text-xs text-[var(--neutral-500)] mt-0.5">
            Drives the value column on the ledger. Display-only — no journal postings yet.
          </p>
        </div>
        <Select value={settings.costingMethod}>
          <SelectTrigger className="h-10 w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard cost</SelectItem>
            <SelectItem value="average" disabled>Moving average — coming soon</SelectItem>
            <SelectItem value="fifo" disabled>FIFO — coming soon</SelectItem>
          </SelectContent>
        </Select>
      </SettingsRow>
    </div>
  );
}

// ── Reason codes panel ──

function ReasonCodeEditor({
  label, description, codes, onChange,
}: {
  label: string;
  description: string;
  codes: string[];
  onChange: (codes: string[]) => void;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const value = draft.trim();
    if (!value) return;
    if (codes.some((c) => c.toLowerCase() === value.toLowerCase())) {
      toast.error('That code already exists.');
      return;
    }
    onChange([...codes, value]);
    setDraft('');
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-[var(--neutral-500)] mt-0.5">{description}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {codes.map((code) => (
          <span
            key={code}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--neutral-100)] dark:bg-[var(--neutral-200)] text-[var(--neutral-600)]"
          >
            {code}
            <button
              type="button"
              className="text-[var(--neutral-400)] hover:text-[var(--mw-error)] transition-colors"
              onClick={() => {
                if (codes.length <= 1) {
                  toast.error('Keep at least one reason code.');
                  return;
                }
                onChange(codes.filter((c) => c !== code));
              }}
              aria-label={`Remove ${code}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input
          className="h-10 w-56"
          placeholder="Add reason code…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
        />
        <Button variant="outline" className="h-10 gap-1 rounded-full" onClick={add}>
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>
    </div>
  );
}

function ReasonCodesPanel() {
  const { settings, update } = useInventorySettings();
  if (!settings) return null;

  return (
    <div className="space-y-8">
      <SectionLabel>Reason codes</SectionLabel>
      <ReasonCodeEditor
        label="Scrap reasons"
        description="Offered when writing off stock to the scrap location."
        codes={settings.scrapReasonCodes}
        onChange={(codes) => update({ scrapReasonCodes: codes })}
      />
      <ReasonCodeEditor
        label="Adjustment reasons"
        description="Offered when correcting counts."
        codes={settings.adjustmentReasonCodes}
        onChange={(codes) => update({ adjustmentReasonCodes: codes })}
      />
    </div>
  );
}

// ── Stocktake panel ──

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function StocktakePanel() {
  const { settings, update } = useInventorySettings();
  if (!settings) return null;

  return (
    <div className="space-y-6">
      <SectionLabel>Counting cadence</SectionLabel>

      <SettingsRow>
        <div>
          <p className="text-sm text-foreground">Annual stocktake day</p>
          <p className="text-xs text-[var(--neutral-500)] mt-0.5">
            Day and month the full annual count occurs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="stocktake-day" className="sr-only">Day</Label>
          <Input
            id="stocktake-day"
            type="number"
            min={1}
            max={31}
            className="h-10 w-20 text-right tabular-nums"
            value={settings.stocktakeDay.day}
            onChange={(e) => {
              const day = Math.min(31, Math.max(1, parseInt(e.target.value) || 1));
              update({ stocktakeDay: { ...settings.stocktakeDay, day } });
            }}
          />
          <Select
            value={String(settings.stocktakeDay.month)}
            onValueChange={(v) => update({ stocktakeDay: { ...settings.stocktakeDay, month: Number(v) } })}
          >
            <SelectTrigger className="h-10 w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SettingsRow>

      <SettingsRow>
        <div>
          <p className="text-sm text-foreground">Cycle count cadence</p>
          <p className="text-xs text-[var(--neutral-500)] mt-0.5">
            How often rolling location counts are scheduled.
          </p>
        </div>
        <Select
          value={settings.countCadence}
          onValueChange={(v) => update({ countCadence: v as InventorySettings['countCadence'] })}
        >
          <SelectTrigger className="h-10 w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="annual">Annual</SelectItem>
            <SelectItem value="biannual">Bi-annual</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </SettingsRow>
    </div>
  );
}

// ── Coming soon panel — Odoo-style locked toggles ──

const DEFERRED_FEATURES: { label: string; description: string }[] = [
  { label: 'Lots & serial numbers', description: 'Full traceability from suppliers to customers.' },
  { label: 'Packages', description: 'Track parcels, boxes and pallets as handling units.' },
  { label: 'Putaway rules', description: 'Auto-route received stock to the right bin.' },
  { label: 'Multi-step routes', description: 'Receive → QC → stock and pick → pack → ship flows.' },
  { label: 'Barcode scanning', description: 'Process inventory operations from a scanner. Lives with the Floor kiosk workstream.' },
  { label: 'Landed costs', description: 'Roll freight and customs into stock value.' },
];

function ComingSoonPanel() {
  return (
    <div className="space-y-6">
      <SectionLabel>On the roadmap</SectionLabel>
      <div className="space-y-3">
        {DEFERRED_FEATURES.map((feature) => (
          <SettingsRow key={feature.label}>
            <div>
              <p className="text-sm text-foreground flex items-center gap-2">
                {feature.label}
                <Lock className="w-3.5 h-3.5 text-[var(--neutral-400)]" />
              </p>
              <p className="text-xs text-[var(--neutral-500)] mt-0.5">{feature.description}</p>
            </div>
            <Switch checked={false} disabled />
          </SettingsRow>
        ))}
      </div>
    </div>
  );
}

// ── Page ──

const panels: SettingsPanel[] = [
  { key: 'general', label: 'General', icon: Settings, component: GeneralPanel },
  { key: 'reason-codes', label: 'Reason codes', icon: Tags, component: ReasonCodesPanel },
  { key: 'stocktake', label: 'Stocktake', icon: Package, component: StocktakePanel },
  { key: 'coming-soon', label: 'Coming soon', icon: Lock, component: ComingSoonPanel },
];

export function ControlInventorySettings() {
  return (
    <ModuleSettingsLayout
      title="Inventory Settings"
      moduleName="Inventory"
      moduleKey="control"
      panels={panels}
      permissionKeys={inventoryPermissionKeys}
      defaultGroups={inventoryDefaultGroups}
    />
  );
}
