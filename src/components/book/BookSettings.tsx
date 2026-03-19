import React, { useState } from 'react';
import { Settings, FileText, Link, GitMerge, Percent, ShieldCheck, Scan, Calculator, Download, ExternalLink, RefreshCw, AlertTriangle, Lock, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { cn } from '../ui/utils';

const NAV_ITEMS = [
  { icon: Settings, label: 'General' },
  { icon: FileText, label: 'Invoicing' },
  { icon: Link, label: 'Accounting Integration' },
  { icon: GitMerge, label: 'Account Mapping' },
  { icon: Percent, label: 'Tax' },
  { icon: ShieldCheck, label: 'Approvals' },
  { icon: Scan, label: 'OCR & Automation' },
  { icon: Calculator, label: 'Cost Rates' },
  { icon: Download, label: 'Export' },
];

// === General Panel ===
function GeneralPanel() {
  return (
    <div className="space-y-8 max-w-[720px]">
      <div className="flex justify-end gap-3">
        <Button variant="ghost" className="text-[#525252] text-sm">Discard</Button>
        <Button className="h-10 bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732] rounded opacity-40" disabled>Save changes</Button>
      </div>

      {/* Organisation Defaults */}
      <div>
        <div className="text-xs tracking-wider text-[#A3A3A3] mb-2" style={{ fontWeight: 500 }}>ORGANISATION DEFAULTS</div>
        <Separator className="mb-4" />
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block" style={{ fontWeight: 500 }}>Organisation name</Label>
            <div className="relative">
              <Input defaultValue="Acme Metal Fabrication Pty Ltd" className="h-14 border-[#E5E5E5] rounded bg-[#F5F5F5] pr-10" readOnly />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
            </div>
          </div>
          <div>
            <Label className="text-sm mb-2 block" style={{ fontWeight: 500 }}>Default currency</Label>
            <Select defaultValue="aud">
              <SelectTrigger className="h-14 border-[#E5E5E5] rounded"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="aud">AUD — Australian Dollar</SelectItem>
                <SelectItem value="usd">USD — US Dollar</SelectItem>
                <SelectItem value="nzd">NZD — New Zealand Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm mb-2 block" style={{ fontWeight: 500 }}>Fiscal year end</Label>
            <div className="flex gap-2">
              <Select defaultValue="june">
                <SelectTrigger className="h-14 border-[#E5E5E5] rounded flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <SelectItem key={m} value={m.toLowerCase()}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input defaultValue="30" className="h-14 border-[#E5E5E5] rounded w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Document Numbering */}
      <div>
        <div className="text-xs tracking-wider text-[#A3A3A3] mb-2" style={{ fontWeight: 500 }}>DOCUMENT NUMBERING</div>
        <Separator className="mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Invoice prefix', value: 'INV-', preview: 'INV-2026-0047' },
            { label: 'Expense prefix', value: 'EXP-', preview: 'EXP-2026-0123' },
            { label: 'PO prefix', value: 'PO-', preview: 'PO-2026-0089' },
            { label: 'Credit note prefix', value: 'CN-', preview: 'CN-2026-0005' },
          ].map(f => (
            <div key={f.label}>
              <Label className="text-sm mb-2 block" style={{ fontWeight: 500 }}>{f.label}</Label>
              <Input defaultValue={f.value} className="h-14 border-[#E5E5E5] rounded" />
              <p className="text-xs text-[#A3A3A3] mt-1" style={{ fontFamily: 'Roboto Mono, monospace' }}>Preview: {f.preview}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Lock Date */}
      <div>
        <div className="text-xs tracking-wider text-[#A3A3A3] mb-2" style={{ fontWeight: 500 }}>LOCK DATE</div>
        <Separator className="mb-4" />
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block" style={{ fontWeight: 500 }}>Lock date</Label>
            <div className="relative">
              <Input defaultValue="31 Jan 2026" className="h-14 border-[#E5E5E5] rounded pr-10" />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
            </div>
            <p className="text-xs text-[#737373] mt-1">Transactions dated before this date cannot be created or edited.</p>
          </div>
          <div>
            <Label className="text-sm mb-2 block" style={{ fontWeight: 500 }}>Lock applies to</Label>
            <div className="flex gap-6">
              {[{ label: 'Invoices', checked: true }, { label: 'Expenses', checked: true }, { label: 'Purchase Orders', checked: true }, { label: 'Journals', checked: false }].map(c => (
                <div key={c.label} className="flex items-center gap-2">
                  <Checkbox defaultChecked={c.checked} className="w-[18px] h-[18px]" />
                  <span className="text-sm">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <div>
        <div className="text-xs tracking-wider text-[#A3A3A3] mb-2" style={{ fontWeight: 500 }}>DASHBOARD</div>
        <Separator className="mb-4" />
        <p className="text-sm text-[#525252] mb-4">Choose which cards appear on the Book dashboard.</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total revenue', checked: true },
            { label: 'Overdue invoices', checked: false },
            { label: 'Outstanding invoices', checked: true },
            { label: 'WIP valuation', checked: false },
            { label: 'Profit margin', checked: true },
            { label: 'Expenses this month', checked: true },
            { label: 'Cash flow', checked: true },
            { label: 'Budget utilisation', checked: false },
          ].map(c => (
            <div key={c.label} className="flex items-center gap-2">
              <Checkbox defaultChecked={c.checked} className="w-[18px] h-[18px]" />
              <span className="text-sm">{c.label}</span>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="h-10 mt-4 border-[#E5E5E5] text-[#1A2732] rounded">Update dashboard</Button>
      </div>
    </div>
  );
}

// === Accounting Integration (Xero) Panel ===
function XeroPanel() {
  const syncEntities = [
    { name: 'Invoices', push: true, pull: true, lastSync: '2 min ago', ok: true },
    { name: 'Expenses (as Bills)', push: true, pull: false, lastSync: '5 min ago', ok: true },
    { name: 'Purchase Orders', push: true, pull: false, lastSync: '1 hr ago', ok: true },
    { name: 'Manual Journals (WIP)', push: true, pull: false, lastSync: 'Yesterday', ok: false },
    { name: 'Chart of Accounts', push: false, pull: true, lastSync: 'Today 9:00 AM', ok: true },
    { name: 'Reports (P&L, BS)', push: false, pull: true, lastSync: 'Today 9:00 AM', ok: true },
  ];

  const syncLog = [
    { time: '10:33 AM', entity: 'Invoice INV-2026-0045', direction: 'Push', status: 'Synced', error: '' },
    { time: '10:32 AM', entity: 'Chart of Accounts', direction: 'Pull', status: 'Synced', error: '' },
    { time: '10:30 AM', entity: 'Expense EXP-0122', direction: 'Push', status: 'Failed', error: 'Xero rate limit exceeded — retry scheduled' },
    { time: '10:28 AM', entity: 'PO-2026-034', direction: 'Push', status: 'Synced', error: '' },
    { time: '10:25 AM', entity: 'Reports P&L', direction: 'Pull', status: 'Synced', error: '' },
  ];

  return (
    <div className="space-y-6 max-w-[720px]">
      <div>
        <h2 className="text-2xl tracking-tight text-[#1A2732]">Xero Integration</h2>
        <p className="text-sm text-[#737373]">Connect MirrorWorks to your Xero account</p>
      </div>

      {/* Error Banner */}
      <div className="bg-[#FFE5E5] border border-[#DE350B] rounded-lg p-4 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-[#DE350B] shrink-0" />
        <span className="text-sm text-[#DE350B]">3 items failed to sync</span>
        <Button variant="ghost" className="ml-auto text-[#DE350B] p-0 h-auto text-sm underline">View Errors</Button>
      </div>

      {/* Connection Card */}
      <Card className="bg-white rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[#E5E5E5] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-[#13B5EA] flex items-center justify-center text-white text-sm" style={{ fontWeight: 700 }}>X</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#1A2732]" style={{ fontWeight: 500 }}>Connected to Con-form Group Pty Ltd</span>
                <div className="w-2 h-2 rounded-full bg-[#36B37E]" />
              </div>
              <span className="text-xs text-[#737373]">Connected since 15 Jan 2026</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-10 border-[#E5E5E5] text-[#DE350B]">Disconnect</Button>
        </div>
      </Card>

      {/* Sync Configuration */}
      <Card className="bg-white rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[#E5E5E5] p-6">
        <h3 className="text-[#1A2732] mb-4" style={{ fontWeight: 500 }}>Sync Entities</h3>
        <table className="w-full">
          <thead>
            <tr className="text-xs text-[#737373]" style={{ fontWeight: 500 }}>
              <th className="text-left py-2">Entity</th>
              <th className="text-center py-2">Push to Xero</th>
              <th className="text-center py-2">Pull from Xero</th>
              <th className="text-left py-2">Last Sync</th>
              <th className="text-center py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {syncEntities.map(e => (
              <tr key={e.name} className="border-t border-[#F5F5F5] h-14">
                <td className="text-sm">{e.name}</td>
                <td className="text-center">{e.push ? <Switch defaultChecked className="mx-auto" /> : <span className="text-[#A3A3A3]">—</span>}</td>
                <td className="text-center">{e.pull ? <Switch defaultChecked className="mx-auto" /> : <span className="text-[#A3A3A3]">—</span>}</td>
                <td className="text-xs text-[#737373]">{e.lastSync}</td>
                <td className="text-center"><div className={cn("w-2 h-2 rounded-full mx-auto", e.ok ? "bg-[#36B37E]" : "bg-[#FACC15]")} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex items-center gap-3">
          <Label className="text-sm" style={{ fontWeight: 500 }}>Sync Frequency</Label>
          <Select defaultValue="realtime">
            <SelectTrigger className="h-10 w-48 border-[#E5E5E5]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">Real-time</SelectItem>
              <SelectItem value="15min">Every 15 min</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Manual Sync */}
      <Card className="bg-white rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[#E5E5E5] p-4 flex items-center gap-3">
        <Button className="h-10 bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732] rounded gap-2"><RefreshCw className="w-4 h-4" /> Sync Now</Button>
        <Button variant="outline" size="sm" className="h-10 border-[#E5E5E5]">Full Re-sync</Button>
        <span className="text-xs text-[#737373] ml-auto">Last full sync: 20 Feb 2026, 09:00 AM</span>
      </Card>

      {/* Sync Log */}
      <Card className="bg-white rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[#E5E5E5] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm text-[#1A2732]" style={{ fontWeight: 500 }}>Recent Sync Activity</h3>
          <Button variant="ghost" className="text-sm text-[#737373] p-0 h-auto">View All</Button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-[#737373]" style={{ fontWeight: 500 }}>
              <th className="text-left py-2">Time</th><th className="text-left py-2">Entity</th><th className="text-left py-2">Direction</th><th className="text-left py-2">Status</th><th className="text-left py-2">Error</th>
            </tr>
          </thead>
          <tbody>
            {syncLog.map((l, i) => (
              <tr key={i} className={cn("border-t border-[#F5F5F5]", l.status === 'Failed' && 'bg-[#FFE5E5]')}>
                <td className="py-2 text-xs text-[#737373]">{l.time}</td>
                <td className="py-2">{l.entity}</td>
                <td className="py-2"><Badge className={cn("rounded-full text-[11px] px-2 py-0 border-0", l.direction === 'Push' ? 'bg-[#E6F0FF] text-[#0052CC]' : 'bg-[#E6F7EF] text-[#1B7D4F]')}>{l.direction}</Badge></td>
                <td className="py-2 flex items-center gap-1"><div className={cn("w-2 h-2 rounded-full", l.status === 'Synced' ? 'bg-[#36B37E]' : 'bg-[#DE350B]')} />{l.status}</td>
                <td className="py-2 text-xs text-[#DE350B] max-w-[200px] truncate">{l.error}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// === Account Mapping Panel ===
function AccountMappingPanel() {
  const sections = [
    { title: 'Revenue Accounts', rows: [
      { mw: 'Sales Revenue', xero: '200 — Sales' },
      { mw: 'Service Revenue', xero: '210 — Service Revenue' },
    ]},
    { title: 'Cost of Goods Sold', rows: [
      { mw: 'Raw Materials', xero: '310 — Raw Materials' },
      { mw: 'Direct Labour', xero: '320 — Direct Labour' },
      { mw: 'Manufacturing Overhead', xero: '330 — Manufacturing Overhead' },
      { mw: 'Subcontractor Costs', xero: '340 — Subcontractor Costs' },
    ]},
    { title: 'Operating Expenses', rows: [
      { mw: 'Utilities', xero: '410 — Utilities' },
      { mw: 'Maintenance & Repairs', xero: '420 — Repairs & Maintenance' },
      { mw: 'Consumables', xero: '430 — Consumables' },
      { mw: 'Office Supplies', xero: '461 — Office Expenses' },
    ]},
    { title: 'Balance Sheet', rows: [
      { mw: 'Work in Progress', xero: '630 — WIP' },
      { mw: 'Finished Goods', xero: '640 — Finished Goods' },
    ]},
  ];

  return (
    <div className="space-y-6 max-w-[720px]">
      <div>
        <h2 className="text-2xl tracking-tight text-[#1A2732]">Account Mapping</h2>
        <p className="text-sm text-[#737373]">Map MirrorWorks categories to Xero account codes</p>
      </div>

      <div className="bg-[#FFF4CC] border border-[#FACC15] rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#805900] shrink-0 mt-0.5" />
        <p className="text-sm text-[#805900]">8 categories not yet mapped. Unsynced items will be skipped.</p>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="h-10 gap-2 border-[#E5E5E5]"><RefreshCw className="w-4 h-4" /> Refresh from Xero</Button>
      </div>

      {sections.map(section => (
        <div key={section.title}>
          <div className="text-sm text-[#1A2732] mb-3" style={{ fontWeight: 500 }}>{section.title}</div>
          <Card className="bg-white rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[#E5E5E5] overflow-hidden">
            <div className="grid grid-cols-2 bg-[#F8F7F4] border-b border-[#E5E5E5] px-4 py-2">
              <span className="text-xs tracking-wider text-[#737373]" style={{ fontWeight: 500 }}>MIRRORWORKS CATEGORY</span>
              <span className="text-xs tracking-wider text-[#737373]" style={{ fontWeight: 500 }}>XERO ACCOUNT</span>
            </div>
            {section.rows.map(row => (
              <div key={row.mw} className="grid grid-cols-2 px-4 h-14 items-center border-b border-[#F5F5F5] last:border-0">
                <span className="text-sm text-[#1A2732]">{row.mw}</span>
                <Select defaultValue={row.xero}>
                  <SelectTrigger className="h-10 border-[#E5E5E5] rounded text-[13px]" style={{ fontFamily: 'Roboto Mono, monospace' }}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={row.xero}>{row.xero}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </Card>
        </div>
      ))}

      {/* Tracking Categories */}
      <div>
        <div className="text-sm text-[#1A2732] mb-3" style={{ fontWeight: 500 }}>Tracking Categories</div>
        <Card className="bg-white rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] border border-[#E5E5E5] p-4 space-y-3">
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="text-sm">Job Number</span>
            <Select defaultValue="job"><SelectTrigger className="h-10 border-[#E5E5E5]"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="job">Job</SelectItem><SelectItem value="dept">Department</SelectItem><SelectItem value="none">None</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="text-sm">Department</span>
            <Select defaultValue="dept"><SelectTrigger className="h-10 border-[#E5E5E5]"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="job">Job</SelectItem><SelectItem value="dept">Department</SelectItem><SelectItem value="none">None</SelectItem></SelectContent>
            </Select>
          </div>
          <p className="text-xs text-[#737373]">Xero supports up to 2 tracking categories. These enable job-level P&L filtering.</p>
        </Card>
      </div>

      <div className="flex gap-3 pt-4">
        <Button className="h-12 px-6 bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732] rounded">Save Mappings</Button>
        <Button variant="outline" className="h-12 px-6 border-[#E5E5E5] text-[#1A2732] rounded">Reset to Defaults</Button>
      </div>
    </div>
  );
}

// === Main Settings Component ===
export function BookSettings() {
  const [activePanel, setActivePanel] = useState('General');

  const renderPanel = () => {
    switch (activePanel) {
      case 'Accounting Integration': return <XeroPanel />;
      case 'Account Mapping': return <AccountMappingPanel />;
      default: return <GeneralPanel />;
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Settings Nav */}
      <div className="w-[240px] shrink-0 bg-white border-r border-[#E5E5E5] flex flex-col overflow-y-auto">
        <div className="p-4">
          <span className="text-[#1A2732]" style={{ fontWeight: 500 }}>Settings</span>
        </div>
        <div className="space-y-1 px-2">
          {NAV_ITEMS.map(item => (
            <button
              key={item.label}
              onClick={() => setActivePanel(item.label)}
              className={cn(
                "w-full flex items-center gap-3 px-4 h-10 rounded-lg text-sm transition-colors text-left",
                activePanel === item.label
                  ? "bg-[#FFFBF0] text-[#1A2732] border-l-[3px] border-[#FFCF4B] pl-[13px]"
                  : "text-[#525252] hover:bg-[#F5F5F5]"
              )}
              style={{ fontWeight: activePanel === item.label ? 500 : 400 }}
            >
              <item.icon className="w-5 h-5" style={{ color: activePanel === item.label ? '#1A2732' : '#525252' }} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Plan Usage */}
        <div className="mt-auto p-4">
          <Card className="border border-[#E5E5E5] rounded-xl p-4 space-y-3">
            <Badge className="rounded-full text-[11px] px-2 py-0.5 border-0 bg-[#FFCF4B] text-[#1A2732]">Produce</Badge>
            {[
              { label: '375 / 500 Contacts', pct: 75 },
              { label: '50 / 100 Invoices', pct: 50 },
              { label: '50 / 100 Expenses', pct: 50 },
            ].map(u => (
              <div key={u.label}>
                <span className="text-xs text-[#525252]" style={{ fontWeight: 500 }}>{u.label}</span>
                <div className="h-1 bg-[#E5E5E5] rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-[#1A2732] rounded-full" style={{ width: `${u.pct}%` }} />
                </div>
              </div>
            ))}
            <p className="text-xs text-[#A3A3A3]">Renewal Date: Oct 3, 2026</p>
            <Button variant="ghost" className="p-0 h-auto text-xs text-[#0052CC] gap-1">
              Upgrade plan <ExternalLink className="w-3 h-3" />
            </Button>
          </Card>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {renderPanel()}
      </div>
    </div>
  );
}
