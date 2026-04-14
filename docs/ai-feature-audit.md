# MirrorWorks AI Feature Audit

This document maps the current AI-labeled surfaces in the repo, what they actually do today, and what the backend should look like if MirrorWorks moves these features onto a real Convex-backed product.

## Executive Summary

- The current repo is primarily a frontend prototype. Most AI behavior is mocked in React state, mock services, or localStorage-backed Zustand stores.
- From a product and UX standpoint, MirrorWorks can still market many recommendation surfaces as AI even when the backend is rules-, optimization-, or model-driven rather than LLM-driven.
- The strongest real AI candidates are:
  - natural-language assistant and command surfaces
  - quote/document/CAD extraction
  - Product Studio generation and explanation
  - workflow generation from prompts
- Many other "AI" surfaces should not start with an LLM. They are better implemented as:
  - Convex queries and aggregations
  - deterministic rules and scoring
  - forecasting / anomaly models
  - optimization logic
- There is no Convex integration in the repo yet. Recommendations below assume Convex is the target operational datastore and function runtime.

## Recommended Backend Patterns

Use these labels consistently when implementing:

- `Convex query + rules`: plain database reads, filters, thresholds, joins, and deterministic scoring.
- `Optimization / math`: scheduling, capable-to-promise, EOQ, margin calculations, stock projections.
- `LLM call`: freeform natural language, generation, explanation, summarization, schema-constrained JSON generation.
- `RAG`: only when the answer depends on unstructured documents, SOPs, uploaded files, or historical notes not already normalized in Convex.
- `ML / forecasting`: lead scoring, win probability, anomaly detection, demand forecasting, ETA prediction.
- `Multimodal extraction`: OCR, CAD/document parsing, vision, and LLM-assisted normalization into structured records.

Important: these are backend implementation classes, not mandatory user-facing labels. A feature can still be presented in-product as MirrorWorks AI or MirrorWorks Agent if that creates a more coherent mental model for users.

## Shared Platform / Cross-Module AI

### Command and agent surfaces

| Surface | Files | What it does today | Recommended backend |
| --- | --- | --- | --- |
| `AiCommandBar` | `src/components/shared/ai/AiCommandBar.tsx`, `src/components/shared/dashboard/ModuleDashboard.tsx` | Opens a modal with canned mock replies per module after a timeout. | `LLM call` for orchestration plus `Convex query + rules` tool calls. Add `RAG` only for docs/SOP answers. |
| `AgentBar` | `src/components/shared/ai/AgentBar.tsx` | Sends user prompt into the command palette with suggested prompt chips. | Same as above. Treat as a launcher, not a model surface itself. |
| `AgentChat` / `agentStore` / `agent-mock-responses` | `src/components/shared/agent/*`, `src/store/agentStore.ts` | Stores local conversations and returns keyword-triggered mock answers. | `LLM call` with tool-calling into Convex. Add `RAG` for documents, notes, manuals, QC reports, and uploaded files. |

### Insight presentation components

| Surface | Files | What it does today | Recommended backend |
| --- | --- | --- | --- |
| `AIFeed` | `src/components/shared/ai/AIFeed.tsx`, `src/components/shared/ai/ai-feed-mock-data.ts` | Renders static module insight cards. | Mostly `Convex query + rules` and `ML / forecasting`; use LLM only to rewrite findings into natural language if needed. |
| `AIInsightCard` | `src/components/shared/ai/AIInsightCard.tsx` | Presentation wrapper for insight banners. | No AI needed here; feed it structured outputs from other services. |
| `AISuggestion` | `src/components/shared/ai/AISuggestion.tsx` | Presentation wrapper for apply/dismiss recommendations. | No AI needed here; pair with structured recommendation records and audit logs. |
| `IntelligenceHub` | `src/components/shared/ai/IntelligenceHub.tsx` | Renders generic insight cards and mock refresh states. | Same as `AIFeed`: mainly `Convex query + rules`, `Optimization / math`, and selective `ML / forecasting`. |

## Sell Module

### AI surfaces

