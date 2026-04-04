// ─── MirrorWorks Master Mock Data Factory ───────────────────────────
// Interconnected records that tell a single coherent story across
// Sell → Plan → Make → Ship → Book. Every customer, job, and order
// reference traces back to the same entities.
//
// Organisation: Alliance Metal Fabrication (AMF)
// Location: Newcastle NSW, Australia
// Speciality: Sheet metal, structural steel, CNC machining, powder coat
//
// IMPORTANT: When Supabase is wired up, swap service implementations —
// this file becomes irrelevant and can be removed entirely.

import type {
  Customer,
  Product,
  Supplier,
  Employee,
  Opportunity,
  Quote,
  SalesOrder,
  SellInvoice,
  SellActivity,
  PurchaseOrder,
  Requisition,
  Bill,
  GoodsReceipt,
  Job,
  PlanTask,
  WeeklyCapacity,
  Machine,
  ManufacturingOrder,
  WorkOrder,
  Shipment,
  Carrier,
  ShippingException,
  Expense,
  JobCost,
  SystemHealth,
  KpiMetric,
  FunnelStage,
  PerformerSummary,
  QuarterlyTarget,
  ReportTemplate,
} from '@/types/entities';

// ═══════════════════════════════════════════════════════════════════════
// CUSTOMERS — 6 active accounts, consistent across all modules
// ═══════════════════════════════════════════════════════════════════════

export const customers: Customer[] = [
  {
    id: 'cust-001',
    company: 'TechCorp Industries',
    contact: 'James Hartley',
    email: 'james@techcorp.com.au',
    phone: '+61 2 9001 2345',
    address: '12 Tech Park Dr',
    city: 'Macquarie Park',
    state: 'NSW',
    postcode: '2113',
    totalRevenue: 245000,
    activeOpportunities: 3,
    status: 'active',
    notes: 'Key account — server rack & mounting bracket work. 60-day terms.',
    createdAt: '2024-06-15',
  },
  {
    id: 'cust-002',
    company: 'Pacific Fabrication',
    contact: 'Dale Nguyen',
    email: 'dale@pacificfab.com.au',
    phone: '+61 3 9422 1100',
    address: '44 Fabrication Rd',
    city: 'Dandenong',
    state: 'VIC',
    postcode: '3175',
    totalRevenue: 189000,
    activeOpportunities: 2,
    status: 'active',
    notes: 'Sub-assembly partner — repeat bracket & chassis orders.',
    createdAt: '2024-09-01',
  },
  {
    id: 'cust-003',
    company: 'Hunter Steel Co',
    contact: 'Mark Thompson',
    email: 'mark@huntersteel.com.au',
    phone: '+61 2 4000 1234',
    address: '88 Steel St',
    city: 'Newcastle',
    state: 'NSW',
    postcode: '2300',
    totalRevenue: 156000,
    activeOpportunities: 1,
    status: 'active',
    notes: 'Local supplier who also buys custom enclosures from us.',
    createdAt: '2023-02-10',
  },
  {
    id: 'cust-004',
    company: 'BHP Contractors',
    contact: 'Anika Patel',
    email: 'anika.p@bhp.com.au',
    phone: '+61 7 3100 0982',
    address: '1 BHP Way',
    city: 'Brisbane',
    state: 'QLD',
    postcode: '4000',
    totalRevenue: 98000,
    activeOpportunities: 4,
    status: 'active',
    notes: 'Large structural steel packages. Extended procurement cycle.',
    createdAt: '2025-01-20',
  },
  {
    id: 'cust-005',
    company: 'Sydney Rail Corp',
    contact: "Rebecca O'Brien",
    email: 'robrien@sydneyrail.gov.au',
    phone: '+61 2 8000 4400',
    address: '130 Elizabeth St',
    city: 'Sydney',
    state: 'NSW',
    postcode: '2000',
    totalRevenue: 67000,
    activeOpportunities: 1,
    status: 'prospect',
    notes: 'Government contract prospect — rail platform components.',
    createdAt: '2025-11-05',
  },
  {
    id: 'cust-006',
    company: 'Kemppi Australia',
    contact: 'Lars Knutsen',
    email: 'lars@kemppi.com.au',
    phone: '+61 2 9765 4321',
    address: '22 Welding Ln',
    city: 'Seven Hills',
    state: 'NSW',
    postcode: '2147',
    totalRevenue: 52000,
    activeOpportunities: 0,
    status: 'active',
    notes: 'Welding equipment supplier who orders custom machine guards.',
    createdAt: '2024-04-12',
  },
];

// ═══════════════════════════════════════════════════════════════════════
// PRODUCTS — Fabricated parts that flow through jobs & MOs
// ═══════════════════════════════════════════════════════════════════════

export const products: Product[] = [
  { id: 'prod-001', partNumber: 'BKT-001', description: 'Mounting Bracket 90° — Mild Steel', material: 'Mild Steel 3mm', unitPrice: 24.50, weightKg: 0.85, category: 'Brackets', isActive: true },
  { id: 'prod-002', partNumber: 'PLT-042', description: 'Base Plate 200×200 — Stainless 304', material: 'Stainless 304 5mm', unitPrice: 67.00, weightKg: 2.10, category: 'Plates', isActive: true },
  { id: 'prod-003', partNumber: 'HSG-015', description: 'Motor Housing Assembly', material: 'Aluminium 6061', unitPrice: 185.00, weightKg: 3.45, category: 'Housings', isActive: true },
  { id: 'prod-004', partNumber: 'SRC-100', description: 'Server Rack Chassis 42U', material: 'Cold Rolled Steel 1.6mm', unitPrice: 1250.00, weightKg: 48.0, category: 'Racks', isActive: true },
  { id: 'prod-005', partNumber: 'CTR-008', description: 'Cable Tray Support 600mm', material: 'Galvanised Steel 2mm', unitPrice: 38.00, weightKg: 1.20, category: 'Cable Management', isActive: true },
  { id: 'prod-006', partNumber: 'MGD-020', description: 'Machine Guard Assembly — CNC', material: 'Mild Steel 2mm + Polycarbonate', unitPrice: 320.00, weightKg: 8.50, category: 'Guards', isActive: true },
  { id: 'prod-007', partNumber: 'AEP-050', description: 'Aluminium Enclosure Panel — IP65', material: 'Aluminium 5052 2mm', unitPrice: 145.00, weightKg: 2.80, category: 'Enclosures', isActive: true },
  { id: 'prod-008', partNumber: 'SSP-200', description: 'Structural Steel Package — I-Beam Assembly', material: 'Grade 350 Steel', unitPrice: 4500.00, weightKg: 280.0, category: 'Structural', isActive: true },
  { id: 'prod-009', partNumber: 'RPC-010', description: 'Rail Platform Component — Handrail Section', material: 'Stainless 316 Tube', unitPrice: 890.00, weightKg: 12.0, category: 'Rail', isActive: true },
  { id: 'prod-010', partNumber: 'CPE-030', description: 'Control Panel Enclosure 600×800', material: 'Mild Steel 1.6mm + Powder Coat', unitPrice: 420.00, weightKg: 15.0, category: 'Enclosures', isActive: true },
];

