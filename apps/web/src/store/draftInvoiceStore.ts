/**
 * Draft Invoice Store — zustand state for invoices auto-drafted from
 * delivered shipments. Lets ShipTracking push an entry that BookInvoices
 * can read without prop drilling.
 */
import { create } from 'zustand';

export type DraftInvoiceStatus = 'draft';

export interface DraftInvoice {
  id: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  status: DraftInvoiceStatus;
  total: number;
  balanceDue: number;
  jobReference?: string;
  sourceShipment?: string;
}

interface DraftInvoiceState {
  drafts: DraftInvoice[];
  lastSeq: number;
  addFromShipment: (input: {
    shipment: string;
    customer: string;
    amount: number;
  }) => DraftInvoice;
}

// Continue from the highest existing INV-2026-XXXX in the mock data
// (sellInvoices.ts shows numbers up to 0240). 0451 leaves headroom and
// matches the toast example in the spec.
const STARTING_SEQ = 450;

const pad4 = (n: number) => n.toString().padStart(4, '0');

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export const useDraftInvoiceStore = create<DraftInvoiceState>((set, get) => ({
  drafts: [],
  lastSeq: STARTING_SEQ,
  addFromShipment: ({ shipment, customer, amount }) => {
    const seq = get().lastSeq + 1;
    const now = new Date();
    const due = new Date(now);
    due.setDate(due.getDate() + 30);
    const draft: DraftInvoice = {
      id: `INV-2026-${pad4(seq)}`,
      customer,
      issueDate: isoDate(now),
      dueDate: isoDate(due),
      status: 'draft',
      total: amount,
      balanceDue: amount,
      sourceShipment: shipment,
    };
    set((state) => ({ drafts: [draft, ...state.drafts], lastSeq: seq }));
    return draft;
  },
}));
