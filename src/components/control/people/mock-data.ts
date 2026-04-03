import type { ActivityEvent, Group, GroupPermissionSet, ModuleKey, PermissionLabelEntry, User } from './types';

export const moduleLabels: Record<ModuleKey, string> = {
  sell: 'Sell',
  plan: 'Plan',
  make: 'Make',
  ship: 'Ship',
  book: 'Book',
  buy: 'Buy',
  control: 'Control',
};

export const moduleColors: Record<ModuleKey, { bg: string; text: string; dot: string }> = {
  sell: { bg: 'var(--mw-purple-50)', text: 'var(--mw-purple)', dot: 'var(--mw-purple)' },
  plan: { bg: 'var(--mw-yellow-50)', text: 'var(--mw-yellow-800)', dot: 'var(--mw-yellow-400)' },
  make: { bg: 'var(--mw-success-light)', text: 'var(--mw-success)', dot: 'var(--mw-success)' },
  ship: { bg: 'var(--mw-info-light)', text: 'var(--mw-info)', dot: 'var(--mw-info)' },
  book: { bg: 'var(--mw-error-100)', text: 'var(--mw-error)', dot: 'var(--mw-error)' },
  buy: { bg: 'var(--mw-warning-light)', text: 'var(--mw-warning)', dot: 'var(--mw-warning)' },
  control: { bg: 'var(--neutral-100)', text: 'var(--neutral-600)', dot: 'var(--neutral-500)' },
};

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@alliancemetal.com',
    role: 'team',
    status: 'active',
    modules: [
      { module: 'make', groups: ['Production', 'Quality'] },
      { module: 'plan', groups: ['Engineering'] },
    ],
    lastActive: '2 hours ago',
  },
  {
    id: '2',
    name: 'Mike Thompson',
    email: 'mike@alliancemetal.com',
    role: 'lead',
    leadModule: 'make',
    status: 'active',
    modules: [
      { module: 'make', groups: [] },
      { module: 'plan', groups: ['Scheduling'] },
      { module: 'control', groups: ['Master Data'] },
    ],
    lastActive: '15 min ago',
  },
  {
    id: '3',
    name: 'Emma Wilson',
    email: 'emma@alliancemetal.com',
    role: 'team',
    status: 'active',
    modules: [{ module: 'plan', groups: ['Scheduling', 'Costing'] }],
    lastActive: '1 hour ago',
  },
  {
    id: '4',
    name: 'David Lee',
    email: 'david@alliancemetal.com',
    role: 'lead',
    leadModule: 'sell',
    status: 'active',
    modules: [
      { module: 'sell', groups: [] },
      { module: 'control', groups: ['Master Data', 'People Admin'] },
    ],
    lastActive: '30 min ago',
  },
  {
    id: '5',
    name: 'Priya Sharma',
    email: 'priya@alliancemetal.com',
    role: 'team',
    status: 'active',
    modules: [
      { module: 'book', groups: ['Accounts Receivable'] },
      { module: 'buy', groups: ['Purchasing'] },
    ],
    lastActive: '4 hours ago',
  },
  {
    id: '6',
    name: 'James Murray',
    email: 'james@alliancemetal.com',
    role: 'team',
    status: 'invited',
    modules: [
      { module: 'make', groups: ['Production'] },
      { module: 'ship', groups: ['Warehouse'] },
    ],
    lastActive: 'Never',
  },
  {
    id: '7',
    name: 'Anh Nguyen',
    email: 'anh@alliancemetal.com',
    role: 'team',
    status: 'active',
    modules: [{ module: 'make', groups: ['Maintenance'] }],
    lastActive: '1 day ago',
  },
  {
    id: '8',
    name: 'Tom Bradshaw',
    email: 'tom@alliancemetal.com',
    role: 'team',
    status: 'deactivated',
    modules: [{ module: 'sell', groups: ['Sales'] }],
    lastActive: '3 weeks ago',
  },
];

const basePermissions: GroupPermissionSet = {
  'documents.scope': 'own',
  'quotes.create': false,
  'orders.create': false,
  'jobs.assign': false,
  'quality.approve': false,
  'maintenance.schedule': false,
  'reports.access': false,
  'settings.access': false,
};

