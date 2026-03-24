/**
 * ModuleSettingsLayout — Shared layout for module settings pages
 * Implements the group-based permissions model from ARCH 00.
 * @see src/guidelines/AccessRightsAndPermissions.md
 *
 * Every module settings page has the same structure:
 * - Left sidebar: settings panel navigation + Access & Permissions tab
 * - Right content: selected panel content
 * - Access tab shows group management with permission toggles
 */

import React, { useState } from 'react';
import { Shield, ChevronDown, ChevronRight, Plus, Trash2, Users, GripVertical } from 'lucide-react';
import { ConfirmDialog } from '../feedback/ConfirmDialog';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Switch } from '../../ui/switch';
import { Separator } from '../../ui/separator';
import { cn } from '../../ui/utils';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/components/shared/motion/motion-variants';
import { ModuleInfoCallout } from '@/components/shared/layout/ModuleInfoCallout';


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PermissionKey {
  key: string;
  label: string;
  description?: string;
  type: 'boolean' | 'scope';
}

export interface GroupMember {
  name: string;
  email: string;
  initials: string;
  avatar?: string;
}

export interface PermissionGroup {
  name: string;
  description: string;
  isDefault: boolean;
  members: GroupMember[];
  permissions: Record<string, string>;
}

export interface SettingsPanel {
  key: string;
  label: string;
  icon: any;
  component: React.ComponentType;
}

interface ModuleSettingsLayoutProps {
  title: string;
  moduleName: string;
  panels: SettingsPanel[];
  permissionKeys: PermissionKey[];
  defaultGroups: PermissionGroup[];
  /** Tier info for feature gates */
  tierName?: string;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs tracking-wider text-[var(--neutral-500)] font-medium mb-2 uppercase">{children}</div>
      <Separator className="mb-4" />
    </div>
  );
}

function SaveRow() {
  return (
    <div className="flex justify-end gap-3">
      <Button variant="ghost" className="text-[var(--neutral-500)] text-sm h-10 rounded-xl">Discard</Button>
      <Button className="h-10 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--mw-mirage)] rounded-xl">Save changes</Button>
    </div>
  );
}

