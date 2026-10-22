// Debug helper: print a trimmed outline of the editor's Photos panel and the preview card.
import { chromium } from 'file:///E:/animal%20rescue%20platform/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('http://localhost:5191/dashboard'); await p.getByRole('button', { name: 'Publish page' }).click();
await p.goto('http://localhost:5191/dashboard/edit/rescues/juniper'); await p.waitForTimeout(1500);
console.log(await p.evaluate(() => {
  const h = [...document.querySelectorAll('h2,h3')].find((x) => x.textContent.trim() === 'Photos');
  let el = h; for (let i = 0; i < 3 && el.parentElement; i++) el = el.parentElement;
  const out = (n, d) => d > 6 ? '' : '  '.repeat(d) + n.tagName.toLowerCase() + (n.className && typeof n.className === 'string' ? '.' + n.className.split(' ').join('.') : '') + (n.tagName === 'IMG' ? ' [img]' : '') + '\n' + [...n.children].map((c) => out(c, d + 1)).join('');
  return out(el, 0).slice(0, 3000);
}));
await b.close();