// ═══════════════════════════════════════════════════════════════════════
// SUPPLIERS — Material & service providers referenced in Buy
// ═══════════════════════════════════════════════════════════════════════

export const suppliers: Supplier[] = [
  { id: 'sup-001', company: 'Hunter Steel Co', contact: 'Mark Thompson', email: 'sales@huntersteel.com.au', phone: '+61 2 4000 5678', category: 'Sheet & Plate', paymentTerms: 'Net 30', onTimePercent: 98, rating: 5 },
  { id: 'sup-002', company: 'Pacific Metals', contact: 'Greg Samuels', email: 'greg@pacificmetals.com.au', phone: '+61 3 8765 0001', category: 'Sheet & Plate', paymentTerms: 'Net 30', onTimePercent: 95, rating: 4 },
  { id: 'sup-003', company: 'Sydney Welding Supply', contact: 'Tony Russo', email: 'tony@sydwelding.com.au', phone: '+61 2 9555 8899', category: 'Consumables', paymentTerms: 'Net 14', onTimePercent: 88, rating: 4 },
  { id: 'sup-004', company: 'BHP Suppliers', contact: 'Karen Li', email: 'karen@bhpsuppliers.com.au', phone: '+61 8 2345 9999', category: 'Structural Steel', paymentTerms: 'Net 45', onTimePercent: 82, rating: 3 },
  { id: 'sup-005', company: 'Generic Parts Co', contact: 'Ben Fletcher', email: 'ben@genericparts.com.au', phone: '+61 2 4321 0000', category: 'Fasteners & Hardware', paymentTerms: 'Net 14', onTimePercent: 65, rating: 3 },
];

// ═══════════════════════════════════════════════════════════════════════
// EMPLOYEES — Team members referenced in assignments across modules
// ═══════════════════════════════════════════════════════════════════════

export const employees: Employee[] = [
  { id: 'emp-001', name: 'Sarah Chen', initials: 'SC', email: 'sarah@alliancemetal.com.au', role: 'Sales Manager', department: 'Sales', hourlyRate: 55, startDate: '2019-03-15', status: 'active', modules: [{ module: 'sell', groups: ['Sales'] }, { module: 'plan', groups: ['Scheduling'] }], lastActive: '2026-04-03T08:15:00Z' },
  { id: 'emp-002', name: 'Mike Thompson', initials: 'MT', email: 'mike@alliancemetal.com.au', role: 'Estimator / Account Manager', department: 'Sales', hourlyRate: 48, startDate: '2020-06-01', status: 'active', modules: [{ module: 'sell', groups: ['Estimating'] }], lastActive: '2026-04-03T09:00:00Z' },
  { id: 'emp-003', name: 'Emma Wilson', initials: 'EW', email: 'emma@alliancemetal.com.au', role: 'Production Planner', department: 'Planning', hourlyRate: 50, startDate: '2021-01-10', status: 'active', modules: [{ module: 'plan', groups: ['Scheduling', 'Engineering'] }], lastActive: '2026-04-03T07:45:00Z' },
  { id: 'emp-004', name: 'David Lee', initials: 'DL', email: 'david@alliancemetal.com.au', role: 'CNC Operator / Machinist', department: 'Production', hourlyRate: 42, startDate: '2020-09-14', status: 'active', modules: [{ module: 'make', groups: ['Production'] }], lastActive: '2026-04-03T06:00:00Z' },
  { id: 'emp-005', name: 'Priya Sharma', initials: 'PS', email: 'priya@alliancemetal.com.au', role: 'Procurement Officer', department: 'Purchasing', hourlyRate: 45, startDate: '2022-03-01', status: 'active', modules: [{ module: 'buy', groups: ['Purchasing'] }], lastActive: '2026-04-02T16:30:00Z' },
  { id: 'emp-006', name: 'James Murray', initials: 'JM', email: 'james@alliancemetal.com.au', role: 'Welder / Boilermaker', department: 'Production', hourlyRate: 46, startDate: '2018-11-20', status: 'active', modules: [{ module: 'make', groups: ['Production'] }], lastActive: '2026-04-03T06:15:00Z' },
  { id: 'emp-007', name: 'Anh Nguyen', initials: 'AN', email: 'anh@alliancemetal.com.au', role: 'Quality Inspector', department: 'QC', hourlyRate: 38, startDate: '2023-06-12', status: 'active', modules: [{ module: 'make', groups: ['Quality'] }], lastActive: '2026-04-03T07:00:00Z' },
  { id: 'emp-008', name: 'Tom Bradshaw', initials: 'TB', email: 'tom@alliancemetal.com.au', role: 'Warehouse / Dispatch', department: 'Logistics', hourlyRate: 35, startDate: '2024-01-08', status: 'active', modules: [{ module: 'ship', groups: ['Warehouse', 'Shipping'] }], lastActive: '2026-04-03T06:30:00Z' },
];

// ═══════════════════════════════════════════════════════════════════════
// SELL — Opportunities, Quotes, Sales Orders, Invoices, Activities
// ═══════════════════════════════════════════════════════════════════════

