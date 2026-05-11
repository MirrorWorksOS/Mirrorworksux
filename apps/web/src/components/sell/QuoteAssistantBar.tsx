/**
 * QuoteAssistantBar — Inline AI command bar for quoting context.
 * Natural language input → instant line item suggestions, pricing history,
 * CTP results, and bulk operations.
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Plus, Clock, TrendingUp, Copy, Calendar, WandSparkles, PackageSearch, Truck, Percent, Sparkles, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/components/ui/utils';
import { AgentLogomark } from '@/components/shared/agent/AgentLogomark';
import { BorderGlow } from '@/components/shared/surfaces/BorderGlow';
import { toast } from 'sonner';
import { MirrorWorksAgentCard } from '@/components/shared/ai/MirrorWorksAgentCard';
import { quotes } from '@/services/mock/data';

// ── Types ─────────────────────────────────────────────────────────────

interface LineItemInput {
  description: string;
  sku: string;
  qty: number;
  unit: string;
  unitCost: number;
  margin: number;
  unitPrice: number;
  /** When the line was recalled from a past quote, the source quote ref (e.g. "Q-2025-0089"). */
  sourceQuote?: string;
  /** ISO or display date of the source quote — used in the source badge tooltip. */
  sourceDate?: string;
  /** Customer on the source quote (typically same, but surface differences when present). */
  sourceCustomer?: string;
  /** The unit price on the historical line — shown alongside today's unit price in the tooltip. */
  sourceUnitPrice?: number;
}

interface QuoteAssistantBarProps {
  customer: string;
  lines: { description: string; qty: number; unitCost: number; unitPrice: number }[];
  onQueueLinesForReview: (items: LineItemInput[]) => void;
  onUpdateMargins: (margin: number) => void;
}

type ResponseType = 'line-items' | 'history' | 'ctp' | 'margin' | 'similar';
type AssistantMode = 'generate' | 'history' | 'delivery' | 'margins';

interface AssistantResponse {
  type: ResponseType;
  title: string;
  body: string;
  items?: LineItemInput[];
  margin?: number;
}

const MODE_CONFIG: Record<AssistantMode, {
  label: string;
  promptLabel: string;
  icon: React.ElementType;
  placeholder: string;
  suggestions: string[];
}> = {
  generate: {
    label: 'Generate lines',
    promptLabel: 'Generate',
    icon: WandSparkles,
    placeholder: 'Describe the parts, fabrication steps, or assemblies to generate draft quote lines…',
    suggestions: [
      'Generate line items for 10 powder-coated control panel enclosures',
      'Build a draft quote for 24 structural brackets with welding and coating',
    ],
  },
  history: {
    label: 'Compare with history',
    promptLabel: 'History',
    icon: PackageSearch,
    placeholder: 'Ask about past pricing, similar jobs, or previous accepted quotes…',
    suggestions: [
      'Fill from history',
      'Show pricing history for this customer',
      'What did we charge last time?',
      'Compare to similar quotes',
    ],
  },
  delivery: {
    label: 'Check delivery',
    promptLabel: 'Delivery',
    icon: Truck,
    placeholder: 'Ask whether the current quote can be delivered by a target date…',
    suggestions: [
      'Can we deliver by next month?',
      'What is the earliest delivery date for this quote?',
    ],
  },
  margins: {
    label: 'Update margins',
    promptLabel: 'Margins',
    icon: Percent,
    placeholder: 'Apply or compare margins across the quote, for example "Apply 25% margin to all".',
    suggestions: [
      'Apply 25% margin to all',
      'Apply 30% margin to all',
    ],
  },
};

// ── Mock response logic ───────────────────────────────────────────────

/** Pull a plausible order quantity from natural-language prompts (e.g. "for 24 …", "10× …"). */
function parseQuoteQuantity(input: string, lower: string): number {
  const forNum = /\bfor\s+(\d{1,6})\b/i.exec(input);
  if (forNum) return Math.max(1, parseInt(forNum[1], 10));
  const xQty =
    /\b(\d{1,6})\s*(?:x|×|pcs?|pieces?|units?|each|ea\.?)\b/i.exec(lower);
  if (xQty) return Math.max(1, parseInt(xQty[1], 10));
  const lead = /^(\d{1,6})\s+/.exec(lower.trim());
  if (lead) return Math.max(1, parseInt(lead[1], 10));
  const any = /\b(\d{1,6})\b/.exec(lower);
  return any ? Math.max(1, parseInt(any[1], 10)) : 10;
}

