// Final asset capture for the Kindred promo (pipeline stage 4), adapted from assets/scripts/capture-template.mjs.
// Output: public/textures/*.png (2x) + src/layout.json (CSS-px boxes; page coords for fullPage shots,
// viewport coords for viewport shots). Data: the app's own fictional sample group, cleared by the user.
// Run with the Kindred app served at BASE (vite preview of a fresh build).
import { chromium } from 'file:///E:/animal%20rescue%20platform/node_modules/playwright/index.mjs';
import fs from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:5191';
const OUT = 'public/textures';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
// The public top bar is sticky with a scroll-driven lift; in full-page captures it lands mid-page.
// Keep it in normal flow at the top of the document (what a visitor sees at scroll 0).
await ctx.addInitScript(() => {
  const add = () => { const st = document.createElement('style'); st.textContent = '.kd-topbar{position:relative!important;top:0!important;animation:none!important;transform:none!important;box-shadow:none!important}'; document.head.appendChild(st); };
  if (document.head) add(); else document.addEventListener('DOMContentLoaded', add);
});
const page = await ctx.newPage();
const layout = { viewport: { w: 1920, h: 1080 } };

const settle = async (ms = 900) => {
  await page.mouse.move(1910, 1070); // no hover states in the textures
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(ms);
};
// Box in page coordinates (fullPage shots) or viewport coordinates.
const box = async (loc, viewport = false) => loc.evaluate((e, vp) => {
  const r = e.getBoundingClientRect();
  return vp ? { x: r.x, y: r.y, w: r.width, h: r.height } : { x: r.x + window.scrollX, y: r.y + window.scrollY, w: r.width, h: r.height };
}, viewport);
const boxes = async (loc, viewport = false) => { const out = []; for (let i = 0; i < await loc.count(); i++) out.push(await box(loc.nth(i), viewport)); return out; };
const pageH = () => page.evaluate(() => document.documentElement.scrollHeight);
const shot = (name, opts = {}) => page.screenshot({ path: `${OUT}/${name}.png`, ...opts });
const hide = (sel) => page.evaluate((s) => document.querySelectorAll(s).forEach((e) => { e.style.visibility = 'hidden'; }), sel);
const unhide = (sel) => page.evaluate((s) => document.querySelectorAll(s).forEach((e) => { e.style.visibility = ''; }), sel);
const log = (...a) => console.log(...a);

// 0 · The demo page starts private: publish it from the dashboard, as a group would.
await page.goto(`${BASE}/dashboard`);
await page.getByRole('button', { name: 'Publish page' }).click();
await page.getByRole('heading', { name: 'Visitors can see your page' }).waitFor();

// 1 · For Adoption: default, Dogs, Dogs + Pasig (shots 2, 3, 8)
await page.goto(`${BASE}/second-wind/adopt`);
await settle();
{
  const cards = page.locator('.kd-card--adoption');
  const names = await cards.evaluateAll((els) => els.map((e) => e.querySelector('.kd-card__name')?.textContent ?? ''));
  layout.adopt = {
    pageH: await pageH(), names,
    cards: await boxes(cards),
    chips: await boxes(page.locator('.kd-filters__row .kd-chip')),
    selects: await boxes(page.locator('.kd-selectwrap')),
    summary: await box(page.locator('.kd-filters__summary')),
    filters: await box(page.locator('.kd-filters')),
    heading: await box(page.locator('h1').first()),
  };
  await shot('adopt-full', { fullPage: true });
  for (let i = 0; i < names.length; i++) await cards.nth(i).screenshot({ path: `${OUT}/adopt-card-${i}.png` });
  await hide('.kd-card--adoption');
  await shot('adopt-empty', { fullPage: true });
  await unhide('.kd-card--adoption');
  log('adopt', names, layout.adopt.pageH);

  await page.getByRole('button', { name: 'Dogs', exact: true }).click();
  await settle(500);
  layout.adoptDogs = { pageH: await pageH(), names: await cards.evaluateAll((els) => els.map((e) => e.querySelector('.kd-card__name')?.textContent ?? '')), cards: await boxes(cards), summary: await box(page.locator('.kd-filters__summary')), filters: await box(page.locator('.kd-filters')) };
  await shot('adopt-dogs', { fullPage: true });
  await page.getByRole('button', { name: 'Dogs', exact: true }).screenshot({ path: `${OUT}/chip-dogs-on.png` });

  await page.selectOption('#f-loc', 'Pasig');
  await settle(500);
  layout.adoptPasig = { pageH: await pageH(), names: await cards.evaluateAll((els) => els.map((e) => e.querySelector('.kd-card__name')?.textContent ?? '')), cards: await boxes(cards), summary: await box(page.locator('.kd-filters__summary')), filters: await box(page.locator('.kd-filters')) };
  await shot('adopt-pasig', { fullPage: true });
  await page.selectOption('#f-age', '1-3y');
  await settle(500);
  layout.adoptAge = { pageH: await pageH(), names: await cards.evaluateAll((els) => els.map((e) => e.querySelector('.kd-card__name')?.textContent ?? '')), cards: await boxes(cards), summary: await box(page.locator('.kd-filters__summary')), filters: await box(page.locator('.kd-filters')) };
  await shot('adopt-age', { fullPage: true });
  log('dogs', layout.adoptDogs.names, 'pasig', layout.adoptPasig.names, 'age', layout.adoptAge.names);
}

