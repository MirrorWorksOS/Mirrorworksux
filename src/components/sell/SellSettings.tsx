/**
 * Sell Settings - Left nav with panels
 * Panels: General, Teams, Leads/Pipeline, Quoting, Payments, Activities, Analytics, Integrations
 */

import React, { useState } from 'react';
import { Settings, Users, Target, FileText, CreditCard, Calendar, BarChart3, Plug } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';

const { animationVariants } = designSystem;

type SettingsPanel = 'general' | 'teams' | 'pipeline' | 'quoting' | 'payments' | 'activities' | 'analytics' | 'integrations';

const panels: { key: SettingsPanel; label: string; icon: any }[] = [
  { key: 'general', label: 'General', icon: Settings },
  { key: 'teams', label: 'Teams', icon: Users },
  { key: 'pipeline', label: 'Leads & Pipeline', icon: Target },
  { key: 'quoting', label: 'Quoting', icon: FileText },
  { key: 'payments', label: 'Payments', icon: CreditCard },
  { key: 'activities', label: 'Activities', icon: Calendar },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'integrations', label: 'Integrations', icon: Plug },
];

export function SellSettings() {
  const [activePanel, setActivePanel] = useState<SettingsPanel>('general');

  return (
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-6">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-[32px] tracking-tight text-[#1A2732] mb-6">Sell Settings</h1>

        <div className="flex gap-6">
          {/* Left Navigation */}
          <Card className="w-64 flex-shrink-0 bg-white border border-[#E5E5E5] rounded-lg p-4 h-fit">
            <nav className="space-y-1">
              {panels.map(panel => {
                const Icon = panel.icon;
                return (
                  <button
                    key={panel.key}
                    onClick={() => setActivePanel(panel.key)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      activePanel === panel.key
                        ? "bg-[#FFFBF0] text-[#0A0A0A] font-medium"
                        : "text-[#737373] hover:bg-[#F5F5F5]"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {panel.label}
                  </button>
                );
              })}
            </nav>
          </Card>

          {/* Right Panel Content */}
          <div className="flex-1">
            {activePanel === 'general' && (
              <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[#0A0A0A] mb-4">General Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Company Name</label>
                    <Input placeholder="Enter company name" className="border-[#E5E5E5]" defaultValue="Alliance Metal" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Currency</label>
                    <Input placeholder="AUD" className="border-[#E5E5E5]" defaultValue="AUD" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Tax Rate (%)</label>
                    <Input placeholder="10" type="number" className="border-[#E5E5E5]" defaultValue="10" />
                  </div>
                  <Button className="bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732]">Save Changes</Button>
                </div>
              </Card>
            )}

            {activePanel === 'integrations' && (
              <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[#0A0A0A] mb-4">Integrations</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-[#E5E5E5] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#13B5EA] rounded flex items-center justify-center text-white font-bold">X</div>
                      <div>
                        <h3 className="font-medium text-[#0A0A0A]">Xero</h3>
                        <p className="text-xs text-[#737373]">Accounting software integration</p>
                      </div>
                    </div>
                    <Badge className="bg-[#E3FCEF] text-[#36B37E] border-0">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-[#E5E5E5] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F5F5F5] rounded flex items-center justify-center">
                        <Plug className="w-5 h-5 text-[#737373]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#0A0A0A]">Stripe</h3>
                        <p className="text-xs text-[#737373]">Payment processing</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-[#E5E5E5]">Connect</Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Placeholder for other panels */}
            {!['general', 'integrations'].includes(activePanel) && (
              <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[#0A0A0A] mb-4">
                  {panels.find(p => p.key === activePanel)?.label}
                </h2>
                <p className="text-sm text-[#737373]">Settings panel content for {activePanel}</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
