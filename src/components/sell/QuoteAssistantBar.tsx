/**
 * QuoteAssistantBar — Inline AI command bar for quoting context.
 * Natural language input → instant line item suggestions, pricing history,
 * CTP results, and bulk operations.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Plus, Clock, TrendingUp, Copy, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';
import { AgentLogomark } from '@/components/shared/agent/AgentLogomark';
import { BorderGlow } from '@/components/shared/surfaces/BorderGlow';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────────

interface LineItemInput {
  description: string;
  sku: string;
  qty: number;
  unit: string;
  unitCost: number;
  margin: number;
  unitPrice: number;
}

interface QuoteAssistantBarProps {
  customer: string;
  lines: { description: string; qty: number; unitCost: number; unitPrice: number }[];
  onAddLines: (items: LineItemInput[]) => void;
  onUpdateMargins: (margin: number) => void;
}

type ResponseType = 'line-items' | 'history' | 'ctp' | 'margin' | 'similar';

interface AssistantResponse {
  type: ResponseType;
  title: string;
  body: string;
  items?: LineItemInput[];
  margin?: number;
}

// ── Mock response logic ───────────────────────────────────────────────

function detectIntent(input: string, customer: string): AssistantResponse {
  const lower = input.toLowerCase();

  if (lower.includes('margin') && /\d+/.test(lower)) {
    const match = lower.match(/(\d+)/);
    const margin = match ? parseInt(match[1]) : 25;
    return {
      type: 'margin',
      title: `Apply ${margin}% margin to all items`,
      body: `This will recalculate all line item prices using a ${margin}% margin. Review the updated totals before confirming.`,
      margin,
    };
  }

  if (lower.includes('deliver') || lower.includes('ctp') || lower.includes('lead time') || /by\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(lower)) {
    return {
      type: 'ctp',
      title: 'Delivery estimate',
      body: '78% confidence for delivery by May 12, 2026. Earliest possible: May 8. Current bottleneck: Welding Bay (85% utilised in April). Recommend scheduling laser cut by April 18 to meet timeline.',
    };
  }

  if (lower.includes('last time') || lower.includes('history') || lower.includes('previous')) {
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

  // Default: line item suggestion
  const qty = (/(\d+)\s*(x|×|units?|pcs?|pieces?|each)/i.exec(lower) ?? [])[1];
  const parsedQty = qty ? parseInt(qty) : 10;

  return {
    type: 'line-items',
    title: 'Suggested line items',
    body: `Based on "${input}", here are estimated items:`,
    items: [
      { description: input.length > 50 ? input.slice(0, 50) + '…' : input, sku: '', qty: parsedQty, unit: 'each', unitCost: 45, margin: 25, unitPrice: 60 },
      { description: 'Fabrication Labour', sku: 'LABOUR-FAB', qty: Math.ceil(parsedQty * 0.5), unit: 'hr', unitCost: 55, margin: 42, unitPrice: 95 },
    ],
  };
}

// ── Component ─────────────────────────────────────────────────────────

export function QuoteAssistantBar({ customer, lines, onAddLines, onUpdateMargins }: QuoteAssistantBarProps) {
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [response, setResponse] = useState<AssistantResponse | null>(null);

  const handleSubmit = useCallback(() => {
    if (!input.trim()) return;
    setIsThinking(true);
    setResponse(null);

    setTimeout(() => {
      const result = detectIntent(input, customer);
      setResponse(result);
      setIsThinking(false);
    }, 800);
  }, [input, customer]);

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
      setResponse(detectIntent(prompt, customer));
      setIsThinking(false);
    }, 800);
  };

  const handleDismiss = () => {
    setResponse(null);
    setInput('');
  };

  // Context-aware suggestion chips
  const chips: string[] = [];
  if (!customer) {
    chips.push('Select a customer first');
  } else {
    chips.push(`Show ${customer} pricing history`);
    if (lines.length === 0) {
      chips.push('Quote like last time');
    }
    if (lines.length > 0) {
      chips.push('Apply 25% margin to all');
      chips.push('Can we deliver by next month?');
      chips.push('Compare to similar quotes');
    }
  }

  const responseIcon = {
    'line-items': Plus,
    'history': Clock,
    'ctp': Calendar,
    'margin': TrendingUp,
    'similar': Copy,
  };

  return (
    <div className="space-y-2">
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
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={customer ? `Ask about ${customer}, pricing, delivery...` : 'Select a customer to enable AI assistant'}
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
            <Card className="border border-[var(--border)] rounded-[var(--shape-lg)] p-4 space-y-3">
              <div className="flex items-start gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--mw-yellow-50)] shrink-0">
                  {(() => { const Icon = responseIcon[response.type]; return <Icon className="h-3.5 w-3.5 text-[var(--mw-yellow-600)]" />; })()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-foreground">{response.title}</h4>
                    <Badge className="bg-[var(--mw-yellow-50)] text-[var(--mw-yellow-600)] border-0 text-[10px] px-1.5 py-0">AI</Badge>
                  </div>
                  <p className="text-xs text-[var(--neutral-600)] leading-relaxed whitespace-pre-line">{response.body}</p>
                </div>
                <button onClick={handleDismiss} className="p-1 hover:bg-[var(--neutral-100)] rounded">
                  <span className="text-xs text-[var(--neutral-400)]">✕</span>
                </button>
              </div>

              {/* Line items action */}
              {response.type === 'line-items' && response.items && (
                <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
                  <Button
                    size="sm"
                    className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground gap-1.5"
                    onClick={() => { onAddLines(response.items!); handleDismiss(); toast.success(`Added ${response.items!.length} items to quote`); }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add to quote
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDismiss}>Dismiss</Button>
                </div>
              )}

              {/* Margin action */}
              {response.type === 'margin' && response.margin && (
                <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
                  <Button
                    size="sm"
                    className="bg-[var(--mw-yellow-400)] hover:bg-[var(--mw-yellow-500)] text-primary-foreground gap-1.5"
                    onClick={() => { onUpdateMargins(response.margin!); handleDismiss(); toast.success(`Applied ${response.margin}% margin to all items`); }}
                  >
                    <TrendingUp className="w-3.5 h-3.5" /> Apply {response.margin}%
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDismiss}>Dismiss</Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