export const opportunities: Opportunity[] = [
  { id: 'opp-001', title: 'Server Rack Fabrication', customerId: 'cust-001', customerName: 'TechCorp Industries', value: 45000, expectedClose: '2026-04-15', assignedTo: 'emp-001', assignedToInitials: 'SC', priority: 'high', stage: 'proposal', probabilityPercent: 68, tags: ['Strategic', 'Urgent'] },
  { id: 'opp-002', title: 'Structural Steel Package', customerId: 'cust-004', customerName: 'BHP Contractors', value: 128000, expectedClose: '2026-04-30', assignedTo: 'emp-002', assignedToInitials: 'MT', priority: 'urgent', stage: 'negotiation', probabilityPercent: 55, tags: ['Export'] },
  { id: 'opp-003', title: 'Custom Brackets (50 units)', customerId: 'cust-002', customerName: 'Pacific Fabrication', value: 8500, expectedClose: '2026-03-25', assignedTo: 'emp-003', assignedToInitials: 'EW', priority: 'medium', stage: 'qualified', probabilityPercent: 40, tags: ['Repeat customer'] },
  { id: 'opp-004', title: 'Rail Platform Components', customerId: 'cust-005', customerName: 'Sydney Rail Corp', value: 67000, expectedClose: '2026-05-10', assignedTo: 'emp-004', assignedToInitials: 'DL', priority: 'high', stage: 'proposal', probabilityPercent: 62, tags: ['Strategic'] },
  { id: 'opp-005', title: 'Machine Guards', customerId: 'cust-006', customerName: 'Kemppi Australia', value: 12000, expectedClose: '2026-03-30', assignedTo: 'emp-001', assignedToInitials: 'SC', priority: 'low', stage: 'new', probabilityPercent: 25, tags: [] },
  { id: 'opp-006', title: 'Aluminium Enclosures', customerId: 'cust-003', customerName: 'Hunter Steel Co', value: 22000, expectedClose: '2026-04-05', assignedTo: 'emp-002', assignedToInitials: 'MT', priority: 'medium', stage: 'new', probabilityPercent: 30, tags: ['Design assist'] },
];

export const quotes: Quote[] = [
  {
    id: 'qt-001', ref: 'Q-2026-0055', opportunityId: 'opp-001', customerId: 'cust-001', customerName: 'TechCorp Industries',
    date: '2026-03-12', expiryDate: '2026-04-12', value: 42000, status: 'sent',
    lineItems: [
      { productId: 'prod-004', description: 'Server Rack Chassis 42U', qty: 8, unitPrice: 1250, total: 10000 },
      { productId: 'prod-001', description: 'Mounting Bracket 90°', qty: 200, unitPrice: 24.50, total: 4900 },
      { productId: 'prod-002', description: 'Base Plate 200×200', qty: 50, unitPrice: 67, total: 3350 },
    ],
  },
  {
    id: 'qt-002', ref: 'Q-2026-0048', opportunityId: 'opp-001', customerId: 'cust-001', customerName: 'TechCorp Industries',
    date: '2026-02-28', expiryDate: '2026-03-28', value: 12500, status: 'draft',
    lineItems: [
      { productId: 'prod-001', description: 'Mounting Bracket 90°', qty: 100, unitPrice: 24.50, total: 2450 },
      { productId: 'prod-003', description: 'Motor Housing Assembly', qty: 20, unitPrice: 185, total: 3700 },
    ],
  },
  {
    id: 'qt-003', ref: 'QT-2026-0142', opportunityId: 'opp-002', customerId: 'cust-004', customerName: 'BHP Contractors',
    date: '2026-03-18', expiryDate: '2026-04-18', value: 12500, status: 'sent',
    lineItems: [
      { productId: 'prod-008', description: 'Structural Steel Package — I-Beam', qty: 2, unitPrice: 4500, total: 9000 },
    ],
  },
  {
    id: 'qt-004', ref: 'QT-2026-0143', opportunityId: 'opp-003', customerId: 'cust-003', customerName: 'Hunter Steel Co',
    date: '2026-03-19', expiryDate: '2026-04-19', value: 3500, status: 'sent',
    lineItems: [
      { productId: 'prod-007', description: 'Aluminium Enclosure Panel — IP65', qty: 20, unitPrice: 145, total: 2900 },
    ],
  },
];

export const salesOrders: SalesOrder[] = [
  { id: 'so-001', orderNumber: 'SO-2026-0085', customerId: 'cust-001', customerName: 'TechCorp Industries', quoteId: 'qt-001', date: '2026-03-01', deliveryDate: '2026-04-15', status: 'in_production', total: 24500, jobId: 'job-001' },
  { id: 'so-002', orderNumber: 'SO-2026-0086', customerId: 'cust-002', customerName: 'Pacific Fabrication', date: '2026-03-05', deliveryDate: '2026-04-01', status: 'in_production', total: 8500, jobId: 'job-002' },
  { id: 'so-003', orderNumber: 'SO-2026-0087', customerId: 'cust-005', customerName: 'Sydney Rail Corp', date: '2026-03-08', deliveryDate: '2026-04-28', status: 'confirmed', total: 35600, jobId: 'job-003' },
  { id: 'so-004', orderNumber: 'SO-2026-0088', customerId: 'cust-006', customerName: 'Kemppi Australia', date: '2026-02-20', deliveryDate: '2026-03-20', status: 'shipped', total: 12000, jobId: 'job-004' },
  { id: 'so-005', orderNumber: 'SO-2026-0089', customerId: 'cust-002', customerName: 'Pacific Fabrication', date: '2026-03-15', deliveryDate: '2026-04-20', status: 'confirmed', total: 8900 },
];

export const sellInvoices: SellInvoice[] = [
  { id: 'inv-001', invoiceNumber: 'INV-2026-0234', customerId: 'cust-001', customerName: 'TechCorp Industries', salesOrderId: 'so-001', date: '2026-03-01', dueDate: '2026-03-15', amount: 12400, paidAmount: 0, status: 'overdue' },
  { id: 'inv-002', invoiceNumber: 'INV-2026-0198', customerId: 'cust-005', customerName: 'Sydney Rail Corp', date: '2026-02-25', dueDate: '2026-03-25', amount: 4800, paidAmount: 0, status: 'overdue' },
  { id: 'inv-003', invoiceNumber: 'INV-2026-0230', customerId: 'cust-002', customerName: 'Pacific Fabrication', date: '2026-03-10', dueDate: '2026-04-10', amount: 8500, paidAmount: 8500, status: 'paid' },
  { id: 'inv-004', invoiceNumber: 'INV-2026-0225', customerId: 'cust-003', customerName: 'Hunter Steel Co', date: '2026-03-05', dueDate: '2026-04-05', amount: 15600, paidAmount: 15600, status: 'paid' },
  { id: 'inv-005', invoiceNumber: 'INV-2026-0240', customerId: 'cust-006', customerName: 'Kemppi Australia', salesOrderId: 'so-004', date: '2026-03-20', dueDate: '2026-04-20', amount: 12000, paidAmount: 0, status: 'sent' },
];

