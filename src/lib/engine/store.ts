import type { UserProfile, AssessmentResult, TimelineEvent, SEQuizResult, AdversaryType, Track, Harm } from '../types.js';
import { HARM_ADVERSARIES } from '../audit/constants.js';

const DB_NAME = 'spectra';
const DB_VERSION = 1;
const PROFILE_STORE = 'profile';
const RESULTS_STORE = 'results';
const PROFILE_KEY = 'user_default';

let dbHandle: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbHandle) return dbHandle;
  dbHandle = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PROFILE_STORE)) {
        db.createObjectStore(PROFILE_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(RESULTS_STORE)) {
        db.createObjectStore(RESULTS_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      db.onversionchange = () => { db.close(); dbHandle = null; };
      db.onclose = () => { dbHandle = null; };
      resolve(db);
    };
    req.onerror = () => { dbHandle = null; reject(req.error); };
  });
  return dbHandle;
}

async function closeDB(): Promise<void> {
  if (!dbHandle) return;
  try { (await dbHandle).close(); } catch {  }
  dbHandle = null;
}

async function idbGet<T>(store: string, key: string): Promise<T | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result as T || null);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut<T>(store: string, item: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}


export function derivedAdversaries(harms: Harm[] | undefined): AdversaryType[] {
  return [...new Set((harms ?? []).flatMap(h => HARM_ADVERSARIES[h] ?? []))];
}

export function computeAdversaries(profile: UserProfile): AdversaryType[] {
  return [...new Set([
    ...derivedAdversaries(profile.harms),
    ...(profile.adversariesManual ?? [])
  ])];
}

function migrate(stored: UserProfile): { profile: UserProfile; changed: boolean } {
  if (Array.isArray(stored.adversariesManual)) return { profile: stored, changed: false };

  const derived = new Set(derivedAdversaries(stored.harms));
  const manual = (stored.adversaries ?? []).filter(a => !derived.has(a));

  if (manual.length > 0) stored.adversariesManual = manual;
  return { profile: stored, changed: true };
}

export async function backfillImplementedVersions(
  versionOf: (itemId: string) => string | undefined
): Promise<void> {
  const profile = await loadProfile();
  if (!profile) return;

  const done = Object.entries(profile.implemented ?? {}).filter(([, v]) => v).map(([id]) => id);
  const known = profile.implemented_versions ?? {};
  const missing = done.filter(id => !known[id]);
  if (missing.length === 0) return;

  profile.implemented_versions = { ...known };
  for (const id of missing) {
    const v = versionOf(id);
    if (v) profile.implemented_versions[id] = v;
  }
  await saveProfile(profile);
}

export async function loadProfile(): Promise<UserProfile | null> {
  const stored = await idbGet<UserProfile>(PROFILE_STORE, PROFILE_KEY);
  if (!stored) return null;

  const { profile, changed } = migrate(stored);
  if (changed) await idbPut(PROFILE_STORE, stripComputed(profile));

  profile.adversaries = computeAdversaries(profile);
  return profile;
}

async function loadOrCreateProfile(): Promise<UserProfile> {
  return (await loadProfile()) ?? createDefaultProfile();
}

function stripComputed(profile: UserProfile): Omit<UserProfile, 'adversaries'> {
  const { adversaries: _computed, ...rest } = profile;
  return rest;
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  profile.last_active = new Date().toISOString();
  profile.adversaries = computeAdversaries(profile);
  await idbPut(PROFILE_STORE, stripComputed(profile));
}

export async function markImplemented(
  itemId: string,
  isImplemented: boolean,
  itemVersion?: string
): Promise<void> {
  const profile = await loadOrCreateProfile();
  if (!profile.implemented) profile.implemented = {};
  profile.implemented[itemId] = isImplemented;

  if (!profile.implemented_versions) profile.implemented_versions = {};
  if (isImplemented) {
    if (itemVersion) profile.implemented_versions[itemId] = itemVersion;
  } else {
    delete profile.implemented_versions[itemId];
  }
  if (profile.skipped) delete profile.skipped[itemId];
  if (profile.snoozed) delete profile.snoozed[itemId];
  await saveProfile(profile);
}

export async function markSnoozed(itemId: string, isSnoozed: boolean): Promise<void> {
  const profile = await loadOrCreateProfile();
  if (!profile.snoozed) profile.snoozed = {};
  if (isSnoozed) {
    profile.snoozed[itemId] = new Date().toISOString();
  } else {
    delete profile.snoozed[itemId];
  }
  await saveProfile(profile);
}

export async function markSkipped(itemId: string, reason: string): Promise<void> {
  const profile = await loadOrCreateProfile();
  if (!profile.skipped) profile.skipped = {};
  if (reason) {
    profile.skipped[itemId] = reason;
    if (profile.implemented) profile.implemented[itemId] = false;
    if (profile.snoozed) delete profile.snoozed[itemId];
  } else {
    delete profile.skipped[itemId];
  }
  await saveProfile(profile);
}

