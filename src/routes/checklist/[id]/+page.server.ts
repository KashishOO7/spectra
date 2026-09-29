import type { EntryGenerator, PageServerLoad } from './$types.js';
import { error } from '@sveltejs/kit';
import { loadContentGraph } from '$lib/content/loader.js';
import type { ContentGraph } from '$lib/types.js';
import { CHAPTERS, chapterOf } from '$lib/audit/chapters.js';

export const prerender = true;

let cached: ContentGraph | null = null;
function graph(): ContentGraph {
  if (import.meta.env.DEV) return loadContentGraph();
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

  const guides = (item.resources ?? [])
    .map(ref => {
      const guide = g.resources.get(ref.id);
      return guide ? { id: ref.id, title: guide.title, url: guide.url, context: ref.context } : null;
    })
    .filter((guide): guide is NonNullable<typeof guide> => guide !== null);

  const chapter = chapterOf(item.id);
  if (!chapter) throw new Error(`${item.id} sits in no chapter (src/lib/audit/chapters.ts)`);
  const order = CHAPTERS.flatMap(c => c.steps);
  const at = order.indexOf(item.id);
  const near = (id: string | undefined) => (id && g.items.get(id) ? { id, title: g.items.get(id)!.title } : null);

  return {
    item,
    dependsOn: named(item.depends_on),
    related: named(item.related_items),
    guides,
    chapter: { id: chapter.id, name: chapter.name, story: chapter.story.includes(item.id) },
    prev: near(order[at - 1]),
    next: near(order[at + 1])
  };
};
