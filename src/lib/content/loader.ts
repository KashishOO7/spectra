import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import type { ChecklistItem, Resource, Lookup, ContentGraph, Category, AdversaryType, AttackVector, Asset, Track } from '../types.js';


const CONTENT_DIR = join(process.cwd(), 'content');

function readYamlDir<T>(subdir: string): T[] {
  const dir = join(CONTENT_DIR, subdir);
  try {
    const files = readdirSync(dir).filter((f: string) => f.endsWith('.yaml') || f.endsWith('.yml'));
    const results: T[] = [];

    for (const f of files) {
      const raw = readFileSync(join(dir, f), 'utf-8');
    
      const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

      const parts = normalized.split(/^---\s*$/m).filter((s: string) => s.trim().length > 0);

      for (const part of parts) {
        try {
          const parsed = yaml.load(part.trim());
          if (!parsed || typeof parsed !== 'object') continue;
          if (Array.isArray(parsed)) {
            for (const entry of parsed) {
              if (entry && typeof entry === 'object') results.push(entry as T);
            }
          } else {
            results.push(parsed as T);
          }
        } catch (e) {
          console.warn(`[spectra] YAML parse error in ${f}:`, e);
        }
      }
    }

    return results;
  } catch (e) {
    console.warn(`[spectra] Content directory not found or empty: ${subdir}`, e);
    return [];
  }
}

export function loadContentGraph(): ContentGraph {
  const rawItems = readYamlDir<ChecklistItem>('items');
  const rawResources = readYamlDir<Resource>('resources');
  const rawLookups = readYamlDir<Lookup>('lookups');

  const activeItems = rawItems.filter(i =>
    i.status === 'active' || i.status === 'under_review' || i.status === 'contested'
  );

  const items = new Map<string, ChecklistItem>();
  const resources = new Map<string, Resource>();
  const lookups = new Map<string, Lookup>();
  const itemsByCategory = new Map<Category, string[]>();
  const itemsByAdversary = new Map<AdversaryType, string[]>();
  const itemsByVector = new Map<AttackVector, string[]>();
  const itemsByAsset = new Map<Asset, string[]>();
  const itemsByTrack = new Map<Track, string[]>();
  const itemsByMaturity = new Map<number, string[]>();

  for (const item of activeItems) {
    if (!item?.id) continue;
    items.set(item.id, item);

    if (!itemsByCategory.has(item.category)) itemsByCategory.set(item.category, []);
    itemsByCategory.get(item.category)!.push(item.id);

    for (const adv of item.adversaries ?? []) {
      if (!itemsByAdversary.has(adv)) itemsByAdversary.set(adv, []);
      itemsByAdversary.get(adv)!.push(item.id);
    }

    for (const vec of item.attack_vectors ?? []) {
      if (!itemsByVector.has(vec)) itemsByVector.set(vec, []);
      itemsByVector.get(vec)!.push(item.id);
    }

    for (const asset of item.assets_protected ?? []) {
      if (!itemsByAsset.has(asset)) itemsByAsset.set(asset, []);
      itemsByAsset.get(asset)!.push(item.id);
    }

    for (const track of item.tracks ?? []) {
      if (!itemsByTrack.has(track)) itemsByTrack.set(track, []);
      itemsByTrack.get(track)!.push(item.id);
    }

    const m = item.maturity_level;
    if (!itemsByMaturity.has(m)) itemsByMaturity.set(m, []);
    itemsByMaturity.get(m)!.push(item.id);
  }

  for (const resource of rawResources) {
    if (resource?.id) resources.set(resource.id, resource);
  }

  for (const lookup of rawLookups) {
    if (lookup?.id && lookup.status === 'active') lookups.set(lookup.id, lookup);
  }

  return { items, resources, lookups, itemsByCategory, itemsByAdversary, itemsByVector, itemsByAsset, itemsByTrack, itemsByMaturity };
}

export function serializeGraph(graph: ContentGraph) {
  return {
    items: Object.fromEntries(graph.items),
    resources: Object.fromEntries(graph.resources),
    lookups: Object.fromEntries(graph.lookups),
    itemsByCategory: Object.fromEntries(graph.itemsByCategory),
    itemsByAdversary: Object.fromEntries(graph.itemsByAdversary),
    itemsByVector: Object.fromEntries(graph.itemsByVector),
    itemsByAsset: Object.fromEntries(graph.itemsByAsset),
    itemsByTrack: Object.fromEntries(graph.itemsByTrack),
    itemsByMaturity: Object.fromEntries(graph.itemsByMaturity),
    meta: { item_count: graph.items.size, resource_count: graph.resources.size, generated_at: new Date().toISOString() }
  };
}