
import type { ContentGraph, ChecklistItem, Harm, Lookup } from '../types.js';
import { HARMS } from '../audit/constants.js';
import { INCIDENT_PLAYBOOKS } from '../audit/playbooks.js';
import { tokenize, expand } from './vocabulary.js';

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
  weight: number;
}

function add(terms: Map<string, number>, text: string | undefined, weight: number) {
  for (const t of tokenize(text ?? '')) {
    if ((terms.get(t) ?? 0) < weight) terms.set(t, weight);
  }
}

function itemDoc(item: ChecklistItem): Doc {
  const terms = new Map<string, number>();
  add(terms, item.title, W_STRONG);
  add(terms, item.simple_description, W_STRONG);
  add(terms, item.category, W_MEDIUM);
  add(terms, item.subcategory, W_MEDIUM);
  add(terms, (item.attack_vectors ?? []).join(' '), W_MEDIUM);
  add(terms, (item.assets_protected ?? []).join(' '), W_MEDIUM);
  add(terms, (item.tracks ?? []).join(' '), W_MEDIUM);
  add(terms, item.id.replace(/[-_]/g, ' '), W_STRONG);
  add(terms, item.description, W_WEAK);
  return {
    kind: 'item',
    id: item.id,
    title: item.title,
    blurb: item.simple_description ?? item.title,
    terms,
    weight: item.score_weight ?? 0
  };
}

function lookupDoc(lookup: Lookup): Doc {
  const terms = new Map<string, number>();
  add(terms, lookup.title, W_STRONG);
  for (const row of lookup.rows ?? []) {
    add(terms, row.look_for, W_STRONG);
    add(terms, row.also_called, W_STRONG);
    add(terms, row.why, W_MEDIUM);
  }
  add(terms, lookup.intro, W_WEAK);
  return { kind: 'lookup', id: lookup.id, title: lookup.title, blurb: lookup.intro ?? '', terms, weight: 0 };
}

function harmDoc(harm: Harm): Doc {
  const terms = new Map<string, number>();
  add(terms, harm, W_STRONG);
  add(terms, HARMS[harm].assets.join(' '), W_MEDIUM);
  add(terms, HARMS[harm].vectors.join(' '), W_MEDIUM);
  return { kind: 'harm', id: harm, title: harm, blurb: '', terms, weight: 0 };
}

function playbookDocs(): Doc[] {
  return INCIDENT_PLAYBOOKS.map(p => {
    const terms = new Map<string, number>();
    add(terms, p.title, W_STRONG);
    add(terms, p.subtitle, W_MEDIUM);
    add(terms, p.id.replace(/_/g, ' '), W_STRONG);
    return { kind: 'playbook' as const, id: p.id, title: p.title, blurb: p.subtitle, terms, weight: 0 };
  });
}

export interface RouterIndex {
  docs: Doc[];
  df: Map<string, number>;
  info: Map<string, number>;
  total: number;
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
    for (const term of doc.terms.keys()) df.set(term, (df.get(term) ?? 0) + 1);
  }

  const info = new Map<string, number>();
  const ceiling = Math.log(docs.length);
  for (const [term, n] of df) {
    info.set(term, INFO_FLOOR + (1 - INFO_FLOOR) * (Math.log(docs.length / n) / ceiling));
  }

  return { docs, df, info, total: docs.length };
}

const INFO_FLOOR = 0.3;

const UNKNOWN_PREMIUM = 1.7;

interface Concept {
  tokens: string[];
  weight: number;
}

function concepts(query: string, index: RouterIndex): Concept[] {
  const out: Concept[] = [];
  const seen = new Set<string>();

  for (const token of tokenize(query)) {
    if (seen.has(token)) continue;
    seen.add(token);

    const tokens = expand(token);
    let carriers = 0;
    for (const doc of index.docs) {
      if (tokens.some(t => doc.terms.has(t))) carriers++;
    }
    if (carriers === 0) {
      out.push({ tokens, weight: Math.log(index.total + 1) * UNKNOWN_PREMIUM });
      continue;
    }
    out.push({ tokens, weight: Math.log(index.total / carriers) + 0.05 });
  }
  return out;
}

function confidenceOf(doc: Doc, cs: Concept[], index: RouterIndex):
  { confidence: number; direct: number } {
  let earned = 0;
  let possible = 0;
  let direct = 0;
  for (const c of cs) {
    possible += c.weight * W_STRONG;
    let best = 0;
    for (const t of c.tokens) {
      const w = doc.terms.get(t);
      if (w === undefined) continue;
      const value = w * (index.info.get(t) ?? 1);
      if (value > best) best = value;
    }
    if (best > 0) {
      earned += c.weight * best;
      if (doc.terms.has(c.tokens[0])) direct++;
    }
  }
  return { confidence: possible === 0 ? 0 : earned / possible, direct };
}

export const COVERAGE_THRESHOLD = 0.23;

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
