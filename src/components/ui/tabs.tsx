"use client";

import * as React from "react";

import {
  Tabs as TabsPrimitive,
  TabsList as TabsListPrimitive,
  TabsTrigger as TabsTriggerPrimitive,
  TabsContent as TabsContentPrimitive,
} from "@/components/animate-ui/primitives/radix/tabs";
import { cn } from "./utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive>) {
  return (
    <TabsPrimitive
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
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
        "inline-flex h-11 w-fit items-center justify-center rounded-full bg-[#E5E4E0]/50 dark:bg-[var(--neutral-200)]/40 p-1 backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsTriggerPrimitive>) {
  return (
    <TabsTriggerPrimitive
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-medium whitespace-nowrap outline-none",
        "transition-all duration-200 ease-[cubic-bezier(0.0,0.0,0.2,1.0)]",
        "data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        "data-[state=inactive]:bg-transparent data-[state=inactive]:text-foreground/60",
        "hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-[#FFCF4B]/50 focus-visible:ring-offset-1",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
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
