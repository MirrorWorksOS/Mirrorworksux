/**
 * ModuleSettingsLayout — Shared layout for module settings pages
 * Implements the group-based permissions model from ARCH 00.
 *
 * Every module settings page has the same structure:
 * - Left sidebar: settings panel navigation + Access & Permissions tab
 * - Right content: selected panel content
 * - Access tab shows group management with permission toggles
 */

import React, { useState } from 'react';
import { Shield, ChevronDown, ChevronRight, Plus, Trash2, Users, GripVertical } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { designSystem } from '../../lib/design-system';

const { animationVariants } = designSystem;

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
      <div className="text-xs tracking-wider text-[#737373] font-medium mb-2 uppercase">{children}</div>
      <Separator className="mb-4" />
    </div>
  );
}

function SaveRow() {
  return (
    <div className="flex justify-end gap-3">
      <Button variant="ghost" className="text-[#737373] text-sm h-10 rounded-xl">Discard</Button>
      <Button className="h-10 bg-[#FFCF4B] hover:bg-[var(--mw-yellow-500)] text-[#1A2732] rounded-xl">Save changes</Button>
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
          className="w-7 h-7 rounded-full bg-[#1A2732] flex items-center justify-center text-white text-[10px] font-medium border-2 border-white"
          title={m.name}
        >
          {m.initials}
        </div>
      ))}
      {overflow > 0 && (
        <div className="w-7 h-7 rounded-full bg-[#E5E5E5] flex items-center justify-center text-[10px] font-medium text-[#737373] border-2 border-white">
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
          <h3 className="text-[16px] font-semibold text-[#1A2732]">Access Groups</h3>
          <p className="text-sm text-[#737373] mt-0.5">
            Manage who can do what in the {moduleName} module. Permissions are additive across groups.
          </p>
        </div>
        <Button className="bg-[#FFCF4B] hover:bg-[var(--mw-yellow-500)] text-[#1A2732] gap-2 rounded-xl">
          <Plus className="w-4 h-4" /> New group
        </Button>
      </div>

      {/* Role hierarchy info */}
      <Card className="bg-[#F5F5F5] border border-[var(--border)] rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#FFCF4B] mt-0.5 flex-shrink-0" />
          <div className="text-sm text-[#525252]">
            <p className="font-medium text-[#1A2732] mb-1">Permission hierarchy</p>
            <p>
              <strong>Super Admin</strong> has full access to all modules.{' '}
              <strong>Lead</strong> has full access to this module.{' '}
              <strong>Team</strong> members get permissions from their group membership below.
            </p>
          </div>
        </div>
      </Card>

      {/* Groups list */}
      <div className="space-y-3">
        {groups.map((group) => {
          const isExpanded = expandedGroup === group.name;
          return (
            <Card
              key={group.name}
              className={cn(
                'bg-white border rounded-2xl overflow-hidden transition-all',
                isExpanded ? 'border-[#FFCF4B]/50 shadow-sm' : 'border-[var(--border)]'
              )}
            >
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.name)}
                className="w-full flex items-center gap-4 p-4 hover:bg-[#F5F5F5] transition-colors"
              >
                <GripVertical className="w-4 h-4 text-[#A3A3A3] cursor-grab" />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold text-[#1A2732]">{group.name}</span>
                    {group.isDefault && (
                      <Badge className="bg-[#F5F5F5] text-[#737373] border-0 text-[10px] rounded-full px-2">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#737373] mt-0.5">{group.description}</p>
                </div>
                <MemberAvatarStack members={group.members} />
                <span className="text-xs text-[#737373] min-w-[70px] text-right">
                  {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-[#737373]">
                  {Object.values(group.permissions).filter(v => v === 'true' || v === 'all').length} of {permissionKeys.length} enabled
                </span>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-[#A3A3A3]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#A3A3A3]" />
                )}
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-[var(--border)]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-x divide-[var(--border)]">
                    {/* Permissions */}
                    <div className="p-4">
                      <h4 className="text-xs tracking-wider text-[#737373] font-medium mb-3 uppercase">Permissions</h4>
                      <div className="space-y-2">
                        {permissionKeys.map((pk) => {
                          const currentValue = group.permissions[pk.key] ?? 'false';
                          if (pk.type === 'scope') {
                            return (
                              <div key={pk.key} className="flex items-center justify-between py-2 border-b border-[#F5F5F5] last:border-0">
                                <div>
                                  <span className="text-sm text-[#1A2732]">{pk.label}</span>
                                  {pk.description && <p className="text-xs text-[#737373] mt-0.5">{pk.description}</p>}
                                </div>
                                <div className="flex items-center gap-1 bg-[#F5F5F5] rounded-full p-0.5">
                                  <button
                                    className={cn(
                                      'px-3 py-1 text-xs rounded-full transition-colors',
                                      currentValue === 'own' ? 'bg-white text-[#1A2732] shadow-sm font-medium' : 'text-[#737373]'
                                    )}
                                  >
                                    Own
                                  </button>
                                  <button
                                    className={cn(
                                      'px-3 py-1 text-xs rounded-full transition-colors',
                                      currentValue === 'all' ? 'bg-white text-[#1A2732] shadow-sm font-medium' : 'text-[#737373]'
                                    )}
                                  >
                                    All
                                  </button>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div key={pk.key} className="flex items-center justify-between py-2 border-b border-[#F5F5F5] last:border-0">
                              <div>
                                <span className="text-sm text-[#1A2732]">{pk.label}</span>
                                {pk.description && <p className="text-xs text-[#737373] mt-0.5">{pk.description}</p>}
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
                        <h4 className="text-xs tracking-wider text-[#737373] font-medium uppercase">Members</h4>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-[#737373] gap-1 rounded-lg">
                          <Plus className="w-3 h-3" /> Add
                        </Button>
                      </div>
                      {group.members.length === 0 ? (
                        <div className="text-center py-8 text-sm text-[#737373]">
                          <Users className="w-8 h-8 mx-auto mb-2 text-[#E5E5E5]" />
                          No members yet. Add users to this group.
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {group.members.map((m) => (
                            <div key={m.email} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-[#F5F5F5] transition-colors group/member">
                              <div className="w-8 h-8 rounded-full bg-[#1A2732] flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                                {m.initials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-[#1A2732] font-medium truncate">{m.name}</p>
                                <p className="text-xs text-[#737373] truncate">{m.email}</p>
                              </div>
                              <button className="opacity-0 group-hover/member:opacity-100 transition-opacity text-[#A3A3A3] hover:text-[#DE350B]">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Group actions */}
                  <div className="border-t border-[var(--border)] px-4 py-3 bg-[#F5F5F5] flex items-center justify-between">
                    <Button variant="ghost" size="sm" className="text-xs text-[#DE350B] hover:text-[#DE350B] hover:bg-[#FFEBE6] rounded-lg gap-1">
                      <Trash2 className="w-3 h-3" /> Delete group
                    </Button>
                    <Button size="sm" className="bg-[#FFCF4B] hover:bg-[var(--mw-yellow-500)] text-[#1A2732] text-xs rounded-lg">
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
    <motion.div initial="initial" animate="animate" variants={animationVariants.stagger} className="p-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[32px] tracking-tight text-[#1A2732]">{title}</h1>
          <Badge className="bg-[#F5F5F5] text-[#737373] border-0 text-xs rounded-full px-3 py-1">
            {tierName} plan
          </Badge>
        </div>

        <div className="flex gap-6">
          {/* Left Navigation */}
          <div className="w-56 flex-shrink-0">
            <Card className="bg-white border border-[var(--border)] rounded-2xl p-3 h-fit">
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
                              ? 'bg-[#FFCF4B]/10 text-[#1A2732] font-medium'
                              : 'bg-[var(--accent)] text-[#1A2732] font-medium'
                            : 'text-[#737373] hover:bg-[#F5F5F5] hover:text-[#1A2732]',
                          isAccess && 'text-[#1A2732]'
                        )}
                      >
                        <Icon className={cn('w-4 h-4 shrink-0', isAccess && activePanel === panel.key && 'text-[#FFCF4B]')} />
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
            <Card className="bg-white border border-[var(--border)] rounded-2xl p-6">
              <ActiveComponent />
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export { SectionLabel, SaveRow };