// 2 · Mango's detail overlay (shot 4)
await page.goto(`${BASE}/second-wind/adopt/mango`);
await settle(1200);
{
  const panel = page.locator('.kd-ov__panel');
  layout.detail = {
    panel: await box(panel, true),
    personality: await box(page.getByRole('heading', { name: 'Personality' }), true),
  };
  await panel.screenshot({ path: `${OUT}/detail-panel.png` });
  await shot('detail-view');
  log('detail', layout.detail);
}

// 3 · Juniper's editor: draft, blank, card layers, then Publish (shots 5, 6)
await page.goto(`${BASE}/dashboard/edit/rescues/juniper`);
await settle(1200);
{
  const field = (label) => page.getByLabel(new RegExp('^' + label)).first();
  const card = page.locator('.kd-card').first();
  layout.editor = {
    name: await box(field('Name'), true),
    location: await box(field('Public location'), true),
    breed: await box(field('Breed'), true),
    date: await box(field('Date rescued'), true),
    card: await box(card, true),
    cardName: await box(card.locator('.kd-card__name'), true),
    cardMeta: await box(card.locator('.kd-card__meta'), true),
    photosPanel: await box(page.locator('section.kd-panel').first(), true),
    badge: await box(page.locator('.kd-badge').first(), true),
    publishing: await box(page.getByRole('region', { name: 'Publishing' }), true),
    publishBtn: await box(page.getByRole('button', { name: 'Publish', exact: true }), true),
  };
  // Cover thumbnail tile in the Photos panel: the first <img> inside that panel.
  const thumbTile = page.locator('figure.kd-photos__item').first();
  layout.editor.thumb = await box(thumbTile, true);
  await shot('editor-draft');
  await page.getByRole('region', { name: 'Publishing' }).screenshot({ path: `${OUT}/pubbar-draft.png` });
  await card.screenshot({ path: `${OUT}/card-full.png` });
  await page.evaluate(() => { const m = document.querySelector('.kd-card .kd-card__meta'); if (m) m.style.visibility = 'hidden'; });
  await card.screenshot({ path: `${OUT}/card-name.png` });
  await page.evaluate(() => { const o = document.querySelector('.kd-card .kd-card__over'); if (o) o.style.visibility = 'hidden'; });
  await card.screenshot({ path: `${OUT}/card-photo.png` });
  await page.evaluate(() => { document.querySelectorAll('.kd-card .kd-card__over, .kd-card .kd-card__meta').forEach((e) => { e.style.visibility = ''; }); });

  // Blank state: same layout, empty fields, no cover thumbnail, no preview card (the shot rebuilds them).
  await page.evaluate(() => {
    for (const id of ['Name', 'Public location', 'Breed', 'Date rescued']) {
      const lab = [...document.querySelectorAll('label')].find((l) => l.textContent?.trim().startsWith(id));
      const inp = lab?.htmlFor ? document.getElementById(lab.htmlFor) : null;
      if (inp) inp.value = '';
    }
  });
  await thumbTile.evaluate((e) => { e.style.visibility = 'hidden'; });
  await card.evaluate((e) => { e.style.visibility = 'hidden'; });
  await page.evaluate(() => { const h = [...document.querySelectorAll('h1')].find((x) => x.textContent?.includes('Juniper')); if (h) h.style.visibility = 'hidden'; });
  await shot('editor-blank');
  await page.reload();
  await settle(1200);

  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await page.waitForTimeout(450);
  await shot('editor-live');
  await page.getByRole('region', { name: 'Publishing' }).screenshot({ path: `${OUT}/pubbar-live.png` });
  const toast = page.getByText('Juniper is now on your page.');
  if (await toast.count()) { layout.editor.toast = await box(page.locator('.kd-toast').first(), true); }
  log('editor', layout.editor);
}

// 4 · Dashboard section switches (shot 7)
await page.goto(`${BASE}/dashboard`);
await settle();
{
  const row = page.locator('.kd-toggle').filter({ hasText: 'Meet our team' });
  await row.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(400);
  const sw = row.getByRole('switch');
  layout.dashboard = { row: await box(row, true), switch: await box(sw, true), panel: await box(row.locator('xpath=ancestor::section[contains(concat(" ",@class," ")," kd-panel ")][1]'), true) };
  await shot('dash-team-on');
  await row.screenshot({ path: `${OUT}/row-team-on.png` });
  await sw.click();
  await page.waitForTimeout(600);
  await shot('dash-team-off');
  await row.screenshot({ path: `${OUT}/row-team-off.png` });
  await sw.click();
  await page.waitForTimeout(600);
  log('dashboard', layout.dashboard);
}

// 5 · Public home with the Team section (shots 7, 8)
await page.goto(`${BASE}/second-wind`);
await settle(1200);
{
  const team = page.locator('#sec-team');
  layout.home = {
    pageH: await pageH(),
    team: await box(team),
    teamHeading: await box(team.locator('.kd-sh').first()),
    teamGrid: await box(team.locator('.kd-sh').first().locator('xpath=following-sibling::*[1]')),
    sections: await page.locator('section.kd-sec').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { id: e.id, x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height }; })),
  };
  await shot('home-full', { fullPage: true });
  await shot('home-view');
  await team.screenshot({ path: `${OUT}/team-section.png` });
  log('home', layout.home.pageH, layout.home.team, layout.home.sections.map((s) => s.id).join(','));
}

fs.writeFileSync('src/layout.json', JSON.stringify(layout, null, 1));
log('wrote src/layout.json');
await browser.close();
