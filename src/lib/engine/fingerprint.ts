
import type { UserProfile, Harm, Track, Platform, AdversaryType } from '../types.js';
import { HARMS } from '../audit/constants.js';

export const FINGERPRINT_VERSION = 2;

export const V1_VERSION = 1;

export const V1_ITEM_IDS: readonly string[] = Object.freeze([
  'ai-phishing-detect-001', 'ai-voice-clone-001', 'auth-2fa-001', 'auth-backup-codes-001',
  'auth-password-manager-001', 'comm-messaging-001', 'data-backup-001', 'data-broker-optout-001',
  'data-browser-hygiene-001', 'data-ecosystem-audit-001', 'data-payment-privacy-001',
  'data-permissions-001', 'data-social-visibility-001', 'device-encrypt-001',
  'device-screenlock-001', 'device-updates-001', 'human-urgency-001', 'human-verify-001',
  'incident-breach-monitor-001', 'kids-location-sharing-001', 'kids-oversharing-001',
  'kids-privacy-social-001', 'kids-recognize-manipulation-001', 'kids-strong-password-001',
  'net-dns-001', 'net-vpn-001', 'osint-self-001', 'physical-travel-001',
  'womens-image-abuse-001', 'womens-location-001', 'womens-online-harassment-001',
  'womens-stalkerware-001'
]);

export const ITEM_RENAMES: Readonly<Record<string, string>> = Object.freeze({
  'womens-image-abuse-001': 'image-abuse-001',
  'womens-location-001': 'location-exposure-001',
  'womens-online-harassment-001': 'harassment-plan-001',
  'womens-stalkerware-001': 'stalkerware-check-001',
  'kids-location-sharing-001': 'guardian-location-001',
  'kids-oversharing-001': 'guardian-oversharing-001',
  'kids-privacy-social-001': 'guardian-social-privacy-001',
  'kids-recognize-manipulation-001': 'guardian-manipulation-001',
  'kids-strong-password-001': 'guardian-passwords-001'
});

export const V2_ITEM_IDS: readonly string[] = Object.freeze([
  'ai-phishing-detect-001', 'ai-voice-clone-001', 'auth-2fa-001', 'auth-backup-codes-001',
  'auth-password-manager-001', 'comm-messaging-001', 'data-backup-001', 'data-broker-optout-001',
  'data-browser-hygiene-001', 'data-ecosystem-audit-001', 'data-payment-privacy-001',
  'data-permissions-001', 'data-social-visibility-001', 'device-encrypt-001',
  'device-screenlock-001', 'device-updates-001', 'human-urgency-001', 'human-verify-001',
  'incident-breach-monitor-001', 'guardian-location-001', 'guardian-oversharing-001',
  'guardian-social-privacy-001', 'guardian-manipulation-001', 'guardian-passwords-001',
  'net-dns-001', 'net-vpn-001', 'osint-self-001', 'physical-travel-001',
  'image-abuse-001', 'location-exposure-001', 'harassment-plan-001', 'stalkerware-check-001',
  'recovery-routes-001', 'recovery-email-first-001', 'recovery-locked-out-001',
  'money-scam-first-hour-001', 'impersonation-report-001', 'harassment-document-001',
  'human-fake-shop-001', 'human-qr-code-001', 'auth-sim-pin-001', 'ai-chatbot-privacy-001',
  'human-investment-scam-001', 'location-tracker-alerts-001', 'image-threat-001'
]);

const liveId = (frozen: string): string => ITEM_RENAMES[frozen] ?? frozen;

const itemBytesFor = (ids: readonly string[]): number => Math.ceil(ids.length * 2 / 8);

export const V1_TRACKS: readonly string[] = Object.freeze(
  ['general', 'kids_teen', 'womens_safety', 'journalist', 'corporate', 'ai_focused']);
export const PLATFORMS: readonly Platform[] =
  ['all', 'android', 'ios', 'windows', 'linux', 'macos', 'web', 'router', 'iot',
   'any_mobile', 'any_desktop'];
export const ADVERSARIES: readonly AdversaryType[] =
  ['opportunistic', 'targeted_individual', 'criminal_org', 'intimate_partner', 'employer',
   'isp_network', 'data_broker', 'domestic_government', 'foreign_government', 'ai_automated'];

const ITEM_NONE = 0, ITEM_DONE = 1, ITEM_SKIPPED = 2, ITEM_SNOOZED = 3;

export interface ProfileFingerprint {
  harms: Harm[];
  tracks: Track[];
  platforms: Platform[];
  adversariesManual: AdversaryType[];
  implemented: Record<string, boolean>;
  skipped: Record<string, string>;
  snoozed: Record<string, string>;
  mappedTracks: Array<{ from: string; to: Track }>;
}

