/**
 * Agent Mock Responses — Contextual mock data for the Agent AI chat system.
 *
 * Provides module-aware responses, quick actions, and welcome messages
 * for the prototype. Designed for SMB metal fabrication context.
 */

import type { AgentModule, ModuleContext, QuickAction } from './agent-types';

// ---------------------------------------------------------------------------
// Module Contexts — quick actions and descriptions per module
// ---------------------------------------------------------------------------

export const MODULE_CONTEXTS: Record<AgentModule, ModuleContext> = {
  dashboard: {
    module: 'dashboard',
    label: 'Dashboard',
    description: 'Overview of your operations',
    quickActions: [
      { label: 'What needs my attention today?', prompt: 'What needs my attention today?' },
      { label: 'Show me overdue items', prompt: 'Show me any overdue items across all modules' },
      { label: 'Weekly performance summary', prompt: 'Give me a summary of this week\'s performance' },
    ],
  },
  sell: {
    module: 'sell',
    label: 'Sell',
    description: 'CRM, quotes, and sales orders',
    quickActions: [
      { label: 'Pipeline overview', prompt: 'Give me a pipeline overview for this quarter' },
      { label: 'Expiring quotes', prompt: 'Are there any quotes expiring soon?' },
      { label: 'Top opportunities', prompt: 'What are the top opportunities I should focus on?' },
    ],
  },
  buy: {
    module: 'buy',
    label: 'Buy',
    description: 'Purchase orders and suppliers',
    quickActions: [
      { label: 'Pending POs', prompt: 'Show me pending purchase orders' },
      { label: 'Low stock alerts', prompt: 'Are any materials running low?' },
      { label: 'Supplier performance', prompt: 'How are our suppliers performing on delivery times?' },
    ],
  },
  plan: {
    module: 'plan',
    label: 'Plan',
    description: 'Job planning and scheduling',
    quickActions: [
      { label: 'Schedule conflicts', prompt: 'Are there any schedule conflicts this week?' },
      { label: 'Capacity overview', prompt: 'What does our capacity look like for the next 2 weeks?' },
      { label: 'Jobs at risk', prompt: 'Which jobs are at risk of being late?' },
    ],
  },
  make: {
    module: 'make',
    label: 'Make',
    description: 'Shop floor and manufacturing',
    quickActions: [
      { label: 'Shop floor status', prompt: 'What is the current shop floor status?' },
      { label: 'Quality issues', prompt: 'Are there any open quality issues?' },
      { label: 'Machine utilisation', prompt: 'Show me machine utilisation for this week' },
    ],
  },
  ship: {
    module: 'ship',
    label: 'Ship',
    description: 'Shipping and logistics',
    quickActions: [
      { label: 'Shipments due today', prompt: 'What shipments are due to go out today?' },
      { label: 'Delayed shipments', prompt: 'Are there any delayed shipments?' },
      { label: 'Packaging status', prompt: 'Show me orders ready for packaging' },
    ],
  },
  book: {
    module: 'book',
    label: 'Book',
    description: 'Accounting and finance',
    quickActions: [
      { label: 'Outstanding invoices', prompt: 'Show me outstanding invoices' },
      { label: 'Cash flow this month', prompt: 'What does cash flow look like this month?' },
      { label: 'Job cost summary', prompt: 'Give me a cost summary for recent jobs' },
    ],
  },
  control: {
    module: 'control',
    label: 'Control',
    description: 'System settings and configuration',
    quickActions: [
      { label: 'System health', prompt: 'How is the system performing?' },
      { label: 'Recent changes', prompt: 'What configuration changes were made recently?' },
      { label: 'User activity', prompt: 'Show me a summary of user activity this week' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Mock Responses — module-specific contextual replies
// ---------------------------------------------------------------------------

interface MockResponse {
  /** Keywords / patterns that trigger this response */
  triggers: string[];
  /** The Agent reply (supports simple markdown) */
  response: string;
  /** Content type hint for rendering */
  contentType?: 'text' | 'table' | 'list';
}

const GENERAL_RESPONSES: MockResponse[] = [
  {
    triggers: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
    response:
      "Hello! I'm Agent, your manufacturing assistant. I have context on your current module and can help with questions about your operations. What can I help you with?",
  },
  {
    triggers: ['help', 'what can you do', 'capabilities'],
    response:
      "I can help with a variety of tasks across your manufacturing operations:\n\n- **Sell**: Pipeline analysis, quote tracking, customer insights\n- **Buy**: Purchase order status, supplier performance, stock levels\n- **Plan**: Schedule conflicts, capacity planning, job risk analysis\n- **Make**: Shop floor status, quality monitoring, machine utilisation\n- **Ship**: Shipment tracking, packaging status, delivery scheduling\n- **Book**: Invoice management, cash flow, job costing\n- **Control**: System configuration, user management, process design\n\nJust ask a question and I'll provide context-relevant answers.",
  },
  {
    triggers: ['thank', 'thanks', 'cheers'],
    response: "You're welcome! Let me know if there's anything else I can help with.",
  },
];

const MODULE_RESPONSES: Record<AgentModule, MockResponse[]> = {
  dashboard: [
    {
      triggers: ['attention', 'today', 'urgent', 'priority'],
      response:
        "Here's what needs your attention today:\n\n1. **3 quotes expiring** this week (total value: $67,500)\n2. **Welding station** at 112% utilisation through Thursday\n3. **2 shipments** due out by 3pm\n4. **CNC Mill #1** maintenance overdue by 2 days\n\nWould you like me to drill into any of these?",
      contentType: 'list',
    },
    {
      triggers: ['overdue', 'late', 'behind'],
      response:
        "Across your modules, I see the following overdue items:\n\n| Module | Item | Days Overdue | Value |\n|--------|------|-------------|-------|\n| Sell | Quote Q-2026-0041 | 2 days | $23,000 |\n| Plan | Job JOB-2026-0015 | 1 day | - |\n| Make | MO-0050 machining | 3 days | - |\n| Ship | SO-0098 dispatch | 1 day | $12,400 |\n\nRecommendation: Prioritise the MO-0050 machining delay as it cascades to 2 downstream jobs.",
      contentType: 'table',
    },
    {
      triggers: ['performance', 'summary', 'weekly', 'week'],
      response:
        "**Weekly Performance Summary (Mar 24 - Mar 28)**\n\n- **Revenue**: $148,200 shipped (up 12% vs last week)\n- **On-time delivery**: 91% (target: 95%)\n- **Shop floor efficiency**: 84% (target: 80%)\n- **Open quotes**: 14 worth $312,000 in pipeline\n- **Quality**: 1.8% NCR rate (down from 4.2% last month)\n\nOverall, a strong week. The delivery gap is driven by the CNC Mill downtime affecting 2 orders.",
    },
  ],
  sell: [
    {
      triggers: ['pipeline', 'overview', 'quarter'],
      response:
        "**Q1 Pipeline Overview**\n\n- **Total pipeline**: $284,500 across 18 opportunities\n- **Win rate**: 58% (above 45% target)\n- **Avg deal size**: $15,800\n- **Pipeline vs Q4**: Up 34%\n\nTop 3 opportunities:\n1. **BHP Contractors** - $128,000 (Negotiation)\n2. **Metro Steel Works** - $45,000 (Proposal)\n3. **Coastal Engineering** - $32,000 (Qualification)\n\nBHP has been stalled for 14 days. I'd recommend scheduling a follow-up call.",
    },
    {
      triggers: ['expir', 'quote', 'soon'],
      response:
        "**Quotes Expiring This Week**\n\n| Quote | Customer | Value | Expires |\n|-------|----------|-------|---------|\n| Q-2026-0041 | BHP Contractors | $23,000 | Tomorrow |\n| Q-2026-0042 | Metro Steel | $18,500 | Wednesday |\n| Q-2026-0043 | Coastal Eng | $26,000 | Friday |\n\nTotal at risk: **$67,500**. All three customers have engaged within the last month, so conversion chances are reasonable with a prompt follow-up.",
      contentType: 'table',
    },
    {
      triggers: ['opportunit', 'focus', 'top'],
      response:
        "Based on deal size, engagement recency, and win probability, here are the opportunities to focus on:\n\n1. **BHP Contractors** ($128k) — High value, but stalled 14 days in Negotiation. Action: Schedule call.\n2. **Coastal Engineering** ($32k) — New enquiry, fast-moving. They requested a site visit. Action: Confirm visit.\n3. **Metro Steel Works** ($45k) — Repeat customer, proposal sent last week. Action: Follow up on Thursday.\n\nThese three represent 72% of your pipeline value.",
      contentType: 'list',
    },
  ],
  buy: [
    {
      triggers: ['pending', 'purchase', 'order', 'po'],
      response:
        "**Pending Purchase Orders**\n\n| PO | Supplier | Material | Value | Status |\n|----|----------|----------|-------|--------|\n| PO-0234 | Steel Direct | 10mm MS Plate | $8,400 | Awaiting delivery |\n| PO-0235 | BoltCo | M16 Hex Bolts | $340 | Confirmed |\n| PO-0236 | ABC Coatings | Powder Coat | $1,200 | Processing |\n\n3 POs outstanding, total value: **$9,940**. PO-0234 is due tomorrow — I'd confirm delivery with Steel Direct.",
      contentType: 'table',
    },
    {
      triggers: ['low', 'stock', 'material', 'running'],
      response:
        "**Low Stock Alerts**\n\n- **10mm MS Plate**: 12 sheets remaining (5-day usage: 20 sheets). Reorder point hit.\n- **M16 Hex Bolts**: 340 pcs (adequate for 2 weeks)\n- **Argon Gas**: 2 cylinders (3-day supply at current welding load)\n\nRecommendation: Place an order for 10mm MS Plate and Argon Gas today to avoid production delays next week.",
      contentType: 'list',
    },
    {
      triggers: ['supplier', 'performance', 'delivery'],
      response:
        "**Supplier Delivery Performance (Last 90 Days)**\n\n| Supplier | On-Time % | Avg Lead Time | Quality |\n|----------|-----------|---------------|----------|\n| Steel Direct | 88% | 3.2 days | 99% |\n| BoltCo | 95% | 2.1 days | 100% |\n| ABC Coatings | 72% | 5.8 days | 96% |\n| Weld Supplies | 91% | 1.5 days | 100% |\n\nABC Coatings is underperforming. Consider discussing SLA improvements or evaluating alternative coating suppliers.",
      contentType: 'table',
    },
  ],
  plan: [
    {
      triggers: ['schedule', 'conflict', 'clash'],
      response:
        "**Schedule Conflicts This Week**\n\n1. **Welding Station** (Mar 25-28): 112% utilisation. MO-0055, MO-0060, and MO-0062 are all competing for welding time.\n2. **CNC Mill #1** (Mar 24-26): Offline for maintenance, but MO-0050 is assigned there.\n\n**Suggested resolution:**\n- Shift MO-0062 welding to next Monday (not time-critical)\n- Reassign MO-0050 machining to CNC Mill #2 (currently at 65% utilisation)\n\nThis would bring welding down to 89% and clear the machining conflict.",
    },
    {
      triggers: ['capacity', 'utilisation', 'next'],
      response:
        "**Capacity Forecast (Next 2 Weeks)**\n\n| Work Centre | This Week | Next Week | Status |\n|-------------|-----------|-----------|--------|\n| Cutting | 78% | 65% | OK |\n| Welding | 112% | 85% | Over capacity |\n| Machining | 45% | 72% | OK |\n| Assembly | 60% | 70% | OK |\n| Finishing | 82% | 90% | Watch |\n\nWelding is the bottleneck this week. Finishing will be tight next week due to 3 large orders entering the final stage.",
      contentType: 'table',
    },
    {
      triggers: ['job', 'risk', 'late', 'at risk'],
      response:
        "**Jobs at Risk of Late Delivery**\n\n1. **JOB-2026-0015** (due Apr 5) — No scheduled start date. Requires 4 days of production. *Action: Schedule immediately.*\n2. **JOB-2026-0013** (due Apr 8) — Waiting on material (10mm MS Plate on PO-0234). *Action: Confirm delivery tomorrow.*\n3. **JOB-2026-0018** (due Apr 12) — Dependent on MO-0050 which is delayed by CNC maintenance. *Action: Reassign to CNC Mill #2.*\n\nAddressing these now should prevent customer delivery failures.",
      contentType: 'list',
    },
  ],
  make: [
    {
      triggers: ['shop floor', 'status', 'current'],
      response:
        "**Current Shop Floor Status**\n\n| Work Centre | Active MOs | Operator | Status |\n|-------------|-----------|----------|--------|\n| Cutting Bay 1 | MO-0058 | D. Wilson | Running |\n| Welding 1 | MO-0055 | T. Nguyen | Running |\n| Welding 2 | MO-0060 | B. Smith | Setup |\n| CNC Mill #1 | - | - | Maintenance |\n| CNC Mill #2 | MO-0052 | J. Park | Running |\n| Assembly | MO-0048 | R. Jones | Running |\n| Finishing | MO-0045 | A. Kumar | QC Hold |\n\n6 of 7 stations active. MO-0045 in Finishing is on QC hold pending inspection sign-off.",
      contentType: 'table',
    },
    {
      triggers: ['quality', 'issue', 'ncr', 'defect'],
      response:
        "**Open Quality Issues**\n\n1. **NCR-0034** (MO-0045): Dimensional variance on bracket assembly, 2mm out of tolerance. Currently in Finishing QC hold. Likely caused by worn jig fixture.\n2. **NCR-0031** (MO-0042): Surface finish defect on powder coat, customer flagged. Re-coat required.\n\nOverall quality trend is positive — NCR rate dropped from 4.2% to 1.8% after new jig installation. The NCR-0034 issue may indicate the replacement jig needs calibration.",
    },
    {
      triggers: ['machine', 'utilisation', 'usage'],
      response:
        "**Machine Utilisation This Week**\n\n| Machine | Planned Hrs | Actual Hrs | Utilisation | Downtime |\n|---------|-------------|------------|-------------|----------|\n| Laser Cutter | 40 | 36 | 90% | 4h (setup) |\n| CNC Mill #1 | 40 | 0 | 0% | Maintenance |\n| CNC Mill #2 | 40 | 32 | 80% | 8h (idle) |\n| Welding Bay 1 | 40 | 44 | 110% | 0h |\n| Welding Bay 2 | 40 | 42 | 105% | 0h |\n| Press Brake | 40 | 28 | 70% | 12h (idle) |\n\nWelding is running overtime. Press Brake has capacity available if you need to redistribute.",
      contentType: 'table',
    },
  ],
  ship: [
    {
      triggers: ['shipment', 'today', 'due', 'going out'],
      response:
        "**Shipments Due Today**\n\n| Order | Customer | Items | Carrier | Status |\n|-------|----------|-------|---------|--------|\n| SO-0098 | BHP Contractors | Bracket assy x24 | TNT | Ready |\n| SO-0101 | Metro Steel | Plate frames x8 | Toll | Packing |\n| SO-0103 | Coastal Eng | Custom brackets x12 | Self-collect | Awaiting QC |\n\n2 of 3 are on track. SO-0103 is waiting on QC clearance — I'd follow up with the Quality team to clear it before the 3pm pickup window.",
      contentType: 'table',
    },
    {
      triggers: ['delay', 'late', 'behind'],
      response:
        "**Delayed Shipments**\n\n1. **SO-0095** (Precision Parts Co) — 2 days late. Held by MO-0050 machining delay (CNC Mill maintenance). Expected to ship Wednesday.\n2. **SO-0092** (Northern Fabrication) — 1 day late. Waiting on re-coat (NCR-0031). Should ship tomorrow.\n\nBoth customers have been notified. I'd recommend confirming revised dates with them today.",
      contentType: 'list',
    },
    {
      triggers: ['packag', 'ready', 'pack'],
      response:
        "**Orders Ready for Packaging**\n\n- **SO-0098**: 24 bracket assemblies, standard pallet wrap. Ready now.\n- **SO-0104**: 6 custom frames, requires timber crating. Materials staged.\n- **SO-0106**: 48 clevis pins, box pack. Ready now.\n\nSO-0104 timber crating will take approximately 1.5 hours. Suggest starting that first if it needs to ship today.",
      contentType: 'list',
    },
  ],
  book: [
    {
      triggers: ['invoice', 'outstanding', 'unpaid'],
      response:
        "**Outstanding Invoices**\n\n| Invoice | Customer | Amount | Due Date | Days Overdue |\n|---------|----------|--------|----------|---------------|\n| INV-2026-0089 | BHP Contractors | $48,200 | Mar 15 | 13 days |\n| INV-2026-0092 | Metro Steel | $12,400 | Mar 20 | 8 days |\n| INV-2026-0094 | Coastal Eng | $8,800 | Mar 25 | 3 days |\n| INV-2026-0096 | Precision Parts | $15,600 | Mar 28 | Current |\n\nTotal outstanding: **$85,000**. BHP is the largest — they usually pay within 30 days but this one is now 43 days. Recommend escalating.",
      contentType: 'table',
    },
    {
      triggers: ['cash flow', 'cash', 'flow', 'month'],
      response:
        "**Cash Flow Summary — March 2026**\n\n- **Revenue received**: $186,400\n- **Expenses paid**: $142,800\n- **Net cash flow**: +$43,600\n- **Outstanding receivables**: $85,000\n- **Upcoming payables**: $38,200 (due next 7 days)\n\nCash position is healthy. If BHP pays within the next week, you'll have a strong buffer heading into April. The main expense upcoming is the PO-0234 steel delivery ($8,400) and weekly payroll ($24,000).",
    },
    {
      triggers: ['cost', 'job cost', 'recent job'],
      response:
        "**Job Cost Summary — Recent Jobs**\n\n| Job | Customer | Quoted | Actual | Margin |\n|-----|----------|--------|--------|--------|\n| JOB-2026-0010 | BHP | $48,200 | $42,100 | 12.7% |\n| JOB-2026-0011 | Metro | $12,400 | $11,800 | 4.8% |\n| JOB-2026-0012 | Coastal | $8,800 | $7,200 | 18.2% |\n| JOB-2026-0009 | Precision | $15,600 | $16,100 | -3.2% |\n\nJOB-2026-0009 went over budget by $500 — main driver was rework from NCR-0031 (surface defect). The Coastal job performed well above expected margin.",
      contentType: 'table',
    },
  ],
  control: [
    {
      triggers: ['system', 'health', 'performance'],
      response:
        "**System Health Overview**\n\n- **Uptime**: 99.8% (last 30 days)\n- **Active users**: 12 of 15 licensed\n- **Storage**: 4.2 GB of 10 GB used (42%)\n- **Integrations**: All 3 connected (Xero, ShipStation, Slack)\n- **Last backup**: 2 hours ago\n\nEverything is running smoothly. No issues to report.",
    },
    {
      triggers: ['change', 'configuration', 'recent', 'config'],
      response:
        "**Recent Configuration Changes**\n\n1. **Mar 26**: Process Builder — Added 'Powder Coat Inspection' step to Finishing workflow (by M. Quigley)\n2. **Mar 25**: Role Designer — Updated 'Shop Floor Operator' role permissions (by M. Quigley)\n3. **Mar 24**: Machines — CNC Mill #1 set to 'Maintenance' status (by D. Wilson)\n4. **Mar 22**: Inventory — Reorder point for 10mm MS Plate updated to 15 sheets (by S. Chen)\n\nAll changes are logged and reversible.",
      contentType: 'list',
    },
    {
      triggers: ['user', 'activity', 'usage'],
      response:
        "**User Activity Summary (This Week)**\n\n| User | Module | Sessions | Actions |\n|------|--------|----------|---------|\n| M. Quigley | Control, Plan | 24 | 156 |\n| T. Nguyen | Make | 18 | 89 |\n| D. Wilson | Make, Plan | 15 | 72 |\n| S. Chen | Buy, Book | 12 | 64 |\n| B. Smith | Make | 10 | 45 |\n\nMost active module: **Make** (43% of all sessions). Peak usage hours: 7am-10am and 1pm-3pm.",
      contentType: 'table',
    },
  ],
};

// ---------------------------------------------------------------------------
// Fallback response
// ---------------------------------------------------------------------------

const FALLBACK_RESPONSES = [
  "I understand you're asking about that. In a production environment, I'd connect to your live data to give you a precise answer. For now, try one of the suggested prompts or ask about a specific area like scheduling, inventory, or financials.",
  "That's a great question. I'd need to query your live database for an accurate answer. As a prototype, I can help with common scenarios — try asking about pipeline status, shop floor updates, or upcoming deliveries.",
  "I'm not quite sure about that specific query in demo mode. I can help with common manufacturing questions across Sell, Buy, Plan, Make, Ship, Book, and Control. What area would you like to explore?",
];

// ---------------------------------------------------------------------------
// Response Engine
// ---------------------------------------------------------------------------

/** Find the best mock response for a given user message and module context. */
export function getAgentResponse(
  userMessage: string,
  module: AgentModule,
): { content: string; contentType?: 'text' | 'table' | 'list' } {
  const lower = userMessage.toLowerCase();

  // 1. Check module-specific responses first
  const moduleResponses = MODULE_RESPONSES[module] ?? [];
  for (const mock of moduleResponses) {
    if (mock.triggers.some((t) => lower.includes(t))) {
      return { content: mock.response, contentType: mock.contentType };
    }
  }

  // 2. Check general responses
  for (const mock of GENERAL_RESPONSES) {
    if (mock.triggers.some((t) => lower.includes(t))) {
      return { content: mock.response, contentType: mock.contentType };
    }
  }

  // 3. Fallback
  const fallback = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  return { content: fallback };
}

/** Welcome message shown in empty conversations. */
export function getWelcomeMessage(module: AgentModule): string {
  const ctx = MODULE_CONTEXTS[module];
  return `Welcome to Agent! I'm your manufacturing assistant, currently in the **${ctx.label}** module (${ctx.description}). I can help you with insights, data lookups, and recommendations.\n\nTry one of the suggested prompts below, or ask me anything about your operations.`;
}

/** Get quick actions for the current module context. */
export function getQuickActions(module: AgentModule): QuickAction[] {
  return MODULE_CONTEXTS[module]?.quickActions ?? MODULE_CONTEXTS.dashboard.quickActions;
}

/** Get the module label for display. */
export function getModuleLabel(module: AgentModule): string {
  return MODULE_CONTEXTS[module]?.label ?? 'Dashboard';
}
