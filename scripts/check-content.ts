#!/usr/bin/env tsx

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { readControls } from '../src/lib/content/controls.ts';
import { readResources } from '../src/lib/content/resources.ts';
import { readLookups } from '../src/lib/content/lookups.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const isControl = (file: string) => file.startsWith('content/items') || file.startsWith('wiki/controls');
const BASELINE = join(ROOT, 'scripts', 'content-baseline.json');

const R = '\x1b[31m', G = '\x1b[32m', Y = '\x1b[33m', B = '\x1b[34m';
const D = '\x1b[2m', X = '\x1b[0m', BOLD = '\x1b[1m';

const STANDARD_GRADE = 6.6;

const GRADE_FLOOR = 5.0;


const problems: string[] = [];
const note = (why: string) => problems.push(why);


type FieldSpec = { path: string; rendersAt: string; grade: number | null; maxSentence: number };

const FIELDS: FieldSpec[] = [
  { path: 'title',                    rendersAt: 'the "Full title" line, tab titles', grade: null,           maxSentence: 14 },
  { path: 'description',              rendersAt: 'step card, list rows, step page h1, search blurb', grade: STANDARD_GRADE, maxSentence: 22 },
  { path: 'threat_narrative',         rendersAt: 'step page, "Why this matters"',     grade: STANDARD_GRADE, maxSentence: 22 },
  { path: 'platform_notes{}'          , rendersAt: 'step page, "How to do it"',         grade: STANDARD_GRADE, maxSentence: 22 },
  { path: 'legal_notes[].note',       rendersAt: 'step page, environment notes',      grade: STANDARD_GRADE, maxSentence: 26 },
  { path: 'track_notes{}'      ,       rendersAt: 'list rows, when the track is on',   grade: STANDARD_GRADE, maxSentence: 22 },
  { path: 'environment_notes{}'      , rendersAt: 'expanded step, gated on flags',     grade: STANDARD_GRADE, maxSentence: 22 },
  { path: 'related_items[].note',     rendersAt: 'step page, related list',           grade: STANDARD_GRADE, maxSentence: 22 },
  { path: 'depends_on[].reason',      rendersAt: 'step page, dependency line',        grade: STANDARD_GRADE, maxSentence: 22 }
];



const ALLOWED_TECHNICAL = new Set([
  'account', 'accounts', 'browser', 'browsers', 'password', 'passwords', 'encryption', 'encrypted',
  'backup', 'backups', 'device', 'devices', 'settings', 'download', 'downloads', 'software',
  'update', 'updates', 'phishing', 'scam', 'scams', 'breach', 'breaches', 'recovery', 'verify',
  'verified', 'privacy', 'network', 'router', 'wifi', 'email', 'emails', 'login', 'logins',
  'username', 'firewall', 'antivirus', 'malware', 'spyware', 'authenticator', 'passcode',
  'biometric', 'permissions', 'notification', 'notifications', 'messaging', 'documents'
]);

const ROTTING: Array<{ re: RegExp; why: string }> = [
  { re: /\bversion\s+\d/i,                      why: 'a version number ages out' },
  { re: /\b(in|since|as of)\s+20\d\d\b/i,       why: 'a year dates the sentence' },
  { re: /\bSettings\s*(>|›|→)\s*\w+/i,          why: 'a menu path changes when the vendor redesigns' },
  { re: /\b(Article|Section)\s+\d+/i,           why: 'a law reference needs re-checking every year' },
  { re: /\bcurrently\b/i,                       why: '"currently" is true until it is not, silently' },
  { re: /\bfree tier\b/i,                       why: 'pricing changes without telling us' },
  { re: /\bthe (best|leading|most popular)\b/i, why: 'a ranking claim we cannot keep true' }
];

const JARGON: Array<{ re: RegExp; use: string }> = [
  { re: /\bthreat model/i,      use: 'your setup' },
  { re: /\badversar(y|ies)\b/i, use: '"who might try", or name the one' },
  { re: /\bposture\b/i,         use: 'name the thing' },
  { re: /\bexposure\b/i,        use: '"what someone could find out about you"' },
  { re: /\bOSINT\b/i,           use: 'looking someone up from what is already public' },
  { re: /\bdork(s|ing)?\b/i,    use: 'a search that turns up what people did not mean to publish' },
  { re: /\bvectors?\b/i,        use: 'how it happens' }
];

