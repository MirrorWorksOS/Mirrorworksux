/**
 * Role designer — global role templates (ARCH 00). Module-level groups live in each module’s Settings → Access & Permissions.
 * @see src/guidelines/AccessRightsAndPermissions.md
 */

import { Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ModuleInfoCallout } from '@/components/shared/layout/ModuleInfoCallout';
import { cn } from '@/components/ui/utils';
import { toast } from 'sonner';

const roles = [
  {
    name: 'Admin',
    wellClass: 'bg-[var(--chart-scale-high)]',
    iconClass: 'text-foreground',
    description: 'Full system access',
  },
  {
    name: 'Manager',
    wellClass: 'bg-[var(--chart-scale-mid)]',
    iconClass: 'text-white',
    description: 'All modules and approval authority',
  },
  {
    name: 'Scheduler',
    wellClass: 'bg-[var(--chart-scale-low)]',
    iconClass: 'text-foreground',
    description: 'Plan and budget access',
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

export function ControlRoleDesigner() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl tracking-tight text-foreground">Role designer</h1>

      <ModuleInfoCallout
        title="Organisation roles"
        description="Define organisation-wide role templates. Granular module permissions are managed per module under Settings → Access & permissions, and for users under Control → People."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roles.map(role => (
          <Card
            key={role.name}
            className="cursor-pointer rounded-[var(--shape-lg)] border border-[var(--neutral-200)] bg-card p-6 shadow-xs transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-[var(--shape-lg)]',
                  role.wellClass,
                )}
              >
                <Shield className={cn('h-5 w-5', role.iconClass)} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">{role.name}</h3>
                <p className="text-xs text-muted-foreground">{role.description}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="h-10 w-full rounded-[var(--shape-lg)] border-[var(--neutral-200)]" onClick={() => toast('Role configuration coming soon')}>
              Configure
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
