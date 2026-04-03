/**
 * Buy Settings — Implements ARCH 00 §4.8 group-based permissions model
 * Panels: General, Suppliers, Reports, Access & Permissions
 *
 * Note: PO approval is separated from PO creation by default (segregation of duties).
 */
import React, { useState } from 'react';
import { Settings, Users, BarChart3, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { cn } from '../ui/utils';
import { toast } from 'sonner';
import {
  ModuleSettingsLayout,
  SectionLabel,
  SaveRow,
  type PermissionKey,
  type PermissionGroup,
  type SettingsPanel,
} from '@/components/shared/settings/ModuleSettingsLayout';

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
        <SectionLabel>Approval thresholds</SectionLabel>
        <p className="text-sm text-[var(--neutral-500)] mb-4">
          PO approval is separated from PO creation by default to enforce segregation of duties.
        </p>
        <div className="space-y-3">
          {[
            { label: 'Under $1,000', approver: 'Supervisor' },
            { label: '$1,000 – $10,000', approver: 'Manager' },
            { label: 'Over $10,000', approver: 'Director' },
          ].map(t => (
            <div key={t.label} className="flex items-center justify-between bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-3">
              <span className="text-sm text-[var(--mw-mirage)]">{t.label}</span>
              <Badge className="bg-[var(--neutral-100)] text-[var(--neutral-500)] border-0 text-xs rounded-full px-2">{t.approver}</Badge>
            </div>
          ))}
          <button className="w-full flex items-center gap-2 border border-dashed border-[var(--border)] rounded-xl p-3 text-sm text-[var(--neutral-500)] hover:border-[var(--neutral-400)] transition-colors">
            <Plus className="w-4 h-4" /> Add threshold
          </button>
        </div>
      </div>

      <div>
        <SectionLabel>Procurement preferences</SectionLabel>
        <div className="space-y-4">
          {[
            { label: 'Auto-create POs from MRP requisitions', checked: true },
            { label: 'Require three quotes for purchases over $5,000', checked: true },
            { label: 'Notify buyer when goods are received', checked: true },
            { label: 'Allow partial deliveries', checked: true },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-[var(--neutral-100)] last:border-0">
              <span className="text-sm text-[var(--mw-mirage)]">{r.label}</span>
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
        <SectionLabel>Product categories</SectionLabel>
        <div className="space-y-2">
          {categories.map(c => (
            <div key={c} className="flex items-center justify-between bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-3 hover:bg-[var(--neutral-100)] transition-colors">
              <span className="text-sm text-[var(--mw-mirage)] font-medium">{c}</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-xs text-[var(--neutral-500)] rounded-lg" onClick={() => toast('Edit approval level coming soon')}>Edit</Button>
                <button className="text-[var(--neutral-400)] hover:text-[var(--mw-error)] transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
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
              <span className="text-sm text-[var(--mw-mirage)]">{r.label}</span>
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
            <div key={r.label} className="flex items-center justify-between bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-3">
              <span className="text-sm text-[var(--mw-mirage)]">{r.label}</span>
              <Switch defaultChecked={r.enabled} />
            </div>
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
          <Button variant="outline" className="border-[var(--border)] gap-2 rounded-xl" onClick={() => toast.success('Exporting POs CSV...')}>Export POs CSV</Button>
          <Button variant="outline" className="border-[var(--border)] gap-2 rounded-xl" onClick={() => toast.success('Exporting suppliers CSV...')}>Export suppliers CSV</Button>
        </div>
      </div>
    </div>
  );
}

// ── Root ──
const settingsPanels: SettingsPanel[] = [
  { key: 'general', label: 'General', icon: Settings, component: GeneralPanel },
  { key: 'suppliers', label: 'Suppliers', icon: Users, component: SuppliersPanel },
  { key: 'reports', label: 'Reports', icon: BarChart3, component: ReportsPanel },
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
