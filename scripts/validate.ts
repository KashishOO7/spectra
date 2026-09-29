#!/usr/bin/env tsx

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import yaml from 'js-yaml';
import { HARMS, TRACK_OPTIONS } from '../src/lib/audit/constants.js';
import type { Asset, AttackVector, Harm } from '../src/lib/types.js';
import { readControls } from '../src/lib/content/controls.ts';
import { readResources } from '../src/lib/content/resources.ts';
import { readLookups } from '../src/lib/content/lookups.ts';
import { WIKI_FOLDERS } from '../src/lib/wiki/read.ts';
import { parsePage, items as noteItems, text as noteText } from '../src/lib/wiki/page.ts';
import { CHAPTERS } from '../src/lib/audit/chapters.ts';
import { feelingsFor } from '../src/lib/engine/feelings.ts';

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, 'content');

const R = '\x1b[31m'; const G = '\x1b[32m'; const Y = '\x1b[33m';
const B = '\x1b[34m'; const D = '\x1b[2m';  const X = '\x1b[0m';
const BOLD = '\x1b[1m';


function readYamlFile(path: string): unknown[] {
  let raw: string;
  try {
    raw = readFileSync(path, 'utf-8');
  } catch (e) {
    throw new Error(`Cannot read file ${path}: ${e}`);
  }

  const results: unknown[] = [];
  const parts = raw.split(/^---$/m).filter(s => s.trim());

  if (parts.length === 0) {
    throw new Error(`Empty YAML file: ${path}`);
  }

  for (const part of parts) {
    let parsed: unknown;
    try {
      parsed = yaml.load(part.trim());
    } catch (e) {
      throw new Error(`YAML parse error in ${path}: ${e}`);
    }

    if (parsed === null || parsed === undefined) continue;

    if (Array.isArray(parsed)) {
      for (const entry of parsed) {
        if (entry !== null && entry !== undefined) results.push(entry);
      }
    } else {
      results.push(parsed);
    }
  }

  return results;
}

function readAllItems(subdir: string): Array<{ file: string; item: any }> {
  const dir = join(CONTENT_DIR, subdir);
  const result: Array<{ file: string; item: any }> = [];

  let files: string[];
  try {
    files = readdirSync(dir).filter(f => /\.ya?ml$/.test(f));
  } catch {
    return result;
  }

  for (const file of files) {
    const path = join(dir, file);
    let items: unknown[];
    try {
      items = readYamlFile(path);
    } catch (e) {
      errors.push({
        rule: 'YAML_PARSE',
        severity: 'blocking',
        file: relative(ROOT, path),
        message: String(e),
      });
      continue;
    }
    for (const item of items) {
      result.push({ file: relative(ROOT, path), item });
    }
  }

  return result;
}

interface ValidationResult {
  rule: string;
  severity: 'blocking' | 'warning';
  file: string;
  item_id?: string;
  message: string;
}

const errors: ValidationResult[] = [];
const warnings: ValidationResult[] = [];

function fail(rule: string, file: string, message: string, item_id?: string) {
  errors.push({ rule, severity: 'blocking', file, item_id, message });
}

function warn(rule: string, file: string, message: string, item_id?: string) {
  warnings.push({ rule, severity: 'warning', file, item_id, message });
}

const VALID_CATEGORIES = new Set([
  'device_security', 'account_security', 'communications', 'network_security',
  'physical_security', 'human_vulnerability', 'data_management', 'osint_footprint',
  'incident_response', 'ai_threats',
]);

const VALID_ADVERSARIES = new Set([
  'opportunistic', 'targeted_individual', 'criminal_org', 'intimate_partner',
  'employer', 'isp_network', 'data_broker', 'domestic_government',
  'foreign_government', 'ai_automated',
]);

const VALID_ATTACK_VECTORS = new Set([
  'phishing', 'spear_phishing', 'physical_access', 'network_interception',
  'social_engineering', 'malware', 'supply_chain', 'credential_stuffing',
  'sim_swap', 'browser_fingerprinting', 'metadata_analysis', 'osint_passive',
  'deepfake', 'voice_clone', 'data_broker_aggregation', 'insider_access',
  'identity_fraud',
]);

const VALID_ASSETS = new Set([
  'credentials', 'local_data', 'cloud_data', 'communications', 'metadata',
  'location', 'identity', 'financial', 'relationships', 'reputation',
  'devices', 'biometrics', 'behavioral_data', 'account_access',
]);

const VALID_TRACKS = new Set([
  'general', 'caring_for_someone', 'known_person_risk', 'public_work', 'work_accounts',
  'ai_focused',
]);

const VALID_PLATFORMS = new Set([
  'all', 'android', 'ios', 'windows', 'linux', 'macos', 'web',
  'router', 'iot', 'any_mobile', 'any_desktop',
]);

const VALID_EMOTIONAL_REGISTERS = new Set([
  'urgency', 'authority', 'social_proof', 'reciprocity', 'fear',
  'scarcity', 'trust_exploitation', 'grief_isolation', 'anger', 'loneliness',
]);

const VALID_STATUSES = new Set([
  'active', 'deprecated', 'under_review', 'region_specific', 'contested',
]);

const VALID_TIME_SETUP = new Set(['5min', '10min', '15min', '30min', '2hr', 'half_day', 'multi_day']);
const VALID_TIME_ONGOING = new Set(['negligible', 'low', 'medium', 'high']);
const VALID_MATURITY = new Set([1, 2, 3, 4, 5]);

const VALID_PREVALENCE = new Set(['common', 'occasional', 'rare', 'theoretical']);
const VALID_LIKELIHOOD = new Set(['low', 'medium', 'high', 'near_certain']);
const VALID_SOPHISTICATION = new Set([1, 2, 3, 4, 5]);

const TRACKING_PARAMS = [
  'utm_source', 'utm_campaign', 'utm_medium', 'utm_content', 'utm_term',
  'fbclid', 'gclid', 'ref=', 'referral',
];

console.log('\nRunning schema validation...');

const allChecklistItems: Array<{ file: string; item: any }> = (() => {
  try {
    return readControls(ROOT);
  } catch (e) {
    errors.push({ rule: 'YAML_PARSE', severity: 'blocking', file: 'content/items or wiki/controls', message: String(e) });
    return [];
  }
})();
const allThreats       = readAllItems('threats');
const allControls      = readAllItems('controls');