const permissions = (overrides: Partial<GroupPermissionSet>): GroupPermissionSet => ({
  ...basePermissions,
  ...overrides,
});

export const mockGroups: Group[] = [
  // ── Sell (ARCH 00 §4.3) ──
  { id: 'g-sell-sales', module: 'sell', name: 'Sales', description: 'Quotes and order pipeline', isDefault: true, members: ['4', '8', '2'], permissions: permissions({ 'documents.scope': 'all', 'crm.access': true, 'pipeline.visibility': 'all', 'quotes.create': true, 'orders.create': true, 'reports.access': true }) },
  { id: 'g-sell-estimating', module: 'sell', name: 'Estimating', description: 'Cost estimation and pricing', isDefault: true, members: ['1', '3'], permissions: permissions({ 'quotes.create': true, 'pricing.edit': true, 'crm.access': true, 'pipeline.visibility': 'own', 'reports.access': true }) },
  { id: 'g-sell-cs', module: 'sell', name: 'Customer Service', description: 'Order updates and customer contact', isDefault: true, members: ['6'], permissions: permissions({ 'documents.scope': 'all', 'crm.access': true, 'pipeline.visibility': 'all', 'orders.create': true }) },

  // ── Plan (ARCH 00 §4.4) ──
  { id: 'g-plan-scheduling', module: 'plan', name: 'Scheduling', description: 'Capacity and sequencing', isDefault: true, members: ['2', '3'], permissions: permissions({ 'documents.scope': 'all', 'schedule.edit': true, 'budget.visibility': true, 'jobs.assign': true, 'reports.access': true }) },
  { id: 'g-plan-engineering', module: 'plan', name: 'Engineering', description: 'Routing and process planning', isDefault: true, members: ['1', '7'], permissions: permissions({ 'documents.scope': 'all', 'bom.edit': true, 'jobs.assign': true, 'intelligence_hub.access': true }) },
  { id: 'g-plan-costing', module: 'plan', name: 'Costing', description: 'Cost rollups and margin checks', isDefault: true, members: ['3'], permissions: permissions({ 'budget.visibility': true, 'reports.access': true }) },

  // ── Make (ARCH 00 §4.5) ──
  { id: 'g-make-production', module: 'make', name: 'Production', description: 'Daily production execution', isDefault: true, members: ['1', '2', '6', '7'], permissions: permissions({ 'documents.scope': 'all', 'workorders.scope': 'all', 'timers.scope': 'own', 'jobs.assign': true, 'orders.create': true }) },
  { id: 'g-make-quality', module: 'make', name: 'Quality', description: 'Inspection and non-conformance', isDefault: true, members: ['1', '3'], permissions: permissions({ 'qc.record': true, 'quality.approve': true, 'reports.access': true }) },
  { id: 'g-make-maintenance', module: 'make', name: 'Maintenance', description: 'Machine upkeep and service', isDefault: true, members: ['7'], permissions: permissions({ 'maintenance.schedule': true, 'andon.manage': true }) },
  { id: 'g-make-office', module: 'make', name: 'Office', description: 'Admin support for make workflows', isDefault: true, members: ['5', '2'], permissions: permissions({ 'reports.access': true, 'settings.access': true }) },

  // ── Ship (ARCH 00 §4.6) ──
  { id: 'g-ship-warehouse', module: 'ship', name: 'Warehouse', description: 'Pick, pack, and stock flow', isDefault: true, members: ['6', '5'], permissions: permissions({ 'documents.scope': 'all', 'orders.scope': 'all', 'manifests.create': true, 'orders.create': true }) },
  { id: 'g-ship-shipping', module: 'ship', name: 'Shipping', description: 'Carrier booking and dispatch', isDefault: true, members: ['5'], permissions: permissions({ 'documents.scope': 'all', 'orders.scope': 'all', 'carrier.config': true, 'orders.create': true, 'reports.access': true }) },
  { id: 'g-ship-cs', module: 'ship', name: 'Customer Service', description: 'Delivery updates and support', isDefault: true, members: ['1'], permissions: permissions({ 'documents.scope': 'all', 'orders.scope': 'own' }) },

  // ── Book ──
  { id: 'g-book-ar', module: 'book', name: 'Accounts Receivable', description: 'Invoices and receipts', isDefault: true, members: ['5'], permissions: permissions({ 'documents.scope': 'all', 'invoices.create': true, 'reports.access': true }) },
  { id: 'g-book-ap', module: 'book', name: 'Accounts Payable', description: 'Bills and payments', isDefault: true, members: ['5'], permissions: permissions({ 'documents.scope': 'all', 'po.approve': true, 'reports.access': true }) },
  { id: 'g-book-expenses', module: 'book', name: 'Expenses', description: 'Expense approvals and coding', isDefault: true, members: ['1', '3', '5'], permissions: permissions({ 'reports.access': true }) },

  // ── Buy ──
  { id: 'g-buy-purchasing', module: 'buy', name: 'Purchasing', description: 'Supplier ordering and terms', isDefault: true, members: ['5', '2'], permissions: permissions({ 'documents.scope': 'all', 'po.create': true, 'vendors.manage': true, 'goods_receipts.access': true, 'reports.access': true }) },
  { id: 'g-buy-receiving', module: 'buy', name: 'Receiving', description: 'Goods receipt and checks', isDefault: true, members: ['6'], permissions: permissions({ 'goods_receipts.access': true }) },
  { id: 'g-buy-accounts', module: 'buy', name: 'Accounts', description: 'Vendor bills and reconciliation', isDefault: true, members: ['5'], permissions: permissions({ 'documents.scope': 'all', 'po.approve': true, 'reports.access': true }) },

  // ── Control (ARCH 00 §4.9) ──
  {
    id: 'g-control-master-data',
    module: 'control',
    name: 'Master Data',
    description: 'Products, BOMs, locations, and machines maintainers',
    isDefault: true,
    members: ['2', '4'],
    permissions: permissions({
      'documents.scope': 'all',
      'products.manage': true,
      'boms.manage': true,
      'locations.manage': true,
      'machines.manage': true,
      'people.view': false,
      'people.manage': false,
      'workflow.manage': false,
      'settings.access': false,
      'reports.access': true,
    }),
  },
  {
    id: 'g-control-people-admin',
    module: 'control',
    name: 'People Admin',
    description: 'Office managers who onboard users',
    isDefault: true,
    members: ['4'],
    permissions: permissions({
      'documents.scope': 'own',
      'products.manage': false,
      'boms.manage': false,
      'locations.manage': false,
      'machines.manage': false,
      'people.view': true,
      'people.manage': true,
      'workflow.manage': false,
      'settings.access': false,
      'reports.access': false,
    }),
  },
];