const DANGLING = /\b(enough|more|less|better|worse|same|safer|stronger|faster)\b\s*[.!?]/i;

const QUOTED_SPAN = /["“”][^"“”]{40,}["“”]/;

const SHINGLE = 7;


const sentences = (s: string) =>
  s.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).map(t => t.trim()).filter(Boolean);
const words = (s: string) => s.split(/[^A-Za-z'’-]+/).filter(Boolean);

function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 3) return 1;
  const g = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '').match(/[aeiouy]{1,2}/g);
  return Math.max(1, g ? g.length : 1);
}

function grade(text: string): number | null {
  const s = sentences(text).length;
  const w = words(text);
  if (!s || w.length < 6) return null;
  const syls = w.reduce((n, x) => n + syllables(x), 0);
  const poly = w.filter(x => syllables(x) >= 3).length;
  const chars = w.join('').length;
  const wps = w.length / s, spw = syls / w.length;

  const fk  = 0.39 * wps + 11.8 * spw - 15.59;
  const ari = 4.71 * (chars / w.length) + 0.5 * wps - 21.43;
  const fog = 0.4 * (wps + 100 * (poly / w.length));
  const smog = 1.043 * Math.sqrt(poly * (30 / s)) + 3.1291;
  const cl  = 0.0588 * (chars / w.length * 100) - 0.296 * (s / w.length * 100) - 15.8;

  return (fk + ari + fog + smog + cl) / 5;
}


type Str = { file: string; id: string; field: string; text: string };

function readDocs(dir: string): Array<{ file: string; doc: any }> {
  const out: Array<{ file: string; doc: any }> = [];
  const full = join(ROOT, dir);
  if (!existsSync(full)) { note(`${dir} does not exist; nothing from it was read`); return out; }
  for (const name of readdirSync(full)) {
    if (!/\.(ya?ml)$/.test(name)) continue;
    const raw = readFileSync(join(full, name), 'utf-8').replace(/\r\n/g, '\n');
    for (const part of raw.split(/^---\s*$/m).filter(s => s.trim())) {
      try {
        const parsed = yaml.load(part);
        if (Array.isArray(parsed)) for (const e of parsed) { if (e && typeof e === 'object') out.push({ file: `${dir}/${name}`, doc: e }); }
        else if (parsed && typeof parsed === 'object') out.push({ file: `${dir}/${name}`, doc: parsed });
      } catch (e) {
        note(`${dir}/${name} could not be parsed, so none of its sentences were read: ${(e as Error).message.split('\n')[0]}`);
      }
    }
  }
  return out;
}

function collect(doc: any, path: string): string[] {
  let nodes: any[] = [doc];
  for (const part of path.split('.')) {
    const isArray = part.endsWith('[]');
    const isMap = part.endsWith('{}');
    const key = isArray || isMap ? part.slice(0, -2) : part;
    const next: any[] = [];
    for (const n of nodes) {
      if (n == null || typeof n !== 'object') continue;
      const v = key ? (n as any)[key] : n;
      if (v == null) continue;
      if (isArray && Array.isArray(v)) next.push(...v);
      else if (isMap && typeof v === 'object' && !Array.isArray(v)) next.push(...Object.values(v));
      else next.push(v);
    }
    nodes = next;
  }
  return nodes.filter(v => typeof v === 'string' && v.trim());
}

function corpus() {
  const rendered: Str[] = [];
  const sourceTitles: string[] = [];
  const revenants: string[] = [];
  const hits = new Map(FIELDS.map(f => [f.path, 0]));

  for (const dir of ['content/items', 'content/resources', 'content/lookups']) {
    const docs = dir === 'content/items'
      ? readControls(ROOT).map(({ file, item }) => ({ file, doc: item as any }))
      : dir === 'content/resources'
        ? readResources(ROOT).map(({ file, item }) => ({ file, doc: item as any }))
        : dir === 'content/lookups'
          ? readLookups(ROOT).map(({ file, item }) => ({ file, doc: item as any }))
          : readDocs(dir);
    for (const { file, doc } of docs) {
      const id = typeof doc.id === 'string' ? doc.id : '(no id)';
      if ('simple_description' in doc) revenants.push(id);
      for (const spec of FIELDS) {
        const found = collect(doc, spec.path);
        hits.set(spec.path, (hits.get(spec.path) ?? 0) + found.length);
        for (const text of found) rendered.push({ file, id, field: spec.path, text });
      }
      for (const t of collect(doc, 'sources[].title')) sourceTitles.push(t);
    }
  }

  for (const [path, n] of hits) if (n === 0) note(`field "${path}" matched no content at all; either it was renamed or nothing carries it`);

  return { rendered, sourceTitles, revenants };
}

