import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { moduleLabels, mockGroups } from './mock-data';
import type { ModuleKey } from './types';

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const modules: ModuleKey[] = ['sell', 'plan', 'make', 'ship', 'book', 'buy', 'control'];

export function InviteUserDialog({ open, onOpenChange }: InviteUserDialogProps) {
  const [selectedModules, setSelectedModules] = useState<ModuleKey[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<Record<ModuleKey, string[]>>({
    sell: [],
    plan: [],
    make: [],
    ship: [],
    book: [],
    buy: [],
    control: [],
  });

  const groupsByModule = useMemo(
    () =>
      modules.reduce<Record<ModuleKey, string[]>>(
        (acc, moduleKey) => ({
          ...acc,
          [moduleKey]: mockGroups.filter(group => group.module === moduleKey).map(group => group.name),
        }),
        { sell: [], plan: [], make: [], ship: [], book: [], buy: [], control: [] },
      ),
    [],
  );

  const toggleModule = (moduleKey: ModuleKey, checked: boolean) => {
    setSelectedModules(prev => (checked ? [...prev, moduleKey] : prev.filter(item => item !== moduleKey)));
  };

  const toggleGroup = (moduleKey: ModuleKey, groupName: string) => {
    setSelectedGroups(prev => {
      const hasGroup = prev[moduleKey].includes(groupName);
      return {
        ...prev,
        [moduleKey]: hasGroup
          ? prev[moduleKey].filter(item => item !== groupName)
          : [...prev[moduleKey], groupName],
      };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-[var(--shape-lg)] border-[var(--border)] bg-white/95 backdrop-blur-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-[var(--mw-mirage)]">Invite team member</DialogTitle>
          <DialogDescription className="text-xs text-[var(--neutral-500)]">
            They&apos;ll receive an email to join your organisation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            value={name}
            onChange={event => setName(event.target.value)}
            placeholder="Full name"
            className="h-12 rounded-xl border-[var(--border)]"
          />
          <Input
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="name@organisation.com"
            className="h-12 rounded-xl border-[var(--border)]"
          />

          <div className="space-y-3">
            <p className="text-xs font-medium tracking-wider text-[var(--neutral-500)] uppercase">Modules</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {modules.map(moduleKey => {
                const checked = selectedModules.includes(moduleKey);
                return (
                  <label
                    key={moduleKey}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${
                      checked ? 'border-[var(--mw-yellow-400)] bg-[var(--accent)]' : 'border-[var(--border)] bg-white'
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={value => toggleModule(moduleKey, value === true)}
                      className="h-5 w-5"
                    />
                    <span className="text-sm text-[var(--neutral-800)]">{moduleLabels[moduleKey]}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            {selectedModules.map(moduleKey => (
              <motion.div
                key={moduleKey}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-[var(--border)] bg-[var(--neutral-100)] p-3"
              >
                <p className="mb-2 text-sm font-medium text-[var(--neutral-800)]">{moduleLabels[moduleKey]} groups</p>
                <div className="flex flex-wrap gap-2">
                  {groupsByModule[moduleKey].map(groupName => {
                    const selected = selectedGroups[moduleKey].includes(groupName);
                    return (
                      <button
                        key={groupName}
                        type="button"
                        onClick={() => toggleGroup(moduleKey, groupName)}
                        className={`rounded-full border px-3 py-1 text-xs ${
                          selected
                            ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)] text-[var(--neutral-800)]'
                            : 'border-[var(--border)] bg-white text-[var(--neutral-600)]'
                        }`}
                      >
                        {groupName}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-2 pt-1">
            <Button className="h-12 w-full rounded-xl bg-[var(--mw-yellow-400)] text-[var(--neutral-800)] hover:bg-[var(--mw-yellow-500)]">
              Send invite
            </Button>
            <Button variant="ghost" className="h-10 w-full rounded-[var(--shape-lg)] text-[var(--neutral-500)]" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
