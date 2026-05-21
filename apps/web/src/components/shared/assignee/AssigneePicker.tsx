/**
 * AssigneePicker — single combobox to pick a User, Team (access Group), or
 * Machine. Built on the shared cmdk-based Command primitive so the search
 * spans all three lists and the keyboard UX is consistent with the rest of
 * the app (CommandPalette, ProductPicker, etc.).
 *
 * Source registries (mock-backed in this slice):
 *   - Users    → people/mock-data.ts → mockUsers
 *   - Teams    → people/mock-data.ts → mockGroups (filtered to plan/make modules)
 *   - Machines → services/mock/data.ts → machines
 *
 * When the value comes back from the picker, it is denormalised: the label is
 * cached on the Assignee so downstream renderers don't need the registry.
 */

import { useMemo, useState } from 'react';
import { ChevronDown, Cog, User, Users, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/components/ui/utils';

import { mockGroups, mockUsers } from '@/components/control/people/mock-data';
import { machines } from '@/services';

import type { Assignee, AssigneeKind } from '@/types/job-activity';
import { AssigneeChip } from './AssigneeChip';

interface AssigneePickerProps {
  value?: Assignee;
  onChange: (next: Assignee | undefined) => void;
  /**
   * Restrict which kinds the picker offers. Defaults to all three.
   * Useful when an activity should only support machines, etc.
   */
  allowedKinds?: AssigneeKind[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const ALL_KINDS: AssigneeKind[] = ['user', 'team', 'machine'];

/**
 * Production teams are sourced from access-control Groups in plan/make modules.
 * Admin Groups in book/buy/ship/control aren't useful as activity assignees.
 */
const TEAM_MODULES = new Set(['plan', 'make']);

export function AssigneePicker({
  value,
  onChange,
  allowedKinds = ALL_KINDS,
  placeholder = 'Unassigned',
  className,
  disabled,
}: AssigneePickerProps) {
  const [open, setOpen] = useState(false);

  const kindSet = useMemo(() => new Set(allowedKinds), [allowedKinds]);

  const users = useMemo(
    () =>
      kindSet.has('user')
        ? mockUsers
            .filter((u) => u.status === 'active')
            .map((u) => ({ id: u.id, label: u.name }))
        : [],
    [kindSet],
  );

  const teams = useMemo(
    () =>
      kindSet.has('team')
        ? mockGroups
            .filter((g) => TEAM_MODULES.has(g.module))
            .map((g) => ({
              id: g.id,
              label: `${g.name} (${g.module})`,
            }))
        : [],
    [kindSet],
  );

  const machinesList = useMemo(
    () =>
      kindSet.has('machine')
        ? machines.map((m) => ({ id: m.id, label: `${m.name} · ${m.workCenter}` }))
        : [],
    [kindSet],
  );

  const select = (kind: AssigneeKind, id: string, label: string) => {
    onChange({ kind, id, label });
    setOpen(false);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  return (
    <Popover open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'h-8 w-full justify-between border-[var(--border)] bg-card px-2.5 font-normal',
            className,
          )}
        >
          {value ? (
            <AssigneeChip assignee={value} />
          ) : (
            <span className="text-xs text-[var(--neutral-500)]">{placeholder}</span>
          )}
          <span className="ml-auto inline-flex items-center gap-1 shrink-0">
            {value && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={clear}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(undefined);
                  }
                }}
                aria-label="Clear assignee"
                className="rounded p-0.5 text-[var(--neutral-500)] hover:bg-[var(--neutral-100)] hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </span>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-[var(--neutral-500)]" />
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[18rem] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search people, teams, machines…" />
          <CommandList>
            <CommandEmpty>No match.</CommandEmpty>

            {users.length > 0 && (
              <CommandGroup heading="Users">
                {users.map((u) => (
                  <CommandItem
                    key={`user-${u.id}`}
                    value={`user ${u.label}`}
                    onSelect={() => select('user', u.id, u.label)}
                  >
                    <User className="mr-2 h-3.5 w-3.5 text-[var(--mw-info)]" />
                    {u.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {teams.length > 0 && (
              <CommandGroup heading="Teams">
                {teams.map((t) => (
                  <CommandItem
                    key={`team-${t.id}`}
                    value={`team ${t.label}`}
                    onSelect={() => select('team', t.id, t.label)}
                  >
                    <Users className="mr-2 h-3.5 w-3.5 text-[var(--mw-yellow-700)]" />
                    {t.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {machinesList.length > 0 && (
              <CommandGroup heading="Machines">
                {machinesList.map((m) => (
                  <CommandItem
                    key={`machine-${m.id}`}
                    value={`machine ${m.label}`}
                    onSelect={() => select('machine', m.id, m.label)}
                  >
                    <Cog className="mr-2 h-3.5 w-3.5 text-[var(--neutral-600)]" />
                    {m.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