export const sellActivities: SellActivity[] = [
  { id: 'act-001', type: 'email', description: 'Sent revised quote v2 — updated material costs', opportunityId: 'opp-001', opportunityTitle: 'Server Rack Fabrication', customerId: 'cust-001', assignedTo: 'emp-001', dueDate: '2026-04-03T10:00:00Z', status: 'completed' },
  { id: 'act-002', type: 'call', description: 'Discussed lead time concerns re: steel delivery', opportunityId: 'opp-001', opportunityTitle: 'Server Rack Fabrication', customerId: 'cust-001', assignedTo: 'emp-001', dueDate: '2026-04-02T14:00:00Z', status: 'completed' },
  { id: 'act-003', type: 'meeting', description: 'Site visit to review installation requirements', opportunityId: 'opp-002', opportunityTitle: 'Structural Steel Package', customerId: 'cust-004', assignedTo: 'emp-002', dueDate: '2026-03-31T09:00:00Z', status: 'completed' },
  { id: 'act-004', type: 'task', description: 'Follow up on quote acceptance', opportunityId: 'opp-001', opportunityTitle: 'Server Rack Fabrication', customerId: 'cust-001', assignedTo: 'emp-001', dueDate: '2026-04-04T10:00:00Z', status: 'scheduled' },
  { id: 'act-005', type: 'call', description: 'Pricing review call with procurement team', opportunityId: 'opp-004', opportunityTitle: 'Rail Platform Components', customerId: 'cust-005', assignedTo: 'emp-004', dueDate: '2026-04-05T11:00:00Z', status: 'scheduled' },
  { id: 'act-006', type: 'email', description: 'Send machine guard technical drawings', opportunityId: 'opp-005', opportunityTitle: 'Machine Guards', customerId: 'cust-006', assignedTo: 'emp-001', dueDate: '2026-03-28T09:00:00Z', status: 'overdue' },
];

// ═══════════════════════════════════════════════════════════════════════
// BUY — Purchase Orders, Requisitions, Bills
// ═══════════════════════════════════════════════════════════════════════

export const purchaseOrders: PurchaseOrder[] = [
  { id: 'po-001', poNumber: 'PO-2026-0089', supplierId: 'sup-001', supplierName: 'Hunter Steel Co', date: '2026-03-15', deliveryDate: '2026-03-25', status: 'acknowledged', total: 12400, received: 0, jobId: 'job-001' },
  { id: 'po-002', poNumber: 'PO-2026-0088', supplierId: 'sup-002', supplierName: 'Pacific Metals', date: '2026-03-12', deliveryDate: '2026-03-22', status: 'partial', total: 8500, received: 4200, jobId: 'job-002' },
  { id: 'po-003', poNumber: 'PO-2026-0087', supplierId: 'sup-003', supplierName: 'Sydney Welding Supply', date: '2026-03-10', deliveryDate: '2026-03-20', status: 'received', total: 3200, received: 3200 },
  { id: 'po-004', poNumber: 'PO-2026-0086', supplierId: 'sup-004', supplierName: 'BHP Suppliers', date: '2026-03-08', deliveryDate: '2026-03-18', status: 'sent', total: 28000, received: 0, jobId: 'job-003' },
  { id: 'po-005', poNumber: 'PO-2026-DRAFT-01', supplierId: 'sup-005', supplierName: 'Generic Parts Co', date: '2026-03-19', deliveryDate: '2026-03-29', status: 'draft', total: 4500, received: 0 },
];

export const requisitions: Requisition[] = [
  { id: 'req-001', reqNumber: 'REQ-2026-0089', requestorId: 'emp-005', requestorName: 'Priya Sharma', date: '2026-03-18', status: 'pending_approval', items: [{ productId: 'prod-001', description: 'Mild Steel 3mm Sheet 2400×1200', qty: 10, estimatedCost: 850 }], total: 8500 },
  { id: 'req-002', reqNumber: 'REQ-2026-0088', requestorId: 'emp-002', requestorName: 'Mike Thompson', date: '2026-03-17', status: 'pending_approval', items: [{ productId: 'prod-005', description: 'Galvanised Steel 2mm', qty: 5, estimatedCost: 640 }], total: 3200 },
  { id: 'req-003', reqNumber: 'REQ-2026-0087', requestorId: 'emp-005', requestorName: 'Priya Sharma', date: '2026-03-16', status: 'approved', items: [{ productId: 'prod-002', description: 'Stainless 304 5mm Plate', qty: 4, estimatedCost: 1200 }], total: 4800 },
];

export const bills: Bill[] = [
  { id: 'bill-001', billNumber: 'BILL-2026-0045', supplierId: 'sup-001', supplierName: 'Hunter Steel Co', poId: 'po-001', date: '2026-03-20', dueDate: '2026-04-20', amount: 12400, paidAmount: 0, status: 'received' },
  { id: 'bill-002', billNumber: 'BILL-2026-0044', supplierId: 'sup-003', supplierName: 'Sydney Welding Supply', poId: 'po-003', date: '2026-03-22', dueDate: '2026-04-05', amount: 3200, paidAmount: 3200, status: 'paid' },
  { id: 'bill-003', billNumber: 'BILL-789', supplierId: 'sup-004', supplierName: 'BHP Suppliers', date: '2026-03-15', dueDate: '2026-03-30', amount: 1300, paidAmount: 0, status: 'overdue' },
];

export const goodsReceipts: GoodsReceipt[] = [
  {
    id: 'gr-001', receiptNumber: 'GR-2026-0034', poId: 'po-003', poNumber: 'PO-2026-0087', supplierId: 'sup-003', supplierName: 'Sydney Welding Supply', date: '2026-03-20',
    items: [{ productId: 'prod-005', description: 'Welding wire MIG 1.0mm', orderedQty: 50, receivedQty: 50, acceptedQty: 50 }],
  },
  {
    id: 'gr-002', receiptNumber: 'GR-2026-0035', poId: 'po-002', poNumber: 'PO-2026-0088', supplierId: 'sup-002', supplierName: 'Pacific Metals', date: '2026-03-22',
    items: [{ productId: 'prod-002', description: 'Stainless 304 5mm Sheet', orderedQty: 20, receivedQty: 12, acceptedQty: 12 }],
  },
];

// ═══════════════════════════════════════════════════════════════════════
// PLAN — Jobs, Tasks, Capacity
// ═══════════════════════════════════════════════════════════════════════