const allResources: Array<{ file: string; item: any }> = (() => {
  try {
    return readResources(ROOT);
  } catch (e) {
    errors.push({ rule: 'YAML_PARSE', severity: 'blocking', file: 'content/resources or wiki/resources', message: String(e) });
    return [];
  }
})();

const allContent = [
  ...allChecklistItems,
  ...allThreats,
  ...allResources,
  ...allControls,
];

const allIds = new Map<string, string>();

for (const { file, item } of allContent) {
  if (!item || typeof item !== 'object') {
    fail('YAML_STRUCTURE', file, 'Parsed item is not an object — check YAML format');
    continue;
  }

  if (!item.id) {
    fail('ID_FORMAT', file, 'Missing id field');
    continue;
  }

  if (typeof item.id !== 'string') {
    fail('ID_FORMAT', file, `id must be a string, got ${typeof item.id}`);
    continue;
  }

  if (allIds.has(item.id)) {
    fail('UNIQUE_IDS', file, `Duplicate ID '${item.id}' — also declared in ${allIds.get(item.id)}`);
  } else {
    allIds.set(item.id, file);
  }
}

const CHECKLIST_REQUIRED = [
  'id', 'schema_version', 'version', 'title', 'description',
  'threat_narrative', 'category', 'subcategory', 'tracks', 'platforms',
  'difficulty', 'maturity_level', 'adversaries',
  'attack_vectors', 'assets_protected', 'score_weight', 'status',
  'last_verified', 'sources',
];

console.log(`${B}Validating ${allChecklistItems.length} checklist items…${X}`);

for (const { file, item } of allChecklistItems) {
  const id = item.id ?? '(no id)';

  for (const field of CHECKLIST_REQUIRED) {
    if (item[field] === undefined) {
      fail('REQUIRED_FIELDS', file, `Missing required field '${field}'`, id);
    }
  }

  if (item.category && !VALID_CATEGORIES.has(item.category)) {
    fail('VALID_TAXONOMY_VALUES', file, `Invalid category '${item.category}'`, id);
  }

  if (item.subcategory !== undefined && typeof item.subcategory !== 'string') {
    fail('VALID_TAXONOMY_VALUES', file, `subcategory must be a string`, id);
  }

  if (item.time_estimate?.setup !== undefined && !VALID_TIME_SETUP.has(item.time_estimate.setup)) {
    fail('VALID_TAXONOMY_VALUES', file,
      `Invalid time_estimate.setup '${item.time_estimate.setup}'`, id);
  }
  if (item.time_estimate?.ongoing !== undefined && !VALID_TIME_ONGOING.has(item.time_estimate.ongoing)) {
    warn('VALID_TAXONOMY_VALUES', file,
      `time_estimate.ongoing '${item.time_estimate.ongoing}' is outside the declared union`, id);
  }

  if (typeof item.description !== 'string' || item.description.trim() === '') {
    fail('DESCRIPTION_PRESENT', file,
      `description must be a non-empty string — it is the action card headline, the list row, ` +
      `the step page h1 and the search blurb, all taken from its first sentence`, id);
  }

  for (const adv of (item.adversaries ?? [])) {
    if (!VALID_ADVERSARIES.has(adv)) {
      fail('VALID_TAXONOMY_VALUES', file, `Invalid adversary '${adv}' — valid: ${[...VALID_ADVERSARIES].join(', ')}`, id);
    }
  }

  for (const vec of (item.attack_vectors ?? [])) {
    if (!VALID_ATTACK_VECTORS.has(vec)) {
      fail('VALID_TAXONOMY_VALUES', file, `Invalid attack_vector '${vec}' — valid: ${[...VALID_ATTACK_VECTORS].join(', ')}`, id);
    }
  }

  for (const asset of (item.assets_protected ?? [])) {
    if (!VALID_ASSETS.has(asset)) {
      fail('VALID_TAXONOMY_VALUES', file, `Invalid asset '${asset}'`, id);
    }
  }

  for (const track of (item.tracks ?? [])) {
    if (!VALID_TRACKS.has(track)) {
      fail('VALID_TAXONOMY_VALUES', file, `Invalid track '${track}'`, id);
    }
  }

  for (const p of (item.platforms ?? [])) {
    if (!VALID_PLATFORMS.has(p)) {
      fail('VALID_TAXONOMY_VALUES', file, `Invalid platform '${p}'`, id);
    }
  }

  if (item.status && !VALID_STATUSES.has(item.status)) {
    fail('VALID_TAXONOMY_VALUES', file, `Invalid status '${item.status}'`, id);
  }

  if (item.maturity_level !== undefined && !VALID_MATURITY.has(item.maturity_level)) {
    fail('VALID_TAXONOMY_VALUES', file, `Invalid maturity_level '${item.maturity_level}' — must be 1–5`, id);
  }

  if (item.score_weight !== undefined) {
    if (typeof item.score_weight !== 'number' || item.score_weight < 0 || item.score_weight > 10) {
      fail('SCORE_WEIGHT_RANGE', file, `score_weight ${item.score_weight} must be a number 0–10`, id);
    }
  }

  if (item.status === 'active') {
    const hasPrimary = Array.isArray(item.sources) && item.sources.some((s: any) => s?.type === 'primary');
    if (!hasPrimary) {
      fail('PRIMARY_SOURCE_REQUIRED', file, `Active item has no source with type: primary`, id);
    }
  }

  if (item.category === 'human_vulnerability' && !(item.tracks ?? []).includes('caring_for_someone') && feelingsFor(id).length === 0) {
    fail('EMOTIONAL_REGISTER_FOR_HUMAN_ITEMS', file,
      `no feeling in src/lib/engine/feelings.ts raises this step, so the quiz and Real or scam can never move it`, id);
  }
  if (item.emotional_register !== undefined && item.emotional_register !== null && !VALID_EMOTIONAL_REGISTERS.has(item.emotional_register)) {
    fail('VALID_TAXONOMY_VALUES', file, `Invalid emotional_register '${item.emotional_register}'`, id);
  }

  if (item.status === 'deprecated' && !item.superseded_by) {
    fail('SUPERSEDED_BY_REQUIRED_ON_DEPRECATED', file,
      `Deprecated item must set superseded_by`, id);
  }

  for (const [adv, mult] of Object.entries(item.threat_model_multipliers ?? {})) {
    if (typeof mult === 'number' && mult > 2.0) {
      warn('NO_MULTIPLIER_ABOVE_TWO', file,
        `threat_model_multipliers.${adv} = ${mult} > 2.0 — consider escalating to critical alert`, id);
    }
  }

  for (const source of (item.sources ?? [])) {
    if (source?.url && TRACKING_PARAMS.some(p => source.url.includes(p))) {
      fail('NO_TRACKING_URLS', file, `Source URL contains tracking parameter: ${source.url}`, id);
    }
  }
}

