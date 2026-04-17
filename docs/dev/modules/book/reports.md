# Reports Gallery — dev stub

User doc: [`../../user/modules/book/reports.md`](../../../user/modules/book/reports.md)

- **Route:** `/book/reports`
- **Component:** `apps/web/src/components/book/ReportsGallery.tsx`
- **Services used:** none — static `xeroReports`, `mwReports`, `scheduled` arrays
- **Known gaps:** All action buttons fire `toast` only; no generation or scheduling backend.
- **TODO:** wire Xero integration (OAuth2, endpoints); add schedule CRUD service; move metadata to config; tier gate (Expand+ for WIP, Produce+ for P&L).