export const V1_HARMS: readonly Harm[] = Object.freeze([
  'Someone gets into your accounts',
  'Someone takes your money',
  'Someone talks you into it',
  'Someone follows where you go',
  'Someone reads what you say',
  'Someone uses your device against you',
  'Someone pretends to be you',
  'Someone already has your details'
] as Harm[]);

export const V2_HARMS: readonly Harm[] = Object.freeze([
  ...V1_HARMS,
  'Someone will not leave you alone',
  'You are locked out of your own account'
] as Harm[]);

export const V2_TRACKS: readonly Track[] = Object.freeze(
  ['general', 'caring_for_someone', 'known_person_risk', 'public_work', 'work_accounts',
   'ai_focused'] as Track[]);

export const V1_TRACK_FORWARD: Readonly<Record<string, Track>> = Object.freeze({
  general:       'general',
  kids_teen:     'caring_for_someone',
  womens_safety: 'known_person_risk',
  journalist:    'public_work',
  corporate:     'work_accounts',
  ai_focused:    'ai_focused'
} as Record<string, Track>);

export function checksum(bytes: readonly number[]): number {
  let acc = 0;
  for (const b of bytes) acc = (acc * 31 + b + 1) & 0xff;
  return acc;
}

function packBits(all: readonly string[], picked: readonly string[] | undefined): bigint {
  let mask = 0n;
  for (const value of picked ?? []) {
    const i = all.indexOf(value);
    if (i >= 0) mask |= 1n << BigInt(i);
  }
  return mask;
}

function unpackBits<T extends string>(all: readonly T[], mask: bigint): T[] {
  return all.filter((_, i) => (mask >> BigInt(i)) & 1n);
}

