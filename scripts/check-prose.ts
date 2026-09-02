
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE = join(ROOT, 'scripts', 'prose-baseline.json');

const R = '\x1b[31m', G = '\x1b[32m', Y = '\x1b[33m', B = '\x1b[34m', D = '\x1b[2m', X = '\x1b[0m';
const BOLD = '\x1b[1m';

const EM_DASH = /—/g;

const LOADED = ['content/items', 'content/resources', 'content/lookups'];

const EM_EXEMPT = new Set(['sources[].title']);
const SHIPS_BUT_DOES_NOT_PAINT = new Set(['changelog[].changes']);

const ACQUIRED = [
  'Bitwarden', 'KeePassXC', '1Password', 'LastPass', 'Dashlane', 'Authy', 'Aegis',
  'Proton', 'Mullvad', 'NordVPN', 'ExpressVPN', 'Tutanota', 'Tailscale',
  'Signal', 'SimpleX', 'Session', 'Threema', 'Wire',
  'Cryptomator', 'Veracrypt', 'VeraCrypt', 'Filen', 'Internxt', 'Tresorit', 'Sync.com',
  'AdGuard', 'uBlock', 'Brave', 'DuckDuckGo', 'Tor', 'Firefox', 'LibreWolf',
  'DeleteMe', 'Incogni', 'Kanary'
];

const ALREADY = [
  'Google', 'Meta', 'Facebook', 'Instagram', 'WhatsApp', 'Apple', 'Microsoft', 'Amazon',
  'Twitter', 'LinkedIn', 'TikTok', 'Snapchat', 'Reddit', 'Discord', 'Steam', 'YouTube',
  'PlayStation', 'Xbox', 'Nintendo', 'Samsung', 'Dropbox', 'Telegram', 'Viber',
  'Windows', 'Android', 'BitLocker', 'FileVault', 'iCloud', 'iMessage', 'OneDrive',
  'Chrome', 'Safari', 'Edge'
];

const wordRe = (names: string[]) =>
  new RegExp(`\\b(${names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'g');
const ACQUIRED_RE = wordRe(ACQUIRED);
const ALREADY_RE = wordRe(ALREADY);


interface Hit { key: string; file: string; id: string; path: string; name?: string; context: string; }

const normPath = (path: string[]) =>
  path.map(s => (/^\[\d+\]$/.test(s) ? '[]' : s)).join('.').replace(/\.\[\]/g, '[]');

function docsIn(dir: string): Array<{ file: string; doc: any }> {
  const out: Array<{ file: string; doc: any }> = [];
  for (const f of readdirSync(join(ROOT, dir)).filter(n => /\.ya?ml$/.test(n))) {
    const rel = `${dir}/${f}`;
    const raw = readFileSync(join(ROOT, rel), 'utf-8').replace(/\r\n/g, '\n');
    for (const part of raw.split(/^---\s*$/m).filter(s => s.trim())) {
      let parsed: unknown;
      try { parsed = yaml.load(part.trim()); } catch { continue; }
      if (Array.isArray(parsed)) {
        for (const e of parsed) if (e && typeof e === 'object') out.push({ file: rel, doc: e });
      } else if (parsed && typeof parsed === 'object') {
        out.push({ file: rel, doc: parsed });
      }
    }
  }
  return out;
}

const snippet = (text: string, at: number) =>
  text.slice(Math.max(0, at - 48), at + 48).replace(/\s+/g, ' ').trim();

const emPaints: Hit[] = [];
const emShipsOnly: Hit[] = [];
const acquired: Hit[] = [];
const already: Hit[] = [];

for (const dir of LOADED) {
  for (const { file, doc } of docsIn(dir)) {
    const id = typeof doc.id === 'string' ? doc.id : '(no id)';
    const visit = (node: unknown, path: string[]) => {
      if (typeof node === 'string') {
        const p = normPath(path);
        const at = (m: RegExpMatchArray) => m.index ?? 0;

        if (!EM_EXEMPT.has(p)) {
          for (const m of node.matchAll(EM_DASH)) {
            const hit: Hit = { key: `${file}#${id}::${p}`, file, id, path: p, context: snippet(node, at(m)) };
            (SHIPS_BUT_DOES_NOT_PAINT.has(p) ? emShipsOnly : emPaints).push(hit);
          }
        }
        if (!p.startsWith('sources')) {
          for (const m of node.matchAll(ACQUIRED_RE)) {
            acquired.push({ key: `${file}#${id}::${p}|${m[1]}`, file, id, path: p, name: m[1], context: snippet(node, at(m)) });
          }
          for (const m of node.matchAll(ALREADY_RE)) {
            already.push({ key: `${file}#${id}::${p}|${m[1]}`, file, id, path: p, name: m[1], context: snippet(node, at(m)) });
          }
        }
        return;
      }
      if (Array.isArray(node)) return node.forEach((v, i) => visit(v, [...path, `[${i}]`]));
      if (node && typeof node === 'object') {
        for (const [k, v] of Object.entries(node as Record<string, unknown>)) visit(v, [...path, k]);
      }
    };
    visit(doc, []);
  }
}


