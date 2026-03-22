/**
 * Make Settings — production configuration
 * Panels: General · Work Centres · Quality · Notifications
 */
import React, { useState } from 'react';
import { Settings, Wrench, CheckCircle2, Bell } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';

const { animationVariants } = designSystem;

type Panel = 'general' | 'workcentres' | 'quality' | 'notifications';

const NAV: { key: Panel; label: string; icon: any }[] = [
  { key: 'general',      label: 'General',       icon: Settings },
  { key: 'workcentres',  label: 'Work centres',  icon: Wrench },
  { key: 'quality',      label: 'Quality',       icon: CheckCircle2 },
  { key: 'notifications',label: 'Notifications', icon: Bell },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs tracking-wider text-[#737373] font-medium mb-2 uppercase">{children}</div>
      <Separator className="mb-4" />
    </div>
  );
}
function SaveRow() {
  return (
    <div className="flex justify-end gap-3">
      <Button variant="ghost" className="text-[#737373] text-sm h-10">Discard</Button>
      <Button className="h-10 bg-[#FFCF4B] hover:bg-[#EBC028] text-[#1A2732] rounded">Save changes</Button>
    </div>
  );
}

function GeneralPanel() {
  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Manufacturing order numbering</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">MO prefix</Label>
            <div className="flex gap-3 items-center">
              <Input defaultValue="MO-" className="h-12 border-[#E5E5E5] rounded bg-[#F5F5F5] w-28" />
              <span className="text-xs text-[#737373] font-['Roboto_Mono',monospace]">Preview: MO-2026-0056</span>
            </div>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Next MO number</Label>
            <Input defaultValue="56" type="number" className="h-12 border-[#E5E5E5] rounded w-32" />
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Shop floor preferences</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Time tracking method</Label>
            <Select defaultValue="manual">
              <SelectTrigger className="h-12 border-[#E5E5E5] rounded"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual clock-in / clock-out</SelectItem>
                <SelectItem value="auto">Auto-start on MO open</SelectItem>
                <SelectItem value="barcode">Barcode scan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Display language on shop floor</Label>
            <Select defaultValue="en">
              <SelectTrigger className="h-12 border-[#E5E5E5] rounded"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="zh">Mandarin</SelectItem>
                <SelectItem value="vi">Vietnamese</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Production rules</SectionLabel>
        <div className="space-y-4">
          {[
            { label: 'Require operator sign-off to advance MO stage', checked: true },
            { label: 'Allow splitting MOs across work centres',        checked: true },
            { label: 'Auto-close MO when all operations complete',     checked: true },
            { label: 'Require QC pass before dispatch',                checked: true },
            { label: 'Enable machine monitoring (IoT)',                 checked: false },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-[#F5F5F5] last:border-0">
              <span className="text-sm text-[#0A0A0A]">{r.label}</span>
              <Switch defaultChecked={r.checked} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkCentresPanel() {
  const wcs = [
    { name: 'Cutting',         code: 'CUT', defaultCostRate: 120, overtimeRate: 180 },
    { name: 'Forming',         code: 'FRM', defaultCostRate: 110, overtimeRate: 165 },
    { name: 'Welding',         code: 'WLD', defaultCostRate: 130, overtimeRate: 195 },
    { name: 'Machining',       code: 'MCH', defaultCostRate: 150, overtimeRate: 225 },
    { name: 'Finishing',       code: 'FIN', defaultCostRate: 90,  overtimeRate: 135 },
    { name: 'Assembly',        code: 'ASM', defaultCostRate: 95,  overtimeRate: 143 },
    { name: 'Material Handling',code: 'MH', defaultCostRate: 70,  overtimeRate: 105 },
  ];
  return (
    <div className="space-y-6 max-w-[720px]">
      <SaveRow />
      <SectionLabel>Work centre cost rates</SectionLabel>
      <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
              {['Work centre', 'Code', 'Standard rate ($/hr)', 'Overtime rate ($/hr)'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] uppercase font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {wcs.map(wc => (
              <tr key={wc.name} className="border-b border-[#F5F5F5] h-14">
                <td className="px-4 text-sm text-[#0A0A0A] font-medium">{wc.name}</td>
                <td className="px-4 text-xs font-['Roboto_Mono',monospace] text-[#737373]">{wc.code}</td>
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#737373]">$</span>
                    <Input defaultValue={`${wc.defaultCostRate}`} type="number" className="h-9 w-24 border-[#E5E5E5] rounded text-right font-['Roboto_Mono',monospace] text-sm" />
                  </div>
                </td>
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#737373]">$</span>
                    <Input defaultValue={`${wc.overtimeRate}`} type="number" className="h-9 w-24 border-[#E5E5E5] rounded text-right font-['Roboto_Mono',monospace] text-sm" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function QualityPanel() {
  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>NCR settings</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">NCR prefix</Label>
            <Input defaultValue="NCR-" className="h-12 border-[#E5E5E5] rounded bg-[#F5F5F5] w-28" />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#F5F5F5]">
            <div>
              <span className="text-sm text-[#0A0A0A]">Automatically assign NCRs to QC team</span>
              <p className="text-xs text-[#737373] mt-0.5">New NCRs assigned to QC manager by default</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#F5F5F5]">
            <div>
              <span className="text-sm text-[#0A0A0A]">Block dispatch when open NCR exists</span>
              <p className="text-xs text-[#737373] mt-0.5">Prevents shipping jobs with unresolved quality issues</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Inspection settings</SectionLabel>
        <div className="space-y-4">
          {[
            { label: 'Require incoming inspection for all materials', checked: true },
            { label: 'Require first article inspection on new products', checked: true },
            { label: 'Require dimensional report on jobs over $50,000', checked: false },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-[#F5F5F5] last:border-0">
              <span className="text-sm text-[#0A0A0A]">{r.label}</span>
              <Switch defaultChecked={r.checked} />
            </div>
          ))}
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
        <SectionLabel>Production alerts</SectionLabel>
        <div className="space-y-4">
          {[
            { label: 'Notify when MO is overdue',                     sub: 'Alert production manager when job exceeds due date', checked: true },
            { label: 'Notify when machine is offline',                 sub: 'Alert when monitored machine goes offline',          checked: false },
            { label: 'Notify on NCR creation',                         sub: 'Email QC team when a defect is logged',              checked: true },
            { label: 'Daily production summary email',                 sub: 'Summary of jobs completed, in progress, and overdue', checked: true },
            { label: 'Alert when work centre utilisation exceeds 90%', sub: 'Warn production manager of overload',                checked: true },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-3 border-b border-[#F5F5F5] last:border-0">
              <div>
                <span className="text-sm text-[#0A0A0A] font-medium">{r.label}</span>
                <p className="text-xs text-[#737373] mt-0.5">{r.sub}</p>
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
  workcentres:   WorkCentresPanel,
  quality:       QualityPanel,
  notifications: NotificationsPanel,
};

export function MakeSettings() {
  const [active, setActive] = useState<Panel>('general');
  const PanelComponent = PANEL_MAP[active];

  return (
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-6">
      <h1 className="text-[32px] tracking-tight text-[#0A0A0A] mb-6">Make settings</h1>
      <div className="flex gap-6">
        <div className="w-56 flex-shrink-0">
          <Card className="bg-white border border-[#E5E5E5] rounded-lg p-3 h-fit">
            <nav className="space-y-0.5">
              {NAV.map(n => {
                const Icon = n.icon;
                return (
                  <button key={n.key} onClick={() => setActive(n.key)}
                    className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                      active === n.key ? 'bg-[#FFFBF0] text-[#0A0A0A] font-medium' : 'text-[#737373] hover:bg-[#F5F5F5] hover:text-[#0A0A0A]'
                    )}>
                    <Icon className="w-4 h-4 shrink-0" />
                    {n.label}
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>
        <div className="flex-1 min-w-0">
          <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
            <PanelComponent />
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
