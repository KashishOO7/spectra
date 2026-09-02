#!/usr/bin/env tsx

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

const CONTENT_DIR = join(process.cwd(), 'content');
const TIMEOUT_MS = 10_000;
const CONCURRENCY = 8;

function* walkYaml(dir: string): Generator<string> {
  let entries: string[];
  try { entries = readdirSync(dir, { withFileTypes: true }).map((d) => (d.isDirectory() ? `\0${d.name}` : d.name)); }
  catch { return; }
  for (const e of entries) {
    if (e.startsWith('\0')) yield* walkYaml(join(dir, e.slice(1)));
    else if (/\.ya?ml$/.test(e)) yield join(dir, e);
  }
}

function* extractUrls(data: any): Generator<string> {
  if (data && typeof data === 'object') {
    if (Array.isArray(data)) { for (const v of data) yield* extractUrls(v); }
    else {
      for (const [k, v] of Object.entries(data)) {
        if ((k === 'url' || k === 'source_url') && typeof v === 'string' && v.startsWith('http')) yield v;
        else yield* extractUrls(v);
      }
    }
  }
}

function collectUrls(): string[] {
  const urls = new Set<string>();
  for (const file of walkYaml(CONTENT_DIR)) {
    const raw = readFileSync(file, 'utf-8').replace(/\r\n/g, '\n');
    for (const part of raw.split(/^---\s*$/m)) {
      if (!part.trim()) continue;
      let parsed: unknown;
      try { parsed = yaml.load(part.trim()); } catch { continue; }
      for (const u of extractUrls(parsed)) urls.add(u);
    }
  }
  return [...urls].sort();
}

async function check(url: string): Promise<number | string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal });
    if (res.status === 405 || res.status === 403) {
      res = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal });
    }
    return res.status;
  } catch (e: any) {
    return e?.name === 'AbortError' ? 'timeout' : 'error';
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  const urls = collectUrls();
  console.log(`\nChecking ${urls.length} unique URLs in content/ …\n`);
  const dead: Array<{ url: string; status: number | string }> = [];

  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(async (u) => ({ url: u, status: await check(u) })));
    for (const r of results) {
      const ok = typeof r.status === 'number' && r.status >= 200 && r.status < 400;
      if (!ok) dead.push(r);
      process.stdout.write(ok ? '\x1b[32m.\x1b[0m' : '\x1b[31mx\x1b[0m');
    }
  }

  console.log('\n');
  if (dead.length === 0) {
    console.log('\x1b[32m✓ All links reachable.\x1b[0m\n');
    return;
  }
  console.log(`\x1b[33m${dead.length} link(s) need a look (may include false positives from bot-blocking sites):\x1b[0m`);
  for (const d of dead) console.log(`  \x1b[31m${d.status}\x1b[0m  ${d.url}`);
  console.log('');
}

main();
