import type { UserProfile, AssessmentResult, TimelineEvent, SEQuizResult, AdversaryType, Track } from '../types.js';

const DB_NAME = 'spectra';
const DB_VERSION = 1;
const PROFILE_STORE = 'profile';
const RESULTS_STORE = 'results';
const PROFILE_KEY = 'user_default';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
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
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
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

export async function loadProfile(): Promise<UserProfile | null> {
  return idbGet<UserProfile>(PROFILE_STORE, PROFILE_KEY);
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  // THE HEARTBEAT: Every time the profile is saved (any interaction), 
  // we bump the last_active timestamp. This powers the 30-day inactivity checks.
  profile.last_active = new Date().toISOString();
  await idbPut(PROFILE_STORE, profile);
}

export async function markImplemented(itemId: string, isImplemented: boolean): Promise<void> {
  const profile = await loadProfile();
  if (!profile) return;
  if (!profile.implemented) profile.implemented = {};
  profile.implemented[itemId] = isImplemented;
  // If we un-implement something, we automatically remove the 'skipped' flag too
  if (!isImplemented && profile.skipped) {
    delete profile.skipped[itemId];
  }
  await saveProfile(profile);
}

export async function markSkipped(itemId: string, reason: string): Promise<void> {
  const profile = await loadProfile();
  if (!profile) return;
  if (!profile.skipped) profile.skipped = {};
  if (reason) {
    profile.skipped[itemId] = reason;
    // Cannot be implemented and skipped at the same time
    if (profile.implemented) profile.implemented[itemId] = false;
  } else {
    delete profile.skipped[itemId];
  }
  await saveProfile(profile);
}

export async function saveNote(itemId: string, note: string): Promise<void> {
  const profile = await loadProfile();
  if (!profile) return;
  if (!profile.notes) profile.notes = {};
  profile.notes[itemId] = note;
  await saveProfile(profile);
}

// Omit 'id' from the required input so callers don't have to generate it, we generate it here
export async function addTimelineEvent(event: Omit<TimelineEvent, 'timestamp' | 'id'> & { timestamp?: string, id?: string }): Promise<void> {
  const profile = await loadProfile();
  if (!profile) return;
  if (!profile.timeline) profile.timeline = [];
  
  const fullEvent = {
    ...event,
    id: event.id || crypto.randomUUID(), // Automatically generate the ID required by types.ts
    timestamp: event.timestamp || new Date().toISOString()
  } as TimelineEvent;

  profile.timeline.unshift(fullEvent);
  await saveProfile(profile);
}

export async function saveSEQuizResult(result: SEQuizResult): Promise<void> {
  const profile = await loadProfile();
  if (!profile) return;
  profile.se_quiz = result;
  await saveProfile(profile);
}

export async function applyLifeEvent(
  eventId: string,
  label: string,
  adversaryDelta: AdversaryType[],
  trackDelta: Track[]
): Promise<void> {
  const profile = await loadProfile();
  if (!profile) return;

  if (!profile.adversaries) profile.adversaries = [];
  if (!profile.tracks) profile.tracks = ['general'];

  for (const adv of adversaryDelta) {
    if (!profile.adversaries.includes(adv)) profile.adversaries.push(adv);
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
    life_event_label: label,
    timestamp: new Date().toISOString()
  });
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
    notes: {},
    timeline: [],
    life_events_applied: [],
    easy_mode: true
  };
}

export async function clearAllData(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([PROFILE_STORE, RESULTS_STORE], 'readwrite');
    tx.objectStore(PROFILE_STORE).clear();
    tx.objectStore(RESULTS_STORE).clear();
    // IDBTransaction uses oncomplete, not onsuccess
    tx.oncomplete = () => resolve(); 
    tx.onerror = () => reject(tx.error);
  });
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
    !Array.isArray((data as Record<string, unknown>).adversaries) ||
    !Array.isArray((data as Record<string, unknown>).tracks) ||
    !Array.isArray((data as Record<string, unknown>).platforms)
  ) {
    throw new Error('Invalid profile data');
  }
  await saveProfile(data as UserProfile);
}