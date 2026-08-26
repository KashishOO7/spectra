import type { PageServerLoad } from './$types.js';
import { loadContentGraph, serializeGraph } from '$lib/content/loader.js';

export const prerender = true;

export const load: PageServerLoad = () => {
  return { graph: serializeGraph(loadContentGraph()) };
};
