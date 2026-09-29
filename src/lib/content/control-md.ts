
import yaml from 'js-yaml';

const BODY_FIELDS = [
  'threat_narrative', 'description', 'platform_notes', 'resources',
  'track_notes', 'environment_notes', 'legal_notes'
] as const;

const HEADINGS = {
  why: 'Why',
  what: 'What',
  how: 'How',
  where: 'Where',
  situation: 'By situation',
  environment: 'Where you are',
  law: 'Law'
} as const;

export interface LegalNote { jurisdiction: string; note: string }
export interface ResourceRef { id: string; context: string; platform_specific: string[] }

type Control = Record<string, unknown>;

const written = (heading: string, body: string) => `${heading}\n${body}\n`;

export function serializeControl(item: Control): string {
  const front: Control = {};
  for (const [k, v] of Object.entries(item)) {
    if (!(BODY_FIELDS as readonly string[]).includes(k)) front[k] = v;
  }

  const out: string[] = [`---\n${yaml.dump(front, { lineWidth: -1, noRefs: true })}---\n\n`];

  const section = (heading: string, body: string) => { out.push(written(`## ${heading}`, body)); };
  const rows = (heading: string, pairs: Array<[string, string]>) => {
    if (pairs.length === 0) return;
    out.push(`## ${heading}\n`);
    for (const [name, body] of pairs) out.push(written(`### ${name}`, body));
  };

  section(HEADINGS.why, String(item.threat_narrative ?? ''));
  section(HEADINGS.what, String(item.description ?? ''));
  rows(HEADINGS.how, Object.entries((item.platform_notes ?? {}) as Record<string, string>));
  rows(HEADINGS.where, ((item.resources ?? []) as ResourceRef[]).map(r => {
    if ((r.platform_specific ?? []).length) {
      throw new Error(`control ${item.id}: resource ${r.id} sets platform_specific, which the note format does not hold yet`);
    }
    return [r.id, r.context] as [string, string];
  }));
  rows(HEADINGS.situation, Object.entries((item.track_notes ?? {}) as Record<string, string>));
  rows(HEADINGS.environment, Object.entries((item.environment_notes ?? {}) as Record<string, string>));
  rows(HEADINGS.law, ((item.legal_notes ?? []) as LegalNote[]).map(l => [l.jurisdiction, l.note] as [string, string]));

  return out.join('');
}

export function parseControl(raw: string, file: string): Control {
  const text = raw.replace(/\r\n/g, '\n');
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`control ${file}: no frontmatter between --- lines`);

  const item = yaml.load(m[1]) as Control;
  if (!item || typeof item !== 'object') throw new Error(`control ${file}: frontmatter is not a mapping`);
  for (const k of BODY_FIELDS) {
    if (k in item) throw new Error(`control ${file}: "${k}" belongs in the body, not in frontmatter`);
  }

  const sections = new Map<string, Array<[string, string]>>();
  let heading: string | null = null;
  let name: string | null = null;
  let buffer: string[] = [];

  const flush = () => {
    const joined = buffer.join('\n');
    buffer = [];
    if (heading === null) return;
    const body = joined.endsWith('\n') ? joined.slice(0, -1) : joined;
    if (name !== null) sections.get(heading)!.push([name, body]);
    else if (body.trim()) sections.get(heading)!.push(['', body]);
  };

  for (const line of m[2].split('\n')) {
    if (line.startsWith('## ') || line.startsWith('### ')) {
      if (buffer.length) buffer.push('');
      flush();
      if (line.startsWith('### ')) {
        if (heading === null) throw new Error(`control ${file}: "${line}" before any ## heading`);
        name = line.slice(4).trim();
      } else {
        heading = line.slice(3).trim();
        name = null;
        if (sections.has(heading)) throw new Error(`control ${file}: "${heading}" appears twice`);
        sections.set(heading, []);
      }
      continue;
    }
    if (heading === null && line.trim() !== '') throw new Error(`control ${file}: "${line.slice(0, 40)}" before any ## heading`);
    buffer.push(line);
  }
  flush();

  const one = (h: string): string => {
    const rows = sections.get(h);
    if (!rows?.length) throw new Error(`control ${file}: "## ${h}" is missing or empty`);
    if (rows.length !== 1 || rows[0][0] !== '') throw new Error(`control ${file}: "## ${h}" is read as one block of text`);
    return rows[0][1];
  };
  const map = (h: string): Record<string, string> | undefined => {
    const rows = sections.get(h);
    if (!rows?.length) return undefined;
    const out: Record<string, string> = {};
    for (const [k, v] of rows) {
      if (!k) throw new Error(`control ${file}: "## ${h}" holds text outside a ### row`);
      if (k in out) throw new Error(`control ${file}: "## ${h}" names "${k}" twice`);
      out[k] = v;
    }
    return out;
  };

  item.threat_narrative = one(HEADINGS.why);
  item.description = one(HEADINGS.what);
  item.platform_notes = map(HEADINGS.how) ?? {};
  item.resources = (sections.get(HEADINGS.where) ?? []).map(([id, context]) => {
    if (!id) throw new Error(`control ${file}: "## ${HEADINGS.where}" holds text outside a ### row`);
    return { id, context, platform_specific: [] };
  });
  const situation = map(HEADINGS.situation);
  if (situation) item.track_notes = situation;
  const environment = map(HEADINGS.environment);
  if (environment) item.environment_notes = environment;
  item.legal_notes = (sections.get(HEADINGS.law) ?? []).map(([jurisdiction, note]) => {
    if (!jurisdiction) throw new Error(`control ${file}: "## ${HEADINGS.law}" holds text outside a ### row`);
    return { jurisdiction, note };
  });

  for (const h of sections.keys()) {
    if (!Object.values(HEADINGS).includes(h as typeof HEADINGS[keyof typeof HEADINGS])) {
      throw new Error(`control ${file}: "## ${h}" is not one of ${Object.values(HEADINGS).join(', ')}`);
    }
  }
  return inFieldOrder(item);
}

const FIELD_ORDER = [
  'id', 'schema_version', 'version', 'title', 'description', 'threat_narrative', 'category',
  'subcategory', 'tracks', 'platforms', 'platform_notes', 'environment_notes', 'platform_notes_verified',
  'not_applicable_if', 'sensitive', 'difficulty', 'time_estimate', 'maturity_level', 'adversaries',
  'attack_vectors', 'assets_protected', 'controls_implemented', 'score_weight', 'threat_model_multipliers',
  'compensating_controls', 'depends_on', 'related_items', 'status', 'superseded_by', 'last_verified',
  'verified_by', 'sources', 'resources', 'legal_notes', 'track_notes', 'emotional_register', 'tags',
  'created_at', 'created_by', 'changelog', 'lookups'
];

function inFieldOrder(item: Control): Control {
  const rank = (k: string) => { const i = FIELD_ORDER.indexOf(k); return i === -1 ? FIELD_ORDER.length : i; };
  const keys = Object.keys(item).map((k, i) => ({ k, i })).sort((a, b) => rank(a.k) - rank(b.k) || a.i - b.i);
  const out: Control = {};
  for (const { k } of keys) out[k] = item[k];
  return out;
}
