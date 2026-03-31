/**
 * Routes - Complete routing configuration for all modules
 */

import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { WelcomeDashboard } from './components/WelcomeDashboard';

// Sell Module
import { SellDashboard } from './components/sell/SellDashboard';
import { SellCRM } from './components/sell/SellCRM';
import { SellOpportunities } from './components/sell/SellOpportunities';
import { SellOpportunityPage } from './components/sell/SellOpportunityPage';
import { SellOrders } from './components/sell/SellOrders';
import { SellInvoices } from './components/sell/SellInvoices';
import { SellProducts } from './components/sell/SellProducts';
import { SellSettings } from './components/sell/SellSettings';
import { SellNewQuote } from './components/sell/SellNewQuote';
import { SellProductDetail } from './components/sell/SellProductDetail';
import { SellCustomerDetail } from './components/sell/SellCustomerDetail';

// Buy Module
import { BuyDashboard } from './components/buy/BuyDashboard';
import { BuyOrders } from './components/buy/BuyOrders';
import { BuyRequisitions } from './components/buy/BuyRequisitions';
import { BuyReceipts } from './components/buy/BuyReceipts';
import { BuySuppliers } from './components/buy/BuySuppliers';
import { BuyRFQs } from './components/buy/BuyRFQs';
import { BuyBills } from './components/buy/BuyBills';
import { BuyProducts } from './components/buy/BuyProducts';
import { BuyAgreements } from './components/buy/BuyAgreements';
import { BuyReports } from './components/buy/BuyReports';
import { BuySettings } from './components/buy/BuySettings';

// Plan Module
import { PlanDashboard } from './components/plan/PlanDashboard';
import { PlanJobs } from './components/plan/PlanJobs';
import { PlanActivities } from './components/plan/PlanActivities';
import { PlanPurchase } from './components/plan/PlanPurchase';
import { PlanQCPlanning } from './components/plan/PlanQCPlanning';
import { PlanProducts } from './components/plan/PlanProducts';
import { PlanSettings } from './components/plan/PlanSettings';

// Make Module
import { MakeDashboard } from './components/make/MakeDashboard';
import { MakeSchedule } from './components/make/MakeSchedule';
import { MakeShopFloor } from './components/make/MakeShopFloor';
import { MakeWork } from './components/make/MakeWork';
import { MakeIssues } from './components/make/MakeIssues';
import { MakeSettings } from './components/make/MakeSettings';

// Ship Module
import { ShipDashboard } from './components/ship/ShipDashboard';
import { ShipOrders } from './components/ship/ShipOrders';
import { ShipPackaging } from './components/ship/ShipPackaging';
import { ShipShipping } from './components/ship/ShipShipping';
import { ShipTracking } from './components/ship/ShipTracking';
import { ShipReturns } from './components/ship/ShipReturns';
import { ShipWarehouse } from './components/ship/ShipWarehouse';
import { ShipReports } from './components/ship/ShipReports';
import { ShipSettings } from './components/ship/ShipSettings';

// Control Module
import { ControlDashboard } from './components/control/ControlDashboard';
import { ControlLocations } from './components/control/ControlLocations';
import { ControlMachines } from './components/control/ControlMachines';
import { ControlInventory } from './components/control/ControlInventory';
import { ControlPurchase } from './components/control/ControlPurchase';
import { ControlPeople } from './components/control/ControlPeople';
import { ControlProducts } from './components/control/ControlProducts';
import { ControlBOMs } from './components/control/ControlBOMs';
import { ControlWorkflowDesigner } from './components/control/ControlWorkflowDesigner';
import { ControlFactoryDesigner } from './components/control/ControlFactoryDesigner';
import { ControlProcessBuilder } from './components/control/ControlProcessBuilder';
import { ControlRoleDesigner } from './components/control/ControlRoleDesigner';
import { MirrorWorksBridge } from './components/control/MirrorWorksBridge';
import { BridgeWizard } from './components/bridge/BridgeWizard';

