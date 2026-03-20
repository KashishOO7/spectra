import { loadContentGraph, serializeGraph } from '$lib/content/loader.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
  const graph = serializeGraph(loadContentGraph());
  return { graph };
};