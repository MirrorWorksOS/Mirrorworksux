# Developer stub — control/mirrorworks-bridge.md

<!-- TODO: migrate developer-only content from docs/user/modules/control/mirrorworks-bridge.md here. -->

This file is a placeholder created during the 2026-04-18 Control module migration. The
source document at `docs/user/modules/control/mirrorworks-bridge.md` is a Mixed-classification doc (user
intent + component/dependency references in one file). It has not been split yet.

## Sections to migrate

- Components Used (component import list)
- Logic / Behaviour (state model, derivations)
- Dependencies (stores, services, hooks)
- Design / UX Notes (dev-relevant caveats only)
- Known Gaps / Questions (dev-facing)
- Related Files

User-facing sections (Summary, User Intent, Primary Actions, Key UI Sections, Data Shown,
States) remain in `docs/user/modules/control/mirrorworks-bridge.md` until a human editor does the split.

## Components Used
- `@/components/bridge/BridgeStepper`
- `@/components/bridge/steps/StepFieldMapping`
- `@/components/bridge/steps/StepFileUpload`
- `@/components/bridge/steps/StepImportResults`
- `@/components/bridge/steps/StepManualEntry`
- `@/components/bridge/steps/StepReviewConfirm`
- `@/components/bridge/steps/StepScopeQuestions`
- `@/components/bridge/steps/StepSourceSelect`
- `@/components/bridge/steps/StepTeamSetup`

## Logic / Behaviour
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- `@/hooks/useBridge`

## Known Gaps / Questions
- No explicit incomplete marker found; validate with integrated runtime and backend contracts.

## Related Files
- `apps/web/src/components/bridge/BridgeWizard.tsx`
- `apps/web/src/hooks/useBridge`
