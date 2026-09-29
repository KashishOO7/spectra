import type { PageServerLoad } from './$types.js';
import { loadContentGraph } from '$lib/content/loader.js';
import { SITUATIONS } from '$lib/audit/tricks.js';

export const load: PageServerLoad = () => {
  const graph = loadContentGraph();
  const steps: Record<string, string> = {};
  for (const s of SITUATIONS) {
    for (const id of [s.step, s.also].filter(Boolean) as string[]) {
      const item = graph.items.get(id);
      if (!item) throw new Error(`src/lib/audit/tricks.ts: "${s.id}" points to "${id}", which is not in the corpus`);
      steps[id] = item.title;
    }
  }
  return { steps };
};