const THREAT_REQUIRED = [
  'id', 'schema_version', 'version', 'adversary_type', 'attack_vector',
  'title', 'description', 'sophistication_required', 'prevalence',
  'mitigated_by', 'assets_at_risk', 'status', 'last_verified', 'sources',
];

if (allThreats.length > 0) {
  console.log(`${B}Validating ${allThreats.length} threat nodes…${X}`);
}

for (const { file, item } of allThreats) {
  const id = item.id ?? '(no id)';

  for (const field of THREAT_REQUIRED) {
    if (item[field] === undefined) {
      fail('REQUIRED_FIELDS', file, `Missing required field '${field}'`, id);
    }
  }

  if (item.adversary_type && !VALID_ADVERSARIES.has(item.adversary_type)) {
    fail('VALID_TAXONOMY_VALUES', file, `Invalid adversary_type '${item.adversary_type}'`, id);
  }

  if (item.attack_vector && !VALID_ATTACK_VECTORS.has(item.attack_vector)) {
    fail('VALID_TAXONOMY_VALUES', file, `Invalid attack_vector '${item.attack_vector}'`, id);
  }

  for (const asset of (item.assets_at_risk ?? [])) {
    if (!VALID_ASSETS.has(asset)) {
      fail('VALID_TAXONOMY_VALUES', file, `Invalid asset_at_risk '${asset}'`, id);
    }
  }

  if (item.prevalence && !VALID_PREVALENCE.has(item.prevalence)) {
    fail('VALID_TAXONOMY_VALUES', file,
      `Invalid prevalence '${item.prevalence}' — valid: ${[...VALID_PREVALENCE].join(', ')}`, id);
  }

  if (item.likelihood_without_controls && !VALID_LIKELIHOOD.has(item.likelihood_without_controls)) {
    fail('VALID_TAXONOMY_VALUES', file,
      `Invalid likelihood_without_controls '${item.likelihood_without_controls}'`, id);
  }

  if (item.sophistication_required !== undefined && !VALID_SOPHISTICATION.has(item.sophistication_required)) {
    fail('VALID_TAXONOMY_VALUES', file,
      `Invalid sophistication_required '${item.sophistication_required}' — must be 1–5`, id);
  }

  for (const track of (item.tracks ?? [])) {
    if (!VALID_TRACKS.has(track)) {
      fail('VALID_TAXONOMY_VALUES', file, `Invalid track '${track}'`, id);
    }
  }

  if (item.status === 'active') {
    const hasPrimary = Array.isArray(item.sources) && item.sources.some((s: any) => s?.type === 'primary');
    if (!hasPrimary) {
      fail('PRIMARY_SOURCE_REQUIRED', file, `Active threat node has no source with type: primary`, id);
    }
  }
}

const VALID_RESOURCE_PRIVACY = new Set(['privacy_first', 'neutral', 'mixed', 'avoid']);
const VALID_RESOURCE_STATUSES = new Set(['active', 'deprecated', 'compromised', 'acquired', 'discontinued']);

if (allResources.length > 0) {
  console.log(`${B}Validating ${allResources.length} resources…${X}`);
}

for (const { file, item } of allResources) {
  const id = item.id ?? '(no id)';

  if (!item.id) fail('ID_FORMAT', file, 'Missing id field');

  if (item.privacy_posture && !VALID_RESOURCE_PRIVACY.has(item.privacy_posture)) {
    fail('VALID_TAXONOMY_VALUES', file, `Invalid privacy_posture '${item.privacy_posture}'`, id);
  }

  if (item.status && !VALID_RESOURCE_STATUSES.has(item.status)) {
    fail('VALID_TAXONOMY_VALUES', file, `Invalid resource status '${item.status}'`, id);
  }

  if (['mixed', 'avoid'].includes(item.privacy_posture)) {
    if (!Array.isArray(item.caveats) || item.caveats.length === 0) {
      fail('CAVEAT_REQUIRED_FOR_MIXED_POSTURE', file,
        `Resources with privacy_posture: ${item.privacy_posture} must have non-empty caveats`, id);
    }
  }

  if (item.status === 'active') {
    const hasPrimary = Array.isArray(item.sources) && item.sources.some((s: any) => s?.type === 'primary');
    if (!hasPrimary) {
      fail('PRIMARY_SOURCE_REQUIRED', file, `Active resource has no source with type: primary`, id);
    }
  }

  for (const url of [item.url, ...(item.sources ?? []).map((s: any) => s?.url)]) {
    if (typeof url === 'string' && TRACKING_PARAMS.some(p => url.includes(p))) {
      fail('NO_TRACKING_URLS', file, `URL contains tracking parameter: ${url}`, id);
    }
  }
}

console.log(`${B}Validating cross-references…${X}`);

for (const { file, item } of allChecklistItems) {
  const id = item.id ?? '?';

  const refs: string[] = [
    ...(item.compensating_controls ?? []).map((c: any) => c?.id),
    ...(item.depends_on ?? []).map((d: any) => d?.id),
    ...(item.related_items ?? []).map((r: any) => r?.id),
    ...(item.resources ?? []).map((r: any) => r?.id),
    ...(item.controls_implemented ?? []).filter((c: unknown) => typeof c === 'string'),
    item.superseded_by,
  ].filter((r): r is string => typeof r === 'string');

  for (const ref of refs) {
    if (!allIds.has(ref)) {
      fail('VALID_CROSS_REFERENCES', file, `Broken reference to '${ref}' (ID not found)`, id);
    }
  }
}

for (const { file, item } of allThreats) {
  const id = item.id ?? '?';
  const refs: string[] = [
    ...(item.mitigated_by ?? []).map((m: any) => m?.id),
  ].filter((r): r is string => typeof r === 'string');

  for (const ref of refs) {
    if (!allIds.has(ref)) {
      fail('VALID_CROSS_REFERENCES', file, `Broken reference to '${ref}' (ID not found)`, id);
    }
  }
}

