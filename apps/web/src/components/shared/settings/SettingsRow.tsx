import type { ReactNode } from "react";

import { cn } from "@/components/ui/utils";

export interface SettingsRowProps {
  children: ReactNode;
  /**
   * Add a subtle hover state (neutral-100 background + transition).
   * Use for rows the user can click, edit, or hover-discover actions on.
   */
  interactive?: boolean;
  className?: string;
}

/**
 * SettingsRow — horizontal row chrome used across module Settings pages.
 *
 * Replaces the hand-rolled
 * `<div className="flex items-center justify-between bg-card border ... rounded-[var(--shape-lg)] p-3">`
 * pattern that was duplicated 11 times across Sell / Plan / Make / Book /
 * Ship / Buy settings. Children compose freely (label + control, icon + label
 * + actions, etc.); the wrapper just owns the surface chrome.
 */
export function SettingsRow({ children, interactive, className }: SettingsRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between bg-card border border-[var(--border)] rounded-[var(--shape-lg)] p-3",
        interactive && "hover:bg-[var(--neutral-100)] transition-colors",
        className,
      )}
    >
      {children}
    </div>
  );
}