/**
 * Map agent-bar prompts to realistic catalogue-style line copy (not the command string).
 */
function mockPrimaryLineFromPrompt(input: string, lower: string, qty: number): LineItemInput {
  if (
    lower.includes('structural bracket') ||
    (lower.includes('bracket') && lower.includes('structural'))
  ) {
    return {
      description: 'Structural steel bracket',
      sku: 'FAB-BRACKET-01',
      qty,
      unit: 'each',
      unitCost: 450,
      margin: 25,
      unitPrice: 600,
    };
  }

  if (
    lower.includes('control panel enclosure') ||
    (lower.includes('powder') && lower.includes('enclosure')) ||
    (lower.includes('powder-coated') && lower.includes('panel'))
  ) {
    return {
      description: 'Powder-coated control panel enclosure',
      sku: 'ENCL-CPC-PC',
      qty,
      unit: 'each',
      unitCost: 85,
      margin: 25,
      unitPrice: 113,
    };
  }

  if (lower.includes('server rack') || lower.includes('rack enclosure')) {
    return {
      description: 'Server rack enclosure — welded frame',
      sku: 'RACK-SRV-42U',
      qty,
      unit: 'each',
      unitCost: 320,
      margin: 25,
      unitPrice: 427,
    };
  }

  if (lower.includes('aluminium panel') || lower.includes('aluminum panel')) {
    return {
      description: 'Aluminium face panel — brushed',
      sku: 'PANEL-ALU-FACE',
      qty,
      unit: 'each',
      unitCost: 95,
      margin: 25,
      unitPrice: 127,
    };
  }

  const cleaned = cleanPromptToProductTitle(input, lower);
  return {
    description: cleaned,
    sku: 'CUSTOM-001',
    qty,
    unit: 'each',
    unitCost: 45,
    margin: 25,
    unitPrice: 60,
  };
}

function cleanPromptToProductTitle(input: string, lower: string): string {
  const genericRfQ = lower.includes('from the customer rfq') || lower.trim() === 'generate line items from the customer rfq';
  if (genericRfQ) {
    return 'Custom fabricated item — see RFQ notes';
  }

  let rest = input
    .replace(/^(build a )?draft quote for\s+/i, '')
    .replace(/^generate line items for\s+/i, '')
    .replace(/\s+from the customer rfq\s*\.?$/i, '')
    .trim();

  rest = rest.replace(/^\d{1,6}\s+/, '').trim();
  rest = rest.replace(/\s+with\s+.+$/i, '').trim();
  rest = rest.replace(/\s*[.,;]\s*$/g, '').trim();

  if (!rest) return 'Custom fabricated item';

  const words = rest.split(/\s+/).filter(Boolean);
  const capped = words
    .slice(0, 12)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
  return capped.length > 80 ? `${capped.slice(0, 77)}…` : capped;
}

function mockFabricationLabourLine(lower: string, qty: number): LineItemInput {
  const welding = lower.includes('weld');
  const coating = lower.includes('coat') || lower.includes('powder');
  const label =
    welding && coating
      ? 'Welding, coating & fabrication labour'
      : welding
        ? 'Welding & fabrication labour'
        : coating
          ? 'Coating & fabrication labour'
          : 'Fabrication labour';

  const hours = Math.max(1, Math.ceil(qty * 0.5));
  return {
    description: label,
    sku: 'LABOUR-FAB',
    qty: hours,
    unit: 'hr',
    unitCost: 55,
    margin: 42,
    unitPrice: 95,
  };
}

/**
 * Pull historical accepted line items for the current customer (or a sensible fallback)
 * and return draft lines tagged with the source quote each came from.
 *
 * Returns null when no historical quotes are available — callers fall back to the
 * generic pricing-history message in that case.
 */
