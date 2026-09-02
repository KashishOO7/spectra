#!/usr/bin/env tsx

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import yaml from 'js-yaml';
import { HARMS } from '../src/lib/audit/constants.js';
import type { Asset, AttackVector, Harm } from '../src/lib/types.js';

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
]);

const VALID_ASSETS = new Set([
  'credentials', 'local_data', 'cloud_data', 'communications', 'metadata',
  'location', 'identity', 'financial', 'relationships', 'reputation',
  'devices', 'biometrics', 'behavioral_data',
]);

const VALID_TRACKS = new Set([
  'general', 'kids_teen', 'womens_safety', 'journalist', 'corporate', 'ai_focused',
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

const allChecklistItems = readAllItems('items');
const allThreats       = readAllItems('threats');
const allControls      = readAllItems('controls');

const allResources = readAllItems('resources');

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
  'difficulty', 'time_estimate', 'maturity_level', 'adversaries',
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

  if (item.simple_description === undefined) {
    warn('SIMPLE_DESCRIPTION_PRESENT', file,
      `Missing simple_description — the action card will fall back to title`, id);
  } else if (typeof item.simple_description !== 'string' || item.simple_description.trim() === '') {
    fail('SIMPLE_DESCRIPTION_PRESENT', file,
      `simple_description must be a non-empty string`, id);
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

  if (item.category === 'human_vulnerability') {
    if (item.emotional_register === undefined || item.emotional_register === null) {
      fail('EMOTIONAL_REGISTER_FOR_HUMAN_ITEMS', file,
        `human_vulnerability items must have emotional_register set (not null)`, id);
    } else if (!VALID_EMOTIONAL_REGISTERS.has(item.emotional_register)) {
      fail('VALID_TAXONOMY_VALUES', file,
        `Invalid emotional_register '${item.emotional_register}'`, id);
    }
  } else if (item.emotional_register !== undefined && item.emotional_register !== null) {
    warn('EMOTIONAL_REGISTER_FOR_HUMAN_ITEMS', file,
      `Non-human_vulnerability item has emotional_register set — expected null`, id);
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

const COPY_FILES = ['playbooks.ts', 'life-events.ts', 'quiz.ts', 'constants.ts'];
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


const CO = /\b(Google|Meta|Facebook|Instagram|WhatsApp|Threads|Apple|iCloud|Siri|Alexa|Microsoft|Cortana|Edge|Amazon|LinkedIn|TikTok|Snapchat|Reddit|Discord|Steam|PlayStation|Xbox|Nintendo|Samsung|Twilio|Goldman Sachs|Gemini|Copilot|YouTube|Android|Chrome)\b/;
const CONDUCT_VERB = /\b(collects?|collected|sells?|sold|shares?|shared|sharing|harvest\w*|monetis\w*|monetiz\w*|tracks?|tracked|tracking|trains?|trained|training|profiles?|profiling|retains?|retained|stores?|stored|reads?|listens?|records?|recorded|scans?|scanned|builds? a|feeds?)\b/i;
const PERSONAL_DATA = /\b(data|history|activity|recordings?|transcripts?|metadata|profiles?|information|transactions?|location|files?|messages?|searches|voice|behaviou?r|telemetry|analytics)\b/i;

const IS_NAVIGATION = /(→|->|→)/;

function checkConduct(file: string, where: string, value: string, id?: string) {
  for (const sentence of value.split(/(?<=[.!?])\s+|\n/)) {
    if (IS_NAVIGATION.test(sentence)) continue;
    const c = CO.exec(sentence);
    if (!c) continue;
    const v = CONDUCT_VERB.exec(sentence);
    if (!v) continue;
    if (!PERSONAL_DATA.test(sentence)) continue;
    fail('NO_COMPANY_CONDUCT', file,
      `${where} states what ${c[0]} does with personal data ("${v[0]}"). Spectra cannot verify a ` +
      `company's handling of data and must not imply it did (BLUEPRINT §4). Say what the reader ` +
      `should look for instead. Sentence: "${sentence.trim().slice(0, 140)}"`, id);
    return;
  }
}

console.log(`${B}Checking that no claim is made about what a company does with your data…${X}`);

const READER_FIELDS = new Set([
  'title', 'simple_description', 'description', 'threat_narrative', 'platform_notes',
  'environment_notes', 'legal_notes', 'intro', 'rows', 'notes', 'verify_yourself', 'context'
]);

for (const { file, item } of [...allChecklistItems, ...allResources]) {
  for (const [key, value] of Object.entries(item as Record<string, unknown>)) {
    if (!READER_FIELDS.has(key)) continue;
    for (const { path, value: s } of stringsIn(value, key)) {
      checkConduct(file, `field '${path}'`, s, (item as any).id);
    }
  }
}

const allLookups = readAllItems('lookups');

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
    warn('LOOKUP_IS_USED', 'content/lookups',
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
  { re: /\bSecurity Audit\b/,    use: 'Your list' },
  { re: /\bthreat map\b/i,       use: 'Your map' },
  { re: /\bthreat graph\b/i,     use: 'Your map' },
  { re: /\bguardian mode\b/i,    use: 'Family setup' },
  { re: /\bincident triage\b/i,  use: 'Something happened' }
];

const JARGON_WORDS: Array<{ re: RegExp; use: string }> = [
  { re: /\bthreat model/i,      use: 'your setup' },
  { re: /\badversar(y|ies)\b/i, use: '"who might try", or name the one' },
  { re: /\bposture\b/i,         use: 'name the thing: your setup, or what you have done so far' },
  { re: /\bexposure\b/i,        use: '"what someone could find out about you"' },
  { re: /\bOSINT\b/i,           use: 'looking someone up from what is already public' },
  { re: /\bdork(s|ing)?\b/i,    use: 'a search that turns up what people did not mean to publish' },
  { re: /\bvectors?\b/i,        use: 'how it happens' }
];

const JARGON_LABELS: Record<string, string> = {
  'audit':        'Your list',
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

const JARGON_EXEMPT = new Set(['src/routes/methodology/+page.svelte']);
const jargonScope = [...svelteFilesUnder('src/routes'), ...svelteFilesUnder('src/lib/components')]
  .filter(f => !JARGON_EXEMPT.has(f));
const jargonTsScope = tsFilesUnder('src/lib/audit');

for (const rel of [...jargonScope, ...jargonTsScope]) {
  const source = readFileSync(join(ROOT, rel), 'utf-8');
  const strings = rel.endsWith('.svelte') ? renderedStrings(source) : tsStrings(source);
  for (const { line, text } of strings) {
    for (const { re, use } of [...JARGON_NAMES, ...JARGON_WORDS]) {
      const m = re.exec(text);
      if (m) {
        fail('NO_JARGON_STRINGS', rel,
          `line ${line} renders "${m[0]}" to a reader. Plan v4 §2: say "${use}". ` +
          `Full string: "${text.trim().slice(0, 90)}"`);
        break;
      }
    }
    const whole = text.trim().toLowerCase().replace(/[:·|]+$/, '').trim();
    if (JARGON_LABELS[whole]) {
      fail('NO_JARGON_STRINGS', rel,
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
  for (const rel of [...jargonScope, ...jargonTsScope]) {
    const source = readFileSync(join(ROOT, rel), 'utf-8');
    const strings = rel.endsWith('.svelte') ? renderedStrings(source) : tsStrings(source);
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