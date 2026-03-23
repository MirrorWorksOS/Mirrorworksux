"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs@1.1.3";

import { cn } from "./utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-[#E5E4E0]/50 inline-flex h-11 w-fit items-center justify-center rounded-xl p-1 backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-xl px-4 text-sm font-medium whitespace-nowrap outline-none",
        "transition-all duration-200 ease-[cubic-bezier(0.0,0.0,0.2,1.0)]",
        "data-[state=active]:bg-white data-[state=active]:text-[#2C2C2C] data-[state=active]:shadow-sm",
        "data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#6B6B6B]",
        "hover:text-[#2C2C2C]",
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
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };