#!/usr/bin/env tsx

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'svelte/compiler';
import ts from 'typescript';
import { readWiki } from '../src/lib/wiki/read.ts';
import * as reader from '../src/lib/wiki/page.ts';
import type { WikiPage } from '../src/lib/wiki/page.ts';

const ROOT = process.cwd();
const R = '\x1b[31m'; const G = '\x1b[32m'; const Y = '\x1b[33m'; const B = '\x1b[34m';
const D = '\x1b[2m'; const X = '\x1b[0m'; const BOLD = '\x1b[1m';

const notes = readWiki(ROOT).pages;

type Extra = 'none' | 'values' | 'names' | 'count' | 'rows';
const READERS: Record<string, Extra> = {
  text: 'none', link: 'none', links: 'none', lines: 'none', items: 'none', named: 'none', plainLines: 'none',
  fill: 'values', pieces: 'values', placed: 'names', spans: 'names', labels: 'count', rows: 'rows'
};

interface Read { file: string; line: number; fn: string; note: string; keys: string[] | null; extras: unknown[] | null; source: string }
const reads: Read[] = [];
const failures: string[] = [];

const walk = (dir: string, out: string[] = []): string[] => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(svelte|ts)$/.test(f) && !f.endsWith('.d.ts')) out.push(p);
  }
  return out;
};

const unwrap = (x: ts.Expression): ts.Expression => ts.isParenthesizedExpression(x) ? unwrap(x.expression) : x;

function keysOf(x: ts.Expression | undefined): string[] | null {
  if (!x) return null;
  x = unwrap(x);
  if (ts.isStringLiteral(x) || ts.isNoSubstitutionTemplateLiteral(x)) return [x.text];
  if (ts.isConditionalExpression(x)) {
    const a = keysOf(x.whenTrue), b = keysOf(x.whenFalse);
    return a && b ? [...a, ...b] : null;
  }
  return null;
}

function valueSets(x: ts.Expression | undefined): string[][] | null {
  if (!x) return null;
  x = unwrap(x);
  if (ts.isObjectLiteralExpression(x)) {
    const names: string[] = [];
    for (const p of x.properties) {
      if (ts.isShorthandPropertyAssignment(p)) names.push(p.name.text);
      else if (ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name))) names.push(p.name.text);
      else return null;
    }
    return [names];
  }
  if (ts.isConditionalExpression(x)) {
    const a = valueSets(x.whenTrue), b = valueSets(x.whenFalse);
    return a && b ? [...a, ...b] : null;
  }
  return null;
}

function namesOf(x: ts.Expression | undefined): string[] | null {
  if (!x) return null;
  x = unwrap(x);
  if (ts.isArrayLiteralExpression(x) && x.elements.every(e => ts.isStringLiteral(e))) {
    return x.elements.map(e => (e as ts.StringLiteral).text);
  }
  return null;
}

