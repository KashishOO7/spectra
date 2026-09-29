import type { PageServerLoad } from './$types.js';
import { loadContentGraph } from '$lib/content/loader.js';
import { GAME_MESSAGES } from '$lib/audit/game.js';

export const load: PageServerLoad = () => {
  const graph = loadContentGraph();
  const steps: Record<string, string> = {};
  for (const m of GAME_MESSAGES) {
    if (!m.step) continue;
    const item = graph.items.get(m.step);
    if (!item) throw new Error(`src/lib/audit/game.ts: "${m.id}" points to "${m.step}", which is not in the corpus`);
    steps[m.step] = item.title;
  }
  const moving = GAME_MESSAGES.filter(m => m.register && m.step).map(m => m.register!);
  return { steps, moving };
};
