/**
 * Design Role Designer - Role/permission configuration
 */

import React from 'react';
import { Shield, Info } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const roles = [
  { name: 'Admin', color: '#7C3AED', description: 'Full system access' },
  { name: 'Manager', color: '#0052CC', description: 'All modules + approval authority' },
  { name: 'Scheduler', color: '#36B37E', description: 'Plan + Budget access' },
  { name: 'Supervisor', color: '#FACC15', description: 'Shop floor oversight' },
  { name: 'Operator', color: '#E5E5E5', description: 'Shop floor operations only' },
];

export function DesignRoleDesigner() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-[32px] tracking-tight text-[#1A2732]">Role Designer</h1>

      <Card className="bg-[#FFCF4B] border-2 border-[#2C2C2C] rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[#2C2C2C] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[16px] font-semibold text-[#2C2C2C] mb-2">
              Role & Permission Configuration
            </h3>
            <p className="text-sm text-[#2C2C2C] leading-relaxed">
              Define custom roles and configure granular permissions for each module. 
              Control access to features like budget visibility, approval workflows, and master data management.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map(role => (
          <Card key={role.name} className="bg-white border border-[var(--border)] rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: role.color }}>
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-[#1A2732]">{role.name}</h3>
                <p className="text-xs text-[#737373]">{role.description}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full border-[var(--border)]">Configure</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
