import * as React from 'react';
import { useNavigate } from 'react-router';
import { Calendar, ChevronDown, FileText, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DateTimePicker } from '@/components/shared/datetime/DateTimePicker';
import { cn } from '@/components/ui/utils';
import {
  SellOpportunityQuickActivitySheet,
  type QuickActivityPreset,
} from '@/components/sell/SellOpportunityQuickActivitySheet';
import type { ActivityType } from '@/components/sell/sell-activity-shared';

type RowKey = 'call' | 'quote' | 'visit';

function defaultSchedule(): Date {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(9, 0, 0, 0);
  return d;
}

const PRIMARY_LEADING =
  'h-10 min-h-0 rounded-r-none px-3 text-xs font-medium sm:h-12 sm:min-h-[48px] sm:px-4 sm:text-sm';
const SPLIT_TRIGGER =
  'h-10 min-h-0 rounded-l-none border-l-0 px-2 sm:h-12 sm:min-h-[48px] sm:px-2.5';

type MenuDef = { label: string; type: ActivityType; defaultTitle: string };

function RecommendedActionsSplitMenu({
  rowKey,
  ariaLabel,
  items,
  onPick,
}: {
  rowKey: RowKey;
  ariaLabel: string;
  items: MenuDef[];
  onPick: (row: RowKey, preset: QuickActivityPreset) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={SPLIT_TRIGGER}
          aria-label={ariaLabel}
        >
          <ChevronDown className="h-4 w-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.label}
            onSelect={() =>
              onPick(rowKey, { activityType: item.type, defaultTitle: item.defaultTitle })
            }
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export interface SellOpportunityRecommendedActionsProps {
  contactFirstName: string;
  opportunityId: string;
  opportunityLabel: string;
}

export function SellOpportunityRecommendedActions({
  contactFirstName,
  opportunityId,
  opportunityLabel,
}: SellOpportunityRecommendedActionsProps) {
  const navigate = useNavigate();
  const [scheduleByRow, setScheduleByRow] = React.useState<Record<RowKey, Date>>({
    call: defaultSchedule(),
    quote: defaultSchedule(),
    visit: defaultSchedule(),
  });

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [activeRow, setActiveRow] = React.useState<RowKey | null>(null);
  const [preset, setPreset] = React.useState<QuickActivityPreset | null>(null);

  const scheduledAt =
    activeRow != null ? scheduleByRow[activeRow] : scheduleByRow.call;

  const setScheduledForRow = (row: RowKey, date: Date) => {
    setScheduleByRow((prev) => ({ ...prev, [row]: date }));
  };

  const openSheet = (row: RowKey, p: QuickActivityPreset) => {
    setActiveRow(row);
    setPreset(p);
    setSheetOpen(true);
  };

  const onSheetScheduledChange = (d: Date) => {
    if (activeRow) setScheduledForRow(activeRow, d);
  };

  const closeSheet = (open: boolean) => {
    setSheetOpen(open);
    if (!open) {
      setPreset(null);
      setActiveRow(null);
    }
  };

  const callMenu: MenuDef[] = [
    { label: 'Email follow-up', type: 'email', defaultTitle: `Email ${contactFirstName}` },
    { label: 'Book meeting', type: 'meeting', defaultTitle: `Meeting with ${contactFirstName}` },
    { label: 'Log task', type: 'task', defaultTitle: 'Follow up on quote engagement' },
  ];

  const quoteMenu: MenuDef[] = [
    { label: 'Schedule follow-up', type: 'task', defaultTitle: 'Follow up after revised quote' },
    {
      label: 'Schedule call',
      type: 'call',
      defaultTitle: `Call ${contactFirstName} — revised quote`,
    },
    { label: 'Log note', type: 'note', defaultTitle: 'Note on quote variance' },
  ];

  const visitMenu: MenuDef[] = [
    {
      label: 'Call reminder',
      type: 'call',
      defaultTitle: `Call before site visit — ${contactFirstName}`,
    },
    { label: 'Email directions', type: 'email', defaultTitle: 'Email site visit details' },
    {
      label: 'Log task',
      type: 'task',
      defaultTitle: 'Prepare dimensional verification checklist',
    },
  ];

  return (
    <>
      <Card className="border border-[var(--neutral-200)] bg-card p-6 shadow-xs rounded-[var(--shape-lg)]">
        <h3 className="mb-4 text-sm font-medium text-foreground">Recommended Next Actions</h3>
        <div className="space-y-4">
          {/* Call row — next best: yellow primary */}
          <div className="flex flex-col gap-4 border-b border-[var(--neutral-100)] pb-4 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 flex-1 gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--shape-md)] bg-[var(--neutral-50)]">
                <Phone className="h-4 w-4 text-[var(--mw-green)]" />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Call {contactFirstName}</p>
                  <p className="mt-0.5 text-xs text-[var(--neutral-500)]">
                    Quote opened twice — high engagement signal
                  </p>
                </div>
                <div className="inline-flex">
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    className={cn(
                      PRIMARY_LEADING,
                      'border-0 bg-[var(--mw-yellow-400)] text-[#2C2C2C] hover:bg-[var(--mw-yellow-500)] active:bg-[var(--mw-yellow-600)]',
                    )}
                    onClick={() =>
                      openSheet('call', {
                        activityType: 'call',
                        defaultTitle: `Call ${contactFirstName}`,
                      })
                    }
                  >
                    Schedule call
                  </Button>
                  <RecommendedActionsSplitMenu
                    rowKey="call"
                    ariaLabel={`More actions for Call ${contactFirstName}`}
                    items={callMenu}
                    onPick={openSheet}
                  />
                </div>
              </div>
            </div>
            <div className="w-full shrink-0 md:w-[min(100%,280px)] md:pt-1">
              <DateTimePicker
                value={scheduleByRow.call}
                onChange={(d) => {
                  if (d) setScheduledForRow('call', d);
                }}
                className="sm:flex-col sm:gap-2 md:flex-row md:items-start"
              />
            </div>
          </div>

          {/* Quote row — primary navigates */}
          <div className="flex flex-col gap-4 border-b border-[var(--neutral-100)] pb-4 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 flex-1 gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--shape-md)] bg-[var(--neutral-50)]">
                <FileText className="h-4 w-4 text-[var(--mw-blue)]" />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Send revised quote</p>
                  <p className="mt-0.5 text-xs text-[var(--neutral-500)]">
                    Material costs updated since last quote — $2,100 variance
                  </p>
                </div>
                <div className="inline-flex">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className={PRIMARY_LEADING}
                    onClick={() => navigate('/sell/quotes/new')}
                  >
                    Open builder
                  </Button>
                  <RecommendedActionsSplitMenu
                    rowKey="quote"
                    ariaLabel="More actions for Send revised quote"
                    items={quoteMenu}
                    onPick={openSheet}
                  />
                </div>
              </div>
            </div>
            <div className="w-full shrink-0 md:w-[min(100%,280px)] md:pt-1">
              <DateTimePicker
                value={scheduleByRow.quote}
                onChange={(d) => {
                  if (d) setScheduledForRow('quote', d);
                }}
                className="sm:flex-col sm:gap-2 md:flex-row md:items-start"
              />
            </div>
          </div>

          {/* Site visit row */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex min-w-0 flex-1 gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--shape-md)] bg-[var(--neutral-50)]">
                <Calendar className="h-4 w-4 text-[var(--mw-blue)]" />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Book site visit</p>
                  <p className="mt-0.5 text-xs text-[var(--neutral-500)]">
                    Customer requested dimensional verification before sign-off
                  </p>
                </div>
                <div className="inline-flex">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className={PRIMARY_LEADING}
                    onClick={() =>
                      openSheet('visit', {
                        activityType: 'meeting',
                        defaultTitle: `Site visit — ${contactFirstName}`,
                      })
                    }
                  >
                    Schedule
                  </Button>
                  <RecommendedActionsSplitMenu
                    rowKey="visit"
                    ariaLabel="More actions for Book site visit"
                    items={visitMenu}
                    onPick={openSheet}
                  />
                </div>
              </div>
            </div>
            <div className="w-full shrink-0 md:w-[min(100%,280px)] md:pt-1">
              <DateTimePicker
                value={scheduleByRow.visit}
                onChange={(d) => {
                  if (d) setScheduledForRow('visit', d);
                }}
                className="sm:flex-col sm:gap-2 md:flex-row md:items-start"
              />
            </div>
          </div>
        </div>
      </Card>

      <SellOpportunityQuickActivitySheet
        open={sheetOpen}
        onOpenChange={closeSheet}
        preset={preset}
        scheduledAt={scheduledAt}
        onScheduledAtChange={onSheetScheduledChange}
        opportunityId={opportunityId}
        opportunityLabel={opportunityLabel}
      />
    </>
  );
}