function recallFromHistory(customer: string): { items: LineItemInput[]; primarySource: string } | null {
  const lowerCustomer = customer.trim().toLowerCase();
  const accepted = quotes.filter(q => q.status === 'accepted');
  // Prefer same-customer accepted quotes; otherwise fall back to all accepted quotes
  // so the demo surface always has something to show.
  const sameCustomer = accepted.filter(q => q.customerName.toLowerCase() === lowerCustomer);
  const pool = sameCustomer.length > 0 ? sameCustomer : accepted;
  if (pool.length === 0) return null;

  // Drain candidate lines, newest-quote-first, deduped by description so the recall
  // looks curated rather than just a flattened list.
  const sorted = [...pool].sort((a, b) => (a.date < b.date ? 1 : -1));
  const seen = new Set<string>();
  const recalled: LineItemInput[] = [];
  for (const quote of sorted) {
    for (const line of quote.lineItems) {
      const key = line.description.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      recalled.push({
        description: line.description,
        sku: line.productId,
        qty: line.qty,
        unit: 'each',
        unitCost: Math.round(line.unitPrice * 0.75 * 100) / 100,
        margin: 25,
        unitPrice: line.unitPrice,
        sourceQuote: quote.ref,
        sourceDate: quote.date,
        sourceCustomer: quote.customerName,
        sourceUnitPrice: line.unitPrice,
      });
      if (recalled.length >= 6) break;
    }
    if (recalled.length >= 6) break;
  }

  if (recalled.length === 0) return null;
  return { items: recalled, primarySource: sorted[0].ref };
}

const HISTORY_RECALL_REGEX = /\b(fill from history|recall pricing|recall (?:from )?history|use past pricing|historical pricing|what did we charge last time|fill from past|past pricing)\b/i;

function detectIntent(input: string, customer: string, mode: AssistantMode): AssistantResponse {
  const lower = input.toLowerCase();

  if (HISTORY_RECALL_REGEX.test(input)) {
    const recall = recallFromHistory(customer);
    if (recall) {
      return {
        type: 'line-items',
        title: `AI populated ${recall.items.length} lines from ${recall.primarySource} history`,
        body: `Pulled from accepted quotes for ${customer || 'this customer'}. Each line shows the source quote it was recalled from — open the badge to see the original date and price.`,
        items: recall.items,
      };
    }
  }

  if (mode === 'margins' || (lower.includes('margin') && /\d+/.test(lower))) {
    const match = lower.match(/(\d+)/);
    const margin = match ? parseInt(match[1]) : 25;
    return {
      type: 'margin',
      title: `Apply ${margin}% margin to all items`,
      body: `This will recalculate all line item prices using a ${margin}% margin. Review the updated totals before confirming.`,
      margin,
    };
  }

  if (mode === 'delivery' || lower.includes('deliver') || lower.includes('ctp') || lower.includes('lead time') || /by\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(lower)) {
    return {
      type: 'ctp',
      title: 'Delivery estimate',
      body: '78% confidence for delivery by May 12, 2026. Earliest possible: May 8. Current bottleneck: Welding Bay (85% utilised in April). Recommend scheduling laser cut by April 18 to meet timeline.',
    };
  }

  if (mode === 'history' || lower.includes('last time') || lower.includes('history') || lower.includes('previous')) {
    const name = customer || 'this customer';
    return {
      type: 'history',
      title: `Pricing history for ${name}`,
      body: `Last accepted quote: Q-2026-0144 — $28,000 (Feb 2026). 20× Control Panel Enclosures at $420/ea, 40× Aluminium Panels at $145/ea. Typical margin: 22–28%. Average days to accept: 12.`,
    };
  }

  if (lower.includes('similar') || lower.includes('clone')) {
    return {
      type: 'similar',
      title: 'Similar past quotes',
      body: 'Found 2 similar quotes:\n\n• Q-2026-0055 — TechCorp Industries — $42,000 (Server Racks + Brackets) — Status: Sent\n• QT-2026-0144 — TechCorp Industries — $28,000 (Enclosures + Panels) — Status: Accepted',
      };
  }

  // Default: line item suggestion (realistic product names — not the raw prompt text)
  const parsedQty = parseQuoteQuantity(input, lower);
  const primary = mockPrimaryLineFromPrompt(input, lower, parsedQty);
  const labour = mockFabricationLabourLine(lower, parsedQty);

  return {
    type: 'line-items',
    title: 'Draft line items ready for review',
    body: `Based on your request, here are draft line items ready for review before they are added to the quote:`,
    items: [primary, labour],
  };
}

