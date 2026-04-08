"use client";

import * as React from "react";
import { motion } from "motion/react";

import {
  Tabs as TabsPrimitive,
  TabsList as TabsListPrimitive,
  TabsTrigger as TabsTriggerPrimitive,
  TabsContent as TabsContentPrimitive,
} from "@/components/animate-ui/primitives/radix/tabs";
import { cn } from "./utils";

// ── Smooth-tab context ──────────────────────────────────────────
// Tracks the active value + a unique layoutId scope per <Tabs>.
type SmoothTabsCtx = { value?: string; layoutId: string };
const SmoothTabsContext = React.createContext<SmoothTabsCtx>({ layoutId: "" });

function Tabs({
  className,
  value,
  defaultValue,
  onValueChange,
  ...props
}: React.ComponentProps<typeof TabsPrimitive>) {
  const id = React.useId();
  const [current, setCurrent] = React.useState(value ?? defaultValue);

  React.useEffect(() => {
    if (value !== undefined) setCurrent(value);
  }, [value]);

  const handleChange = (v: string) => {
    setCurrent(v);
    onValueChange?.(v);
  };

  return (
    <SmoothTabsContext.Provider
      value={{ value: current, layoutId: `tab-pill-${id}` }}
    >
      <TabsPrimitive
        data-slot="tabs"
        className={cn("flex flex-col gap-2", className)}
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleChange}
        {...props}
      />
    </SmoothTabsContext.Provider>
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsListPrimitive>) {
  return (
    <TabsListPrimitive
      data-slot="tabs-list"
      className={cn(
        "inline-flex min-h-11 w-fit min-w-0 max-w-full items-center justify-center gap-0.5 overflow-x-auto overscroll-x-contain rounded-full bg-[var(--neutral-100)]/80 p-1 backdrop-blur-sm dark:bg-[var(--neutral-200)]/40 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  children,
  value,
  ...props
}: React.ComponentProps<typeof TabsTriggerPrimitive>) {
  const ctx = React.useContext(SmoothTabsContext);
  const isActive = ctx.value === value;

  return (
    <TabsTriggerPrimitive
      data-slot="tabs-trigger"
      value={value}
      className={cn(
        "relative inline-flex h-9 min-h-9 items-center justify-center gap-1 overflow-hidden rounded-full px-4 text-sm font-medium whitespace-nowrap outline-none",
        "transition-colors duration-200",
        "data-[state=active]:text-foreground",
        "data-[state=inactive]:bg-transparent data-[state=inactive]:text-foreground/60",
        "data-[state=inactive]:hover:bg-black/[0.04] dark:data-[state=inactive]:hover:bg-white/[0.06]",
        "hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-[var(--mw-yellow-400)]/50 focus-visible:ring-inset",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {isActive && (
        <motion.span
          layoutId={ctx.layoutId}
          data-slot="tab-indicator"
          className="absolute inset-0 box-border rounded-full bg-card shadow-[0_1px_2px_rgb(0_0_0_/0.06)] dark:shadow-[0_1px_2px_rgb(0_0_0_/0.2)]"
          style={{ zIndex: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <span className="relative z-10 inline-flex min-w-0 items-center gap-[inherit]">
        {children}
      </span>
    </TabsTriggerPrimitive>
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsContentPrimitive>) {
  return (
    <TabsContentPrimitive
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
