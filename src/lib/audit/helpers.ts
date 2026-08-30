import type {
  Platform, EnvironmentFlag, ChecklistItem, Harm
} from '../types.js';
import { CATEGORY_LABELS, HARMS } from './constants.js';

export function truncSentences(text: string, n: number): string {
  if (!text) return '';
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  return sentences.slice(0, n).join(' ').trim();
}

export const diffLabel = (n: number) => ['', 'Easy', 'Moderate', 'Complex'][n] ?? '?';

export const difficultyDots = (n: number) => Array.from({ length: 3 }, (_, i) => i < n ? '●' : '○').join('');

export const categoryLabel = (cat: string) =>
  CATEGORY_LABELS[cat] ?? cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

export function platformDisplay(p: Platform): string {
  const map: Partial<Record<Platform, string>> = {
    android: 'Android', ios: 'iOS', windows: 'Windows', macos: 'macOS',
    linux: 'Linux', web: 'Web', all: 'All', any_mobile: 'Mobile',
    any_desktop: 'Desktop', router: 'Router', iot: 'IoT'
  };
  return map[p] ?? p;
}
export function platformTabLabel(key: string): string {
  const known = platformDisplay(key as Platform);
  if (known !== key) return known;
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export function getActiveEnvNotes(
  envNotes: Partial<Record<EnvironmentFlag, string>> | undefined,
  flags: EnvironmentFlag[] | undefined
): [string, string][] {
  if (!envNotes || !flags?.length) return [];
  return Object.entries(envNotes).filter(([flag]) => flags.includes(flag as EnvironmentFlag)) as [string, string][];
}

export function safeHref(url: string | null | undefined): string {
  if (!url) return '#';
  try {
    const { protocol } = new URL(url);
    return protocol === 'https:' || protocol === 'http:' ? url : '#';
  } catch {
    return '#';
  }
}

export function harmsForItem(item: ChecklistItem): Harm[] {
  const assets = item.assets_protected ?? [];
  const vectors = item.attack_vectors ?? [];
  return (Object.keys(HARMS) as Harm[]).filter(harm => {
    const m = HARMS[harm];
    return m.assets.some(a => assets.includes(a)) || m.vectors.some(v => vectors.includes(v));
  });
}
export function itemsByHarm(items: ChecklistItem[]): Record<Harm, ChecklistItem[]> {
  const harms = Object.keys(HARMS) as Harm[];
  const out = Object.fromEntries(harms.map(h => [h, [] as ChecklistItem[]])) as Record<Harm, ChecklistItem[]>;

  for (const item of items) {
    for (const harm of harmsForItem(item)) out[harm].push(item);
  }
  return out;
}