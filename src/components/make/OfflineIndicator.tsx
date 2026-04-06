/**
 * OfflineIndicator — Connection status banner with offline simulation toggle.
 *
 * Green dot = online, red dot = offline.
 * When "offline": shows "Sync pending: 3 items" badge.
 */

import { useState } from "react";
import { motion } from "motion/react";
import { Wifi, WifiOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { staggerItem } from "@/components/shared/motion/motion-variants";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  return (
    <motion.div
      variants={staggerItem}
      initial="initial"
      animate="animate"
      className={cn(
        "flex items-center justify-between gap-3 rounded-[var(--shape-lg)] border px-4 py-2 text-sm transition-colors",
        isOffline
          ? "border-[var(--mw-red,#dc2626)]/30 bg-[var(--mw-red,#dc2626)]/5"
          : "border-[var(--chart-scale-high)]/30 bg-[var(--chart-scale-high)]/5",
      )}
    >
      <div className="flex items-center gap-2">
        {isOffline ? (
          <WifiOff className="h-4 w-4 text-[var(--mw-red,#dc2626)]" strokeWidth={1.5} />
        ) : (
          <Wifi className="h-4 w-4 text-[var(--chart-scale-high)]" strokeWidth={1.5} />
        )}

        <span className="flex items-center gap-2">
          <span
            className={cn(
              "inline-block h-2 w-2 rounded-full",
              isOffline ? "bg-[var(--mw-red,#dc2626)]" : "bg-[var(--chart-scale-high)]",
            )}
          />
          <span className="font-medium text-foreground">
            {isOffline ? "Offline" : "Online"}
          </span>
        </span>

        {isOffline && (
          <Badge variant="outline" className="ml-2 border-[var(--mw-red,#dc2626)]/30 text-[var(--mw-red,#dc2626)]">
            Sync pending: 3 items
          </Badge>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="min-h-[32px] text-xs"
        onClick={() => setIsOffline((prev) => !prev)}
      >
        {isOffline ? "Go Online" : "Simulate Offline"}
      </Button>
    </motion.div>
  );
}
