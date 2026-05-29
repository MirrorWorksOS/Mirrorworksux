# Workflow → Code Audit

Audit of `docs/architecture/workflows.md` against the current state of the
codebase. Each of the four diagrams is mapped node-by-node, handoff-by-handoff
and gate-by-gate. Status values: `IMPLEMENTED`, `PARTIAL`, `MISSING`,
`NOT_APPLICABLE`. `MISSING` rows are sorted first.

## Baseline findings (apply to every diagram)

These observations recur in every section, so they are recorded once here
rather than repeated in every row's "Notes" column.

- **Convex schema has no business tables.** [apps/web/convex/schema.ts:15-68](apps/web/convex/schema.ts) defines only `mirrorviewModels` (and, per the schema file's own contents, an adjacent `mirrorviewMarkups` table referenced elsewhere). There is no Convex table for Customer, Opportunity, Quote, SalesOrder, Job, ManufacturingOrder, WorkOrder, PurchaseOrder, Requisition, GoodsReceipt, Bill, Shipment, Invoice, Inventory, BatchLot, Reservation, ReorderRule, or BOM.
- **Services are read-only facades over module-level mock arrays.** Every entry in [apps/web/src/services/sellService.ts](apps/web/src/services/sellService.ts), [planService.ts](apps/web/src/services/planService.ts), [buyService.ts](apps/web/src/services/buyService.ts), [makeService.ts](apps/web/src/services/makeService.ts), [shipService.ts](apps/web/src/services/shipService.ts) and [bookService.ts](apps/web/src/services/bookService.ts) is a `get*` method returning `mock.<array>` after an 80 ms `delay()`. The only mutating methods anywhere are in `planService` for nesting state (`reserveSheetStock`, `releaseSheetStock`, `saveNest`, `scheduleNest`, `setNestStatus`, `applySchedule`) and they mutate module-local arrays cloned from `mock.*` at module load — state is lost on full reload.
- **No `is_manufactured` field exists.** A repo-wide grep for `is_manufactured` / `isManufactured` returns zero matches in `apps/web/src/`. Per-line routing on SO confirmation therefore has no field to dispatch on.
- **`SalesOrder` has no line items.** [entities.ts:313-336](apps/web/src/types/entities.ts) defines `SalesOrder` with a scalar `total: number` and a single optional `jobId`. There is no `SalesOrderLine` interface in the file, so the diagrams' "per-line" handoffs and per-line routing are not modelable in the current types.
- **`Job` has no `source`, and `customerId` is required.** [entities.ts:609-632](apps/web/src/types/entities.ts) declares `customerId: string` (non-optional) and has no `source` discriminator. Archetype 3 (replenishment with `customer_id = null`) is therefore unrepresentable.
- **No `BoM` entity, no `BomLine`, no explosion logic.** The only BoM artefacts are `BomGeneratorLine` ([entities.ts:1075](apps/web/src/types/entities.ts)) used by a CAD-import suggestion UI, and the visual tree component `BomRoutingTree.tsx` which reads from `BomRoutingTree.data.ts`. There is no service method, no traversal function, no `is_manufactured`-aware recursion.
- **No inventory module exists.** No `Inventory`, `StockLocation`, `Reservation`, `Allocation`, `Backorder`, `PickList`, `PutAway`, or `StockMovement` types. `BatchLot` exists ([entities.ts:1179](apps/web/src/types/entities.ts)) but has no service that decrements quantity, no link to `MaterialConsumptionLine`, and no FIFO/lot logic.
- **No state-transition functions cross modules.** A grep for `confirm|createJob|generateInvoice|allocate|dispatch|fire` against the services finds zero cross-module handoffs implemented as code; the only matches are nesting-internal (`reserveSheetStock`, `scheduleNest`).
- **Xero is entirely mock.** [xeroService.ts](apps/web/src/services/xeroService.ts) imports `mockXero*` from `services/mock/xero.ts`; `refresh()` is a noop returning fixture counts.

---

## 1. Main MTO Assembly Workflow

### 1.1 Entity mapping

| Node | Status | Location in code | Notes |
|---|---|---|---|
| `MO` Manufacturing Order | MISSING | type only at [entities.ts:1126-1142](apps/web/src/types/entities.ts) | `ManufacturingOrder` type exists; `makeService.getManufacturingOrders()` ([makeService.ts:32](apps/web/src/services/makeService.ts)) returns mocks. No `createManufacturingOrder` exists anywhere. |
| `WO` Work Orders per operation | MISSING | type only at [entities.ts:1144-1159](apps/web/src/types/entities.ts) | `WorkOrder` type exists; `makeService.getWorkOrders` / `getWorkOrdersByMO` ([makeService.ts:43-50](apps/web/src/services/makeService.ts)) read mocks. No generator function from MO routing → WO rows. |
| `EXEC` Operator execution | MISSING | UI surface at `components/floor/` and `components/shop-floor/`; data path is `makeService.getPendingWorkOrdersForStation` ([makeService.ts:101](apps/web/src/services/makeService.ts)) | UI reads mocks. No start/complete/scan mutation. No time clock, no state transition. |
| `MATCONS` Material consumption logged | MISSING | type at [entities.ts:1197-1205](apps/web/src/types/entities.ts), getter at [makeService.ts:66](apps/web/src/services/makeService.ts) | `MaterialConsumptionLine` is a flat record with `plannedQty / consumedQty / variance`. Nothing writes to it; nothing decrements stock. |
| `TIME` Time entries logged | MISSING | no entity, no service | No `TimeEntry` interface, no `time_entries` mock, no clock-in/out UI tied to a service. |
| `QC` QC passed? | MISSING | no entity | No `QualityCheck`, `Inspection`, or QC-gate type. `CapaRecord` ([entities.ts:1162](apps/web/src/types/entities.ts)) is the closest, but that is a post-incident corrective-action record, not a per-WO gate. |
| `MODONE` MO complete | MISSING | enum status only | `ManufacturingOrderStatus` literal exists in `entities.ts` but no transition function. |
| `DISP` Dispatch record | MISSING | type as `Shipment` at [entities.ts:1225-1240](apps/web/src/types/entities.ts) | `shipService.getShipments` ([shipService.ts:18](apps/web/src/services/shipService.ts)) reads mocks. No create-dispatch mutation. |
| `DEL` Delivery and PoD | MISSING | `actualDelivery?: string` on `Shipment` | No PoD capture flow; no signature/photo attachment in this type. |
| `INV` Invoice generated | MISSING | type at [entities.ts:338-349](apps/web/src/types/entities.ts), getter at [bookService.ts:22](apps/web/src/services/bookService.ts) | `SellInvoice` exists; nothing creates one from a delivery. |
| `JC` Job cost accrual | MISSING | type at [entities.ts:1306+](apps/web/src/types/entities.ts), getter at [bookService.ts:40](apps/web/src/services/bookService.ts) | `JobCost` is a read-only roll-up record. No accrual function ingesting `MaterialConsumptionLine` / time / PO costs. |
| `REQ` Purchase Requisition | MISSING | type at [entities.ts:516-525](apps/web/src/types/entities.ts), getter at [buyService.ts:35](apps/web/src/services/buyService.ts) | `Requisition` typed; no creator. |
| `PO` Purchase Order | MISSING | type at [entities.ts:503-514](apps/web/src/types/entities.ts), getter at [buyService.ts:24](apps/web/src/services/buyService.ts) | No req→PO conversion function. |
| `GR` Goods Receipt | MISSING | type at [entities.ts:547-565](apps/web/src/types/entities.ts), getter at [buyService.ts:47](apps/web/src/services/buyService.ts) | No GR creation; no link to `BatchLot`; no stock increment. |
| `VB` Vendor Bill three-way match | MISSING | type at [entities.ts:534-545](apps/web/src/types/entities.ts), getter at [buyService.ts:41](apps/web/src/services/buyService.ts) | `Bill.poId?` exists but no matching algorithm. |
| `OPP` Opportunity | PARTIAL | type at [entities.ts:226-244](apps/web/src/types/entities.ts), getters at [sellService.ts:41-49](apps/web/src/services/sellService.ts) | Mock-backed list/detail. No state machine, no value/stage update. |
| `QUO` Quote | PARTIAL | type at [entities.ts:245-301](apps/web/src/types/entities.ts), getters at [sellService.ts:58-67](apps/web/src/services/sellService.ts) | Mock-backed; `QuoteLineItem` exists; no accept/decline mutation; no quote→SO conversion. |
| `SO` Sales Order confirmed | PARTIAL | type at [entities.ts:313-336](apps/web/src/types/entities.ts), getter at [sellService.ts:69](apps/web/src/services/sellService.ts) | Mock-backed; `status: SalesOrderStatus` exists but the enum is never transitioned; `confirmedAt` is a static field on fixtures. No per-line routing because `SalesOrder` has no `lines[]`. |
| `JOB` Job from SO line | PARTIAL | type at [entities.ts:609-632](apps/web/src/types/entities.ts), getter at [planService.ts:45](apps/web/src/services/planService.ts) | Mock-backed; `salesOrderId?` is just a string reference; no factory function. |
| `BOM` BoM exists? | PARTIAL | UI tree at [BomRoutingTree.tsx](apps/web/src/components/plan/BomRoutingTree.tsx) with seed data in `BomRoutingTree.data.ts` | Visual tree only. No `BillOfMaterials` entity; no service method. |
| `MRP` MRP - check stock vs required | PARTIAL | type `MrpSuggestion` at [entities.ts:567-578](apps/web/src/types/entities.ts), getter at [buyService.ts:85](apps/web/src/services/buyService.ts); also `MrpNode` at [entities.ts:808](apps/web/src/types/entities.ts) | Returns hard-coded shortfall suggestions; no actual stock-vs-demand computation. |
| `SCHED` Schedule operations | PARTIAL | snapshot getter at [planService.ts:100+](apps/web/src/services/planService.ts), `runAutoSchedule`, `applySchedule` | In-memory snapshot is mutated; survives navigation but lost on reload. No persistence. |
| `INPROD` Status `in_production` | PARTIAL | `JobStatus` literal in entities.ts | Status value exists in the type; nothing transitions a job into it. |

### 1.2 Handoff mapping

| Handoff | Status | Implementation | Notes |
|---|---|---|---|
| `SO -- per line --> JOB` | MISSING | none | No `SalesOrderLine`; no `is_manufactured` flag; no `confirmSalesOrder()` function; no per-line dispatch. Quote-accepted → SO-created is also unimplemented. |
| `MRP -- shortage --> REQ` | MISSING | none | `MrpSuggestion[]` is read-only; nothing creates a `Requisition` from a suggestion. |
| `INPROD -- creates --> MO` | MISSING | none | No `Job.status === 'in_production'` trigger; no MO factory. |
| `GR -.- stock available -.- MATCONS` | MISSING | none | GR does not increment any stock collection; `MaterialConsumptionLine` is detached from goods receipts. |
| `MODONE --> DISP` | MISSING | none | No automatic `Shipment` creation from a completed MO. |
| `DEL -- triggers --> INV` | MISSING | none | No invoice generator. Delivery confirmation has no downstream wiring. |
| `MATCONS -.- cost -.- JC` | MISSING | none | `JobCost` does not import from consumption rows. |
| `TIME -.- cost -.- JC` | MISSING | none | No time entries at all (see entity row). |
| `VB -.- PO cost -.- JC` | MISSING | none | No accrual of vendor bills onto job cost. |
| `QC -- yes --> MODONE` | MISSING | none | No QC entity exists. |
| `OPP --> QUO` | PARTIAL | UI navigation in `components/sell/` | Visible in `SellOpportunityPage` but no persisted relation creation; mock `quotes` already carry `opportunityId`. |
| `QUO -- accepted --> SO` | PARTIAL | UI navigation only | No accept mutation; mock SO already references the mock quote. |
| `JOB --> BOM` | PARTIAL | UI navigation to BoM tree | Tree fetches from its own seed file ([BomRoutingTree.data.ts](apps/web/src/components/plan/BomRoutingTree.data.ts)), not from any job/product join. |
| `BOM -- yes --> MRP` | PARTIAL | UI navigation, MRP screen reads `mock.mrpSuggestions` | No traversal from BoM nodes to component-stock checks. |
| `MRP --> SCHED` | PARTIAL | UI navigation; both screens read independent mocks | No data flow from MRP outputs into the scheduler input. |
| `SCHED --> INPROD` | PARTIAL | `applySchedule` mutates the in-memory snapshot ([planService.ts:71](apps/web/src/services/planService.ts)) | Does not flip a `Job.status`. |
| `MO --> WO` | PARTIAL | both have getters and a join (`getWorkOrdersByMO`) | The join is read-only filtering on mock data; no WO is generated from MO routing. |
| `WO --> EXEC` | PARTIAL | `getPendingWorkOrdersForStation` ([makeService.ts:101](apps/web/src/services/makeService.ts)) | Surfaces WOs to the kiosk but accepts no execution input back. |
| `REQ --> PO --> GR --> VB` | PARTIAL | each entity has its own getter | Foreign keys exist on the types (`Bill.poId?`, `GoodsReceipt.poId`) but no service walks them and no creator chains them. |

### 1.3 Validation gates

| Gate | Status | Location | Notes |
|---|---|---|---|
| Sales Order → Job: SO status = `confirmed`, product status = `active`, `is_manufactured = true`, BoM exists | MISSING | none | None of the four conditions is checked anywhere. `is_manufactured` does not exist in the codebase. Product `isActive` exists ([entities.ts:138](apps/web/src/types/entities.ts)) but is not consulted at any handoff. |
| Plan → Make: all products have routing (>= 1 operation), all operations have work centre, planned dates set, material status = `available` or `ordered` | MISSING | none | No router validating that every product has a routing; no material-status field on any entity. |
| Make → Ship: all WOs complete, QC passed, no open NCRs | MISSING | none | No QC entity; `CapaRecord` exists but is not blocking. WO completion is also not transitionable. |
| Ship → Book: delivery confirmed, invoicing policy met (per Sell settings) | MISSING | none | No invoicing-policy setting surfaced anywhere; no gate. |

### 1.4 Spec gap confirmation

The Main MTO diagram has no explicit "Spec gaps" subsection in `workflows.md`; the cross-archetype list in §3 of the spec is checked under diagram 3.

### Verdict

The codebase cannot support the Main MTO workflow today. Every cross-module handoff is UI navigation between screens that read independent mock arrays. A 40-person sheet metal shop putting a confirmed order in on Monday would find that "Confirm" mutates nothing, no Job appears in Plan, no MO appears in Make, no PO is raised from MRP, and the dispatch / invoice screens still show last week's fixture data. The product is a click-through demo, not a workflow.

---

## 2. Inventory and Material Consumption Detail

### 2.1 Entity mapping

| Node | Status | Location in code | Notes |
|---|---|---|---|
| `SOLINE` SO line - 10x Bracket Assembly | MISSING | none | No `SalesOrderLine` type (see baseline). |
| `BOMEXP` BoM explosion | MISSING | none | No explosion function; `BomRoutingTree` is a visual tree, not a traversal. |
| `C1/C2/C3` Components (plate, bolt, sub-assembly) | MISSING | none | No `BomComponent` row type. `Product` is the closest, but it carries no parent-product / component link. |
| `STK1` Stock check | MISSING | none | No stock table, no `getStockOnHand` method anywhere. |
| `RES1` Reserve from stock | MISSING | none | Only `reserveSheetStock` exists ([planService.ts:270](apps/web/src/services/planService.ts)) and that reserves a *sheet* by `sheetStockId`, not a finished product line; in-memory only. |
| `PICK` Pick list to shop floor | MISSING | none | No `PickList` entity; no `getPickList` service. |
| `CONSUME` Cut consume from parent stock | MISSING | none | No parent-product consumption logic exists. Cutting 2 m off a 6 m bar has no representation. |
| `DEC` Decrement stock | MISSING | none | No stock-decrement function anywhere. |
| `DESIGN` Remnant treatment decision | MISSING | none | Option A/B/C unresolved; no code path handles either. |
| `LOT` Option A — same SKU, lot/serial with remnant | MISSING | none | `BatchLot` exists ([entities.ts:1179](apps/web/src/types/entities.ts)) but has no "remaining length" attribute, no parent-child remnant link. |
| `OFFCUT` Option B — new offcut SKU | MISSING | none | No SKU-creation routine; `Product.sku` is a static field. |
| `SCRAP` Option C — scrap variance | MISSING | none | `ScrapRecord` ([entities.ts:1208](apps/web/src/types/entities.ts)) exists for a *rate* heatmap, not for variance posting against a JobCost. |
| `REQ1` Create requisition | MISSING | none | Same as Buy entity row in §1; no creator. |
| `NESTEDMO` Nested MO for sub-assemblies | MISSING | none | No cascading MO creation. `is_manufactured` does not exist, so the trigger condition is also missing. |
| `JOBP` Job product - 10 units | PARTIAL | `Job` has no `qty` field but mock jobs carry per-product context | Job-as-product-of-N is implicit; `value` and `estimatedHours` exist but `unitCount` does not. |

### 2.2 Handoff mapping

| Handoff | Status | Implementation | Notes |
|---|---|---|---|
| `SOLINE --> JOBP` | MISSING | none | No SO lines. |
| `JOBP --> BOMEXP` | MISSING | none | No traversal. |
| `BOMEXP --> C1/C2/C3` | MISSING | none | No component rows produced. |
| `C1/C2 --> STK1` | MISSING | none | No stock check. |
| `STK1 -- sufficient --> RES1 --> PICK --> CONSUME --> DEC` | MISSING | none | None of the steps exist as functions. |
| `STK1 -- short --> REQ1` | MISSING | none | No bridge from stock check to requisition. |
| `C3 -- is_manufactured=true --> NESTEDMO` | MISSING | none | Trigger field absent; cascade absent. |
| `NESTEDMO -.- cascades -.- BOMEXP` | MISSING | none | Recursive explosion not implemented. |
| `CONSUME -- partial --> DESIGN` | MISSING | none | Decision point not in code. |

### 2.3 Validation gates

`workflows.md` does not list explicit gates for diagram 2; the section is dominated by the open Option A / B / C decision. Recorded under §2.4.

### 2.4 Spec gap confirmation

| Gap | Confirmed in code? | Notes |
|---|---|---|
| Option A — same SKU, lot/serial with remnant attribute | Confirmed missing | `BatchLot` has no `remainingLengthMm` / remnant attribute. |
| Option B — cut creates new offcut SKU, original fully consumed | Confirmed missing | No SKU-creation routine. |
| Option C — scrap variance, no remnant tracking | Confirmed missing | No variance posting; `ScrapRecord` is unrelated. |
| Recommendation: ship MVP with Option C | Confirmed not implemented | Even the simplest option is not present. |

### Verdict

The codebase cannot support inventory or material consumption. There is no stock collection to debit from and no BoM walker to know what to debit. The classic ERP failure mode the spec warns about — parent-product remnant handling — has no representation at all, not even the spec's recommended Option C scrap-variance fallback. A real fab shop trying to consume 2 m off a 6 m SHS on Monday would find no field to record the cut, no remnant SKU, and no way for the next job to see that only 4 m of that bar is left. This is the most important gap to close before any pilot, and it is the gap that most decisively separates a "real ERP" from another spreadsheet.

---

## 3. Stock Sale (Archetype 1)

### 3.1 Entity mapping

| Node | Status | Location in code | Notes |
|---|---|---|---|
| `RDETECT` `is_manufactured?` decision | MISSING | none | Field does not exist; decision is unrouteable. |
| `RES` Reserve stock against SO line | MISSING | none | No reservation table; no SO line. |
| `MTO` Route to Plan (main MTO) | MISSING | none | No router exists; flow is implicit. |
| `STK` Stock available? | MISSING | none | No stock collection. |
| `ALLOC` Allocate full qty | MISSING | none | No allocation function. |
| `ALLOCP` Allocate partial qty | MISSING | none | No partial-allocation function. |
| `BACK` Backorder | MISSING | none | No backorder entity / state. |
| `REQ`/`PO`/`GR` Buy chain | MISSING | function-wise | Types and getters exist (see §1.1); no auto-PO trigger from a backorder. |
| `PICK` Pick list | MISSING | none | No `PickList` entity. |
| `PACK` Pack | MISSING | none | No `PackList` entity. |
| `XERO` Xero sync | MISSING | function-wise | [xeroService.ts](apps/web/src/services/xeroService.ts) returns mocks; `refresh()` is a noop. |
| `SO` Sales Order created | PARTIAL | type at [entities.ts:313-336](apps/web/src/types/entities.ts), getter at [sellService.ts:69](apps/web/src/services/sellService.ts) | Mock-backed; no creator. |
| `DISP` Dispatch | PARTIAL | `Shipment` at [entities.ts:1225-1240](apps/web/src/types/entities.ts), getter at [shipService.ts:18](apps/web/src/services/shipService.ts) | Mock-backed list; no creator. |
| `DEL` Delivery + PoD | PARTIAL | `actualDelivery?: string` on `Shipment` | Read-only field on a mock record. |
| `INV` Invoice generated | PARTIAL | `SellInvoice`, `bookService.getInvoices` | Mock-backed list only. |

### 3.2 Handoff mapping

| Handoff | Status | Implementation | Notes |
|---|---|---|---|
| `SO --> RDETECT` | MISSING | none | No routing function on SO confirmation; even the discriminator field is missing. **This is the routing failure the audit brief flagged.** Today the only path the UI exposes is a Plan-style flow; a bolt sale would be forced through MTO. |
| `RDETECT -- false stocked --> RES` | MISSING | none | Stocked path does not exist as code. |
| `RDETECT -- true --> MTO` | MISSING | none | MTO path also unrouted (it's the implicit default). |
| `RES --> STK --> ALLOC/ALLOCP/BACK` | MISSING | none | None implemented. |
| `BACK -.- auto-PO or wait -.- REQ` | MISSING | none | `ReorderRule.autoPoEnabled` exists ([entities.ts:591](apps/web/src/types/entities.ts)) but no firing logic; there is no `shortage_behaviour` field on a per-product basis. |
| `GR -.- stock arrives -.- STK` | MISSING | none | No stock update on GR. |
| `ALLOC/ALLOCP --> PICK --> PACK --> DISP --> DEL` | MISSING | none | Pick / pack are unmodeled; dispatch and delivery are not creator-backed. |
| `DEL --> INV` | MISSING | none | No invoice creator. |
| `INV --> XERO` | MISSING | none | `xeroService.refresh` is a noop ([xeroService.ts:~80](apps/web/src/services/xeroService.ts)); no push for a real invoice. |

### 3.3 Validation gates

`workflows.md` does not list a separate "Key handoff validation gates" subsection under diagram 3; gates are implicit and absent. Recorded as MISSING under §3.4.

### 3.4 Spec gap confirmation

| Gap | Confirmed in code? | Notes |
|---|---|---|
| Per-line routing detection on SO confirmation (Sell) | Confirmed missing | No `is_manufactured`, no `SalesOrderLine`, no confirm-mutation. |
| Backorder vs auto-requisition behaviour as per-product setting (`reorder_rules.shortage_behaviour`) | Confirmed missing | `ReorderRule` carries `autoPoEnabled` only; no `shortage_behaviour` enum; no firing logic on shortage. |
| Partial fulfilment handling on Ship (multi-shipment SO) | Confirmed missing | `Shipment.salesOrderId` is a single string; no shipment-line collection; no parent-child shipment relationship. |

### Verdict

The codebase cannot support stock sales as a distinct archetype. There is no routing decision at SO confirmation, no inventory collection to allocate against, and no pick-pack flow distinct from the MTO Make path. If a customer ordered a single bolt on Monday, the UI would either (a) accept the line and do nothing on confirm, or (b) by sheer absence of a fast-path force the operator through the same Plan / Job / MO ceremony as a fabricated assembly — exactly the "simple case is heavy" failure the spec calls out. This is the second-most important gap, because the moment a shop sees a bolt-sized order in their Job list they go back to Excel.

---

## 4. Make-to-Stock Replenishment (Archetype 3)

### 4.1 Entity mapping

| Node | Status | Location in code | Notes |
|---|---|---|---|
| `MON` Stock monitor | MISSING | none | No stock store, so nothing to monitor. |
| `CHECK` Stock below reorder? | MISSING | none | No periodic / event-driven check. |
| `FIRE` Reorder rule fires | MISSING | none | `ReorderRule` is a static record; no firing logic; no event emitter. |
| `JOB` Job auto-created — `source: replenishment`, `customer_id: null` | MISSING | none | Both required fields are absent from `Job`: `source` does not exist and `customerId: string` is non-optional ([entities.ts:609-632](apps/web/src/types/entities.ts)). Auto-creator absent. |
| `PUTAWAY` Put-away to finished goods | MISSING | none | No put-away entity; not separated from GR. |
| `WIP` WIP asset | MISSING | none | No WIP valuation entity; `bookService.getWipValuations()` ([bookService.ts:72](apps/web/src/services/bookService.ts)) returns a hard-coded fixture. |
| `COGS` COGS recognised | MISSING | none | No accounting entries; no COGS posting; no WIP → finished-goods → COGS state machine. |
| `BOMX` BoM explosion | MISSING | none | Same as §2.1. |
| `MRP` Component stock check | MISSING | none | Same as §1.1. |
| `MO/WO/EXEC/MATCONS/TIME/QC/MODONE` | MISSING | as above | All same as §1.1. |
| `JC` Job cost accrual | MISSING | none | Same as §1.1. |
| `REQ/PO/GR` | MISSING | function-wise | Same as §1.1. |
| `SCHED` Schedule | PARTIAL | as above | Same in-memory snapshot. |
| `INPROD` Status `in_production` | PARTIAL | enum value only | Same as §1.1. |

### 4.2 Handoff mapping

| Handoff | Status | Implementation | Notes |
|---|---|---|---|
| `MON --> CHECK --> FIRE` | MISSING | none | No monitor loop. |
| `FIRE --> JOB` | MISSING | none | No replenishment job creator; `Job.source` field absent. |
| `MRP -- short --> REQ` | MISSING | none | Same as §1. |
| `GR -.- stock available -.- MRP` | MISSING | none | Same as §1. |
| `INPROD --> MO` | MISSING | none | Same as §1. |
| `MODONE --> PUTAWAY` | MISSING | none | No put-away step distinct from a (non-existent) GR. |
| `PUTAWAY -.- stock incremented -.- MON` | MISSING | none | Closes the loop only if put-away and monitor existed; neither does. |
| `MATCONS/TIME -.- JC` | MISSING | none | Same as §1. |
| `JC --> WIP` | MISSING | none | No WIP posting. |
| `WIP -.- when sold via Archetype 1 -.- COGS` | MISSING | none | Even if WIP existed, Archetype 1 sale path does not. |

### 4.3 Validation gates

`workflows.md` does not list dedicated gates for diagram 4 beyond the cross-archetype list; the implicit gates (reorder-rule eligible, customer field nullable, put-away into finished-goods location) all sit in the spec-gap list and are checked in §4.4.

### 4.4 Spec gap confirmation

| Gap | Confirmed in code? | Notes |
|---|---|---|
| `plan_jobs.customer_id` needs to be nullable, or introduce a "Stock" pseudo-customer | Confirmed missing | `Job.customerId: string` (required), no `STOCK` sentinel customer in `mock.customers`. |
| `plan_jobs.source` field with values `sales_order` / `replenishment` / `manual` | Confirmed missing | Field does not exist on `Job` ([entities.ts:609-632](apps/web/src/types/entities.ts)). |
| Put-away as an inventory operation distinct from goods receipt | Confirmed missing | No put-away entity, no inventory module. |
| WIP → Finished Goods → COGS transition in Book module | Confirmed missing | `WipValuation` is a read-only fixture; no transition. |

### Verdict

The codebase cannot support make-to-stock replenishment at all. The trigger (reorder rule firing → job creation) requires a monitor that has no stock collection to watch, fields on `Job` that don't exist, and a put-away step that is not modelled. A shop that holds a standard catalogue alongside one-off jobs — i.e. virtually every real fab shop — could not run their replenishment workflow on this system on Monday and would have to keep doing it in Excel, exactly as the spec warns.

---

## Cross-archetype spec-gap confirmation

| Gap (from `workflows.md` §5) | Confirmed in code? | Notes |
|---|---|---|
| `plan_jobs.customer_id` nullability + `plan_jobs.source` | Confirmed missing | See §4.4. |
| Per-line routing detection on SO confirmation | Confirmed missing | See §3.4. |
| Backorder vs auto-requisition per-product setting | Confirmed missing | See §3.4. |
| Put-away distinct from goods receipt | Confirmed missing | See §4.4. |
| WIP → Finished Goods → COGS transition | Confirmed missing | See §4.4. |
| Inventory module scope (own module vs split across Sell/Buy/Make) | Confirmed missing as a module | No `inventoryService.ts`; no inventory entities. |
| Remnant treatment decision (A / B / C) | Confirmed missing | See §2.4. |
| Sub-assemblies / nested MOs (`is_manufactured = true` cascade) | Confirmed missing | `is_manufactured` field absent; no cascade. |
| TODOs in code reflecting these gaps | Not really — only generic `TODO: CONVEX` markers, e.g. [planService.ts:100](apps/web/src/services/planService.ts) | The gaps are not enumerated in code; the spec is the only register. |

---

## Top 10 gaps to close before April 2026 launch

Ordered by impact on MirrorWorks' differentiation story (fast path for stocked items, parent-product consumption, MTS replenishment first):

1. **Parent-product consumption + remnant model.** Ship Option C (scrap variance) end-to-end as the spec recommends, with the data shape ready for Option A later. Without this, MirrorWorks is "just another Odoo" by the spec's own framing. Touches: new `Inventory`/`StockMovement` collection, `MaterialConsumptionLine` writes, `JobCost` variance posting.
2. **Stock-sale fast path (Archetype 1).** Add `SalesOrderLine[]`, add `is_manufactured` on `Product`, add per-line routing on `confirmSalesOrder()`, allocate-from-stock vs route-to-Plan branch, pick → pack → dispatch flow. Without it, a bolt sale traverses MTO ceremony and operators go back to Excel.
3. **MTS replenishment trigger (Archetype 3).** Add `Job.source`, make `Job.customerId` nullable (or add a `STOCK` pseudo-customer), put a reorder-rule monitor behind a Convex cron / mutation, separate put-away from goods receipt. Without it, half the business model is unserved.
4. **Real Convex schema for business entities.** Replace the read-only mock-array pattern with Convex tables for `customers`, `quotes`, `salesOrders`, `salesOrderLines`, `jobs`, `manufacturingOrders`, `workOrders`, `purchaseOrders`, `requisitions`, `goodsReceipts`, `bills`, `shipments`, `invoices`, `batchLots`, `stockMovements`, `reorderRules`. Nothing else on this list is testable without this.
5. **SO-confirm → Job creation (with per-line routing).** Implement `confirmSalesOrder(soId)` that walks lines, creates Jobs for manufactured lines, allocates stock for stocked lines, sets `Job.source = 'sales_order'`. This is the keystone handoff of the MTO archetype.
6. **BoM model + explosion.** Add `BillOfMaterials` and `BomComponent` (with `is_manufactured` on the component product), implement a `explodeBom(productId, qty)` traversal that yields component demand and triggers nested MOs for sub-assemblies.
7. **MO → WO generator and operator execution.** Generate `WorkOrder` rows from MO routing on `releaseMO()`, build start/pause/complete mutations on `WorkOrder`, hook to time entries (a new `TimeEntry` entity that does not exist yet) and to material consumption.
8. **GR → stock increment + three-way match.** Make `createGoodsReceipt()` insert `BatchLot` rows and `StockMovement` deltas; implement a `Bill ↔ PO ↔ GR` matching check that gates payment.
9. **Delivery → invoice → Xero push.** `confirmDelivery()` mutates the shipment and emits a `createInvoice` mutation; replace the noop `xeroService.refresh()` with a real push so AR is not the bottleneck post-pilot.
10. **Validation gates at every cross-module handoff.** Implement the four named gate sets from the spec (SO→Job, Plan→Make, Make→Ship, Ship→Book) as guard functions called by the relevant mutations. Today none of them exists; without them the workflow is advisory rather than enforced.

---

## Out of scope observations

Structural issues noticed during the audit, not actioned because the task is read-only:

- **Duplicated invoice domain.** `SellInvoice` ([entities.ts:338-349](apps/web/src/types/entities.ts)) is read both by `sellService.getInvoices` ([sellService.ts:75](apps/web/src/services/sellService.ts)) and `bookService.getInvoices` ([bookService.ts:22](apps/web/src/services/bookService.ts)). When persistence lands, this will need a single canonical owner.
- **Supabase scaffolding still present.** `apps/web/src/supabase/`, `apps/web/src/utils/supabase/` and `apps/web/src/lib/auth/` references exist despite memory note `[Backend stack](project_backend_stack.md)` saying the stack is Convex + R2 + WorkOS. Worth pruning before April so new contributors don't wire to it.
- **`Inventory` is not a module but is referenced in colour key.** The colour key in `workflows.md` notes inventory is cross-cutting "not yet a formal module"; the codebase mirrors this with no `inventoryService.ts`. Recommendation matches the spec: promote it to a real module before launch.
- **`BomGeneratorLine` vs `BomRoutingTree.data.ts` divergence.** The CAD-import UI suggests rows using `BomGeneratorLine` while the BoM explorer reads `BomRoutingTree.data.ts`. There is no canonical BoM source — the two paths will collide as soon as either is persisted.
- **`Job` lacks `qty`.** `Job` has `estimatedHours`, `value`, `progress`, but no `quantity` to manufacture. Diagram 2's "Job product - 10 units" cannot be expressed.
- **`SellInvoice` vs `Bill` naming is fine; `BookInvoice` is missing.** Book reads `SellInvoice` directly, but accounting work (e.g. AR ageing) usually wants a Book-side view. Worth deciding the boundary explicitly.
- **In-memory mutation in `planService` is fragile.** `_currentSnapshot`, `_nests`, `_queue`, `_sheetStocks` ([planService.ts:34-41](apps/web/src/services/planService.ts)) reset on full reload. Demo state can disappear mid-pitch. Either move to Convex now for these too, or document the reset behaviour clearly.
- **`MrpNode` vs `MrpSuggestion` duplication.** Two MRP record shapes in `entities.ts` ([entities.ts:567](apps/web/src/types/entities.ts), [entities.ts:808](apps/web/src/types/entities.ts)) without a clear owner. One MRP shape should win before real wiring.
- **No event/audit log entity.** Audit history is only present on `Quote` (`QuoteHistoryEntry`). The other modules will need a uniform `events` collection for traceability — easier to add before persistence than after.
- **`MaterialConsumptionLine` has no link back to a job, MO, or batch lot.** The field set is purely planned/consumed/variance/uom/status. When persistence lands this will need at minimum `manufacturingOrderId` and `batchLotId`.

---

## Phase A.1 — Types + mock backfill (landed)

Type additions in [entities.ts](apps/web/src/types/entities.ts):

- `ProductRoute = 'mto' | 'eto' | 'catalogue_sale' | 'make_to_stock'` exported.
- `Product.defaultRoute?: ProductRoute` and `Product.isManufactured?: boolean` added (optional during the rollout; required once Phase B1's `confirmSalesOrder` ships).
- `SalesOrderLine { id, salesOrderId, productId, description, qty, unitPrice, routeOverride?, status }` introduced. `SalesOrder.lines?: SalesOrderLine[]` added as optional.
- `JobSource = 'sales_order' | 'replenishment' | 'engineering' | 'variation' | 'manual'` exported. `Job.source?`, `Job.parentJobId?`, `Job.variationChainId?`, `Job.qty?` added (all optional). `Job.customerId` deliberately kept required for this slice — replenishment Jobs will use the "Stock" pseudo-customer per the §4.4 alternative; nullability revisited in Phase B3 if needed.

Mock backfill in [mock/data.ts](apps/web/src/services/mock/data.ts): every product gets an explicit `defaultRoute` + `isManufactured`. Most fab-shop items default to `mto`; `prod-005` (Cable Tray Support) is `make_to_stock` to seed the replenishment loop; `prod-004` (Server Rack 42U) and `prod-008` (Structural Steel) are `eto` to seed the engineering queue. Every Job carries an explicit `source: 'sales_order'` + `qty`.

Verification: `npx tsc --noEmit` reports the same 6 pre-existing errors before and after — zero regressions. No mutating service code shipped in this slice; all surfaces continue to render unchanged.

Remaining Phase A scope (deferred to dedicated slices once consumers exist):

- New entities still to add: `BillOfMaterials`, `BomComponent`, `StockLocation`, `Inventory`, `Reservation`, `StockMovement`, `PickList`, `PutAway`, `TimeEntry`, `QualityCheck`, `BatchLot.remainingLengthMm`. Land alongside Phase B1 (BoM + StockMovement), B2 (Pick/Pack inventory chain), B3 (PutAway), B6 (QualityCheck linkage), B7 (Subcontract pseudo-location).
- Convex tables for every business entity: land per-archetype as the corresponding mutating service starts writing. The mock-array facade pattern continues to work in the meantime.

---

## Phases B1–B7, E, C — orchestration landed

`workflowService.ts` ([apps/web/src/services/workflowService.ts](apps/web/src/services/workflowService.ts))
owns every cross-module mutation. All seven archetypes are wired:

- **B1 MTO** — `confirmSalesOrder` walks SO lines and dispatches per
  `routeOverride ?? Product.defaultRoute`. MTO/MTS lines create a Job
  with `source: 'sales_order'`. ETO lines spawn an engineering Job.
  Catalogue lines route through `_reserveAndCreatePickList`. SO→Job
  gate (`evaluateSoToJob`) is enforced.
- **B2 Catalogue Sale** — FG-first reservation + PickList creation;
  `pickPickList` decrements stock and emits a `pick` StockMovement.
  Backorder lines are flagged `pending`.
- **B3 MTS Replenishment** — `runReorderMonitor` reads
  `productReorderRules`, computes net on-hand from `inventoryRecords`,
  and creates Jobs with `source: 'replenishment'` against the `cust-stock`
  pseudo-customer. Avoids double-firing on the same product.
  `putAway` increments FG inventory and emits a `putaway` movement.
- **B4 ETO** — `publishBomToProductionJob` creates the BoM, marks the
  engineering Job complete, and spawns a production Job with
  `parentJobId` set. Production Job rejoins the MTO journey at MRP.
- **B5 VO** — `createVariation` raises a `VariationOrder` awaiting
  approval with a shared `variationChainId` across siblings of the same
  parent SO. `approveVariation` flips status and spawns a delta Job
  with `source: 'variation'` + the parent chain ID. Descopes don't
  create a delta job.
- **B6 Rework** — `recordQualityCheck` writes pass/fail/hold rows.
  `createReworkWorkOrder` clones the parent WO with
  `parentWorkOrderId` + incremented `reworkDepth`, and throws
  `GateFailure` at the depth-2 cap so supervisor escalation surfaces
  via the GateBanner. `recordConcession` logs ship-with-concession
  approvals.
- **B7 Subcontract** — `releaseSubcontract` creates a PO + a
  `SubcontractDispatch` in `subcontract_in_transit`, plus a `sub_out`
  StockMovement to the `SUBCONTRACT` pseudo-location.
  `receiveSubcontract` closes the chain with a `sub_in` movement.

**Validation gates** — all four named gates from the spec are exported
as `evaluateSoToJob`, `evaluatePlanToMake`, `evaluateMakeToShip`, and
`evaluateShipToBook`. Each returns `GateFailureDetail[]`; the
`AdvanceButton` calls one of them before firing the mutation and
forwards failures to the `GateBanner` for display.

**Phase E — universal Order page** — landed at
[components/workflow/](apps/web/src/components/workflow/):

- `JourneyStepper` renders the 10-stage strip with completion + current
  + blocked states.
- `GateBanner` surfaces gate failures with an optional deep-link.
- `RouteChip` colour-codes MTO / ETO / Catalogue / MTS.
- `AdvanceButton` runs evaluate → mutate → success/failure forwarding.
- `OrderJourneyPage` is a single-page detail view subscribing to one SO
  + its pick lists + its variations. Registered at
  `/sell/orders/:id/journey`. Demo buttons exercise B3 + B5 mutations
  inline. Existing per-module screens stay as queue views; this page is
  the universal detail view per Phase E.

**Tests** — `src/test/unit/workflowService.test.ts` covers all seven
archetypes' happy paths plus negative gate paths (inactive product
rejection, rework-cap escalation). 15 new tests; full suite passes
**62/62**. `tsc --noEmit` baseline preserved (6 pre-existing errors
unchanged).

---

## Phase D — Per-archetype UI surfaces (landed)

Following components ship under [components/workflow/](apps/web/src/components/workflow/):

- **`VOImpactPanel`** — surfaces a `VariationOrder` with cost delta
  (sign + colour), schedule delta (day count + amber/green tone),
  scope-type badge (additive/descope/mixed), Approve + Reject CTAs.
  Wired into the OrderJourneyPage Variation orders section.
- **`SubcontractTimeline`** — 6-step lifecycle visualization
  (Released → In transit out → At supplier → Returning → Received →
  Closed) with current step highlighted. Shows WO ref + supplier +
  material model badge.
- **`QcReworkInspector`** — inline Pass/Fail/Hold per WO; on Fail
  opens the disposition picker (Rework / Scrap / Use-as-is /
  Return-to-vendor). Supervisor-escalation banner appears at
  `reworkDepth >= 2` and disables the Rework option.
- **`JobGraphMini`** — parent-child Job tree with source chips
  colour-coded by source. Each node deep-links to the underlying SO's
  journey page.
- **`RouteOverrideSelect`** — inline dropdown next to RouteChip on
  the SO line table; disabled once the line is no longer pending.
- **`EntityPeek`** — hover-card cross-reference for
  job/workOrder/salesOrder/supplier/product with compact summaries.
- **`DefaultRouteEditor`** — added to shared/ProductDetail's
  Manufacturing tab. Shows the four route options with hints; the
  active one renders with hint text below.

Dedicated admin pages:

- **`ReorderRulesPage`** at `/plan/reorder-rules` — per-product rule
  table with editable on-hand cells, reorderPoint / reorderQty / lead
  time / shortageBehaviour / enabled columns. "Run monitor now" CTA
  fires the cron mutation manually for demo. Recent replenishment Jobs
  list at the bottom.
- **`EngineeringJobsPage`** at `/plan/engineering` — filters
  `source: 'engineering'` Jobs awaiting BoM publication. Per-row
  "Publish BoM" action fires the workflow mutation and links to the
  spawned production Job. Embedded `JobGraphMini` shows the engineering
  → production parent-child chain.

Discoverability: existing `SellOrderDetail` now has a **View journey**
button in the header that deep-links to `/sell/orders/:id/journey`.

Verified live in the browser preview:
- VO impact panel renders `+$1,500 / +3 days` with Approve/Reject buttons.
- Subcontract timeline renders all 6 lifecycle steps with `Received`
  highlighted.
- Reorder Rules page shows 2 product rules with editable on-hand cells.
- Engineering Jobs page renders with helpful empty-state.
- Manufacturing tab on Product Detail shows the route editor with
  "MTO — Make-to-Order — Full Plan → Make path on every sale".
- Zero console errors. tsc baseline preserved. 62/62 tests pass.
