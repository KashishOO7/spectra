
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import yaml from 'js-yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE = join(ROOT, 'scripts', 'protected-baseline.json');

const PROTECTED = new Set(['last_verified', 'score_weight', 'threat_model_multipliers']);

const R = '\x1b[31m', G = '\x1b[32m', Y = '\x1b[33m', B = '\x1b[34m', D = '\x1b[2m', X = '\x1b[0m';
const BOLD = '\x1b[1m';


interface Baseline {
  sealed_on: string;
  sealed_note: string;
  fields: Record<string, string>;
}

function today(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function stable(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (value === null) return 'null';
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (typeof value === 'object') {
    const o = value as Record<string, unknown>;
    return `{${Object.keys(o).sort().map(k => `${k}:${stable(o[k])}`).join(',')}}`;
  }
  return String(value);
}

function contentDocs(source?: (rel: string) => string | null): Array<{ file: string; doc: any }> {
  const out: Array<{ file: string; doc: any }> = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
      const rel = `${dir}/${entry.name}`;
      if (entry.isDirectory()) { walk(rel); continue; }
      if (!/\.ya?ml$/.test(entry.name)) continue;
      const raw = source ? source(rel) : readFileSync(join(ROOT, rel), 'utf-8');
      if (raw === null) continue;
      for (const part of raw.replace(/\r\n/g, '\n').split(/^---\s*$/m).filter(s => s.trim())) {
        let parsed: unknown;
        try { parsed = yaml.load(part.trim()); } catch { continue; }
        if (Array.isArray(parsed)) {
          for (const e of parsed) if (e && typeof e === 'object') out.push({ file: rel, doc: e });
        } else if (parsed && typeof parsed === 'object') {
          out.push({ file: rel, doc: parsed });
        }
      }
    }
  };
  walk('content');
  return out;
}

function readProtected(source?: (rel: string) => string | null): Map<string, string> {
  const found = new Map<string, string>();
  for (const { file, doc } of contentDocs(source)) {
    const id = typeof doc.id === 'string' ? doc.id : '(no id)';
    const visit = (node: unknown, path: string[]) => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) {
        node.forEach((v, i) => visit(v, [...path, `[${i}]`]));
        return;
      }
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        const here = [...path, k];
        if (PROTECTED.has(k)) found.set(`${file}#${id}::${here.join('.')}`, stable(v));
        else visit(v, here);
      }
    };
    visit(doc, []);
  }
  return found;
}


