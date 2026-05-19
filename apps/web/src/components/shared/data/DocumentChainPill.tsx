import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ChevronRight, ChevronsLeftRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export type DocType =
  | 'Opportunity'
  | 'Quote'
  | 'Sales order'
  | 'Job'
  | 'Work order'
  | 'Manufacturing order'
  | 'Invoice';

export type FlowDoc = {
  label: string;
  href: string;
  docType: DocType;
};

/** Canonical mock manufacturing chain — same demo IDs across all detail pages
 *  so the chain reads coherently when the user walks OPP → Q → SO → JOB → WO → MO → INV. */
export function buildManufacturingFlow(jobId = 'JOB-2026-0015'): FlowDoc[] {
  return [
    { label: 'OPP-2026-0001', href: '/sell/opportunities/opp-001', docType: 'Opportunity' },
    { label: 'Q-2026-0055', href: '/sell/quotes/qt-001', docType: 'Quote' },
    { label: 'SO-2026-0085', href: '/sell/orders/so-001', docType: 'Sales order' },
    { label: jobId, href: `/plan/jobs/${jobId}`, docType: 'Job' },
    { label: 'WO-2026-0001', href: '#', docType: 'Work order' },
    { label: 'MO-2026-0001', href: '/make/manufacturing-orders/mo-001', docType: 'Manufacturing order' },
    { label: 'INV-2026-0234', href: '/book/invoices/inv-001', docType: 'Invoice' },
  ];
}

const SPRING = { type: 'spring' as const, stiffness: 400, damping: 32 };
const STAGGER_MS = 40;

const PILL_BASE =
  'inline-flex items-center rounded-full border text-xs tabular-nums px-2.5 py-0.5 font-medium transition-colors';
const PILL_ACTIVE =
  'border-[var(--mw-yellow-400)] bg-[var(--mw-yellow-400)] text-[var(--mw-mirage)]';
const PILL_INACTIVE =
  'border-[var(--border)] text-foreground hover:bg-[var(--neutral-50)] dark:hover:bg-[var(--neutral-800)]';

export interface DocumentChainPillProps {
  /** Full document chain in reading order. */
  flow: FlowDoc[];
  /** Label of the active doc — used to find the anchor that stays put and is highlighted. */
  activeLabel: string;
}

/**
 * Collapsible breadcrumb of related documents (OPP → Q → SO → JOB → WO → MO etc.).
 * Collapsed shows only the active anchor pill; clicking it unfurls predecessors to
 * the left and successors to the right with a staggered spring motion. Clicks
 * outside the chain (or Escape) collapse it back.
 */
export function DocumentChainPill({ flow, activeLabel }: DocumentChainPillProps) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!expanded) return;
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [expanded]);

  const activeIdx = flow.findIndex((d) => d.label === activeLabel);
  if (activeIdx === -1) {
    return <span className={`${PILL_BASE} ${PILL_ACTIVE}`}>{activeLabel}</span>;
  }
  const predecessors = flow.slice(0, activeIdx);
  const successors = flow.slice(activeIdx + 1);

  const renderSide = (docs: FlowDoc[], side: 'left' | 'right') => {
    const fromX = side === 'left' ? 8 : -8;
    return docs.map((doc, i) => {
      const distance = side === 'left' ? docs.length - i : i + 1;
      const delay = (distance - 1) * (STAGGER_MS / 1000);
      const chevron = (
        <ChevronRight
          className="h-3 w-3 shrink-0 text-[var(--neutral-400)]"
          aria-hidden
        />
      );
      const pill = (
        <Link
          to={doc.href}
          title={doc.docType}
          onClick={(e) => e.stopPropagation()}
          className={`${PILL_BASE} ${PILL_INACTIVE}`}
        >
          {doc.label}
        </Link>
      );
      return (
        <motion.span
          key={`${side}-${doc.label}`}
          initial={{ opacity: 0, x: fromX, scale: 0.92 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: fromX, scale: 0.92 }}
          transition={{ ...SPRING, delay }}
          className="inline-flex items-center gap-1"
        >
          {side === 'left' ? (
            <>
              {pill}
              {chevron}
            </>
          ) : (
            <>
              {chevron}
              {pill}
            </>
          )}
        </motion.span>
      );
    });
  };

  return (
    <span
      ref={ref}
      className="inline-flex items-center gap-1 whitespace-nowrap"
    >
      <AnimatePresence initial={false}>
        {expanded ? renderSide(predecessors, 'left') : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={expanded ? 'Collapse document flow' : 'Expand document flow'}
        className={`${PILL_BASE} ${PILL_ACTIVE} gap-1 cursor-pointer`}
      >
        <span>{activeLabel}</span>
        <motion.span
          animate={{ opacity: expanded ? 0 : 0.7, width: expanded ? 0 : 10 }}
          transition={SPRING}
          className="inline-flex items-center overflow-hidden"
          aria-hidden
        >
          <ChevronsLeftRight className="h-2.5 w-2.5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded ? renderSide(successors, 'right') : null}
      </AnimatePresence>
    </span>
  );
}
