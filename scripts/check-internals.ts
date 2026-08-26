#!/usr/bin/env tsx

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = process.cwd();
const R = '\x1b[31m'; const G = '\x1b[32m'; const B = '\x1b[34m';
const D = '\x1b[2m'; const X = '\x1b[0m'; const BOLD = '\x1b[1m';

const ALLOWED_FILES = new Set([
  'src/routes/methodology/+page.svelte'
]);

const ALLOWED_EXPRESSIONS: Record<string, RegExp[]> = {
  'src/routes/graph/+page.svelte': [/^coveragePct$/, /Math\.round\(zoom \* 100\)/],
  'src/lib/components/audit/QuizView.svelte': [/\bscore\b/]
};

const INTERNAL_PATTERNS: Array<{ re: RegExp; what: string }> = [
  { re: /score/i, what: 'a raw or overall score' },
  { re: /multiplier/i,                  what: 'a multiplier' },
  { re: /\bpts\b/i,                     what: 'a points value' },
  { re: /score_before|score_after/,     what: 'a score delta' },
  { re: /last_verified|verificationAge|verifiedAgeClass/, what: 'last_verified or a derived age' },
  { re: /maturity_level|maturityLabels/, what: 'a maturity level' },
  { re: /skipped_weight_ratio|category_saturation|relevance_score|effective_score|score_weight/, what: 'an engine weight' }
];

const INTERNAL_LITERALS: Array<{ re: RegExp; what: string }> = [
  { re: /Last verified/,        what: 'a last_verified date' },
  { re: /Verified:/,            what: 'a last_verified date' },
  { re: /score multiplier/i,    what: 'a multiplier' },
  { re: /May be outdated|Verify before implementing/, what: 'an age-derived warning' },
  { re: /\/ 100\b/,             what: 'a raw score denominator' }
];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith('.svelte')) out.push(full);
  }
  return out;
}

function markupOf(source: string): { text: string; offset: number } {
  const end = source.lastIndexOf('</script>');
  const offset = end === -1 ? 0 : end + '</script>'.length;
  return { text: source.slice(offset), offset };
}

function outputExpressions(markup: string): Array<{ expr: string; index: number }> {
  const found: Array<{ expr: string; index: number }> = [];
  for (let i = 0; i < markup.length; i++) {
    if (markup[i] !== '{') continue;
    const next = markup[i + 1];
    if (next === '#' || next === ':' || next === '/' || next === '@' || next === '!') continue;
    let depth = 1;
    let j = i + 1;
    while (j < markup.length && depth > 0) {
      if (markup[j] === '{') depth++;
      else if (markup[j] === '}') depth--;
      j++;
    }
    found.push({ expr: markup.slice(i + 1, j - 1), index: i });
    i = j - 1;
  }
  return found;
}

const stripComments = (markup: string) => markup.replace(/<!--[\s\S]*?-->/g, m => ' '.repeat(m.length));

const lineOf = (source: string, index: number) => source.slice(0, index).split('\n').length;

interface Finding { file: string; line: number; what: string; snippet: string }
const findings: Finding[] = [];

const roots = ['src/routes', 'src/lib/components'].map(p => join(ROOT, p));
const files = roots.flatMap(r => walk(r));

console.log(`${B}Checking that no engine internal renders to a person…${X}`);

for (const full of files) {
  const rel = relative(ROOT, full).replace(/\\/g, '/');
  if (ALLOWED_FILES.has(rel)) continue;

  const source = readFileSync(full, 'utf8');
  const { text, offset } = markupOf(source);
  const markup = stripComments(text);
  const allowances = ALLOWED_EXPRESSIONS[rel] ?? [];

  for (const { expr, index } of outputExpressions(markup)) {
    if (allowances.some(a => a.test(expr.trim()))) continue;
    for (const { re, what } of INTERNAL_PATTERNS) {
      if (re.test(expr)) {
        findings.push({
          file: rel,
          line: lineOf(source, offset + index),
          what,
          snippet: `{${expr.replace(/\s+/g, ' ').trim().slice(0, 70)}}`
        });
        break;
      }
    }
  }

  for (const { re, what } of INTERNAL_LITERALS) {
    const m = re.exec(markup);
    if (m) {
      findings.push({
        file: rel,
        line: lineOf(source, offset + (m.index ?? 0)),
        what,
        snippet: m[0]
      });
    }
  }
}

console.log('');
if (findings.length === 0) {
  console.log(`${G}${BOLD}✓ I5 holds.${X} ${D}${files.length} components checked; no engine internal renders outside ${[...ALLOWED_FILES].join(', ')}.${X}\n`);
  process.exit(0);
}

console.log(`${R}${BOLD}✗ I5 violated — ${findings.length} internal(s) rendering to a person${X}\n`);
const byFile = new Map<string, Finding[]>();
for (const f of findings) {
  if (!byFile.has(f.file)) byFile.set(f.file, []);
  byFile.get(f.file)!.push(f);
}
for (const [file, list] of byFile) {
  console.log(`  ${D}${file}${X}`);
  for (const f of list) console.log(`    ${R}✗${X} line ${f.line}: ${f.what} — ${D}${f.snippet}${X}`);
}
console.log(`\n${D}Allowed surfaces: ${[...ALLOWED_FILES].join(', ')} and the /graph percentage.${X}\n`);
process.exit(1);
