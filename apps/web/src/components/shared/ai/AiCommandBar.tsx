/**
 * Adobe-style command bar — prototype opens a dialog with mock AI response.
 */

import * as React from "react";
import { Send } from "lucide-react";
import { AgentLogomarkAnimated } from "@/components/shared/agent/AgentLogomarkAnimated";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/components/ui/utils";
import { MirrorWorksAgentCard } from "@/components/shared/ai/MirrorWorksAgentCard";


export type AiCommandScope =
  | "app"
  | "sell"
  | "plan"
  | "make"
  | "ship"
  | "book"
  | "buy"
  | "control";

const PLACEHOLDER: Record<AiCommandScope, string> = {
  app: "Ask MirrorWorks anything — jobs, inventory, orders, exceptions…",
  sell: "Ask about quotes, pipeline, revenue, or customers…",
  plan: "Ask about capacity, jobs, scheduling, or lead time…",
  make: "Ask about work centres, MOs, downtime, or quality…",
  ship: "Ask about shipments, carriers, exceptions, or SLA…",
  book: "Ask about invoices, job costs, budgets, or sync…",
  buy: "Ask about POs, suppliers, requisitions, or spend…",
  control:
    "Ask about MirrorWorks Bridge, factory layout, users, master data, machines, or health…",
};

const MOCK_REPLY: Record<AiCommandScope, { title: string; body: string; actions: string[] }> = {
  app: {
    title: "Cross-module summary",
    body:
      "Across Sell and Plan, three jobs are at risk of missing the Mar 28 customer promise. Open PO lines for Hunter Steel may delay JOB-2026-0012 unless expedited.",
    actions: ["Open at-risk jobs", "View Hunter Steel POs", "Draft supplier message"],
  },
  sell: {
    title: "Pipeline insight",
    body:
      "QT-2026-0142 is the largest open quote this week. Similar wins in Pacific Fab closed 18% faster when follow-up happened within 48 hours.",
    actions: ["Open QT-2026-0142", "Schedule follow-up", "Compare to Pacific Fab"],
  },
  plan: {
    title: "Capacity",
    body:
      "Laser capacity is 78% booked for the next 7 days. Press brake has slack on Thursday — consider pulling JOB-2026-0010 forward.",
    actions: ["View schedule", "Re-sequence JOB-2026-0010", "Simulate what-if"],
  },
  make: {
    title: "Shop floor",
    body:
      "Powder coat line has been down for 45 minutes — quality hold on SPLOT-12. Two downstream MOs may slip unless rerouted to subcontract.",
    actions: ["View Andon", "Open quality hold", "Log downtime reason"],
  },
  ship: {
    title: "Fulfilment",
    body:
      "Three exceptions are carrier delays on StarTrack. Customers with SLA under 24h: Con-form Group, Acme Steel.",
    actions: ["View exceptions", "Notify customers", "Switch carrier rule"],
  },
  book: {
    title: "Finance",
    body:
      "Expense accruals for March are 6% under budget. Two invoices over 14 days: TechCorp Industries, AeroSpace Ltd.",
    actions: ["Open overdue invoices", "Run cash forecast", "Sync Xero"],
  },
  buy: {
    title: "Procurement",
    body:
      "REQ-2026-0089 overlaps stock on hand for 250× SHS — suggest partial fulfilment from Hunter Steel consignment.",
    actions: ["Open requisition", "Check stock", "Split line"],
  },
  control: {
    title: "Control",
    body:
      "MirrorWorks Bridge import queue is clear. Factory layout v3 has three unplaced work centres. Two pending user invites for the shop floor role.",
    actions: ["Open Bridge", "Open factory designer", "Resend invites"],
  },
};

export interface AiCommandBarProps {
  scope: AiCommandScope;
  className?: string;
  /** Accessible label for the field (includes scope for screen readers) */
  "aria-label"?: string;
}

export function AiCommandBar({
  scope,
  className,
  "aria-label": ariaLabel,
}: AiCommandBarProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const thinkingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = React.useId();
  const labelId = `${id}-label`;

  React.useEffect(() => {
    return () => {
      if (thinkingTimeoutRef.current) clearTimeout(thinkingTimeoutRef.current);
    };
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() === "" || thinking) return;
    setThinking(true);
    thinkingTimeoutRef.current = setTimeout(() => {
      setOpen(true);
      setThinking(false);
      thinkingTimeoutRef.current = null;
    }, 680);
  };

  const mock = MOCK_REPLY[scope];

  return (
    <>
      <div
        className={cn(
          "ai-card-glow rounded-full bg-card",
          thinking && "ai-card-glow--animating",
          "focus-within:ring-2 focus-within:ring-[var(--mw-yellow-400)]/40",
          className,
        )}
      >
      <form
        onSubmit={onSubmit}
        className="relative flex w-full items-center gap-3 rounded-full p-2 pl-4 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        role="search"
        aria-labelledby={labelId}
      >
        <span id={labelId} className="sr-only">
          {ariaLabel ?? `MirrorWorks AI — ${scope}`}
        </span>
        <AgentLogomarkAnimated size={40} animating={thinking} />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={thinking}
          placeholder={PLACEHOLDER[scope]}
          className="h-12 min-h-[48px] flex-1 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0 md:text-sm"
          aria-label={ariaLabel ?? `Ask MirrorWorks AI, ${scope} scope`}
        />
        <Button
          type="submit"
          disabled={thinking}
          className="h-12 min-h-[48px] w-12 shrink-0 rounded-full bg-[var(--mw-yellow-400)] p-0 text-primary-foreground hover:bg-[var(--mw-yellow-500)]"
        >
          <Send className="mx-auto h-5 w-5" strokeWidth={1.5} aria-hidden />
          <span className="sr-only">Send</span>
        </Button>
      </form>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-4 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>MirrorWorks Agent</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-[var(--neutral-600)]">
              Response for your current {scope} context.
            </DialogDescription>
          </DialogHeader>
          <MirrorWorksAgentCard
            title={mock.title}
            suggestion={<p className="text-sm leading-relaxed text-[var(--neutral-600)]">{mock.body}</p>}
            primaryAction={{ label: mock.actions[0] ?? 'Review', onClick: () => setOpen(false) }}
            detailContent={mock.actions.length > 1 ? (
              <div className="space-y-1">
                <p className="font-medium text-foreground">Related next steps</p>
                {mock.actions.slice(1).map((action) => (
                  <p key={action}>{action}</p>
                ))}
                <p className="pt-2 text-[var(--neutral-400)]">You asked: “{query.trim() || '…'}”</p>
              </div>
            ) : (
              <p className="text-[var(--neutral-400)]">You asked: “{query.trim() || '…'}”</p>
            )}
            evidenceLevel="expandable"
            detailLabel="Next steps"
            statusText="Prototype response"
          />
          <DialogFooter className="hidden" />
        </DialogContent>
      </Dialog>
    </>
  );
}
