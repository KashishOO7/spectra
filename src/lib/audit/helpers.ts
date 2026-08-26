import type {
  Platform, EnvironmentFlag, AssetGroup, ChecklistItem, Harm
} from '../types.js';
import { ASSET_GROUPS, CATEGORY_LABELS, HARMS } from './constants.js';

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

export function verificationAge(dateStr: string | undefined | null): 'fresh' | 'aging' | 'stale' | 'outdated' {
  if (!dateStr) return 'outdated';
  const months = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  if (months < 6) return 'fresh';
  if (months < 12) return 'aging';
  if (months < 18) return 'stale';
  return 'outdated';
}

export const verifiedAgeClass: Record<string, string> = {
  fresh: 'text-muted', aging: 'text-dim', stale: 'text-amber-light', outdated: 'text-red-light'
};
export function catTextClass(cat: { score: number; implemented_count: number }): string {
  if (cat.implemented_count === 0) return 'text-dim';
  return cat.score > 65 ? 'text-teal-light' : cat.score > 35 ? 'text-amber-light' : 'text-red-light';
}
export function catBarClass(cat: { score: number; implemented_count: number }): string {
  if (cat.implemented_count === 0) return 'bg-muted';
  return cat.score > 65 ? 'bg-teal' : cat.score > 35 ? 'bg-amber' : 'bg-red';
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

export function groupItems(items: ChecklistItem[]): Record<AssetGroup, ChecklistItem[]> {
  const groups = Object.keys(ASSET_GROUPS) as AssetGroup[];
  const out = Object.fromEntries(groups.map(g => [g, [] as ChecklistItem[]])) as Record<AssetGroup, ChecklistItem[]>;

  for (const item of items) {
    const assets = item.assets_protected ?? [];
    for (const group of groups) {
      if (ASSET_GROUPS[group].some(a => assets.includes(a))) out[group].push(item);
    }
  }
  return out;
}
