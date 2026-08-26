#!/usr/bin/env tsx
// Spectra content health report
//   npm run maintain

import { readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';
import yaml from 'js-yaml';

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, 'content');

const R = '\x1b[31m'; const G = '\x1b[32m'; const Y = '\x1b[33m';
const B = '\x1b[34m'; const D = '\x1b[2m'; const X = '\x1b[0m'; const BOLD = '\x1b[1m';

const AMBER_DAYS = 180;     // ~6 months
const RED_DAYS = 365;       // ~12 months
const CRITICAL_DAYS = 548;  // ~18 months

const TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'fbclid', 'gclid', 'msclkid', 'ref=', 'referral',
];

type Level = 'critical' | 'red' | 'amber';
interface Entry { file: string; item: any; }
interface Finding { id: string; file: string; level: Level; check: string; detail: string; }

const HARD_CHECKS = new Set([
  'duplicate_id', 'cross_reference', 'no_sources', 'human_track', 'mixed_posture_caveats', 'tracking_url',
]);

function readYamlDir(subdir: string): Entry[] {
  const dir = join(CONTENT_DIR, subdir);
  const out: Entry[] = [];
  let files: string[];
  try {
    files = readdirSync(dir).filter((f) => /\.ya?ml$/.test(f));
  } catch {
    return out;
  }
  for (const f of files) {
    const path = join(dir, f);
    let raw: string;
    try { raw = readFileSync(path, 'utf-8'); } catch { continue; }
    const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const parts = normalized.split(/^---\s*$/m).filter((s) => s.trim());
    for (const part of parts) {
      let parsed: unknown;
      try { parsed = yaml.load(part.trim()); } catch (e) {
        out.push({ file: relative(ROOT, path), item: { id: '(parse error)', __parse_error__: String(e) } });
        continue;
      }
      if (!parsed || typeof parsed !== 'object') continue;
      if (Array.isArray(parsed)) {
        for (const e of parsed) if (e && typeof e === 'object') out.push({ file: relative(ROOT, path), item: e });
      } else {
        out.push({ file: relative(ROOT, path), item: parsed });
      }
    }
  }
  return out;
}

function ageDays(lastVerified: string): number | null {
  const t = Date.parse(String(lastVerified).slice(0, 10));
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86_400_000);
}

function* extractUrls(data: any, prefix = ''): Generator<[string, string]> {
  if (data && typeof data === 'object') {
    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) yield* extractUrls(data[i], `${prefix}[${i}]`);
    } else {
      for (const [k, v] of Object.entries(data)) {
        const path = prefix ? `${prefix}.${k}` : k;
        if ((k === 'url' || k === 'source_url') && typeof v === 'string' && v.startsWith('http')) {
          yield [path, v];
        } else {
          yield* extractUrls(v, path);
        }
      }
    }
  }
}

