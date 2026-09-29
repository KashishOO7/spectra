import type { PageServerLoad } from './$types.js';
import { loadContentGraph } from '$lib/content/loader.js';
import start from '#spectra-wiki/page/start';
import { named } from '$lib/wiki/page.js';

export const load: PageServerLoad = () => {
  const graph = loadContentGraph();
  const steps = Object.keys(named(start, 'questions')).map(id => {
    const item = graph.items.get(id);
    if (!item) throw new Error(`wiki/pages/start.md: the question under "${id}" names a step that is not in the corpus`);
    return { id: item.id, title: item.title, version: item.version, category: item.category };
  });
  return { steps };
};
