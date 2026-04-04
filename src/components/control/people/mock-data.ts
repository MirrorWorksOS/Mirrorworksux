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
  'settings.access': false,
  'reports.access': false,
};

const permissions = (overrides: Partial<GroupPermissionSet>): GroupPermissionSet => ({
  ...basePermissions,
  ...overrides,
});

export const mockGroups: Group[] = [
  // ── Sell (ARCH 00 §4.3) ──
  { id: 'g-sell-sales', module: 'sell', name: 'Sales', description: 'Account managers, sales reps, business development', isDefault: true, members: ['4', '8', '2'], permissions: permissions({ 'documents.scope': 'all', 'crm.access': true, 'pipeline.visibility': 'all', 'quotes.create': true }) },
  { id: 'g-sell-estimating', module: 'sell', name: 'Estimating', description: 'Estimators, cost engineers, technical sales support', isDefault: true, members: ['1', '3'], permissions: permissions({ 'crm.access': true, 'pipeline.visibility': 'own', 'quotes.create': true, 'pricing.edit': true }) },
  { id: 'g-sell-cs', module: 'sell', name: 'Customer Service', description: 'Order entry, customer queries, quote follow-up', isDefault: true, members: ['6'], permissions: permissions({ 'documents.scope': 'all', 'crm.access': true, 'pipeline.visibility': 'all' }) },

  // ── Plan (ARCH 00 §4.4) ──
  { id: 'g-plan-scheduling', module: 'plan', name: 'Scheduling', description: 'Production schedulers, planners, workshop coordinators', isDefault: true, members: ['2', '3'], permissions: permissions({ 'documents.scope': 'all', 'schedule.edit': true, 'budget.visibility': true, 'intelligence_hub.access': true, 'reports.access': true }) },
  { id: 'g-plan-engineering', module: 'plan', name: 'Engineering', description: 'Design engineers, drafters, BOM maintainers', isDefault: true, members: ['1', '7'], permissions: permissions({ 'documents.scope': 'all', 'bom.edit': true, 'intelligence_hub.access': true }) },
  { id: 'g-plan-costing', module: 'plan', name: 'Costing', description: 'Cost analysts, estimators reviewing job budgets', isDefault: true, members: ['3'], permissions: permissions({ 'documents.scope': 'all', 'budget.visibility': true, 'reports.access': true }) },

  // ── Make (ARCH 00 §4.5) ──
  { id: 'g-make-production', module: 'make', name: 'Production', description: 'Operators, welders, machinists, assemblers', isDefault: true, members: ['1', '2', '6', '7'], permissions: permissions({ 'workorders.scope': 'own', 'timers.scope': 'own', 'qc.record': true, 'scrap.report': true }) },
  { id: 'g-make-quality', module: 'make', name: 'Quality', description: 'Quality inspectors, QA coordinators, NCR managers', isDefault: true, members: ['1', '3'], permissions: permissions({ 'documents.scope': 'all', 'workorders.scope': 'all', 'timers.scope': 'own', 'qc.record': true, 'scrap.report': true, 'andon.manage': true, 'reports.access': true }) },
  { id: 'g-make-maintenance', module: 'make', name: 'Maintenance', description: 'Maintenance technicians, equipment managers', isDefault: true, members: ['7'], permissions: permissions({ 'documents.scope': 'all', 'workorders.scope': 'all', 'timers.scope': 'own', 'andon.manage': true, 'maintenance.manage': true }) },
  { id: 'g-make-office', module: 'make', name: 'Office', description: 'Production managers, supervisors with read access', isDefault: true, members: ['5', '2'], permissions: permissions({ 'documents.scope': 'all', 'workorders.scope': 'all', 'timers.scope': 'all', 'reports.access': true }) },

  // ── Ship (ARCH 00 §4.6) ──
  { id: 'g-ship-warehouse', module: 'ship', name: 'Warehouse', description: 'Pick/pack staff, forklift operators, storemen', isDefault: true, members: ['6', '5'], permissions: permissions({ 'orders.scope': 'own' }) },
  { id: 'g-ship-shipping', module: 'ship', name: 'Shipping', description: 'Shipping coordinators, dispatch, logistics planners', isDefault: true, members: ['5'], permissions: permissions({ 'documents.scope': 'all', 'orders.scope': 'all', 'manifests.create': true }) },
  { id: 'g-ship-cs', module: 'ship', name: 'Customer Service', description: 'Delivery queries, tracking updates, return requests', isDefault: true, members: ['1'], permissions: permissions({ 'documents.scope': 'all', 'orders.scope': 'all' }) },

  // ── Book (ARCH 00 §4.7) ──
  { id: 'g-book-ar', module: 'book', name: 'Accounts Receivable', description: 'AR clerks, invoice processors, credit controllers', isDefault: true, members: ['5'], permissions: permissions({ 'documents.scope': 'all', 'invoices.create': true, 'expenses.scope': 'own' }) },
  { id: 'g-book-ap', module: 'book', name: 'Accounts Payable', description: 'AP clerks, bill matchers, payment processors', isDefault: true, members: ['5'], permissions: permissions({ 'documents.scope': 'all', 'expenses.scope': 'all', 'po.approve': true }) },
  { id: 'g-book-expenses', module: 'book', name: 'Expenses', description: 'All staff who submit expense claims', isDefault: true, members: ['1', '3', '5'], permissions: permissions({ 'expenses.scope': 'own' }) },

  // ── Buy (ARCH 00 §4.8) ──
  { id: 'g-buy-purchasing', module: 'buy', name: 'Purchasing', description: 'Buyers, procurement officers, purchasing managers', isDefault: true, members: ['5', '2'], permissions: permissions({ 'documents.scope': 'all', 'requisitions.scope': 'all', 'po.create': true, 'vendors.manage': true, 'goods_receipts.access': true }) },
  { id: 'g-buy-receiving', module: 'buy', name: 'Receiving', description: 'Warehouse/receiving staff who check deliveries against POs', isDefault: true, members: ['6'], permissions: permissions({ 'requisitions.scope': 'own', 'goods_receipts.access': true }) },
  { id: 'g-buy-accounts', module: 'buy', name: 'Accounts', description: 'AP staff involved in procurement billing, three-way matching', isDefault: true, members: ['5'], permissions: permissions({ 'documents.scope': 'all', 'requisitions.scope': 'all', 'po.approve': true, 'reports.access': true }) },

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
      'people.view': true,
      'people.manage': false,
      'workflow.manage': false,
    }),
  },
  {
    id: 'g-control-people-admin',
    module: 'control',
    name: 'People Admin',
    description: 'Office managers who onboard users and manage group assignments',
    isDefault: true,
    members: ['4'],
    permissions: permissions({
      'documents.scope': 'all',
      'products.manage': false,
      'boms.manage': false,
      'locations.manage': false,
      'machines.manage': false,
      'people.view': true,
      'people.manage': true,
      'workflow.manage': false,
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
    { key: 'settings.access', label: 'Access settings', section: 'admin', type: 'boolean' },
    { key: 'reports.access', label: 'Access reports', section: 'admin', type: 'boolean' },
  ],
  make: [
    { key: 'workorders.scope', label: 'Work order visibility', section: 'scope', type: 'scope' },
    { key: 'timers.scope', label: 'Time clock visibility', section: 'scope', type: 'scope' },
    { key: 'qc.record', label: 'Record quality checks', section: 'actions', type: 'boolean' },
    { key: 'scrap.report', label: 'Report scrap', section: 'actions', type: 'boolean' },
    { key: 'andon.manage', label: 'Manage andon', section: 'actions', type: 'boolean' },
    { key: 'maintenance.manage', label: 'Manage maintenance', section: 'actions', type: 'boolean' },
    { key: 'settings.access', label: 'Access settings', section: 'admin', type: 'boolean' },
    { key: 'reports.access', label: 'Access reports', section: 'admin', type: 'boolean' },
  ],
  ship: [
    { key: 'orders.scope', label: 'Order visibility', section: 'scope', type: 'scope' },
    { key: 'manifests.create', label: 'Create manifests', section: 'actions', type: 'boolean' },
    { key: 'carrier.config', label: 'Configure carriers', section: 'actions', type: 'boolean' },
    { key: 'returns.approve', label: 'Approve returns', section: 'actions', type: 'boolean' },
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
