import React, { useMemo, useState } from 'react';
import { BellDot, Layers3, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GroupsTab } from './people/GroupsTab';
import { GroupDetailSheet } from './people/GroupDetailSheet';
import { InviteUserDialog } from './people/InviteUserDialog';
import { UsersTab } from './people/UsersTab';
import { UserDetailSheet } from './people/UserDetailSheet';
import { mockGroups, mockUsers } from './people/mock-data';
import type { Group, User } from './people/types';

type PeopleTab = 'users' | 'groups';

export function ControlPeople() {
  const [activeTab, setActiveTab] = useState<PeopleTab>('users');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [userSheetOpen, setUserSheetOpen] = useState(false);
  const [groupSheetOpen, setGroupSheetOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const stats = useMemo(() => {
    const activeUsers = mockUsers.filter(user => user.status === 'active').length;
    const pendingInvites = mockUsers.filter(user => user.status === 'invited').length;
    const leads = mockUsers.filter(user => user.role === 'lead').length;
    const totalModules = 7;
    return { activeUsers, pendingInvites, leads, totalModules };
  }, []);

  return (
    <div className="space-y-8 bg-[#F5F5F5] p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-[#1A2732]">People</h1>
          <p className="mt-1 text-sm text-[#737373]">
            Manage team members, module access, and group permissions
          </p>
        </div>
        <Button
          className="h-11 rounded-xl bg-[#FFCF4B] px-5 text-[#2C2C2C] hover:bg-[#EBC028]"
          onClick={() => {
            if (activeTab === 'users') {
              setInviteOpen(true);
              return;
            }
            setSelectedGroup(mockGroups[0] ?? null);
            setGroupSheetOpen(true);
          }}
        >
          {activeTab === 'users' ? '+ Invite user' : '+ New group'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Users} label="Total users" value={String(stats.activeUsers)} sublabel="Active" />
        <StatCard icon={Layers3} label="Leads assigned" value={`${stats.leads} / ${stats.totalModules}`} sublabel="Module leads" />
        <StatCard
          icon={BellDot}
          label="Pending invites"
          value={String(stats.pendingInvites)}
          sublabel={stats.pendingInvites > 0 ? 'Action required' : 'No pending invites'}
          showDot={stats.pendingInvites > 0}
        />
      </div>

      <Tabs value={activeTab} onValueChange={value => setActiveTab(value as PeopleTab)} className="space-y-6">
        <TabsList className="h-auto w-full justify-start rounded-2xl bg-white p-1">
          <TabsTrigger value="users" className="relative h-10 rounded-xl px-5 data-[state=active]:bg-[var(--accent)] data-[state=inactive]:text-[#737373]">
            Users
            {activeTab === 'users' ? <span className="absolute -bottom-1 left-1/2 h-[3px] w-9 -translate-x-1/2 rounded-full bg-[#FFCF4B]" /> : null}
          </TabsTrigger>
          <TabsTrigger value="groups" className="relative h-10 rounded-xl px-5 data-[state=active]:bg-[var(--accent)] data-[state=inactive]:text-[#737373]">
            Groups
            {activeTab === 'groups' ? <span className="absolute -bottom-1 left-1/2 h-[3px] w-9 -translate-x-1/2 rounded-full bg-[#FFCF4B]" /> : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersTab
            onOpenUserDetail={user => {
              setSelectedUser(user);
              setUserSheetOpen(true);
            }}
          />
        </TabsContent>
        <TabsContent value="groups">
          <GroupsTab
            onOpenGroupDetail={group => {
              setSelectedGroup(group);
              setGroupSheetOpen(true);
            }}
          />
        </TabsContent>
      </Tabs>

      <UserDetailSheet user={selectedUser} open={userSheetOpen} onOpenChange={setUserSheetOpen} />
      <GroupDetailSheet group={selectedGroup} open={groupSheetOpen} onOpenChange={setGroupSheetOpen} />
      <InviteUserDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  showDot = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sublabel: string;
  showDot?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-[#1A2732] p-4 text-white">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium tracking-wider text-white/70 uppercase">{label}</p>
        <Icon className="h-5 w-5 text-white/70" />
      </div>
      <p className="font-['JetBrains_Mono',monospace] text-3xl font-bold text-[#FFCF4B]">{value}</p>
      <div className="mt-1 flex items-center gap-1.5 text-xs text-white/80">
        {showDot ? <span className="h-1.5 w-1.5 rounded-full bg-[#FFCF4B]" /> : null}
        <span>{sublabel}</span>
      </div>
    </div>
  );
}
