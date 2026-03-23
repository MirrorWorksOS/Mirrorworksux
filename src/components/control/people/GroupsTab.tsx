import React, { useMemo, useState } from 'react';
import { ChevronDown, Plus, Shield, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/components/ui/utils';
import { mockGroups, mockUsers, moduleLabels, modulePermissionLabels } from './mock-data';
import type { Group, GroupPermissionSet, ModuleKey, PermissionLabelEntry } from './types';

interface GroupsTabProps {
  onOpenGroupDetail: (group: Group) => void;
}

const moduleOrder: ModuleKey[] = ['sell', 'plan', 'make', 'ship', 'book', 'buy', 'control'];

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

  const currentPermissionLabels = modulePermissionLabels[activeModule];
  const totalPermissions = currentPermissionLabels.length + 1; // +1 for documents.scope

  return (
    <div className="space-y-6">
      <Tabs value={activeModule} onValueChange={value => setActiveModule(value as ModuleKey)}>
        <TabsList className="h-auto rounded-[var(--shape-lg)] bg-white p-1 shadow-none">
          {moduleOrder.map(moduleKey => (
            <TabsTrigger
              key={moduleKey}
              value={moduleKey}
              className="relative h-10 rounded-xl data-[state=active]:bg-[var(--accent)] data-[state=active]:text-[var(--mw-mirage)]"
            >
              {moduleLabels[moduleKey]} ({grouped[moduleKey].length})
              {activeModule === moduleKey ? (
                <span className="absolute -bottom-1 left-1/2 h-[3px] w-10 -translate-x-1/2 rounded-full bg-[var(--mw-yellow-400)]" />
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Permission hierarchy info for Control module */}
      {activeModule === 'control' && (
        <div className="flex items-start gap-3 rounded-[var(--shape-lg)] border border-[var(--border)] bg-[var(--neutral-100)] p-4">
          <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--mw-yellow-400)]" />
          <div className="text-sm text-[var(--neutral-600)]">
            <p className="mb-1 font-medium text-[var(--mw-mirage)]">Control module permissions</p>
            <p>
              Control groups manage master data (products, BOMs, locations, machines) and people administration.
              <strong> People Admin</strong> can onboard users but cannot create or delete groups.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {grouped[activeModule].map(group => {
          const members = mockUsers.filter(user => group.members.includes(user.id));
          const enabledCount = currentPermissionLabels.filter(entry => {
            const val = group.permissions[entry.key];
            return val === true || val === 'all';
          }).length;
          const scopeVal = group.permissions['documents.scope'];
          if (scopeVal === 'all') {
            // Count documents.scope=all as an enabled permission
          }
          const progress = Math.round((enabledCount / totalPermissions) * 100);
          const open = expandedId === group.id;

          return (
            <div key={group.id} className="overflow-hidden rounded-[var(--shape-lg)] border border-[var(--border)] bg-white shadow-sm">
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
                    <h4 className="text-base font-semibold text-[var(--mw-mirage)]">{group.name}</h4>
                    {group.isDefault ? (
                      <Badge className="rounded-full border border-[var(--border)] bg-white px-2 py-0.5 text-xs text-[var(--neutral-500)]">
                        Default
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-[var(--neutral-500)]">{group.description}</p>
                </div>
                <div className="hidden items-center gap-4 md:flex">
                  <div className="flex -space-x-2">
                    {members.slice(0, 3).map(member => (
                      <Avatar key={member.id} className="h-8 w-8 border-2 border-white">
                        <AvatarFallback className="bg-[var(--neutral-100)] text-xs text-[var(--neutral-600)]">
                          {initials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {members.length > 3 ? <span className="pl-2 text-xs text-[var(--neutral-500)]">+{members.length - 3}</span> : null}
                  </div>
                  <div className="w-32">
                    <div
                      className="h-1.5 overflow-hidden rounded-full"
                      style={{
                        backgroundColor: 'var(--border)',
                        backgroundImage:
                          'repeating-linear-gradient(135deg, var(--border), var(--border) 3px, var(--neutral-100) 3px, var(--neutral-100) 6px)',
                      }}
                    >
                      <div className="h-full rounded-full bg-[var(--mw-yellow-400)]" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-[var(--neutral-500)]">
                      {enabledCount}/{totalPermissions}
                    </p>
                  </div>
                  <ChevronDown className={cn('h-4 w-4 text-[var(--neutral-500)] transition-transform', open && 'rotate-180')} />
                </div>
              </button>

              <motion.div
                initial={false}
                animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
                transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
                className="overflow-hidden"
              >
                <div className="grid gap-6 border-t border-[var(--neutral-100)] p-5 md:grid-cols-2">
                  <div className="space-y-4">
                    {/* Document scope toggle */}
                    <p className="text-xs font-medium tracking-wider text-[var(--neutral-500)] uppercase">Scope</p>
                    <div className="rounded-[var(--shape-lg)] bg-[var(--neutral-100)] p-1">
                      <ToggleGroup
                        type="single"
                        value={group.permissions['documents.scope']}
                        className="w-full"
                      >
                        <ToggleGroupItem value="own" className="h-10 flex-1 rounded-[var(--shape-lg)] text-xs">
                          Own records
                        </ToggleGroupItem>
                        <ToggleGroupItem value="all" className="h-10 flex-1 rounded-[var(--shape-lg)] text-xs">
                          All records
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>

                    {/* Additional scope permissions (module-specific) */}
                    {currentPermissionLabels
                      .filter(entry => entry.type === 'scope')
                      .map(entry => (
                        <div key={entry.key}>
                          <p className="mb-2 text-xs font-medium text-[var(--neutral-500)]">{entry.label}</p>
                          <div className="rounded-[var(--shape-lg)] bg-[var(--neutral-100)] p-1">
                            <ToggleGroup
                              type="single"
                              value={(group.permissions[entry.key] as string) ?? 'own'}
                              className="w-full"
                            >
                              <ToggleGroupItem value="own" className="h-10 flex-1 rounded-[var(--shape-lg)] text-xs">
                                Own
                              </ToggleGroupItem>
                              <ToggleGroupItem value="all" className="h-10 flex-1 rounded-[var(--shape-lg)] text-xs">
                                All
                              </ToggleGroupItem>
                            </ToggleGroup>
                          </div>
                        </div>
                      ))}

                    {/* Boolean permission sections */}
                    <PermissionSection group={group} section="actions" labels={currentPermissionLabels} />
                    <PermissionSection group={group} section="admin" labels={currentPermissionLabels} />
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-medium tracking-wider text-[var(--neutral-500)] uppercase">Members</p>
                    {members.map(member => (
                      <div key={member.id} className="flex items-center justify-between rounded-xl bg-[var(--neutral-100)] p-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 ring-1 ring-white">
                            <AvatarFallback className="bg-[var(--neutral-100)] text-xs text-[var(--neutral-800)]">
                              {initials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-[var(--neutral-800)]">{member.name}</span>
                        </div>
                        <Button variant="ghost" className="h-8 w-8 rounded-[var(--shape-md)] p-0 text-[var(--neutral-500)]">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="h-10 w-full rounded-xl border-[var(--border)] bg-white text-[var(--neutral-800)] hover:bg-[var(--neutral-100)]"
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
  labels,
}: {
  group: Group;
  section: 'actions' | 'admin';
  labels: PermissionLabelEntry[];
}) {
  const sectionRows = labels.filter(item => item.section === section && item.type === 'boolean');
  if (sectionRows.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium tracking-wider text-[var(--neutral-500)] uppercase">{section}</p>
      {sectionRows.map(row => (
        <div key={row.key} className="flex items-center justify-between rounded-[var(--shape-lg)] bg-white p-2">
          <span className="text-sm text-[var(--neutral-800)]">{row.label}</span>
          <Switch checked={group.permissions[row.key] === true} className="h-7 w-12" />
        </div>
      ))}
    </div>
  );
}
