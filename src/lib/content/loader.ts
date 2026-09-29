import type { ChecklistItem, Resource, Lookup, ContentGraph, Category, AdversaryType, AttackVector, Asset, Track } from '../types.js';
import { readControls } from './controls.js';
import { readResources } from './resources.js';
import { readLookups } from './lookups.js';


export function loadContentGraph(): ContentGraph {
  const rawItems = readControls(process.cwd()).map(c => c.item as ChecklistItem);
  const rawResources = readResources(process.cwd()).map(r => r.item as Resource);
  const rawLookups = readLookups(process.cwd()).map(l => l.item as Lookup);

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