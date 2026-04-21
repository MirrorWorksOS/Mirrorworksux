# Bridge Wizard

## Summary
8-step onboarding wizard that ingests customer data (CSV / manual) into MirrorWorks and maps it to MW entities. See `StepReviewConfirm` for the post-import validation + sandbox preview.

## Route
`/bridge`

## Steps
1. Source select — where does the data live (Odoo export, Xero, CSV, manual)
2. Scope questions — what modules they want to onboard
3. File upload — CSV / XLSX ingest
4. Field mapping — source columns → MW fields
5. Manual entry — gap-fill
6. **Review / Confirm** — validation table + *Preview in context* sandbox
7. Import results — success / failure counts
8. Team setup — invite users

## Review / Confirm step — Preview in context
Added in PR #15. After the `MwDataTable` validation preview, the Review step now renders a **"Preview in context"** section:
- Entity tab bar (auto-selects the first non-empty entity)
- Grid of up to 5 sample records per entity, rendered as small cards — not a full table
- Gives the user a sanity check that fields mapped correctly before clicking Import

State: `previewEntity` (`useState<string | null>`); auto-seeded via `useEffect` with the first entity that has preview records.

## User Intent
Complete guided setup with clear progression, live validation, and confidence in the mapping before committing.

## Primary Actions
- Navigate steps (Back / Continue)
- Exclude flagged records in Review
- Browse sample records per entity in the sandbox preview
- Confirm import

## Key UI Sections
- `BridgeStepper` — step header
- Step components (one per route above)
- Review step: `MwDataTable` + `ShieldCheck`-headed sandbox preview

## Components Used
- `@/components/bridge/BridgeStepper`
- `@/components/bridge/steps/StepFieldMapping`
- `@/components/bridge/steps/StepFileUpload`
- `@/components/bridge/steps/StepImportResults`
- `@/components/bridge/steps/StepManualEntry`
- `@/components/bridge/steps/StepReviewConfirm` — now includes sandbox preview
- `@/components/bridge/steps/StepScopeQuestions`
- `@/components/bridge/steps/StepSourceSelect`
- `@/components/bridge/steps/StepTeamSetup`

## Logic / Behaviour
- `useBridge()` hook owns wizard state (files, previewRecords, mapping, excluded IDs).
- Review step auto-selects the first entity with records for the sandbox preview.

## Dependencies
- `@/hooks/useBridge`

## Known Gaps / Questions
- Sandbox preview is sample-only (first 5 records). Real cross-module browsing (nav to Sell with imported customers pre-loaded) is still a future feature — see Global Shop gap analysis.
- No per-entity icon or metadata beyond the tab label.

## Related Files
- `apps/web/src/components/bridge/BridgeWizard.tsx`
- `apps/web/src/components/bridge/steps/StepReviewConfirm.tsx`
- `apps/web/src/hooks/useBridge.ts`
