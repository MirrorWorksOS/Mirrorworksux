# Book Settings — dev stub

User doc: [`docs/user/modules/book/settings.md`](../../../user/modules/book/settings.md)

- **Route:** `/book/settings`
- **Component:** `apps/web/src/components/book/BookSettings.tsx`
- **Implements:** ARCH 00 §4.7 group-permission model.
- **Permission keys:** `documents.scope`, `invoices.create`, `expenses.scope`, `po.approve`, `xero.access`, `settings.access`, `reports.access`.
- **Default groups:** `Accounts Receivable`, `Accounts Payable`, `Expenses`.
- **Panels:** General, Invoicing, Xero Integration, Reports, Access & Permissions.
- **TODO:** wire group/permission mutations (all currently toast-only); implement Xero OAuth; add `super_admin` override path.
