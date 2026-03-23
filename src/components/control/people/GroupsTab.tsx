import React, { useMemo, useState } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/components/ui/utils';
import { mockGroups, mockUsers, moduleLabels } from './mock-data';
import type { Group, GroupPermissionSet, ModuleKey } from './types';

interface GroupsTabProps {
  onOpenGroupDetail: (group: Group) => void;
}

const moduleOrder: ModuleKey[] = ['sell', 'plan', 'make', 'ship', 'book', 'buy', 'control'];

const permissionLabels: Array<{ key: keyof GroupPermissionSet; label: string; section: 'actions' | 'admin' }> = [
  { key: 'quotes.create', label: 'Create quotes', section: 'actions' },
  { key: 'orders.create', label: 'Create orders', section: 'actions' },
  { key: 'jobs.assign', label: 'Assign jobs', section: 'actions' },
  { key: 'quality.approve', label: 'Approve quality', section: 'actions' },
  { key: 'maintenance.schedule', label: 'Schedule maintenance', section: 'actions' },
  { key: 'settings.access', label: 'Access settings', section: 'admin' },
  { key: 'reports.access', label: 'Access reports', section: 'admin' },
];

const initials = (name: string) =>
  name
    .split(' ')
    .map(part => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2);

export function GroupsTab({ onOpenGroupDetail }: GroupsTabProps) {
  const [activeModule, setActiveModule] = useState<ModuleKey>('make');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const grouped = useMemo(
    () =>
      moduleOrder.reduce<Record<ModuleKey, Group[]>>(
        (acc, moduleKey) => ({ ...acc, [moduleKey]: mockGroups.filter(group => group.module === moduleKey) }),
        { sell: [], plan: [], make: [], ship: [], book: [], buy: [], control: [] },
      ),
    [],
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeModule} onValueChange={value => setActiveModule(value as ModuleKey)}>
        <TabsList className="h-auto rounded-2xl bg-white p-1 shadow-none">
          {moduleOrder.map(moduleKey => (
            <TabsTrigger
              key={moduleKey}
              value={moduleKey}
              className="relative h-10 rounded-xl data-[state=active]:bg-[#FFFBF0] data-[state=active]:text-[#0A0A0A]"
            >
              {moduleLabels[moduleKey]} ({grouped[moduleKey].length})
              {activeModule === moduleKey ? (
                <span className="absolute -bottom-1 left-1/2 h-[3px] w-10 -translate-x-1/2 rounded-full bg-[#FFCF4B]" />
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {grouped[activeModule].map(group => {
          const members = mockUsers.filter(user => group.members.includes(user.id));
          const totalPermissions = 8;
          const enabledCount = Object.values(group.permissions).filter(value => value === true || value === 'all').length;
          const progress = Math.round((enabledCount / totalPermissions) * 100);
          const open = expandedId === group.id;

          return (
            <div key={group.id} className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white shadow-sm">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
                onClick={() => {
                  setExpandedId(open ? null : group.id);
                  onOpenGroupDetail(group);
                }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-semibold text-[#0A0A0A]">{group.name}</h4>
                    {group.isDefault ? (
                      <Badge className="rounded-full border border-[#E5E5E5] bg-white px-2 py-0.5 text-xs text-[#737373]">
                        Default
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-[#737373]">{group.description}</p>
                </div>
                <div className="hidden items-center gap-4 md:flex">
                  <div className="flex -space-x-2">
                    {members.slice(0, 3).map(member => (
                      <Avatar key={member.id} className="h-8 w-8 border-2 border-white">
                        <AvatarFallback className="bg-[#F5F5F5] text-xs text-[#525252]">
                          {initials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {members.length > 3 ? <span className="pl-2 text-xs text-[#737373]">+{members.length - 3}</span> : null}
                  </div>
                  <div className="w-32">
                    <div
                      className="h-1.5 overflow-hidden rounded-full"
                      style={{
                        backgroundColor: '#E5E5E5',
                        backgroundImage:
                          'repeating-linear-gradient(135deg, #E5E5E5, #E5E5E5 3px, #F5F5F5 3px, #F5F5F5 6px)',
                      }}
                    >
                      <div className="h-full rounded-full bg-[#FFCF4B]" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-[#737373]">
                      {enabledCount}/{totalPermissions}
                    </p>
                  </div>
                  <ChevronDown className={cn('h-4 w-4 text-[#737373] transition-transform', open && 'rotate-180')} />
                </div>
              </button>

              <motion.div
                initial={false}
                animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
                transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
                className="overflow-hidden"
              >
                <div className="grid gap-6 border-t border-[#F5F5F5] p-5 md:grid-cols-2">
                  <div className="space-y-4">
                    <p className="text-xs font-medium tracking-wider text-[#737373] uppercase">Scope</p>
                    <div className="rounded-lg bg-[#F5F5F5] p-1">
                      <ToggleGroup
                        type="single"
                        value={group.permissions['documents.scope']}
                        className="w-full"
                      >
                        <ToggleGroupItem value="own" className="h-10 flex-1 rounded-lg text-xs">
                          Own records
                        </ToggleGroupItem>
                        <ToggleGroupItem value="all" className="h-10 flex-1 rounded-lg text-xs">
                          All records
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    <PermissionSection group={group} section="actions" />
                    <PermissionSection group={group} section="admin" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-medium tracking-wider text-[#737373] uppercase">Members</p>
                    {members.map(member => (
                      <div key={member.id} className="flex items-center justify-between rounded-xl bg-[#F8F7F4] p-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 ring-1 ring-white">
                            <AvatarFallback className="bg-[#F5F5F5] text-xs text-[#2C2C2C]">
                              {initials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-[#2C2C2C]">{member.name}</span>
                        </div>
                        <Button variant="ghost" className="h-8 w-8 rounded-lg p-0 text-[#737373]">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="h-10 w-full rounded-xl border-[#E5E5E5] bg-white text-[#2C2C2C] hover:bg-[#F5F5F5]"
                    >
                      <Plus className="h-4 w-4" />
                      Add member
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PermissionSection({
  group,
  section,
}: {
  group: Group;
  section: 'actions' | 'admin';
}) {
  const sectionRows = permissionLabels.filter(item => item.section === section);
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium tracking-wider text-[#737373] uppercase">{section}</p>
      {sectionRows.map(row => (
        <div key={row.key} className="flex items-center justify-between rounded-lg bg-white p-2">
          <span className="text-sm text-[#2C2C2C]">{row.label}</span>
          <Switch checked={group.permissions[row.key]} className="h-7 w-12" />
        </div>
      ))}
    </div>
  );
}
