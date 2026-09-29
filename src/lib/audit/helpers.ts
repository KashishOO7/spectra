
import type {
  Platform, EnvironmentFlag, Track, ChecklistItem, Harm
} from '../types.js';
import { CATEGORY_LABELS, DIFFICULTY_LABELS, HARMS, PLATFORM_NAMES } from './constants.js';

export function truncSentences(text: string, n: number): string {
  if (!text) return '';
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  return sentences.slice(0, n).join(' ').trim();
}

export const leadSentence = (item: { description?: string; title: string }) =>
  truncSentences(item.description ?? '', 1) || item.title;

export const diffLabel = (n: number) => DIFFICULTY_LABELS[n] ?? '?';

export const difficultyDots = (n: number) => Array.from({ length: 3 }, (_, i) => i < n ? '●' : '○').join('');

export const categoryLabel = (cat: string) =>
  CATEGORY_LABELS[cat] ?? cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

export function platformDisplay(p: Platform): string {
  return PLATFORM_NAMES[p] ?? p;
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

export function getActiveTrackNotes(
  trackNotes: Partial<Record<Track, string>> | undefined,
  tracks: Track[] | undefined
): [string, string][] {
  if (!trackNotes || !tracks?.length) return [];
  return Object.entries(trackNotes)
    .filter(([t]) => t !== 'general' && tracks.includes(t as Track)) as [string, string][];
}

export function noteBlocks(note: string): Array<{ heading: string | null; lines: string[] }> {
  return note.split(/\n\s*\n/).map(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const isHeading = lines.length > 1 && lines[0].length < 60 && !/[.:!]$/.test(lines[0]);
    return { heading: isHeading ? lines[0] : null, lines: isHeading ? lines.slice(1) : lines };
  }).filter(b => b.lines.length > 0);
}

export type LinePart = { kind: 'p'; text: string } | { kind: 'ol' | 'ul'; items: string[] };
export function lineParts(lines: string[]): LinePart[] {
  const out: LinePart[] = [];
  for (const line of lines) {
    const m = line.match(/^(\d+\.|-)\s+(.+)$/);
    if (!m) { out.push({ kind: 'p', text: line }); continue; }
    const kind = m[1] === '-' ? 'ul' : 'ol';
    const last = out[out.length - 1];
    if (last && last.kind === kind) last.items.push(m[2]);
    else out.push({ kind, items: [m[2]] });
  }
  return out;
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