// ── Per-module permission labels — aligned with ARCH 00 §4.3–§4.9 and each module *Settings.tsx (documents.scope is separate in GroupsTab) ──
export const modulePermissionLabels: Record<ModuleKey, PermissionLabelEntry[]> = {
  sell: [
    { key: 'crm.access', label: 'CRM access', section: 'actions', type: 'boolean' },
    { key: 'pipeline.visibility', label: 'Pipeline visibility', section: 'scope', type: 'scope' },
    { key: 'quotes.create', label: 'Create quotes', section: 'actions', type: 'boolean' },
    { key: 'invoices.create', label: 'Create invoices', section: 'actions', type: 'boolean' },
    { key: 'pricing.edit', label: 'Edit pricing', section: 'actions', type: 'boolean' },
    { key: 'settings.access', label: 'Access settings', section: 'admin', type: 'boolean' },
    { key: 'reports.access', label: 'Access reports', section: 'admin', type: 'boolean' },
  ],
  plan: [
    { key: 'schedule.edit', label: 'Edit schedule', section: 'actions', type: 'boolean' },
    { key: 'budget.visibility', label: 'Budget visibility', section: 'actions', type: 'boolean' },
    { key: 'bom.edit', label: 'Edit BOMs', section: 'actions', type: 'boolean' },
    { key: 'intelligence_hub.access', label: 'Intelligence hub', section: 'actions', type: 'boolean' },
    { key: 'jobs.assign', label: 'Assign jobs', section: 'actions', type: 'boolean' },
    { key: 'settings.access', label: 'Access settings', section: 'admin', type: 'boolean' },
    { key: 'reports.access', label: 'Access reports', section: 'admin', type: 'boolean' },
  ],
  make: [
    { key: 'workorders.scope', label: 'Work order visibility', section: 'scope', type: 'scope' },
    { key: 'timers.scope', label: 'Time clock visibility', section: 'scope', type: 'scope' },
    { key: 'qc.record', label: 'Record quality checks', section: 'actions', type: 'boolean' },
    { key: 'scrap.report', label: 'Report scrap', section: 'actions', type: 'boolean' },
    { key: 'andon.manage', label: 'Manage andon', section: 'actions', type: 'boolean' },
    { key: 'jobs.assign', label: 'Assign jobs', section: 'actions', type: 'boolean' },
    { key: 'quality.approve', label: 'Approve quality', section: 'actions', type: 'boolean' },
    { key: 'maintenance.schedule', label: 'Schedule maintenance', section: 'actions', type: 'boolean' },
    { key: 'settings.access', label: 'Access settings', section: 'admin', type: 'boolean' },
    { key: 'reports.access', label: 'Access reports', section: 'admin', type: 'boolean' },
  ],
  ship: [
    { key: 'orders.scope', label: 'Order visibility', section: 'scope', type: 'scope' },
    { key: 'manifests.create', label: 'Create manifests', section: 'actions', type: 'boolean' },
    { key: 'carrier.config', label: 'Configure carriers', section: 'actions', type: 'boolean' },
    { key: 'returns.approve', label: 'Approve returns', section: 'actions', type: 'boolean' },
    { key: 'orders.create', label: 'Create orders', section: 'actions', type: 'boolean' },
    { key: 'settings.access', label: 'Access settings', section: 'admin', type: 'boolean' },
    { key: 'reports.access', label: 'Access reports', section: 'admin', type: 'boolean' },
  ],
  book: [
    { key: 'invoices.create', label: 'Create invoices', section: 'actions', type: 'boolean' },
    { key: 'expenses.scope', label: 'Expense visibility', section: 'scope', type: 'scope' },
    { key: 'po.approve', label: 'Approve purchase orders', section: 'actions', type: 'boolean' },
    { key: 'xero.access', label: 'Xero integration', section: 'actions', type: 'boolean' },
    { key: 'settings.access', label: 'Access settings', section: 'admin', type: 'boolean' },
    { key: 'reports.access', label: 'Access reports', section: 'admin', type: 'boolean' },
  ],
  buy: [
    { key: 'requisitions.scope', label: 'Requisition visibility', section: 'scope', type: 'scope' },
    { key: 'po.create', label: 'Create purchase orders', section: 'actions', type: 'boolean' },
    { key: 'po.approve', label: 'Approve purchase orders', section: 'actions', type: 'boolean' },
    { key: 'vendors.manage', label: 'Manage suppliers', section: 'actions', type: 'boolean' },
    { key: 'goods_receipts.access', label: 'Goods receipts', section: 'actions', type: 'boolean' },
    { key: 'settings.access', label: 'Access settings', section: 'admin', type: 'boolean' },
    { key: 'reports.access', label: 'Access reports', section: 'admin', type: 'boolean' },
  ],
  control: [
    { key: 'products.manage', label: 'Manage products', section: 'actions', type: 'boolean' },
    { key: 'boms.manage', label: 'Manage BOMs', section: 'actions', type: 'boolean' },
    { key: 'locations.manage', label: 'Manage locations', section: 'actions', type: 'boolean' },
    { key: 'machines.manage', label: 'Manage machines', section: 'actions', type: 'boolean' },
    { key: 'people.view', label: 'View people', section: 'actions', type: 'boolean' },
    { key: 'people.manage', label: 'Manage people', section: 'actions', type: 'boolean' },
    { key: 'workflow.manage', label: 'Manage workflows', section: 'actions', type: 'boolean' },
    { key: 'settings.access', label: 'Access settings', section: 'admin', type: 'boolean' },
    { key: 'reports.access', label: 'Access reports', section: 'admin', type: 'boolean' },
  ],
};

export const mockActivity: ActivityEvent[] = [
  { id: 'a1', actorName: 'Mike Thompson', message: 'Sarah added to Make > Quality', timestamp: '3 days ago' },
  { id: 'a2', actorName: 'David Lee', message: 'James invited to Ship > Warehouse', timestamp: '5 days ago' },
  { id: 'a3', actorName: 'Priya Sharma', message: 'Book > Expenses permissions updated', timestamp: '1 week ago' },
];