function readProtectedAtHead(): Map<string, string> | null {
  try {
    execFileSync('git', ['rev-parse', '--git-dir'], { cwd: ROOT, stdio: 'pipe' });
  } catch {
    return null;
  }
  try {
    return readProtected(rel => {
      try {
        return execFileSync('git', ['show', `HEAD:${rel}`], { cwd: ROOT, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
      } catch {
        return null; 
      }
    });
  } catch {
    return null;
  }
}


const argv = process.argv.slice(2);
const wantsReseal = argv.includes('--reseal');
const confirmed = argv.includes('--maintainer-asked-for-this');

const current = readProtected();

if (wantsReseal && !confirmed) {
  console.log(`\n${R}${BOLD}Refusing to reseal.${X}`);
  console.log(`${D}--reseal alone does nothing. The full form is deliberately awkward:${X}\n`);
  console.log(`    npx tsx scripts/check-protected.ts --reseal --maintainer-asked-for-this\n`);
  console.log(`${D}Run it only when the maintainer has asked for a recalibration in that turn.${X}\n`);
  process.exit(1);
}

if (wantsReseal && confirmed) {
  const previous: Baseline | null = existsSync(BASELINE)
    ? JSON.parse(readFileSync(BASELINE, 'utf-8'))
    : null;

  console.log(`\n${Y}${BOLD}Resealing the protected-field baseline.${X}`);
  if (previous) {
    const changes: string[] = [];
    for (const [k, v] of current) {
      const was = previous.fields[k];
      if (was === undefined) changes.push(`  ${G}+${X} ${k} = ${v}`);
      else if (was !== v) changes.push(`  ${Y}~${X} ${k}: ${was} ${D}->${X} ${v}`);
    }
    for (const k of Object.keys(previous.fields)) {
      if (!current.has(k)) changes.push(`  ${R}-${X} ${k} ${D}(was ${previous.fields[k]})${X}`);
    }
    if (!changes.length) {
      console.log(`${D}Nothing to accept: the tree already matches the baseline.${X}\n`);
      process.exit(0);
    }
    console.log(`${D}Accepting ${changes.length} change(s):${X}\n`);
    for (const c of changes) console.log(c);
  } else {
    console.log(`${D}No baseline existed. Sealing ${current.size} values as they stand.${X}`);
  }

  const sealed: Baseline = {
    sealed_on: today(),
    sealed_note:
      'Written by scripts/check-protected.ts --reseal. Every value here is a calibration or an ' +
      'attestation. Do not edit this file to make a gate pass; that is the one thing it exists ' +
      'to prevent. See the header of scripts/check-protected.ts.',
    fields: Object.fromEntries([...current.entries()].sort((a, b) => a[0].localeCompare(b[0])))
  };
  writeFileSync(BASELINE, JSON.stringify(sealed, null, 2) + '\n', 'utf-8');
  console.log(`\n${G}✓ Sealed ${current.size} protected values on ${sealed.sealed_on}.${X}`);
  console.log(`${D}  scripts/protected-baseline.json rewritten. Commit it with the change it accepts.${X}\n`);
  process.exit(0);
}


console.log(`${B}Checking that no protected field moved…${X}\n`);

if (!existsSync(BASELINE)) {
  console.log(`${R}${BOLD}✗ No baseline.${X} ${D}scripts/protected-baseline.json is missing.${X}\n`);
  console.log(`${D}Nothing can be protected without a record of what the values were. If this is the`);
  console.log(`first run, seal them deliberately:${X}\n`);
  console.log(`    npx tsx scripts/check-protected.ts --reseal --maintainer-asked-for-this\n`);
  process.exit(1);
}

const baseline: Baseline = JSON.parse(readFileSync(BASELINE, 'utf-8'));
const head = readProtectedAtHead();

function narrow(was: string, now: string): string | null {
  const parse = (s: string) => {
    if (!s.startsWith('{') || !s.endsWith('}')) return null;
    const out = new Map<string, string>();
    for (const pair of s.slice(1, -1).split(',')) {
      const i = pair.indexOf(':');
      if (i === -1) return null;
      out.set(pair.slice(0, i), pair.slice(i + 1));
    }
    return out;
  };
  const a = parse(was), b = parse(now);
  if (!a || !b) return null;
  const parts: string[] = [];
  for (const k of new Set([...a.keys(), ...b.keys()])) {
    const x = a.get(k), y = b.get(k);
    if (x === y) continue;
    if (x === undefined) parts.push(`${k} added as ${y}`);
    else if (y === undefined) parts.push(`${k} removed (was ${x})`);
    else parts.push(`${k} ${x} -> ${y}`);
  }
  return parts.length ? parts.join(', ') : null;
}

const changed: string[] = [];
const removed: string[] = [];
const added: string[] = [];

for (const [key, value] of current) {
  const was = baseline.fields[key];
  if (was === undefined) {
    added.push(`${key} = ${value}`);
  } else if (was !== value) {
    const atHead = head?.get(key);
    const when =
      head === null ? ''
      : atHead === value ? `${D} (already committed; HEAD carries the new value)${X}`
      : `${D} (uncommitted in the working tree)${X}`;
    const detail = narrow(was, value);
    changed.push(detail
      ? `${key}\n       ${BOLD}${detail}${X}${when}`
      : `${key}\n       was ${BOLD}${was}${X}, tree says ${BOLD}${value}${X}${when}`);
  }
}
for (const key of Object.keys(baseline.fields)) {
  if (!current.has(key)) removed.push(`${key} ${D}(was ${baseline.fields[key]})${X}`);
}

const protectedFiles = new Set([...current.keys()].map(k => k.split('#')[0])).size;

if (added.length) {
  console.log(`${Y}${BOLD}NEW protected values (${added.length}) — not blocking${X}`);
  console.log(`${D}New content arrives with a weight and a date, which is normal. Printed so the`);
  console.log(`calibration is reviewed rather than assumed.${X}`);
  for (const a of added) console.log(`  ${Y}+${X}  ${a}`);
  console.log('');
}

if (changed.length || removed.length) {
  console.log(`${R}${BOLD}PROTECTED FIELDS MOVED (${changed.length + removed.length}) — blocking${X}\n`);
  for (const c of changed) console.log(`  ${R}✗${X}  ${c}`);
  for (const r of removed) console.log(`  ${R}✗${X}  removed: ${r}`);
  console.log(`\n${R}${BOLD}These three fields do not change as a side effect of other work.${X}`);
  console.log(`${D}score_weight and threat_model_multipliers are a calibration: moving one reorders what`);
  console.log(`every reader is told to do next. last_verified asserts that a person opened every source`);
  console.log(`on that item and confirmed it.`);
  console.log('');
  console.log(`If this was not asked for in this turn, put the values back. \`git checkout -- content/\``);
  console.log(`restores them when the edit is uncommitted.`);
  console.log('');
  console.log(`If the maintainer did ask for a recalibration, they reseal. You do not.${X}\n`);
  process.exit(1);
}

console.log(`${G}✓ Protected fields are unchanged.${X} ${D}${current.size} values across ${protectedFiles} files, sealed ${baseline.sealed_on}.${X}`);
if (head === null) console.log(`${D}  (no git here, so "committed or not" could not be reported)${X}`);
console.log('');
