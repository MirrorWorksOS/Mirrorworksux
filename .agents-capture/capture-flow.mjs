// Capture the full quote→invoice flow from the worktree build (PR #44)
// for the FigJam click-through section. SPA navigation only after first
// load — the mock store is in-memory and resets on full page loads.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:5199';
const OUT = new URL('./shots/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(15000);

const spa = async (path) => {
  await page.evaluate((p) => {
    window.history.pushState({}, '', p);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
  await page.waitForTimeout(1200);
};

const shot = async (name) => {
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}${name}.png` });
  console.log('shot:', name);
};

const clickIfVisible = async (locator, label) => {
  try {
    await locator.first().click({ timeout: 5000 });
    console.log('clicked:', label);
    await page.waitForTimeout(1500);
    return true;
  } catch (e) {
    console.log('SKIP (not clickable):', label, '—', String(e).split('\n')[0]);
    return false;
  }
};

// 1 · Quote
await page.goto(`${BASE}/sell/quotes/qt-001`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await shot('01-quote');

// 2 · Sales order detail (route chips, fulfilment policy)
await spa('/sell/orders/so-003');
await shot('02-sales-order');

// 3 · Journey: confirm SO → ONE Job + MOs (gate G1)
await spa('/sell/orders/so-003/journey');
await shot('03-journey-before-confirm');
await clickIfVisible(page.getByText('Confirm SO + dispatch lines'), 'B1 confirm');
await shot('04-journey-job-created');

// 4 · MO release to floor (gate G2)
await spa('/make/manufacturing-orders/mo-005');
await shot('05-mo-before-release');
await clickIfVisible(page.getByRole('button', { name: /release to floor/i }), 'release MO');
await shot('06-mo-released');

// 5 · Buy branch: goods receipt (gate G5)
await spa('/buy/receipts');
await shot('07-goods-receipt');

// 6 · Dispatch (gate G3)
await spa('/ship/orders');
await shot('08-ship-orders');
await clickIfVisible(page.getByText('SH-003', { exact: false }), 'open SH-003');
await shot('09-dispatch-gate');

// 7 · Milestone invoicing (gate G4) — back on the journey
await spa('/sell/orders/so-003/journey');
await page.waitForTimeout(800);
const raise = page.getByRole('button', { name: /raise/i });
await clickIfVisible(raise, 'raise milestone invoice');
await shot('10-invoice-milestones');

// 8 · Invoice in Book with milestone link
await spa('/book/invoices');
await shot('11-book-invoices');

// 9 · ETO approval queue + RMA (bonus frames)
await spa('/plan/engineering');
await shot('12-eto-approval');
await spa('/ship/returns');
await shot('13-rma');

await browser.close();
console.log('done');
