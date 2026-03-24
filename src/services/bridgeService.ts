/**
 * Bridge Service — mock API layer for PLAT 01 data import.
 * Set USE_MOCK = false when real Supabase endpoints are ready.
 */
import type {
  BridgeFile,
  FieldMapping,
  ImportProgress,
  ImportSummary,
  ModuleGroup,
  TeamSuggestion,
  PreviewRecord,
} from '@/types/bridge';

const USE_MOCK = true;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const uid = () => crypto.randomUUID();

// ─── Mock Generators ────────────────────────────────────────────────

function detectEntity(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('customer') || n.includes('client')) return 'customers';
  if (n.includes('product') || n.includes('part')) return 'products';
  if (n.includes('machine') || n.includes('equipment')) return 'machines';
  if (n.includes('employee') || n.includes('staff') || n.includes('team')) return 'employees';
  if (n.includes('supplier') || n.includes('vendor')) return 'suppliers';
  if (n.includes('job') || n.includes('order') || n.includes('work')) return 'jobs';
  if (n.includes('invoice') || n.includes('bill')) return 'invoices';
  return 'unknown';
}

const ENTITY_HEADERS: Record<string, string[]> = {
  customers: ['Company Name', 'Contact Name', 'Email', 'Phone', 'Address', 'City', 'State', 'Postcode', 'Notes'],
  products: ['Part Number', 'Description', 'Material', 'Unit Price', 'Weight (kg)', 'Category', 'Active'],
  employees: ['First Name', 'Last Name', 'Email', 'Role', 'Department', 'Start Date', 'Hourly Rate'],
  machines: ['Machine Name', 'Type', 'Manufacturer', 'Model', 'Year', 'Location', 'Status'],
  suppliers: ['Company', 'Contact', 'Email', 'Phone', 'Category', 'Payment Terms', 'Rating'],
  jobs: ['Job Number', 'Customer', 'Description', 'Due Date', 'Status', 'Priority', 'Estimated Hours'],
  invoices: ['Invoice #', 'Customer', 'Date', 'Due Date', 'Amount', 'Status', 'PO Number'],
  unknown: ['Column A', 'Column B', 'Column C', 'Column D'],
};

const ENTITY_SAMPLE_DATA: Record<string, Record<string, string>[]> = {
  customers: [
    { 'Company Name': 'Ace Fabrication', 'Contact Name': 'Sarah Chen', 'Email': 'sarah@acefab.com', 'Phone': '(03) 9555 1234', 'Address': '42 Industrial Dr', 'City': 'Melbourne', 'State': 'VIC', 'Postcode': '3000', 'Notes': 'Key account' },
    { 'Company Name': 'BuildRight Steel', 'Contact Name': 'Mike Torres', 'Email': 'mike@buildright.com.au', 'Phone': '(02) 8765 4321', 'Address': '18 Factory Ln', 'City': 'Sydney', 'State': 'NSW', 'Postcode': '2000', 'Notes': '' },
    { 'Company Name': 'CNC Solutions', 'Contact Name': 'Jane Park', 'Email': 'jane@cncsolutions.co', 'Phone': '(07) 3421 9876', 'Address': '7 Workshop Rd', 'City': 'Brisbane', 'State': 'QLD', 'Postcode': '4000', 'Notes': 'New client 2024' },
  ],
  products: [
    { 'Part Number': 'BKT-001', 'Description': 'Mounting bracket 90deg', 'Material': 'Mild Steel 3mm', 'Unit Price': '24.50', 'Weight (kg)': '0.85', 'Category': 'Brackets', 'Active': 'Yes' },
    { 'Part Number': 'PLT-042', 'Description': 'Base plate 200x200', 'Material': 'Stainless 304', 'Unit Price': '67.00', 'Weight (kg)': '2.10', 'Category': 'Plates', 'Active': 'Yes' },
    { 'Part Number': 'HSG-015', 'Description': 'Motor housing assembly', 'Material': 'Aluminium 6061', 'Unit Price': '185.00', 'Weight (kg)': '3.45', 'Category': 'Housings', 'Active': 'Yes' },
  ],
  employees: [
    { 'First Name': 'Sarah', 'Last Name': 'Chen', 'Email': 'sarah@company.com', 'Role': 'Sales Manager', 'Department': 'Sales', 'Start Date': '2019-03-15', 'Hourly Rate': '55.00' },
    { 'First Name': 'Mike', 'Last Name': 'Torres', 'Email': 'mike@company.com', 'Role': 'CNC Operator', 'Department': 'Production', 'Start Date': '2020-06-01', 'Hourly Rate': '42.00' },
    { 'First Name': 'Jane', 'Last Name': 'Park', 'Email': 'jane@company.com', 'Role': 'Quality Inspector', 'Department': 'QC', 'Start Date': '2021-01-10', 'Hourly Rate': '38.00' },
  ],
  unknown: [
    { 'Column A': 'Value 1', 'Column B': 'Value 2', 'Column C': 'Value 3', 'Column D': 'Value 4' },
  ],
};

