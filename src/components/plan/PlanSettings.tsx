/**
 * Plan Settings - Left nav with panels
 */

import React, { useState } from 'react';
import { Settings, Calendar, Wrench, Target } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../ui/utils';

type SettingsPanel = 'general' | 'scheduling' | 'capacity' | 'kpis';

const panels = [
  { key: 'general' as const, label: 'General', icon: Settings },
  { key: 'scheduling' as const, label: 'Scheduling', icon: Calendar },
  { key: 'capacity' as const, label: 'Capacity Planning', icon: Wrench },
  { key: 'kpis' as const, label: 'KPI Targets', icon: Target },
];

export function PlanSettings() {
  const [activePanel, setActivePanel] = useState<SettingsPanel>('general');

  return (
    <div className="p-6">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-[32px] tracking-tight text-[#1A2732] mb-6">Plan Settings</h1>

        <div className="flex gap-6">
          <Card className="w-64 flex-shrink-0 bg-white border border-[#E5E5E5] rounded-lg p-4 h-fit">
            <nav className="space-y-1">
              {panels.map(panel => {
                const Icon = panel.icon;
                return (
                  <button key={panel.key} onClick={() => setActivePanel(panel.key)}
                    className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      activePanel === panel.key ? "bg-[#FFFBF0] text-[#0A0A0A] font-medium" : "text-[#737373] hover:bg-[#F5F5F5]")}>
                    <Icon className="w-4 h-4" />
                    {panel.label}
                  </button>
                );
              })}
            </nav>
          </Card>

          <div className="flex-1">
            {activePanel === 'general' && (
              <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[#0A0A0A] mb-4">General Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Default Lead Time (days)</label>
                    <Input type="number" className="border-[#E5E5E5]" defaultValue="14" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Working Hours Per Day</label>
                    <Input type="number" className="border-[#E5E5E5]" defaultValue="8" />
                  </div>
                  <Button className="bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732]">Save Changes</Button>
                </div>
              </Card>
            )}

            {activePanel !== 'general' && (
              <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[#0A0A0A] mb-4">{panels.find(p => p.key === activePanel)?.label}</h2>
                <p className="text-sm text-[#737373]">Settings panel content for {activePanel}</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
