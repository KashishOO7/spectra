
import type { ContentGraph, ChecklistItem, Harm, Lookup } from '../types.js';
import { HARMS } from '../audit/constants.js';
import { INCIDENT_PLAYBOOKS } from '../audit/playbooks.js';
import { leadSentence } from '../audit/helpers.js';
import { tokenize, expand, stem, sameWord, NEGATIONS, SYNONYM_INDEX } from './vocabulary.js';

export type RouteKind = 'item' | 'lookup' | 'playbook' | 'harm';

export interface RouteHit {
  kind: RouteKind;
  id: string;
  title: string;
  blurb: string;
  confidence: number;
}

export interface RouteAnswer {
  covered: boolean;
  items: RouteHit[];
  harms: Harm[];
  lookup: RouteHit | null;
  playbook: RouteHit | null;
  best: number;
}

const W_STRONG = 3;
const W_MEDIUM = 2;
const W_WEAK = 1;

interface Doc {
  kind: RouteKind;
  id: string;
  title: string;
  blurb: string;
  terms: Map<string, number>;
  about: Map<string, number>;
  parts: Map<string, number>[];
  weight: number;
}

function add(terms: Map<string, number>, text: string | undefined, weight: number) {
  for (const t of tokenize(text ?? '')) {
    if ((terms.get(t) ?? 0) < weight) terms.set(t, weight);
  }
}

function sentences(text: string | undefined, weight: number): Map<string, number>[] {
  const out: Map<string, number>[] = [];
  for (const line of (text ?? '').split(/\n+/)) {
    for (const s of line.replace(/([.!?:])\s+/g, '$1\u0000').split('\u0000')) {
      const m = new Map<string, number>();
      add(m, s, weight);
      if (m.size) out.push(m);
    }
  }
  return out;
}

function doc(kind: RouteKind, id: string, title: string, blurb: string, weight: number,
  about: Map<string, number>, parts: Map<string, number>[] = []): Doc {
  const terms = new Map(about);
  for (const part of parts) {
    for (const [t, w] of part) if ((terms.get(t) ?? 0) < w) terms.set(t, w);
  }
  return { kind, id, title, blurb, terms, about, parts, weight };
}

function itemDoc(item: ChecklistItem): Doc {
  const about = new Map<string, number>();
  add(about, item.title, W_STRONG);
  const lead = leadSentence(item);
  add(about, lead, W_STRONG);
  add(about, item.category, W_MEDIUM);
  add(about, item.subcategory, W_MEDIUM);
  add(about, (item.attack_vectors ?? []).join(' '), W_MEDIUM);
  add(about, (item.assets_protected ?? []).join(' '), W_MEDIUM);
  add(about, (item.tracks ?? []).join(' '), W_MEDIUM);
  add(about, item.id.replace(/[-_]/g, ' '), W_STRONG);
  const description = item.description ?? '';
  const rest = description.startsWith(lead) ? description.slice(lead.length) : description;
  const notes = [
    item.threat_narrative,
    ...Object.values(item.platform_notes ?? {}),
    ...Object.values(item.track_notes ?? {}),
    ...Object.values(item.environment_notes ?? {})
  ];
  const parts = [rest, ...notes].flatMap(text => sentences(text, W_WEAK));
  return doc('item', item.id, item.title, lead, item.score_weight ?? 0, about, parts);
}

function lookupDoc(lookup: Lookup): Doc {
  const about = new Map<string, number>();
  add(about, lookup.title, W_STRONG);
  add(about, lookup.id.replace(/[-_]/g, ' '), W_STRONG);
  const rows = (lookup.rows ?? []).map(row => {
    const m = new Map<string, number>();
    add(m, row.look_for, W_STRONG);
    add(m, row.also_called, W_STRONG);
    add(m, row.why, W_MEDIUM);
    return m;
  });
  return doc('lookup', lookup.id, lookup.title, lookup.intro ?? '', 0, about,
    [...rows, ...sentences(lookup.intro, W_WEAK)]);
}

function harmDoc(harm: Harm): Doc {
  const about = new Map<string, number>();
  add(about, harm, W_STRONG);
  add(about, HARMS[harm].assets.join(' '), W_MEDIUM);
  add(about, HARMS[harm].vectors.join(' '), W_MEDIUM);
  return doc('harm', harm, harm, '', 0, about);
}