const TARGET_FIELDS: Record<string, { column: string; label: string; description: string; required: boolean }[]> = {
  customers: [
    { column: 'name', label: 'Company name', description: 'Legal or trading name', required: true },
    { column: 'contact_name', label: 'Primary contact', description: 'Main contact person', required: false },
    { column: 'email', label: 'Email', description: 'Primary email address', required: false },
    { column: 'phone', label: 'Phone', description: 'Phone number', required: false },
    { column: 'address_line_1', label: 'Address', description: 'Street address', required: false },
    { column: 'city', label: 'City', description: 'City or suburb', required: false },
    { column: 'state', label: 'State', description: 'State or territory', required: false },
    { column: 'postcode', label: 'Postcode', description: 'Postal / ZIP code', required: false },
    { column: 'notes', label: 'Notes', description: 'Internal notes', required: false },
  ],
  products: [
    { column: 'part_number', label: 'Part number', description: 'Unique identifier', required: true },
    { column: 'description', label: 'Description', description: 'Part description', required: true },
    { column: 'material', label: 'Material', description: 'Primary material', required: false },
    { column: 'unit_price', label: 'Unit price', description: 'Sell price per unit', required: false },
    { column: 'weight_kg', label: 'Weight', description: 'Weight in kilograms', required: false },
    { column: 'category', label: 'Category', description: 'Product category', required: false },
    { column: 'is_active', label: 'Active', description: 'Is currently active', required: false },
  ],
  employees: [
    { column: 'first_name', label: 'First name', description: 'Given name', required: true },
    { column: 'last_name', label: 'Last name', description: 'Family name', required: true },
    { column: 'email', label: 'Email', description: 'Work email', required: false },
    { column: 'role', label: 'Role', description: 'Job title or role', required: false },
    { column: 'department', label: 'Department', description: 'Department or team', required: false },
    { column: 'start_date', label: 'Start date', description: 'Employment start', required: false },
    { column: 'hourly_rate', label: 'Hourly rate', description: 'Hourly pay rate', required: false },
  ],
};

function generateMappings(headers: string[], entityType: string): FieldMapping[] {
  const fields = TARGET_FIELDS[entityType] || [];
  const samples = (ENTITY_SAMPLE_DATA[entityType] || ENTITY_SAMPLE_DATA.unknown);

  return headers.map((header, index) => {
    const norm = header.toLowerCase().replace(/[^a-z0-9]/g, '');
    const match = fields.find((f) => {
      const ft = f.label.toLowerCase().replace(/[^a-z0-9]/g, '');
      return norm.includes(ft) || ft.includes(norm) || norm === f.column.replace(/_/g, '');
    });

    const confidence = match ? parseFloat((0.7 + Math.random() * 0.28).toFixed(2)) : null;

    return {
      id: uid(),
      sourceColumn: header,
      sourceColumnIndex: index,
      targetTable: entityType,
      targetColumn: match?.column ?? null,
      customFieldId: null,
      aiConfidence: confidence,
      aiReasoning: match ? `"${header}" matches "${match.label}" — ${match.description}` : null,
      userConfirmed: false,
      mappingStatus: match ? ('suggested' as const) : ('skipped' as const),
      sampleValues: samples.map((r) => r[header] || '—'),
    };
  });
}

