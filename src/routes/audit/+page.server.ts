import type { PageServerLoad } from './$types.js';
import { loadContentGraph, serializeGraph, loadLandscapeFeed } from '$lib/content/loader.js';

export const load: PageServerLoad = () => {
  const graph = loadContentGraph();
  const landscapeEvents = loadLandscapeFeed();
  return {
    graph: serializeGraph(graph),
    landscapeEvents
  };
};