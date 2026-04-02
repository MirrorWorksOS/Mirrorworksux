/**
 * EventDetailSheet — Slide-over sheet displaying full calendar event details.
 * Used in SellActivities and PlanActivities when a user clicks an event.
 */

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Phone, Mail, Users, CheckSquare, RotateCcw, Monitor,
  MapPin, ExternalLink, Clock, CalendarDays, Flag,
  Check, Pencil, Trash2, CalendarClock, UserPlus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/components/ui/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

export type EventType = 'call' | 'email' | 'meeting' | 'task' | 'follow-up' | 'demo';

export interface CalendarEventDetail {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  type: EventType;
  description?: string;
  attendees?: { name: string; email: string; avatar?: string }[];
  location?: string;
  relatedTo?: { type: string; label: string; path: string };
  status?: 'scheduled' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}

interface EventDetailSheetProps {
  event: CalendarEventDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Config maps ─────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<EventType, { icon: LucideIcon; label: string; border: string; bg: string; text: string }> = {
  call:       { icon: Phone,      label: 'Call',      border: 'border-t-[var(--mw-info)]',    bg: 'bg-[var(--mw-info)]/10',    text: 'text-[var(--mw-info)]' },
  email:      { icon: Mail,       label: 'Email',     border: 'border-t-[var(--mw-success)]', bg: 'bg-[var(--mw-success)]/10', text: 'text-[var(--mw-success)]' },
  meeting:    { icon: Users,      label: 'Meeting',   border: 'border-t-[var(--neutral-500)]', bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-700)]' },
  task:       { icon: CheckSquare, label: 'Task',     border: 'border-t-[var(--mw-warning)]', bg: 'bg-[var(--mw-warning)]/10', text: 'text-[var(--mw-warning)]' },
  'follow-up': { icon: RotateCcw, label: 'Follow-up', border: 'border-t-[var(--mw-warning)]', bg: 'bg-[var(--mw-warning)]/10', text: 'text-[var(--mw-warning)]' },
  demo:       { icon: Monitor,    label: 'Demo',      border: 'border-t-[var(--neutral-500)]', bg: 'bg-[var(--neutral-100)]', text: 'text-[var(--neutral-700)]' },
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  scheduled: { label: 'Scheduled', className: 'border-0 bg-[var(--mw-info)]/10 text-[var(--mw-info)]' },
  completed: { label: 'Completed', className: 'border-0 bg-[var(--neutral-100)] text-[var(--neutral-600)]' },
  cancelled: { label: 'Cancelled', className: 'border-0 bg-[var(--mw-error)]/10 text-[var(--mw-error)]' },
};

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  low:    { label: 'Low',    className: 'border-0 bg-[var(--neutral-100)] text-[var(--neutral-600)]' },
  medium: { label: 'Medium', className: 'border-0 bg-[var(--mw-warning)]/10 text-[var(--mw-warning)]' },
  high:   { label: 'High',   className: 'border-0 bg-[var(--mw-error)]/10 text-[var(--mw-error)]' },
};

// ─── Helper ──────────────────────────────────────────────────────────────────

