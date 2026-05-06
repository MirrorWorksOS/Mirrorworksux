# Configure Xero Mapping

## Summary

The Configure Mapping page is where a finance lead wires MirrorWorks's revenue, cost, bank, tax, tracking, and branding categories to the right Xero accounts. Once mapping is set up, every invoice, bill, and expense MirrorWorks pushes to Xero lands in the right account with the right tax code.

Reach it from **Book → Settings → Xero Integration → Configure mapping**.

## Route

`/book/settings/xero/mapping`

## User intent

- See which MirrorWorks categories are already mapped, and which still need attention.
- Map an unmapped category to a Xero account in a few clicks.
- Use **Auto-map by name** to handle the obvious cases in one go.
- Set tax codes, tracking categories, and invoice branding defaults.
- Pull the latest list of accounts, tax rates, and themes from Xero whenever your accountant adds new ones.

## Page layout

- **Header** — *Configure account mapping*, with the connected Xero org name and currency badge, plus a top-right **Pull latest from Xero** button.
- **Status banner** — a progress bar across the top: how many categories are mapped out of the total. If anything required is still unmapped, a red badge calls it out. Two buttons sit on the right: **Auto-map by name** and an overflow menu with **Reset all to factory defaults** and **Export mapping (CSV)**.
- **Two-pane workspace** — left sidebar with six sections; right pane with the rows for the selected section.
- **Sticky footer** — bottom of the page; appears once you've made a change. Shows "X changes" + **Discard** / **Save** buttons. Nothing is persisted until you click Save.

## The six sections

| Section | What it covers | Required? |
|---|---|---|
| **Sales** | Revenue accounts, AR, sales tax codes used on invoices. | Yes — every row marked Required must be mapped. |
| **Purchases & costs** | Material, subcontract, freight, AP, expense categories used on bills and expenses. | Yes for required rows. |
| **Bank & system** | Bank accounts, rounding, GST clearing, system-managed accounts (Xero owns these — read-only). | Mostly auto-managed by Xero. |
| **Tax codes** | Maps each MirrorWorks tax type to a Xero tax rate. | Yes — every line item carries one. |
| **Tracking** | Maps a MirrorWorks dimension (e.g. *Job* or *Cost centre*) to a Xero Tracking Category. Optional auto-create-missing-options switch. | Optional — only set up if your Xero file uses Tracking. |
| **Branding** | Defaults for invoice branding theme, credit-note theme, default invoice status, due-date offset, and reference template. | Yes — every invoice picks these up. |

A small dot next to each section in the sidebar tells you the status: green when complete, amber when partial, red when something required is unmapped.

## Mapping a row

Each row has:

- **Source label** on the left — e.g. *Sales — Cut & fold revenue*.
- **Xero account picker** — searchable, grouped by account class (Asset / Liability / Equity / Revenue / Expense). System accounts (Debtors, Creditors, GST, …) are tagged with a small *system* badge and can't be re-pointed.
- **Tax rate picker** (where it applies) — searchable list of every active Xero tax rate.

Pick an account → the diff count in the footer ticks up. **Save** to persist; **Discard** to roll back to whatever was saved last.

## Auto-map by name

Useful for the first-time setup or after a Xero refresh adds a stack of new accounts.

1. Click **Auto-map by name** in the status banner.
2. The dialog lists every unmapped row with the closest account name match. Each suggestion is selected by default; un-tick anything you don't trust.
3. Click **Apply suggestions**. Selected rows get the suggested account code; nothing is saved yet — you still need to click **Save** in the footer.

The matcher is name-similarity only — it gets the obvious ones (e.g. "Sales — Cut & fold" → "Cut & Fold Revenue") but you'll usually still need to manually map a few rows.

## Pull latest from Xero

Click in the top-right header. Refreshes the dropdown options — accounts, tax rates, tracking categories, branding themes — from Xero. Nothing about your existing mapping changes; you're just refreshing the *list* of choices. A toast confirms the counts ("Pulled 47 accounts, 8 tax rates, 2 tracking, 2 themes").

Run this whenever your accountant has added a new account in Xero and you want to point a MirrorWorks category at it.

## Reset all to factory defaults

Overflow menu in the status banner. Snaps every row in your draft to the MirrorWorks recommended defaults. Footer goes red with a big diff count — review carefully and either Save (commits) or Discard (rolls back).

Use this if a previous accountant has left mapping in a confusing state and you want to restart from a known-good baseline.

## Disconnected state

If Xero isn't connected to your MirrorWorks org, the page shows a centred "Xero is not connected" card with a button back to the Xero Integration panel. Connect Xero there, then come back.

## Common workflows

### First-time setup

1. Click **Auto-map by name** → review and apply.
2. Walk through Sales / Purchases / Bank & system / Tax codes — fill any gaps the auto-map missed.
3. Set tracking only if your Xero file uses Tracking Categories.
4. Set the Branding defaults you want for new invoices.
5. **Save**.

### Recurring maintenance

- After your accountant adds new accounts → **Pull latest** → re-run **Auto-map** → **Save**.
- After tax rules change (e.g. new GST rate) → check **Tax codes** section.

## States

- **default** — config loaded, nothing pending.
- **dirty** — at least one change pending; sticky footer visible with diff count.
- **saving** — Save button disabled with spinner.
- **pulling** — Pull latest button shows spinner.
- **disconnected** — full-card fallback, no sidebar.
- **loading** — page-wide "Loading Xero mapping…" card.

## Related screens

- [Book Settings](./settings.md) — the parent screen with the Xero Integration panel.