function shingles(text: string): Set<string> {
  const w = words(text).map(x => x.toLowerCase());
  const out = new Set<string>();
  for (let i = 0; i + SHINGLE <= w.length; i++) out.add(w.slice(i, i + SHINGLE).join(' '));
  return out;
}


type Finding = { rule: string; id: string; field: string; detail: string; text: string };

function inspect(rendered: Str[], sourceTitles: string[], revenants: string[] = []): Finding[] {
  const found: Finding[] = [];
  const byField = new Map(FIELDS.map(f => [f.path, f]));
  const seenWhole = new Map<string, string>();
  const seenShingle = new Map<string, string>();

  const titleShingles = new Map<string, string>();
  for (const t of sourceTitles) for (const sh of shingles(t)) titleShingles.set(sh, t);

  for (const s of rendered) {
    const spec = byField.get(s.field);
    if (!spec) continue;
    const add = (rule: string, detail: string) =>
      found.push({ rule, id: s.id, field: s.field, detail, text: s.text.slice(0, 90) });

    const g = grade(s.text);
    if (g !== null && spec.grade !== null && g > spec.grade) {
      add('READING_GRADE', `grade ${g.toFixed(1)}, standard ${spec.grade.toFixed(1)}`);
    }

    if (g !== null && spec.grade !== null && g < GRADE_FLOOR && sentences(s.text).length >= 3) {
      add('GRADE_TOO_THIN', `grade ${g.toFixed(1)}, floor ${GRADE_FLOOR}; chopped prose reads as talking down`);
    }

    for (const sent of sentences(s.text)) {
      const n = words(sent).length;
      if (n > spec.maxSentence) { add('SENTENCE_LENGTH', `${n} words, ceiling ${spec.maxSentence}`); break; }
    }

    if (s.field === 'description' && isControl(s.file)) {
      const lead = sentences(s.text)[0] ?? '';
      const n = words(lead).length;
      if (n > 18) add('LEAD_SENTENCE_LENGTH', `first sentence is ${n} words, ceiling 18; it is printed on its own in eight places`);
    }

    if (s.field !== 'title') {
      for (const sent of sentences(s.text)) {
        const ws = words(sent);
        if (ws.length >= 2 && ws.length <= 6 &&
            !/\b(is|are|was|were|be|do|does|can|will|has|have|get|gets|use|uses|turn|make|makes|keep|keeps|stay|stays|\w+s|\w+ed|\w+ing)\b/i.test(sent)) {
          add('FRAGMENT', 'no verb; a reader cannot resolve it alone'); break;
        }
      }
    }

    if (DANGLING.test(s.text)) add('DANGLING_REFERENCE', 'a comparison with nothing to compare to');
    for (const j of JARGON) if (j.re.test(s.text)) add('JARGON_IN_CONTENT', `say ${j.use}`);
    for (const r of ROTTING) if (r.re.test(s.text)) add('ROTTING_DETAIL', r.why);

    const heavy = [...new Set(words(s.text))].filter(w => syllables(w) >= 4 && !ALLOWED_TECHNICAL.has(w.toLowerCase()));
    if (heavy.length) add('UNCOMMON_WORD', heavy.slice(0, 4).join(', '));

    if (QUOTED_SPAN.test(s.text)) {
      add('NO_VERBATIM', 'a long quoted run; take the fact, write the sentence');
    }
    for (const sh of shingles(s.text)) {
      const fromTitle = titleShingles.get(sh);
      if (fromTitle) { add('NO_VERBATIM', `${SHINGLE} words shared with a source title: "${fromTitle.slice(0, 50)}"`); break; }
      const prev = seenShingle.get(sh);
      if (prev && prev !== `${s.id}:${s.field}`) { add('NO_VERBATIM', `${SHINGLE} words shared with ${prev}`); break; }
      seenShingle.set(sh, `${s.id}:${s.field}`);
    }

    const key = s.text.trim().toLowerCase();
    if (key.length > 40) {
      const prev = seenWhole.get(key);
      if (prev && prev !== `${s.id}:${s.field}`) add('DUPLICATE_STRING', `also in ${prev}`);
      else seenWhole.set(key, `${s.id}:${s.field}`);
    }
  }

  for (const id of revenants) {
    found.push({ rule: 'ONE_DESCRIPTION', id, field: 'description', detail: 'carries a second description again; one per item, the best of plain and technical', text: '' });
  }

  return found;
}


