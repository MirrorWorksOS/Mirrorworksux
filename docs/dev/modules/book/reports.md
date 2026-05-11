# Reports Gallery — dev stub

User doc: [`../../user/modules/book/reports.md`](../../../user/modules/book/reports.md)

- **Route:** `/book/reports`
- **Component:** `apps/web/src/components/book/ReportsGallery.tsx`
- **Services used:** none — static `xeroReports`, `mwReports`, `scheduled` arrays
- **Known gaps:** All action buttons fire `toast` only; no generation or scheduling backend.
- **TODO:** wire Xero integration (OAuth2, endpoints); add schedule CRUD service; move metadata to config; tier gate (Expand+ for WIP, Produce+ for P&L).

## Components Used
- `@/components/shared/data/MwDataTable`
- `@/components/shared/layout/PageHeader`
- `@/components/shared/layout/PageShell`
- `@/components/shared/layout/PageToolbar`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/switch.tsx`
- `apps/web/src/components/ui/utils.tsx`

## Logic / Behaviour
- Local state drives search/filter and derived visible lists.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.

## Notes — header CTAs wired (2026-05-08)

Per `65dbf388`, both header buttons that previously had no handler now toast:

| Button | Toast |
|---|---|
| **Schedule report** | `toast('Schedule a report')` |
| **Custom report** (yellow) | `toast.success('Custom report builder opened')` |

## Related Files
- `apps/web/src/components/book/ReportsGallery.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/switch.tsx`
- `apps/web/src/components/ui/utils.tsx`
