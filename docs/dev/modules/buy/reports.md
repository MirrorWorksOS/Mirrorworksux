<!-- TODO: Dev stub pending content migration from docs/user/modules/buy/reports.md.
     The source file is Mixed (user + developer content). A human editor needs
     to split the dev-facing sections out to this file. Do not hand-copy blindly
     — the audit at docs/audits/dev/AUDIT-buy.md lists accuracy issues (e.g. the
     "No explicit store/service/hook dependency" line is factually wrong for
     nearly every Buy screen). Correct as you split. -->

# reports (dev)

## Route

## Component entrypoint

## Service layer

## Types

## Mock shape

## Stores / React Query keys

## Event flows

## Permission gate (ARCH 00 §4.8)

## Tier gate (Pilot / Produce / Expand / Excel)

## Migration status

## Testing

## Components Used
- `@/components/shared/charts/ChartCard`
- `@/components/shared/charts/ChartPatternDefs`
- `@/components/shared/charts/chart-theme`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/motion/motion-variants`

## Logic / Behaviour
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- No explicit incomplete marker found; validate with integrated runtime and backend contracts.

## Related Files
- `apps/web/src/components/buy/BuyReports.tsx`
