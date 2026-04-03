import * as React from "react";
import { useState } from "react";
import { Filter } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/components/ui/utils";

const LUCIDE_STROKE = 1.5;

export interface ToolbarFilterButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "variant" | "size" | "children"> {
  label?: string;
}

const STATUS_OPTIONS = ["All", "Active", "Draft", "Completed"] as const;

/** Outline pill filter control for module schedule/calendar toolbars (design system §7). */
export function ToolbarFilterButton({
  label = "Filter",
  className,
  ...props
}: ToolbarFilterButtonProps) {
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState<Set<string>>(new Set(["All"]));
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [open, setOpen] = useState(false);

  const toggleStatus = (status: string) => {
    setStatuses((prev) => {
      const next = new Set(prev);
      if (status === "All") {
        return new Set(["All"]);
      }
      next.delete("All");
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next.size === 0 ? new Set(["All"]) : next;
    });
  };

  const handleClear = () => {
    setSearch("");
    setStatuses(new Set(["All"]));
    setDateFrom("");
    setDateTo("");
  };

  const handleApply = () => {
    toast.success("Filters applied");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-12 min-h-[48px] gap-2 rounded-full border-[var(--neutral-200)] bg-background px-5 text-sm font-medium text-foreground hover:bg-[var(--neutral-50)]",
            className,
          )}
          {...props}
        >
          <Filter className="h-4 w-4 shrink-0" strokeWidth={LUCIDE_STROKE} aria-hidden />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 rounded-[var(--shape-lg)] border border-[var(--border)] bg-popover p-4 shadow-lg"
        align="start"
      >
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider">
              Search
            </label>
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 rounded-xl border-[var(--border)] text-sm"
            />
          </div>

          {/* Status checkboxes */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider">
              Status
            </label>
            <div className="space-y-1.5">
              {STATUS_OPTIONS.map((status) => (
                <label
                  key={status}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground hover:bg-[var(--neutral-50)] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={statuses.has(status)}
                    onChange={() => toggleStatus(status)}
                    className="h-4 w-4 rounded border-[var(--neutral-200)] accent-[var(--mw-yellow-400)]"
                  />
                  {status}
                </label>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--neutral-500)] uppercase tracking-wider">
              Date range
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 flex-1 rounded-xl border-[var(--border)] text-xs"
              />
              <span className="text-xs text-[var(--neutral-500)]">to</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 flex-1 rounded-xl border-[var(--border)] text-xs"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-[var(--neutral-500)] rounded-xl"
              onClick={handleClear}
            >
              Clear
            </Button>
            <Button
              size="sm"
              className="h-8 bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground text-xs rounded-xl px-4"
              onClick={handleApply}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