function scan(code: string, file: string, lineBase: number, imported: Map<string, string>, readers: Map<string, string>) {
  const sf = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const visit = (n: ts.Node) => {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && readers.has(n.expression.text)) {
      const [a0, a1, a2] = n.arguments;
      const note = a0 && ts.isIdentifier(a0) ? imported.get(a0.text) : undefined;
      if (note) {
        const fn = readers.get(n.expression.text)!;
        const extra = READERS[fn];
        const extras: unknown[] | null =
          extra === 'values' ? valueSets(a2) :
          extra === 'names' ? (namesOf(a2) ? [namesOf(a2)] : null) :
          extra === 'count' ? (a2 && ts.isNumericLiteral(unwrap(a2)) ? [Number((unwrap(a2) as ts.NumericLiteral).text)] : null) :
          [undefined];
        reads.push({
          file, fn, note, keys: keysOf(a1), extras,
          line: lineBase + sf.getLineAndCharacterOfPosition(n.getStart()).line + 1,
          source: n.getText().replace(/\s+/g, ' ').slice(0, 100)
        });
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
}

const lineAt = (src: string, pos: number) => src.slice(0, pos).split('\n').length;

for (const abs of walk(join(ROOT, 'src'))) {
  const file = relative(ROOT, abs).replace(/\\/g, '/');
  const src = readFileSync(abs, 'utf-8');
  const imported = new Map<string, string>();
  const readers = new Map<string, string>();
  const scripts = file.endsWith('.ts')
    ? [{ code: src, base: 0 }]
    : [...src.matchAll(/(<script\b[^>]*>)([\s\S]*?)<\/script>/g)].map(m => ({ code: m[2], base: lineAt(src, (m.index ?? 0) + m[1].length) - 1 }));
  for (const { code } of scripts) {
    const sf = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    for (const st of sf.statements) {
      if (!ts.isImportDeclaration(st) || !ts.isStringLiteral(st.moduleSpecifier)) continue;
      const from = st.moduleSpecifier.text;
      const m = /^#spectra-wiki\/page\/([\w-]+)$/.exec(from);
      if (m && st.importClause?.name) imported.set(st.importClause.name.text, m[1]);
      const bindings = st.importClause?.namedBindings;
      if (/(^|\/)wiki\/page(\.js|\.ts)?$/.test(from) && bindings && ts.isNamedImports(bindings)) {
        for (const el of bindings.elements) {
          const name = (el.propertyName ?? el.name).text;
          if (name in READERS) readers.set(el.name.text, name);
        }
      }
    }
  }
  if (!imported.size) continue;
  if (!readers.size) failures.push(`${file}  imports a note and no reader from wiki/page, so none of its reads can be checked`);
  for (const { code, base } of scripts) scan(code, file, base, imported, readers);
  if (file.endsWith('.ts')) continue;
  const blanked = src.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/g, (_m, open, body, close) => open + body.replace(/[^\n]/g, ' ') + close);
  const ast = parse(blanked);
  const visit = (node: any) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(visit); return; }
    if (node.expression && typeof node.expression.start === 'number') {
      scan(`(${src.slice(node.expression.start, node.expression.end)})`, file, lineAt(src, node.expression.start) - 1, imported, readers);
    }
    for (const [k, v] of Object.entries(node)) if (k !== 'expression' && v && typeof v === 'object') visit(v);
  };
  visit(ast.html);
}

const unresolved: Read[] = [];
const readKeys = new Map<string, Set<string>>();
const opaque = new Set<string>();

function attempt(fn: string, page: WikiPage, key: string, extra: unknown): string | null {
  try {
    const r = reader as unknown as Record<string, (...a: unknown[]) => unknown>;
    if (READERS[fn] === 'values') r[fn](page, key, Object.fromEntries((extra as string[]).map(n => [n, 'x'])));
    else if (READERS[fn] === 'names') r[fn](page, key, extra);
    else if (READERS[fn] === 'count') r[fn](page, key, extra);
    else if (READERS[fn] === 'rows') r.items(page, key);
    else r[fn](page, key);
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}

for (const rd of reads) {
  const page = notes[rd.note];
  if (!page) { failures.push(`${rd.file}:${rd.line}  imports wiki/pages/${rd.note}.md, which does not exist`); continue; }
  if (!rd.keys || !rd.extras) { unresolved.push(rd); opaque.add(rd.note); continue; }
  const seen = readKeys.get(rd.note) ?? new Set<string>();
  readKeys.set(rd.note, seen);
  for (const key of rd.keys) {
    seen.add(key);
    const errors = rd.extras.map(x => attempt(rd.fn, page, key, x));
    if (errors.every(Boolean)) failures.push(`${rd.file}:${rd.line}  ${rd.source}\n      ${errors[0]}`);
  }
}

for (const [name, page] of Object.entries(notes)) {
  if (opaque.has(name) || !readKeys.has(name)) continue;
  const unread = Object.keys(page).filter(k => !readKeys.get(name)!.has(k));
  for (const k of unread) failures.push(`wiki/pages/${name}.md  "## ${k}" is read by no code, so nothing in it ever shows`);
}

console.log(`${B}Checking every read of a page note against the note…${X}`);
if (unresolved.length) {
  console.log(`${Y}  ${unresolved.length} read(s) name the key or the places through a variable and are not checked here:${X}`);
  for (const u of unresolved) console.log(`${D}    ${u.file}:${u.line}  ${u.source}${X}`);
}
const notesRead = new Set(reads.map(r => r.note)).size;
if (failures.length) {
  console.log(`\n${R}${BOLD}✗ ${failures.length} read(s) disagree with the note${X}\n`);
  for (const f of failures) console.log(`  ${R}✗${X} ${f}`);
  console.log(`\n${D}Each would throw where a reader sees it. Fix the note or the page so they agree.${X}`);
  process.exit(1);
}
console.log(`${G}✓ Every read agrees with its note.${X} ${D}${reads.length - unresolved.length} reads checked across ${notesRead} notes; ` +
  `${Object.keys(notes).length - opaque.size} notes also checked for keys nothing reads.${X}`);