function smoke(): number {
  const cases: Array<[string, string, string]> = [
    ['READING_GRADE',      'description',        'Notwithstanding the aforementioned considerations, the implementation of comprehensive authentication methodologies necessitates substantial organisational commitment across heterogeneous infrastructure environments.'],
    ['SENTENCE_LENGTH',    'description',        'This is a deliberately long sentence written only so that it exceeds the ceiling that the gate sets for this particular field and therefore trips it.'],
    ['FRAGMENT',           'description',        'Same list.'],
    ['DANGLING_REFERENCE', 'description',        'A stolen password is enough.'],
    ['JARGON_IN_CONTENT',  'description',        'Your threat model decides which of these matters to you and why.'],
    ['ROTTING_DETAIL',     'description',        'Open Settings > Security and turn the option on, which is currently free.'],
    ['UNCOMMON_WORD',      'description',        'The organisation recommends immediate reconfiguration of your authentication preferences.'],
    ['NO_VERBATIM',        'description',        'She said "this is a long quoted sentence taken straight from somebody else\'s page" and moved on.'],
    ['LEAD_SENTENCE_LENGTH', 'description',      'The very first sentence of this description runs to more than eighteen words, which is longer than any of the eight one-line surfaces can print. A second sentence follows it.']
  ];

  let failed = 0;
  console.log(`\n${B}${BOLD}Smoke test: does every rule still fire?${X}\n`);
  for (const [rule, field, text] of cases) {
    const hits = inspect([{ file: 'content/items/smoke.yaml', id: 'smoke', field, text }], []);
    const fired = hits.some(h => h.rule === rule);
    console.log(`  ${fired ? G + '✓' : R + '✗'}${X} ${rule.padEnd(22)} ${D}${fired ? 'fires' : 'DID NOT FIRE — the rule is broken'}${X}`);
    if (!fired) failed++;
  }

  const revived = inspect([], [], ['smoke']).some(h => h.rule === 'ONE_DESCRIPTION');
  console.log(`  ${revived ? G + '✓' : R + '✗'}${X} ${'ONE_DESCRIPTION'.padEnd(22)} ${D}${revived ? 'fires' : 'DID NOT FIRE — the rule is broken'}${X}`);
  if (!revived) failed++;

  const clean = inspect([{ file: 'content/items/smoke.yaml', id: 'smoke', field: 'description', text: 'Turn on two-step login for your email.' }], []);
  const quiet = clean.length === 0;
  console.log(`  ${quiet ? G + '✓' : R + '✗'}${X} ${'CLEAN_TEXT_PASSES'.padEnd(22)} ${D}${quiet ? 'an approved sentence trips nothing' : 'an approved sentence tripped: ' + clean.map(c => c.rule).join(', ')}${X}`);
  if (!quiet) failed++;

  const approved = 6.48;
  const measured = grade('Turn on two-step login for your email. A stolen password is not enough on its own. It takes a few minutes and it is the single biggest thing you can do.');
  const sane = measured !== null && measured > 2 && measured < 14;
  console.log(`  ${sane ? G + '✓' : R + '✗'}${X} ${'GRADE_IS_SANE'.padEnd(22)} ${D}sample scores ${measured?.toFixed(2) ?? 'null'}; the approved corpus scores ${approved}${X}`);
  if (!sane) failed++;

  console.log(`\n${failed ? R + BOLD + `✗ ${failed} checks failed. The gate is not trustworthy until they pass.` : G + BOLD + '✓ Every rule fires, and clean text passes.'}${X}\n`);
  return failed;
}


const argv = process.argv.slice(2);
if (argv.includes('--smoke')) process.exit(smoke() ? 1 : 0);

const rebaseline = argv.includes('--rebaseline');
const onlyField = argv.includes('--field') ? argv[argv.indexOf('--field') + 1] : null;

const { rendered, sourceTitles, revenants } = corpus();
const findings = inspect(rendered, sourceTitles, revenants).filter(f => !onlyField || f.field === onlyField);

const counts: Record<string, number> = {};
for (const f of findings) counts[f.rule] = (counts[f.rule] ?? 0) + 1;

