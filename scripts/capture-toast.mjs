// Re-capture of the published state for shot 6: the app's fixed toast overlaps "Unpublish" inside the
// Publishing bar at this viewport, so the bar is captured with the toast hidden and the toast on its own;
// the shot composites the toast left of the buttons (styleframe f2). Run with the Kindred app at BASE.
import { chromium } from 'file:///E:/animal%20rescue%20platform/node_modules/playwright/index.mjs';

const BASE = process.env.BASE ?? 'http://localhost:5191';
const OUT = 'public/textures';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
const page = await ctx.newPage();

// Same starting state as capture.mjs step 0: the group's page is public.
await page.goto(`${BASE}/dashboard`);
await page.getByRole('button', { name: 'Publish page' }).click();
await page.getByRole('heading', { name: 'Visitors can see your page' }).waitFor();

await page.goto(`${BASE}/dashboard/edit/rescues/juniper`);
await page.mouse.move(1910, 1070);
await page.waitForLoadState('networkidle');
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1200);

await page.getByRole('button', { name: 'Publish', exact: true }).click();
await page.waitForTimeout(450);
const toast = page.locator('.kd-toast').first();
await toast.waitFor();
await toast.screenshot({ path: `${OUT}/toast-live.png`, omitBackground: true });
const tb = await toast.boundingBox();
await page.evaluate(() => document.querySelectorAll('.kd-toast').forEach((e) => { e.style.visibility = 'hidden'; }));
await page.mouse.move(1910, 1070);
await page.waitForTimeout(200);
await page.getByRole('region', { name: 'Publishing' }).screenshot({ path: `${OUT}/pubbar-live.png` });
const bar = await page.getByRole('region', { name: 'Publishing' }).boundingBox();
const unpub = await page.getByRole('button', { name: 'Unpublish' }).boundingBox();
console.log(JSON.stringify({ toast: tb, bar, unpub }));
await browser.close();
