# Plan — migration log

Classification rule: each file blends user-facing page overviews (User Intent, Primary Actions, Key UI Sections) with developer content (Components Used, Logic / Behaviour, Dependencies). All 20 are therefore **Mixed** — moved to `docs/user/modules/plan/` and a matching dev stub created at `docs/dev/modules/plan/` containing a TODO marker and a heading list of the dev sections to extract.

| Old path | New path | Classification | Reasoning |
| --- | --- | --- | --- |
| docs/modules/plan/README.md | docs/user/modules/plan/README.md (+ dev stub) | Mixed | Module index with route table (user) + component path references (dev). |
| docs/modules/plan/dashboard.md | docs/user/modules/plan/dashboard.md (+ dev stub) | Mixed | User Intent + KPIs/charts section alongside component import list. |
| docs/modules/plan/jobs.md | docs/user/modules/plan/jobs.md (+ dev stub) | Mixed | Page description with mock-data note and component imports. |
| docs/modules/plan/job-detail.md | docs/user/modules/plan/job-detail.md (+ dev stub) | Mixed | Detail route summary + component tree. |
| docs/modules/plan/schedule.md | docs/user/modules/plan/schedule.md (+ dev stub) | Mixed | UI sections plus `PlanScheduleEngine` component references. |
| docs/modules/plan/product-studio.md | docs/user/modules/plan/product-studio.md (+ dev stub) | Mixed | Page overview + v2 component imports and mock-data note. |
| docs/modules/plan/product-studio-product.md | docs/user/modules/plan/product-studio-product.md (+ dev stub) | Mixed | Dynamic route description + component tree. |
| docs/modules/plan/product-studio-legacy.md | docs/user/modules/plan/product-studio-legacy.md (+ dev stub) | Mixed | Legacy page overview + legacy component paths. |
| docs/modules/plan/product-studio-legacy-product.md | docs/user/modules/plan/product-studio-legacy-product.md (+ dev stub) | Mixed | Dynamic legacy route + component paths. |
| docs/modules/plan/libraries.md | docs/user/modules/plan/libraries.md (+ dev stub) | Mixed | Tabbed page overview + MaterialLibrary/FinishLibrary imports. |
| docs/modules/plan/nesting.md | docs/user/modules/plan/nesting.md (+ dev stub) | Mixed | Page description + KPI/svg render code references. |
| docs/modules/plan/machine-io.md | docs/user/modules/plan/machine-io.md (+ dev stub) | Mixed | Tabbed page overview + component imports. |
| docs/modules/plan/product-detail.md | docs/user/modules/plan/product-detail.md (+ dev stub) | Mixed | Dynamic detail overview + `ProductDetail` reference. |
| docs/modules/plan/products.md | docs/user/modules/plan/products.md (+ dev stub) | Mixed | List page overview + component imports. |
| docs/modules/plan/purchase.md | docs/user/modules/plan/purchase.md (+ dev stub) | Mixed | Page description with mock-data note and component imports. |
| docs/modules/plan/qc-planning.md | docs/user/modules/plan/qc-planning.md (+ dev stub) | Mixed | UI sections with KPI strip and component imports. |
| docs/modules/plan/what-if.md | docs/user/modules/plan/what-if.md (+ dev stub) | Mixed | Scenario page overview + `RushOrderPanel` reference. |
| docs/modules/plan/mrp.md | docs/user/modules/plan/mrp.md (+ dev stub) | Mixed | Page description + card/badge component imports. |
| docs/modules/plan/sheet-calculator.md | docs/user/modules/plan/sheet-calculator.md (+ dev stub) | Mixed | Calculator UI overview + component imports. |
| docs/modules/plan/settings.md | docs/user/modules/plan/settings.md (+ dev stub) | Mixed | Settings UI overview + `ModuleSettingsLayout` and permission keys reference. |
