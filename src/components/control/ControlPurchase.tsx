/**
 * Control Purchase — procurement configuration and supplier defaults
 */
import React, { useState } from 'react';
import { ShoppingBag, Settings, Users, FileText, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { toast } from 'sonner';


type Panel = 'general' | 'approval' | 'suppliers' | 'notifications';

const NAV: { key: Panel; label: string; icon: any }[] = [
  { key: 'general',       label: 'General',       icon: Settings },
  { key: 'approval',      label: 'Approvals',     icon: FileText },
  { key: 'suppliers',     label: 'Supplier defaults', icon: Users },
  { key: 'notifications', label: 'Notifications', icon: Bell },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs tracking-wider text-[var(--neutral-500)] font-medium mb-2 uppercase">{children}</div>
      <Separator className="mb-4" />
    </div>
  );
}

function SaveRow() {
  return (
    <div className="flex justify-end gap-3">
      <Button variant="ghost" className="text-[var(--neutral-500)] text-sm h-10" onClick={() => toast('Changes discarded')}>Discard</Button>
      <Button className="h-10 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground" onClick={() => toast.success('Settings saved')}>Save changes</Button>
    </div>
  );
}

function GeneralPanel() {
  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Purchase order defaults</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">PO prefix</Label>
            <div className="flex gap-3 items-center">
              <Input defaultValue="PO-" className="h-12 border-[var(--border)] rounded-xl bg-[var(--neutral-100)] w-28" />
              <span className="text-xs text-[var(--neutral-500)] ">Preview: PO-0089</span>
            </div>
          </div>
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
          <div className="flex items-center justify-between py-2 border-b border-[var(--neutral-100)]">
            <div>
              <span className="text-sm text-foreground">Auto-generate POs at reorder point</span>
              <p className="text-xs text-[var(--neutral-500)] mt-0.5">Create draft POs when stock reaches minimum level</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[var(--neutral-100)]">
            <div>
              <span className="text-sm text-foreground">Enable three-way matching</span>
              <p className="text-xs text-[var(--neutral-500)] mt-0.5">Match PO, goods receipt, and invoice before payment</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm text-foreground">Require goods receipt before invoice</span>
              <p className="text-xs text-[var(--neutral-500)] mt-0.5">Block invoice processing until GRN is confirmed</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
}

function ApprovalPanel() {
  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Approval thresholds</SectionLabel>
        <div className="space-y-4">
          {[
            { label: 'Auto-approve POs under',           value: '1000', suffix: '$',     sub: 'No approval required below this amount' },
            { label: 'Supervisor approval above',         value: '5000', suffix: '$',     sub: 'Requires Supervisor or Manager sign-off' },
            { label: 'Manager approval above',            value: '25000', suffix: '$',    sub: 'Requires Manager or Admin sign-off' },
            { label: 'Director approval above',           value: '100000', suffix: '$',   sub: 'Requires Director approval' },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-3 border-b border-[var(--neutral-100)] last:border-0">
              <div>
                <span className="text-sm text-foreground font-medium">{r.label}</span>
                <p className="text-xs text-[var(--neutral-500)] mt-0.5">{r.sub}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--neutral-500)]">{r.suffix}</span>
                <Input defaultValue={r.value} type="number" className="h-10 border-[var(--border)] rounded-xl w-28 text-right " />
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

function SuppliersPanel() {
  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Supplier evaluation</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Preferred supplier scoring weights</Label>
            <div className="space-y-3 mt-2">
              {[
                { label: 'Price',          value: 30 },
                { label: 'Quality',        value: 35 },
                { label: 'Lead time',      value: 20 },
                { label: 'Reliability',    value: 15 },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-4">
                  <span className="text-sm text-foreground w-28">{s.label}</span>
                  <div className="flex-1 h-1.5 bg-[var(--neutral-200)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--mw-yellow-400)] rounded-full" style={{ width: `${s.value}%` }} />
                  </div>
                  <Input defaultValue={`${s.value}`} type="number" className="h-9 w-20 border-[var(--border)] rounded-xl text-right  text-sm" />
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
    </div>
  );
}

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
            { label: 'PO overdue — supplier hasn\'t delivered', sub: 'Alert when expected delivery date is passed', checked: true },
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

const PANEL_MAP: Record<Panel, () => JSX.Element> = {
  general:       GeneralPanel,
  approval:      ApprovalPanel,
  suppliers:     SuppliersPanel,
  notifications: NotificationsPanel,
};

export function ControlPurchase() {
  const [active, setActive] = useState<Panel>('general');
  const PanelComponent = PANEL_MAP[active];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="p-6"
    >
      <h1 className="text-3xl tracking-tight text-foreground mb-6">Purchase settings</h1>

      <div className="flex gap-6">
        {/* Left nav */}
        <div className="w-56 flex-shrink-0">
          <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-3 h-fit">
            <nav className="space-y-0.5">
              {NAV.map(n => {
                const Icon = n.icon;
                return (
                  <button
                    key={n.key}
                    onClick={() => setActive(n.key)}
                    className={cn(
                      'w-full flex items-center gap-4 px-3 py-2 rounded-[var(--shape-lg)] text-sm transition-colors text-left',
                      active === n.key
                        ? 'bg-[var(--accent)] text-foreground font-medium'
                        : 'text-[var(--neutral-500)] hover:bg-[var(--neutral-100)] hover:text-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {n.label}
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Right panel */}
        <div className="flex-1 min-w-0">
          <Card className="bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
            <PanelComponent />
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
