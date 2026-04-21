# Stock Valuation

## Summary
Stock valuation screen. Behavior is documented from current component implementation.

## Route
`/book/stock-valuation`

## User Intent
Complete stock valuation work and move records to the next stage.

## Primary Actions
- Use modal/sheet interactions for edits and quick actions.

## Key UI Sections
- Page header with title, subtitle, and action buttons.
- KPI/summary card strip.
- Charts and trend cards.
- **Costing method selector** with five options:
  - **FIFO** (first in, first out)
  - **LIFO** (last in, first out)
  - **Weighted Average (AVCO)** — standard industry name
  - **Standard Cost** — based on product-level standard cost
  - **Actual Cost** — based on real consumed cost from the job
- Form controls for editing/creation.

## Data Shown
- Product/material/BOM and inventory planning records.

## States
- default
- blocked
- populated

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- No explicit placeholder text found in current component.
- Action persistence paths are not fully visible in this component alone.
