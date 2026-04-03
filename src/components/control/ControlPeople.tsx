import { useMemo, useState } from 'react';
import { BellDot, Layers3, Users } from 'lucide-react';
import { DarkAccentCard } from '@/components/shared/cards/DarkAccentCard';
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
    <div className="space-y-8 bg-[var(--neutral-100)] p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">People</h1>
          <p className="mt-1 text-sm text-[var(--neutral-500)]">
            Manage team members, module access, and group permissions
          </p>
        </div>
        <Button
          className="h-11 bg-[var(--mw-yellow-400)] px-5 text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
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

      <div className="grid gap-6 md:grid-cols-3">
        <DarkAccentCard icon={Users} label="Total users" value={String(stats.activeUsers)} subtext="Active" />
        <DarkAccentCard icon={Layers3} label="Leads assigned" value={`${stats.leads} / ${stats.totalModules}`} subtext="Module leads" />
        <DarkAccentCard
          icon={BellDot}
          label="Pending invites"
          value={String(stats.pendingInvites)}
          subtext={stats.pendingInvites > 0 ? 'Action required' : 'No pending invites'}
        />
      </div>

      <Tabs value={activeTab} onValueChange={value => setActiveTab(value as PeopleTab)} className="space-y-6">
        <TabsList className="h-auto w-full justify-start rounded-[var(--shape-lg)] bg-card p-1">
          <TabsTrigger value="users" className="relative h-10 rounded-xl px-5 data-[state=active]:bg-[var(--accent)] data-[state=inactive]:text-[var(--neutral-500)]">
            Users
            {activeTab === 'users' ? <span className="absolute -bottom-1 left-1/2 h-[3px] w-9 -translate-x-1/2 rounded-full bg-[var(--mw-yellow-400)]" /> : null}
          </TabsTrigger>
          <TabsTrigger value="groups" className="relative h-10 rounded-xl px-5 data-[state=active]:bg-[var(--accent)] data-[state=inactive]:text-[var(--neutral-500)]">
            Groups
            {activeTab === 'groups' ? <span className="absolute -bottom-1 left-1/2 h-[3px] w-9 -translate-x-1/2 rounded-full bg-[var(--mw-yellow-400)]" /> : null}
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
