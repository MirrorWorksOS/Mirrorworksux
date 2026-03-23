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
  { name: 'Scheduler', color: 'var(--mw-success)', description: 'Plan + Budget access' },
  { name: 'Supervisor', color: 'var(--mw-warning)', description: 'Shop floor oversight' },
  { name: 'Operator', color: 'var(--neutral-200)', description: 'Shop floor operations only' },
];

export function DesignRoleDesigner() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">Role Designer</h1>

      <Card className="bg-[var(--mw-yellow-400)] border-2 border-[var(--neutral-800)] rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--neutral-800)] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-semibold text-[var(--neutral-800)] mb-2">
              Role & Permission Configuration
            </h3>
            <p className="text-sm text-[var(--neutral-800)] leading-relaxed">
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
                <h3 className="text-sm font-semibold text-[var(--mw-mirage)]">{role.name}</h3>
                <p className="text-xs text-[var(--neutral-500)]">{role.description}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full border-[var(--border)]">Configure</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