for (const { file, item } of allResources) {
  const id = item.id ?? '?';
  const refs: string[] = [
    ...(item.alternatives ?? []).map((a: any) => a?.id),
  ].filter((r): r is string => typeof r === 'string');

  for (const ref of refs) {
    if (!allIds.has(ref)) {
      fail('VALID_CROSS_REFERENCES', file, `Broken reference to '${ref}' (ID not found)`, id);
    }
  }
}

console.log(`${B}Validating harm coverage…${X}`);

const CONSTANTS_FILE = 'src/lib/audit/constants.ts';

for (const { file, item } of allChecklistItems) {
  const id = item.id ?? '?';
  const assets: Asset[] = (item.assets_protected ?? []).filter(
    (a: unknown): a is Asset => typeof a === 'string'
  );
  const vectors: AttackVector[] = (item.attack_vectors ?? []).filter(
    (v: unknown): v is AttackVector => typeof v === 'string'
  );

  const harms = (Object.keys(HARMS) as Harm[]).filter(harm =>
    HARMS[harm].assets.some(a => assets.includes(a)) ||
    HARMS[harm].vectors.some(v => vectors.includes(v))
  );

  if (harms.length === 0) {
    fail('EVERY_ITEM_RESOLVES_TO_A_HARM', file,
      `'${id}' resolves to no harm. It carries assets [${assets.join(', ') || 'none'}] and ` +
      `vectors [${vectors.join(', ') || 'none'}], none of which appear in HARMS ` +
      `(${CONSTANTS_FILE}). Nothing on the front page can reach it.`, id);
  }
}


const PLACEHOLDER_PATTERNS: Array<{ re: RegExp; what: string }> = [
  { re: /\bMAINTAINER\b/,        what: 'a maintainer note' },
  { re: /\bTODO\b/,              what: 'a TODO' },
  { re: /\bTBD\b/,               what: 'a TBD' },
  { re: /\bFIXME\b/,             what: 'a FIXME' },
  { re: /\[R\d/,                 what: 'an internal [R<n>] reference' }
];

const PHONE_PATTERNS: RegExp[] = [
  /(?:\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/,
  /\+\d{1,3}[\s-]?\d{3,}[\s-]?\d{3,}/,
  /\b0\d{3}\s?\d{3}\s?\d{4}\b/
];

function* stringsIn(node: unknown, path = ''): Generator<{ path: string; value: string }> {
  if (typeof node === 'string') { yield { path: path || '(root)', value: node }; return; }
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) yield* stringsIn(node[i], `${path}[${i}]`);
    return;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      yield* stringsIn(v, path ? `${path}.${k}` : k);
    }
  }
}

function checkRenderedString(file: string, where: string, value: string, id?: string) {
  for (const { re, what } of PLACEHOLDER_PATTERNS) {
    if (re.test(value)) {
      fail('NO_PLACEHOLDER_STRINGS', file,
        `${where} carries ${what} and is rendered to a reader: "${value.trim().slice(0, 100)}"`, id);
      break;
    }
  }
  for (const re of PHONE_PATTERNS) {
    const m = re.exec(value);
    if (m) {
      fail('NO_COUNTRY_HELPLINES', file,
        `${where} carries a phone number (${m[0].trim()}), which is right for one country and ` +
        `wrong for every other reader: "${value.trim().slice(0, 100)}"`, id);
      break;
    }
  }
}

console.log(`${B}Checking that nothing unfinished or country-specific renders…${X}`);

for (const { file, item } of [...allChecklistItems, ...allThreats, ...allResources, ...allControls]) {
  for (const { path, value } of stringsIn(item)) {
    checkRenderedString(file, `field '${path}'`, value, (item as any).id);
  }
}

const COPY_FILES = ['playbooks.ts', 'life-events.ts', 'constants.ts'];
for (const name of COPY_FILES) {
  const rel = `src/lib/audit/${name}`;
  let source: string;
  try {
    source = readFileSync(join(ROOT, rel), 'utf-8');
  } catch {
    continue;
  }
  const withoutComments = source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
  withoutComments.split(/\r?\n/).forEach((line, i) => {
    if (line.trim()) checkRenderedString(rel, `line ${i + 1}`, line);
  });
}

function notesIn(dir: string): string[] {
  const found = existsSync(join(ROOT, dir))
    ? readdirSync(join(ROOT, dir)).filter(f => f.endsWith('.md')).sort().map(f => `${dir}/${f}`)
    : [];
  if (!found.length) fail('NO_PLACEHOLDER_STRINGS', dir, `${dir} is listed as moved copy and holds no notes`);
  return found;
}
const COPY_NOTES = WIKI_FOLDERS.flatMap(f => notesIn(`wiki/${f}`));
for (const rel of COPY_NOTES) {
  let source: string;
  try {
    source = readFileSync(join(ROOT, rel), 'utf-8');
  } catch {
    fail('NO_PLACEHOLDER_STRINGS', rel, `${rel} is listed as moved copy and could not be read`);
    continue;
  }
  source.replace(/%%[\s\S]*?%%/g, m => m.replace(/[^\n]/g, ' ')).split(/\r?\n/).forEach((line, i) => {
    if (line.trim() && !line.startsWith('## ')) checkRenderedString(rel, `line ${i + 1}`, line);
  });
}


const CO = /\b(Google|Meta|Facebook|Instagram|WhatsApp|Threads|Apple|iCloud|Siri|Alexa|Microsoft|Cortana|Edge|Amazon|LinkedIn|TikTok|Snapchat|Reddit|Discord|Steam|PlayStation|Xbox|Nintendo|Samsung|Twilio|Goldman Sachs|Gemini|Copilot|ChatGPT|OpenAI|Grok|Perplexity|DeepSeek|YouTube|Android|Chrome)\b/;
const CONDUCT_VERB = /\b(collects?|collected|sells?|sold|shares?|shared|sharing|harvest\w*|monetis\w*|monetiz\w*|tracks?|tracked|tracking|trains?|trained|training|profiles?|profiling|retains?|retained|stores?|stored|keeps?|kept|keeping|reads?|listens?|records?|recorded|scans?|scanned|reviewers?|reviews?|builds? a|feeds?)\b/i;
const PERSONAL_DATA = /\b(data|history|activity|recordings?|transcripts?|metadata|profiles?|information|transactions?|location|files?|messages?|chats?|conversations?|timeline|where you have been|searches|voice|behaviou?r|telemetry|analytics|confidential)\b/i;
const SINGLED_OUT = /\b(for one|among them)\b/i;
const PROMISE = /\b(never|always)\s+(contacts?|calls?|asks?|emails?|texts?|messages?)\b|\b(does|do|will) not (contact|call|ask|email|text)\b/i;
const NAMED_AS_ABSENT = /\bNo (Google|Meta|Facebook|Microsoft|Amazon) [A-Z]/;
const HELD_FOR_HIS_READ: string[] = [];
const HANDS_OVER = /\bask\s+(\w+\s+)?(Google|Apple|Microsoft|Samsung|Meta|Amazon)\s+for\b/;