function main() {
  const items = readYamlDir('items');
  const threats = readYamlDir('threats');
  const controls = readYamlDir('controls');
  const resources = readYamlDir('resources');
  const all = [...items, ...threats, ...controls, ...resources];

  const ids = new Set<string>();
  for (const { item } of all) if (typeof item?.id === 'string') ids.add(item.id);

  const findings: Finding[] = [];
  const add = (id: string, file: string, level: Level, check: string, detail: string) =>
    findings.push({ id, file, level, check, detail });

  const seen = new Map<string, string>();
  for (const { file, item } of all) {
    const id = item?.id;
    if (typeof id !== 'string') continue;
    if (seen.has(id)) add(id, file, 'critical', 'duplicate_id', `ID also declared in ${seen.get(id)}`);
    else seen.set(id, file);
  }

  for (const { file, item } of all) {
    if (!item?.id) continue;
    const lv = item.last_verified;
    if (!lv) {
      add(item.id, file, 'amber', 'no_last_verified', 'No last_verified date set.');
      continue;
    }
    const age = ageDays(lv);
    if (age === null) { add(item.id, file, 'amber', 'staleness', `last_verified '${lv}' is not a valid date.`); continue; }
    if (age >= CRITICAL_DAYS) add(item.id, file, 'critical', 'staleness', `last_verified ${lv} (${age} days ago).`);
    else if (age >= RED_DAYS) add(item.id, file, 'red', 'staleness', `last_verified ${lv} (${age} days ago).`);
    else if (age >= AMBER_DAYS) add(item.id, file, 'amber', 'staleness', `last_verified ${lv} (${age} days ago).`);
  }

  // Cross-references
  const REF_FIELDS = [
    'compensating_controls', 'depends_on', 'related_items', 'resources', 'controls_implemented',
    'superseded_by', 'implemented_by', 'mitigated_by', 'mitigates_threats', 'alternatives',
  ];
  for (const { file, item } of all) {
    if (!item?.id) continue;
    for (const field of REF_FIELDS) {
      const val = item[field];
      if (!val) continue;
      const refs = Array.isArray(val) ? val : [val];
      for (const ref of refs) {
        const refId = typeof ref === 'string' ? ref : ref?.id;
        if (typeof refId === 'string' && !ids.has(refId)) {
          add(item.id, file, 'red', 'cross_reference', `'${field}' references '${refId}' which does not exist.`);
        }
      }
    }
  }

  for (const { file, item } of all) {
    if (!item?.id || item.status !== 'active') continue;
    const sources = Array.isArray(item.sources) ? item.sources : [];
    if (sources.length === 0) {
      add(item.id, file, 'red', 'no_sources', 'status:active but no sources listed.');
    } else if (!sources.some((s: any) => s?.type === 'primary')) {
      add(item.id, file, 'amber', 'missing_primary', 'status:active but no source with type:primary.');
    }
  }

  for (const { file, item } of items) {
    if (item?.category === 'human_vulnerability' && !item.emotional_register) {
      add(item.id, file, 'red', 'human_track', 'category:human_vulnerability requires emotional_register.');
    }
  }

  for (const { file, item } of resources) {
    if (['mixed', 'avoid'].includes(item?.privacy_posture) && (!Array.isArray(item.caveats) || item.caveats.length === 0)) {
      add(item.id, file, 'red', 'mixed_posture_caveats', `privacy_posture:${item.privacy_posture} requires non-empty caveats.`);
    }
  }

  for (const { file, item } of all) {
    if (!item?.id) continue;
    for (const [fieldPath, url] of extractUrls(item)) {
      if (TRACKING_PARAMS.some((p) => url.includes(p))) {
        add(item.id, file, 'red', 'tracking_url', `URL at '${fieldPath}' has tracking params: ${url.slice(0, 100)}`);
      }
    }
  }

  console.log(`\n${BOLD}Spectra content health${X} ${D}— ${items.length} items, ${threats.length} threats, ${controls.length} controls, ${resources.length} resources${X}\n`);

  const failures = findings.filter((f) => HARD_CHECKS.has(f.check));
  const warnings = findings.filter((f) => !HARD_CHECKS.has(f.check));

  const emoji = (l: Level) => (l === 'critical' ? '🔴' : l === 'red' ? '🟠' : '🟡');
  const byCheck = (list: Finding[]) => {
    const m = new Map<string, Finding[]>();
    for (const f of list) { if (!m.has(f.check)) m.set(f.check, []); m.get(f.check)!.push(f); }
    return m;
  };

  if (failures.length) {
    console.log(`${R}${BOLD}FAILURES (${failures.length})${X}`);
    for (const [check, fs] of byCheck(failures)) {
      console.log(`\n  ${R}${check}${X}`);
      for (const f of fs) console.log(`    ${emoji(f.level)} ${f.id} — ${f.detail} ${D}${f.file}${X}`);
    }
    console.log('');
  }

  if (warnings.length) {
    console.log(`${Y}${BOLD}WARNINGS (${warnings.length})${X} ${D}(staleness / missing primary source — review, not blocking)${X}`);
    for (const [check, fs] of byCheck(warnings)) {
      console.log(`\n  ${Y}${check}${X}`);
      for (const f of fs) console.log(`    ${emoji(f.level)} ${f.id} — ${f.detail} ${D}${f.file}${X}`);
    }
    console.log('');
  }

  if (!failures.length && !warnings.length) {
    console.log(`${G}${BOLD}✓ Clean.${X} ${D}No staleness, integrity, or cross-reference issues.${X}\n`);
    process.exit(0);
  }

  if (failures.length) {
    console.log(`${R}${BOLD}✗ ${failures.length} blocking issue(s).${X} ${D}${warnings.length} warning(s). Fix failures, then run \`npm run validate\`.${X}\n`);
    process.exit(1);
  }

  console.log(`${G}${BOLD}✓ No blocking issues.${X} ${D}${warnings.length} warning(s) to review when convenient.${X}\n`);
  process.exit(0);
}

main();