function playbookDocs(): Doc[] {
  return INCIDENT_PLAYBOOKS.map(p => {
    const about = new Map<string, number>();
    add(about, p.title, W_STRONG);
    add(about, p.subtitle, W_MEDIUM);
    add(about, p.id.replace(/_/g, ' '), W_STRONG);
    add(about, PLAYBOOK_ALSO[p.id] ?? '', W_STRONG);
    return doc('playbook', p.id, p.title, p.subtitle, 0, about);
  });
}

const PLAYBOOK_ALSO: Record<string, string> = {
  account_hacked: 'account hacked',
  data_breach: 'data breach notification',
  device_stolen: 'device stolen',
  phishing_clicked: 'phishing link clicked',
  stalkerware: 'monitoring suspected'
};

export interface RouterIndex {
  docs: Doc[];
  df: Map<string, number>;
  info: Map<string, number>;
  total: number;
  vocab: string[];
}

export function buildIndex(graph: ContentGraph): RouterIndex {
  const docs: Doc[] = [
    ...[...graph.items.values()].filter(i => i.status === 'active').map(itemDoc),
    ...[...graph.lookups.values()].map(lookupDoc),
    ...(Object.keys(HARMS) as Harm[]).map(harmDoc),
    ...playbookDocs()
  ];

  const df = new Map<string, number>();
  for (const doc of docs) {
    for (const [term, w] of doc.terms) df.set(term, (df.get(term) ?? 0) + w / W_STRONG);
  }

  const info = new Map<string, number>();
  const ceiling = Math.log(docs.length * W_STRONG / W_WEAK);
  for (const [term, n] of df) {
    info.set(term, INFO_FLOOR + (1 - INFO_FLOOR) * (Math.max(0, Math.log(docs.length / n)) / ceiling));
  }

  return { docs, df, info, total: docs.length, vocab: [...df.keys()] };
}

const INFO_FLOOR = 0.3;

const UNKNOWN_PREMIUM = 1.7;

const SAME_WORD = 0.8;

const TOGETHER = 0.5;

const TOPIC_POWER = 0.5;

const LONE_CARRIER = 0.5;

interface Concept {
  typed: string;
  tokens: Map<string, number>;
  weight: number;
  absent: number;
}

