#!/usr/bin/env tsx
// Validates YAML content against engine schemas. (Run: npm run validate)

import { readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';
import yaml from 'js-yaml';

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, 'content');

// ANSI colors
const R = '\x1b[31m'; const G = '\x1b[32m'; const Y = '\x1b[33m';
const B = '\x1b[34m'; const D = '\x1b[2m';  const X = '\x1b[0m';
const BOLD = '\x1b[1m';

// Helpers

// Parses single or multi-document YAML files into an array.
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

    // If the document is a top-level array (e.g. tools.yaml), flatten it
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
    // Directory doesn't exist — not an error, just empty
    return result;
  }

  for (const file of files) {
    const path = join(dir, file);
    let items: unknown[];
    try {
      items = readYamlFile(path);
    } catch (e) {
      // Parse errors are reported as failures, don't crash the whole run
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

// Validation state
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

// Taxonomy
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

const VALID_MATURITY = new Set([1, 2, 3, 4, 5]);

const VALID_PREVALENCE = new Set(['common', 'occasional', 'rare', 'theoretical']);
const VALID_LIKELIHOOD = new Set(['low', 'medium', 'high', 'near_certain']);
const VALID_SOPHISTICATION = new Set([1, 2, 3, 4, 5]);

const TRACKING_PARAMS = [
  'utm_source', 'utm_campaign', 'utm_medium', 'utm_content', 'utm_term',
  'fbclid', 'gclid', 'ref=', 'referral',
];

// Load all content
console.log('\nRunning schema validation...');

const allChecklistItems = readAllItems('items');
const allThreats       = readAllItems('threats');
const allControls      = readAllItems('controls');

// Resources live in content/resources/ — load and validate as before.
const allResources = readAllItems('resources');

// Landscape events live in content/landscape-feed.yaml
// The file has a { events: [] } wrapper — readAllItems would return the wrapper object itself,
// not the individual events.
const allLandscapeEvents: Array<{ file: string; item: any }> = (() => {
  const feedPath = join(CONTENT_DIR, 'landscape-feed.yaml');
  let raw: string;
  try {
    raw = readFileSync(feedPath, 'utf-8');
  } catch {
    // File not present — not a blocking error, just no events to validate
    return [];
  }
  let parsed: any;
  try {
    parsed = yaml.load(raw);
  } catch (e) {
    errors.push({ rule: 'YAML_PARSE', severity: 'blocking', file: 'content/landscape-feed.yaml', message: String(e) });
    return [];
  }
  if (!parsed || !Array.isArray(parsed.events)) return [];
  return parsed.events
    .filter((e: unknown) => e !== null && e !== undefined)
    .map((item: any) => ({ file: 'content/landscape-feed.yaml', item }));
})();

const allContent = [
  ...allChecklistItems,
  ...allThreats,
  ...allResources,
  ...allControls,
  // Landscape events are intentionally excluded from the global ID registry check —
  // they use a different ID namespace and are validated in their own phase.
];

// Phase 1: Register all IDs
const allIds = new Map<string, string>(); // id → file

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

// Phase 2: Validate checklist items
// NOTE: emotional_register is NOT in this list.
// It is required only for human_vulnerability items and is checked explicitly below.
// All other items should have emotional_register: null, but its absence is not a
// blocking error — the human-track check is the enforcement point.
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

  // Required fields
  for (const field of CHECKLIST_REQUIRED) {
    if (item[field] === undefined) {
      fail('REQUIRED_FIELDS', file, `Missing required field '${field}'`, id);
    }
  }

  // Category
  if (item.category && !VALID_CATEGORIES.has(item.category)) {
    fail('VALID_TAXONOMY_VALUES', file, `Invalid category '${item.category}'`, id);
  }

  // Subcategory — existence check only (full map validation is future work)
  if (item.subcategory !== undefined && typeof item.subcategory !== 'string') {
    fail('VALID_TAXONOMY_VALUES', file, `subcategory must be a string`, id);
  }

  // Adversaries
  for (const adv of (item.adversaries ?? [])) {
    if (!VALID_ADVERSARIES.has(adv)) {
      fail('VALID_TAXONOMY_VALUES', file, `Invalid adversary '${adv}' — valid: ${[...VALID_ADVERSARIES].join(', ')}`, id);
    }
  }

  // Attack vectors
  for (const vec of (item.attack_vectors ?? [])) {
    if (!VALID_ATTACK_VECTORS.has(vec)) {
      fail('VALID_TAXONOMY_VALUES', file, `Invalid attack_vector '${vec}' — valid: ${[...VALID_ATTACK_VECTORS].join(', ')}`, id);
    }
  }

  // Assets protected
  for (const asset of (item.assets_protected ?? [])) {
    if (!VALID_ASSETS.has(asset)) {
      fail('VALID_TAXONOMY_VALUES', file, `Invalid asset '${asset}'`, id);
    }
  }

  // Tracks
  for (const track of (item.tracks ?? [])) {
    if (!VALID_TRACKS.has(track)) {
      fail('VALID_TAXONOMY_VALUES', file, `Invalid track '${track}'`, id);
    }
  }

  // Platforms
  for (const p of (item.platforms ?? [])) {
    if (!VALID_PLATFORMS.has(p)) {
      fail('VALID_TAXONOMY_VALUES', file, `Invalid platform '${p}'`, id);
    }
  }

  // Status
  if (item.status && !VALID_STATUSES.has(item.status)) {
    fail('VALID_TAXONOMY_VALUES', file, `Invalid status '${item.status}'`, id);
  }

  // Maturity level
  if (item.maturity_level !== undefined && !VALID_MATURITY.has(item.maturity_level)) {
    fail('VALID_TAXONOMY_VALUES', file, `Invalid maturity_level '${item.maturity_level}' — must be 1–5`, id);
  }

  // Score weight range
  if (item.score_weight !== undefined) {
    if (typeof item.score_weight !== 'number' || item.score_weight < 0 || item.score_weight > 10) {
      fail('SCORE_WEIGHT_RANGE', file, `score_weight ${item.score_weight} must be a number 0–10`, id);
    }
  }

  // Primary source required for active items
  if (item.status === 'active') {
    const hasPrimary = Array.isArray(item.sources) && item.sources.some((s: any) => s?.type === 'primary');
    if (!hasPrimary) {
      fail('PRIMARY_SOURCE_REQUIRED', file, `Active item has no source with type: primary`, id);
    }
  }

  // Emotional register — REQUIRED for human_vulnerability, must be null for all others
  if (item.category === 'human_vulnerability') {
    if (item.emotional_register === undefined || item.emotional_register === null) {
      fail('EMOTIONAL_REGISTER_FOR_HUMAN_ITEMS', file,
        `human_vulnerability items must have emotional_register set (not null)`, id);
    } else if (!VALID_EMOTIONAL_REGISTERS.has(item.emotional_register)) {
      fail('VALID_TAXONOMY_VALUES', file,
        `Invalid emotional_register '${item.emotional_register}'`, id);
    }
  } else if (item.emotional_register !== undefined && item.emotional_register !== null) {
    // Non-human items should not have a non-null emotional_register — flag as warning
    warn('EMOTIONAL_REGISTER_FOR_HUMAN_ITEMS', file,
      `Non-human_vulnerability item has emotional_register set — expected null`, id);
  }

  // Deprecated items need superseded_by
  if (item.status === 'deprecated' && !item.superseded_by) {
    fail('SUPERSEDED_BY_REQUIRED_ON_DEPRECATED', file,
      `Deprecated item must set superseded_by`, id);
  }

  // Threat model multipliers > 2.0 warning
  for (const [adv, mult] of Object.entries(item.threat_model_multipliers ?? {})) {
    if (typeof mult === 'number' && mult > 2.0) {
      warn('NO_MULTIPLIER_ABOVE_TWO', file,
        `threat_model_multipliers.${adv} = ${mult} > 2.0 — consider escalating to critical alert`, id);
    }
  }

  // Tracking URLs
  for (const source of (item.sources ?? [])) {
    if (source?.url && TRACKING_PARAMS.some(p => source.url.includes(p))) {
      fail('NO_TRACKING_URLS', file, `Source URL contains tracking parameter: ${source.url}`, id);
    }
  }
}

// Phase 3: Validate threat nodes
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

// Phase 4: Validate resources
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

  // Mixed/avoid resources must have caveats
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

// Phase 4b: Validate landscape events
// Landscape events live in content/landscape-feed.yaml (content root).
// IDs use the namespace `landscape-{name}-{year}`.
// Loaded above from the { events: [] } wrapper — validated independently here.
const LANDSCAPE_REQUIRED = ['id', 'title', 'description', 'severity', 'multiplier', 'source_url', 'published_at', 'expires_at'];
const VALID_LANDSCAPE_SEVERITIES = new Set(['critical', 'high', 'moderate', 'low']);

if (allLandscapeEvents.length > 0) {
  console.log(`${B}Validating ${allLandscapeEvents.length} landscape events…${X}`);
}

for (const { file, item } of allLandscapeEvents) {
  const id = item.id ?? '(no id)';

  for (const field of LANDSCAPE_REQUIRED) {
    if (item[field] === undefined) {
      fail('REQUIRED_FIELDS', file, `Landscape event missing required field '${field}'`, id);
    }
  }

  if (item.severity && !VALID_LANDSCAPE_SEVERITIES.has(item.severity)) {
    fail('VALID_TAXONOMY_VALUES', file, `Invalid landscape event severity '${item.severity}'`, id);
  }

  if (item.multiplier !== undefined) {
    if (typeof item.multiplier !== 'number' || item.multiplier < 1.0) {
      fail('LANDSCAPE_MULTIPLIER', file, `multiplier must be a number >= 1.0, got ${item.multiplier}`, id);
    }
    if (typeof item.multiplier === 'number' && item.multiplier > 1.3) {
      warn('LANDSCAPE_MULTIPLIER', file,
        `multiplier ${item.multiplier} > 1.3 — requires additional maintainer review`, id);
    }
  }

  if (item.source_url && TRACKING_PARAMS.some(p => item.source_url.includes(p))) {
    fail('NO_TRACKING_URLS', file, `Landscape event source_url contains tracking parameter: ${item.source_url}`, id);
  }
}

// Phase 5: Cross-reference validation
console.log(`${B}Validating cross-references…${X}`);

for (const { file, item } of allChecklistItems) {
  const id = item.id ?? '?';

  const refs: string[] = [
    ...(item.compensating_controls ?? []).map((c: any) => c?.id),
    ...(item.depends_on ?? []).map((d: any) => d?.id),
    ...(item.related_items ?? []).map((r: any) => r?.id),
    ...(item.resources ?? []).map((r: any) => r?.id),
    // controls_implemented references ctrl-* IDs in the controls registry
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

// Report
console.log('');

const totalItems =
  allChecklistItems.length + allThreats.length +
  allResources.length + allLandscapeEvents.length + allControls.length;

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

  // Group by file for readability
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
    `${allResources.length} resources, ${allLandscapeEvents.length} landscape events). ` +
    `${warnings.length} warning(s).${X}\n`
  );
  process.exit(0);
}