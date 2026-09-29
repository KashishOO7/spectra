#!/usr/bin/env tsx

import { chromium } from '@playwright/test';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { page as renderBoard, boards, slug } from './serve-mocks.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'peer-review', 'design', 'shots');

const VIEWPORTS: Array<{ name: string; width: number; height: number; scale: number }> = [
  { name: 'phone', width: 393, height: 852, scale: 1 },
  { name: 'phone-small', width: 360, height: 800, scale: 1 },
  { name: 'tablet-large-text', width: 820, height: 1180, scale: 1.25 },
  { name: 'desktop', width: 1440, height: 900, scale: 1 }
];

const NOT_A_PAGE = new Set(['system']);

const shoot = async () => {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const written: string[] = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: Math.round(vp.width / vp.scale), height: Math.round(vp.height / vp.scale) },
      deviceScaleFactor: vp.scale
    });
    const tab = await context.newPage();

    for (const file of boards) {
      const id = slug(file);
      if (NOT_A_PAGE.has(id)) continue;
      await tab.setContent(renderBoard(file), { waitUntil: 'load' });
      await tab.evaluate(() => document.fonts.ready);
      const out = join(OUT, `${id}.${vp.name}.png`);
      await tab.screenshot({ path: out, fullPage: true });
      written.push(`${id}.${vp.name}.png`);
    }
    await context.close();
  }

  await browser.close();

  writeFileSync(
    join(OUT, 'MANIFEST.txt'),
    [`Rendered ${new Date().toISOString()}`, '', ...written].join('\n') + '\n'
  );
  console.log(`\n${written.length} shots in peer-review/design/shots/\n`);
  for (const w of written) console.log(`  ${w}`);
  console.log('\nHand a persona ONE shot, at its own viewport. Never the set.\n');
};

shoot();
