/**
 * Module icon configuration — single source of truth
 *
 * Animated icons (Animate UI) for sidebar and dashboard module identifiers.
 * Static icons (Lucide) for everything else in the app.
 */

import { Kanban } from "@/components/animate-ui/icons/kanban";
import { ChartSpline } from "@/components/animate-ui/icons/chart-spline";
import { List as ListIcon } from "@/components/animate-ui/icons/list";
import { Cog } from "@/components/animate-ui/icons/cog";
import { Forklift } from "@/components/animate-ui/icons/forklift";
import { CircuitBoard } from "@/components/animate-ui/icons/circuit-board";
import { Blocks } from "@/components/animate-ui/icons/blocks";
import { Route } from "@/components/animate-ui/icons/route";

export const MODULE_ICONS = {
  sell: Kanban,
  plan: ListIcon,
  make: CircuitBoard,
  ship: Forklift,
  book: ChartSpline,
  buy: Blocks,
  control: Cog,
  design: Route,
} as const;

export const ICON_SIZES = {
  sidebar: 20,
  dashboard: 28,
  page: 20,
  table: 16,
  shopFloor: 24,
  chevron: 16,
} as const;