// Book Module (existing)
import { BudgetOverview } from './components/book/BudgetOverview';
import { BookDashboard } from './components/book/BookDashboard';
import { BookInvoices } from './components/book/BookInvoices';
import { ExpenseKanban } from './components/book/ExpenseKanban';
import { PurchaseOrders } from './components/book/PurchaseOrders';
import { JobProfitability } from './components/book/JobProfitability';
import { StockValuation } from './components/book/StockValuation';
import { ReportsGallery } from './components/book/ReportsGallery';
import { BookSettings } from './components/book/BookSettings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <WelcomeDashboard />,
      },
      
      // Main Dashboard Route
      {
        path: 'dashboard',
        element: <WelcomeDashboard />,
      },
      
      // Sell Module Routes
      {
        path: 'sell',
        children: [
          { index: true, element: <SellDashboard /> },
          { path: 'crm', element: <SellCRM /> },
          { path: 'crm/:id', element: <SellCustomerDetail /> },
          { path: 'opportunities', element: <SellOpportunities /> },
          { path: 'opportunities/:id', element: <SellOpportunityPage /> },
          { path: 'orders', element: <SellOrders /> },
          { path: 'invoices', element: <SellInvoices /> },
          { path: 'products', element: <SellProducts /> },
          { path: 'products/:id', element: <SellProductDetail /> },
          { path: 'quotes/new', element: <SellNewQuote /> },
          { path: 'settings', element: <SellSettings /> },
        ],
      },

      // Buy Module Routes
      {
        path: 'buy',
        children: [
          { index: true, element: <BuyDashboard /> },
          { path: 'orders', element: <BuyOrders /> },
          { path: 'requisitions', element: <BuyRequisitions /> },
          { path: 'receipts', element: <BuyReceipts /> },
          { path: 'suppliers', element: <BuySuppliers /> },
          { path: 'rfqs', element: <BuyRFQs /> },
          { path: 'bills', element: <BuyBills /> },
          { path: 'products', element: <BuyProducts /> },
          { path: 'agreements', element: <BuyAgreements /> },
          { path: 'reports', element: <BuyReports /> },
          { path: 'settings', element: <BuySettings /> },
        ],
      },

      // Plan Module Routes
      {
        path: 'plan',
        children: [
          { index: true, element: <PlanDashboard /> },
          { path: 'jobs', element: <PlanJobs /> },
          { path: 'activities', element: <PlanActivities /> },
          { path: 'purchase', element: <PlanPurchase /> },
          { path: 'qc-planning', element: <PlanQCPlanning /> },
          { path: 'products', element: <PlanProducts /> },
          { path: 'settings', element: <PlanSettings /> },
        ],
      },

      // Make Module Routes
      {
        path: 'make',
        children: [
          { index: true, element: <MakeDashboard /> },
          { path: 'schedule', element: <MakeSchedule /> },
          { path: 'shop-floor', element: <MakeShopFloor /> },
          { path: 'work', element: <MakeWork /> },
          { path: 'issues', element: <MakeIssues /> },
          { path: 'settings', element: <MakeSettings /> },
        ],
      },

      // Ship Module Routes
      {
        path: 'ship',
        children: [
          { index: true, element: <ShipDashboard /> },
          { path: 'orders', element: <ShipOrders /> },
          { path: 'packaging', element: <ShipPackaging /> },
          { path: 'shipping', element: <ShipShipping /> },
          { path: 'tracking', element: <ShipTracking /> },
          { path: 'returns', element: <ShipReturns /> },
          { path: 'warehouse', element: <ShipWarehouse /> },
          { path: 'reports', element: <ShipReports /> },
          { path: 'settings', element: <ShipSettings /> },
        ],
      },

      // Bridge — full wizard (PLAT 01)
      {
        path: 'bridge',
        element: (
          <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <BridgeWizard />
          </div>
        ),
      },

      // Control Module Routes (includes former Design module: factory designer, process builder, MirrorWorks Bridge)
      {
        path: 'control',
        children: [
          { index: true, element: <ControlDashboard /> },
          { path: 'mirrorworks-bridge', element: (
            <div className="p-6 space-y-6 max-w-5xl mx-auto">
              <BridgeWizard />
            </div>
          ) },
          { path: 'factory-layout', element: <ControlFactoryDesigner /> },
          { path: 'process-builder', element: <ControlProcessBuilder /> },
          { path: 'locations', element: <ControlLocations /> },
          { path: 'machines', element: <ControlMachines /> },
          { path: 'inventory', element: <ControlInventory /> },
          { path: 'purchase', element: <ControlPurchase /> },
          { path: 'people', element: <ControlPeople /> },
          { path: 'products', element: <ControlProducts /> },
          { path: 'boms', element: <ControlBOMs /> },
          { path: 'role-designer', element: <ControlRoleDesigner /> },
          { path: 'workflow-designer', element: <ControlWorkflowDesigner /> },
        ],
      },

      // Legacy /design URLs → Control (bookmarks)
      {
        path: 'design',
        children: [
          { index: true, element: <Navigate to="/control/factory-layout" replace /> },
          { path: 'factory-layout', element: <Navigate to="/control/factory-layout" replace /> },
          { path: 'process-builder', element: <Navigate to="/control/process-builder" replace /> },
          { path: 'initial-data', element: <Navigate to="/control/mirrorworks-bridge" replace /> },
        ],
      },

      // Book Module Routes
      {
        path: 'book',
        children: [
          { index: true, element: <BookDashboard /> },
          { path: 'budget', element: <BudgetOverview /> },
          { path: 'invoices', element: <BookInvoices /> },
          { path: 'expenses', element: <ExpenseKanban /> },
          { path: 'purchases', element: <PurchaseOrders /> },
          { path: 'job-costs', element: <JobProfitability /> },
          { path: 'stock-valuation', element: <StockValuation /> },
          { path: 'reports', element: <ReportsGallery /> },
          { path: 'settings', element: <BookSettings /> },
        ],
      },

      // 404 Catch-all
      {
        path: '*',
        element: (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-[#EF4444] mb-2">404 - Page Not Found</h1>
            <p className="text-[#737373]">The page you're looking for doesn't exist.</p>
          </div>
        ),
      },
    ],
  },
]);