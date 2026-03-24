/**
 * Design Role Designer - Role/permission configuration
 */

import React from 'react';
import { Shield } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { ModuleInfoCallout } from '@/components/shared/layout/ModuleInfoCallout';
import { cn } from '../ui/utils';

/** Distinct role accents using chart scale + neutrals (not traffic-light semantics). */
const roles = [
  {
    name: 'Admin',
    wellClass: 'bg-[var(--chart-scale-high)]',
    iconClass: 'text-[#2C2C2C]',
    description: 'Full system access',
  },
  {
    name: 'Manager',
    wellClass: 'bg-[var(--chart-scale-mid)]',
    iconClass: 'text-white',
    description: 'All modules + approval authority',
  },
  {
    name: 'Scheduler',
    wellClass: 'bg-[var(--chart-scale-low)]',
    iconClass: 'text-[var(--mw-mirage)]',
    description: 'Plan + Budget access',
  },
  {
    name: 'Supervisor',
    wellClass: 'bg-[var(--neutral-400)]',
    iconClass: 'text-white',
    description: 'Shop floor oversight',
  },
  {
    name: 'Operator',
    wellClass: 'bg-[var(--neutral-500)]',
    iconClass: 'text-white',
    description: 'Shop floor operations only',
  },
];

export function DesignRoleDesigner() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">Role Designer</h1>

      <ModuleInfoCallout
        title="Role & permission configuration"
        description="Define custom roles and configure granular permissions for each module. Control access to features like budget visibility, approval workflows, and master data management."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card
            key={role.name}
            className="bg-white border border-[var(--neutral-200)] shadow-xs rounded-[var(--shape-lg)] p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-[var(--shape-lg)] flex items-center justify-center',
                  role.wellClass
                )}
              >
                <Shield className={cn('w-5 h-5', role.iconClass)} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--mw-mirage)]">{role.name}</h3>
                <p className="text-xs text-muted-foreground">{role.description}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full border-[var(--neutral-200)]">
              Configure
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