function queryTokens(query: string, index: RouterIndex): string[] {
  const words = query.toLowerCase().replace(/['’]/g, '').split(/[^a-z0-9]+/).filter(Boolean)
    .map(w => NEGATIONS.has(w) ? 'not' : w);
  const joined: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const pair = i + 1 < words.length ? words[i] + words[i + 1] : '';
    if (pair && (index.df.has(stem(pair)) || SYNONYM_INDEX.has(stem(pair)))) { joined.push(pair); i++; }
    else joined.push(words[i]);
  }
  return tokenize(joined.join(' '));
}

function carriersOf(tokens: Map<string, number>, index: RouterIndex): number {
  let n = 0;
  for (const doc of index.docs) {
    let best = 0;
    for (const [t, sim] of tokens) {
      const w = doc.terms.get(t);
      if (w !== undefined) best = Math.max(best, (w / W_STRONG) * sim * (index.info.get(t) ?? 1));
    }
    n += best;
  }
  return n;
}

function concepts(query: string, index: RouterIndex): Concept[] {
  const out: Concept[] = [];
  const seen = new Set<string>();

  for (const token of queryTokens(query, index)) {
    if (seen.has(token)) continue;
    seen.add(token);

    const tokens = new Map<string, number>(expand(token).map(t => [t, 1]));
    let carriers = carriersOf(tokens, index);
    if (carriers === 0) {
      for (const v of index.vocab) if (sameWord(token, v)) tokens.set(v, SAME_WORD);
      carriers = carriersOf(tokens, index);
    }
    if (carriers === 0) {
      const unknown = Math.log(index.total + 1) * UNKNOWN_PREMIUM;
      out.push({ typed: token, tokens, weight: unknown, absent: unknown });
      continue;
    }
    let about = 0;
    for (const doc of index.docs) {
      for (const [t, sim] of tokens) {
        const w = doc.terms.get(t);
        if (w !== undefined) about = Math.max(about, (w / W_STRONG) * sim);
      }
    }
    const rarity = Math.log(index.total / carriers) + 0.05;
    out.push({
      typed: token, tokens,
      weight: rarity * Math.pow(about, TOPIC_POWER),
      absent: carriers < LONE_CARRIER ? Math.max(rarity, Math.log(index.total + 1) * UNKNOWN_PREMIUM) : rarity * Math.pow(about, TOPIC_POWER)
    });
  }
  return out;
}

function passageScore(get: (t: string) => number | undefined, cs: Concept[], index: RouterIndex,
  together: boolean, carried: boolean[]): number {
  let phi = 0;
  if (together && cs.length >= 2) {
    let total = 0;
    for (const c of cs) {
      total += c.weight;
      for (const t of c.tokens.keys()) if (get(t) !== undefined) { phi += c.weight; break; }
    }
    phi = total ? phi / total : 0;
  }
  let earned = 0;
  let possible = 0;
  for (const [i, c] of cs.entries()) {
    possible += (carried[i] ? c.weight : c.absent) * W_STRONG;
    let best = 0;
    for (const [t, sim] of c.tokens) {
      const found = get(t);
      if (found === undefined) continue;
      const w = found + (W_STRONG - found) * phi * TOGETHER;
      const value = w * (index.info.get(t) ?? 1) * sim;
      if (value > best) best = value;
    }
    earned += c.weight * best;
  }
  return possible === 0 ? 0 : earned / possible;
}

function confidenceOf(doc: Doc, cs: Concept[], index: RouterIndex):
  { confidence: number; direct: number } {
  const carried = cs.map(c => [...c.tokens.keys()].some(t => doc.terms.has(t)));
  let confidence = passageScore(t => doc.about.get(t), cs, index, false, carried);
  for (const part of doc.parts) {
    const get = (t: string) => {
      const a = doc.about.get(t);
      const b = part.get(t);
      return a === undefined ? b : b === undefined ? a : Math.max(a, b);
    };
    const s = passageScore(get, cs, index, true, carried);
    if (s > confidence) confidence = s;
  }
  let direct = 0;
  for (const c of cs) if (doc.terms.has(c.typed)) direct++;
  return { confidence, direct };
}

export const COVERAGE_THRESHOLD = 0.325;

const RELATIVE_FLOOR = 0.8;

const SIDE_THRESHOLD = 0.58;

const HARM_THRESHOLD = 0.45;

export interface RouteOptions {
  maxItems?: number;
}

export function route(query: string, index: RouterIndex, options: RouteOptions = {}): RouteAnswer {
  const cs = concepts(query, index);
  const empty: RouteAnswer =
    { covered: false, items: [], harms: [], lookup: null, playbook: null, best: 0 };
  if (cs.length === 0) return empty;

  const scored = index.docs
    .map(doc => ({ doc, weight: doc.weight, ...confidenceOf(doc, cs, index) }))
    .filter(r => r.confidence > 0)
    .sort((a, b) =>
      b.confidence - a.confidence ||
      b.direct - a.direct ||
      b.weight - a.weight ||
      a.doc.id.localeCompare(b.doc.id));

  if (scored.length === 0) return empty;

  const best = scored[0].confidence;
  const hit = (r: { doc: Doc; confidence: number; direct: number; weight: number }): RouteHit => ({
    kind: r.doc.kind, id: r.doc.id, title: r.doc.title, blurb: r.doc.blurb,
    confidence: r.confidence
  });

  const above = scored
    .filter(r => r.doc.kind === 'item' && r.confidence >= COVERAGE_THRESHOLD);

  const ceiling = above[0]?.confidence ?? 0;
  const items = above
    .filter(r => r.confidence >= ceiling * RELATIVE_FLOOR)
    .slice(0, options.maxItems ?? 3)
    .map(hit);

  const lookupTop = scored.find(r => r.doc.kind === 'lookup' && r.confidence >= SIDE_THRESHOLD);
  const playbookTop = scored.find(r => r.doc.kind === 'playbook' && r.confidence >= SIDE_THRESHOLD);

  const harms = scored
    .filter(r => r.doc.kind === 'harm' && r.confidence >= HARM_THRESHOLD)
    .slice(0, 3)
    .map(r => r.doc.id as Harm);

  const covered = items.length > 0 || !!lookupTop || !!playbookTop;

  return {
    covered,
    items: covered ? items : [],
    harms: covered ? harms : [],
    lookup: covered && lookupTop ? hit(lookupTop) : null,
    playbook: covered && playbookTop ? hit(playbookTop) : null,
    best
  };
}
