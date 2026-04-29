/**
 * Buy Settings — Implements ARCH 00 §4.8 group-based permissions model
 * Panels: General, Approvals, Suppliers, Notifications, Reports, Access & Permissions
 *
 * Note: PO approval is separated from PO creation by default (segregation of duties).
 */
import { useState } from 'react';
import { Settings, Users, BarChart3, Plus, Trash2, FileText, Bell } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import {
  ModuleSettingsLayout,
  SectionLabel,
  SaveRow,
  type PermissionKey,
  type PermissionGroup,
  type SettingsPanel,
} from '@/components/shared/settings/ModuleSettingsLayout';
import { SettingsRow } from '@/components/shared/settings/SettingsRow';

// ── Permission keys for Buy module (from ARCH 00 §4.8) ──
const buyPermissionKeys: PermissionKey[] = [
  { key: 'documents.scope', label: 'Document visibility', description: 'Own records only, or all org records', type: 'scope' },
  { key: 'requisitions.scope', label: 'Requisition visibility', description: 'See own requisitions or all requisitions', type: 'scope' },
  { key: 'po.create', label: 'Create purchase orders', description: 'Create and submit purchase orders', type: 'boolean' },
  { key: 'po.approve', label: 'Approve purchase orders', description: 'Approve POs (separated from creation for segregation of duties)', type: 'boolean' },
  { key: 'vendors.manage', label: 'Manage suppliers', description: 'Create, edit, and deactivate supplier records', type: 'boolean' },
  { key: 'goods_receipts.access', label: 'Goods receipts', description: 'Access goods receipt and delivery tracking', type: 'boolean' },
  { key: 'settings.access', label: 'Settings access', description: 'Access this settings panel', type: 'boolean' },
  { key: 'reports.access', label: 'Reports access', description: 'View procurement analytics and reports', type: 'boolean' },
];

// ── Default groups (from ARCH 00 §4.8) ──
const buyDefaultGroups: PermissionGroup[] = [
  {
    name: 'Purchasing',
    description: 'Buyers, procurement officers',
    isDefault: true,
    members: [
      { name: 'Mike Tremblay', email: 'mike.t@alliancemetal.com.au', initials: 'MT' },
    ],
    permissions: {
      'documents.scope': 'all', 'requisitions.scope': 'all', 'po.create': 'true',
      'po.approve': 'false', 'vendors.manage': 'true', 'goods_receipts.access': 'true',
      'settings.access': 'false', 'reports.access': 'false',
    },
  },
  {
    name: 'Receiving',
    description: 'Warehouse and receiving staff',
    isDefault: true,
    members: [
      { name: 'Jake Wilson', email: 'jake@alliancemetal.com.au', initials: 'JW' },
    ],
    permissions: {
      'documents.scope': 'own', 'requisitions.scope': 'own', 'po.create': 'false',
      'po.approve': 'false', 'vendors.manage': 'false', 'goods_receipts.access': 'true',
      'settings.access': 'false', 'reports.access': 'false',
    },
  },
  {
    name: 'Accounts',
    description: 'AP staff for procurement billing',
    isDefault: true,
    members: [
      { name: 'Rachel Kim', email: 'rachel@alliancemetal.com.au', initials: 'RK' },
    ],
    permissions: {
      'documents.scope': 'all', 'requisitions.scope': 'all', 'po.create': 'false',
      'po.approve': 'true', 'vendors.manage': 'false', 'goods_receipts.access': 'false',
      'settings.access': 'false', 'reports.access': 'true',
    },
  },
];

