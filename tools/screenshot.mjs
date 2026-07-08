// Renders the interactive mockup into each key state and captures PNGs.
// Uses the globally-installed Playwright + pre-installed Chromium.
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fileUrl = 'file://' + join(root, 'mockups/index.html');
const outDir = join(root, 'screenshots');

// Each shot: id, drive(page) sets the app state, viewport, theme, fullPage.
const SHOTS = [
  { id: '01-home',              w: 1440, h: 940,  full: true,  drive: async p => { await ev(p, `App.go('home')`); } },
  { id: '02-menu-allergens',    w: 1440, h: 1000, full: false, drive: async p => { await ev(p, `App.go('menu'); App._setAllergens(['peanut','shellfish'])`); } },
  { id: '03-menu-full',         w: 1440, h: 1000, full: true,  drive: async p => { await ev(p, `App.go('menu'); App._setAllergens(['peanut','shellfish'])`); } },
  { id: '04-cart-drawer',       w: 1440, h: 1000, full: false, drive: async p => { await ev(p, `App.go('menu'); App._setAllergens(['peanut','shellfish']); App._seedCart({m1:2,m12:1,m23:1}); App._openCart()`); } },
  { id: '05-allergen-modal',    w: 1440, h: 1000, full: false, drive: async p => { await ev(p, `App.go('menu'); App._setAllergens(['peanut','shellfish']); App._openAllergens()`); } },
  { id: '06-signin',            w: 1440, h: 1000, full: false, drive: async p => { await ev(p, `App.go('menu'); App.openSignin('customer')`); } },
  { id: '07-checkout',          w: 1440, h: 1120, full: true,  drive: async p => { await ev(p, `App._signin(); App._seedCart({m1:2,m12:1,m10:1,m23:1}); App.go('checkout')`); } },
  { id: '08-confirmation',      w: 1440, h: 1080, full: true,  drive: async p => { await ev(p, `App._signin(); App._seedCart({m1:2,m12:1,m23:1}); App.placeOrder()`); } },
  { id: '09-account-orders',    w: 1440, h: 960,  full: false, drive: async p => { await ev(p, `App._signin(); App.go('account')`); } },
  { id: '10-account-allergens', w: 1440, h: 960,  full: false, drive: async p => { await ev(p, `App._signin(); App.go('account'); App._setAcctTab('allergens')`); } },
  { id: '11-admin-dashboard',   w: 1440, h: 940,  full: false, drive: async p => { await ev(p, `App._adminAuth(); App.showAdmin('dashboard')`); } },
  { id: '12-admin-menu',        w: 1440, h: 1040, full: true,  drive: async p => { await ev(p, `App._adminAuth(); App.showAdmin('menu')`); } },
  { id: '13-admin-orders',      w: 1440, h: 820,  full: false, drive: async p => { await ev(p, `App._adminAuth(); App.showAdmin('orders')`); } },
  { id: '14-admin-edit',        w: 1440, h: 940,  full: false, drive: async p => { await ev(p, `App._adminAuth(); App.showAdmin('menu'); App._editItem('m8')`); } },
  { id: '15-admin-signin',      w: 1440, h: 900,  full: false, drive: async p => { await ev(p, `App.showAdmin('dashboard')`); } }, // not authed -> staff sign-in
  { id: '16-home-dark',         w: 1440, h: 940,  full: true,  theme: 'dark', drive: async p => { await ev(p, `App.go('home')`); } },
  { id: '17-menu-mobile',       w: 390,  h: 1500, full: true,  drive: async p => { await ev(p, `App.go('menu'); App._setAllergens(['peanut','shellfish'])`); } },
  { id: '18-cart-mobile',       w: 390,  h: 844,  full: false, drive: async p => { await ev(p, `App.go('menu'); App._seedCart({m1:2,m12:1,m8:1}); App._openCart()`); } },
];

const ev = (page, code) => page.evaluate(code);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const errors = [];
const browser = await chromium.launch();

for (const s of SHOTS) {
  const ctx = await browser.newContext({
    viewport: { width: s.w, height: s.h },
    deviceScaleFactor: 2,
    colorScheme: s.theme === 'dark' ? 'dark' : 'light',
  });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(`[${s.id}] ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`[${s.id}] console: ${m.text()}`); });

  await page.goto(fileUrl, { waitUntil: 'load' });
  // hide the prototype navigator + toast for clean, gallery-ready shots
  await page.addStyleTag({ content: '.proto,.toast{display:none!important}' });
  await page.evaluate(() => document.fonts.ready);
  await s.drive(page);
  await sleep(320); // allow transitions/animations to settle
  await page.screenshot({ path: join(outDir, s.id + '.png'), fullPage: s.full });
  console.log('✓ ' + s.id + '.png');
  await ctx.close();
}

await browser.close();
if (errors.length) { console.error('\nJS ERRORS:\n' + errors.join('\n')); process.exit(1); }
console.log('\nAll ' + SHOTS.length + ' screenshots captured with no page errors.');
