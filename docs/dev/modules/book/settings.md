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

## Notes — Xero panel button wiring (2026-05-08)

Per `65dbf388`, the Xero integration panel had four dead buttons that now toast (or, in one case, no longer no-op silently):

| Surface | Button | Was | Now |
|---|---|---|---|
| Sync error banner | **View errors** | bare `<Button>` | `toast('Showing 3 sync errors')` |
| Sync card | **Sync now** | bare `<Button>` | `toast.success('Xero sync started')` |
| Sync card | **Full re-sync** | bare `<Button>` | `toast.success('Full Xero re-sync started')` |
| Connection card | Disconnect confirm | `onConfirm={() => {}}` | `onConfirm={() => toast.success('Xero disconnected')}` |

The disconnect confirm is the most important of the four — `ConfirmDialog` requires an `onConfirm`; the empty body silently swallowed the user's intent.

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
