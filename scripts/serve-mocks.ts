#!/usr/bin/env tsx

import { createServer } from 'node:http';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DESIGN = join(dirname(fileURLToPath(import.meta.url)), '..', 'peer-review', 'design');
const PORT = Number(process.env.MOCK_PORT ?? 4319);

export function page(file: string): string {
  const raw = readFileSync(join(DESIGN, file), 'utf-8');
  const head = raw.match(/<helmet>([\s\S]*?)<\/helmet>/)?.[1] ?? '';
  const body = raw
    .replace(/<script[^>]*><\/script>/g, '')
    .match(/<x-dc>([\s\S]*?)<\/x-dc>/)?.[1]
    .replace(/<helmet>[\s\S]*?<\/helmet>/, '') ?? '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Spectra</title>${head}
<style>body{margin:0;background:#FAF7F2;display:flex;justify-content:center}</style>
</head><body>${body}</body></html>`;
}

export const boards = readdirSync(DESIGN).filter(f => f.endsWith('.dc.html'));
export const slug = (f: string) => f.replace(/\.dc\.html$/, '').toLowerCase();

const RUN_DIRECTLY = process.argv[1] === fileURLToPath(import.meta.url);
if (RUN_DIRECTLY) start();

function start() {
createServer((req, res) => {
  const path = (req.url ?? '/').split('?')[0].replace(/^\/|\/$/g, '');
  const match = boards.find(f => slug(f) === path);
  if (match) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(page(match));
    return;
  }
  if (path === '') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(`<!doctype html><meta charset="utf-8"><title>Artboards</title>
      <p>Hand a persona ONE of these, never this page.</p><ul>${
        boards.map(f => `<li><a href="/${slug(f)}">${slug(f)}</a></li>`).join('')
      }</ul>`);
    return;
  }
  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('no such artboard');
}).listen(PORT, () => {
  console.log(`\nArtboards on http://localhost:${PORT}\n`);
  for (const f of boards) console.log(`  http://localhost:${PORT}/${slug(f)}`);
  console.log('\nHand a persona one url. Never the index: a list of alternatives tells them');
  console.log('they are judging a design, and the whole point is that they do not know.\n');
});
}