const IS_NAVIGATION = /(→|->|→)/;

function checkConduct(file: string, where: string, value: string, id?: string) {
  for (const sentence of value.split(/(?<=[.!?])\s+|\n/)) {
    if (IS_NAVIGATION.test(sentence) || NAMED_AS_ABSENT.test(sentence)) continue;
    if (HELD_FOR_HIS_READ.some(h => sentence.includes(h))) continue;
    const c = CO.exec(sentence);
    if (!c) continue;
    const v = CONDUCT_VERB.exec(sentence);
    const shape = v && PERSONAL_DATA.test(sentence) ? `does with personal data ("${v[0]}")`
      : SINGLED_OUT.test(sentence) ? 'does, singling it out as the example'
      : PROMISE.test(sentence) ? 'never or always does, a promise the reader relies on'
      : HANDS_OVER.test(sentence) ? 'gives to someone else about you'
      : null;
    if (!shape) continue;
    fail('NO_COMPANY_CONDUCT', file,
      `${where} states what ${c[0]} ${shape}. Spectra cannot verify a company's conduct and must ` +
      `not imply it did (BLUEPRINT §4, WRITING §4). Say what kind of setting or message the reader ` +
      `should look for instead. Sentence: "${sentence.trim().slice(0, 140)}"`, id);
    return;
  }
}

console.log(`${B}Checking that no claim is made about what a company does with your data…${X}`);

const READER_FIELDS = new Set([
  'title', 'description', 'threat_narrative', 'platform_notes',
  'environment_notes', 'track_notes', 'legal_notes', 'intro', 'rows', 'notes', 'verify_yourself',
  'context', 'related_items', 'depends_on', 'resources'
]);