export const jobs: Job[] = [
  { id: 'job-001', jobNumber: 'JOB-2026-0012', title: 'Mounting Bracket Assembly', customerId: 'cust-001', customerName: 'TechCorp Industries', salesOrderId: 'so-001', status: 'in_progress', priority: 'high', startDate: '2026-03-10', dueDate: '2026-04-03', estimatedHours: 120, actualHours: 78, value: 24500, progress: 45, assignedTo: 'emp-003' },
  { id: 'job-002', jobNumber: 'JOB-2026-0011', title: 'Custom Brackets x50', customerId: 'cust-002', customerName: 'Pacific Fabrication', salesOrderId: 'so-002', status: 'in_progress', priority: 'medium', startDate: '2026-03-12', dueDate: '2026-04-01', estimatedHours: 40, actualHours: 32, value: 8500, progress: 72, assignedTo: 'emp-003' },
  { id: 'job-003', jobNumber: 'JOB-2026-0013', title: 'Cable Tray Supports — Rail', customerId: 'cust-005', customerName: 'Sydney Rail Corp', salesOrderId: 'so-003', status: 'planned', priority: 'high', startDate: '2026-03-20', dueDate: '2026-04-28', estimatedHours: 200, actualHours: 0, value: 35600, progress: 0, assignedTo: 'emp-003' },
  { id: 'job-004', jobNumber: 'JOB-2026-0010', title: 'Machine Guards — Kemppi', customerId: 'cust-006', customerName: 'Kemppi Australia', salesOrderId: 'so-004', status: 'completed', priority: 'low', startDate: '2026-02-20', dueDate: '2026-03-20', estimatedHours: 60, actualHours: 55, value: 12000, progress: 100, assignedTo: 'emp-003' },
  { id: 'job-005', jobNumber: 'JOB-2026-0015', title: 'Control Panel Enclosure', customerId: 'cust-001', customerName: 'TechCorp Industries', status: 'draft', priority: 'medium', startDate: '2026-04-05', dueDate: '2026-04-20', estimatedHours: 80, actualHours: 0, value: 31000, progress: 0, assignedTo: 'emp-003' },
];

export const planTasks: PlanTask[] = [
  { id: 'task-001', title: 'Review BOM for Job JOB-2026-0015', jobId: 'job-005', jobNumber: 'JOB-2026-0015', time: '9:00 AM', type: 'review', assignedTo: 'emp-003', completed: false },
  { id: 'task-002', title: 'Schedule laser cutting — JOB-2026-0011', jobId: 'job-002', jobNumber: 'JOB-2026-0011', time: '10:30 AM', type: 'schedule', assignedTo: 'emp-003', completed: false },
  { id: 'task-003', title: 'QC sign-off pending — JOB-2026-0012', jobId: 'job-001', jobNumber: 'JOB-2026-0012', time: '11:00 AM', type: 'qc', assignedTo: 'emp-007', completed: false },
  { id: 'task-004', title: 'Material order follow-up — JOB-2026-0013', jobId: 'job-003', jobNumber: 'JOB-2026-0013', time: '1:00 PM', type: 'purchase', assignedTo: 'emp-005', completed: false },
  { id: 'task-005', title: 'Subcontractor call — Powder Coat', time: '2:30 PM', type: 'external', assignedTo: 'emp-003', completed: false },
];

export const weeklyCapacity: WeeklyCapacity[] = [
  { week: 'Wk 12', planned: 85, actual: 72 },
  { week: 'Wk 13', planned: 90, actual: 88 },
  { week: 'Wk 14', planned: 80, actual: 75 },
  { week: 'Wk 15', planned: 95, actual: 92 },
  { week: 'Wk 16', planned: 85, actual: 0 },
];

// ═══════════════════════════════════════════════════════════════════════
// MAKE — Machines, Manufacturing Orders, Work Orders
// ═══════════════════════════════════════════════════════════════════════

export const machines: Machine[] = [
  { id: 'mach-001', name: 'Laser Cutter #1', workCenter: 'Cutting', status: 'running', currentJobId: 'job-001', currentJobNumber: 'JOB-2026-0012', operatorId: 'emp-001', operatorName: 'Sarah Chen', utilizationToday: 85 },
  { id: 'mach-002', name: 'Press Brake #2', workCenter: 'Forming', status: 'idle', utilizationToday: 42 },
  { id: 'mach-003', name: 'Welding Station A', workCenter: 'Welding', status: 'running', currentJobId: 'job-002', currentJobNumber: 'JOB-2026-0011', operatorId: 'emp-006', operatorName: 'James Murray', utilizationToday: 92 },
  { id: 'mach-004', name: 'CNC Mill #3', workCenter: 'Machining', status: 'setup', currentJobId: 'job-001', currentJobNumber: 'JOB-2026-0010', operatorId: 'emp-004', operatorName: 'David Lee', utilizationToday: 67 },
  { id: 'mach-005', name: 'Powder Coat Line', workCenter: 'Finishing', status: 'down', utilizationToday: 28 },
  { id: 'mach-006', name: 'Laser Cutter #2', workCenter: 'Cutting', status: 'maintenance', utilizationToday: 0 },
];

export const manufacturingOrders: ManufacturingOrder[] = [
  { id: 'mo-001', moNumber: 'MO-2026-0001', productId: 'prod-001', productName: 'Mounting Bracket Assembly', jobId: 'job-001', jobNumber: 'JOB-2026-0012', customerId: 'cust-001', customerName: 'TechCorp Industries', status: 'in_progress', priority: 'high', dueDate: '2026-04-15', progress: 45, workOrders: 4, operatorId: 'emp-006', operatorName: 'James Murray' },
  { id: 'mo-002', moNumber: 'MO-2026-0002', productId: 'prod-004', productName: 'Server Rack Chassis', jobId: 'job-001', jobNumber: 'JOB-2026-0012', customerId: 'cust-002', customerName: 'Pacific Fabrication', status: 'in_progress', priority: 'urgent', dueDate: '2026-04-20', progress: 22, workOrders: 6, operatorId: 'emp-004', operatorName: 'David Lee' },
  { id: 'mo-003', moNumber: 'MO-2026-0003', productId: 'prod-005', productName: 'Cable Tray Support', jobId: 'job-003', jobNumber: 'JOB-2026-0013', customerId: 'cust-005', customerName: 'Sydney Rail Corp', status: 'confirmed', priority: 'medium', dueDate: '2026-04-28', progress: 0, workOrders: 3, operatorId: 'emp-003', operatorName: 'Emma Wilson' },
  { id: 'mo-004', moNumber: 'MO-2026-0004', productId: 'prod-006', productName: 'Machine Guard Assembly', jobId: 'job-004', jobNumber: 'JOB-2026-0010', customerId: 'cust-006', customerName: 'Kemppi Australia', status: 'done', priority: 'low', dueDate: '2026-04-10', progress: 100, workOrders: 2, operatorId: 'emp-002', operatorName: 'Mike Thompson' },
  { id: 'mo-005', moNumber: 'MO-2026-0005', productId: 'prod-007', productName: 'Aluminium Enclosure Panel', jobId: 'job-005', jobNumber: 'JOB-2026-0015', customerId: 'cust-003', customerName: 'Hunter Steel Co', status: 'draft', priority: 'medium', dueDate: '2026-05-05', progress: 0, workOrders: 5, operatorId: 'emp-001', operatorName: 'Sarah Chen' },
];

