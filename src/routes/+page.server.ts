import type { PageServerLoad } from './$types.js';
import { loadContentGraph } from '$lib/content/loader.js';
import home from '#spectra-wiki/page/home';
import { items } from '$lib/wiki/page.js';

function opening(why: string): string {
  const sentences = why.match(/[^.!?]+[.!?]+(?=\s+[A-Z]|\s*$)/g) ?? [why];
  const [a, b] = sentences.map(x => x.trim());
  return b && a.length + b.length + 1 <= 240 ? `${a} ${b}` : a;
}

export const load: PageServerLoad = () => {
  const graph = loadContentGraph();
  const cards = items(home, 'cards').map(card => {
    const item = graph.items.get(card.title);
    if (!item) throw new Error(`wiki/pages/home.md: card "${card.title}" names a step that is not in the corpus`);
    return { id: item.id, title: item.title, why: opening(item.threat_narrative) };
  });
  return { cards };
};
