import type { ContentGraph } from '../types.js';

export function deserializeGraph(raw: any): ContentGraph {
  const entries = (o: unknown) => Object.entries((o ?? {}) as Record<string, unknown>);
  return {
    items:            new Map(entries(raw?.items)),
    resources:        new Map(entries(raw?.resources)),
    lookups:          new Map(entries(raw?.lookups)),
    itemsByCategory:  new Map(entries(raw?.itemsByCategory)),
    itemsByAdversary: new Map(entries(raw?.itemsByAdversary)),
    itemsByVector:    new Map(entries(raw?.itemsByVector)),
    itemsByAsset:     new Map(entries(raw?.itemsByAsset)),
    itemsByTrack:     new Map(entries(raw?.itemsByTrack)),
    itemsByMaturity:  new Map(entries(raw?.itemsByMaturity).map(([k, v]) => [parseInt(k, 10), v]))
  } as ContentGraph;
}