export const workOrders: WorkOrder[] = [
  { id: 'wo-001', woNumber: 'WO-2026-0001', manufacturingOrderId: 'mo-001', machineId: 'mach-001', machineName: 'Laser Cutter #1', operation: 'Laser Cut blanks', sequence: 1, estimatedMinutes: 120, actualMinutes: 95, status: 'completed', operatorId: 'emp-001', operatorName: 'Sarah Chen' },
  { id: 'wo-002', woNumber: 'WO-2026-0002', manufacturingOrderId: 'mo-001', machineId: 'mach-002', machineName: 'Press Brake #2', operation: 'Bend to spec', sequence: 2, estimatedMinutes: 90, actualMinutes: 45, status: 'in_progress', operatorId: 'emp-004', operatorName: 'David Lee' },
  { id: 'wo-003', woNumber: 'WO-2026-0003', manufacturingOrderId: 'mo-001', machineId: 'mach-003', machineName: 'Welding Station A', operation: 'MIG weld assembly', sequence: 3, estimatedMinutes: 180, actualMinutes: 0, status: 'pending', operatorId: 'emp-006', operatorName: 'James Murray' },
  { id: 'wo-004', woNumber: 'WO-2026-0004', manufacturingOrderId: 'mo-001', machineId: 'mach-005', machineName: 'Powder Coat Line', operation: 'Powder coat — satin black', sequence: 4, estimatedMinutes: 60, actualMinutes: 0, status: 'pending' },
  { id: 'wo-005', woNumber: 'WO-2026-0005', manufacturingOrderId: 'mo-002', machineId: 'mach-001', machineName: 'Laser Cutter #1', operation: 'Laser Cut chassis panels', sequence: 1, estimatedMinutes: 240, actualMinutes: 120, status: 'in_progress', operatorId: 'emp-001', operatorName: 'Sarah Chen' },
  { id: 'wo-006', woNumber: 'WO-2026-0006', manufacturingOrderId: 'mo-002', machineId: 'mach-004', machineName: 'CNC Mill #3', operation: 'CNC machine mounting holes', sequence: 2, estimatedMinutes: 150, actualMinutes: 0, status: 'pending', operatorId: 'emp-004', operatorName: 'David Lee' },
];

// ═══════════════════════════════════════════════════════════════════════
// SHIP — Shipments, Carriers, Exceptions
// ═══════════════════════════════════════════════════════════════════════

export const carriers: Carrier[] = [
  { id: 'car-001', name: 'Aus Post', onTimePercent: 97, avgTransitDays: 3.2 },
  { id: 'car-002', name: 'StarTrack', onTimePercent: 95, avgTransitDays: 2.1 },
  { id: 'car-003', name: 'Toll', onTimePercent: 93, avgTransitDays: 2.5 },
  { id: 'car-004', name: 'TNT', onTimePercent: 91, avgTransitDays: 2.8 },
  { id: 'car-005', name: 'DHL', onTimePercent: 98, avgTransitDays: 1.8 },
  { id: 'car-006', name: 'Sendle', onTimePercent: 94, avgTransitDays: 3.5 },
];

export const shipments: Shipment[] = [
  { id: 'shp-001', shipmentNumber: 'SP-2026-0042', salesOrderId: 'so-004', orderNumber: 'SO-2026-0088', customerId: 'cust-006', customerName: 'Kemppi Australia', carrier: 'StarTrack', trackingNumber: 'STR984756123', stage: 'delivered', dispatchDate: '2026-03-18', estimatedDelivery: '2026-03-20', actualDelivery: '2026-03-20', weight: 17.0, packages: 2 },
  { id: 'shp-002', shipmentNumber: 'SP-2026-0043', salesOrderId: 'so-002', orderNumber: 'SO-2026-0086', customerId: 'cust-002', customerName: 'Pacific Fabrication', carrier: 'Toll', trackingNumber: 'TOL112233445', stage: 'transit', dispatchDate: '2026-04-01', estimatedDelivery: '2026-04-03', weight: 22.5, packages: 3 },
  { id: 'shp-003', shipmentNumber: 'SP-2026-0044', salesOrderId: 'so-001', orderNumber: 'SO-2026-0085', customerId: 'cust-001', customerName: 'TechCorp Industries', carrier: 'DHL', stage: 'pack', dispatchDate: '2026-04-05', estimatedDelivery: '2026-04-07', weight: 48.0, packages: 1 },
  { id: 'shp-004', shipmentNumber: 'SP-2026-0045', salesOrderId: 'so-003', orderNumber: 'SO-2026-0087', customerId: 'cust-005', customerName: 'Sydney Rail Corp', carrier: 'Toll', stage: 'pick', dispatchDate: '2026-04-10', estimatedDelivery: '2026-04-13', weight: 120.0, packages: 5 },
];

export const shippingExceptions: ShippingException[] = [
  { id: 'exc-001', shipmentId: 'shp-ext-001', shipmentNumber: 'SP270226001', customerId: 'cust-ext-001', customerName: 'Con-form Group', type: 'delay', description: 'Carrier delay — regional depot backlog', createdAt: '2026-04-03T06:00:00Z', resolved: false },
  { id: 'exc-002', shipmentId: 'shp-ext-002', shipmentNumber: 'SP260226003', customerId: 'cust-ext-002', customerName: 'Acme Steel', type: 'damage', description: 'Packaging damaged in transit — 1 of 3 boxes', createdAt: '2026-04-02T23:00:00Z', resolved: false },
  { id: 'exc-003', shipmentId: 'shp-ext-003', shipmentNumber: 'SP250226008', customerId: 'cust-003', customerName: 'Hunter Steel Co', type: 'refused', description: 'Customer refused delivery — incorrect PO reference', createdAt: '2026-04-02T09:00:00Z', resolved: false },
];

// ═══════════════════════════════════════════════════════════════════════
// BOOK — Expenses, Job Costs
// ═══════════════════════════════════════════════════════════════════════

