/* ------------------------------------------------------------------ */
/*  Widget Registry – central catalogue of dashboard widget templates  */
/* ------------------------------------------------------------------ */

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  size: "sm" | "md" | "lg" | "xl"; // 1col, 2col, 3col, 4col
  module?: string; // which module this is relevant to, or 'all'
  config?: Record<string, unknown>;
}

export interface WidgetTemplate {
  type: string;
  label: string;
  description: string;
  icon: string; // lucide icon name
  defaultSize: "sm" | "md" | "lg" | "xl";
  category: "kpi" | "chart" | "action" | "list" | "ai";
  modules: string[]; // which modules can use this, or ['all']
}

export const WIDGET_TEMPLATES: WidgetTemplate[] = [
  // KPI Widgets
  {
    type: "sales-performance-score",
    label: "Sales Performance Score",
    description:
      "Overall sales health index (0-100) combining conversion rate, velocity, and win rate",
    icon: "Activity",
    defaultSize: "sm",
    category: "kpi",
    modules: ["sell"],
  },
  {
    type: "quota-attainment",
    label: "Quota Attainment",
    description: "Percentage of quota achieved (team and individual)",
    icon: "Target",
    defaultSize: "sm",
    category: "kpi",
    modules: ["sell"],
  },
  {
    type: "active-jobs",
    label: "Active Jobs",
    description: "Count of currently active manufacturing jobs",
    icon: "Briefcase",
    defaultSize: "sm",
    category: "kpi",
    modules: ["plan", "make"],
  },
  {
    type: "on-time-rate",
    label: "On-Time Delivery Rate",
    description: "Percentage of orders delivered on schedule",
    icon: "Clock",
    defaultSize: "sm",
    category: "kpi",
    modules: ["plan", "make", "ship"],
  },
  {
    type: "open-pos",
    label: "Open Purchase Orders",
    description: "Count and value of open POs",
    icon: "ShoppingCart",
    defaultSize: "sm",
    category: "kpi",
    modules: ["buy"],
  },
  {
    type: "cash-position",
    label: "Cash Position",
    description: "Current cash balance and 30-day forecast",
    icon: "DollarSign",
    defaultSize: "sm",
    category: "kpi",
    modules: ["book"],
  },

  // Chart Widgets
  {
    type: "revenue-trend",
    label: "Revenue Trends",
    description: "Revenue over time with actual vs target vs forecast",
    icon: "TrendingUp",
    defaultSize: "lg",
    category: "chart",
    modules: ["sell", "book"],
  },
  {
    type: "pipeline-funnel",
    label: "Pipeline Funnel",
    description: "Lead \u2192 Qualified \u2192 Proposal \u2192 Negotiation \u2192 Closed",
    icon: "Filter",
    defaultSize: "md",
    category: "chart",
    modules: ["sell"],
  },
  {
    type: "quote-to-cash",
    label: "Quote-to-Cash Cycle",
    description:
      "Timeline: Quote \u2192 Order \u2192 Production \u2192 Delivery \u2192 Payment",
    icon: "ArrowRight",
    defaultSize: "lg",
    category: "chart",
    modules: ["sell", "plan", "make"],
  },
  {
    type: "win-loss",
    label: "Win/Loss Analysis",
    description: "Won vs Lost by reason with top loss reasons",
    icon: "BarChart3",
    defaultSize: "md",
    category: "chart",
    modules: ["sell"],
  },
  {
    type: "oee-gauge",
    label: "OEE Gauge",
    description: "Overall Equipment Effectiveness percentage",
    icon: "Gauge",
    defaultSize: "sm",
    category: "chart",
    modules: ["make"],
  },
  {
    type: "customer-segmentation",
    label: "Customer Segmentation",
    description: "Revenue by industry, company size, or region",
    icon: "PieChart",
    defaultSize: "md",
    category: "chart",
    modules: ["sell"],
  },

  // Action/List Widgets
  {
    type: "pipeline-health",
    label: "Pipeline Health",
    description:
      "Weighted pipeline value, stalled deals, top deals at risk",
    icon: "HeartPulse",
    defaultSize: "md",
    category: "list",
    modules: ["sell"],
  },
  {
    type: "leaderboard",
    label: "Sales Leaderboard",
    description: "Top reps by revenue, deals closed, conversion rate",
    icon: "Trophy",
    defaultSize: "md",
    category: "list",
    modules: ["sell"],
  },
  {
    type: "approval-queue",
    label: "Approval Queue",
    description: "Pending approvals requiring action",
    icon: "CheckCircle",
    defaultSize: "md",
    category: "list",
    modules: ["all"],
  },
  {
    type: "upcoming-tasks",
    label: "Upcoming Tasks",
    description: "Next tasks and deadlines across all jobs",
    icon: "ListTodo",
    defaultSize: "md",
    category: "list",
    modules: ["plan"],
  },

  // AI Widget
  {
    type: "ai-insights",
    label: "AI Insights",
    description: "AI-generated insights and recommendations",
    icon: "Sparkles",
    defaultSize: "md",
    category: "ai",
    modules: ["all"],
  },
];

/* ------------------------------------------------------------------ */
/*  Default widget configurations per module                           */
/* ------------------------------------------------------------------ */

let nextId = 1;
function wid(): string {
  return `w-${nextId++}`;
}

function widgetFromTemplate(
  type: string,
  overrides?: Partial<WidgetConfig>,
): WidgetConfig | null {
  const tpl = WIDGET_TEMPLATES.find((t) => t.type === type);
  if (!tpl) return null;
  return {
    id: wid(),
    type: tpl.type,
    title: tpl.label,
    size: tpl.defaultSize,
    ...overrides,
  };
}

export function getDefaultWidgets(module: string): WidgetConfig[] {
  const configs: Record<string, string[]> = {
    sell: [
      "sales-performance-score",
      "quota-attainment",
      "revenue-trend",
      "pipeline-funnel",
      "pipeline-health",
      "win-loss",
      "leaderboard",
      "ai-insights",
    ],
    plan: [
      "active-jobs",
      "on-time-rate",
      "upcoming-tasks",
      "quote-to-cash",
      "approval-queue",
      "ai-insights",
    ],
    make: [
      "active-jobs",
      "on-time-rate",
      "oee-gauge",
      "quote-to-cash",
      "approval-queue",
      "ai-insights",
    ],
    ship: [
      "on-time-rate",
      "approval-queue",
      "ai-insights",
    ],
    buy: [
      "open-pos",
      "approval-queue",
      "ai-insights",
    ],
    book: [
      "cash-position",
      "revenue-trend",
      "approval-queue",
      "ai-insights",
    ],
  };

  const types = configs[module] ?? [
    "approval-queue",
    "ai-insights",
  ];

  // Reset id counter per call so defaults are deterministic
  nextId = 1;

  return types
    .map((type) => widgetFromTemplate(type, { module }))
    .filter((w): w is WidgetConfig => w !== null);
}
