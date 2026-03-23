/**
 * Book Settings — Implements ARCH 00 §4.7 group-based permissions model
 * Panels: General, Invoicing, Xero Integration, Reports, Access & Permissions
 */
import React, { useState } from 'react';
import {
  Settings, FileText, Link, BarChart3, Lock, Calendar, RefreshCw,
  AlertTriangle, Plus, Trash2,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { cn } from '../ui/utils';
import {
  ModuleSettingsLayout,
  SectionLabel,
  SaveRow,
  type PermissionKey,
  type PermissionGroup,
  type SettingsPanel,
} from '../shared/ModuleSettingsLayout';

// ── Permission keys for Book module (from ARCH 00 §4.7) ──
const bookPermissionKeys: PermissionKey[] = [
  { key: 'documents.scope', label: 'Document visibility', description: 'Own records only, or all org records', type: 'scope' },
  { key: 'invoices.create', label: 'Create invoices', description: 'Create and send invoices', type: 'boolean' },
  { key: 'expenses.scope', label: 'Expense visibility', description: 'See own expenses or all expenses', type: 'scope' },
  { key: 'po.approve', label: 'Approve purchase orders', description: 'Approve POs for payment processing', type: 'boolean' },
  { key: 'xero.access', label: 'Xero integration', description: 'Access Xero sync and account mapping', type: 'boolean' },
  { key: 'settings.access', label: 'Settings access', description: 'Access this settings panel', type: 'boolean' },
  { key: 'reports.access', label: 'Reports access', description: 'View financial analytics and reports', type: 'boolean' },
];

// ── Default groups (from ARCH 00 §4.7) ──
const bookDefaultGroups: PermissionGroup[] = [
  {
    name: 'Accounts Receivable',
    description: 'AR clerks, invoice processors',
    isDefault: true,
    members: [
      { name: 'Linda Green', email: 'linda@alliancemetal.com.au', initials: 'LG' },
    ],
    permissions: {
      'documents.scope': 'all', 'invoices.create': 'true', 'expenses.scope': 'own',
      'po.approve': 'false', 'xero.access': 'false', 'settings.access': 'false',
      'reports.access': 'false',
    },
  },
  {
    name: 'Accounts Payable',
    description: 'AP clerks, bill matchers',
    isDefault: true,
    members: [
      { name: 'Rachel Kim', email: 'rachel@alliancemetal.com.au', initials: 'RK' },
    ],
    permissions: {
      'documents.scope': 'all', 'invoices.create': 'false', 'expenses.scope': 'all',
      'po.approve': 'true', 'xero.access': 'false', 'settings.access': 'false',
      'reports.access': 'false',
    },
  },
  {
    name: 'Expenses',
    description: 'All staff who submit expense claims',
    isDefault: true,
    members: [
      { name: 'Sarah Chen', email: 'sarah@alliancemetal.com.au', initials: 'SC' },
      { name: 'Dave Li', email: 'dave@alliancemetal.com.au', initials: 'DL' },
      { name: 'Tom Burke', email: 'tom@alliancemetal.com.au', initials: 'TB' },
      { name: 'Emma Wilson', email: 'emma@alliancemetal.com.au', initials: 'EW' },
      { name: 'Mike Thompson', email: 'mike@alliancemetal.com.au', initials: 'MT' },
      { name: 'Jake Wilson', email: 'jake@alliancemetal.com.au', initials: 'JW' },
    ],
    permissions: {
      'documents.scope': 'own', 'invoices.create': 'false', 'expenses.scope': 'own',
      'po.approve': 'false', 'xero.access': 'false', 'settings.access': 'false',
      'reports.access': 'false',
    },
  },
];

// ── General Panel ──
function GeneralPanel() {
  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Financial year</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Fiscal year end</Label>
            <div className="flex gap-3 items-center">
              <Select defaultValue="june">
                <SelectTrigger className="h-12 border-[var(--border)] rounded-xl flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <SelectItem key={m} value={m.toLowerCase()}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input defaultValue="30" type="number" className="h-12 border-[var(--border)] rounded-xl w-24" />
            </div>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Lock date</Label>
            <div className="relative">
              <Input defaultValue="31 Jan 2026" className="h-12 border-[var(--border)] rounded-xl pr-10" />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
            </div>
            <p className="text-xs text-[#737373] mt-1">Transactions before this date cannot be created or edited.</p>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Currency</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Default currency</Label>
            <Select defaultValue="aud">
              <SelectTrigger className="h-12 border-[var(--border)] rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="aud">AUD — Australian Dollar</SelectItem>
                <SelectItem value="usd">USD — US Dollar</SelectItem>
                <SelectItem value="nzd">NZD — New Zealand Dollar</SelectItem>
                <SelectItem value="sgd">SGD — Singapore Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Default tax rate</Label>
            <div className="flex items-center gap-3">
              <Input defaultValue="10" type="number" className="h-12 border-[var(--border)] rounded-xl w-24" />
              <span className="text-sm text-[#737373]">% (GST)</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Dashboard cards</SectionLabel>
        <div className="space-y-4">
          {[
            { label: 'Show total revenue card', checked: true },
            { label: 'Show overdue invoices card', checked: true },
            { label: 'Show profit margin card', checked: true },
            { label: 'Show cash flow card', checked: true },
            { label: 'Show WIP valuation card', checked: false },
            { label: 'Show budget utilisation card', checked: false },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-[#F5F5F5] last:border-0">
              <span className="text-sm text-[#1A2732]">{r.label}</span>
              <Switch defaultChecked={r.checked} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Invoicing Panel ──
function InvoicingPanel() {
  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Document numbering</SectionLabel>
        <div className="space-y-4">
          {[
            { label: 'Invoice prefix', value: 'INV-', preview: 'INV-2026-0047' },
            { label: 'Expense prefix', value: 'EXP-', preview: 'EXP-2026-0123' },
            { label: 'PO prefix', value: 'PO-', preview: 'PO-2026-0089' },
            { label: 'Credit note prefix', value: 'CN-', preview: 'CN-2026-0005' },
          ].map(f => (
            <div key={f.label}>
              <Label className="text-sm mb-2 block font-medium">{f.label}</Label>
              <div className="flex gap-3 items-center">
                <Input defaultValue={f.value} className="h-12 border-[var(--border)] rounded-xl w-32" />
                <span className="text-xs text-[#737373] ">Preview: {f.preview}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Invoice templates</SectionLabel>
        <div className="space-y-3">
          {[
            { name: 'Standard Invoice', active: true },
            { name: 'Progress Claim', active: true },
            { name: 'Credit Note', active: true },
            { name: 'Proforma', active: false },
          ].map(t => (
            <div key={t.name} className="flex items-center justify-between bg-white border border-[var(--border)] rounded-2xl p-3">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-[#737373]" />
                <span className="text-sm text-[#1A2732] font-medium">{t.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Switch defaultChecked={t.active} />
                <Button variant="ghost" size="sm" className="text-xs text-[#737373] rounded-lg">Edit</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Invoice defaults</SectionLabel>
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
          <div className="flex items-center justify-between py-2 border-b border-[#F5F5F5]">
            <div>
              <span className="text-sm text-[#1A2732]">Auto-send invoice on creation</span>
              <p className="text-xs text-[#737373] mt-0.5">Email invoice PDF to customer immediately</p>
            </div>
            <Switch defaultChecked={false} />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#F5F5F5]">
            <div>
              <span className="text-sm text-[#1A2732]">Send overdue reminders</span>
              <p className="text-xs text-[#737373] mt-0.5">Automatically remind customers of overdue invoices</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Xero Integration Panel ──
function XeroPanel() {
  const syncEntities = [
    { name: 'Invoices', push: true, pull: true, lastSync: '2 min ago', ok: true },
    { name: 'Expenses (as Bills)', push: true, pull: false, lastSync: '5 min ago', ok: true },
    { name: 'Purchase Orders', push: true, pull: false, lastSync: '1 hr ago', ok: true },
    { name: 'Manual Journals (WIP)', push: true, pull: false, lastSync: 'Yesterday', ok: false },
    { name: 'Chart of Accounts', push: false, pull: true, lastSync: 'Today 9:00 AM', ok: true },
    { name: 'Reports (P&L, BS)', push: false, pull: true, lastSync: 'Today 9:00 AM', ok: true },
  ];

  return (
    <div className="space-y-6 max-w-[720px]">
      {/* Error Banner */}
      <Card className="bg-[#DE350B]/10 border border-[#DE350B]/30 rounded-2xl p-4 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-[#DE350B] shrink-0" />
        <span className="text-sm text-[#DE350B]">3 items failed to sync</span>
        <Button variant="ghost" className="ml-auto text-[#DE350B] text-sm underline h-auto p-0">View errors</Button>
      </Card>

      {/* Connection Card */}
      <Card className="bg-white border border-[var(--border)] rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#13B5EA] flex items-center justify-center text-white font-bold text-sm">X</div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#1A2732]">Xero</h3>
                <Badge className="bg-[var(--warm-200)] text-[#1A2732] border-0 text-xs rounded-full px-2 py-0.5">Connected</Badge>
              </div>
              <p className="text-xs text-[#737373] mt-0.5">Connected to Alliance Metal Pty Ltd since 15 Jan 2026</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-9 text-xs rounded-xl border-[var(--border)] text-[#DE350B]">Disconnect</Button>
        </div>
      </Card>

      {/* Sync Entities */}
      <Card className="bg-white border border-[var(--border)] rounded-2xl p-5">
        <h3 className="text-[14px] font-semibold text-[#1A2732] mb-4">Sync entities</h3>
        <div className="space-y-2">
          {syncEntities.map(e => (
            <div key={e.name} className="flex items-center gap-4 py-2 border-b border-[#F5F5F5] last:border-0">
              <span className="flex-1 text-sm text-[#1A2732]">{e.name}</span>
              <div className="flex items-center gap-4 text-xs text-[#737373]">
                {e.push && <Badge className="bg-[var(--warm-200)] text-[#1A2732] border-0 text-[10px] rounded-full px-2">Push</Badge>}
                {e.pull && <Badge className="bg-[var(--warm-200)] text-[#1A2732] border-0 text-[10px] rounded-full px-2">Pull</Badge>}
                <span className="w-24 text-right">{e.lastSync}</span>
                <div className={cn('w-2 h-2 rounded-full', e.ok ? 'bg-[#1A2732]' : 'bg-[#FACC15]')} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button className="bg-[#FFCF4B] hover:bg-[var(--mw-yellow-500)] text-[#1A2732] gap-2 rounded-xl">
            <RefreshCw className="w-4 h-4" /> Sync now
          </Button>
          <Button variant="outline" className="border-[var(--border)] gap-2 rounded-xl">Full re-sync</Button>
          <span className="text-xs text-[#737373] ml-auto">Last full sync: 20 Feb 2026, 09:00 AM</span>
        </div>
      </Card>

      {/* Account Mapping Preview */}
      <Card className="bg-[#F5F5F5] border border-[var(--border)] rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[14px] font-semibold text-[#1A2732]">Account mapping</h4>
            <p className="text-xs text-[#737373] mt-0.5">Map MirrorWorks categories to Xero account codes</p>
          </div>
          <Button variant="outline" className="border-[var(--border)] rounded-xl text-sm">Configure mapping</Button>
        </div>
      </Card>
    </div>
  );
}

// ── Reports Panel ──
function ReportsPanel() {
  const reports = [
    { label: 'Profit & Loss', enabled: true },
    { label: 'Balance Sheet', enabled: true },
    { label: 'Aged Receivables', enabled: true },
    { label: 'Aged Payables', enabled: true },
    { label: 'Job Profitability', enabled: true },
    { label: 'WIP Valuation', enabled: false },
    { label: 'Budget vs Actual', enabled: false },
    { label: 'Cash Flow Forecast', enabled: true },
  ];

  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Available reports</SectionLabel>
        <p className="text-sm text-[#737373] mb-4">Choose which reports appear in the Book reports gallery.</p>
        <div className="space-y-2">
          {reports.map(r => (
            <div key={r.label} className="flex items-center justify-between bg-white border border-[var(--border)] rounded-2xl p-3">
              <span className="text-sm text-[#1A2732]">{r.label}</span>
              <Switch defaultChecked={r.enabled} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Reporting period</SectionLabel>
        <div>
          <Label className="text-sm mb-2 block font-medium">Default date range</Label>
          <Select defaultValue="month">
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
          <Button variant="outline" className="border-[var(--border)] gap-2 rounded-xl">Export invoices CSV</Button>
          <Button variant="outline" className="border-[var(--border)] gap-2 rounded-xl">Export expenses CSV</Button>
        </div>
      </div>
    </div>
  );
}

// ── Root ──
const settingsPanels: SettingsPanel[] = [
  { key: 'general', label: 'General', icon: Settings, component: GeneralPanel },
  { key: 'invoicing', label: 'Invoicing', icon: FileText, component: InvoicingPanel },
  { key: 'xero', label: 'Xero Integration', icon: Link, component: XeroPanel },
  { key: 'reports', label: 'Reports', icon: BarChart3, component: ReportsPanel },
];

export function BookSettings() {
  return (
    <ModuleSettingsLayout
      title="Book Settings"
      moduleName="Book"
      panels={settingsPanels}
      permissionKeys={bookPermissionKeys}
      defaultGroups={bookDefaultGroups}
    />
  );
}