export const expenses: Expense[] = [
  { id: 'exp-001', expenseNumber: 'EXP-2026-0142', date: '2026-03-28', description: 'Grinding discs & cutting wheels (monthly)', category: 'consumables', amount: 1250, tax: 125, submittedBy: 'emp-006', status: 'submitted', reimbursable: false, billable: false },
  { id: 'exp-002', expenseNumber: 'EXP-2026-0143', date: '2026-03-29', description: 'Site visit fuel — BHP Brisbane', category: 'travel', amount: 350, tax: 35, submittedBy: 'emp-002', status: 'submitted', reimbursable: true, billable: true, jobId: 'job-003', jobNumber: 'JOB-2026-0013' },
  { id: 'exp-003', expenseNumber: 'EXP-2026-0140', date: '2026-03-20', description: 'Replacement drill bits & taps', category: 'consumables', amount: 480, tax: 48, submittedBy: 'emp-004', status: 'approved', reimbursable: false, billable: false },
  { id: 'exp-004', expenseNumber: 'EXP-2026-0138', date: '2026-03-15', description: 'Monthly electricity', category: 'utilities', amount: 2800, tax: 280, submittedBy: 'emp-005', status: 'paid', reimbursable: false, billable: false },
];

export const jobCosts: JobCost[] = [
  { id: 'jc-001', jobId: 'job-001', jobNumber: 'JOB-2026-0012', customerId: 'cust-001', customerName: 'TechCorp Industries', quotedValue: 24500, materialCost: 8200, labourCost: 5400, overheadCost: 2100, totalCost: 15700, margin: 8800, marginPercent: 35.9 },
  { id: 'jc-002', jobId: 'job-002', jobNumber: 'JOB-2026-0011', customerId: 'cust-002', customerName: 'Pacific Fabrication', quotedValue: 8500, materialCost: 3100, labourCost: 2200, overheadCost: 900, totalCost: 6200, margin: 2300, marginPercent: 27.1 },
  { id: 'jc-003', jobId: 'job-003', jobNumber: 'JOB-2026-0013', customerId: 'cust-005', customerName: 'Sydney Rail Corp', quotedValue: 35600, materialCost: 14200, labourCost: 8800, overheadCost: 3600, totalCost: 26600, margin: 9000, marginPercent: 25.3 },
  { id: 'jc-004', jobId: 'job-004', jobNumber: 'JOB-2026-0010', customerId: 'cust-006', customerName: 'Kemppi Australia', quotedValue: 12000, materialCost: 4800, labourCost: 3200, overheadCost: 1100, totalCost: 9100, margin: 2900, marginPercent: 24.2 },
];

// ═══════════════════════════════════════════════════════════════════════
// DASHBOARD / KPI DATA
// ═══════════════════════════════════════════════════════════════════════

// ── Sell Dashboard ──────────────────────────────────────────────────

export const sellKpis: Record<string, KpiMetric> = {
  monthlyRevenue: { value: 287500, change: 12.5, trend: 'up' },
  outstandingInvoices: { value: 45800, count: 12, trend: 'neutral' },
  profitMargin: { value: 18.3, change: 2.1, trend: 'up' },
  cashFlow: { value: 156200, change: -5.2, trend: 'down' },
  overdueInvoices: { value: 18500, count: 3, trend: 'warning' },
  expensesThisMonth: { value: 42300, budget: 50000, trend: 'neutral' },
};

export const revenueByMonth = [
  { month: 'Mar', revenue: 245000, expenses: 198000 },
  { month: 'Apr', revenue: 268000, expenses: 205000 },
  { month: 'May', revenue: 291000, expenses: 218000 },
  { month: 'Jun', revenue: 278000, expenses: 212000 },
  { month: 'Jul', revenue: 255000, expenses: 195000 },
  { month: 'Aug', revenue: 282000, expenses: 208000 },
  { month: 'Sep', revenue: 269000, expenses: 201000 },
  { month: 'Oct', revenue: 298000, expenses: 225000 },
  { month: 'Nov', revenue: 275000, expenses: 210000 },
  { month: 'Dec', revenue: 260000, expenses: 200000 },
  { month: 'Jan', revenue: 283000, expenses: 215000 },
  { month: 'Feb', revenue: 287500, expenses: 220000 },
];

export const jobProfitabilityData = [
  { job: 'JOB-0012', margin: 23.1 },
  { job: 'JOB-0010', margin: 15.1 },
  { job: 'JOB-0008', margin: 18.4 },
  { job: 'JOB-0007', margin: 21.2 },
  { job: 'JOB-0006', margin: 12.8 },
  { job: 'JOB-0003', margin: 16.5 },
  { job: 'JOB-0011', margin: 6.5 },
  { job: 'JOB-0005', margin: 3.2 },
  { job: 'JOB-0004', margin: 8.9 },
  { job: 'JOB-0009', margin: -7.8 },
];

export const sellApprovalQueue = [
  { type: 'Quote', id: 'QT-2026-0142', amount: 12500, customer: 'TechCorp Industries' },
  { type: 'Sales Order', id: 'SO-2026-0089', amount: 8900, customer: 'Pacific Fab' },
  { type: 'Quote', id: 'QT-2026-0143', amount: 3500, customer: 'Hunter Steel' },
];

export const sellOverdueItems = [
  { type: 'Invoice', id: 'INV-2026-0234', customer: 'TechCorp Industries', amount: 12400, daysOverdue: 14 },
  { type: 'Invoice', id: 'INV-2026-0198', customer: 'AeroSpace Ltd', amount: 4800, daysOverdue: 7 },
  { type: 'Follow-up', id: 'OPP-0156', customer: 'BHP Contractors', value: 28000, daysOverdue: 3 },
];

export const pipelineFunnel: FunnelStage[] = [
  { stage: 'Opportunity', count: 48, value: 1420000 },
  { stage: 'Qualified', count: 32, value: 980000 },
  { stage: 'Proposal', count: 18, value: 620000 },
  { stage: 'Negotiation', count: 9, value: 385000 },
  { stage: 'Closed Won', count: 6, value: 287500 },
];

export const winLossData = { wins: 62, losses: 38 };

export const revenueTrend = [
  { month: 'Sep', revenue: 269000 },
  { month: 'Oct', revenue: 298000 },
  { month: 'Nov', revenue: 275000 },
  { month: 'Dec', revenue: 260000 },
  { month: 'Jan', revenue: 283000 },
  { month: 'Feb', revenue: 287500 },
];