function generatePreview(entityType: string): PreviewRecord[] {
  const samples = ENTITY_SAMPLE_DATA[entityType] || ENTITY_SAMPLE_DATA.unknown;
  return samples.map((data, i) => ({
    rowNumber: i + 1,
    data,
    warnings: i === 1 ? ['Phone format inconsistent'] : [],
    excluded: false,
  }));
}

// ─── Public API ─────────────────────────────────────────────────────

export const bridgeService = {
  async createSession(): Promise<{ sessionId: string }> {
    if (USE_MOCK) { await delay(300); return { sessionId: uid() }; }
    throw new Error('Not implemented');
  },

  async uploadFile(_sessionId: string, file: File): Promise<BridgeFile> {
    if (USE_MOCK) {
      await delay(600);
      const entity = detectEntity(file.name);
      const headers = ENTITY_HEADERS[entity] || ENTITY_HEADERS.unknown;
      const samples = ENTITY_SAMPLE_DATA[entity] || ENTITY_SAMPLE_DATA.unknown;
      return {
        id: uid(),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.name.endsWith('.csv') ? 'csv' : file.name.endsWith('.xls') ? 'xls' : 'xlsx',
        detectedEntityType: entity,
        headers,
        sampleData: samples,
        rowCount: Math.floor(Math.random() * 180) + 20,
        analysisStatus: 'pending',
      };
    }
    throw new Error('Not implemented');
  },

  async analyseFile(_sessionId: string, file: BridgeFile): Promise<BridgeFile> {
    if (USE_MOCK) {
      await delay(1500);
      return { ...file, analysisStatus: 'complete' };
    }
    throw new Error('Not implemented');
  },

  async triggerAIMatch(_sessionId: string, file: BridgeFile): Promise<FieldMapping[]> {
    if (USE_MOCK) {
      await delay(2000);
      return generateMappings(file.headers, file.detectedEntityType || 'unknown');
    }
    throw new Error('Not implemented');
  },

  async saveMappings(_sessionId: string, _mappings: Record<string, FieldMapping[]>): Promise<void> {
    if (USE_MOCK) { await delay(400); return; }
    throw new Error('Not implemented');
  },

  async getPreviewRecords(_sessionId: string, entityType: string): Promise<PreviewRecord[]> {
    if (USE_MOCK) {
      await delay(600);
      return generatePreview(entityType);
    }
    throw new Error('Not implemented');
  },

  async executeImport(_sessionId: string): Promise<{ taskId: string }> {
    if (USE_MOCK) { await delay(500); return { taskId: uid() }; }
    throw new Error('Not implemented');
  },

  async pollProgress(_sessionId: string, step: number): Promise<ImportProgress | null> {
    if (USE_MOCK) {
      await delay(800);
      const entities = ['customers', 'products', 'employees'];
      if (step >= entities.length) return null;
      return { entity: entities[step], processed: (step + 1) * 35, total: 100 };
    }
    throw new Error('Not implemented');
  },

  async getImportSummary(_sessionId: string): Promise<ImportSummary> {
    if (USE_MOCK) {
      await delay(400);
      return {
        created: { customers: 42, products: 87, employees: 12 },
        flagged: { customers: 3, products: 5 },
        skipped: { customers: 1 },
        errors: {},
      };
    }
    throw new Error('Not implemented');
  },

  async suggestGroups(_sessionId: string): Promise<{
    groups: Record<string, ModuleGroup[]>;
    suggestions: TeamSuggestion[];
  }> {
    if (USE_MOCK) {
      await delay(1200);
      return {
        // Default groups per ARCH 00 §4 / PLAT 01 §14.2
        groups: {
          sell: [
            { id: uid(), module: 'sell', name: 'Sales', description: 'Account managers, business development', isDefault: true, memberCount: 0 },
            { id: uid(), module: 'sell', name: 'Estimating', description: 'Estimators, cost engineers, quoting', isDefault: true, memberCount: 0 },
            { id: uid(), module: 'sell', name: 'Customer Service', description: 'Customer queries, order tracking', isDefault: true, memberCount: 0 },
          ],
          plan: [
            { id: uid(), module: 'plan', name: 'Scheduling', description: 'Job scheduling, capacity planning', isDefault: true, memberCount: 0 },
            { id: uid(), module: 'plan', name: 'Engineering', description: 'Engineers, drafters, CAD designers', isDefault: true, memberCount: 0 },
            { id: uid(), module: 'plan', name: 'Costing', description: 'Job costing, cost analysis', isDefault: true, memberCount: 0 },
          ],
          make: [
            { id: uid(), module: 'make', name: 'Production', description: 'Shop floor operators, welders, machinists', isDefault: true, memberCount: 0 },
            { id: uid(), module: 'make', name: 'Quality', description: 'QA inspectors, quality control', isDefault: true, memberCount: 0 },
            { id: uid(), module: 'make', name: 'Maintenance', description: 'Machine maintenance, fitters', isDefault: true, memberCount: 0 },
            { id: uid(), module: 'make', name: 'Office', description: 'Production office, admin support', isDefault: true, memberCount: 0 },
          ],
          ship: [
            { id: uid(), module: 'ship', name: 'Warehouse', description: 'Storemen, warehouse operators', isDefault: true, memberCount: 0 },
            { id: uid(), module: 'ship', name: 'Shipping', description: 'Dispatch, logistics, drivers', isDefault: true, memberCount: 0 },
            { id: uid(), module: 'ship', name: 'Customer Service', description: 'Delivery queries, returns', isDefault: true, memberCount: 0 },
          ],
          book: [
            { id: uid(), module: 'book', name: 'Accounts Receivable', description: 'Invoicing, customer payments', isDefault: true, memberCount: 0 },
            { id: uid(), module: 'book', name: 'Accounts Payable', description: 'Vendor bills, supplier payments', isDefault: true, memberCount: 0 },
            { id: uid(), module: 'book', name: 'Expenses', description: 'Expense claims, petty cash', isDefault: true, memberCount: 0 },
          ],
          buy: [
            { id: uid(), module: 'buy', name: 'Purchasing', description: 'Buyers, procurement', isDefault: true, memberCount: 0 },
            { id: uid(), module: 'buy', name: 'Receiving', description: 'Goods receipts, quality checks', isDefault: true, memberCount: 0 },
            { id: uid(), module: 'buy', name: 'Accounts', description: 'Purchase ledger, vendor management', isDefault: true, memberCount: 0 },
          ],
        },
        suggestions: [
          { employeeId: uid(), employeeName: 'Sarah Chen', importedTitle: 'Sales Manager', suggestions: [{ module: 'sell', groupName: 'Sales team', groupId: '', confidence: 0.92, reasoning: 'Title "Sales Manager" matches Sell module' }] },
          { employeeId: uid(), employeeName: 'Mike Torres', importedTitle: 'CNC Operator', suggestions: [{ module: 'make', groupName: 'Shop floor', groupId: '', confidence: 0.95, reasoning: 'Title "CNC Operator" matches Make production role' }] },
          { employeeId: uid(), employeeName: 'Jane Park', importedTitle: 'Quality Inspector', suggestions: [{ module: 'make', groupName: 'Quality', groupId: '', confidence: 0.88, reasoning: 'Title "Quality Inspector" matches QC group' }] },
        ],
      };
    }
    throw new Error('Not implemented');
  },

  async saveGroupAssignments(_sessionId: string, _assignments: Record<string, string[]>): Promise<void> {
    if (USE_MOCK) { await delay(400); return; }
    throw new Error('Not implemented');
  },

  /** Get target field options for a given entity type */
  getTargetFields(entityType: string) {
    return (TARGET_FIELDS[entityType] || []).map((f) => ({
      table: entityType,
      column: f.column,
      label: f.label,
      description: f.description,
      type: 'string',
      required: f.required,
      group: f.required ? ('required' as const) : ('optional' as const),
    }));
  },
};
