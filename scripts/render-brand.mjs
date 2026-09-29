import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';

const GROUND = '#f6f4ef';
const TEAL = '#0b7a6e';
const INK = '#111318';
const DIM = '#585e68';

function line(note, key) {
  const lines = readFileSync(note, 'utf8').split(/\r?\n/);
  let i = lines.indexOf(`## ${key}`) + 1, inNote = false;
  if (i === 0) throw new Error(`${note} has no ## ${key}`);
  for (; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith('%%')) { if (!(l.length > 2 && l.trim().endsWith('%%') && l.trim() !== '%%')) inNote = !inNote; continue; }
    if (inNote || !l.trim()) continue;
    if (l.startsWith('## ')) break;
    return l.trim();
  }
  throw new Error(`${note} ## ${key} has no line`);
}

const heading = line('wiki/pages/home.md', 'heading');
const promise = line('wiki/pages/home.md', 'promise');
const mark = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 28 28" fill="none">
  <path d="M14 3.5a10.5 10.5 0 0 0 0 21" stroke="${TEAL}" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M14 3.5a10.5 10.5 0 0 1 0 21" stroke="${TEAL}" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="1 4.4" opacity="0.85"/></svg>`;
const font = '<link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;700&display=block" rel="stylesheet">';

const browser = await chromium.launch();
const page = await browser.newPage();

for (const [file, size] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<body style="margin:0;width:${size}px;height:${size}px;background:${GROUND};display:grid;place-items:center">${mark(Math.round(size * 0.6))}</body>`);
  await page.screenshot({ path: `static/${file}` });
}

await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(`<html><head>${font}</head><body style="margin:0;width:1200px;height:630px;background:${GROUND};font-family:'Public Sans',sans-serif;box-sizing:border-box;padding:80px 96px;display:flex;flex-direction:column;justify-content:space-between">
  <div style="display:flex;align-items:center;gap:20px">${mark(72)}<span style="font-size:52px;font-weight:700;color:${INK}">Spectra</span></div>
  <div style="font-size:60px;font-weight:700;line-height:1.15;color:${INK};max-width:1000px">${heading}</div>
  <div style="font-size:30px;color:${DIM}">${promise}</div>
</body></html>`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const face = await page.evaluate(() => document.fonts.check('700 60px "Public Sans"'));
if (!face) throw new Error('Public Sans did not load, so the card would be drawn in a fallback face');
await page.screenshot({ path: 'static/og.png' });

await browser.close();

writeFileSync('static/manifest.json', JSON.stringify({
  name: 'Spectra',
  short_name: 'Spectra',
  description: line('wiki/pages/home.md', 'description'),
  start_url: '/',
  scope: '/',
  display: 'standalone',
  background_color: GROUND,
  theme_color: GROUND,
  icons: [
    { src: '/favicon.svg', type: 'image/svg+xml', sizes: 'any', purpose: 'any' },
    { src: '/icon-192.png', type: 'image/png', sizes: '192x192', purpose: 'any' },
    { src: '/icon-512.png', type: 'image/png', sizes: '512x512', purpose: 'any' }
  ]
}, null, 2) + '\n');
console.log(`rendered: apple-touch-icon.png, icon-192.png, icon-512.png, og.png, manifest.json\n  heading: ${heading}\n  promise: ${promise}`);