export const topPerformers: PerformerSummary[] = [
  { employeeId: 'emp-001', name: 'Sarah Chen', initials: 'SC', revenue: 98500, deals: 14 },
  { employeeId: 'emp-002', name: 'Mike Thompson', initials: 'MT', revenue: 82300, deals: 11 },
  { employeeId: 'emp-003', name: 'Emma Wilson', initials: 'EW', revenue: 64200, deals: 9 },
  { employeeId: 'emp-004', name: 'David Lee', initials: 'DL', revenue: 42500, deals: 7 },
];

export const forecastChartData = [
  { month: 'Sep', actual: 269000, forecast: null },
  { month: 'Oct', actual: 298000, forecast: null },
  { month: 'Nov', actual: 275000, forecast: null },
  { month: 'Dec', actual: 260000, forecast: null },
  { month: 'Jan', actual: 283000, forecast: null },
  { month: 'Feb', actual: 287500, forecast: null },
  { month: 'Mar', actual: null, forecast: 295000 },
  { month: 'Apr', actual: null, forecast: 310000 },
  { month: 'May', actual: null, forecast: 328000 },
];

export const quarterlyTargets: QuarterlyTarget[] = [
  { quarter: 'Q1', target: 850000, current: 830500, status: 'complete' },
  { quarter: 'Q2', target: 920000, current: 287500, status: 'active' },
  { quarter: 'Q3', target: 980000, current: 0, status: 'upcoming' },
  { quarter: 'Q4', target: 1050000, current: 0, status: 'upcoming' },
];

export const sellReportTemplates: ReportTemplate[] = [
  { id: 'rpt-001', title: 'Sales Summary', description: 'Monthly overview of revenue, margins, and order volumes across all channels.', iconName: 'BarChart3', module: 'sell' },
  { id: 'rpt-002', title: 'Pipeline Report', description: 'Current pipeline stages, conversion rates, and projected close dates.', iconName: 'Target', module: 'sell' },
  { id: 'rpt-003', title: 'Activity Report', description: 'Sales team activities including calls, meetings, and follow-ups this period.', iconName: 'Clock', module: 'sell' },
  { id: 'rpt-004', title: 'Revenue by Product', description: 'Revenue breakdown by product line with year-over-year comparisons.', iconName: 'DollarSign', module: 'sell' },
  { id: 'rpt-005', title: 'Customer Analysis', description: 'Customer segmentation, lifetime value, and retention metrics.', iconName: 'Users', module: 'sell' },
  { id: 'rpt-006', title: 'Forecast Accuracy', description: 'Comparison of forecasted vs actual revenue with variance analysis.', iconName: 'TrendingUp', module: 'sell' },
];

// ── Buy Dashboard ───────────────────────────────────────────────────

export const buyKpis: Record<string, KpiMetric> = {
  openPOs: { value: 156800, count: 18 },
  pendingRequisitions: { count: 7, value: 0 },
  overdueDeliveries: { value: 28500, count: 4 },
  avgLeadTime: { value: 12 },
  spendThisMonth: { value: 89400, budget: 100000 },
  pendingBills: { value: 42300, count: 5 },
};

export const spendByCategory = [
  { category: 'Materials', amount: 45000 },
  { category: 'Subcontract', amount: 28000 },
  { category: 'Consumables', amount: 12400 },
  { category: 'Equipment', amount: 4000 },
];

export const supplierPerformance = [
  { supplier: 'Hunter Steel Co', onTime: 98 },
  { supplier: 'Pacific Metals', onTime: 95 },
  { supplier: 'Sydney Welding', onTime: 88 },
  { supplier: 'BHP Suppliers', onTime: 82 },
  { supplier: 'Generic Parts Co', onTime: 65 },
];

export const buyApprovalQueue = [
  { type: 'Requisition', id: 'REQ-2026-0089', requestor: 'Sarah Chen', value: 8500 },
  { type: 'PO', id: 'PO-2026-0234', supplier: 'Hunter Steel Co', value: 12400 },
  { type: 'Requisition', id: 'REQ-2026-0088', requestor: 'Mike Thompson', value: 3200 },
];

// ── Plan Dashboard ──────────────────────────────────────────────────

export const planKpis: Record<string, KpiMetric> = {
  activeJobs: { value: 12 },
  tasksToday: { value: 8 },
  avgLeadTime: { value: 8.5 },
  onTimeRate: { value: 92 },
};

// ── Ship Dashboard ──────────────────────────────────────────────────

export const shipKpis = {
  activeShipments: 47,
  pendingOrders: 18,
  onTimeRate: 96.2,
  avgTransit: 2.4,
  exceptions: 3,
  returns: 5,
};

export const shipPipeline: { label: string; count: number }[] = [
  { label: 'Pick', count: 6 },
  { label: 'Pack', count: 3 },
  { label: 'Ship', count: 5 },
  { label: 'Transit', count: 9 },
  { label: 'Delivered', count: 8 },
];

// ── Book Dashboard ──────────────────────────────────────────────────

export const bookKpis: Record<string, KpiMetric> = {
  monthlyRevenue: { value: 287500, change: 12.5, trend: 'up' },
  outstandingInvoices: { value: 45800, count: 12, trend: 'neutral' },
  profitMargin: { value: 18.3, change: 2.1, trend: 'up' },
  cashFlow: { value: 156200, change: -5.2, trend: 'down' },
  overdueInvoices: { value: 18500, count: 3, trend: 'warning' },
  expensesThisMonth: { value: 42300, budget: 50000, trend: 'neutral' },
};

export const bookApprovalQueue = [
  { type: 'Expense', id: 'EXP-2026-0142', amount: 1250, status: 'pending' },
  { type: 'PO', id: 'PO-2026-0089', amount: 8900, status: 'pending' },
  { type: 'Expense', id: 'EXP-2026-0143', amount: 350, status: 'pending' },
];

export const bookOverdueItems = [
  { type: 'Invoice', id: 'INV-2026-0234', customer: 'TechCorp Industries', amount: 12400, daysOverdue: 14 },
  { type: 'Invoice', id: 'INV-2026-0198', customer: 'AeroSpace Ltd', amount: 4800, daysOverdue: 7 },
  { type: 'Bill', id: 'BILL-789', vendor: 'Steel Suppliers Co', amount: 1300, daysOverdue: 3 },
];

// ── Control Dashboard ───────────────────────────────────────────────

export const systemHealth: SystemHealth = {
  totalUsers: employees.length * 3, // 24 — includes wider org
  activeUsers: 18,
  totalProducts: products.length + 146, // 156
  totalMachines: machines.length + 6, // 12
  totalSuppliers: suppliers.length + 23, // 28
  openIssues: 3,
  systemStatus: 'healthy',
};
