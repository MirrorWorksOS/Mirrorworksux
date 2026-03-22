/**
 * Plan Settings — 4 panels with real form controls
 * General · Scheduling · Capacity Planning · KPI Targets
 */
import React, { useState } from 'react';
import { Settings, Calendar, Wrench, Target } from 'lucide-react';
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

type Panel = 'general' | 'scheduling' | 'capacity' | 'kpis';

const NAV: { key: Panel; label: string; icon: any }[] = [
  { key: 'general',    label: 'General',            icon: Settings },
  { key: 'scheduling', label: 'Scheduling',          icon: Calendar },
  { key: 'capacity',   label: 'Capacity planning',   icon: Wrench },
  { key: 'kpis',       label: 'KPI targets',         icon: Target },
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
        <SectionLabel>Job numbering</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Job prefix</Label>
            <div className="flex gap-3 items-center">
              <Input defaultValue="MW-" className="h-12 border-[#E5E5E5] rounded bg-[#F5F5F5] w-28" />
              <span className="text-xs text-[#737373] font-['Roboto_Mono',monospace]">Preview: MW-001</span>
            </div>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Next job number</Label>
            <Input defaultValue="097" type="number" className="h-12 border-[#E5E5E5] rounded w-32" />
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Production defaults</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Default lead time</Label>
            <div className="flex items-center gap-3">
              <Input defaultValue="14" type="number" className="h-12 border-[#E5E5E5] rounded w-24" />
              <span className="text-sm text-[#737373]">days</span>
            </div>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Working hours per day</Label>
            <Input defaultValue="8" type="number" className="h-12 border-[#E5E5E5] rounded w-24" />
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Working days</Label>
            <div className="flex gap-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <button key={i} className={cn('w-10 h-10 rounded-full text-xs font-medium transition-colors', i < 5 ? 'bg-[#0A0A0A] text-white' : 'bg-[#F5F5F5] text-[#737373]')}>{d}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Preferences</SectionLabel>
        <div className="space-y-4">
          {[
            { label: 'Auto-create jobs from won opportunities', checked: false },
            { label: 'Require BOM before starting production',  checked: true },
            { label: 'Enable material requirements planning (MRP)', checked: true },
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

function SchedulingPanel() {
  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Scheduling method</SectionLabel>
        <div className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block font-medium">Default scheduling direction</Label>
            <Select defaultValue="backward">
              <SelectTrigger className="h-12 border-[#E5E5E5] rounded"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="forward">Forward scheduling (from start date)</SelectItem>
                <SelectItem value="backward">Backward scheduling (from due date)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Buffer time between operations</Label>
            <div className="flex items-center gap-3">
              <Input defaultValue="0.5" type="number" className="h-12 border-[#E5E5E5] rounded w-24" />
              <span className="text-sm text-[#737373]">hours</span>
            </div>
          </div>
          <div>
            <Label className="text-sm mb-2 block font-medium">Due date warning threshold</Label>
            <div className="flex items-center gap-3">
              <Input defaultValue="3" type="number" className="h-12 border-[#E5E5E5] rounded w-24" />
              <span className="text-sm text-[#737373]">days before due date</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Gantt chart display</SectionLabel>
        <div className="space-y-4">
          {[
            { label: 'Show weekends on Gantt',         checked: false },
            { label: 'Show public holidays',           checked: true },
            { label: 'Show machine utilisation bar',   checked: true },
            { label: 'Group by work centre (default)', checked: true },
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

function CapacityPanel() {
  const workCenters = [
    { name: 'Cutting',   machines: 2, hoursPerDay: 16, efficiency: 85 },
    { name: 'Forming',   machines: 2, hoursPerDay: 16, efficiency: 80 },
    { name: 'Welding',   machines: 3, hoursPerDay: 24, efficiency: 75 },
    { name: 'Machining', machines: 1, hoursPerDay: 8,  efficiency: 90 },
    { name: 'Finishing', machines: 1, hoursPerDay: 8,  efficiency: 70 },
  ];
  return (
    <div className="space-y-8 max-w-[720px]">
      <SaveRow />
      <div>
        <SectionLabel>Work centre capacities</SectionLabel>
        <Card className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F7F4] border-b border-[#E5E5E5]">
                {['Work centre', 'Machines', 'Hrs/day', 'Efficiency %'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs tracking-wider text-[#737373] uppercase font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workCenters.map(wc => (
                <tr key={wc.name} className="border-b border-[#F5F5F5] h-14">
                  <td className="px-4 text-sm text-[#0A0A0A] font-medium">{wc.name}</td>
                  <td className="px-4">
                    <Input defaultValue={`${wc.machines}`} type="number" className="h-9 w-16 border-[#E5E5E5] rounded text-center font-['Roboto_Mono',monospace] text-sm" />
                  </td>
                  <td className="px-4">
                    <Input defaultValue={`${wc.hoursPerDay}`} type="number" className="h-9 w-20 border-[#E5E5E5] rounded text-right font-['Roboto_Mono',monospace] text-sm" />
                  </td>
                  <td className="px-4">
                    <div className="flex items-center gap-2">
                      <Input defaultValue={`${wc.efficiency}`} type="number" className="h-9 w-20 border-[#E5E5E5] rounded text-right font-['Roboto_Mono',monospace] text-sm" />
                      <span className="text-sm text-[#737373]">%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
      <div>
        <SectionLabel>Overload alerts</SectionLabel>
        <div className="space-y-4">
          {[
            { label: 'Alert when work centre exceeds 90% utilisation', checked: true },
            { label: 'Block scheduling when capacity is full',         checked: false },
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

function KPIsPanel() {
  const kpis = [
    { label: 'On-time delivery rate target',   value: 95, suffix: '%' },
    { label: 'First-pass quality rate target', value: 98, suffix: '%' },
    { label: 'Overall equipment effectiveness (OEE)', value: 75, suffix: '%' },
    { label: 'Average job lead time target',   value: 14, suffix: 'days' },
    { label: 'WIP turns per month',            value: 4,  suffix: 'turns' },
  ];
  return (
    <div className="space-y-8 max-w-[640px]">
      <SaveRow />
      <div>
        <SectionLabel>Production KPI targets</SectionLabel>
        <div className="space-y-4">
          {kpis.map(kpi => (
            <div key={kpi.label} className="flex items-center justify-between py-2 border-b border-[#F5F5F5] last:border-0">
              <span className="text-sm text-[#0A0A0A]">{kpi.label}</span>
              <div className="flex items-center gap-2">
                <Input defaultValue={`${kpi.value}`} type="number" className="h-9 w-20 border-[#E5E5E5] rounded text-right font-['Roboto_Mono',monospace] text-sm" />
                <span className="text-sm text-[#737373] w-10">{kpi.suffix}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>Dashboard display</SectionLabel>
        <div className="space-y-4">
          {[
            { label: 'Show KPI sparklines on dashboard', checked: true },
            { label: 'Highlight KPIs below target in red', checked: true },
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

const PANEL_MAP: Record<Panel, () => JSX.Element> = {
  general:    GeneralPanel,
  scheduling: SchedulingPanel,
  capacity:   CapacityPanel,
  kpis:       KPIsPanel,
};

export function PlanSettings() {
  const [active, setActive] = useState<Panel>('general');
  const PanelComponent = PANEL_MAP[active];

  return (
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-6">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-[32px] tracking-tight text-[#0A0A0A] mb-6">Plan Settings</h1>
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
      </div>
    </motion.div>
  );
}