export async function saveNote(itemId: string, note: string): Promise<void> {
  const profile = await loadOrCreateProfile();
  if (!profile.notes) profile.notes = {};
  profile.notes[itemId] = note;
  await saveProfile(profile);
}

export async function addTimelineEvent(event: Omit<TimelineEvent, 'timestamp' | 'id'> & { timestamp?: string, id?: string }): Promise<void> {
  const profile = await loadOrCreateProfile();
  if (!profile.timeline) profile.timeline = [];
  
  const fullEvent = {
    ...event,
    id: event.id || crypto.randomUUID(), 
    timestamp: event.timestamp || new Date().toISOString()
  } as TimelineEvent;

  profile.timeline.unshift(fullEvent);
  await saveProfile(profile);
}

export async function saveSEQuizResult(result: SEQuizResult): Promise<void> {
  const profile = await loadOrCreateProfile();
  profile.se_quiz = result;
  await saveProfile(profile);
}

export async function applyLifeEvent(
  eventId: string,
  label: string,
  adversaryDelta: AdversaryType[],
  trackDelta: Track[],
  sensitive = false
): Promise<void> {
  const profile = await loadOrCreateProfile();

  if (!profile.adversariesManual) profile.adversariesManual = [];
  if (!profile.tracks) profile.tracks = ['general'];

  for (const adv of adversaryDelta) {
    if (!profile.adversariesManual.includes(adv)) profile.adversariesManual.push(adv);
  }
  for (const track of trackDelta) {
    if (!profile.tracks.includes(track)) profile.tracks.push(track);
  }

  if (!profile.life_events_applied) profile.life_events_applied = [];
  if (!profile.life_events_applied.includes(eventId)) {
    profile.life_events_applied.push(eventId);
  }

  await saveProfile(profile);

  await addTimelineEvent({
    type: 'life_event',
    life_event_label: sensitive ? 'Your setup updated' : label,
    timestamp: new Date().toISOString()
  });
}

export async function revertLifeEvent(
  eventId: string,
  adversaryDelta: AdversaryType[],
  trackDelta: Track[],
  stillNeeded: { adversaries: AdversaryType[]; tracks: Track[] }
): Promise<void> {
  const profile = await loadOrCreateProfile();

  profile.adversariesManual = (profile.adversariesManual ?? []).filter(
    a => !adversaryDelta.includes(a) || stillNeeded.adversaries.includes(a)
  );
  profile.tracks = (profile.tracks ?? ['general']).filter(
    t => t === 'general' || !trackDelta.includes(t) || stillNeeded.tracks.includes(t)
  );
  profile.life_events_applied = (profile.life_events_applied ?? []).filter(id => id !== eventId);

  await saveProfile(profile);
}

export async function deleteTimelineEvent(eventId: string): Promise<void> {
  const profile = await loadOrCreateProfile();
  if (!profile.timeline) return;
  profile.timeline = profile.timeline.filter(e => e.id !== eventId);
  await saveProfile(profile);
}

export function createDefaultProfile(): UserProfile {
  return {
    id: PROFILE_KEY,
    created_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
    assessment_started: new Date().toISOString(),
    assessment_version: '1.0.0',
    use_cases: [],
    adversaries: [],
    platforms: [],
    tracks: ['general'],
    implemented: {},
    skipped: {},
    snoozed: {},
    notes: {},
    timeline: [],
    life_events_applied: [],
    easy_mode: true
  };
}

export async function clearAllData(): Promise<void> {
  const problems: string[] = [];

  if (typeof caches !== 'undefined') {
    try {
      for (const key of await caches.keys()) await caches.delete(key);
    } catch { problems.push('cache storage'); }
  }

  if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
    try {
      for (const reg of await navigator.serviceWorker.getRegistrations()) await reg.unregister();
    } catch { problems.push('service worker'); }
  }

  try {
    const ours = Object.keys(localStorage).filter(k => k.toLowerCase().startsWith('spectra'));
    for (const key of ours) localStorage.removeItem(key);
    sessionStorage.clear();
  } catch {  }

  await closeDB();

  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
    req.onblocked = () => { problems.push('the database (another tab has it open)'); resolve(); };
  });

  if (problems.length) {
    throw new Error(`Cleared your data, but could not clear: ${problems.join(', ')}.`);
  }
}

export async function exportProfile(): Promise<string> {
  const profile = await loadProfile();
  return JSON.stringify(profile, null, 2);
}

export async function importProfile(jsonStr: string): Promise<void> {
  const data: unknown = JSON.parse(jsonStr);
  if (
    !data ||
    typeof data !== 'object' ||
    (data as Record<string, unknown>).id !== PROFILE_KEY ||
    !Array.isArray((data as Record<string, unknown>).tracks) ||
    !Array.isArray((data as Record<string, unknown>).platforms)
  ) {
    throw new Error('Invalid profile data');
  }
  const profile = data as UserProfile;
  if (!Array.isArray(profile.tracks) || !profile.tracks.includes('general')) {
    profile.tracks = ['general', ...(profile.tracks ?? []).filter(t => t !== 'general')];
  }
  await saveProfile(profile);
}