// ── Component ─────────────────────────────────────────────────────────

export function QuoteAssistantBar({ customer, lines, onQueueLinesForReview, onUpdateMargins }: QuoteAssistantBarProps) {
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [mode, setMode] = useState<AssistantMode>('generate');

  const modeConfig = MODE_CONFIG[mode];
  const chips = useMemo(() => {
    if (!customer) return ['Select a customer first'];

    const contextChips = [...modeConfig.suggestions];
    if (mode === 'history') {
      contextChips.unshift(`Show ${customer} pricing history`);
    }
    if (mode === 'delivery' && lines.length > 0) {
      contextChips.push('Can we deliver by May 12, 2026?');
    }
    if (mode === 'margins' && lines.length > 0) {
      contextChips.push('Apply 22% margin to all');
    }
    if (mode === 'generate' && lines.length === 0) {
      contextChips.push('Generate line items from the customer RFQ');
    }
    return contextChips;
  }, [customer, lines.length, mode, modeConfig.suggestions]);

  const handleSubmit = useCallback(() => {
    if (!input.trim()) return;
    setIsThinking(true);
    setResponse(null);

    setTimeout(() => {
      const result = detectIntent(input, customer, mode);
      setResponse(result);
      setIsThinking(false);
    }, 800);
  }, [input, customer, mode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChipClick = (prompt: string) => {
    setInput(prompt);
    setIsThinking(true);
    setResponse(null);
    setTimeout(() => {
      setResponse(detectIntent(prompt, customer, mode));
      setIsThinking(false);
    }, 800);
  };

  const handleDismiss = () => {
    setResponse(null);
    setInput('');
  };

  const responseIcon = {
    'line-items': Plus,
    'history': Clock,
    'ctp': Calendar,
    'margin': TrendingUp,
    'similar': Copy,
  };

  const responseTone = response?.type === 'ctp'
    ? 'opportunity'
    : response?.type === 'margin'
      ? 'success'
      : response?.type === 'line-items'
        ? 'neutral'
        : 'opportunity';

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {(Object.entries(MODE_CONFIG) as [AssistantMode, typeof MODE_CONFIG[AssistantMode]][]).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const active = key === mode;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setMode(key);
                setResponse(null);
              }}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                active
                  ? 'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-50)] text-[var(--mw-yellow-700)]'
                  : 'border-[var(--border)] bg-card text-[var(--neutral-500)] hover:bg-[var(--neutral-50)] hover:text-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Input bar */}
      <BorderGlow
        borderRadius={24}
        edgeSensitivity={10}
        glowRadius={18}
        glowIntensity={0.15}
        coneSpread={30}
        fillOpacity={0.1}
        perimeter="uniform"
        animated={false}
        className="bg-card"
      >
        <div className="flex items-center gap-2 px-3 py-1.5">
          <AgentLogomark size={18} className="shrink-0" />
          <Badge className="border-0 bg-[var(--neutral-100)] text-[var(--neutral-500)] text-[10px] px-1.5 py-0 shrink-0">
            {modeConfig.promptLabel}
          </Badge>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={customer ? modeConfig.placeholder : 'Select a customer to enable MirrorWorks Agent'}
            disabled={!customer}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-[var(--neutral-400)] outline-none h-8 disabled:opacity-50"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSubmit}
            disabled={!input.trim() || !customer || isThinking}
            className="h-7 w-7 p-0 shrink-0"
          >
            <Send className={cn('w-3.5 h-3.5', isThinking ? 'animate-pulse text-[var(--mw-yellow-500)]' : 'text-[var(--neutral-500)]')} />
          </Button>
        </div>
      </BorderGlow>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-1.5">
        {chips.map(chip => (
          <button
            key={chip}
            onClick={() => chip !== 'Select a customer first' && handleChipClick(chip)}
            disabled={chip === 'Select a customer first'}
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
              chip === 'Select a customer first'
                ? 'bg-[var(--neutral-100)] text-[var(--neutral-400)] cursor-default'
                : 'bg-[var(--mw-yellow-50)] text-[var(--mw-yellow-700)] hover:bg-[var(--mw-yellow-100)] cursor-pointer',
            )}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Thinking indicator */}
      <AnimatePresence>
        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 px-3 py-2"
          >
            <div className="h-4 w-4 animate-spin rounded-full border border-[var(--neutral-200)] border-t-[var(--mw-yellow-400)]" />
            <span className="text-xs text-[var(--neutral-500)]">Thinking...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Response card */}
      <AnimatePresence>
        {response && !isThinking && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
          >
            <MirrorWorksAgentCard
              title={response.title}
              suggestion={<p className="text-xs leading-relaxed whitespace-pre-line text-[var(--neutral-600)]">{response.body}</p>}
              tone={responseTone}
              primaryAction={
                response.type === 'line-items' && response.items
                  ? {
                      label: 'Send to review',
                      onClick: () => {
                        onQueueLinesForReview(response.items!);
                        handleDismiss();
                        toast.success(`Queued ${response.items!.length} draft items for review`);
                      },
                    }
                  : response.type === 'margin' && response.margin
                    ? {
                        label: `Apply ${response.margin}%`,
                        onClick: () => {
                          onUpdateMargins(response.margin!);
                          handleDismiss();
                          toast.success(`Applied ${response.margin}% margin to all items`);
                        },
                      }
                    : undefined
              }
              secondaryAction={{ label: 'Dismiss', onClick: handleDismiss }}
              headerAction={
                response.type === 'line-items' && response.items?.some(i => i.sourceQuote)
                  ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--mw-yellow-100)] px-2 py-0.5 text-[10px] font-semibold text-[var(--mw-yellow-700)]">
                      <Sparkles className="h-3 w-3" />
                      AI recalled
                    </span>
                  )
                  : undefined
              }
              detailContent={
                response.type === 'line-items' && response.items
                  ? (
                    <div className="space-y-2">
                      {response.items.map((item, index) => {
                        const Icon = responseIcon[response.type];
                        return (
                          <div key={`${item.description}-${index}`} className="flex items-start gap-2">
                            <Icon className="mt-0.5 h-3.5 w-3.5 text-[var(--mw-yellow-600)]" />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <p className="text-xs font-medium text-foreground">{item.description}</p>
                                {item.sourceQuote && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        className="inline-flex items-center gap-1 rounded-full bg-[var(--mw-yellow-100)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--mw-yellow-700)] hover:bg-[var(--mw-yellow-200)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mw-yellow-400)]"
                                      >
                                        <Receipt className="h-2.5 w-2.5" />
                                        Source: {item.sourceQuote}
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-[240px] text-left">
                                      <div className="space-y-0.5">
                                        <p className="font-medium text-foreground">{item.sourceQuote}</p>
                                        {item.sourceDate && (
                                          <p className="text-[11px] text-[var(--neutral-500)]">Quoted {item.sourceDate}</p>
                                        )}
                                        {item.sourceCustomer && (
                                          <p className="text-[11px] text-[var(--neutral-500)]">{item.sourceCustomer}</p>
                                        )}
                                        {typeof item.sourceUnitPrice === 'number' && (
                                          <p className="text-[11px] text-[var(--neutral-600)]">
                                            Unit price at time: ${item.sourceUnitPrice.toFixed(2)}
                                          </p>
                                        )}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                              <p className="text-[11px] text-[var(--neutral-500)]">
                                {item.qty} {item.unit} · ${item.unitPrice.toFixed(2)} each
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                  : response.type === 'margin'
                    ? <p>Recalculate every current line using the new margin, then review totals before sending.</p>
                    : undefined
              }
              evidenceLevel={response.type === 'line-items' || response.type === 'margin' ? 'expandable' : 'hidden'}
              detailLabel={response.type === 'line-items' ? 'Draft lines' : 'Impact'}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
