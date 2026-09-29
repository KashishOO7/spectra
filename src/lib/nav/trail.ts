
import { writable, derived, get } from 'svelte/store';

interface Entry {
  path: string;
  name?: string;
  y: number;
}
interface Trail {
  at: number;
  entries: Entry[];
  names?: Record<string, string>;
}

const KEY = 'spectra-trail';
const trail = writable<Trail>({ at: -1, entries: [] });
let lastType = '';

function load(): Trail {
  try {
    const t = JSON.parse(sessionStorage.getItem(KEY) ?? '') as Trail;
    if (Array.isArray(t.entries) && typeof t.at === 'number') return t;
  } catch {
  }
  return { at: -1, entries: [] };
}

function save(t: Trail) {
  trail.set(t);
  try { sessionStorage.setItem(KEY, JSON.stringify(t)); } catch {  }
}

export function leaving(y: number) {
  const t = load();
  if (t.entries[t.at]) { t.entries[t.at].y = y; save(t); }
}

export function arrived(path: string, type: string, delta?: number) {
  const t = load();
  lastType = type;
  if (type === 'enter') {
    save(t.entries[t.at]?.path === path ? t : { at: 0, entries: [{ path, y: 0 }], names: t.names });
    return;
  }
  if (type === 'popstate') {
    const at = Math.min(Math.max(t.at + (delta ?? -1), 0), t.entries.length - 1);
    save(t.entries[at]?.path === path ? { ...t, at } : { at: 0, entries: [{ path, y: 0 }], names: t.names });
    return;
  }
  if (t.entries[t.at]?.path === path) return;
  const entries = [...t.entries.slice(0, t.at + 1), { path, y: 0 }];
  save({ at: entries.length - 1, entries, names: t.names });
}

export function nameThisPage(path: string, name: string) {
  const t = load();
  save({ ...t, names: { ...(t.names ?? {}), [path]: name } });
}

export const cameFrom = derived(trail, t => {
  const e = t.at > 0 ? t.entries[t.at - 1] : null;
  return e ? { ...e, name: t.names?.[e.path] } : null;
});

export function settle() {
  if (lastType !== 'popstate') return;
  const y = get(trail).entries[get(trail).at]?.y ?? 0;
  if (y > 0) requestAnimationFrame(() => window.scrollTo(0, y));
}

export function start() {
  trail.set(load());
}
