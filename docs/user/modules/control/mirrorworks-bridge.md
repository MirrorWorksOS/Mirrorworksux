# MirrorWorks Bridge

## Summary
MirrorWorks Bridge screen. Behavior is documented from current component implementation.

## Route
`/control/mirrorworks-bridge`

## User Intent
Complete guided setup/import steps with clear progression and validation.

## Primary Actions
- Review current records and execute available CTA actions.

## Key UI Sections
- Form controls for editing/creation.

## Data Shown
- Page-specific records and controls shown in current UI implementation.

## States
- default
- populated

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

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- No explicit placeholder text found in current component.
- Action persistence paths are not fully visible in this component alone.

## Known Gaps / Questions
- No explicit incomplete marker found; validate with integrated runtime and backend contracts.

## Related Files
- `apps/web/src/components/bridge/BridgeWizard.tsx`
- `apps/web/src/hooks/useBridge`