| Surface | Files | What it does today | Recommended backend |
| --- | --- | --- | --- |
| Quote assistant | `src/components/sell/QuoteAssistantBar.tsx` | Detects simple intents from text and returns mock line items, pricing history, CTP, margin actions, and similar quotes. | Hybrid. Use `Convex query + rules` for history, margin updates, and CTP inputs; `Optimization / math` for delivery dates and margins; `LLM call` only for flexible natural-language parsing and structured action selection. |
| Quote heuristic panel | `src/components/sell/QuoteHeuristicPanel.tsx` | Shows win probability, price competitiveness, margin suggestions, and risk flags from mock heuristic data. | Start with `Convex query + rules`; graduate win probability and price-fit to `ML / forecasting`. Avoid RAG. |
| Lead score indicator | `src/components/sell/LeadScoreIndicator.tsx` | Displays an AI score ring with static factor labels. | `ML / forecasting` or deterministic scoring over CRM features in Convex. No LLM required. |
| DXF upload analysis | `src/components/sell/DxfUploadPanel.tsx` | Simulates upload and returns mock cut time, yield, utilization, and cost. | `Multimodal extraction` plus geometry/CAD parsing and `Optimization / math`. Use LLM only to normalize or explain extracted results. |
| Quote upload zone | `src/components/sell/QuoteUploadZone.tsx` | AI-branded upload entry for auto-generating quote lines. | `Multimodal extraction`; optionally `RAG` against product/material catalog if matching uploaded items to internal SKUs. |
| Opportunity AI feed | `src/components/sell/SellDashboard.tsx`, `src/components/sell/SellOpportunityPage.tsx`, `src/components/sell/sell-opportunity-agent-feed.tsx`, shared `AIFeed` | Shows static pipeline insights and recommended actions. | Mostly `Convex query + rules` and later `ML / forecasting` for churn/win risk. |
| New quote AI suggestion | `src/components/sell/SellNewQuote.tsx` | Shows a static suggestion banner and plugs in `QuoteAssistantBar`. | Same as quote assistant. |
| Product-detail AI pricing | `src/components/shared/product/ProductDetail.tsx` | Shows static "AI-Suggested Price" text. | `Optimization / math` first, then `ML / forecasting` for price recommendation. No RAG. |

### What should not be overbuilt with AI

- Margin application and quote math should be deterministic.
- CTP should come from planning/capacity logic, not an LLM.
- Competitive position can be model-driven, but the explanation text can be LLM-generated second.

## Buy Module

### AI surfaces

| Surface | Files | What it does today | Recommended backend |
| --- | --- | --- | --- |
| Purchase planning AI suggestions | `src/components/buy/BuyPlanningGrid.tsx` | Shows static suggestions about consolidation, stock risk, and timing. | `Optimization / math` and `Convex query + rules`; add `ML / forecasting` for demand prediction later. |
| Buy dashboard insight feed | `src/components/buy/BuyDashboard.tsx`, shared `AIFeed` | Static procurement insights. | Mostly `Convex query + rules`, optionally `ML / forecasting` for supplier ETA risk and demand. |
| Supplier performance insight cards | `src/components/buy/BuyOrderDetail.tsx` and related surfaces | Static AI banners on supplier/order detail views. | `Convex query + rules`; maybe `ML / forecasting` for late-delivery risk. |

## Plan Module

### AI surfaces

| Surface | Files | What it does today | Recommended backend |
| --- | --- | --- | --- |
| BOM generator | `src/components/plan/BomGenerator.tsx`, `src/services/planService.ts` | Simulates upload, then shows mock extracted BOM rows with confidence badges. | `Multimodal extraction` for PDF/DXF/image parsing, plus catalog matching against Convex. Use `RAG` only for unstructured engineering docs; use LLM to normalize uncertain rows into schema-valid BOM lines. |
| Planning intelligence hub | `src/components/plan/PlanIntelligenceHubTab.tsx` | Mixes static AI suggestions, static budget insight, and mock chat replies. | `Optimization / math` for schedule/resource suggestions, `Convex query + rules` for budget variance, `LLM call` only for conversational explanation. Keep these unified under one Agent presentation pattern in the UI. |
| Plan overview chat | `src/components/plan/PlanOverviewTab.tsx` | Mock "I've analyzed the job data" chat replies. | `LLM call` over structured planning tools, not a standalone chat model with no tool access. |
| Plan dashboard AI feed | `src/components/plan/PlanDashboard.tsx`, shared `AIFeed` | Static planning insights. | `Convex query + rules` plus scheduling risk scores and forecasting. |
| Budget AI insight | `src/components/plan/PlanBudgetTab.tsx` | Static budget recommendation card. | `Convex query + rules` and `Optimization / math`. |
| Product Studio AI | `docs/product-studio-spec.md` | Spec defines text-to-product, CAD-to-product, explainers, validation, refactors, tests, spreadsheet-to-product, and auto-doc. | This is the strongest `LLM call` use-case in the repo. Use schema-constrained generation into product-engine JSON, with `RAG` over materials/finish/process libraries and `Multimodal extraction` for CAD/photo/spreadsheet ingestion. |
| Product-detail planning insight | `src/components/shared/product/ProductDetail.tsx` | Static recommendation about safety stock and EOQ. | `Optimization / math` over demand history in Convex. |

### Product Studio backend recommendation

The Product Studio spec is directionally right. The best architecture is:

1. Store canonical product-engine JSON in Convex.
2. Give the model a strict schema and ask it for patches, not freeform text blobs.
3. Retrieve library entities from Convex before generation:
   - materials
   - finishes
   - operations
   - machine/process capabilities
   - pricing rules
4. Run validators after every model output.
5. Show a diff before applying changes in the frontend.

