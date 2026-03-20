import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import type { ChecklistItem, Resource, ContentGraph, Category, AdversaryType, AttackVector, Asset, Track, LandscapeEvent } from '../types.js';

export type { LandscapeEvent };

const CONTENT_DIR = join(process.cwd(), 'content');

function readYamlDir<T>(subdir: string): T[] {
  const dir = join(CONTENT_DIR, subdir);
  try {
    const files = readdirSync(dir).filter((f: string) => f.endsWith('.yaml') || f.endsWith('.yml'));
    const results: T[] = [];

    for (const f of files) {
      const raw = readFileSync(join(dir, f), 'utf-8');
    
      const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

      // Support multiple YAML documents per file (--- separator)
      const parts = normalized.split(/^---\s*$/m).filter((s: string) => s.trim().length > 0);

      for (const part of parts) {
        try {
          const parsed = yaml.load(part.trim());
          if (!parsed || typeof parsed !== 'object') continue;
          // Support both array-of-items files (tools.yaml) and single-item files
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

// Load landscape-feed.yaml
export function loadLandscapeFeed(): LandscapeEvent[] {
  const feedPath = join(CONTENT_DIR, 'landscape-feed.yaml');
  try {
    const raw = readFileSync(feedPath, 'utf-8');
    const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const parsed = yaml.load(normalized) as { events?: LandscapeEvent[] } | null;
    const events = parsed?.events ?? [];

    return events;
  } catch (e) {
    console.warn('[spectra] Could not load landscape-feed.yaml:', e);
    return [];
  }
}

export function loadContentGraph(): ContentGraph {
  const rawItems = readYamlDir<ChecklistItem>('items');
  const rawResources = readYamlDir<Resource>('resources');

  const activeItems = rawItems.filter(i =>
    i.status === 'active' || i.status === 'under_review' || i.status === 'contested'
  );

  const items = new Map<string, ChecklistItem>();
  const resources = new Map<string, Resource>();
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

  return { items, resources, itemsByCategory, itemsByAdversary, itemsByVector, itemsByAsset, itemsByTrack, itemsByMaturity };
}

export function serializeGraph(graph: ContentGraph) {
  return {
    items: Object.fromEntries(graph.items),
    resources: Object.fromEntries(graph.resources),
    itemsByCategory: Object.fromEntries(graph.itemsByCategory),
    itemsByAdversary: Object.fromEntries(graph.itemsByAdversary),
    itemsByVector: Object.fromEntries(graph.itemsByVector),
    itemsByAsset: Object.fromEntries(graph.itemsByAsset),
    itemsByTrack: Object.fromEntries(graph.itemsByTrack),
    itemsByMaturity: Object.fromEntries(graph.itemsByMaturity),
    meta: { item_count: graph.items.size, resource_count: graph.resources.size, generated_at: new Date().toISOString() }
  };
}