/**
 * Tracking categories section — links MW dimensions (Job, Department) to
 * Xero TrackingCategories. Xero allows up to 2 active categories per org.
 */
import { ArrowRight, Info } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';
import { SectionShell } from './SectionShell';
import type { TrackingMappingEntry, XeroTrackingCategory } from '@/types/xero';

export interface TrackingSectionProps {
  entries: TrackingMappingEntry[];
  trackingCategories: XeroTrackingCategory[];
  onChange: (next: TrackingMappingEntry) => void;
}

export function TrackingSection({
  entries,
  trackingCategories,
  onChange,
}: TrackingSectionProps) {
  const usedCount = entries.filter((e) => e.xeroTrackingCategoryId !== '').length;
  return (
    <SectionShell
      title="Tracking categories"
      description="Map MirrorWorks dimensions to Xero tracking categories. Xero allows a maximum of two active categories per organisation."
      actions={
        <Badge
          variant="secondary"
          className="rounded-full text-[11px]"
        >
          {usedCount} / 2 used
        </Badge>
      }
    >
      <div className="space-y-4">
        {entries.map((entry) => {
          const category = trackingCategories.find(
            (c) => c.TrackingCategoryID === entry.xeroTrackingCategoryId,
          );
          return (
            <Card key={entry.sourceKey} className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-[1.2] basis-[40%]">
                  <p className="text-sm font-medium text-foreground">
                    {entry.sourceLabel}
                  </p>
                  {entry.sourceDescription && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {entry.sourceDescription}
                    </p>
                  )}
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-[240px] flex-1">
                  <Select
                    value={entry.xeroTrackingCategoryId || undefined}
                    onValueChange={(v) =>
                      onChange({ ...entry, xeroTrackingCategoryId: v })
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select Xero category…">
                        {category?.Name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {trackingCategories.map((cat) => (
                        <SelectItem key={cat.TrackingCategoryID} value={cat.TrackingCategoryID}>
                          <span className="flex items-center gap-2">
                            <span>{cat.Name}</span>
                            <span className="text-xs text-muted-foreground">
                              {cat.Options.length} options
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {category && (
                <>
                  <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[var(--shape-md)] bg-[var(--neutral-100)]/60 px-3 py-2">
                    <span className="text-xs font-medium text-foreground">
                      Auto-create missing options on push
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[260px]">
                        When a MirrorWorks job/department isn't found in Xero,
                        create a new tracking option automatically rather than
                        failing the push.
                      </TooltipContent>
                    </Tooltip>
                    <Switch
                      className="ml-auto"
                      checked={entry.autoCreateMissingOptions}
                      onCheckedChange={(c) =>
                        onChange({ ...entry, autoCreateMissingOptions: c })
                      }
                    />
                  </div>

                  <div className="mt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Existing options ({category.Options.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {category.Options.map((opt) => (
                        <Badge
                          key={opt.TrackingOptionID}
                          variant="outline"
                          className="rounded-full font-normal"
                        >
                          {opt.Name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </Card>
          );
        })}
      </div>
    </SectionShell>
  );
}