function getDuration(start: Date, end?: Date): string {
  if (!end) return '';
  const diffMs = end.getTime() - start.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function EventDetailSheet({ event, open, onOpenChange }: EventDetailSheetProps) {
  const [notes, setNotes] = useState('');

  if (!event) return null;

  const cfg = TYPE_CONFIG[event.type];
  const Icon = cfg.icon;
  const statusCfg = event.status ? STATUS_CONFIG[event.status] : null;
  const priorityCfg = event.priority ? PRIORITY_CONFIG[event.priority] : null;
  const duration = getDuration(event.start, event.end);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={cn('w-full sm:max-w-md border-t-4 p-0 flex flex-col', cfg.border)}>
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-[var(--border)]">
          <div className="flex items-start gap-3">
            <div className={cn('w-10 h-10 rounded-[var(--shape-lg)] flex items-center justify-center flex-shrink-0', cfg.bg)}>
              <Icon className={cn('w-5 h-5', cfg.text)} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base font-medium text-[var(--mw-mirage)] leading-tight">
                {event.title}
              </SheetTitle>
              <SheetDescription className="mt-1 flex items-center gap-2 text-sm">
                <Badge className={cn('text-xs', cfg.bg, cfg.text, 'border-0')}>{cfg.label}</Badge>
                {statusCfg && <Badge className={cn('text-xs', statusCfg.className)}>{statusCfg.label}</Badge>}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Details */}
          <section className="space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">Details</h4>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-sm">
                <CalendarDays className="w-4 h-4 text-[var(--neutral-400)]" strokeWidth={1.5} />
                <span className="text-[var(--neutral-700)]">
                  {format(event.start, 'EEEE, d MMMM yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-[var(--neutral-400)]" strokeWidth={1.5} />
                <span className="text-[var(--neutral-700)]">
                  {format(event.start, 'h:mm a')}
                  {event.end && ` - ${format(event.end, 'h:mm a')}`}
                  {duration && <span className="ml-2 text-[var(--neutral-500)]">({duration})</span>}
                </span>
              </div>
              {event.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-[var(--neutral-400)]" strokeWidth={1.5} />
                  <span className="text-[var(--neutral-700)]">{event.location}</span>
                </div>
              )}
              {priorityCfg && (
                <div className="flex items-center gap-3 text-sm">
                  <Flag className="w-4 h-4 text-[var(--neutral-400)]" strokeWidth={1.5} />
                  <Badge className={cn('text-xs', priorityCfg.className)}>{priorityCfg.label} priority</Badge>
                </div>
              )}
            </div>
          </section>

          {/* Description */}
          {event.description && (
            <section className="space-y-3">
              <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">Description</h4>
              <p className="text-sm text-[var(--neutral-700)] leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </section>
          )}

          {/* Attendees */}
          {event.attendees && event.attendees.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">
                  Attendees ({event.attendees.length})
                </h4>
                <button
                  className="flex items-center gap-1 text-xs font-medium text-[var(--mw-yellow-700)] hover:text-[var(--mw-yellow-800)] transition-colors"
                  onClick={() => toast('Add attendee dialog coming soon')}
                >
                  <UserPlus className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Add
                </button>
              </div>
              <ul className="space-y-2">
                {event.attendees.map((a) => (
                  <li key={a.email} className="flex items-center gap-3">
                    {a.avatar ? (
                      <img src={a.avatar} alt={a.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[var(--neutral-200)] flex items-center justify-center text-xs font-medium text-[var(--neutral-600)]">
                        {initials(a.name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--neutral-800)] truncate">{a.name}</p>
                      <p className="text-xs text-[var(--neutral-500)] truncate">{a.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Related To */}
          {event.relatedTo && (
            <section className="space-y-3">
              <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">Related to</h4>
              <a
                href={event.relatedTo.path}
                className="inline-flex items-center gap-2 rounded-[var(--shape-md)] border border-[var(--border)] bg-[var(--neutral-50)] px-3 py-2 text-sm font-medium text-[var(--mw-yellow-700)] transition-colors hover:bg-[var(--neutral-100)]"
              >
                <span className="text-xs text-[var(--neutral-500)]">{event.relatedTo.type}:</span>
                {event.relatedTo.label}
                <ExternalLink className="w-3.5 h-3.5 text-[var(--neutral-400)]" strokeWidth={1.5} />
              </a>
            </section>
          )}

          {/* Notes */}
          <section className="space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--neutral-500)]">Notes</h4>
            <Textarea
              placeholder="Add notes about this event..."
              value={notes || event.notes || ''}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="text-sm"
            />
          </section>
        </div>

        {/* Footer actions */}
        <SheetFooter className="border-t border-[var(--border)] px-6 py-4">
          <div className="flex flex-wrap gap-2 w-full">
            <Button
              size="sm"
              className="bg-[var(--mw-yellow-400)] text-[var(--neutral-900)] hover:bg-[var(--mw-yellow-500)] text-xs font-medium gap-1.5"
              onClick={() => { toast.success('Event marked as complete'); onOpenChange(false); }}
            >
              <Check className="w-4 h-4" /> Mark Complete
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-[var(--border)] text-xs gap-1.5"
              onClick={() => toast('Edit mode coming soon')}
            >
              <Pencil className="w-4 h-4" /> Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-[var(--border)] text-xs gap-1.5"
              onClick={() => toast('Reschedule dialog coming soon')}
            >
              <CalendarClock className="w-4 h-4" /> Reschedule
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-destructive text-destructive hover:bg-[var(--mw-error)]/10 text-xs gap-1.5 ml-auto"
              onClick={() => { toast.success('Event deleted'); onOpenChange(false); }}
            >
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
