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
import { SellQuotes } from './components/sell/SellQuotes';
import { SellActivities } from './components/sell/SellActivities';
import { SellNewQuote } from './components/sell/SellNewQuote';
import { SellProductDetail } from './components/sell/SellProductDetail';
import { SellCustomerDetail } from './components/sell/SellCustomerDetail';
import { SellOrderDetail } from './components/sell/SellOrderDetail';
import { SellInvoiceDetail } from './components/sell/SellInvoiceDetail';
import { SellNewInvoice } from './components/sell/SellNewInvoice';
import { SellQuoteDetail } from './components/sell/SellQuoteDetail';

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
import { BuyRequisitionDetail } from './components/buy/BuyRequisitionDetail';
import { BuySupplierDetail } from './components/buy/BuySupplierDetail';
import { BuyOrderDetail } from './components/buy/BuyOrderDetail';
import { BuyProductDetail } from './components/buy/BuyProductDetail';

// Plan Module
import { PlanDashboard } from './components/plan/PlanDashboard';
import { PlanJobs } from './components/plan/PlanJobs';
import { PlanJobDetail } from './components/plan/PlanJobDetail';
import { PlanActivities } from './components/plan/PlanActivities';
import { PlanSchedule } from './components/plan/PlanSchedule';
import { PlanPurchase } from './components/plan/PlanPurchase';
import { PlanQCPlanning } from './components/plan/PlanQCPlanning';
import { PlanProducts } from './components/plan/PlanProducts';
import { PlanProductDetail } from './components/plan/PlanProductDetail';
import { PlanSettings } from './components/plan/PlanSettings';
import { PlanNCConnect } from './components/plan/PlanNCConnect';
import { PlanCADImport } from './components/plan/PlanCADImport';

// Make Module
import { MakeDashboard } from './components/make/MakeDashboard';
import { MakeSchedule } from './components/make/MakeSchedule';
import { MakeManufacturingOrders } from './components/make/MakeManufacturingOrders';
import { MakeManufacturingOrderDetail } from './components/make/MakeManufacturingOrderDetail';
import { MakeTimeClock } from './components/make/MakeTimeClock';
import { MakeQuality } from './components/make/MakeQuality';
import { MakeProducts } from './components/make/MakeProducts';
import { MakeProductDetail } from './components/make/MakeProductDetail';
import { MakeSettings } from './components/make/MakeSettings';
import { MakeShopFloor } from './components/make/MakeShopFloor';

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
import { ControlEmptyStates } from './components/control/ControlEmptyStates';
import { ControlProcessBuilder } from './components/control/ControlProcessBuilder';
import { ControlRoleDesigner } from './components/control/ControlRoleDesigner';
import { ControlGamification } from './components/control/ControlGamification';
import { MirrorWorksBridge } from './components/control/MirrorWorksBridge';
import { BridgeWizard } from './components/bridge/BridgeWizard';
import { Notifications } from './components/Notifications';

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
import { InvoiceDetail } from './components/book/InvoiceDetail';
import { JobCostDetail } from './components/book/JobCostDetail';

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
          { path: 'orders/:id', element: <SellOrderDetail /> },
          { path: 'activities', element: <SellActivities /> },
          { path: 'invoices', element: <SellInvoices /> },
          { path: 'invoices/new', element: <SellNewInvoice /> },
          { path: 'invoices/:id', element: <SellInvoiceDetail /> },
          { path: 'products', element: <SellProducts /> },
          { path: 'products/:id', element: <SellProductDetail /> },
          { path: 'quotes', element: <SellQuotes /> },
          { path: 'quotes/new', element: <SellNewQuote /> },
          { path: 'quotes/:id', element: <SellQuoteDetail /> },
          { path: 'settings', element: <SellSettings /> },
        ],
      },

      // Buy Module Routes
      {
        path: 'buy',
        children: [
          { index: true, element: <BuyDashboard /> },
          { path: 'orders', element: <BuyOrders /> },
          { path: 'orders/:id', element: <BuyOrderDetail /> },
          { path: 'requisitions', element: <BuyRequisitions /> },
          { path: 'requisitions/:id', element: <BuyRequisitionDetail /> },
          { path: 'receipts', element: <BuyReceipts /> },
          { path: 'suppliers', element: <BuySuppliers /> },
          { path: 'suppliers/:id', element: <BuySupplierDetail /> },
          { path: 'rfqs', element: <BuyRFQs /> },
          { path: 'bills', element: <BuyBills /> },
          { path: 'products', element: <BuyProducts /> },
          { path: 'products/:id', element: <BuyProductDetail /> },
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
          { path: 'jobs/:id', element: <PlanJobDetail /> },
          { path: 'activities', element: <PlanActivities /> },
          { path: 'schedule', element: <PlanSchedule /> },
          { path: 'nc-connect', element: <PlanNCConnect /> },
          { path: 'cad-import', element: <PlanCADImport /> },
          { path: 'purchase', element: <PlanPurchase /> },
          { path: 'qc-planning', element: <PlanQCPlanning /> },
          { path: 'products', element: <PlanProducts /> },
          { path: 'products/:id', element: <PlanProductDetail /> },
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
          { path: 'manufacturing-orders', element: <MakeManufacturingOrders /> },
          { path: 'manufacturing-orders/:id', element: <MakeManufacturingOrderDetail /> },
          { path: 'time-clock', element: <MakeTimeClock /> },
          { path: 'quality', element: <MakeQuality /> },
          { path: 'products', element: <MakeProducts /> },
          { path: 'products/:id', element: <MakeProductDetail /> },
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
          { path: 'gamification', element: <ControlGamification /> },
          { path: 'empty-states', element: <ControlEmptyStates /> },
        ],
      },

      // Notifications
      {
        path: 'notifications',
        element: <Notifications />,
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
          { path: 'invoices/:id', element: <InvoiceDetail onBack={() => window.history.back()} /> },
          { path: 'expenses', element: <ExpenseKanban /> },
          { path: 'purchases', element: <PurchaseOrders /> },
          { path: 'job-costs', element: <JobProfitability /> },
          { path: 'job-costs/:id', element: <JobCostDetail onBack={() => window.history.back()} /> },
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