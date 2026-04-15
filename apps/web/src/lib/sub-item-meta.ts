/**
 * Sub-item metadata — icon + 1-line description for every sidebar sub-item.
 *
 * Single source of truth for the sidebar tooltips and the dashboard
 * `ModuleQuickNav` bento grid. Keyed by route path so that the data
 * survives renaming labels in `Sidebar.tsx > menuConfig`.
 *
 * Add a new route here whenever you add a new entry to `menuConfig`.
 */

import {
  // Generic
  LayoutDashboard,
  Settings,
  // Sell
  Users,
  Target,
  ShoppingCart,
  FileText,
  Globe,
  CalendarCheck,
  Receipt,
  Package,
  // Buy
  ClipboardList,
  ClipboardCheck,
  PackageCheck,
  Truck,
  MailQuestion,
  FileSpreadsheet,
  Handshake,
  Sparkles,
  Grid2x2,
  Scale,
  RefreshCcw,
  BarChart3,
  // Plan
  Briefcase,
  GanttChart,
  Lightbulb,
  LayoutGrid,
  Calculator,
  Blocks,
  Library,
  Cable,
  ShoppingBag,
  ShieldCheck,
  // Make
  Factory,
  Hammer,
  ScanLine,
  Recycle,
  AlertOctagon,
  Clock,
  // Ship
  Boxes,
  Ship as ShipIcon,
  MapPin,
  DollarSign,
  Undo2,
  Warehouse as WarehouseIcon,
  // Book
  PiggyBank,
  CreditCard,
  Wallet,
  ShoppingBasket,
  TrendingUp,
  Layers,
  TrendingDown,
  Coins,
  // Control
  LayoutTemplate,
  Workflow,
  Cpu,
  Map as MapIcon,
  Boxes as BoxesIcon,
  Network,
  CalendarClock,
  Trophy,
  Wrench,
  Drill,
  FolderOpen,
  GitBranch,
  Wand2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SubItemMeta {
  icon: LucideIcon;
  /** One-line description (~40 chars max for tooltip readability) */
  description: string;
}

/**
 * Route → metadata. Order grouped by module for legibility, but the
 * runtime lookup is by exact route string.
 */
export const SUB_ITEM_META: Record<string, SubItemMeta> = {
  // ─── Sell ───
  '/sell': { icon: LayoutDashboard, description: 'Pipeline, revenue & quote KPIs' },
  '/sell/crm': { icon: Users, description: 'Customers, contacts & lead scoring' },
  '/sell/opportunities': { icon: Target, description: 'Sales pipeline kanban board' },
  '/sell/orders': { icon: ShoppingCart, description: 'Sales orders & fulfilment status' },
  '/sell/quotes': { icon: FileText, description: 'Quotes with expiry & win tracking' },
  '/sell/portal': { icon: Globe, description: 'Self-service portal for customers' },
  '/sell/activities': { icon: CalendarCheck, description: 'Calls, emails & meeting log' },
  '/sell/invoices': { icon: Receipt, description: 'Sent invoices & payment status' },
  '/sell/products': { icon: Package, description: 'Product catalog (sales view)' },
  '/sell/settings': { icon: Settings, description: 'Permissions, quoting rules, integrations' },

  // ─── Buy ───
  '/buy': { icon: LayoutDashboard, description: 'Spend & supplier performance KPIs' },
  '/buy/orders': { icon: ClipboardList, description: 'Purchase orders & approvals' },
  '/buy/requisitions': { icon: ClipboardCheck, description: 'Internal purchase requisitions' },
  '/buy/receipts': { icon: PackageCheck, description: 'Goods receipt notes & inspection' },
  '/buy/bills': { icon: Receipt, description: 'Vendor invoices (AP) with matching' },
  '/buy/suppliers': { icon: Truck, description: 'Supplier master with KPIs' },
  '/buy/rfqs': { icon: MailQuestion, description: 'Request for quote workflow' },
  '/buy/agreements': { icon: Handshake, description: 'Framework agreements & contracts' },
  '/buy/vendor-comparison': { icon: Scale, description: 'Side-by-side RFQ comparison' },
  '/buy/mrp-suggestions': { icon: Sparkles, description: 'AI-suggested POs from demand' },
  '/buy/planning-grid': { icon: Grid2x2, description: 'Demand vs supply alignment grid' },
  '/buy/reorder-rules': { icon: RefreshCcw, description: 'Reorder points & safety stock' },
  '/buy/products': { icon: Package, description: 'Product catalog (procurement view)' },
  '/buy/reports': { icon: BarChart3, description: 'Spend, lead time & quality analytics' },
  '/buy/settings': { icon: Settings, description: 'Permissions & approval workflows' },

  // ─── Plan ───
  '/plan': { icon: LayoutDashboard, description: 'Schedule adherence & capacity KPIs' },
  '/plan/jobs': { icon: Briefcase, description: 'Manufacturing jobs with routings' },
  '/plan/schedule': { icon: GanttChart, description: 'Cross-job Gantt + calendar view' },
  '/plan/what-if': { icon: Lightbulb, description: 'Scenario analysis on schedule' },
  '/plan/product-studio': { icon: Blocks, description: 'Visual product configurator (Blockly)' },
  '/plan/machine-io': { icon: Cable, description: 'CAD import & NC machine I/O' },
  '/plan/nesting': { icon: LayoutGrid, description: 'Sheet metal nesting optimisation' },
  '/plan/mrp': { icon: FileSpreadsheet, description: 'Material requirements planning' },
  '/plan/sheet-calculator': { icon: Calculator, description: 'Sheet pricing & size optimisation' },
  '/plan/purchase': { icon: ShoppingBag, description: 'Material & subcontract planning' },
  '/plan/libraries': { icon: Library, description: 'Materials & finishes master library' },
  '/plan/products': { icon: Package, description: 'Product catalog (production view)' },
  '/plan/qc-planning': { icon: ShieldCheck, description: 'Inspection plans & sampling' },
  '/plan/settings': { icon: Settings, description: 'Permissions & MRP configuration' },

  // ─── Make ───
  '/make': { icon: LayoutDashboard, description: 'Andon board: machine status & queue' },
  '/make/schedule': { icon: GanttChart, description: 'Work-centre Gantt sequencing' },
  '/make/shop-floor': { icon: Factory, description: 'Operator interface for active work' },
  '/make/manufacturing-orders': { icon: Hammer, description: 'Work orders with time tracking' },
  '/make/scan': { icon: ScanLine, description: 'Barcode scan check-in/out' },
  '/make/scrap-analysis': { icon: Recycle, description: 'Scrap tracking & root cause' },
  '/make/capa': { icon: AlertOctagon, description: 'Corrective & preventive actions' },
  '/make/time-clock': { icon: Clock, description: 'Labour tracking & allocation' },
  '/make/quality': { icon: ShieldCheck, description: 'Inspections, holds & NCRs' },
  '/make/products': { icon: Package, description: 'Product catalog (manufacturing view)' },
  '/make/settings': { icon: Settings, description: 'Permissions & machine config' },

  // ─── Ship ───
  '/ship': { icon: LayoutDashboard, description: 'On-time, carrier & cost KPIs' },
  '/ship/orders': { icon: ShoppingCart, description: 'Shippable orders ready for packing' },
  '/ship/packaging': { icon: Boxes, description: 'Packaging specs & cartons' },
  '/ship/shipping': { icon: ShipIcon, description: 'Carrier selection, rates & labels' },
  '/ship/tracking': { icon: MapPin, description: 'Outbound tracking with carriers' },
  '/ship/carrier-rates': { icon: DollarSign, description: 'Carrier rates & contract pricing' },
  '/ship/scan-to-ship': { icon: ScanLine, description: 'Pack verification by scan' },
  '/ship/returns': { icon: Undo2, description: 'Returns with reason codes' },
  '/ship/warehouse': { icon: WarehouseIcon, description: 'Inventory by location & picking' },
  '/ship/reports': { icon: BarChart3, description: 'Shipping cost & on-time analytics' },
  '/ship/settings': { icon: Settings, description: 'Permissions & carrier integrations' },

  // ─── Book ───
  '/book': { icon: LayoutDashboard, description: 'Revenue, AR ageing & approvals' },
  '/book/budget': { icon: PiggyBank, description: 'Annual budget vs actual variance' },
  '/book/invoices': { icon: Receipt, description: 'Invoice ageing & payment status' },
  '/book/expenses': { icon: CreditCard, description: 'Expense kanban (Submitted → Paid)' },
  '/book/purchases': { icon: Wallet, description: 'PO commitments & budget allocation' },
  '/book/job-costs': { icon: Coins, description: 'Job profitability & margin' },
  '/book/wip': { icon: Layers, description: 'Work-in-process inventory valuation' },
  '/book/cost-variance': { icon: TrendingDown, description: 'Actual vs standard cost variance' },
  '/book/stock-valuation': { icon: ShoppingBasket, description: 'Inventory valuation (FIFO/LIFO)' },
  '/book/reports': { icon: BarChart3, description: 'P&L, balance sheet & cash flow' },
  '/book/settings': { icon: Settings, description: 'Permissions & GL account mapping' },

  // ─── Control ───
  '/control': { icon: LayoutDashboard, description: 'System health & user activity' },
  '/control/factory-layout': { icon: LayoutTemplate, description: 'Visual factory layout editor' },
  '/control/process-builder': { icon: Workflow, description: 'Manufacturing process definitions' },
  '/control/machines': { icon: Cpu, description: 'Machine master with capabilities' },
  '/control/locations': { icon: MapIcon, description: 'Warehouse & manufacturing locations' },
  '/control/inventory': { icon: BoxesIcon, description: 'Master inventory & reorder params' },
  '/control/products': { icon: Package, description: 'Master product definitions' },
  '/control/boms': { icon: Network, description: 'Bill of materials editor' },
  '/control/purchase': { icon: ShoppingBag, description: 'Purchasing master data' },
  '/control/people': { icon: Users, description: 'Users, groups, and access management' },
  '/control/shifts': { icon: CalendarClock, description: 'Shift patterns & scheduling' },
  '/control/gamification': { icon: Trophy, description: 'Leaderboards & achievements' },
  '/control/maintenance': { icon: Wrench, description: 'PM & corrective maintenance' },
  '/control/tooling': { icon: Drill, description: 'Tool inventory & lifecycle' },
  '/control/documents': { icon: FolderOpen, description: 'Document library & versions' },
  '/control/workflow-designer': { icon: GitBranch, description: 'Custom workflow & approvals' },
  '/control/mirrorworks-bridge': { icon: Wand2, description: 'ERP setup & data migration wizard' },
};

/** Lookup helper with safe fallback. */
export function getSubItemMeta(path: string): SubItemMeta | undefined {
  return SUB_ITEM_META[path];
}