function MemberAvatarStack({ members, max = 4 }: { members: GroupMember[]; max?: number }) {
  const shown = members.slice(0, max);
  const overflow = members.length - max;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((m, i) => (
        <div
          key={m.email}
          className="w-7 h-7 rounded-full bg-[var(--mw-mirage)] flex items-center justify-center text-white text-[10px] font-medium border-2 border-white"
          title={m.name}
        >
          {m.initials}
        </div>
      ))}
      {overflow > 0 && (
        <div className="w-7 h-7 rounded-full bg-[var(--neutral-200)] flex items-center justify-center text-[10px] font-medium text-[var(--neutral-500)] border-2 border-white">
          +{overflow}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Access & Permissions Panel (Group Management)
// ---------------------------------------------------------------------------

function AccessPermissionsPanel({
  moduleName,
  permissionKeys,
  defaultGroups,
}: {
  moduleName: string;
  permissionKeys: PermissionKey[];
  defaultGroups: PermissionGroup[];
}) {
  const [groups, setGroups] = useState(defaultGroups);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(defaultGroups[0]?.name ?? null);

  const toggleGroup = (name: string) => {
    setExpandedGroup(prev => (prev === name ? null : name));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[var(--mw-mirage)]">Access Groups</h3>
          <p className="text-sm text-[var(--neutral-500)] mt-0.5">
            Manage who can do what in the {moduleName} module. Permissions are additive across groups.
          </p>
        </div>
        <Button className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--mw-mirage)] gap-2 rounded-xl">
          <Plus className="w-4 h-4" /> New group
        </Button>
      </div>

      {/* Role hierarchy info */}
      <ModuleInfoCallout
        icon={<Shield className="w-5 h-5" />}
        title="Permission hierarchy"
        description={
          <>
            <strong>Super Admin</strong> has full access to all modules.{' '}
            <strong>Lead</strong> has full access to this module.{' '}
            <strong>Team</strong> members get permissions from their group membership below.
          </>
        }
      />

      {/* Groups list */}
      <div className="space-y-3">
        {groups.map((group) => {
          const isExpanded = expandedGroup === group.name;
          return (
            <Card
              key={group.name}
              className={cn(
                'bg-white border rounded-[var(--shape-lg)] overflow-hidden transition-all',
                isExpanded ? 'border-[var(--mw-yellow-400)]/50 shadow-sm' : 'border-[var(--border)]'
              )}
            >
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.name)}
                className="w-full flex items-center gap-4 p-4 hover:bg-[var(--neutral-100)] transition-colors"
              >
                <GripVertical className="w-4 h-4 text-[var(--neutral-400)] cursor-grab" />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--mw-mirage)]">{group.name}</span>
                    {group.isDefault && (
                      <Badge className="bg-[var(--neutral-100)] text-[var(--neutral-500)] border-0 text-[10px] rounded-full px-2">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[var(--neutral-500)] mt-0.5">{group.description}</p>
                </div>
                <MemberAvatarStack members={group.members} />
                <span className="text-xs text-[var(--neutral-500)] min-w-[70px] text-right">
                  {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-[var(--neutral-500)]">
                  {Object.values(group.permissions).filter(v => v === 'true' || v === 'all').length} of {permissionKeys.length} enabled
                </span>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-[var(--neutral-400)]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[var(--neutral-400)]" />
                )}
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-[var(--border)]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-x divide-[var(--border)]">
                    {/* Permissions */}
                    <div className="p-4">
                      <h4 className="text-xs tracking-wider text-[var(--neutral-500)] font-medium mb-3 uppercase">Permissions</h4>
                      <div className="space-y-2">
                        {permissionKeys.map((pk) => {
                          const currentValue = group.permissions[pk.key] ?? 'false';
                          if (pk.type === 'scope') {
                            return (
                              <div key={pk.key} className="flex items-center justify-between py-2 border-b border-[var(--neutral-100)] last:border-0">
                                <div>
                                  <span className="text-sm text-[var(--mw-mirage)]">{pk.label}</span>
                                  {pk.description && <p className="text-xs text-[var(--neutral-500)] mt-0.5">{pk.description}</p>}
                                </div>
                                <div className="flex items-center gap-1 bg-[var(--neutral-100)] rounded-full p-0.5">
                                  <button
                                    className={cn(
                                      'px-3 py-1 text-xs rounded-full transition-colors',
                                      currentValue === 'own' ? 'bg-white text-[var(--mw-mirage)] shadow-sm font-medium' : 'text-[var(--neutral-500)]'
                                    )}
                                  >
                                    Own
                                  </button>
                                  <button
                                    className={cn(
                                      'px-3 py-1 text-xs rounded-full transition-colors',
                                      currentValue === 'all' ? 'bg-white text-[var(--mw-mirage)] shadow-sm font-medium' : 'text-[var(--neutral-500)]'
                                    )}
                                  >
                                    All
                                  </button>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div key={pk.key} className="flex items-center justify-between py-2 border-b border-[var(--neutral-100)] last:border-0">
                              <div>
                                <span className="text-sm text-[var(--mw-mirage)]">{pk.label}</span>
                                {pk.description && <p className="text-xs text-[var(--neutral-500)] mt-0.5">{pk.description}</p>}
                              </div>
                              <Switch defaultChecked={currentValue === 'true'} />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Members */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs tracking-wider text-[var(--neutral-500)] font-medium uppercase">Members</h4>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-[var(--neutral-500)] gap-1 rounded-lg">
                          <Plus className="w-4 h-4" /> Add
                        </Button>
                      </div>
                      {group.members.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          <Users className="w-8 h-8 mx-auto mb-2 text-[var(--neutral-200)]" />
                          No members yet. Add users to this group.
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {group.members.map((m) => (
                            <div key={m.email} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-[var(--neutral-100)] transition-colors group/member">
                              <div className="w-8 h-8 rounded-full bg-[var(--mw-mirage)] flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                                {m.initials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-[var(--mw-mirage)] font-medium truncate">{m.name}</p>
                                <p className="text-xs text-[var(--neutral-500)] truncate">{m.email}</p>
                              </div>
                              <button className="opacity-0 group-hover/member:opacity-100 transition-opacity text-[var(--neutral-400)] hover:text-[var(--mw-error)]">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Group actions */}
                  <div className="border-t border-[var(--border)] px-4 py-3 bg-[var(--neutral-50)] flex items-center justify-between">
                    <ConfirmDialog
                      trigger={
                        <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive hover:bg-[var(--mw-error-light)] rounded-lg gap-1">
                          <Trash2 className="w-4 h-4" /> Delete group
                        </Button>
                      }
                      title={`Delete "${group.name}"?`}
                      description="All members will lose their permissions. This cannot be undone."
                      confirmLabel="Delete group"
                      onConfirm={() => {}}
                    />
                    <Button size="sm" className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-[var(--mw-mirage)] text-xs rounded-lg">
                      Save permissions
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Layout
// ---------------------------------------------------------------------------

export function ModuleSettingsLayout({
  title,
  moduleName,
  panels,
  permissionKeys,
  defaultGroups,
  tierName = 'Produce',
}: ModuleSettingsLayoutProps) {
  const allPanels: SettingsPanel[] = [
    ...panels,
    {
      key: 'access',
      label: 'Access & Permissions',
      icon: Shield,
      component: () => (
        <AccessPermissionsPanel
          moduleName={moduleName}
          permissionKeys={permissionKeys}
          defaultGroups={defaultGroups}
        />
      ),
    },
  ];

  const [activePanel, setActivePanel] = useState(allPanels[0].key);
  const ActiveComponent = allPanels.find(p => p.key === activePanel)?.component ?? allPanels[0].component;

  return (
    <motion.div initial="initial" animate="animate" variants={staggerContainer} className="p-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl tracking-tight text-[var(--mw-mirage)]">{title}</h1>
          <Badge className="bg-[var(--neutral-100)] text-[var(--neutral-500)] border-0 text-xs rounded-full px-3 py-1">
            {tierName} plan
          </Badge>
        </div>

        <div className="flex gap-6">
          {/* Left Navigation */}
          <div className="w-56 flex-shrink-0">
            <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-3 h-fit">
              <nav className="space-y-0.5">
                {allPanels.map(panel => {
                  const Icon = panel.icon;
                  const isAccess = panel.key === 'access';
                  return (
                    <React.Fragment key={panel.key}>
                      {isAccess && <Separator className="my-2" />}
                      <button
                        onClick={() => setActivePanel(panel.key)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left',
                          activePanel === panel.key
                            ? isAccess
                              ? 'bg-[var(--mw-yellow-400)]/10 text-[var(--mw-mirage)] font-medium'
                              : 'bg-[var(--accent)] text-[var(--mw-mirage)] font-medium'
                            : 'text-[var(--neutral-500)] hover:bg-[var(--neutral-100)] hover:text-[var(--mw-mirage)]',
                          isAccess && 'text-[var(--mw-mirage)]'
                        )}
                      >
                        <Icon className={cn('w-4 h-4 shrink-0', isAccess && activePanel === panel.key && 'text-[var(--mw-yellow-400)]')} />
                        {panel.label}
                      </button>
                    </React.Fragment>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="flex-1 min-w-0">
            <Card className="bg-white border border-[var(--border)] rounded-[var(--shape-lg)] p-6">
              <ActiveComponent />
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export { SectionLabel, SaveRow };
