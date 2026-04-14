# Workflow Designer

## Summary
Workflow Designer screen. Behavior is documented from current component implementation.

## Route
`/control/workflow-designer`

## User Intent
Complete workflow designer work and move records to the next stage.

## Primary Actions
- Create or add records/items.
- Use modal/sheet interactions for edits and quick actions.

## Key UI Sections
- Form controls for editing/creation.
- Embedded AI/assistant insight panels.

## Data Shown
- Configuration settings, rules, and system behavior controls.

## States
- default
- error
- success
- blocked
- populated

## Components Used
- `@/components/animate-ui/icons/route`
- `@/components/shared/ai/AIInsightCard`
- `@/components/shared/feedback/ConfirmDialog`
- `@/components/shared/icons/IconWell`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/textarea.tsx`
- `apps/web/src/components/ui/select.tsx`
- `apps/web/src/components/ui/utils.tsx`
- `apps/web/src/components/control/WorkflowCanvas.tsx`
- `apps/web/src/components/ui/progress.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.
- Routing links and back navigation are handled in-component.
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Design / UX Notes
- No explicit mock marker in this file; verify real-data behavior in integration testing.
- Placeholder/legacy text suggests unfinished UX in parts of this page.
- Some CTAs provide confirmation toasts without obvious persistence in-file.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.

## Related Files
- `apps/web/src/components/control/ControlWorkflowDesigner.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/textarea.tsx`
- `apps/web/src/components/ui/select.tsx`
- `apps/web/src/components/ui/utils.tsx`
- `apps/web/src/components/control/WorkflowCanvas.tsx`
- `apps/web/src/components/ui/progress.tsx`