// ── General Panel ──
function GeneralPanel() {
  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>PO numbering</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">PO prefix</Label>
            <div className="flex gap-3 items-center">
              <Input defaultValue="PO-" className="h-12 border-[var(--border)] rounded-xl w-32" />
              <span className="text-xs text-[var(--neutral-500)] ">Preview: PO-2026-0089</span>
            </div>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Next number</Label>
            <Input defaultValue="90" type="number" className="h-12 border-[var(--border)] rounded-xl w-32" />
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Requisition prefix</Label>
            <div className="flex gap-3 items-center">
              <Input defaultValue="REQ-" className="h-12 border-[var(--border)] rounded-xl w-32" />
              <span className="text-xs text-[var(--neutral-500)] ">Preview: REQ-2026-0201</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Purchase order defaults</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Default payment terms</Label>
            <Select defaultValue="net30">
              <SelectTrigger className="h-12 border-[var(--border)] rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cod">COD</SelectItem>
                <SelectItem value="net14">Net 14</SelectItem>
                <SelectItem value="net30">Net 30</SelectItem>
                <SelectItem value="net60">Net 60</SelectItem>
                <SelectItem value="net90">Net 90</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Default lead time</Label>
            <div className="flex items-center gap-3">
              <Input defaultValue="14" type="number" className="h-12 border-[var(--border)] rounded-xl w-24" />
              <span className="text-sm text-[var(--neutral-500)]">days</span>
            </div>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Default delivery location</Label>
            <Select defaultValue="main">
              <SelectTrigger className="h-12 border-[var(--border)] rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Main Factory — Silverwater</SelectItem>
                <SelectItem value="warehouse">Warehouse — Moorebank</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Stock management</SectionLabel>
        <div className="space-y-4">
          {[
            { label: 'Auto-generate POs at reorder point', sub: 'Create draft POs when stock reaches minimum level', checked: true },
            { label: 'Enable three-way matching', sub: 'Match PO, goods receipt, and invoice before payment', checked: true },
            { label: 'Require goods receipt before invoice', sub: 'Block invoice processing until GRN is confirmed', checked: true },
            { label: 'Auto-create POs from MRP requisitions', sub: '', checked: true },
            { label: 'Allow partial deliveries', sub: '', checked: true },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-[var(--neutral-100)] last:border-0">
              <div>
                <span className="text-sm text-foreground">{r.label}</span>
                {r.sub && <p className="text-xs text-[var(--neutral-500)] mt-0.5">{r.sub}</p>}
              </div>
              <Switch defaultChecked={r.checked} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Approvals Panel ──
function ApprovalsPanel() {
  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Approval thresholds</SectionLabel>
        <p className="text-sm text-[var(--neutral-500)] mb-4">
          PO approval is separated from PO creation by default to enforce segregation of duties.
        </p>
        <div className="space-y-4">
          {[
            { label: 'Auto-approve under',       value: '1000',  suffix: '$', sub: 'No approval required below this amount' },
            { label: 'Team approval above',       value: '5000',  suffix: '$', sub: 'Requires team lead sign-off' },
            { label: 'Lead approval above',       value: '25000', suffix: '$', sub: 'Requires lead sign-off' },
            { label: 'Admin approval above',      value: '100000', suffix: '$', sub: 'Requires admin approval' },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-3 border-b border-[var(--neutral-100)] last:border-0">
              <div>
                <span className="text-sm text-foreground font-medium">{r.label}</span>
                <p className="text-xs text-[var(--neutral-500)] mt-0.5">{r.sub}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--neutral-500)]">{r.suffix}</span>
                <Input defaultValue={r.value} type="number" className="h-10 border-[var(--border)] rounded-xl w-28 text-right" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Approval flow</SectionLabel>
        <div className="space-y-4">
          {[
            { label: 'Email approver on new PO submission', checked: true },
            { label: 'Escalate if no response within 24 hours', checked: true },
            { label: 'Allow approver to edit PO before approving', checked: false },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-[var(--neutral-100)] last:border-0">
              <span className="text-sm text-foreground">{r.label}</span>
              <Switch defaultChecked={r.checked} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Suppliers Panel ──
function SuppliersPanel() {
  const categories = ['Raw Materials', 'Consumables', 'Equipment', 'Components', 'Services'];
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftThreshold, setDraftThreshold] = useState(0);
  const [draftApprover, setDraftApprover] = useState('');

  const openEdit = (category: string) => {
    setEditingCategory(category);
    setDraftName(category);
    setDraftThreshold(0);
    setDraftApprover('');
  };

  const saveEdit = () => {
    // TODO(backend): settings.updateApprovalLevel({ category, name, threshold, approver })
    toast.success(`Approval level for "${draftName}" saved`);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Vendor defaults</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Default payment terms</Label>
            <Select defaultValue="net30">
              <SelectTrigger className="h-12 border-[var(--border)] rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cod">COD</SelectItem>
                <SelectItem value="net14">Net 14</SelectItem>
                <SelectItem value="net30">Net 30</SelectItem>
                <SelectItem value="net60">Net 60</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Default lead time</Label>
            <div className="flex items-center gap-3">
              <Input defaultValue="14" type="number" className="h-12 border-[var(--border)] rounded-xl w-24" />
              <span className="text-sm text-[var(--neutral-500)]">days</span>
            </div>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Default currency</Label>
            <Select defaultValue="aud">
              <SelectTrigger className="h-12 border-[var(--border)] rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="aud">AUD</SelectItem>
                <SelectItem value="usd">USD</SelectItem>
                <SelectItem value="cny">CNY</SelectItem>
                <SelectItem value="eur">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Supplier evaluation</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Preferred supplier scoring weights</Label>
            <div className="space-y-3 mt-2">
              {[
                { label: 'Price',       value: 30 },
                { label: 'Quality',     value: 35 },
                { label: 'Lead time',   value: 20 },
                { label: 'Reliability', value: 15 },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-4">
                  <span className="text-sm text-foreground w-28">{s.label}</span>
                  <div className="flex-1 h-1.5 bg-[var(--neutral-200)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--mw-yellow-400)] rounded-full" style={{ width: `${s.value}%` }} />
                  </div>
                  <Input defaultValue={`${s.value}`} type="number" className="h-9 w-20 border-[var(--border)] rounded-xl text-right text-sm" />
                  <span className="text-sm text-[var(--neutral-500)]">%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>RFQ defaults</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Minimum suppliers to quote</Label>
            <Input defaultValue="3" type="number" className="h-12 border-[var(--border)] rounded-xl w-24" />
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">RFQ expiry period</Label>
            <div className="flex items-center gap-3">
              <Input defaultValue="7" type="number" className="h-12 border-[var(--border)] rounded-xl w-24" />
              <span className="text-sm text-[var(--neutral-500)]">days</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Product categories</SectionLabel>
        <div className="space-y-2">
          {categories.map(c => (
            <SettingsRow key={c} interactive>
              <span className="text-sm text-foreground font-medium">{c}</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-xs text-[var(--neutral-500)]" onClick={() => openEdit(c)}>Edit</Button>
                <button className="text-[var(--neutral-400)] hover:text-[var(--mw-error)] transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </SettingsRow>
          ))}
          <button className="w-full flex items-center gap-2 border border-dashed border-[var(--border)] rounded-xl p-3 text-sm text-[var(--neutral-500)] hover:border-[var(--neutral-400)] transition-colors">
            <Plus className="w-4 h-4" /> Add category
          </button>
        </div>
      </div>

      <div>
        <SectionLabel>Supplier rating</SectionLabel>
        <div className="space-y-4">
          {[
            { label: 'Enable supplier performance scoring', checked: true },
            { label: 'Track on-time delivery rate', checked: true },
            { label: 'Track quality rejection rate', checked: true },
            { label: 'Auto-flag suppliers below 70% score', checked: false },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-[var(--neutral-100)] last:border-0">
              <span className="text-sm text-foreground">{r.label}</span>
              <Switch defaultChecked={r.checked} />
            </div>
          ))}
        </div>
      </div>

      <Sheet open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <SheetContent className="w-[420px] sm:max-w-[420px] p-0 overflow-y-auto border-l border-[var(--border)]">
          <SheetHeader className="p-6 pb-4 border-b border-[var(--border)]">
            <SheetTitle className="text-base font-medium text-foreground">Edit approval level</SheetTitle>
            <SheetDescription className="text-[var(--neutral-500)] text-xs">
              Configure the threshold and approver for this category.
            </SheetDescription>
          </SheetHeader>
          <div className="p-6 space-y-4">
            <div className="grid gap-1.5">
              <Label className="text-sm">Category name</Label>
              <Input value={draftName} onChange={(e) => setDraftName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-sm">Threshold (AUD)</Label>
              <Input type="number" min={0} step="100" value={draftThreshold} onChange={(e) => setDraftThreshold(Number(e.target.value))} />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-sm">Approver</Label>
              <Input value={draftApprover} onChange={(e) => setDraftApprover(e.target.value)} placeholder="e.g. Procurement Manager" />
            </div>
          </div>
          <div className="p-6 pt-0 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingCategory(null)}>Cancel</Button>
            <Button
              className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground"
              onClick={saveEdit}
              disabled={!draftName.trim()}
            >
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ── Notifications Panel ──
function NotificationsPanel() {
  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Purchase notifications</SectionLabel>
        <div className="space-y-4">
          {[
            { label: 'PO submitted for approval',               sub: 'Notify approver when a PO is submitted',    checked: true },
            { label: 'PO approved or rejected',                 sub: 'Notify requestor of the approval decision', checked: true },
            { label: 'Goods received against PO',               sub: 'Notify buyer when GRN is confirmed',        checked: true },
            { label: 'Invoice matched to PO',                   sub: 'Notify accounts when invoice is matched',   checked: true },
            { label: "PO overdue — supplier hasn't delivered",  sub: 'Alert when expected delivery date is passed', checked: true },
            { label: 'Reorder point reached',                   sub: 'Alert when stock falls to minimum level',   checked: false },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-3 border-b border-[var(--neutral-100)] last:border-0">
              <div>
                <span className="text-sm text-foreground font-medium">{r.label}</span>
                <p className="text-xs text-[var(--neutral-500)] mt-0.5">{r.sub}</p>
              </div>
              <Switch defaultChecked={r.checked} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Reports Panel ──
function ReportsPanel() {
  const reports = [
    { label: 'Spend by supplier', enabled: true },
    { label: 'Spend by category', enabled: true },
    { label: 'PO cycle time', enabled: true },
    { label: 'Supplier on-time delivery', enabled: true },
    { label: 'Open requisitions ageing', enabled: false },
    { label: 'Price variance analysis', enabled: false },
  ];

  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Available reports</SectionLabel>
        <p className="text-sm text-[var(--neutral-500)] mb-4">Choose which reports appear in the Buy reports gallery.</p>
        <div className="space-y-2">
          {reports.map(r => (
            <SettingsRow key={r.label}>
              <span className="text-sm text-foreground">{r.label}</span>
              <Switch defaultChecked={r.enabled} />
            </SettingsRow>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Reporting period</SectionLabel>
        <div>
          <Label className="text-sm mb-2 block font-medium">Default date range</Label>
          <Select defaultValue="quarter">
            <SelectTrigger className="h-12 border-[var(--border)] rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="quarter">This quarter</SelectItem>
              <SelectItem value="year">This financial year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <SectionLabel>Export</SectionLabel>
        <div className="flex gap-3">
          <Button variant="outline" className="border-[var(--border)] gap-2" onClick={() => toast.success('Exporting POs CSV...')}>Export POs CSV</Button>
          <Button variant="outline" className="border-[var(--border)] gap-2" onClick={() => toast.success('Exporting suppliers CSV...')}>Export suppliers CSV</Button>
        </div>
      </div>
    </div>
  );
}

// ── Root ──
const settingsPanels: SettingsPanel[] = [
  { key: 'general',       label: 'General',       icon: Settings,  component: GeneralPanel },
  { key: 'approvals',     label: 'Approvals',     icon: FileText,  component: ApprovalsPanel },
  { key: 'suppliers',     label: 'Suppliers',     icon: Users,     component: SuppliersPanel },
  { key: 'notifications', label: 'Notifications', icon: Bell,      component: NotificationsPanel },
  { key: 'reports',       label: 'Reports',       icon: BarChart3, component: ReportsPanel },
];

export function BuySettings() {
  return (
    <ModuleSettingsLayout
      title="Buy Settings"
      moduleName="Buy"
      panels={settingsPanels}
      permissionKeys={buyPermissionKeys}
      defaultGroups={buyDefaultGroups}
    />
  );
}
