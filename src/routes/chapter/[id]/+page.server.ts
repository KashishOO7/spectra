import type { EntryGenerator, PageServerLoad } from './$types.js';
import { error } from '@sveltejs/kit';
import { loadContentGraph } from '$lib/content/loader.js';
import { CHAPTERS } from '$lib/audit/chapters.js';
import { leadSentence } from '$lib/audit/helpers.js';

export const prerender = true;

export const entries: EntryGenerator = () => CHAPTERS.map(c => ({ id: c.id }));

export const load: PageServerLoad = ({ params }) => {
  const chapter = CHAPTERS.find(c => c.id === params.id);
  if (!chapter) throw error(404, `No chapter ${params.id}`);
  const graph = loadContentGraph();
  const steps = chapter.steps.map(id => {
    const item = graph.items.get(id);
    if (!item) throw new Error(`chapters.ts: "${chapter.id}" holds ${id}, which is not in the corpus`);
    return { id, title: item.title, lead: leadSentence(item) };
  });
  return { id: chapter.id, name: chapter.name, steps };
};