for (const { file, item } of [...allChecklistItems, ...allResources]) {
  for (const [key, value] of Object.entries(item as Record<string, unknown>)) {
    if (!READER_FIELDS.has(key)) continue;
    for (const { path, value: s } of stringsIn(value, key)) {
      checkConduct(file, `field '${path}'`, s, (item as any).id);
    }
  }
}
for (const rel of COPY_NOTES) {
  readFileSync(join(ROOT, rel), 'utf-8').replace(/%%[\s\S]*?%%/g, m => m.replace(/[^\n]/g, ' '))
    .split(/\r?\n/).forEach((line, i) => {
      if (line.trim() && !line.startsWith('#') && !/^\s*-?\s*\[.*\]\(https?:/.test(line)) checkConduct(rel, `line ${i + 1}`, line);
    });
}

const allLookups: Array<{ file: string; item: any }> = (() => {
  try {
    return readLookups(ROOT);
  } catch (e) {
    errors.push({ rule: 'YAML_PARSE', severity: 'blocking', file: 'content/lookups or wiki/lookups', message: String(e) });
    return [];
  }
})();

console.log(`${B}Validating ${allLookups.length} lookup tables…${X}`);

const COMPANY_NAMES = /\b(Google|Meta|Facebook|Instagram|WhatsApp|Apple|Microsoft|Amazon|X|Twitter|LinkedIn|TikTok|Snapchat|Reddit|Discord|Steam|PlayStation|Xbox|Nintendo|Samsung|Signal|Bitwarden|Proton|Mullvad|Aegis|KeePassXC|Authy)\b/;

const lookupIds = new Set<string>();

for (const { file, item } of allLookups) {
  const id = item?.id ?? '(no id)';
  lookupIds.add(id);

  for (const field of ['id', 'title', 'intro', 'status'] as const) {
    if (!item?.[field]) {
      fail('LOOKUP_SHAPE', file, `lookup '${id}' is missing required field '${field}'`, id);
    }
  }
  if (!Array.isArray(item?.rows) || item.rows.length === 0) {
    fail('LOOKUP_SHAPE', file, `lookup '${id}' has no rows, so it renders an empty box`, id);
  }
  for (const row of item?.rows ?? []) {
    if (!row?.look_for || !row?.why) {
      fail('LOOKUP_SHAPE', file,
        `a row in '${id}' is missing look_for or why: ${JSON.stringify(row).slice(0, 80)}`, id);
    }
  }

  for (const { path, value } of stringsIn(item)) {
    checkRenderedString(file, `field '${path}'`, value, id);
  }

  for (const source of (item?.sources ?? [])) {
    if (source?.url && TRACKING_PARAMS.some(p => source.url.includes(p))) {
      fail('NO_TRACKING_URLS', file, `Source URL contains tracking parameter: ${source.url}`, id);
    }
  }

  for (const { path, value } of stringsIn(item)) {
    if (path === 'sources' || path.startsWith('sources')) continue;
    const m = COMPANY_NAMES.exec(value);
    if (m) {
      fail('LOOKUP_NAMES_NO_ONE', file,
        `'${id}' names ${m[0]} at '${path}'. A lookup describes wording that recurs everywhere; ` +
        `naming a company makes it a claim about that company, which BLUEPRINT §4 rules out. ` +
        `If the row needs a name, it belongs in an item.`, id);
      break;
    }
  }
}

const referencedLookups = new Set<string>();
for (const { file, item } of allChecklistItems) {
  for (const ref of (item as any).lookups ?? []) {
    referencedLookups.add(ref);
    if (!lookupIds.has(ref)) {
      fail('LOOKUP_RESOLVES', file,
        `'${(item as any).id}' references lookup '${ref}', which does not exist. The reader would ` +
        `be shown nothing where the step promised a list of things to look for.`, (item as any).id);
    }
  }
}
for (const id of lookupIds) {
  if (!referencedLookups.has(id)) {
    warn('LOOKUP_IS_USED', 'wiki/lookups',
      `lookup '${id}' is referenced by no item. An unreferenced table is a catalogue entry that ` +
      `nobody reads, which is what D4 removed from /resources.`, id);
  }
}


const SPOKEN_ATTRS = ['aria-label', 'title', 'alt', 'placeholder', 'content'];

function renderedStrings(source: string): Array<{ line: number; text: string }> {
  const out: Array<{ line: number; text: string }> = [];
  const lineOf = (idx: number) => source.slice(0, idx).split(/\r?\n/).length;

  const blank = (s: string, re: RegExp) =>
    s.replace(re, m => m.replace(/[^\n]/g, ' '));
  let src = blank(source, /<!--[\s\S]*?-->/g);
  src = blank(src, /<style[\s\S]*?<\/style>/gi);

  src = src.replace(/<script[\s\S]*?<\/script>/gi, (block, offset: number) => {
    const cleaned = blank(blank(block, /\/\*[\s\S]*?\*\//g), /(^|[^:])\/\/[^\n]*/gm);
    for (const m of cleaned.matchAll(/'([^'\\\n]*)'|"([^"\\\n]*)"|`([^`\\]*)`/g)) {
      const text = m[1] ?? m[2] ?? m[3] ?? '';
      if (text.trim()) out.push({ line: lineOf(offset + (m.index ?? 0)), text });
    }
    return block.replace(/[^\n]/g, ' ');
  });

  for (const attr of SPOKEN_ATTRS) {
    const re = new RegExp(`\\b${attr}\\s*=\\s*"([^"]*)"`, 'g');
    for (const m of src.matchAll(re)) {
      if (m[1].trim()) out.push({ line: lineOf(m.index ?? 0), text: m[1] });
    }
  }

  const textOnly = src.replace(/<[^>]*>/g, m => m.replace(/[^\n]/g, ' '))
                      .replace(/\{[^{}]*\}/g, m => m.replace(/[^\n]/g, ' '));
  textOnly.split(/\r?\n/).forEach((raw, i) => {
    const text = raw.replace(/&[a-z]+;/gi, ' ').trim();
    if (text) out.push({ line: i + 1, text });
  });

  return out;
}

const JARGON_NAMES: Array<{ re: RegExp; use: string }> = [
  { re: /\bSecurity Audit\b/,    use: 'Your playbook' },
  { re: /\bthreat map\b/i,       use: 'Your map' },
  { re: /\bthreat graph\b/i,     use: 'Your map' },
  { re: /\bguardian mode\b/i,    use: 'Family setup' },
  { re: /\bincident triage\b/i,  use: 'Something happened' }
];


const JARGON_LABELS: Record<string, string> = {
  'audit':        'Your playbook',
  'adversaries':  'WHO MIGHT TRY',
  'controls':     'STEPS THAT HELP',
  'assets':       'WHAT THEY PROTECT'
};

function svelteFilesUnder(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(join(ROOT, dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(join(ROOT, rel)).isDirectory()) svelteFilesUnder(rel, acc);
    else if (entry.endsWith('.svelte')) acc.push(rel);
  }
  return acc;
}

const COPY_NOTE_FOLDERS = WIKI_FOLDERS.filter(f => f !== 'glossary').map(f => `wiki/${f}`);
function copyNotes(): string[] {
  return COPY_NOTE_FOLDERS.flatMap(dir => {
    try {
      return readdirSync(join(ROOT, dir)).filter(f => f.endsWith('.md')).sort().map(f => `${dir}/${f}`);
    } catch {
      return [];
    }
  });
}

const VALUE_TITLED_NOTES = new Set(['wiki/pages/names.md']);

function noteStrings(rel: string, source: string): Array<{ line: number; text: string }> {
  const blanked = source.replace(/%%[\s\S]*?%%/g, m => m.replace(/[^\n]/g, ' '));
  const out: Array<{ line: number; text: string }> = [];
  blanked.split(/\r?\n/).forEach((raw, i) => {
    const text = raw.trim();
    if (!text || text.startsWith('## ')) return;
    if (text.startsWith('### ')) {
      if (!VALUE_TITLED_NOTES.has(rel)) out.push({ line: i + 1, text: text.slice(4) });
      return;
    }
    out.push({ line: i + 1, text: text.startsWith('- ') ? text.slice(2) : text });
  });
  return out;
}

function tsFilesUnder(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(join(ROOT, dir))) {
    const rel = `${dir}/${entry}`;
    if (statSync(join(ROOT, rel)).isDirectory()) tsFilesUnder(rel, acc);
    else if (entry.endsWith('.ts')) acc.push(rel);
  }
  return acc;
}

function tsStrings(source: string): Array<{ line: number; text: string }> {
  const out: Array<{ line: number; text: string }> = [];
  const lineOf = (idx: number) => source.slice(0, idx).split(/\r?\n/).length;
  const blank = (s: string, re: RegExp) => s.replace(re, m => m.replace(/[^\n]/g, ' '));
  const cleaned = blank(blank(source, /\/\*[\s\S]*?\*\//g), /(^|[^:])\/\/[^\n]*/gm);
  for (const m of cleaned.matchAll(/'([^'\\\n]*)'|"([^"\\\n]*)"|`([^`\\]*)`/g)) {
    const text = m[1] ?? m[2] ?? m[3] ?? '';
    if (text.trim()) out.push({ line: lineOf(m.index ?? 0), text });
  }
  return out;
}

console.log(`${B}Checking that no product jargon reaches a reader…${X}`);

const JARGON_EXEMPT = new Set([
  'src/routes/methodology/+page.svelte',
  'wiki/pages/methodology.md',
  'src/lib/audit/glossary.ts'
]);
const jargonScope = [...svelteFilesUnder('src/routes'), ...svelteFilesUnder('src/lib/components')]
  .filter(f => !JARGON_EXEMPT.has(f));
const jargonTsScope = tsFilesUnder('src/lib/audit').filter(f => !JARGON_EXEMPT.has(f));
const jargonNoteScope = copyNotes().filter(f => !JARGON_EXEMPT.has(f));

for (const rel of [...jargonScope, ...jargonTsScope, ...jargonNoteScope]) {
  const source = readFileSync(join(ROOT, rel), 'utf-8');
  const strings = rel.endsWith('.svelte') ? renderedStrings(source) : rel.endsWith('.md') ? noteStrings(rel, source) : tsStrings(source);
  for (const { line, text } of strings) {
    for (const { re, use } of JARGON_NAMES) {
      const m = re.exec(text);
      if (m) {
        warn('NO_JARGON_STRINGS', rel,
          `line ${line} renders "${m[0]}" to a reader. Plan v4 §2: say "${use}". ` +
          `Full string: "${text.trim().slice(0, 90)}"`);
        break;
      }
    }
    const whole = text.trim().toLowerCase().replace(/[:·|]+$/, '').trim();
    if (JARGON_LABELS[whole]) {
      warn('NO_JARGON_STRINGS', rel,
        `line ${line} uses "${text.trim()}" as a label. Plan v4 §2: say ` +
        `"${JARGON_LABELS[whole]}".`);
    }
  }
}


const platformNoteVariants = Math.max(
  0,
  ...allChecklistItems.map(({ item }) => Object.keys(item?.platform_notes ?? {}).length)
);

const PLATFORM_WORD = String.raw`(operating systems?|platform|device|phone|computer|os)`;
const PLATFORM_PROMISES: RegExp[] = [
  new RegExp(String.raw`\bsteps?\b[^.]{0,40}\bfor your\b[^.]{0,30}\b${PLATFORM_WORD}\b`, 'i'),
  new RegExp(String.raw`\bsteps?\b[^.]{0,30}\b(written|tailored|specific) (for|to)\b[^.]{0,30}\b${PLATFORM_WORD}\b`, 'i'),
  new RegExp(String.raw`\bwhich (device|platform|system)\b[^.]{0,30}\bsteps?\b`, 'i'),
  new RegExp(String.raw`\bfor your specific\b[^.]{0,20}\b${PLATFORM_WORD}\b`, 'i')
];

if (platformNoteVariants <= 1) {
  for (const rel of [...jargonScope, ...jargonTsScope, ...jargonNoteScope]) {
    const source = readFileSync(join(ROOT, rel), 'utf-8');
    const strings = rel.endsWith('.svelte') ? renderedStrings(source) : rel.endsWith('.md') ? noteStrings(rel, source) : tsStrings(source);
    for (const { line, text } of strings) {
      for (const re of PLATFORM_PROMISES) {
        if (!re.test(text)) continue;
        fail('PLATFORM_PROMISE_MATCHES_CONTENT', rel,
          `line ${line} promises steps written for the reader's platform, and no item can keep ` +
          `that: every one of the ${allChecklistItems.length} items carries a single ` +
          `'platform_notes' key, so the choice changes nothing for anyone. Either write ` +
          `per-platform notes, starting with device-encrypt-001, or do not claim them. ` +
          `Full string: "${text.trim().slice(0, 90)}"`);
        break;
      }
    }
  }
}

console.log('');

const totalItems =
  allChecklistItems.length + allThreats.length +
  allResources.length + allControls.length;


const DEMOGRAPHIC_WORDS = new Set([
  'women', 'womens', 'woman', 'ladies', 'lady', 'female', 'females', 'girl', 'girls',
  'men', 'mens', 'man', 'male', 'males', 'boy', 'boys',
  'kid', 'kids', 'teen', 'teens', 'teenage', 'child', 'children',
  'elderly', 'senior', 'seniors', 'disabled'
]);

const namesADemographic = (identifier: string): string | null => {
  for (const token of identifier.toLowerCase().split(/[-_.\s]+/)) {
    if (DEMOGRAPHIC_WORDS.has(token)) return token;
  }
  return null;
};

for (const { file, item } of allChecklistItems) {
  const rel = relative(process.cwd(), file);
  for (const [what, value] of [['id', item?.id], ['category', item?.category], ['filename', rel]] as const) {
    if (typeof value !== 'string') continue;
    const hit = namesADemographic(what === 'filename' ? value.split(/[\\/]/).pop()! : value);
    if (hit) {
      fail('NO_DEMOGRAPHIC_IDENTIFIERS', rel,
        `${what} "${value}" names a group of people ("${hit}"). Name the situation, not the person: ` +
        `the harm belongs to anyone it happens to.`, item?.id);
    }
  }
}

for (const track of TRACK_OPTIONS) {
  const hit = namesADemographic(track.value);
  if (!hit) continue;
  fail('NO_DEMOGRAPHIC_IDENTIFIERS', 'src/lib/audit/constants.ts',
    `track "${track.value}" names a group of people ("${hit}"). Name the situation, not the ` +
    `person: a man stalked by an ex should not have to tick a box about women to reach the items ` +
    `that cover him.`);
}


const SAFETY_LANGUAGE: Array<{ re: RegExp; what: string }> = [
  { re: /domestic abuse/i,                     what: 'a domestic abuse referral' },
  { re: /safety plan|plan the order/i,         what: 'safety planning language' },
  { re: /(might|may) respond/i,                what: 'safety planning language' },
  { re: /(could|may) (be|become) dangerous/i,  what: 'a danger warning' },
  { re: /escalate danger/i,                    what: 'a danger warning' }
];

const SAFETY_BRANCH_LICENCE: Record<string, RegExp> = {
  'recovery-routes-001':      /^track_notes\.known_person_risk$/,
  'recovery-email-first-001': /^track_notes\.known_person_risk$/,
  'recovery-locked-out-001':  /^track_notes\.known_person_risk$/,
  'stalkerware-check-001':    /^(platform_notes\.|legal_notes\b)/,
  'location-exposure-001':    /^(threat_narrative$|track_notes\.known_person_risk$)/,
  'location-tracker-alerts-001': /^(description$|platform_notes\.)/
};

for (const { file, item } of allChecklistItems) {
  const rel = relative(process.cwd(), file);
  const id = item?.id as string | undefined;
  const licence = id ? SAFETY_BRANCH_LICENCE[id] : undefined;
  for (const [key, value] of Object.entries((item ?? {}) as Record<string, unknown>)) {
    if (key === 'changelog' || key === 'sources') continue;
    for (const { path, value: s } of stringsIn(value, key)) {
      const hit = SAFETY_LANGUAGE.find(p => p.re.test(s));
      if (!hit) continue;
      if (licence && licence.test(path)) continue;
      fail('SAFETY_BRANCH_LICENCE', rel,
        `${path} carries ${hit.what} and is not licensed to. Safety language belongs where the ` +
        `reader who needs it will see it and others will not, which usually means ` +
        `track_notes.known_person_risk. If this location is genuinely right, licence it in ` +
        `SAFETY_BRANCH_LICENCE and say why: "${s.trim().slice(0, 80)}"`, id);
    }
  }
}


const PROTECTIVE_CLAIMS: Array<{ re: RegExp; why: string }> = [
  { re: /\b(spectra|we|this (tool|site|app|page))\b[^.!?]{0,40}\b(keeps? you safe|protects? you|secures? you|makes? you safe)\b/i,
    why: 'Spectra does not protect anyone. It says what is worth doing and where that came from.' },
  { re: /\byou (are|'re) (now )?(safe|protected|secure)\b/i,
    why: 'Spectra cannot know that, and saying it accepts responsibility for an outcome it does not control.' },
  { re: /\byou (are|'re) at risk\b/i,
    why: 'A personalised risk claim. Spectra never looks at the reader, so it cannot assess them.' },
  { re: /\byour risk (is|level|score)\b/i,
    why: 'A personalised risk claim presented as a fact about the reader.' }
];

for (const { file, item } of allChecklistItems) {
  const rel = relative(process.cwd(), file);
  const strings: Array<[string, unknown]> = [
    ['title', item?.title], ['description', item?.description],
    ['threat_narrative', item?.threat_narrative]
  ];
  for (const [where, value] of strings) {
    if (typeof value !== 'string') continue;
    for (const { re, why } of PROTECTIVE_CLAIMS) {
      const m = re.exec(value);
      if (m) {
        fail('NO_PROTECTIVE_CLAIM', rel, `${where} says "${m[0]}". ${why}`, item?.id);
        break;
      }
    }
  }
}

{
  const rel = 'wiki/pages/home.md';
  const ids = new Set(allChecklistItems.map(({ item }) => item?.id));
  const oldest = new Date().getFullYear() - 3;
  let cards: ReturnType<typeof noteItems> = [];
  try {
    cards = noteItems(parsePage(readFileSync(join(process.cwd(), rel), 'utf-8'), rel), 'cards');
  } catch (e) {
    fail('HOME_FACT_SOURCED', rel, `the ## cards block does not read: ${(e as Error).message}`);
  }
  for (const card of cards) {
    const plain = card.lines.slice(0, 4).map(l => (l.length === 1 && l[0].kind === 'text' ? l[0].value : null));
    const sources = card.lines.slice(4).filter(l => l.length === 1 && l[0].kind === 'link');
    if (!ids.has(card.title)) fail('HOME_FACT_SOURCED', rel, `card "${card.title}" names a step that is not in the corpus`);
    if (plain.length < 4 || plain.some(v => v === null)) {
      fail('HOME_FACT_SOURCED', rel, `card "${card.title}" needs four plain lines first: number, sentence, picture, date`);
      continue;
    }
    const date = plain[3]!;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!m) fail('HOME_FACT_SOURCED', rel, `card "${card.title}" has "${date}" where its date goes; write YYYY-MM-DD`);
    else if (+m[1] < oldest) fail('HOME_FACT_SOURCED', rel, `card "${card.title}" is dated ${date}, more than three years back (oldest allowed: ${oldest})`);
    if (sources.length === 0 || sources.length !== card.lines.length - 4) {
      fail('HOME_FACT_SOURCED', rel, `card "${card.title}" needs at least one source, one link per line after the date`);
    }
  }
  if (!cards.length) fail('HOME_FACT_SOURCED', rel, 'no cards found under ## cards');
}

{
  const rel = 'src/lib/audit/chapters.ts';
  const active = allChecklistItems.map(({ item }) => item).filter(i => i && i.status === 'active').map(i => i!.id);
  const known = new Set(allChecklistItems.map(({ item }) => item?.id));
  const seen = new Map<string, string[]>();
  for (const c of CHAPTERS) for (const id of c.steps) {
    if (!known.has(id)) fail('CHAPTER_MEMBERSHIP', rel, `chapter "${c.id}" names "${id}", which is not in the corpus`);
    seen.set(id, [...(seen.get(id) ?? []), c.id]);
  }
  for (const id of active) {
    const in_ = seen.get(id) ?? [];
    if (in_.length === 0) fail('CHAPTER_MEMBERSHIP', rel, `step "${id}" is in no chapter`, id);
    if (in_.length > 1) fail('CHAPTER_MEMBERSHIP', rel, `step "${id}" is in ${in_.length} chapters: ${in_.join(', ')}`, id);
  }

  const home = 'wiki/pages/home.md';
  try {
    const page = parsePage(readFileSync(join(process.cwd(), home), 'utf-8'), home);
    const name = noteText(page, 'hero-chapter');
    const chapter = CHAPTERS.find(c => c.name === name);
    const of = /\bof (\d+)\b/.exec(noteText(page, 'hero-chapter-count'));
    if (!chapter) fail('CHAPTER_MEMBERSHIP', home, `hero-chapter "${name}" is not the name of a chapter`);
    else if (!of || +of[1] !== chapter.steps.length) {
      fail('CHAPTER_MEMBERSHIP', home, `hero-chapter-count says "of ${of?.[1] ?? '?'}"; "${name}" holds ${chapter.steps.length} steps`);
    }
  } catch (e) {
    fail('CHAPTER_MEMBERSHIP', home, `the hero's chapter lines do not read: ${(e as Error).message}`);
  }
}

if (warnings.length > 0) {
  console.log(`${Y}${BOLD}WARNINGS (${warnings.length})${X}`);
  for (const w of warnings) {
    const loc = w.item_id ? `${w.file} (${w.item_id})` : w.file;
    console.log(`  ${Y}⚠${X}  ${D}[${w.rule}]${X} ${loc}`);
    console.log(`     ${w.message}`);
  }
  console.log('');
}

if (errors.length > 0) {
  console.log(`${R}${BOLD}FAILURES (${errors.length}) — blocking${X}`);

  const byFile = new Map<string, ValidationResult[]>();
  for (const e of errors) {
    if (!byFile.has(e.file)) byFile.set(e.file, []);
    byFile.get(e.file)!.push(e);
  }

  for (const [file, fileErrors] of byFile) {
    console.log(`\n  ${D}${file}${X}`);
    for (const e of fileErrors) {
      const loc = e.item_id ? `(${e.item_id})` : '';
      console.log(`    ${R}✗${X} ${D}[${e.rule}]${X} ${loc ? loc + ' ' : ''}${e.message}`);
    }
  }

  console.log('');
  console.log(`${R}${BOLD}✗ Validation failed — ${errors.length} error(s) across ${byFile.size} file(s).${X}`);
  console.log(`${D}Fix all blocking errors before deploying.${X}\n`);
  process.exit(1);
} else {
  console.log(
    `${G}${BOLD}✓ All checks passed.${X} ${D}${totalItems} items validated ` +
    `(${allChecklistItems.length} checklist, ${allThreats.length} threats, ` +
    `${allResources.length} resources). ` +
    `${warnings.length} warning(s).${X}\n`
  );
  process.exit(0);
}