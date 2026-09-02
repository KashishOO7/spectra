
import type { UserProfile, Harm, Track, Platform, AdversaryType } from '../types.js';
import { HARMS } from '../audit/constants.js';

export const FINGERPRINT_VERSION = 1;

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

const TRACKS: readonly Track[] =
  ['general', 'kids_teen', 'womens_safety', 'journalist', 'corporate', 'ai_focused'];
const PLATFORMS: readonly Platform[] =
  ['all', 'android', 'ios', 'windows', 'linux', 'macos', 'web', 'router', 'iot',
   'any_mobile', 'any_desktop'];
const ADVERSARIES: readonly AdversaryType[] =
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
}

const harmKeys = () => Object.keys(HARMS) as Harm[];

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

export function encodeFingerprint(profile: Partial<UserProfile>): string {
  const bytes: number[] = [FINGERPRINT_VERSION];
  const push = (value: bigint, byteCount: number) => {
    for (let i = 0; i < byteCount; i++) bytes.push(Number((value >> BigInt(i * 8)) & 0xffn));
  };

  push(packBits(harmKeys(), profile.harms), 1);
  push(packBits(TRACKS, profile.tracks), 1);
  push(packBits(PLATFORMS, profile.platforms), 2);
  push(packBits(ADVERSARIES, profile.adversariesManual), 2);

  let items = 0n;
  V1_ITEM_IDS.forEach((id, i) => {
    const state =
      profile.implemented?.[id] ? ITEM_DONE
      : profile.skipped?.[id] !== undefined ? ITEM_SKIPPED
      : profile.snoozed?.[id] !== undefined ? ITEM_SNOOZED
      : ITEM_NONE;
    if (state !== ITEM_NONE) items |= BigInt(state) << BigInt(i * 2);
  });
  push(items, Math.ceil(V1_ITEM_IDS.length * 2 / 8));

  return toBase64Url(Uint8Array.from(bytes));
}

export function decodeFingerprint(code: string): ProfileFingerprint | null {
  const cleaned = (code ?? '').trim().replace(/^#/, '');
  if (!/^[A-Za-z0-9_-]{16,32}$/.test(cleaned)) return null;

  let bytes: Uint8Array;
  try { bytes = fromBase64Url(cleaned); } catch { return null; }

  const itemBytes = Math.ceil(V1_ITEM_IDS.length * 2 / 8);
  if (bytes.length !== 1 + 1 + 1 + 2 + 2 + itemBytes) return null;
  if (bytes[0] !== FINGERPRINT_VERSION) return null;

  let at = 1;
  const read = (byteCount: number) => {
    let value = 0n;
    for (let i = 0; i < byteCount; i++) value |= BigInt(bytes[at + i]) << BigInt(i * 8);
    at += byteCount;
    return value;
  };

  const harms = unpackBits(harmKeys(), read(1));
  const tracks = unpackBits(TRACKS, read(1));
  const platforms = unpackBits(PLATFORMS, read(2));
  const adversariesManual = unpackBits(ADVERSARIES, read(2));
  const items = read(itemBytes);

  const implemented: Record<string, boolean> = {};
  const skipped: Record<string, string> = {};
  const snoozed: Record<string, string> = {};
  V1_ITEM_IDS.forEach((id, i) => {
    const state = Number((items >> BigInt(i * 2)) & 3n);
    if (state === ITEM_DONE) implemented[id] = true;
    else if (state === ITEM_SKIPPED) skipped[id] = 'imported';
    else if (state === ITEM_SNOOZED) snoozed[id] = 'imported';
  });

  if (!tracks.includes('general')) tracks.unshift('general');

  return { harms, tracks, platforms, adversariesManual, implemented, skipped, snoozed };
}

export function fingerprintDrift(liveItemIds: string[]): { added: string[]; removed: string[] } {
  const frozen = new Set(V1_ITEM_IDS);
  const live = new Set(liveItemIds);
  return {
    added: liveItemIds.filter(id => !frozen.has(id)).sort(),
    removed: [...frozen].filter(id => !live.has(id)).sort()
  };
}
