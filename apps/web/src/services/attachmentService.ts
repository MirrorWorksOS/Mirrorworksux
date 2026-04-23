/**
 * attachmentService — provides file artifacts (quote PDFs, invoice PDFs,
 * signed quotes, delivery notes, proof-of-delivery) to the portal and
 * internal document detail pages.
 *
 * Mock-backed: PDFs are generated on-the-fly as tiny vector PDFs (a
 * minimal PDF-1.4 document with a single text page) and returned as data
 * URLs. Real impl = signed S3/Supabase URL.
 *
 * Generated files are cached per entity so subsequent downloads are
 * stable.
 */

import type {
  Attachment,
  AttachmentEntityType,
  AttachmentKind,
} from '@/types/entities';

// ── Mock store ────────────────────────────────────────────────

const STORE: Attachment[] = [];

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Build a tiny valid PDF-1.4 file with a single page and short text payload.
 * Keeps us honest: the browser will actually render it as a PDF, not a text blob.
 *
 * Returns a base64 data URL.
 */
function buildMockPdf(title: string, bodyLines: string[]): {
  dataUrl: string;
  sizeBytes: number;
} {
  const safe = (s: string) =>
    s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const textCmds = [
    'BT',
    '/F1 18 Tf',
    '72 760 Td',
    `(${safe(title)}) Tj`,
    '/F1 11 Tf',
    '0 -28 Td',
    ...bodyLines.flatMap((line) => [
      `(${safe(line)}) Tj`,
      '0 -16 Td',
    ]),
    'ET',
  ].join('\n');
  const contentStream = `<< /Length ${textCmds.length} >>\nstream\n${textCmds}\nendstream`;
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    '2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj',
    `4 0 obj\n${contentStream}\nendobj`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
  ];
  const header = '%PDF-1.4\n';
  let offset = header.length;
  const offsets: number[] = [];
  const body = objects
    .map((obj) => {
      offsets.push(offset);
      const withNewline = `${obj}\n`;
      offset += withNewline.length;
      return withNewline;
    })
    .join('');
  const xrefStart = offset;
  const xref = [
    `xref`,
    `0 ${objects.length + 1}`,
    '0000000000 65535 f ',
    ...offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n `),
  ].join('\n');
  const trailer = `\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  const pdf = header + body + xref + trailer;
  const bytes = new TextEncoder().encode(pdf);
  const b64 =
    typeof window !== 'undefined' && typeof window.btoa === 'function'
      ? window.btoa(String.fromCharCode(...bytes))
      : Buffer.from(bytes).toString('base64');
  return {
    dataUrl: `data:application/pdf;base64,${b64}`,
    sizeBytes: bytes.length,
  };
}

export const attachmentService = {
  /** List attachments visible to the customer for a given entity. */
  list(
    entityType: AttachmentEntityType,
    entityId: string,
    opts: { customerVisibleOnly?: boolean } = {},
  ): Attachment[] {
    return STORE.filter(
      (a) =>
        a.entityType === entityType &&
        a.entityId === entityId &&
        (!opts.customerVisibleOnly || a.customerVisible),
    );
  },

  /**
   * Get-or-create an attachment of a particular kind. Idempotent: repeated
   * calls return the same attachment.
   */
  getOrCreate(input: {
    entityType: AttachmentEntityType;
    entityId: string;
    kind: AttachmentKind;
    title: string;
    lines?: string[];
    filename?: string;
    customerVisible?: boolean;
    generatedBy?: 'system' | 'customer' | 'internal';
  }): Attachment {
    const existing = STORE.find(
      (a) =>
        a.entityType === input.entityType &&
        a.entityId === input.entityId &&
        a.kind === input.kind,
    );
    if (existing) return existing;
    const pdf = buildMockPdf(
      input.title,
      input.lines ?? [
        `Document generated ${new Date().toLocaleString('en-AU')}.`,
        'This is a demo artifact — production PDFs will be signed S3 URLs.',
      ],
    );
    const filename =
      input.filename ??
      `${input.kind}-${input.entityId}.pdf`.replace(/\s+/g, '-');
    const att: Attachment = {
      id: `att-${Math.random().toString(36).slice(2, 10)}`,
      entityType: input.entityType,
      entityId: input.entityId,
      kind: input.kind,
      filename,
      mimeType: 'application/pdf',
      sizeBytes: pdf.sizeBytes,
      url: pdf.dataUrl,
      generatedBy: input.generatedBy ?? 'system',
      generatedAt: nowIso(),
      customerVisible: input.customerVisible ?? true,
    };
    STORE.push(att);
    return att;
  },

  /** Trigger a browser download for an attachment (client-only). */
  triggerDownload(attachment: Attachment): void {
    if (typeof document === 'undefined') return;
    const a = document.createElement('a');
    a.href = attachment.url;
    a.download = attachment.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },

  /** Open an attachment in a new tab (for viewing without downloading). */
  openInNewTab(attachment: Attachment): void {
    if (typeof window === 'undefined') return;
    window.open(attachment.url, '_blank', 'noopener,noreferrer');
  },
};

