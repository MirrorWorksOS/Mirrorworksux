import * as React from 'react';
import { useNavigate } from 'react-router';
import { CalendarDays, FileText, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SplitSegmentDateTimePopover } from '@/components/shared/datetime/SplitSegmentDateTimePopover';
import { BorderGlow } from '@/components/shared/surfaces/BorderGlow';
import { SpotlightCard } from '@/components/shared/surfaces/SpotlightCard';
import { cn } from '@/components/ui/utils';
import {
  SellOpportunityQuickActivitySheet,
  type QuickActivityPreset,
} from '@/components/sell/SellOpportunityQuickActivitySheet';

type RowKey = 'call' | 'quote' | 'visit';

function defaultSchedule(): Date {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(9, 0, 0, 0);
  return d;
}

const PRIMARY_LEADING =
  'h-10 min-h-0 rounded-l-[var(--shape-md)] rounded-r-none border-[var(--neutral-200)] px-3 text-xs font-medium sm:h-12 sm:min-h-[48px] sm:px-4 sm:text-sm';

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

  return (
    <>
      <SpotlightCard
        radius="rounded-[var(--shape-lg)]"
        overflow="visible"
        className="w-full"
        spotlightColor="rgba(77, 221, 201, 0.07)"
        spotlightColorDark="rgba(125, 232, 217, 0.1)"
      >
        <BorderGlow
          borderRadius={22}
          edgeSensitivity={10}
          glowRadius={22}
          glowIntensity={0.23}
          coneSpread={30}
          fillOpacity={0.158}
          perimeter="uniform"
          animated
          className="bg-card"
        >
          <div className="p-6">
        <h3 className="mb-4 text-sm font-medium text-foreground">Recommended Next Actions</h3>
        <div className="space-y-4">
          {/* Call row */}
          <div className="border-b border-[var(--neutral-100)] pb-4">
            <div className="flex gap-3">
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
                <div className="inline-flex max-w-full rounded-[var(--shape-md)] shadow-xs">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className={cn(PRIMARY_LEADING, 'bg-card hover:bg-[var(--neutral-50)]')}
                    onClick={() =>
                      openSheet('call', {
                        activityType: 'call',
                        defaultTitle: `Call ${contactFirstName}`,
                      })
                    }
                  >
                    Schedule call
                  </Button>
                  <SplitSegmentDateTimePopover
                    value={scheduleByRow.call}
                    onChange={(d) => setScheduledForRow('call', d)}
                    ariaLabel={`Date and time for Call ${contactFirstName}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quote row */}
          <div className="border-b border-[var(--neutral-100)] pb-4">
            <div className="flex gap-3">
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
                <div className="inline-flex max-w-full rounded-[var(--shape-md)] shadow-xs">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className={cn(PRIMARY_LEADING, 'bg-card hover:bg-[var(--neutral-50)]')}
                    onClick={() => navigate('/sell/quotes/new')}
                  >
                    Open builder
                  </Button>
                  <SplitSegmentDateTimePopover
                    value={scheduleByRow.quote}
                    onChange={(d) => setScheduledForRow('quote', d)}
                    ariaLabel="Date and time for revised quote follow-up"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Site visit row */}
          <div>
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--shape-md)] bg-[var(--neutral-50)]">
                <CalendarDays className="h-4 w-4 text-[var(--mw-blue)]" />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Book site visit</p>
                  <p className="mt-0.5 text-xs text-[var(--neutral-500)]">
                    Customer requested dimensional verification before sign-off
                  </p>
                </div>
                <div className="inline-flex max-w-full rounded-[var(--shape-md)] shadow-xs">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className={cn(PRIMARY_LEADING, 'bg-card hover:bg-[var(--neutral-50)]')}
                    onClick={() =>
                      openSheet('visit', {
                        activityType: 'meeting',
                        defaultTitle: `Site visit — ${contactFirstName}`,
                      })
                    }
                  >
                    Schedule
                  </Button>
                  <SplitSegmentDateTimePopover
                    value={scheduleByRow.visit}
                    onChange={(d) => setScheduledForRow('visit', d)}
                    ariaLabel="Date and time for site visit"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
          </div>
        </BorderGlow>
      </SpotlightCard>

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