const toBase64Url = (bytes: Uint8Array): string => {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (code: string): Uint8Array => {
  const padded = code.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
  return Uint8Array.from(bin, c => c.charCodeAt(0));
};

const bytesToPush = (bytes: number[]) => (value: bigint, byteCount: number) => {
  for (let i = 0; i < byteCount; i++) bytes.push(Number((value >> BigInt(i * 8)) & 0xffn));
};

function packItems(profile: Partial<UserProfile>, ids: readonly string[]): bigint {
  let items = 0n;
  ids.forEach((frozen, i) => {
    const id = liveId(frozen);
    const state =
      profile.implemented?.[id] ? ITEM_DONE
      : profile.skipped?.[id] !== undefined ? ITEM_SKIPPED
      : profile.snoozed?.[id] !== undefined ? ITEM_SNOOZED
      : ITEM_NONE;
    if (state !== ITEM_NONE) items |= BigInt(state) << BigInt(i * 2);
  });
  return items;
}

export const SETUP_CODE_BYTES = 5;

export function encodeSetup(profile: Partial<UserProfile>): string {
  const bytes: number[] = [FINGERPRINT_VERSION];
  const push = bytesToPush(bytes);
  push(packBits(V2_HARMS, profile.harms), 2);
  push(packBits(V2_TRACKS, profile.tracks), 1);
  bytes.push(checksum(bytes));
  return toBase64Url(Uint8Array.from(bytes));
}

export function encodeFingerprint(profile: Partial<UserProfile>): string {
  const bytes: number[] = [FINGERPRINT_VERSION];
  const push = bytesToPush(bytes);
  push(packBits(V2_HARMS, profile.harms), 2);
  push(packBits(V2_TRACKS, profile.tracks), 1);
  push(packBits(PLATFORMS, profile.platforms), 2);
  push(packBits(ADVERSARIES, profile.adversariesManual), 2);
  push(packItems(profile, V2_ITEM_IDS), itemBytesFor(V2_ITEM_IDS));
  bytes.push(checksum(bytes));
  return toBase64Url(Uint8Array.from(bytes));
}

export function decodeFingerprint(code: string): ProfileFingerprint | null {
  const cleaned = (code ?? '').trim().replace(/^#/, '');
  if (!/^[A-Za-z0-9_-]{7,64}$/.test(cleaned)) return null;

  let bytes: Uint8Array;
  try { bytes = fromBase64Url(cleaned); } catch { return null; }
  if (bytes.length < 2) return null;

  const v1ItemBytes = itemBytesFor(V1_ITEM_IDS);
  const v2ItemBytes = itemBytesFor(V2_ITEM_IDS);

  let at = 1;
  const read = (byteCount: number) => {
    let value = 0n;
    for (let i = 0; i < byteCount; i++) value |= BigInt(bytes[at + i]) << BigInt(i * 8);
    at += byteCount;
    return value;
  };

  if (bytes[0] === V1_VERSION) {
    if (bytes.length !== 1 + 1 + 1 + 2 + 2 + v1ItemBytes) return null;
    const harms = unpackBits(V1_HARMS, read(1));
    const v1Tracks = unpackBits(V1_TRACKS, read(1));
    const platforms = unpackBits(PLATFORMS, read(2));
    const adversariesManual = unpackBits(ADVERSARIES, read(2));
    const mappedTracks: Array<{ from: string; to: Track }> = [];
    const tracks: Track[] = [];
    for (const from of v1Tracks) {
      const to = V1_TRACK_FORWARD[from];
      if (!to) continue;
      if (!tracks.includes(to)) tracks.push(to);
      if (to !== from) mappedTracks.push({ from, to });
    }
    return assemble(harms, tracks, platforms, adversariesManual, read(v1ItemBytes),
                    V1_ITEM_IDS, mappedTracks);
  }

  if (bytes[0] !== FINGERPRINT_VERSION) return null;

  const isSetupOnly = bytes.length === SETUP_CODE_BYTES;
  const expected = isSetupOnly ? SETUP_CODE_BYTES : 1 + 2 + 1 + 2 + 2 + v2ItemBytes + 1;
  if (bytes.length !== expected) return null;

  const body = [...bytes.slice(0, bytes.length - 1)];
  if (checksum(body) !== bytes[bytes.length - 1]) return null;

  const harms = unpackBits(V2_HARMS, read(2));
  const tracks = unpackBits(V2_TRACKS, read(1));
  if (isSetupOnly) return assemble(harms, tracks, [], [], 0n, V2_ITEM_IDS);

  const platforms = unpackBits(PLATFORMS, read(2));
  const adversariesManual = unpackBits(ADVERSARIES, read(2));
  const items = read(v2ItemBytes);
  return assemble(harms, tracks, platforms, adversariesManual, items, V2_ITEM_IDS);
}

function assemble(
  harms: Harm[], tracks: Track[], platforms: Platform[],
  adversariesManual: AdversaryType[], items: bigint, ids: readonly string[],
  mappedTracks: Array<{ from: string; to: Track }> = []
): ProfileFingerprint {
  const implemented: Record<string, boolean> = {};
  const skipped: Record<string, string> = {};
  const snoozed: Record<string, string> = {};
  ids.forEach((frozen, i) => {
    const id = liveId(frozen);
    const state = Number((items >> BigInt(i * 2)) & 3n);
    if (state === ITEM_DONE) implemented[id] = true;
    else if (state === ITEM_SKIPPED) skipped[id] = 'imported';
    else if (state === ITEM_SNOOZED) snoozed[id] = 'imported';
  });

  if (!tracks.includes('general')) tracks.unshift('general');

  return { harms, tracks, platforms, adversariesManual, implemented, skipped, snoozed, mappedTracks };
}

export function fingerprintDrift(liveItemIds: string[]): { added: string[]; removed: string[] } {
  const frozen = new Set(V2_ITEM_IDS.map(liveId));
  const live = new Set(liveItemIds);
  return {
    added: liveItemIds.filter(id => !frozen.has(id)).sort(),
    removed: [...frozen].filter(id => !live.has(id)).sort()
  };
}

export function fingerprintCapacity(): Array<{ field: string; slots: number; used: number; spare: number }> {
  return [
    { field: 'harms', slots: 16, used: V2_HARMS.length },
    { field: 'tracks', slots: 8, used: V2_TRACKS.length },
    { field: 'platforms', slots: 16, used: PLATFORMS.length },
    { field: 'adversaries', slots: 16, used: ADVERSARIES.length }
  ].map(f => ({ ...f, spare: f.slots - f.used }));
}

export function orderDrift(live: {
  harms?: readonly string[];
  tracks?: readonly string[];
  platforms?: readonly string[];
  adversaries?: readonly string[];
}): Record<string, { added: string[]; removed: string[] }> {
  const compare = (frozen: readonly string[], now: readonly string[] | undefined) => {
    if (!now) return { added: [], removed: [] };
    const f = new Set(frozen), n = new Set(now);
    return {
      added: now.filter(v => !f.has(v)).sort(),
      removed: frozen.filter(v => !n.has(v)).sort()
    };
  };
  return {
    harms: compare(V2_HARMS, live.harms ?? Object.keys(HARMS)),
    tracks: compare(V2_TRACKS, live.tracks),
    platforms: compare(PLATFORMS, live.platforms),
    adversaries: compare(ADVERSARIES, live.adversaries)
  };
}

export function v1Frozen(): Record<string, readonly string[]> {
  return { harms: V1_HARMS, tracks: V1_TRACKS };
}