// ── Kind-specific convenience builders ─────────────────────────

/**
 * Build (or fetch cached) quote PDF, populated with enough detail for the
 * customer to eyeball the numbers.
 */
export function getQuotePdf(args: {
  quoteId: string;
  quoteRef: string;
  customerCompany: string;
  lines: { description: string; qty: number; unitPrice: number }[];
  total: number;
  expiryDate: string;
}): Attachment {
  const lines: string[] = [
    `Quote:        ${args.quoteRef}`,
    `Customer:     ${args.customerCompany}`,
    `Valid until:  ${args.expiryDate}`,
    '',
    'Line items:',
    ...args.lines.map(
      (l, i) =>
        `${i + 1}. ${l.description.slice(0, 48).padEnd(48)}  ${l.qty} x ${formatAud(l.unitPrice)}`,
    ),
    '',
    `Total (ex GST):  ${formatAud(args.total)}`,
    '',
    'Thank you for the opportunity to quote.',
    'Please reply via the portal to accept or decline.',
  ];
  return attachmentService.getOrCreate({
    entityType: 'quote',
    entityId: args.quoteId,
    kind: 'quote_pdf',
    title: `Quote ${args.quoteRef}`,
    lines,
    filename: `${args.quoteRef}.pdf`,
    generatedBy: 'system',
  });
}

export function getSignedQuotePdf(args: {
  quoteId: string;
  quoteRef: string;
  acceptedBy: string;
  acceptedAt: string;
}): Attachment {
  return attachmentService.getOrCreate({
    entityType: 'quote',
    entityId: args.quoteId,
    kind: 'signed_quote',
    title: `Signed quote ${args.quoteRef}`,
    lines: [
      `Quote:        ${args.quoteRef}`,
      `Accepted by:  ${args.acceptedBy}`,
      `Accepted at:  ${new Date(args.acceptedAt).toLocaleString('en-AU')}`,
      '',
      'This e-signature acceptance is recorded on the quote audit trail.',
      'A signed PDF artifact would be attached here in production.',
    ],
    filename: `${args.quoteRef}-signed.pdf`,
    generatedBy: 'customer',
  });
}

export function getInvoicePdf(args: {
  invoiceId: string;
  invoiceNumber: string;
  customerCompany: string;
  amount: number;
  dueDate: string;
  status: string;
}): Attachment {
  return attachmentService.getOrCreate({
    entityType: 'invoice',
    entityId: args.invoiceId,
    kind: 'invoice_pdf',
    title: `Invoice ${args.invoiceNumber}`,
    lines: [
      `Invoice #:    ${args.invoiceNumber}`,
      `Bill to:      ${args.customerCompany}`,
      `Due:          ${args.dueDate}`,
      `Status:       ${args.status}`,
      '',
      `Amount due:   ${formatAud(args.amount)}`,
      '',
      'Pay online via the portal, or remit via EFT.',
    ],
    filename: `${args.invoiceNumber}.pdf`,
    generatedBy: 'system',
  });
}

export function getDeliveryNotePdf(args: {
  shipmentId: string;
  shipmentNumber: string;
  orderNumber: string;
  carrier: string;
  trackingNumber?: string;
  customerCompany: string;
  packages: number;
  weightKg: number;
}): Attachment {
  return attachmentService.getOrCreate({
    entityType: 'shipment',
    entityId: args.shipmentId,
    kind: 'delivery_note',
    title: `Delivery note ${args.shipmentNumber}`,
    lines: [
      `Shipment:     ${args.shipmentNumber}`,
      `Order:        ${args.orderNumber}`,
      `Customer:     ${args.customerCompany}`,
      `Carrier:      ${args.carrier}`,
      `Tracking:     ${args.trackingNumber ?? 'Not yet assigned'}`,
      `Packages:     ${args.packages}`,
      `Weight:       ${args.weightKg} kg`,
      '',
      'Signature on delivery required for goods over 20kg.',
    ],
    filename: `${args.shipmentNumber}-delivery.pdf`,
    generatedBy: 'system',
  });
}

function formatAud(value: number): string {
  return value.toLocaleString('en-AU', {
    style: 'currency',
    currency: 'AUD',
  });
}
