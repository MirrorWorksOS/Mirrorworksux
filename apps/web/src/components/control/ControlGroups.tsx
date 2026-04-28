import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { UsersRound, Layers3, Lock, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { DarkAccentCard } from '@/components/shared/cards/DarkAccentCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GroupDetailSheet } from './people/GroupDetailSheet';
import { AccessResolutionPopover } from './people/AccessResolutionPopover';
import { findGroupOverlaps } from './people/group-helpers';
import { moduleColors, moduleLabels, peopleGroups, type PeopleGroupView } from './people/people-data';
import type { ModuleKey } from './people/types';

const MODULE_ORDER: ModuleKey[] = ['sell', 'plan', 'make', 'ship', 'book', 'buy', 'control'];

/** Module Settings path for "Edit permissions" deep link */
function settingsPathFor(module: ModuleKey): string | null {
  // Control has no single settings page — groups are managed here instead
  if (module === 'control') return null;
  return `/${module}/settings`;
}

type TypeFilter = 'all' | 'default' | 'custom';

export function ControlGroups() {
  const [query, setQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState<ModuleKey | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selected, setSelected] = useState<PeopleGroupView | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const stats = useMemo(() => {
    const total = peopleGroups.length;
    const defaults = peopleGroups.filter(g => g.isDefault).length;
    const custom = total - defaults;
    const totalMembers = peopleGroups.reduce((sum, g) => sum + g.memberCount, 0);
    return { total, defaults, custom, totalMembers };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return peopleGroups
      .filter(g => moduleFilter === 'all' || g.module === moduleFilter)
      .filter(g => typeFilter === 'all' || (typeFilter === 'default' ? g.isDefault : !g.isDefault))
      .filter(g => !q || g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q))
      .sort((a, b) => {
        const ai = MODULE_ORDER.indexOf(a.module);
        const bi = MODULE_ORDER.indexOf(b.module);
        if (ai !== bi) return ai - bi;
        return a.name.localeCompare(b.name);
      });
  }, [query, moduleFilter, typeFilter]);

  const openGroup = (group: PeopleGroupView) => {
    setSelected(group);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-8 bg-[var(--neutral-100)] p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Groups</h1>
          <p className="mt-1 text-sm text-[var(--neutral-500)]">
            Create and manage groups across all modules. Permissions for each group are edited in that module's Settings.
          </p>
        </div>
        <Button
          className="h-11 bg-[var(--mw-yellow-400)] px-5 text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
          onClick={() => {
            // TODO(backend): groups.create(fields)
            toast.success('Group created');
          }}
        >
          + New group
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <DarkAccentCard icon={UsersRound} label="Total groups" value={String(stats.total)} subtext="Across all modules" />
        <DarkAccentCard icon={Layers3} label="Default" value={String(stats.defaults)} subtext="ARCH 00 defaults" />
        <DarkAccentCard icon={Lock} label="Custom" value={String(stats.custom)} subtext="Created by admins" />
        <DarkAccentCard icon={UsersRound} label="Members assigned" value={String(stats.totalMembers)} subtext="Total (with duplicates across groups)" />
      </div>

      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search group name or description…"
            className="w-80"
          />
          <Select value={moduleFilter} onValueChange={v => setModuleFilter(v as ModuleKey | 'all')}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modules</SelectItem>
              {MODULE_ORDER.map(m => (
                <SelectItem key={m} value={m}>{moduleLabels[m]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={v => setTypeFilter(v as TypeFilter)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
            <AccessResolutionPopover />
            <span>
              {filtered.length} of {peopleGroups.length} groups
            </span>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Module</TableHead>
              <TableHead>Group</TableHead>
              <TableHead className="w-24">Members</TableHead>
              <TableHead className="w-28">Type</TableHead>
              <TableHead className="w-40 text-right">Edit permissions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(group => {
              const meta = moduleColors[group.module];
              const settingsPath = settingsPathFor(group.module);
              const overlaps = findGroupOverlaps(group.id);
              return (
                <TableRow key={group.id}>
                  <TableCell>
                    <div
                      className="inline-flex rounded-full px-3 py-1 text-xs"
                      style={{ backgroundColor: meta.bg, color: meta.text }}
                    >
                      {moduleLabels[group.module]}
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => openGroup(group)}
                      className="text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground hover:underline">{group.name}</span>
                        {overlaps.length > 0 && (
                          <TooltipProvider delayDuration={150}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--mw-yellow-50,theme(colors.yellow.100))] px-2 py-0.5 text-[10px] font-medium text-[var(--neutral-800)]">
                                  <AlertTriangle className="h-3 w-3 text-[var(--mw-yellow-500)]" />
                                  Overlaps {overlaps.length}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[260px] text-xs">
                                <p className="mb-1 font-medium">High member overlap</p>
                                <ul className="space-y-0.5 text-[var(--neutral-600)]">
                                  {overlaps.map(o => (
                                    <li key={o.otherGroup.id}>
                                      {o.otherGroup.name}: {o.sharedMemberIds.length} shared ({Math.round(o.sharedRatio * 100)}%)
                                    </li>
                                  ))}
                                </ul>
                                <p className="mt-1.5 text-[var(--neutral-500)]">
                                  Consider merging or differentiating permissions — users in both will get the broadest union.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{group.description}</div>
                    </button>
                  </TableCell>
                  <TableCell className="tabular-nums">{group.memberCount}</TableCell>
                  <TableCell>
                    {group.isDefault
                      ? <Badge variant="secondary">Default</Badge>
                      : <Badge>Custom</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    {settingsPath ? (
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={settingsPath}>
                          {moduleLabels[group.module]} Settings
                          <ArrowUpRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                  No groups match the current filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="mt-4 text-xs text-muted-foreground">
          Group identity (name, description, membership) is managed here. Permissions are edited in each module's Settings screen so module leads keep ownership of what their groups can do.
        </div>
      </Card>

      <GroupDetailSheet group={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
