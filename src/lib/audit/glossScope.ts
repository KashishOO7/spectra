import { writable, type Writable } from 'svelte/store';

export const GLOSS_SCOPE = 'spectra:gloss-scope';

export type GlossScope = {
  next: () => number;
  claims: Writable<Map<number, Set<string>>>;
  skip: ReadonlySet<string>;
};
export function glossScope(step?: string): GlossScope {
  let n = 0;
  return { next: () => n++, claims: writable(new Map()), skip: new Set(step ? GLOSS_SKIP[step] ?? [] : []) };
}

export const GLOSS_SKIP: Readonly<Record<string, readonly string[]>> = {
  'location-tracker-alerts-001': ['tracker']
};
