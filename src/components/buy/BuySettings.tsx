/**
 * Buy Settings - Left nav with panels
 * Panels: General, Approval Workflows, Suppliers, Categories, Units, Integrations
 */

import React, { useState } from 'react';
import { Settings, GitBranch, Users, Tag, Package, Plug } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';

const { animationVariants } = designSystem;

type SettingsPanel = 'general' | 'approvals' | 'suppliers' | 'categories' | 'units' | 'integrations';

const panels: { key: SettingsPanel; label: string; icon: any }[] = [
  { key: 'general', label: 'General', icon: Settings },
  { key: 'approvals', label: 'Approval Workflows', icon: GitBranch },
  { key: 'suppliers', label: 'Supplier Defaults', icon: Users },
  { key: 'categories', label: 'Categories', icon: Tag },
  { key: 'units', label: 'Units of Measure', icon: Package },
  { key: 'integrations', label: 'Integrations', icon: Plug },
];

export function BuySettings() {
  const [activePanel, setActivePanel] = useState<SettingsPanel>('general');

  return (
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-6">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-[32px] tracking-tight text-[#1A2732] mb-6">Buy Settings</h1>

        <div className="flex gap-6">
          {/* Left Navigation */}
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

          {/* Right Panel Content */}
          <div className="flex-1">
            {activePanel === 'general' && (
              <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[#0A0A0A] mb-4">General Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Default Currency</label>
                    <Input placeholder="AUD" className="border-[#E5E5E5]" defaultValue="AUD" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Default Lead Time (days)</label>
                    <Input placeholder="14" type="number" className="border-[#E5E5E5]" defaultValue="14" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Auto-create PRs from MRP</label>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded border-[#E5E5E5]" />
                      <span className="text-sm text-[#525252]">Automatically generate purchase requisitions</span>
                    </div>
                  </div>
                  <Button className="bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732]">Save Changes</Button>
                </div>
              </Card>
            )}

            {activePanel === 'approvals' && (
              <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[#0A0A0A] mb-4">Approval Workflows</h2>
                <div className="space-y-4">
                  <div className="p-4 border border-[#E5E5E5] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-[#0A0A0A]">Requisitions</h3>
                      <Badge className="bg-[#E3FCEF] text-[#36B37E] border-0">Active</Badge>
                    </div>
                    <p className="text-sm text-[#737373] mb-3">Require approval for all purchase requisitions</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#525252]">Under $1,000</span>
                        <span className="text-[#0A0A0A] font-medium">Supervisor</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#525252]">$1,000 - $10,000</span>
                        <span className="text-[#0A0A0A] font-medium">Manager</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#525252]">Over $10,000</span>
                        <span className="text-[#0A0A0A] font-medium">Director</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="border-[#E5E5E5]">Edit Workflow</Button>
                </div>
              </Card>
            )}

            {activePanel === 'categories' && (
              <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-[#0A0A0A]">Product Categories</h2>
                  <Button size="sm" className="bg-[#FFCF4B] hover:bg-[#E6A600] text-[#1A2732]">Add Category</Button>
                </div>
                <div className="space-y-2">
                  {['Raw Materials', 'Consumables', 'Equipment', 'Components', 'Services'].map(cat => (
                    <div key={cat} className="flex items-center justify-between p-3 border border-[#E5E5E5] rounded-lg">
                      <span className="text-sm text-[#0A0A0A]">{cat}</span>
                      <Button variant="ghost" size="sm" className="text-[#737373] hover:text-[#0A0A0A]">Edit</Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {!['general', 'approvals', 'categories'].includes(activePanel) && (
              <Card className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[#0A0A0A] mb-4">{panels.find(p => p.key === activePanel)?.label}</h2>
                <p className="text-sm text-[#737373]">Settings panel content for {activePanel}</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