function sourceFilesUnder(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) sourceFilesUnder(rel, acc);
    else if (/\.(svelte|ts)$/.test(entry.name)) acc.push(rel);
  }
  return acc;
}

const srcHits: Hit[] = [];
for (const rel of [
  ...sourceFilesUnder('src/routes'),
  ...sourceFilesUnder('src/lib/components'),
  ...sourceFilesUnder('src/lib/audit')
]) {
  const raw = readFileSync(join(ROOT, rel), 'utf-8');
  const blanked = raw
    .replace(/<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, ' '))
    .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/gm, m => m.replace(/[^\n]/g, ' '));
  for (const m of blanked.matchAll(EM_DASH)) {
    const line = raw.slice(0, m.index ?? 0).split('\n').length;
    srcHits.push({ key: `${rel}::line`, file: rel, id: '', path: `line ${line}`, context: snippet(raw, m.index ?? 0) });
  }
}


interface ProseBaseline {
  recorded_on: string;
  blocking: boolean;
  note: string;
  em_dash: Record<string, number>;
  named_tool: Record<string, number>;
}

function today(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const tally = (hits: Hit[]) => {
  const out: Record<string, number> = {};
  for (const h of hits) out[h.key] = (out[h.key] ?? 0) + 1;
  return Object.fromEntries(Object.entries(out).sort((a, b) => a[0].localeCompare(b[0])));
};

const emNow = tally([...emPaints, ...emShipsOnly, ...srcHits]);
const toolNow = tally(acquired);

if (process.argv.includes('--rebaseline')) {
  const previous: ProseBaseline | null = existsSync(BASELINE)
    ? JSON.parse(readFileSync(BASELINE, 'utf-8'))
    : null;
  const next: ProseBaseline = {
    recorded_on: today(),
    blocking: previous?.blocking ?? false,
    note:
      'What the corpus carried when this was recorded. The gate blocks anything added on top. ' +
      'Set "blocking" to true once the rewrite lands and it will refuse all of it instead. ' +
      'Lowering a number here without fixing the text is how a gate stops meaning anything.',
    em_dash: emNow,
    named_tool: toolNow
  };
  writeFileSync(BASELINE, JSON.stringify(next, null, 2) + '\n', 'utf-8');
  const before = previous ? Object.values(previous.em_dash).reduce((a, b) => a + b, 0) : 0;
  const after = Object.values(emNow).reduce((a, b) => a + b, 0);
  console.log(`\n${G}✓ Baseline recorded ${today()}.${X} ${D}em dashes ${previous ? `${before} -> ` : ''}${after}, named tools ${Object.values(toolNow).reduce((a, b) => a + b, 0)}.${X}\n`);
  process.exit(0);
}

console.log(`${B}Checking the two prose rules that outrank supplied copy…${X}\n`);

if (!existsSync(BASELINE)) {
  console.log(`${R}${BOLD}✗ No baseline.${X} ${D}scripts/prose-baseline.json is missing.${X}\n`);
  console.log(`${D}Record what the corpus carries today, then the gate blocks what is added on top:${X}\n`);
  console.log(`    npx tsx scripts/check-prose.ts --rebaseline\n`);
  process.exit(1);
}

const baseline: ProseBaseline = JSON.parse(readFileSync(BASELINE, 'utf-8'));

const regressions: string[] = [];
const compare = (now: Record<string, number>, was: Record<string, number>, what: string, find: (k: string) => Hit | undefined) => {
  for (const [key, count] of Object.entries(now)) {
    const before = was[key] ?? 0;
    if (count <= before) continue;
    const h = find(key);
    regressions.push(
      `${key.split('::')[0].split('#')[0]} · ${key.split('::')[1] ?? key}\n` +
      `       ${before === 0 ? `new ${what}` : `${what} went ${before} -> ${count}`}` +
      (h ? `\n       …${h.context}…` : '')
    );
  }
};

const allEm = [...emPaints, ...emShipsOnly, ...srcHits];
compare(emNow, baseline.em_dash, 'em dash', k => allEm.find(h => h.key === k));
compare(toolNow, baseline.named_tool, 'named tool', k => acquired.find(h => h.key === k));

const fixed = Object.entries(baseline.em_dash)
  .filter(([k, v]) => (emNow[k] ?? 0) < v)
  .reduce((n, [k, v]) => n + (v - (emNow[k] ?? 0)), 0);


const byField = (hits: Hit[]) => {
  const m = new Map<string, number>();
  for (const h of hits) m.set(h.path, (m.get(h.path) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

console.log(`  ${BOLD}Em dashes${X}`);
console.log(`    ${BOLD}${emPaints.length}${X} paint on a page ${D}(${byField(emPaints).map(([f, n]) => `${f} ${n}`).join(' · ')})${X}`);
console.log(`    ${emShipsOnly.length} ship in the graph without painting ${D}(${byField(emShipsOnly).map(([f, n]) => `${f} ${n}`).join(' · ')})${X}`);
console.log(`    ${BOLD}${srcHits.length}${X} in component copy, comments already discounted:`);
const srcByFile = new Map<string, number>();
for (const h of srcHits) srcByFile.set(h.file, (srcByFile.get(h.file) ?? 0) + 1);
for (const [f, n] of [...srcByFile.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`      ${String(n).padStart(3)}  ${f}`);
}
console.log(`    ${D}exempt: sources[].title, which quote other people's page titles${X}`);

console.log(`\n  ${BOLD}Names${X}`);
console.log(`    ${BOLD}${acquired.length}${X} name a tool a reader would have to go and get`);
for (const h of acquired) {
  const paints = !SHIPS_BUT_DOES_NOT_PAINT.has(h.path);
  console.log(`      ${paints ? `${Y}•${X}` : `${D}·${X}`} ${h.name} ${D}in ${h.id} · ${h.path}${paints ? '' : ' (does not paint)'}${X}`);
  console.log(`        ${D}…${h.context}…${X}`);
}
console.log(`    ${already.length} name a platform the reader already has ${D}(orientation, allowed)${X}`);
const alreadyPainting = already.filter(h => !SHIPS_BUT_DOES_NOT_PAINT.has(h.path));
console.log(`      ${D}${[...new Set(alreadyPainting.map(h => h.name))].join(', ')}${X}`);

console.log('');

if (fixed > 0) {
  console.log(`${G}${fixed} em dash(es) have gone since the baseline was recorded.${X}`);
  console.log(`${D}Lock the gain in so they cannot come back: npx tsx scripts/check-prose.ts --rebaseline${X}\n`);
}

if (baseline.blocking) {
  const total = emPaints.length + emShipsOnly.length + srcHits.length + acquired.length;
  if (total > 0) {
    console.log(`${R}${BOLD}✗ Blocking mode: ${total} violation(s), and the rules allow none.${X}`);
    console.log(`${D}prose-baseline.json has "blocking": true.${X}\n`);
    process.exit(1);
  }
  console.log(`${G}✓ Blocking mode, and the corpus is clean.${X}\n`);
  process.exit(0);
}

if (regressions.length) {
  console.log(`${R}${BOLD}Added since the baseline (${regressions.length}) — blocking${X}\n`);
  for (const r of regressions) console.log(`  ${R}✗${X}  ${r}`);
  console.log(`\n${R}Both rules outrank the copy that was handed over.${X} ${D}Replace an em dash by judgement,`);
  console.log(`with a full stop or a comma, never find-and-replace. For a named tool, say what to look`);
  console.log(`for rather than what to get: that is what lookup-choosing-a-tool-001 is for.${X}\n`);
  process.exit(1);
}

console.log(`${G}✓ Nothing added.${X} ${D}Recorded ${baseline.recorded_on}; the corpus carries what it carried then.`);
console.log(`  Reporting, not blocking. Set "blocking": true in prose-baseline.json when the rewrite lands.${X}\n`);
