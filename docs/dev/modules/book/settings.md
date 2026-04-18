# Book Settings — dev stub

User doc: [`docs/user/modules/book/settings.md`](../../../user/modules/book/settings.md)

- **Route:** `/book/settings`
- **Component:** `apps/web/src/components/book/BookSettings.tsx`
- **Implements:** ARCH 00 §4.7 group-permission model.
- **Permission keys:** `documents.scope`, `invoices.create`, `expenses.scope`, `po.approve`, `xero.access`, `settings.access`, `reports.access`.
- **Default groups:** `Accounts Receivable`, `Accounts Payable`, `Expenses`.
- **Panels:** General, Invoicing, Xero Integration, Reports, Access & Permissions.
- **TODO:** wire group/permission mutations (all currently toast-only); implement Xero OAuth; add `super_admin` override path.

## Components Used
- `@/components/shared/feedback/ConfirmDialog`
- `@/components/shared/settings/ModuleSettingsLayout`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/label.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/switch.tsx`
- `apps/web/src/components/ui/select.tsx`
- `apps/web/src/components/ui/utils.tsx`

## Logic / Behaviour
- Behavior is largely client-side React state and memoized derivations.

## Dependencies
- No explicit store/service/hook dependency imported in this component.

## Known Gaps / Questions
- Code includes explicit placeholder/legacy markers; some interactions are transitional.
- Multiple actions resolve to toast feedback, which may indicate incomplete mutation wiring.

## Related Files
- `apps/web/src/components/book/BookSettings.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/label.tsx`
- `apps/web/src/components/ui/badge.tsx`
- `apps/web/src/components/ui/switch.tsx`
- `apps/web/src/components/ui/select.tsx`
- `apps/web/src/components/ui/utils.tsx`
