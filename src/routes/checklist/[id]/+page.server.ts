import type { EntryGenerator, PageServerLoad } from './$types.js';
import { error } from '@sveltejs/kit';
import { loadContentGraph } from '$lib/content/loader.js';
import type { ContentGraph } from '$lib/types.js';

export const prerender = true;

let cached: ContentGraph | null = null;
function graph(): ContentGraph {
  if (!cached) cached = loadContentGraph();
  return cached;
}

export const entries: EntryGenerator = () => {
  return [...graph().items.keys()].map(id => ({ id }));
};

export const load: PageServerLoad = ({ params }) => {
  const g = graph();
  const item = g.items.get(params.id);
  if (!item) throw error(404, `No checklist item with id ${params.id}`);

  const named = (ids: { id: string; reason?: string; note?: string; hard_dependency?: boolean }[] | undefined) =>
    (ids ?? [])
      .map(ref => ({ ...ref, title: g.items.get(ref.id)?.title ?? null }))
      .filter(ref => ref.title !== null);

  return {
    item,
    dependsOn: named(item.depends_on),
    related: named(item.related_items)
  };
};
