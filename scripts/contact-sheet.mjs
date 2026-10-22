// Tile extracted QA frames (out/qa/sheet/*.jpg) into one labelled contact sheet via headless Chromium.
import { chromium } from 'file:///E:/animal%20rescue%20platform/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
const dir = path.resolve(process.argv[2] ?? 'out/qa/sheet'), outFile = process.argv[3] ?? 'out/qa/contact.png';
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.jpg')).sort();
const cells = files.map((f) => `<figure><img src="data:image/jpeg;base64,${fs.readFileSync(path.join(dir, f)).toString('base64')}"><figcaption>${f.replace(/\D/g, '').replace(/^0+(?=\d)/, '')}</figcaption></figure>`).join('');
const html = `<html><body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(6,384px);gap:4px;padding:4px;font:14px monospace;color:#cadf42">
<style>figure{margin:0;position:relative}img{display:block;width:384px;height:216px}figcaption{position:absolute;left:4px;top:2px;background:#000a;padding:0 4px}</style>${cells}</body></html>`;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 6 * 388 + 4, height: 400 } });
await p.setContent(html); await p.waitForTimeout(500);
await p.screenshot({ path: outFile, fullPage: true }); await b.close(); console.log('wrote', outFile, files.length);