Do not let the model bypass the structured engine.

## Make Module

### AI surfaces

| Surface | Files | What it does today | Recommended backend |
| --- | --- | --- | --- |
| Make dashboard AI feed | `src/components/make/MakeDashboard.tsx`, shared `AIFeed` | Static quality, downtime, and release suggestions. | Primarily `Convex query + rules`; evolve quality/downtime into `ML / forecasting` or anomaly detection as telemetry matures. |
| MO detail AI cards/feed | `src/components/make/MakeManufacturingOrderDetail.tsx` | Static production-signal cards and feed. | Same as above. |
| Shop-floor intelligence/chat | `src/components/shop-floor/OverviewTab.tsx`, `src/components/shop-floor/IntelligenceHubTab.tsx` | Mock operator/assistant messages and static feed suggestions. | `LLM call` for operator UX, backed by tool calls into Convex. Add `RAG` for SOPs, machine manuals, setup instructions, and NCR history. |

## Ship Module

### AI surfaces

| Surface | Files | What it does today | Recommended backend |
| --- | --- | --- | --- |
| Ship dashboard AI feed | `src/components/ship/ShipDashboard.tsx`, shared `AIFeed` | Static carrier delay and dispatch insights. | `Convex query + rules` first; `ML / forecasting` later for ETA and carrier-delay prediction. |
| Agent/assistant shipping answers | shared agent components | Mock shipping Q&A. | `LLM call` with tool access to shipment records and exception events. `RAG` only if answering from carrier docs/SLA docs. |

## Book Module

### AI surfaces

| Surface | Files | What it does today | Recommended backend |
| --- | --- | --- | --- |
| Job cost AI insight | `src/components/book/JobCostDetail.tsx` | Static insight banner. | `Convex query + rules` and variance calculations. |
| Book dashboard AI feed | `src/components/book/BookDashboard.tsx`, shared `AIFeed` | Static finance insights. | `Convex query + rules` and cashflow forecasting models. |
| Finance/product-detail AI pricing insight | `src/components/shared/product/ProductDetail.tsx` | Static profitability/pricing hint. | `Optimization / math` first, optional `ML / forecasting` later. |

### What should stay deterministic

- invoice ageing
- overdue exposure
- budget vs actual
- contribution margin
- break-even
- stock valuation

LLM usage here should mostly be for explanation, not calculation.

## Control / Bridge Module

### AI surfaces

| Surface | Files | What it does today | Recommended backend |
| --- | --- | --- | --- |
| Workflow designer AI generation | `src/components/control/ControlWorkflowDesigner.tsx`, `src/components/control/WorkflowCanvas.tsx` | Lets users type a prompt and simulates workflow generation with canned nodes/UI. | `LLM call` that outputs schema-valid workflow JSON. No RAG by default; retrieve workflow schema, allowed node types, and field metadata from Convex before generation. |
| Bridge ingest pipeline | `src/services/bridgeService.ts`, `src/components/bridge/*`, `src/components/control/MirrorWorksBridge.tsx` | Upload/analyse/match flow is mocked, but there is a clear ingest pipeline including `triggerAIMatch`. | `Multimodal extraction` for files, entity classification, and header mapping. Use `LLM call` for ambiguous column matching and normalization; use `RAG` only if mapping against customer-specific reference docs. |
| Team setup role suggestions | `src/services/bridgeService.ts` | Mock title-to-group suggestions with confidence scores. | Start with `Convex query + rules`; optionally small classifier later. No LLM needed initially. |
| Control AI suggestion cards | `src/components/control/ControlWorkflowDesigner.tsx` and shared components | Static recommendation banners. | Presentation only; feed from real workflow validation and generation services. |

## Shared Product Detail Surfaces

These surfaces appear in a shared product detail view used across Sell, Plan, and Make:

| Surface | Files | What it does today | Recommended backend |
| --- | --- | --- | --- |
| Agent insights panel | `src/components/shared/product/ProductDetail.tsx` | Static sales/vendor/demand insights. | Mostly `Convex query + rules`; optionally `ML / forecasting` for seasonality and supplier risk. |
| AI-suggested price | `src/components/shared/product/ProductDetail.tsx` | Static suggested price text. | `Optimization / math` first, then `ML / forecasting` if training data exists. |
| AI planning recommendation | `src/components/shared/product/ProductDetail.tsx` | Static stock/safety-stock recommendation. | `Optimization / math` over demand history and stock policy. |

## Bottom Line

MirrorWorks already has a strong AI-shaped frontend language, and it is reasonable to keep that language in the product even when some recommendations are powered by rules, optimization, or forecasting rather than an LLM. The right path is not "put an LLM behind every badge." The better architecture is:

- Convex for structured operational truth
- rules and optimization for planning, costing, and logistics
- models for scoring and forecasting where enough data exists
- LLMs for generation, explanation, and flexible language interfaces
- RAG only when unstructured docs are actually required
