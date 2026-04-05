/**
 * Pin list for shortcuts (Animate UI Pin List–inspired).
 */

import * as React from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { ListTree, Pin, PinOff } from "lucide-react";

import { cn } from "@/components/ui/utils";
import { mwHairlineBorder, mwPillYellowClass } from "@/lib/dashboard-ui";

export type DashboardPinItem = {
  id: string;
  title: string;
  subtitle: string;
};

export interface DashboardPinListProps {
  className?: string;
  initialItems: DashboardPinItem[];
  initialPinnedIds?: string[];
  /** When true, omit the top “Shortcuts” row — parent renders the section title for grid alignment */
  hideHeader?: boolean;
}

export function DashboardPinList({
  className,
  initialItems,
  initialPinnedIds,
  hideHeader = false,
}: DashboardPinListProps) {
  const [pinned, setPinned] = React.useState<Set<string>>(() => {
    if (initialPinnedIds?.length) return new Set(initialPinnedIds);
    const first = initialItems[0]?.id;
    return first ? new Set([first]) : new Set();
  });

  const pinnedItems = initialItems.filter((i) => pinned.has(i.id));
  const unpinnedItems = initialItems.filter((i) => !pinned.has(i.id));

  function toggle(id: string) {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div
      className={cn(
        "rounded-[var(--shape-xl)] bg-card p-5 shadow-xs transition-[box-shadow,transform] duration-[var(--duration-long1)] ease-[var(--ease-emphasized-decelerate)] hover:shadow-md hover:-translate-y-px dark:bg-card",
        mwHairlineBorder,
        className,
      )}
    >
      <LayoutGroup>
        <section className="mb-5">
          {hideHeader ? null : (
            <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
              <ListTree className="h-6 w-6 text-[var(--mw-yellow-500)] dark:text-[var(--mw-yellow-400)]" strokeWidth={1.5} aria-hidden />
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                Shortcuts
              </h3>
            </div>
          )}
          <h4 className={cn("mb-2 inline-flex px-2.5 py-0.5 text-xs uppercase tracking-wider", mwPillYellowClass)}>
            Pinned
          </h4>
          <ul className="min-h-[48px] space-y-2">
            <AnimatePresence mode="popLayout">
              {pinnedItems.map((item) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                >
                  <Row item={item} pinned onToggle={() => toggle(item.id)} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </section>
        <section>
          <h4 className="mb-2 inline-flex rounded-full border border-[var(--border)] bg-muted/40 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-muted-foreground dark:bg-white/[0.06] dark:text-[var(--neutral-200)]">
            All items
          </h4>
          <ul className="space-y-2">
            <AnimatePresence mode="popLayout">
              {unpinnedItems.map((item) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                >
                  <Row item={item} pinned={false} onToggle={() => toggle(item.id)} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </section>
      </LayoutGroup>
    </div>
  );
}

function Row({
  item,
  pinned,
  onToggle,
}: {
  item: DashboardPinItem;
  pinned: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-[var(--shape-xl)] bg-[var(--neutral-50)] px-3 py-2.5 transition-[transform,background-color] duration-[var(--duration-long1)] ease-[var(--ease-emphasized-decelerate)] hover:-translate-y-px hover:bg-[var(--mw-yellow-50)] dark:bg-white/[0.05] dark:hover:bg-white/[0.08]",
        mwHairlineBorder,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">
          {item.title}
        </p>
        <p className="truncate text-sm font-light text-muted-foreground">{item.subtitle}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--mw-mirage)] transition-colors hover:bg-[var(--mw-yellow-400-20)] dark:text-[var(--neutral-200)]"
        aria-label={pinned ? `Unpin ${item.title}` : `Pin ${item.title}`}
      >
        {pinned ? (
          <Pin className="h-4 w-4 fill-current" strokeWidth={1.5} />
        ) : (
          <PinOff className="h-4 w-4" strokeWidth={1.5} />
        )}
      </button>
    </div>
  );
}
