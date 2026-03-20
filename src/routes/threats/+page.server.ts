import type { PageServerLoad } from './$types.js';
import { loadLandscapeFeed, loadContentGraph, serializeGraph } from '$lib/content/loader.js';

export const load: PageServerLoad = () => {
  const graph = loadContentGraph();
  return {
    landscapeEvents: loadLandscapeFeed(),
    graph: serializeGraph(graph)
  };
};