console.log(`\n${B}Reading every sentence a reader can see…${X}`);
console.log(`${D}  ${rendered.length} strings across ${FIELDS.length} rendered fields${X}`);

if (rendered.length === 0) {
  console.log(`\n${R}${BOLD}✗ No content was read at all.${X} ${D}Something is wrong with this script or the tree, not with the writing.${X}\n`);
  for (const p of problems) console.log(`  ${R}·${X} ${p}`);
  process.exit(2);
}

const plain = rendered
  .filter(s => s.field === 'description' && isControl(s.file))
  .map(s => grade(s.text)).filter((n): n is number => n !== null);
if (plain.length) {
  const mean = plain.reduce((a, b) => a + b, 0) / plain.length;
  console.log(`${D}  the ${plain.length} item descriptions average ${mean.toFixed(2)}, against the ${STANDARD_GRADE} standard${X}`);
  if (mean < 2 || mean > 12) note(`the item descriptions measure ${mean.toFixed(2)}, which no English prose does; suspect this formula before the writing`);
}
console.log();

if (problems.length) {
  console.log(`${Y}${BOLD}Before the findings, ${problems.length} thing${problems.length > 1 ? 's' : ''} this gate could not do properly:${X}`);
  for (const p of problems) console.log(`  ${Y}·${X} ${p}`);
  console.log();
}

if (!existsSync(BASELINE) || rebaseline) {
  writeFileSync(BASELINE, JSON.stringify({
    recorded: new Date().toISOString().slice(0, 10),
    standard: STANDARD_GRADE,
    note: 'What the corpus carried when this was recorded. The gate blocks anything added on top. Set "blocking" to true once the rewrite lands and it refuses all of it instead. Lowering a number here without fixing the text is how a gate stops meaning anything.',
    blocking: false,
    counts
  }, null, 2) + '\n');
  console.log(`${G}Baseline written.${X} ${D}${findings.length} findings recorded.${X}\n`);
  process.exit(problems.length ? 2 : 0);
}

let base: any;
try {
  base = JSON.parse(readFileSync(BASELINE, 'utf-8'));
  if (!base || typeof base.counts !== 'object') throw new Error('no counts object');
} catch (e) {
  console.log(`${R}${BOLD}✗ content-baseline.json is unreadable:${X} ${(e as Error).message}`);
  console.log(`${D}  Fix it, or run --rebaseline and say why in the log.${X}\n`);
  process.exit(2);
}

const rules = [...new Set([...Object.keys(counts), ...Object.keys(base.counts)])].sort();
let added = 0;
for (const rule of rules) {
  const now = counts[rule] ?? 0, was = base.counts[rule] ?? 0, delta = now - was;
  const c = delta > 0 ? R : delta < 0 ? G : D;
  console.log(`  ${c}${String(now).padStart(4)}${X} ${rule.padEnd(20)} ${D}was ${was}${X} ${c}${delta > 0 ? '+' + delta : delta < 0 ? delta : '='}${X}`);
  if (delta > 0) {
    added += delta;
    for (const f of findings.filter(x => x.rule === rule).slice(0, 3)) {
      console.log(`       ${Y}·${X} ${f.id} ${D}${f.field}${X} — ${f.detail}`);
      if (f.text) console.log(`         ${D}${f.text}…${X}`);
    }
  }
}

console.log();
if (problems.length) {
  console.log(`${R}${BOLD}✗ This gate could not read part of what it is meant to check.${X} ${D}See above. Findings below are incomplete.${X}\n`);
  process.exit(2);
}
if (base.blocking && findings.length) {
  console.log(`${R}${BOLD}✗ ${findings.length} findings, and this gate is blocking.${X}\n`);
  process.exit(1);
}
const advisory = base.advisory === true;
if (added > 0 && !advisory) {
  console.log(`${R}${BOLD}✗ ${added} added since ${base.recorded}.${X} ${D}Fix them, or run --rebaseline and say why in the log.${X}\n`);
  process.exit(1);
}
if (added > 0 && advisory) {
  console.log(`${Y}${BOLD}${added} added since ${base.recorded}. Advisory mode: reporting, not blocking.${X}`);
  console.log(`${D}  These numbers do not decide anything while the corpus is being rewritten by hand.${X}\n`);
  process.exit(0);
}
console.log(`${G}${BOLD}✓ Nothing added.${X} ${D}Recorded ${base.recorded}, standard ${base.standard ?? STANDARD_GRADE}. Reporting, not blocking.${X}\n`);
