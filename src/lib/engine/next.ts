
import type { ScoredItem } from '../types.js';

export function upNext(ordered: readonly ScoredItem[]): ScoredItem | null {
  const byId = new Map(ordered.map(i => [i.id, i]));
  const open = (i: ScoredItem | undefined) => !!i && !i.is_implemented && !i.is_skipped;

  const first = (item: ScoredItem, seen: Set<string>): ScoredItem | null => {
    if (seen.has(item.id)) return null;
    seen.add(item.id);
    const waiting = item.depends_on?.find(d => d.hard_dependency && !byId.get(d.id)?.is_implemented);
    if (!waiting) return item;
    const dep = byId.get(waiting.id);
    return open(dep) ? first(dep!, seen) : null;
  };

  for (const item of ordered) {
    if (!open(item)) continue;
    const pick = first(item, new Set());
    if (pick) return pick;
  }
  return null;
}
