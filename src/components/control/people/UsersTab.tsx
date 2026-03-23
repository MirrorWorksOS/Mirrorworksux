import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/components/ui/utils';
import { moduleColors, moduleLabels, mockUsers } from './mock-data';
import type { ModuleKey, User, UserRole, UserStatus } from './types';

interface UsersTabProps {
  onOpenUserDetail: (user: User) => void;
}

const initials = (name: string) =>
  name
    .split(' ')
    .map(part => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2);

const statusMeta: Record<UserStatus, { label: string; colour: string }> = {
  active: { label: 'Active', colour: 'var(--mw-success)' },
  invited: { label: 'Invited', colour: 'var(--mw-blue)' },
  deactivated: { label: 'Deactivated', colour: 'var(--neutral-500)' },
};

export function UsersTab({ onOpenUserDetail }: UsersTabProps) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [moduleFilter, setModuleFilter] = useState<ModuleKey[]>([]);
  const [roleFilter, setRoleFilter] = useState<UserRole[]>([]);
  const [statusFilter, setStatusFilter] = useState<UserStatus[]>([]);

  const filteredUsers = useMemo(() => {
    const lower = search.toLowerCase();
    return mockUsers.filter(user => {
      const searchPass =
        user.name.toLowerCase().includes(lower) || user.email.toLowerCase().includes(lower);
      const modulePass =
        moduleFilter.length === 0 ||
        user.modules.some(item => moduleFilter.includes(item.module));
      const rolePass = roleFilter.length === 0 || roleFilter.includes(user.role);
      const statusPass = statusFilter.length === 0 || statusFilter.includes(user.status);
      return searchPass && modulePass && rolePass && statusPass;
    });
  }, [moduleFilter, roleFilter, search, statusFilter]);

  const toggleRow = (id: string, checked: boolean) => {
    setSelectedIds(prev => (checked ? [...prev, id] : prev.filter(item => item !== id)));
  };

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredUsers.map(user => user.id) : []);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[var(--shape-lg)] border border-[var(--border)] bg-white p-3">
        <div className="flex flex-wrap gap-2 md:flex-nowrap">
          <div className="relative w-full md:max-w-[320px]">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--neutral-500)]" />
            <Input
              value={search}
              onChange={event => setSearch(event.target.value)}
              className="h-12 rounded-xl border-[var(--border)] pl-9"
              placeholder="Search people"
            />
          </div>
          <FilterPill
            label="Module"
            values={moduleFilter}
            onToggle={value =>
              setModuleFilter(prev =>
                prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value],
              )
            }
            options={Object.keys(moduleLabels) as ModuleKey[]}
            renderValue={value => moduleLabels[value]}
          />
          <FilterPill
            label="Role"
            values={roleFilter}
            onToggle={value =>
              setRoleFilter(prev =>
                prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value],
              )
            }
            options={['lead', 'team'] as UserRole[]}
            renderValue={value => (value === 'lead' ? 'Lead' : 'Team')}
          />
          <FilterPill
            label="Status"
            values={statusFilter}
            onToggle={value =>
              setStatusFilter(prev =>
                prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value],
              )
            }
            options={['active', 'invited', 'deactivated'] as UserStatus[]}
            renderValue={value => statusMeta[value].label}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[var(--shape-lg)] border border-[var(--border)] bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-[var(--neutral-100)]">
            <tr className="text-left text-xs font-medium tracking-wider text-[var(--neutral-500)] uppercase">
              <th className="w-10 px-4 py-3 text-center">
                <Checkbox
                  className="h-5 w-5"
                  checked={
                    filteredUsers.length > 0 && selectedIds.length === filteredUsers.length
                  }
                  onCheckedChange={value => toggleAll(value === true)}
                />
              </th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Modules</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Groups</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => {
              const selected = selectedIds.includes(user.id);
              const moduleItems = user.modules.map(item => item.module);
              return (
                <tr
                  key={user.id}
                  onClick={() => onOpenUserDetail(user)}
                  className={cn(
                    'group cursor-pointer border-b border-[var(--neutral-100)] transition-colors',
                    selected ? 'bg-[var(--accent)]' : 'hover:bg-[var(--accent)]',
                  )}
                >
                  <td
                    className={cn(
                      'px-4 py-3 text-center align-middle',
                      selected ? 'border-l-[3px] border-[var(--mw-yellow-400)]' : 'group-hover:border-l-[3px] group-hover:border-[var(--mw-yellow-400)]',
                    )}
                  >
                    <Checkbox
                      className="h-5 w-5"
                      checked={selected}
                      onClick={event => event.stopPropagation()}
                      onCheckedChange={value => toggleRow(user.id, value === true)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex min-h-[72px] items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                        <AvatarFallback className="bg-[var(--neutral-100)] text-sm font-medium text-[var(--neutral-800)]">
                          {initials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-[var(--mw-mirage)]">{user.name}</p>
                        <p className="text-xs text-[var(--neutral-500)]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {moduleItems.slice(0, 3).map(moduleKey => (
                        <Badge
                          key={moduleKey}
                          className="rounded-full border-0 px-2.5 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: moduleColors[moduleKey].bg,
                            color: moduleColors[moduleKey].text,
                          }}
                        >
                          {moduleLabels[moduleKey]}
                        </Badge>
                      ))}
                      {moduleItems.length > 3 ? (
                        <Badge className="rounded-full border-0 bg-[var(--neutral-100)] px-2.5 py-0.5 text-xs text-[var(--neutral-500)]">
                          +{moduleItems.length - 3}
                        </Badge>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        user.role === 'lead'
                          ? 'rounded-full border-0 bg-[var(--mw-yellow-400)] px-3 py-1 text-[var(--neutral-800)]'
                          : 'rounded-full border-0 bg-[var(--neutral-100)] px-3 py-1 text-[var(--neutral-600)]'
                      }
                    >
                      {user.role === 'lead' && user.leadModule
                        ? `Lead — ${moduleLabels[user.leadModule]}`
                        : 'Team'}
                    </Badge>
                  </td>
                  <td className="max-w-[280px] px-4 py-3 align-middle">
                    <p className="line-clamp-2 text-xs text-[var(--neutral-600)]">
                      {user.modules
                        .map(item =>
                          item.groups.length > 0
                            ? `${moduleLabels[item.module]}: ${item.groups.join(', ')}`
                            : `${moduleLabels[item.module]}: Full access`,
                        )
                        .join(' · ')}
                    </p>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2 text-sm text-[var(--neutral-600)]">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusMeta[user.status].colour }} />
                      <span>{statusMeta[user.status].label}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {selectedIds.length > 0 ? (
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky bottom-4 mx-4 mb-4 flex items-center justify-between rounded-xl bg-[var(--mw-mirage)] p-3 text-white"
          >
            <p className="text-sm">{selectedIds.length} selected</p>
            <div className="flex gap-2">
              <button type="button" className="rounded-[var(--shape-lg)] bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20">
                Add to module
              </button>
              <button type="button" className="rounded-[var(--shape-lg)] bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20">
                Assign group
              </button>
              <button type="button" className="rounded-[var(--shape-lg)] bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20">
                Deactivate
              </button>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

function FilterPill<T extends string>({
  label,
  values,
  options,
  onToggle,
  renderValue,
}: {
  label: string;
  values: T[];
  options: T[];
  onToggle: (value: T) => void;
  renderValue: (value: T) => string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="h-10 rounded-full border border-[var(--border)] px-3 text-sm text-[var(--neutral-600)] hover:bg-[var(--neutral-100)]"
        >
          {label}
          {values.length > 0 ? ` (${values.length})` : ''}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[180px]">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map(option => (
          <DropdownMenuCheckboxItem
            key={option}
            checked={values.includes(option)}
            onCheckedChange={() => onToggle(option)}
          >
            {renderValue(option)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
